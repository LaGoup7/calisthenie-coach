/* ========================================================================== */
/* KINETIK v10.115 · Daily Tasks Engine                                       */
/* Central source of truth for "what should I do today?".                    */
/*                                                                            */
/* Step P0.1                                                                  */
/* - Normalized task contract                                                 */
/* - Provider registry                                                        */
/* - Workout / planned activity / measurement / test providers                */
/* - Completion inferred from existing KINETIK data                           */
/* - Legacy reminder adapter                                                  */
/*                                                                            */
/* UI rendering and snooze/ignore state intentionally belong to later steps.  */
/* ========================================================================== */
(function (global) {
  'use strict';

  const VERSION = '1.0.0';
  const DAY_MS = 86400000;
  const providers = [];

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

  function normalizeTask(raw, providerId) {
    const task = raw || {};
    const status = ['pending', 'done', 'upcoming', 'blocked'].includes(task.status)
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
        action: { type: 'view', view: 'today', label: done ? 'Voir' : 'Commencer' },
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
          action: { type: 'planned-event', view: 'today', id: event.id, label: done ? 'Voir' : 'Réaliser' },
          metadata: { plannedEventId: event.id, activityType: typeId },
        };
      });
    },
  });

  registerProvider({
    id: 'measurements',
    order: 30,
    getTasks(ctx) {
      if (typeof bodyTrackingSchedule !== 'function') return [];
      const schedule = safeCall(() => bodyTrackingSchedule(), []);
      return schedule.map((item) => {
        const slug = String(item.label || 'mesure').toLowerCase().replace(/[^a-z0-9à-ÿ]+/gi, '-').replace(/^-|-$/g, '');
        const due = !!item.due;
        return {
          id: `measurement:${slug}:${ctx.dateKey}`,
          kind: KIND.measurement,
          category: 'body',
          title: item.label || 'Mesure',
          detail: due ? (item.text || 'À faire') : (item.text || ''),
          status: due ? 'pending' : 'upcoming',
          priority: due ? PRIORITY.high : PRIORITY.info,
          dueKey: ctx.dateKey,
          source: 'body-tracking',
          action: { type: 'view', view: 'measurements', label: 'Mesurer' },
          metadata: {
            everyDays: Number(item.every || 0),
            ageDays: Number(item.age || 0),
            due,
          },
        };
      });
    },
  });

  registerProvider({
    id: 'tests',
    order: 40,
    getTasks(ctx) {
      if (typeof testDueSummary !== 'function') return [];
      const due = safeCall(() => testDueSummary(), null);
      if (!due) return [];
      return [{
        id: `tests:periodic:${ctx.dateKey}`,
        kind: KIND.test,
        category: 'assessment',
        title: due.overdue ? 'Tests périodiques' : 'Prochain bilan performance',
        detail: due.label || '',
        status: due.overdue ? 'pending' : 'upcoming',
        priority: due.overdue ? PRIORITY.high : PRIORITY.info,
        dueKey: ctx.dateKey,
        source: 'performance-tests',
        action: { type: 'view', view: 'progress', label: 'Tester' },
        metadata: { overdue: !!due.overdue },
      }];
    },
  });

  function reminderPreferences() {
    if (typeof getReminderPrefs !== 'function') {
      return { enabled: true, workout: true, measurements: true, tests: true };
    }
    return safeCall(() => getReminderPrefs(), { enabled: true, workout: true, measurements: true, tests: true });
  }

  function taskAllowedByLegacyPreferences(task, prefs) {
    if (task.kind === KIND.workout) return prefs.workout !== false;
    if (task.kind === KIND.measurement) return prefs.measurements !== false;
    if (task.kind === KIND.test) return prefs.tests !== false;
    return true;
  }

  function toLegacyReminderItems() {
    const prefs = reminderPreferences();
    if (prefs.enabled === false) return [];
    return getTodayTasks()
      .filter((task) => task.status === 'pending')
      .filter((task) => taskAllowedByLegacyPreferences(task, prefs))
      .map((task) => ({
        type: task.kind === KIND.measurement ? 'measure' : task.kind,
        label: task.title,
        detail: task.detail,
        taskId: task.id,
        priority: task.priority,
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
    dateKey,
    toLegacyReminderItems,
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
})(window);
