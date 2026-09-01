/* ========================================================================== */
/* KINETIK v10.124 · Local Reminder Coordinator                              */
/* P1: preferred-time reminders while the PWA runtime is alive.              */
/*                                                                            */
/* Important boundary: browsers may suspend timers when the PWA is closed or */
/* aggressively backgrounded. Reliable closed-app delivery belongs to P2     */
/* (Web Push + server scheduling).                                            */
/* ========================================================================== */
(function (global) {
  'use strict';

  const VERSION = '1.0.0';
  const STATE_KEY = 'cc_local_notification_state_v1';
  const RETENTION_DAYS = 14;
  const TICK_MS = 30000;
  let timer = null;
  let ticking = false;

  function safeCall(fn, fallback) {
    try { return typeof fn === 'function' ? fn() : fallback; }
    catch (error) { console.warn('[KINETIK LocalReminders] dependency failed', error); return fallback; }
  }

  function dateKey(value) {
    try { if (typeof global.localDateKey === 'function') return global.localDateKey(value || new Date()); }
    catch (_) {}
    const d = value instanceof Date ? value : new Date(value || Date.now());
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function minuteOfDay(value) {
    const match = String(value || '').match(/^(\d{2}):(\d{2})$/);
    if (!match) return 8 * 60;
    return Math.max(0, Math.min(1439, Number(match[1]) * 60 + Number(match[2])));
  }

  function atMinute(now, minute) {
    const d = new Date(now.getTime());
    d.setHours(Math.floor(minute / 60), minute % 60, 0, 0);
    return d;
  }

  function formatTime(date) {
    try { return date.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' }); }
    catch (_) { return `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`; }
  }

  function prefs() {
    const fallback = {
      enabled:true, localNotifications:false, preferredTime:'08:00', notificationDetail:'discreet',
      snoozeMinutes:30, workoutFollowup:true, workoutFollowupDelay:120,
    };
    return safeCall(() => global.getReminderPrefs ? global.getReminderPrefs() : fallback, fallback) || fallback;
  }

  function isStandalone() {
    try { return !!(global.matchMedia?.('(display-mode: standalone)')?.matches || global.navigator?.standalone); }
    catch (_) { return false; }
  }

  function capability() {
    const notificationSupported = typeof global.Notification !== 'undefined' && typeof global.Notification.requestPermission === 'function';
    const serviceWorkerSupported = !!global.navigator?.serviceWorker;
    const ua = String(global.navigator?.userAgent || '');
    const ios = /iPad|iPhone|iPod/.test(ua);
    const standalone = isStandalone();
    const requiresInstall = ios && !standalone;
    let permission = notificationSupported ? String(global.Notification.permission || 'default') : 'unsupported';
    return {
      supported: notificationSupported && serviceWorkerSupported && !requiresInstall,
      notificationSupported,
      serviceWorkerSupported,
      permission,
      ios,
      standalone,
      requiresInstall,
      reason: !notificationSupported ? 'notifications-unsupported' : !serviceWorkerSupported ? 'service-worker-unsupported' : requiresInstall ? 'ios-install-required' : permission === 'denied' ? 'permission-denied' : null,
    };
  }

  function readState() {
    try {
      const raw = JSON.parse(global.localStorage?.getItem(STATE_KEY) || '{}');
      return raw && typeof raw === 'object' ? raw : {};
    } catch (_) { return {}; }
  }

  function pruneState(state, now) {
    const days = state.days && typeof state.days === 'object' ? state.days : {};
    const cutoff = new Date(now.getTime() - RETENTION_DAYS * 86400000);
    const cutoffKey = dateKey(cutoff);
    const kept = {};
    Object.entries(days).forEach(([key,value]) => { if (key >= cutoffKey) kept[key] = value; });
    return { version:1, days:kept };
  }

  function writeState(state, now = new Date()) {
    const next = pruneState(state || {}, now);
    try { global.localStorage?.setItem(STATE_KEY, JSON.stringify(next)); }
    catch (error) { console.warn('[KINETIK LocalReminders] state unavailable', error); }
    return next;
  }

  function dayState(now = new Date(), create = false) {
    const state = pruneState(readState(), now);
    const key = dateKey(now);
    if (create && !state.days[key]) state.days[key] = {};
    return { state, key, day: state.days[key] || {} };
  }

  function saveDay(now, patch) {
    const current = dayState(now, true);
    current.state.days[current.key] = { ...current.day, ...(patch || {}) };
    writeState(current.state, now);
    return current.state.days[current.key];
  }

  function pendingTasks(now = new Date()) {
    const engine = global.KinetikDailyTasks;
    if (!engine?.getAgendaTasks) return [];
    return safeCall(() => engine.getAgendaTasks({ now, includeDone:true })
      .filter(task => task.status === 'pending' || task.status === 'blocked'), []);
  }

  function taskSignature(tasks) {
    return (tasks || []).map(task => String(task.id)).sort().join('|');
  }

  function isAppVisible() {
    try {
      const doc = global.document;
      if (!doc) return false;
      if (doc.visibilityState && doc.visibilityState !== 'visible') return false;
      return typeof doc.hasFocus === 'function' ? doc.hasFocus() : true;
    } catch (_) { return false; }
  }

  function followupMinute(p) {
    if (p.workoutFollowup === false) return null;
    const base = minuteOfDay(p.preferredTime);
    const delay = Math.max(30, Math.min(360, Number(p.workoutFollowupDelay || 120)));
    const candidate = Math.max(18 * 60, base + delay);
    return candidate <= 21 * 60 + 30 ? candidate : null;
  }

  function nextOccurrence(now = new Date()) {
    const p = prefs(), cap = capability();
    if (!p.enabled || !p.localNotifications || cap.permission !== 'granted') return null;
    const tasks = pendingTasks(now);
    if (!tasks.length) return null;
    const { day } = dayState(now);
    const nowMs = now.getTime();
    if (day.snoozedUntil) {
      const snoozeAt = new Date(day.snoozedUntil);
      if (Number.isFinite(snoozeAt.getTime()) && snoozeAt.getTime() > nowMs && !day.snoozeDeliveredAt) return { reason:'snooze', at:snoozeAt };
    }
    const primary = atMinute(now, minuteOfDay(p.preferredTime));
    if (!day.primarySentAt && !day.primarySeenAt && primary.getTime() > nowMs) return { reason:'primary', at:primary };
    const workoutPending = tasks.some(task => task.kind === 'workout');
    const followMinute = followupMinute(p);
    if (workoutPending && followMinute != null && !day.followupSentAt && !day.followupSeenAt) {
      const followAt = atMinute(now, followMinute);
      if (followAt.getTime() > nowMs) return { reason:'workout-followup', at:followAt };
    }
    return null;
  }

  function content(tasks, reason, p) {
    const detailed = p.notificationDetail === 'detailed';
    const count = tasks.length;
    let title = count === 1 ? 'KINETIK · 1 priorité' : `KINETIK · ${count} priorités`;
    if (reason === 'workout-followup') title = 'KINETIK · séance encore à faire';
    if (reason === 'snooze') title = 'KINETIK · rappel';
    const body = detailed
      ? tasks.slice(0,3).map(task => task.title).join(' · ') + (count > 3 ? ` · +${count-3}` : '')
      : count === 1 ? 'Une priorité t’attend dans ton parcours du jour.' : `${count} priorités t’attendent dans ton parcours du jour.`;
    return { title, body };
  }

  async function showNotification(reason, tasks, now = new Date(), options = {}) {
    const p = prefs(), cap = capability();
    if (!options.force && (!p.enabled || !p.localNotifications || cap.permission !== 'granted' || !tasks.length)) return false;
    if (cap.permission !== 'granted') return false;
    const c = options.content || content(tasks, reason, p);
    const data = {
      source:'kinetik-local-reminder', reason, dateKey:dateKey(now),
      taskId: tasks.length === 1 ? String(tasks[0].id) : null,
      taskIds: tasks.slice(0,6).map(task => String(task.id)),
    };
    const notificationOptions = {
      body:c.body,
      icon:'./icons/icon-192.png',
      badge:'./icons/icon-192.png',
      tag:`kinetik-${dateKey(now)}-${reason}`,
      data,
      actions:[{action:'snooze',title:'Plus tard'},{action:'open',title:'Ouvrir'}],
    };
    try {
      const registration = await global.navigator?.serviceWorker?.ready;
      if (registration?.showNotification) {
        try { await registration.showNotification(c.title, notificationOptions); }
        catch (_) { const { actions, ...fallback } = notificationOptions; await registration.showNotification(c.title, fallback); }
      } else if (typeof global.Notification === 'function') {
        new global.Notification(c.title, notificationOptions);
      } else return false;
      if (!options.test) {
        const stamp = new Date().toISOString();
        if (reason === 'primary') saveDay(now, { primarySentAt:stamp, lastTaskSignature:taskSignature(tasks) });
        else if (reason === 'workout-followup') saveDay(now, { followupSentAt:stamp, lastTaskSignature:taskSignature(tasks) });
        else if (reason === 'snooze') saveDay(now, { snoozeDeliveredAt:stamp, snoozedUntil:null, lastTaskSignature:taskSignature(tasks) });
      }
      return true;
    } catch (error) {
      console.warn('[KINETIK LocalReminders] notification failed', error);
      return false;
    }
  }

  function markSeen(reason, now, tasks) {
    const stamp = new Date().toISOString();
    if (reason === 'primary') saveDay(now, { primarySeenAt:stamp, lastTaskSignature:taskSignature(tasks) });
    else if (reason === 'workout-followup') saveDay(now, { followupSeenAt:stamp, lastTaskSignature:taskSignature(tasks) });
    else if (reason === 'snooze') saveDay(now, { snoozeSeenAt:stamp, snoozedUntil:null, lastTaskSignature:taskSignature(tasks) });
  }

  async function tick(now = new Date(), options = {}) {
    if (ticking) return false;
    ticking = true;
    try {
      const p = prefs(), cap = capability();
      if (!p.enabled || !p.localNotifications || cap.permission !== 'granted') return false;
      const tasks = pendingTasks(now);
      if (!tasks.length) {
        const { day } = dayState(now);
        if (day.snoozedUntil) saveDay(now, { snoozedUntil:null, snoozeDeliveredAt:null });
        return false;
      }
      const visible = options.visible == null ? isAppVisible() : !!options.visible;
      const { day } = dayState(now);
      const nowMs = now.getTime();

      if (day.snoozedUntil && !day.snoozeDeliveredAt) {
        const snoozeAt = new Date(day.snoozedUntil).getTime();
        if (Number.isFinite(snoozeAt) && nowMs >= snoozeAt) {
          if (visible) markSeen('snooze', now, tasks);
          else await showNotification('snooze', tasks, now);
          return true;
        }
      }

      const workoutPending = tasks.some(task => task.kind === 'workout');
      const followMinute = followupMinute(p);
      const followAt = followMinute == null ? null : atMinute(now, followMinute);
      const followupDue = workoutPending && followAt && nowMs >= followAt.getTime() && !day.followupSentAt && !day.followupSeenAt;
      // If the runtime wakes late in the day, send one useful workout follow-up instead
      // of firing the missed morning reminder and the follow-up back-to-back.
      if (followupDue && !day.primarySentAt && !day.primarySeenAt) {
        saveDay(now, { primarySkippedAt:new Date().toISOString() });
        if (visible) markSeen('workout-followup', now, tasks.filter(task => task.kind === 'workout'));
        else await showNotification('workout-followup', tasks.filter(task => task.kind === 'workout'), now);
        return true;
      }

      const primaryAt = atMinute(now, minuteOfDay(p.preferredTime));
      if (nowMs >= primaryAt.getTime() && !day.primarySentAt && !day.primarySeenAt && !day.primarySkippedAt) {
        if (visible) markSeen('primary', now, tasks);
        else await showNotification('primary', tasks, now);
        return true;
      }

      const refreshed = dayState(now).day;
      if (workoutPending && followAt && nowMs >= followAt.getTime() && !refreshed.followupSentAt && !refreshed.followupSeenAt) {
        if (visible) markSeen('workout-followup', now, tasks.filter(task => task.kind === 'workout'));
        else await showNotification('workout-followup', tasks.filter(task => task.kind === 'workout'), now);
      }
      return true;
    } finally { ticking = false; }
  }

  function snooze(minutes, now = new Date()) {
    const p = prefs();
    const amount = Math.max(5, Math.min(240, Number(minutes || p.snoozeMinutes || 30)));
    const until = new Date(now.getTime() + amount * 60000);
    saveDay(now, { snoozedUntil:until.toISOString(), snoozeDeliveredAt:null, snoozeSeenAt:null, snoozeCount:Number(dayState(now).day.snoozeCount||0)+1 });
    refresh();
    return { minutes:amount, until };
  }

  async function requestPermission() {
    const cap = capability();
    if (!cap.notificationSupported || !cap.serviceWorkerSupported || cap.requiresInstall) return cap.permission;
    let permission = cap.permission;
    if (permission === 'default') permission = await global.Notification.requestPermission();
    if (typeof global.setReminderPrefs === 'function') global.setReminderPrefs({ ...prefs(), localNotifications:permission === 'granted' });
    refresh();
    safeCall(() => global.render && global.render(), null);
    return permission;
  }

  function setEnabled(enabled) {
    const cap = capability();
    if (enabled && cap.permission !== 'granted') return false;
    if (typeof global.setReminderPrefs === 'function') global.setReminderPrefs({ ...prefs(), localNotifications:!!enabled });
    refresh();
    return true;
  }

  async function testNotification() {
    const cap = capability();
    if (cap.permission !== 'granted') return false;
    return showNotification('test', [{id:'test',kind:'test',title:'Notification de test'}], new Date(), {
      force:true, test:true, content:{title:'KINETIK · notifications actives', body:'Les rappels locaux sont correctement autorisés sur cet appareil.'}
    });
  }

  function openAgenda(taskId) {
    if (typeof global.openTodayAgendaFromReminder === 'function') return global.openTodayAgendaFromReminder(taskId || null);
    try {
      if (global.state) global.state.view = 'today';
      if (typeof global.render === 'function') global.render();
      setTimeout(() => global.document?.querySelector?.('.today-agenda')?.scrollIntoView?.({behavior:'smooth',block:'start'}), 0);
      return true;
    } catch (_) { return false; }
  }

  function handleServiceWorkerMessage(event) {
    const data = event?.data || {};
    if (data.type !== 'kinetik-reminder-click') return;
    if (data.action === 'snooze') {
      snooze(Number(prefs().snoozeMinutes || 30));
      openAgenda(data.taskId || null);
      return;
    }
    openAgenda(data.taskId || null);
  }

  function consumeLaunchParams() {
    try {
      const url = new URL(global.location.href);
      if (!url.searchParams.has('kinetikReminder')) return;
      const taskId = url.searchParams.get('task');
      if (url.searchParams.get('snooze') === '1') snooze(Number(prefs().snoozeMinutes || 30));
      openAgenda(taskId);
      ['kinetikReminder','task','snooze'].forEach(key => url.searchParams.delete(key));
      global.history?.replaceState?.({},'',url.pathname + (url.search ? url.search : '') + url.hash);
    } catch (_) {}
  }

  function status(now = new Date()) {
    const cap = capability(), p = prefs(), next = nextOccurrence(now), { day } = dayState(now);
    return {
      version:VERSION,
      enabled:!!p.localNotifications,
      permission:cap.permission,
      supported:cap.supported,
      standalone:cap.standalone,
      requiresInstall:cap.requiresInstall,
      reason:cap.reason,
      nextAt:next?.at?.toISOString?.() || null,
      nextReason:next?.reason || null,
      nextLabel:next ? `${next.reason === 'workout-followup' ? 'Relance séance' : next.reason === 'snooze' ? 'Rappel reporté' : 'Prochain rappel'} · ${formatTime(next.at)}` : null,
      snoozedUntil:day.snoozedUntil || null,
      primarySentAt:day.primarySentAt || null,
      primarySeenAt:day.primarySeenAt || null,
      followupSentAt:day.followupSentAt || null,
    };
  }

  function schedule() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => tick(new Date()).catch?.(()=>{}), TICK_MS);
  }

  function refresh() {
    schedule();
    setTimeout(() => tick(new Date()).catch?.(()=>{}), 0);
  }

  const api = {
    version:VERSION,
    stateKey:STATE_KEY,
    getCapability:capability,
    getStatus:status,
    getPendingTasks:pendingTasks,
    getNextOccurrence:nextOccurrence,
    requestPermission,
    setEnabled,
    snooze,
    tick,
    refresh,
    testNotification,
    openAgenda,
    clearState(){ try { global.localStorage?.removeItem(STATE_KEY); } catch (_) {} refresh(); },
  };

  global.KinetikLocalReminders = api;
  try { global.navigator?.serviceWorker?.addEventListener?.('message', handleServiceWorkerMessage); } catch (_) {}
  try { global.document?.addEventListener?.('visibilitychange', () => tick(new Date()).catch?.(()=>{})); } catch (_) {}
  try { global.addEventListener?.('focus', () => tick(new Date()).catch?.(()=>{})); } catch (_) {}
  try { global.addEventListener?.('pageshow', () => tick(new Date()).catch?.(()=>{})); } catch (_) {}
  try { consumeLaunchParams(); } catch (_) {}
  refresh();
  try { if (typeof global.render === 'function') global.render(); } catch (_) {}
  console.info(`[KINETIK] Local Reminder Coordinator v${VERSION} ready`);
})(window);
