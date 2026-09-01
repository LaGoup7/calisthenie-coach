/* ========================================================================== */
/* KINETIK v10.123 · Daily Tasks Engine                                       */
/* Central source of truth for "what should I do today?".                    */
/*                                                                            */
/* Steps P0.1 + P0.5 + P0.6                                                  */
/* - Normalized task contract                                                 */
/* - Provider registry                                                        */
/* - Workout / activity / measurement / test / mobility / recovery providers  */
/* - Completion inferred from existing KINETIK data                           */
/* - Legacy reminder adapter                                                  */
/*                                                                            */
/* Today UI consumes this API; Step 8 adds explicit user decisions.           */
/* ========================================================================== */
(function (global) {
  'use strict';

  const VERSION = '1.6.0';
  const DAY_MS = 86400000;
  const providers = [];
  const DECISION_STORAGE_KEY = 'cc_daily_task_decisions_v1';
  const DECISION_RETENTION_DAYS = 180;

  const PRIORITY = Object.freeze({
    critical: 100,
    high: 80,
    normal: 60,
    low: 40,
    info: 20,
  });

  const KIND = Object.freeze({
    workout: 'workout',
    activity: 'activity',
    measurement: 'measurement',
    test: 'test',
    mobility: 'mobility',
    recovery: 'recovery',
  });

  function safeCall(fn, fallback) {
    try {
      return typeof fn === 'function' ? fn() : fallback;
    } catch (error) {
      console.warn('[KINETIK DailyTasks] provider dependency failed', error);
      return fallback;
    }
  }

  function dateKey(value) {
    try {
      if (typeof localDateKey === 'function') return localDateKey(value || new Date());
    } catch (_) {}
    const d = value instanceof Date ? value : new Date(value || Date.now());
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function nowForContext(context) {
    return context && context.now instanceof Date ? context.now : new Date();
  }

  function normalizedAction(action) {
    if (!action) return null;
    if (typeof action === 'string') return { type: 'view', view: action };
    return {
      type: action.type || 'view',
      view: action.view || null,
      id: action.id == null ? null : String(action.id),
      label: action.label || null,
      payload: action.payload || null,
    };
  }


  function addDaysKey(key, days) {
    const parts = String(key || dateKey()).split('-').map(Number);
    const d = new Date(parts[0], Math.max(0, (parts[1] || 1) - 1), parts[2] || 1, 12, 0, 0);
    d.setDate(d.getDate() + Number(days || 0));
    return dateKey(d);
  }

  function decisionStorage() {
    try {
      const parsed = JSON.parse(global.localStorage?.getItem(DECISION_STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) { return []; }
  }

  function writeDecisionStorage(rows) {
    try { global.localStorage?.setItem(DECISION_STORAGE_KEY, JSON.stringify(rows || [])); }
    catch (error) { console.warn('[KINETIK DailyTasks] decision storage unavailable', error); }
  }

  function pruneDecisions(rows, now) {
    const cutoff = now.getTime() - DECISION_RETENTION_DAYS * DAY_MS;
    const today = dateKey(now);
    return (rows || []).filter((row) => {
      const decided = new Date(row?.decidedAt || 0).getTime();
      const futureDeferred = row?.state === 'postponed' && String(row?.deferTo || '') >= today;
      return futureDeferred || !Number.isFinite(decided) || decided >= cutoff;
    });
  }

  function taskSnapshot(task) {
    return {
      id: String(task.id), kind: task.kind, category: task.category, title: task.title, detail: task.detail,
      priority: task.priority, dueKey: task.dueKey, dueAt: task.dueAt, source: task.source,
      action: normalizedAction(task.action), metadata: task.metadata && typeof task.metadata === 'object' ? task.metadata : {},
    };
  }

  function semanticTaskKey(task) {
    const action = task?.action || {}, payload = action.payload || {}, meta = task?.metadata || {};
    if (task?.kind === KIND.measurement) return `measurement:${payload.metric || String(task.title || '').toLowerCase()}`;
    if (action.type === 'planned-event') return `planned:${action.id || meta.plannedEventId || task.id}`;
    if (task?.kind === KIND.workout) return `workout:${meta.workoutName || task.title || task.id}`;
    if (action.type === 'assessment-start' || task?.kind === KIND.test) return `test:${payload.protocolId || meta.recommendedProtocolId || 'periodic'}`;
    if (action.type === 'mobility-routine') return `mobility-routine:${payload.routineId || meta.routineId || task.kind}`;
    if (action.type === 'mobility-assessment') return `mobility-assessment:${payload.zoneId || meta.zoneId || ''}:${payload.testId || ''}`;
    return `${task?.kind || 'task'}:${task?.category || ''}:${task?.title || task?.id || ''}`;
  }

  function decisionForTask(taskId) {
    return decisionStorage().find((row) => String(row.taskId) === String(taskId)) || null;
  }

  function getTaskDecisions(options) {
    const rows = pruneDecisions(decisionStorage(), options?.now instanceof Date ? options.now : new Date());
    if (options?.dateKey) return rows.filter((row) => row.occurrenceKey === options.dateKey || row.deferTo === options.dateKey);
    return rows;
  }

  function storeTaskDecision(task, state, options) {
    if (!task || !['done', 'postponed', 'ignored'].includes(state)) return null;
    const now = options?.now instanceof Date ? options.now : new Date();
    let deferTo = null;
    if (state === 'postponed') {
      deferTo = String(options?.deferTo || addDaysKey(dateKey(now), 1));
      if (deferTo <= dateKey(now)) deferTo = addDaysKey(dateKey(now), 1);
    }
    let rows = pruneDecisions(decisionStorage(), now).filter((row) => String(row.taskId) !== String(task.id));
    const record = {
      id: `decision:${task.id}:${Date.now()}`,
      taskId: String(task.id), occurrenceKey: String(task.dueKey || dateKey(now)), state,
      decidedAt: now.toISOString(), deferTo, semanticKey: semanticTaskKey(task), snapshot: taskSnapshot(task),
    };
    rows.push(record); writeDecisionStorage(rows); return record;
  }

  function clearTaskDecision(taskId) {
    const before = decisionStorage();
    const after = before.filter((row) => String(row.taskId) !== String(taskId) && String(row.id) !== String(taskId));
    writeDecisionStorage(after); return after.length !== before.length;
  }

  function normalizeTask(raw, providerId) {
    const task = raw || {};
    const status = ['pending', 'done', 'upcoming', 'blocked', 'postponed', 'ignored'].includes(task.status)
      ? task.status
      : 'pending';
    const priority = Number.isFinite(Number(task.priority)) ? Number(task.priority) : PRIORITY.normal;
    const dueKey = task.dueKey || dateKey();
    return {
      id: String(task.id || `${providerId}:${task.kind || 'task'}:${dueKey}`),
      kind: task.kind || 'task',
      category: task.category || task.kind || 'task',
      title: String(task.title || 'Tâche'),
      detail: String(task.detail || ''),
      status,
      priority,
      dueKey,
      dueAt: task.dueAt || null,
      source: task.source || providerId,
      action: normalizedAction(task.action),
      metadata: task.metadata && typeof task.metadata === 'object' ? task.metadata : {},
    };
  }

  function registerProvider(provider) {
    if (!provider || !provider.id || typeof provider.getTasks !== 'function') {
      throw new Error('DailyTasks provider requires an id and getTasks(context).');
    }
    const existing = providers.findIndex((x) => x.id === provider.id);
    if (existing >= 0) providers.splice(existing, 1);
    providers.push({
      id: String(provider.id),
      order: Number(provider.order || 100),
      getTasks: provider.getTasks,
    });
    providers.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
    return provider;
  }

  function collect(context) {
    const ctx = {
      now: nowForContext(context),
      dateKey: context && context.dateKey ? context.dateKey : dateKey(nowForContext(context)),
      includeDone: !!(context && context.includeDone),
      includeUpcoming: !!(context && context.includeUpcoming),
    };
    const out = [];
    for (const provider of providers) {
      try {
        const rows = provider.getTasks(ctx) || [];
        for (const row of rows) out.push(normalizeTask(row, provider.id));
      } catch (error) {
        console.warn(`[KINETIK DailyTasks] provider "${provider.id}" failed`, error);
      }
    }
    const unique = new Map();
    for (const task of out) {
      const previous = unique.get(task.id);
      if (!previous || task.priority > previous.priority) unique.set(task.id, task);
    }
    return [...unique.values()]
      .filter((task) => ctx.includeDone || task.status !== 'done')
      .filter((task) => ctx.includeUpcoming || task.status !== 'upcoming')
      .sort((a, b) => b.priority - a.priority || a.title.localeCompare(b.title, 'fr'));
  }

  function getTodayTasks(options) {
    return collect({ ...(options || {}), dateKey: dateKey((options && options.now) || new Date()) });
  }

  function summary(tasks) {
    const rows = Array.isArray(tasks) ? tasks : getTodayTasks();
    const pending = rows.filter((x) => x.status === 'pending');
    return {
      total: rows.length,
      pending: pending.length,
      done: rows.filter((x) => x.status === 'done').length,
      blocked: rows.filter((x) => x.status === 'blocked').length,
      highPriority: pending.filter((x) => x.priority >= PRIORITY.high).length,
      byKind: pending.reduce((acc, x) => {
        acc[x.kind] = (acc[x.kind] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  function isWorkoutDoneForDate(key) {
    const cycleId = safeCall(() => getActiveTrainingCycleId(), null);
    const history = safeCall(() => getHistory(), []);
    return history.some((session) => {
      if (dateKey(session.date) !== key) return false;
      if (cycleId == null) return true;
      const sessionCycle = session.trainingCycleId == null ? cycleId : session.trainingCycleId;
      return String(sessionCycle) === String(cycleId);
    });
  }

  registerProvider({
    id: 'workout',
    order: 10,
    getTasks(ctx) {
      if (typeof todayDay !== 'function' || typeof workoutTemplateForDay !== 'function') return [];
      const day = ctx.now.getDay();
      const workout = safeCall(() => workoutTemplateForDay(day), null);
      if (!workout || !(workout.exercises || []).length) return [];
      const done = isWorkoutDoneForDate(ctx.dateKey);
      const duration = Number(workout.duration || 0);
      const shortDuration = Number(workout.shortDuration || 0);
      return [{
        id: `workout:${ctx.dateKey}`,
        kind: KIND.workout,
        category: 'training',
        title: done ? `Séance ${workout.name || ''} terminée` : `Séance ${workout.name || ''}`,
        detail: done
          ? 'Séance enregistrée aujourd’hui.'
          : `Complète ${duration || '—'} min${shortDuration ? ` · Express ${shortDuration} min` : ''}`,
        status: done ? 'done' : 'pending',
        priority: PRIORITY.critical,
        dueKey: ctx.dateKey,
        source: 'training-cycle',
        action: { type: done ? 'view' : 'workout-start', view: 'today', label: done ? 'Voir' : 'Commencer', payload: { day } },
        metadata: { day, workoutName: workout.name || '', duration, shortDuration },
      }];
    },
  });

  registerProvider({
    id: 'planned-activities',
    order: 20,
    getTasks(ctx) {
      if (typeof plannedEventsForDate !== 'function') return [];
      const events = safeCall(() => plannedEventsForDate(ctx.dateKey), []);
      return events.map((event) => {
        const actual = typeof plannedEventActual === 'function' ? safeCall(() => plannedEventActual(event), null) : null;
        const done = !!actual;
        const type = typeof plannedEventType === 'function' ? safeCall(() => plannedEventType(event), null) : null;
        const typeId = event.type || type?.id || 'sport';
        const isMobility = typeId === 'mobility';
        return {
          id: `planned:${event.id || `${ctx.dateKey}:${typeId}:${event.time || ''}`}`,
          kind: isMobility ? KIND.mobility : KIND.activity,
          category: isMobility ? 'mobility' : 'activity',
          title: done ? `${type?.label || event.label || 'Activité'} réalisée` : `${type?.label || event.label || 'Activité'} prévue`,
          detail: `${event.time || 'Aujourd’hui'} · ${Number(event.duration || 0) || '—'} min${event.rpe ? ` · RPE ${event.rpe}` : ''}`,
          status: done ? 'done' : 'pending',
          priority: isMobility ? PRIORITY.normal : PRIORITY.high,
          dueKey: ctx.dateKey,
          dueAt: event.time ? `${ctx.dateKey}T${event.time}:00` : null,
          source: 'planning',
          action: { type: done ? 'view' : 'planned-event', view: done ? 'week' : 'today', id: event.id, label: done ? 'Voir' : 'Enregistrer' },
          metadata: { plannedEventId: event.id, activityType: typeId },
        };
      });
    },
  });

  function bodyLogsForDate(key) {
    const logs = safeCall(() => (typeof getBodyLogs === 'function' ? getBodyLogs() : []), []);
    return logs.filter((row) => dateKey(row.date) === key);
  }

  function measurementCompletedToday(label, key) {
    const rows = bodyLogsForDate(key);
    if (!rows.length) return false;
    const name = String(label || '').toLowerCase();
    if (name.includes('poids')) return rows.some((row) => safeCall(() => typeof bodyValue === 'function' ? !!bodyValue(row, 'weight') : !!row.weight, !!row.weight));
    if (name.includes('tour de taille')) return rows.some((row) => safeCall(() => typeof bodyValue === 'function' ? !!bodyValue(row, 'waist') : !!row.waist, !!row.waist));
    if (name.includes('bilan complet')) {
      return rows.some((row) => {
        if (typeof BODY_FIELDS === 'undefined') return row.measurementMode === 'full';
        return BODY_FIELDS.filter((field) => !field.quick && safeCall(() => typeof bodyValue === 'function' ? !!bodyValue(row, field.key) : !!row[field.key], !!row[field.key])).length >= 4;
      });
    }
    if (name.includes('photo')) {
      return rows.some((row) => safeCall(() => typeof bodyPhotoId === 'function'
        ? !!(bodyPhotoId(row, 'front') || bodyPhotoId(row, 'side') || bodyPhotoId(row, 'back'))
        : !!(row.photoId || row.photoIds?.front || row.photoIds?.side || row.photoIds?.back),
      !!(row.photoId || row.photoIds?.front || row.photoIds?.side || row.photoIds?.back)));
    }
    return false;
  }

  registerProvider({
    id: 'measurements',
    order: 30,
    getTasks(ctx) {
      if (typeof bodyTrackingSchedule !== 'function') return [];
      const schedule = safeCall(() => bodyTrackingSchedule(), []);
      return schedule.map((item) => {
        const name = String(item.label || 'mesure').toLowerCase();
        const slug = name.replace(/[^a-z0-9à-ÿ]+/gi, '-').replace(/^-|-$/g, '');
        const due = !!item.due;
        const completedToday = measurementCompletedToday(item.label, ctx.dateKey);
        return {
          id: `measurement:${slug}:${ctx.dateKey}`,
          kind: KIND.measurement,
          category: 'body',
          title: completedToday ? `${item.label || 'Mesure'} · fait` : (item.label || 'Mesure'),
          detail: completedToday ? 'Enregistré aujourd’hui.' : (due ? (item.text || 'À faire') : (item.text || '')),
          status: completedToday ? 'done' : (due ? 'pending' : 'upcoming'),
          priority: due ? PRIORITY.high : PRIORITY.info,
          dueKey: ctx.dateKey,
          source: 'body-tracking',
          action: completedToday ? { type: 'view', view: 'measurements', label: 'Voir' } : {
            type: 'measurement-entry',
            view: 'measurements',
            label: name.includes('photo') ? 'Ajouter les photos' : name.includes('bilan complet') ? 'Faire le bilan' : 'Saisir',
            payload: {
              metric: name.includes('poids') ? 'weight' : name.includes('tour de taille') ? 'waist' : name.includes('photo') ? 'photos' : 'full',
              mode: (name.includes('bilan complet') || name.includes('photo')) ? 'full' : 'quick',
            },
          },
          metadata: {
            everyDays: Number(item.every || 0),
            ageDays: Number(item.age || 0),
            remainingDays: Math.max(0, Number(item.every || 0) - Number(item.age || 0)),
            due,
            completedToday,
          },
        };
      });
    },
  });

  registerProvider({
    id: 'tests',
    order: 40,
    getTasks(ctx) {
      if (typeof assessmentProtocolStatuses !== 'function') return [];
      const protocols = safeCall(() => assessmentProtocolStatuses(ctx.now), []);
      if (!protocols.length) return [];

      const validatedToday = protocols.filter((row) => row.freshness?.validatedToday);
      if (validatedToday.length) {
        return validatedToday.map((row) => ({
          id: `test:${row.id}:${ctx.dateKey}`,
          kind: KIND.test,
          category: 'assessment',
          title: `${row.name} · fait`,
          detail: `Test KINETIK validé aujourd’hui · prochaine réévaluation dans ${row.freshness.freshnessDays} j.`,
          status: 'done',
          priority: PRIORITY.high,
          dueKey: ctx.dateKey,
          source: 'assessment-protocol',
          action: { type: 'view', view: 'assessment', label: 'Voir' },
          metadata: {
            protocolId: row.id,
            recommendedProtocolId: row.id,
            freshnessDays: row.freshness.freshnessDays,
            lastValidated: row.freshness.lastDate || null,
            dueDate: row.freshness.dueDate || null,
            daysUntil: row.freshness.daysUntil,
            validatedToday: true,
          },
        }));
      }

      const due = protocols.filter((row) => row.freshness?.due).sort((a, b) => b.reminderPriority - a.reminderPriority || a.name.localeCompare(b.name, 'fr'));
      const upcoming = protocols.filter((row) => !row.freshness?.due && Number(row.freshness?.daysUntil) >= 0).sort((a, b) => Number(a.freshness.daysUntil) - Number(b.freshness.daysUntil) || b.reminderPriority - a.reminderPriority);
      const selected = due[0] || (ctx.includeUpcoming ? upcoming[0] : null);
      if (!selected) return [];

      const f = selected.freshness || {};
      const never = f.state === 'never';
      const isDue = !!f.due;
      const detail = isDue
        ? (never
          ? `Première validation · ≈ ${selected.duration || '—'} min · échéance indépendante.`
          : `À re-tester${f.overdueDays > 0 ? ` · ${f.overdueDays} j de retard` : ''} · cadence ${f.freshnessDays} j.`)
        : `À jour · prochain re-test dans ${f.daysUntil} j · cadence ${f.freshnessDays} j.`;

      return [{
        id: `test:${selected.id}:${ctx.dateKey}`,
        kind: KIND.test,
        category: 'assessment',
        title: never ? `Évaluer · ${selected.name}` : `Re-tester · ${selected.name}`,
        detail,
        status: isDue ? 'pending' : 'upcoming',
        priority: isDue ? Math.min(95, PRIORITY.high + Math.max(0, Number(selected.reminderPriority || 0))) : PRIORITY.info,
        dueKey: ctx.dateKey,
        source: 'assessment-protocol',
        action: { type: 'assessment-start', view: 'assessment', label: never ? 'Faire le test' : 'Re-tester', payload: { protocolId: selected.id } },
        metadata: {
          protocolId: selected.id,
          recommendedProtocolId: selected.id,
          freshnessDays: f.freshnessDays,
          lastValidated: f.lastDate || null,
          dueDate: f.dueDate || null,
          overdue: isDue,
          overdueDays: Number(f.overdueDays || 0),
          daysUntil: Number(f.daysUntil ?? 999),
          freshnessState: f.state || null,
          dueProtocolCount: due.length,
        },
      }];
    },
  });


  const MOBILITY_ASSESSMENT_DAYS = 28;

  function mobilityDefinitions() {
    return safeCall(() => (typeof MOBILITY_ZONES !== 'undefined' ? MOBILITY_ZONES : []), []);
  }

  function mobilityLogs() {
    return safeCall(() => (typeof getMobilityTests === 'function' ? getMobilityTests() : []), []);
  }

  function flexLogs() {
    return safeCall(() => (typeof getFlexLogs === 'function' ? getFlexLogs() : []), []);
  }

  function plannedEvents(key) {
    if (typeof plannedEventsForDate !== 'function') return [];
    return safeCall(() => plannedEventsForDate(key), []);
  }

  function eventTypeId(event) {
    const type = typeof plannedEventType === 'function' ? safeCall(() => plannedEventType(event), null) : null;
    return event?.type || type?.id || 'sport';
  }

  function dedicatedFlexDoneForDate(key) {
    if (flexLogs().some((row) => dateKey(row.date) === key)) return true;
    const activities = safeCall(() => (typeof getActivities === 'function' ? getActivities() : []), []);
    return activities.some((row) => row?.type === 'mobility' && dateKey(row.date) === key);
  }

  function plannedMobilityExists(key) {
    return plannedEvents(key).some((event) => eventTypeId(event) === 'mobility');
  }

  function plannedExternalSportExists(key) {
    return plannedEvents(key).some((event) => eventTypeId(event) !== 'mobility');
  }

  function daysSinceLastFlex(now) {
    const rows = flexLogs()
      .map((x) => new Date(x.date).getTime())
      .filter(Number.isFinite)
      .sort((a, b) => b - a);
    if (!rows.length) return Infinity;
    return Math.max(0, (now.getTime() - rows[0]) / DAY_MS);
  }

  function daysRemainingInWeek(now) {
    const mondayIndex = (now.getDay() + 6) % 7;
    return 7 - mondayIndex;
  }

  function mobilityZoneFreshness(now) {
    const rows = mobilityLogs();
    const latestByTest = new Map();
    for (const row of rows) {
      const t = new Date(row.date).getTime();
      if (!row.testId || !Number.isFinite(t)) continue;
      const previous = latestByTest.get(row.testId) || 0;
      if (t > previous) latestByTest.set(row.testId, t);
    }
    return mobilityDefinitions().map((zone) => {
      const ids = Array.isArray(zone.tests) ? zone.tests : [];
      const presentRows = ids.map((id) => ({ id, time: latestByTest.get(id) })).filter((row) => Number.isFinite(row.time));
      const present = presentRows.map((row) => row.time);
      const missing = ids.filter((id) => !latestByTest.has(id));
      const oldestRow = presentRows.slice().sort((a, b) => a.time - b.time)[0] || null;
      const oldest = oldestRow ? oldestRow.time : null;
      const ageDays = oldest == null ? Infinity : Math.max(0, Math.floor((now.getTime() - oldest) / DAY_MS));
      const remainingDays = Number.isFinite(ageDays) ? Math.max(0, MOBILITY_ASSESSMENT_DAYS - ageDays) : 0;
      return {
        id: zone.id,
        label: zone.label || zone.id,
        tests: ids,
        oldestTestId: oldestRow?.id || null,
        missing,
        tested: ids.length - missing.length,
        total: ids.length,
        ageDays,
        remainingDays,
        stale: missing.length > 0 || ageDays >= MOBILITY_ASSESSMENT_DAYS,
      };
    });
  }

  function mobilityAssessmentCandidate(ctx) {
    const zones = mobilityZoneFreshness(ctx.now);
    if (!zones.length) return null;
    const priority = typeof mobilityPriority === 'function' ? safeCall(() => mobilityPriority(ctx.now.getDay()), null) : null;
    const priorityZone = zones.find((x) => x.id === priority?.id);
    const isRelevant = (x) => x.missing.length > 0 || x.ageDays >= MOBILITY_ASSESSMENT_DAYS || x.remainingDays <= 14;
    if (priorityZone && isRelevant(priorityZone)) return { ...priorityZone, isPriority: true };
    const candidates = zones.filter(isRelevant).sort((a, b) => {
      if (a.missing.length !== b.missing.length) return b.missing.length - a.missing.length;
      return b.ageDays - a.ageDays;
    });
    return candidates[0] ? { ...candidates[0], isPriority: false } : null;
  }

  function mobilityWeekState(now) {
    const cfg = typeof getFlexConfig === 'function' ? safeCall(() => getFlexConfig(), null) : null;
    const balance = typeof weeklyFlexBalance === 'function' ? safeCall(() => weeklyFlexBalance(), null) : null;
    if (!cfg || !balance) return null;
    const targetSessions = Math.max(0, Number(cfg.sessionsTarget || 0));
    const targetMinutes = Math.max(0, Number(cfg.weeklyMinutesTarget || 0));
    const sessions = Math.max(0, Number(balance.dedicatedSessions || 0));
    const minutes = Math.max(0, Number(balance.dedicatedMinutes || 0));
    return {
      targetSessions,
      targetMinutes,
      sessions,
      minutes,
      remainingSessions: Math.max(0, targetSessions - sessions),
      remainingMinutes: Math.max(0, targetMinutes - minutes),
      daysRemaining: daysRemainingInWeek(now),
    };
  }

  function recoveryDayForContext(ctx) {
    const profile = typeof getAthleteProfile === 'function' ? safeCall(() => getAthleteProfile(), {}) : {};
    const explicitRest = Array.isArray(profile?.restDays) && profile.restDays.includes(ctx.now.getDay());
    let hasWorkout = false;
    if (typeof workoutTemplateForDay === 'function') {
      const workout = safeCall(() => workoutTemplateForDay(ctx.now.getDay()), null);
      hasWorkout = !!(workout && Array.isArray(workout.exercises) && workout.exercises.length);
    }
    // An external sport day is not treated as a pure recovery day even if KINETIK has no strength session.
    const externalSport = plannedExternalSportExists(ctx.dateKey);
    return (explicitRest || !hasWorkout) && !externalSport;
  }

  registerProvider({
    id: 'mobility-assessment',
    order: 45,
    getTasks(ctx) {
      const todayTests = mobilityLogs().filter((row) => dateKey(row.date) === ctx.dateKey);
      if (todayTests.length) {
        const zones = mobilityDefinitions().filter((zone) => (zone.tests || []).some((id) => todayTests.some((row) => row.testId === id)));
        const zone = zones[0] || null;
        return [{
          id: `mobility:assessment:done:${zone?.id || 'today'}:${ctx.dateKey}`,
          kind: KIND.mobility,
          category: 'mobility-assessment',
          title: zone ? `Bilan mobilité · ${zone.label} · fait` : 'Bilan mobilité · fait',
          detail: `${todayTests.length} test${todayTests.length > 1 ? 's' : ''} enregistré${todayTests.length > 1 ? 's' : ''} aujourd’hui.`,
          status: 'done',
          priority: PRIORITY.normal,
          dueKey: ctx.dateKey,
          source: 'mobility-tests-completed',
          action: { type: 'view', view: 'flexibility', label: 'Voir' },
          metadata: { zoneId: zone?.id || null, assessment: true, completedToday: true, testsToday: todayTests.length },
        }];
      }
      const candidate = mobilityAssessmentCandidate(ctx);
      if (!candidate) return [];
      const missing = candidate.missing.length > 0;
      const overdue = missing || candidate.ageDays >= MOBILITY_ASSESSMENT_DAYS;
      const status = overdue ? 'pending' : 'upcoming';
      const detail = missing
        ? `${candidate.tested}/${candidate.total} tests enregistrés · complète ${candidate.label.toLowerCase()}.`
        : overdue
          ? `Mesure la plus ancienne : ${candidate.ageDays} j · repère conseillé ${MOBILITY_ASSESSMENT_DAYS} j.`
          : `À refaire dans ${candidate.remainingDays} j · repère conseillé ${MOBILITY_ASSESSMENT_DAYS} j.`;
      return [{
        id: `mobility:assessment:${candidate.id}:${ctx.dateKey}`,
        kind: KIND.mobility,
        category: 'mobility-assessment',
        title: missing ? `Compléter le bilan mobilité · ${candidate.label}` : `Réévaluer la mobilité · ${candidate.label}`,
        detail,
        status,
        priority: overdue && candidate.isPriority ? PRIORITY.high : overdue ? PRIORITY.normal : PRIORITY.info,
        dueKey: ctx.dateKey,
        source: 'mobility-tests',
        action: { type: 'mobility-assessment', view: 'flexibility', label: missing ? 'Évaluer' : 'Re-tester', payload: { zoneId: candidate.id, testId: candidate.missing[0] || candidate.oldestTestId || candidate.tests?.[0] || null } },
        metadata: {
          zoneId: candidate.id,
          assessment: true,
          missingTests: candidate.missing,
          ageDays: Number.isFinite(candidate.ageDays) ? candidate.ageDays : null,
          remainingDays: candidate.remainingDays,
          staleDays: MOBILITY_ASSESSMENT_DAYS,
          isPriority: candidate.isPriority,
        },
      }];
    },
  });

  registerProvider({
    id: 'mobility-coaching',
    order: 50,
    getTasks(ctx) {
      // A user-planned mobility event already has its own task through planned-activities.
      if (plannedMobilityExists(ctx.dateKey)) return [];
      if (typeof recommendedFlexRoutine !== 'function' || typeof mobilityPriority !== 'function') return [];

      const recoveryDay = recoveryDayForContext(ctx);
      const kind = recoveryDay ? KIND.recovery : KIND.mobility;
      const done = dedicatedFlexDoneForDate(ctx.dateKey);
      const routine = safeCall(() => recommendedFlexRoutine(ctx.now.getDay()), null);
      if (!routine) return [];
      const priorityZone = safeCall(() => mobilityPriority(ctx.now.getDay()), null);
      const week = mobilityWeekState(ctx.now);
      const duration = Math.max(0, Number(routine.duration || 0));

      if (done) {
        return [{
          id: `mobility:routine:${ctx.dateKey}`,
          kind,
          category: recoveryDay ? 'recovery' : 'mobility',
          title: recoveryDay ? 'Récupération mobilité terminée' : 'Mobilité terminée',
          detail: `${routine.name || 'Routine'} · enregistrée aujourd’hui.`,
          status: 'done',
          priority: PRIORITY.normal,
          dueKey: ctx.dateKey,
          source: 'flexibility',
          action: { type: 'view', view: 'flexibility', label: 'Voir' },
          metadata: { routineId: routine.id || null, duration, mode: recoveryDay ? 'Recovery' : 'Progression', completedToday: true },
        }];
      }

      if (!week) return [];
      const weeklyNeed = week.remainingSessions > 0 || week.remainingMinutes > 0;
      if (!weeklyNeed) return [];

      const sinceFlex = daysSinceLastFlex(ctx.now);
      const schedulePressure = week.remainingSessions > 0 && week.remainingSessions >= week.daysRemaining;
      const spacingDue = sinceFlex >= 2;
      const recoverySpacingDue = recoveryDay && sinceFlex >= 1;
      const due = schedulePressure || spacingDue || recoverySpacingDue;
      if (!due) return [];

      const high = schedulePressure || (week.daysRemaining <= 2 && weeklyNeed);
      const zoneLabel = priorityZone?.id ? priorityZone.label : null;
      const progressBits = [];
      if (week.targetSessions > 0) progressBits.push(`${week.sessions}/${week.targetSessions} routines cette semaine`);
      if (week.targetMinutes > 0) progressBits.push(`${Math.round(week.minutes)}/${week.targetMinutes} min`);
      const detail = recoveryDay
        ? `${duration || '—'} min · récupération douce${zoneLabel ? ` · priorité ${zoneLabel.toLowerCase()}` : ''}.`
        : `${duration || '—'} min${zoneLabel ? ` · priorité ${zoneLabel.toLowerCase()}` : ''}${progressBits.length ? ` · ${progressBits.join(' · ')}` : ''}.`;

      return [{
        id: `mobility:routine:${ctx.dateKey}`,
        kind,
        category: recoveryDay ? 'recovery' : 'mobility',
        title: recoveryDay ? `Récupération · ${routine.name || 'Mobilité douce'}` : `Mobilité · ${routine.name || 'Routine recommandée'}`,
        detail,
        status: 'pending',
        priority: high ? PRIORITY.high : PRIORITY.normal,
        dueKey: ctx.dateKey,
        source: 'mobility-coach',
        action: { type: 'mobility-routine', view: 'flexibility', label: recoveryDay ? 'Démarrer' : 'Commencer', payload: { routineId: routine.id || null } },
        metadata: {
          routineId: routine.id || null,
          duration,
          mode: recoveryDay ? 'Recovery' : 'Progression',
          zoneId: priorityZone?.id || null,
          zoneLabel: zoneLabel || null,
          remainingSessions: week.remainingSessions,
          remainingMinutes: week.remainingMinutes,
          daysRemaining: week.daysRemaining,
          daysSinceLastFlex: Number.isFinite(sinceFlex) ? Math.round(sinceFlex * 10) / 10 : null,
          schedulePressure,
        },
      }];
    },
  });


  function snapshotCompletedForDate(snapshot, key) {
    if (!snapshot) return false;
    const action = snapshot.action || {}, payload = action.payload || {}, meta = snapshot.metadata || {};
    if (snapshot.kind === KIND.measurement) return measurementCompletedToday(snapshot.title, key);
    if (snapshot.kind === KIND.workout) {
      const history = safeCall(() => getHistory(), []);
      return history.some((row) => dateKey(row.date) === key && (!meta.workoutName || String(row.name || '') === String(meta.workoutName)));
    }
    if (action.type === 'planned-event') {
      const event = safeCall(() => typeof plannedEventById === 'function' ? plannedEventById(action.id || meta.plannedEventId) : null, null);
      return !!(event && safeCall(() => typeof plannedEventActual === 'function' ? plannedEventActual(event) : null, null));
    }
    if (action.type === 'mobility-routine') return dedicatedFlexDoneForDate(key);
    if (action.type === 'mobility-assessment') {
      const testId = payload.testId || null;
      return mobilityLogs().some((row) => dateKey(row.date) === key && (!testId || row.testId === testId));
    }
    if (snapshot.kind === KIND.test || action.type === 'assessment-start') {
      const protocolId = payload.protocolId || meta.protocolId || meta.recommendedProtocolId || null;
      const completedOnDate = safeCall(() => (typeof getTests === 'function' ? getTests() : []), []).some((row) => dateKey(row.date) === key && (!protocolId || row.testId === protocolId || row.protocolId === protocolId));
      if (completedOnDate) return true;
      if (protocolId && typeof assessmentProtocol === 'function' && typeof protocolFreshness === 'function') {
        const protocol = safeCall(() => assessmentProtocol(protocolId), null);
        const targetDate = new Date(`${key}T12:00:00`);
        const freshness = protocol ? safeCall(() => protocolFreshness(protocol, targetDate), null) : null;
        if (freshness && freshness.state !== 'never' && freshness.due === false) return true;
      }
      return false;
    }
    return false;
  }

  function applyTaskDecisions(baseRows, ctx) {
    const rows = baseRows.map((task) => ({ ...task, metadata: { ...(task.metadata || {}) } }));
    const decisions = pruneDecisions(decisionStorage(), ctx.now);
    const byTask = new Map(decisions.map((row) => [String(row.taskId), row]));

    for (const task of rows) {
      const decision = byTask.get(String(task.id));
      if (!decision || decision.occurrenceKey !== task.dueKey) continue;
      task.metadata.decisionId = decision.id;
      task.metadata.decisionState = decision.state;
      task.metadata.decisionAt = decision.decidedAt;
      if (decision.state === 'done' && task.status !== 'done') {
        task.status = 'done';
        task.detail = 'Marqué fait manuellement · aucune donnée sportive ajoutée.';
        task.metadata.manualCompletion = true;
      } else if (decision.state === 'postponed') {
        task.status = 'postponed'; task.metadata.deferTo = decision.deferTo;
        task.detail = `Reporté au ${decision.deferTo}.`;
      } else if (decision.state === 'ignored') {
        task.status = 'ignored'; task.detail = 'Ignoré pour cette occurrence.';
      }
    }

    const deferredToday = decisions.filter((row) => row.state === 'postponed' && row.deferTo === ctx.dateKey && row.occurrenceKey !== ctx.dateKey);
    for (const decision of deferredToday) {
      const snapshot = decision.snapshot || null;
      if (!snapshot) continue;
      const semantic = decision.semanticKey || semanticTaskKey(snapshot);
      const natural = rows.find((task) => semanticTaskKey(task) === semantic && !['postponed', 'ignored'].includes(task.status));
      if (natural) {
        natural.metadata.deferredFrom = decision.occurrenceKey;
        natural.metadata.deferredDecisionId = decision.id;
        if (natural.status !== 'done') natural.detail = `Reporté du ${decision.occurrenceKey} · ${natural.detail || ''}`.trim();
        continue;
      }
      const completed = snapshotCompletedForDate(snapshot, ctx.dateKey);
      rows.push(normalizeTask({
        ...snapshot,
        id: `deferred:${decision.taskId}:${ctx.dateKey}`,
        title: String(snapshot.title || 'Tâche').replace(/\s*·\s*fait$/i, ''),
        detail: completed ? 'Réalisé aujourd’hui après report.' : `Reporté du ${decision.occurrenceKey} · ${snapshot.detail || ''}`,
        status: completed ? 'done' : 'pending',
        dueKey: ctx.dateKey,
        dueAt: null,
        source: 'daily-task-decision',
        metadata: { ...(snapshot.metadata || {}), deferredFrom: decision.occurrenceKey, deferredDecisionId: decision.id, originalTaskId: decision.taskId },
      }, 'daily-task-decision'));
    }
    return rows.sort((a, b) => b.priority - a.priority || a.title.localeCompare(b.title, 'fr'));
  }

  function reminderPreferences() {
    const fallback = { enabled: true, workout: true, activities: true, measurements: true, tests: true, mobility: true, recovery: true, visibility: 'due-only', upcomingDays: 3 };
    if (typeof getReminderPrefs !== 'function') return fallback;
    return safeCall(() => getReminderPrefs(), fallback);
  }

  function taskAllowedByReminderPreferences(task, prefs) {
    if (task.kind === KIND.workout) return prefs.workout !== false;
    if (task.kind === KIND.activity) return prefs.activities !== false;
    if (task.kind === KIND.measurement) return prefs.measurements !== false;
    if (task.kind === KIND.test) return prefs.tests !== false;
    if (task.kind === KIND.mobility) return prefs.mobility !== false;
    if (task.kind === KIND.recovery) return prefs.recovery !== false;
    return true;
  }

  function upcomingDistance(task) {
    if (task.metadata && task.metadata.remainingDays != null) return Number(task.metadata.remainingDays);
    if (task.kind === KIND.test) return Number(task.metadata?.daysUntil ?? 999);
    return 999;
  }

  function limitAssessmentTasks(rows) {
    const active = rows.filter((task) => task.kind === KIND.test && (task.status === 'pending' || task.status === 'upcoming'));
    if (active.length <= 1) return rows;
    const deferred = active.find((task) => task.metadata?.deferredFrom || task.source === 'daily-task-decision');
    const keep = deferred || active.sort((a, b) => b.priority - a.priority || a.title.localeCompare(b.title, 'fr'))[0];
    return rows.filter((task) => task.kind !== KIND.test || !['pending', 'upcoming'].includes(task.status) || task.id === keep.id);
  }

  function getAgendaTasks(options) {
    const prefs = reminderPreferences();
    if (prefs.enabled === false) return [];
    const now = options?.now instanceof Date ? options.now : new Date();
    const includeDone = options?.includeDone !== false;
    const includeUpcoming = prefs.visibility === 'due-and-soon';
    const horizon = Math.max(1, Math.min(14, Number(prefs.upcomingDays || 3)));
    const base = getTodayTasks({ ...(options || {}), now, includeDone: true, includeUpcoming });
    const decided = applyTaskDecisions(base, { now, dateKey: dateKey(now) })
      .filter((task) => includeDone || task.status !== 'done')
      .filter((task) => taskAllowedByReminderPreferences(task, prefs))
      .filter((task) => task.status !== 'upcoming' || (includeUpcoming && upcomingDistance(task) <= horizon));
    return limitAssessmentTasks(decided);
  }

  function agendaSummary(tasks) {
    const rows = Array.isArray(tasks) ? tasks : getAgendaTasks({ includeDone: true });
    const done = rows.filter((task) => task.status === 'done').length;
    const pending = rows.filter((task) => task.status === 'pending' || task.status === 'blocked').length;
    const postponed = rows.filter((task) => task.status === 'postponed').length;
    const ignored = rows.filter((task) => task.status === 'ignored').length;
    const total = done + pending;
    const adjusted = postponed + ignored;
    return {
      total,
      done,
      pending,
      postponed,
      ignored,
      adjusted,
      upcoming: rows.filter((task) => task.status === 'upcoming').length,
      percent: total ? Math.round((done / total) * 100) : 100,
      complete: pending === 0 && (done > 0 || adjusted > 0),
      empty: total === 0 && adjusted === 0,
    };
  }

  function toLegacyReminderItems() {
    return getAgendaTasks({ includeDone: false })
      .filter((task) => task.status === 'pending' || task.status === 'upcoming')
      .map((task) => ({
        type: task.kind === KIND.measurement ? 'measure' : task.kind,
        label: task.status === 'upcoming' ? `${task.title} · bientôt` : task.title,
        detail: task.detail,
        taskId: task.id,
        priority: task.priority,
        status: task.status,
      }));
  }

  const api = {
    version: VERSION,
    KIND,
    PRIORITY,
    registerProvider,
    collect,
    getTodayTasks,
    summary,
    agendaSummary,
    dateKey,
    getAgendaTasks,
    getReminderPreferences: reminderPreferences,
    toLegacyReminderItems,
    addDaysKey,
    getTaskDecisions,
    decisionForTask,
    setTaskDecision(taskId, state, options) {
      const task = getAgendaTasks({ now: options?.now instanceof Date ? options.now : new Date(), includeDone: true }).find((row) => String(row.id) === String(taskId));
      return task ? storeTaskDecision(task, state, options || {}) : null;
    },
    clearTaskDecision,
    listProviders() {
      return providers.map((x) => ({ id: x.id, order: x.order }));
    },
  };

  global.KinetikDailyTasks = api;
  global.getDailyTasks = function (options) { return api.getTodayTasks(options); };
  global.getDailyTaskSummary = function (tasks) { return api.summary(tasks); };

  // Step 1 integration: existing reminder surfaces now consume the central engine.
  // This keeps current UI behavior while removing duplicated reminder logic.
  try {
    if (typeof smartReminderItems === 'function') {
      smartReminderItems = function () { return api.toLegacyReminderItems(); };
    }
  } catch (error) {
    console.warn('[KINETIK DailyTasks] legacy reminder bridge unavailable', error);
  }

  console.info(`[KINETIK] Daily Tasks Engine v${VERSION} ready · ${providers.length} providers`);
  // app.js is loaded first; refresh once the engine is actually available so the first Today render is complete.
  try { if (typeof global.render === 'function') global.render(); } catch (error) { console.warn('[KINETIK DailyTasks] initial refresh failed', error); }
})(window);
