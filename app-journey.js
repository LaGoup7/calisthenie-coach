/* KINETIK v10.142 · Daily journey, reminders, shortcuts and Web Push settings UI. */
/* KINETIK v10.120 · Step 6 · Today Agenda                                   */
/* One compact surface for the Daily Tasks Engine.                            */
/* Completed tasks leave the active list and feed the daily progress.         */
/* Direct task execution remains intentionally reserved for Step 7.           */
/* ========================================================================== */
function todayAgendaTaskMeta(task){
  const map={
    workout:{icon:'↟',label:'Entraînement'},
    activity:{icon:'↗',label:'Activité'},
    measurement:{icon:'◎',label:'Mesure'},
    test:{icon:'◇',label:'Évaluation'},
    mobility:{icon:'∿',label:task?.category==='mobility-assessment'?'Mobilité · test':'Mobilité'},
    recovery:{icon:'◌',label:'Récupération'}
  };
  return map[task?.kind]||{icon:'•',label:'À faire'};
}
function todayAgendaAction(task){
  if(!task?.action)return '';
  const label=task.action.label||'Ouvrir';
  if(task.kind==='workout')return `<a class="today-agenda-action" href="#todayWorkoutHero">Voir la séance →</a>`;
  if(task.action.type==='planned-event')return `<button class="today-agenda-action" type="button" data-view="week">Planning →</button>`;
  const view=task.action.view;
  if(view&&view!=='today')return `<button class="today-agenda-action" type="button" data-view="${esc(view)}">${esc(label)} →</button>`;
  return '';
}
function renderTodayAgendaTask(task){
  const meta=todayAgendaTaskMeta(task),high=Number(task.priority||0)>=80;
  return `<article class="today-agenda-task kind-${esc(task.kind)} ${high?'is-priority':''}">
    <span class="today-agenda-task-icon" aria-hidden="true">${meta.icon}</span>
    <div class="today-agenda-task-copy"><div class="today-agenda-task-meta"><span>${esc(meta.label)}</span>${high?'<b>Prioritaire</b>':''}</div><strong>${esc(task.title)}</strong>${task.detail?`<small>${esc(task.detail)}</small>`:''}</div>
    ${todayAgendaAction(task)}
  </article>`;
}
function renderTodayAgenda(){
  const engine=window.KinetikDailyTasks;
  if(!engine?.getAgendaTasks||!engine?.agendaSummary)return '';
  const prefs=engine.getReminderPreferences?engine.getReminderPreferences():{enabled:true};
  if(prefs?.enabled===false){
    return `<section class="card today-agenda today-agenda-disabled"><div class="today-agenda-head"><div><div class="kicker">Aujourd'hui</div><h2>Priorités masquées</h2><p>Les rappels sont désactivés dans tes réglages.</p></div><button class="btn btn-outline compact" data-view="settings">Réactiver</button></div></section>`;
  }
  const tasks=engine.getAgendaTasks({includeDone:true}),summary=engine.agendaSummary(tasks);
  const pending=tasks.filter(t=>t.status==='pending'||t.status==='blocked');
  const done=tasks.filter(t=>t.status==='done');
  const upcoming=tasks.filter(t=>t.status==='upcoming');
  const title=summary.complete?'Journée validée':summary.empty?'Rien d’obligatoire':'À faire aujourd’hui';
  const subtitle=summary.complete
    ? `${summary.done} tâche${summary.done>1?'s':''} terminée${summary.done>1?'s':''}.`
    : summary.empty
      ? 'Aucune priorité due pour le moment.'
      : `${summary.pending} tâche${summary.pending>1?'s':''} restante${summary.pending>1?'s':''} · ${summary.done}/${summary.total} terminée${summary.done>1?'s':''}`;
  return `<section class="card today-agenda ${summary.complete?'is-complete':''}">
    <div class="today-agenda-head">
      <div><div class="kicker">Parcours du jour</div><h2>${title}</h2><p>${subtitle}</p></div>
      <div class="today-agenda-score" aria-label="${summary.percent}% terminé"><strong>${summary.percent}%</strong><span>${summary.done}/${summary.total||0}</span></div>
    </div>
    <div class="today-agenda-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${summary.percent}"><i style="width:${summary.percent}%"></i></div>
    ${pending.length?`<div class="today-agenda-list">${pending.map(renderTodayAgendaTask).join('')}</div>`:summary.complete?'<div class="today-agenda-complete"><span>✓</span><div><strong>Tout est fait pour aujourd’hui</strong><small>Les tâches terminées sont automatiquement retirées de la liste active.</small></div></div>':'<div class="today-agenda-empty"><span>✓</span><div><strong>Agenda libre</strong><small>Tu peux t’entraîner librement ou simplement récupérer.</small></div></div>'}
    ${done.length?`<details class="today-agenda-done"><summary><span>✓ ${done.length} terminée${done.length>1?'s':''} aujourd’hui</span><b>⌄</b></summary><div>${done.map(t=>`<span>${todayAgendaTaskMeta(t).icon} ${esc(t.title.replace(/\s*·\s*fait$/i,''))}</span>`).join('')}</div></details>`:''}
    ${upcoming.length?`<div class="today-agenda-upcoming"><div><span>Bientôt</span><small>Ne compte pas dans la progression du jour</small></div>${upcoming.slice(0,3).map(t=>`<span><b>${esc(t.title)}</b><small>${esc(t.detail)}</small></span>`).join('')}</div>`:''}
  </section>`;
}

/* These legacy Today surfaces are now consolidated into the central agenda. */
renderTodayMobilityPrompt=function(){return '';};
renderTodayPlannedEvents=function(){return '';};
renderTodayUsefulActions=function(){
  const x=progressWeekStats(),rank=getRankState(),next=rank.next;
  const progress=Math.max(0,Math.min(100,Math.round(Number(rank.readiness||0)*100)));
  const rankLabel=rank.displayName||rank.current.name;
  const rankDetail=next?`${progress}% vers ${next.name}`:'Rang maximal atteint';
  const recommendations=x.recs||[];
  return `<section class="card today-actions-card today-watch-card rank-${esc(rank.current.id)}"><div class="section-head"><div><div class="kicker">Progression</div><h2>À surveiller</h2></div>${recommendations.length?`<span class="pill">${recommendations.length}</span>`:''}</div><button class="today-watch-rank" type="button" data-view="skills"><span class="today-watch-rank-icon">${uiIcon('award')}</span><div class="today-watch-rank-copy"><small>Rang actuel</small><strong>${esc(rankLabel)}</strong><span>${esc(rankDetail)}</span></div><div class="today-watch-rank-progress" aria-label="${progress}% vers le prochain rang"><i style="width:${next?progress:100}%"></i></div><b>Voir →</b></button>${recommendations.length?`<div class="progress-watch-list">${recommendations.map(r=>`<button class="progress-watch-item today-progress-link" data-today-progress="performance"><span class="progress-watch-icon">↗</span><div><strong>${esc(r.current.name)} → ${esc(r.next.name)}</strong><small>${esc(r.reason||'Progression disponible')}</small></div><b>Voir →</b></button>`).join('')}</div>`:''}</section>`;
};
function removeFirstSectionByClass(html,className){
  const rx=new RegExp(`<section[^>]*class="[^"]*${className}[^"]*"[^>]*>[\\s\\S]*?<\\/section>`);
  return html.replace(rx,'');
}
function replaceFirstSectionByClass(html,className,replacement){
  const rx=new RegExp(`<section[^>]*class="[^"]*${className}[^"]*"[^>]*>[\\s\\S]*?<\\/section>`);
  return html.replace(rx,replacement);
}
function insertAfterHeroSection(html,fragment){
  const heroMarker='<section id="todayWorkoutHero" class="card hero';
  const start=html.indexOf(heroMarker);
  if(start<0)return html;
  const end=html.indexOf('</section>',start);
  if(end<0)return html;
  return html.slice(0,end+10)+fragment+html.slice(end+10);
}

const _renderTodayV10120=renderToday;
renderToday=function(){
  let html=_renderTodayV10120();
  html=html.replace('<section class="card hero','<section id="todayWorkoutHero" class="card hero');
  html=removeFirstSectionByClass(html,'today-agenda');
  html=removeFirstSectionByClass(html,'today-core-timer');
  html=removeFirstSectionByClass(html,'today-cockpit today-primary-actions today-primary-shortcuts');
  const agenda=renderTodayAgenda();
  if(agenda)html=insertAfterHeroSection(html,agenda);
  return html;
};

/* ========================================================================== */
/* KINETIK v10.121 · Step 7 · Direct Daily Task Actions                       */
/* A Today task now opens or starts the exact workflow it represents.          */
/* ========================================================================== */
function v10121TaskById(id){
  const engine=window.KinetikDailyTasks;
  if(!engine?.getAgendaTasks)return null;
  return engine.getAgendaTasks({includeDone:true}).find(task=>String(task.id)===String(id))||null;
}
function v10121FocusDirectTarget(action){
  const focusTarget=()=>{
    let el=null;
    const metric=action?.payload?.metric;
    if(metric==='weight'||metric==='waist')el=document.querySelector(`[data-body-key="${metric}"]`);
    else if(metric==='photos')el=document.getElementById('bodyPhotoFront');
    if(!el)return false;
    try{el.classList?.add('direct-task-target');el.scrollIntoView?.({behavior:'smooth',block:'center'});el.focus?.({preventScroll:true});}catch(_){try{el.focus?.();}catch(__){}}
    return true;
  };
  if(!focusTarget()&&typeof requestAnimationFrame==='function')requestAnimationFrame(focusTarget);
}
function v10121OpenMobilityAssessment(action){
  const zoneId=action?.payload?.zoneId||null,testId=action?.payload?.testId||null;
  state.view='flexibility';
  if(zoneId)state.mobilityChartZone=zoneId;
  render();
  const focusAssessment=()=>{
    const root=document.getElementById('mobilityAssessment');
    if(root){root.open=true;root.scrollIntoView?.({behavior:'smooth',block:'start'});}
    const input=testId?document.getElementById(`mob_${testId}`):null;
    if(input){const group=input.closest?.('details.mob-test-group');if(group)group.open=true;input.classList?.add('direct-task-target');input.scrollIntoView?.({behavior:'smooth',block:'center'});try{input.focus?.({preventScroll:true});}catch(_){input.focus?.();}}
    return !!(root||input);
  };
  if(!focusAssessment()&&typeof requestAnimationFrame==='function')requestAnimationFrame(focusAssessment);
}
function executeTodayAgendaTask(task){
  if(!task?.action)return false;
  const action=task.action,payload=action.payload||{};
  if(action.type==='workout-start'){
    requestWorkoutStart(Number(payload.day??task.metadata?.day??todayDay()));
    return true;
  }
  if(action.type==='planned-event'){
    if(!action.id)return false;
    state.activityDraftPlanId=action.id;state.activityEditId=null;state.activityEditor=true;render();
    return true;
  }
  if(action.type==='measurement-entry'){
    state.view='measurements';state.bodyEditor=true;state.bodyEditorMode=payload.mode==='full'?'full':'quick';state.bodyDirectTarget=payload.metric||null;render();v10121FocusDirectTarget(action);
    return true;
  }
  if(action.type==='assessment-start'){
    state.view='assessment';state.assessmentEditor=payload.protocolId||null;render();
    return true;
  }
  if(action.type==='mobility-routine'){
    if(payload.routineId&&typeof startFlexRoutine==='function'){startFlexRoutine(payload.routineId);return true;}
    state.view='flexibility';render();return true;
  }
  if(action.type==='mobility-assessment'){
    v10121OpenMobilityAssessment(action);return true;
  }
  if(action.type==='view'&&action.view){state.view=action.view;state.selectedHistoryId=null;render();return true;}
  return false;
}
function executeTodayAgendaTaskById(id){const task=v10121TaskById(id);return task?executeTodayAgendaTask(task):false;}
window.executeTodayAgendaTask=executeTodayAgendaTask;
window.executeTodayAgendaTaskById=executeTodayAgendaTaskById;

todayAgendaAction=function(task){
  if(!task?.action||task.status==='done')return '';
  const label=task.action.label||'Ouvrir';
  if(task.status==='upcoming')return '';
  return `<button class="today-agenda-action direct" type="button" data-daily-task-action="${esc(task.id)}">${esc(label)} →</button>`;
};

const _bindEventsV10121=bindEvents;
bindEvents=function(){
  _bindEventsV10121();
  document.querySelectorAll('[data-daily-task-action]').forEach(button=>button.onclick=()=>executeTodayAgendaTaskById(button.dataset.dailyTaskAction));
};

/* ========================================================================== */
/* KINETIK v10.122 · Step 8 · Explicit Daily Task Decisions                  */
/* Manual completion, postponement and ignore are kept separate from sport   */
/* history. A decision changes the agenda occurrence, never domain data.      */
/* ========================================================================== */
function v10122DecisionDateLabel(key){
  try{const [y,m,d]=String(key||'').split('-').map(Number);return new Date(y,m-1,d,12).toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'});}catch(_){return String(key||'');}
}
function v10122DecisionMenu(task){
  if(!task||!['pending','blocked'].includes(task.status))return '';
  const engine=window.KinetikDailyTasks,tomorrow=engine?.addDaysKey?engine.addDaysKey(localDateKey(),1):localDateKey(new Date(Date.now()+86400000));
  return `<details class="today-agenda-task-menu">
    <summary aria-label="Plus d’options pour ${esc(task.title)}" title="Plus d’options">•••</summary>
    <div class="today-agenda-task-menu-pop" role="group" aria-label="Modifier cette occurrence">
      <button type="button" data-daily-task-decision="done" data-daily-task-id="${esc(task.id)}"><b>✓</b><span><strong>Marquer fait</strong><small>Valide l’agenda sans créer de performance.</small></span></button>
      <button type="button" data-daily-task-decision="postponed" data-daily-task-id="${esc(task.id)}" data-defer-to="${tomorrow}"><b>↷</b><span><strong>Reporter à demain</strong><small>${esc(v10122DecisionDateLabel(tomorrow))}</small></span></button>
      <div class="today-agenda-postpone-custom"><input type="date" min="${tomorrow}" value="${tomorrow}" data-daily-task-postpone-date aria-label="Nouvelle date"/><button type="button" data-daily-task-postpone-custom="${esc(task.id)}">Reporter</button></div>
      <button type="button" class="is-muted" data-daily-task-decision="ignored" data-daily-task-id="${esc(task.id)}"><b>×</b><span><strong>Ignorer aujourd’hui</strong><small>Masque seulement cette occurrence.</small></span></button>
    </div>
  </details>`;
}
function v10122TaskControls(task){
  const direct=todayAgendaAction(task),menu=v10122DecisionMenu(task);
  return direct||menu?`<div class="today-agenda-task-controls">${direct}${menu}</div>`:'';
}
renderTodayAgendaTask=function(task){
  const meta=todayAgendaTaskMeta(task),high=Number(task.priority||0)>=80;
  const deferred=task?.metadata?.deferredFrom?`<em>Reporté du ${esc(v10122DecisionDateLabel(task.metadata.deferredFrom))}</em>`:'';
  return `<article class="today-agenda-task kind-${esc(task.kind)} ${high?'is-priority':''} ${task.metadata?.deferredFrom?'is-deferred':''}">
    <span class="today-agenda-task-icon" aria-hidden="true">${meta.icon}</span>
    <div class="today-agenda-task-copy"><div class="today-agenda-task-meta"><span>${esc(meta.label)}</span>${high?'<b>Prioritaire</b>':''}${deferred}</div><strong>${esc(task.title)}</strong>${task.detail?`<small>${esc(task.detail)}</small>`:''}</div>
    ${v10122TaskControls(task)}
  </article>`;
};
function v10122AdjustedTaskRow(task){
  const meta=todayAgendaTaskMeta(task),postponed=task.status==='postponed',decisionId=task.metadata?.decisionId||task.id;
  const status=postponed?`Reporté · ${v10122DecisionDateLabel(task.metadata?.deferTo)}`:'Ignoré aujourd’hui';
  return `<div class="today-agenda-adjusted-row"><span>${meta.icon}</span><div><strong>${esc(task.title)}</strong><small>${esc(status)}</small></div><button type="button" data-daily-task-clear="${esc(task.id)}">Annuler</button></div>`;
}
renderTodayAgenda=function(){
  const engine=window.KinetikDailyTasks;
  if(!engine?.getAgendaTasks||!engine?.agendaSummary)return '';
  const prefs=engine.getReminderPreferences?engine.getReminderPreferences():{enabled:true};
  if(prefs?.enabled===false){
    return `<section class="card today-agenda today-agenda-disabled"><div class="today-agenda-head"><div><div class="kicker">Aujourd'hui</div><h2>Priorités masquées</h2><p>Les rappels sont désactivés dans tes réglages.</p></div><button class="btn btn-outline compact" data-view="settings">Réactiver</button></div></section>`;
  }
  const tasks=engine.getAgendaTasks({includeDone:true}),summary=engine.agendaSummary(tasks);
  const pending=tasks.filter(t=>t.status==='pending'||t.status==='blocked');
  const done=tasks.filter(t=>t.status==='done');
  const adjusted=tasks.filter(t=>t.status==='postponed'||t.status==='ignored');
  const upcoming=tasks.filter(t=>t.status==='upcoming');
  const onlyAdjusted=summary.pending===0&&summary.done===0&&summary.adjusted>0;
  const title=onlyAdjusted?'Journée ajustée':summary.complete?'Journée validée':summary.empty?'Rien d’obligatoire':'À faire aujourd’hui';
  const subtitle=onlyAdjusted
    ? `${summary.adjusted} tâche${summary.adjusted>1?'s':''} reportée${summary.adjusted>1?'s':''} ou ignorée${summary.adjusted>1?'s':''}.`
    : summary.complete
      ? `${summary.done} tâche${summary.done>1?'s':''} terminée${summary.done>1?'s':''}${summary.adjusted?` · ${summary.adjusted} ajustée${summary.adjusted>1?'s':''}`:''}.`
      : summary.empty
        ? 'Aucune priorité due pour le moment.'
        : `${summary.pending} tâche${summary.pending>1?'s':''} restante${summary.pending>1?'s':''} · ${summary.done}/${summary.total} terminée${summary.done>1?'s':''}${summary.adjusted?` · ${summary.adjusted} ajustée${summary.adjusted>1?'s':''}`:''}`;
  return `<section class="card today-agenda ${summary.complete?'is-complete':''} ${onlyAdjusted?'is-adjusted':''}">
    <div class="today-agenda-head">
      <div><div class="kicker">Parcours du jour</div><h2>${title}</h2><p>${subtitle}</p></div>
      <div class="today-agenda-score" aria-label="${summary.percent}% terminé"><strong>${summary.percent}%</strong><span>${summary.done}/${summary.total||0}</span></div>
    </div>
    <div class="today-agenda-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${summary.percent}"><i style="width:${summary.percent}%"></i></div>
    ${pending.length?`<div class="today-agenda-list">${pending.map(renderTodayAgendaTask).join('')}</div>`:summary.complete?`<div class="today-agenda-complete"><span>${onlyAdjusted?'↷':'✓'}</span><div><strong>${onlyAdjusted?'Agenda traité pour aujourd’hui':'Tout est fait pour aujourd’hui'}</strong><small>${onlyAdjusted?'Les occurrences ajustées restent annulables ci-dessous.':'Les tâches terminées sont automatiquement retirées de la liste active.'}</small></div></div>`:'<div class="today-agenda-empty"><span>✓</span><div><strong>Agenda libre</strong><small>Tu peux t’entraîner librement ou simplement récupérer.</small></div></div>'}
    ${done.length?`<details class="today-agenda-done"><summary><span>✓ ${done.length} terminée${done.length>1?'s':''} aujourd’hui</span><b>⌄</b></summary><div>${done.map(t=>`<span>${todayAgendaTaskMeta(t).icon} ${esc(t.title.replace(/\s*·\s*fait$/i,''))}${t.metadata?.manualCompletion?' · manuel':''}</span>`).join('')}</div></details>`:''}
    ${adjusted.length?`<details class="today-agenda-adjusted"><summary><span>↷ ${adjusted.length} ajustée${adjusted.length>1?'s':''} aujourd’hui</span><b>⌄</b></summary><div>${adjusted.map(v10122AdjustedTaskRow).join('')}</div></details>`:''}
    ${upcoming.length?`<div class="today-agenda-upcoming"><div><span>Bientôt</span><small>Ne compte pas dans la progression du jour</small></div>${upcoming.slice(0,3).map(t=>`<span><b>${esc(t.title)}</b><small>${esc(t.detail)}</small></span>`).join('')}</div>`:''}
  </section>`;
};
function setTodayTaskDecision(id,status,options={}){
  const engine=window.KinetikDailyTasks;if(!engine?.setTaskDecision)return false;
  const row=engine.setTaskDecision(id,status,options);if(!row)return false;render();return true;
}
function clearTodayTaskDecision(id){const engine=window.KinetikDailyTasks;if(!engine?.clearTaskDecision)return false;const ok=engine.clearTaskDecision(id);if(ok)render();return ok;}
window.setTodayTaskDecision=setTodayTaskDecision;window.clearTodayTaskDecision=clearTodayTaskDecision;

const _bindEventsV10122=bindEvents;
bindEvents=function(){
  _bindEventsV10122();
  document.querySelectorAll('[data-daily-task-decision]').forEach(button=>button.onclick=e=>{e.preventDefault();e.stopPropagation();setTodayTaskDecision(button.dataset.dailyTaskId,button.dataset.dailyTaskDecision,{deferTo:button.dataset.deferTo||null});});
  document.querySelectorAll('[data-daily-task-postpone-custom]').forEach(button=>button.onclick=e=>{e.preventDefault();e.stopPropagation();const root=button.closest?.('.today-agenda-task-menu-pop'),input=root?.querySelector?.('[data-daily-task-postpone-date]');if(input?.value)setTodayTaskDecision(button.dataset.dailyTaskPostponeCustom,'postponed',{deferTo:input.value});});
  document.querySelectorAll('[data-daily-task-clear]').forEach(button=>button.onclick=()=>clearTodayTaskDecision(button.dataset.dailyTaskClear));
};

function renderDailyTaskDecisionHistory(){
  const engine=window.KinetikDailyTasks;if(!engine?.getTaskDecisions)return '';
  const rows=engine.getTaskDecisions({now:new Date()}).slice().sort((a,b)=>new Date(b.decidedAt)-new Date(a.decidedAt)).slice(0,12);
  const label=row=>row.state==='done'?'Marqué fait':row.state==='postponed'?`Reporté au ${v10122DecisionDateLabel(row.deferTo)}`:'Ignoré';
  const when=row=>{try{return new Date(row.decidedAt).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'});}catch(_){return ''}};
  return `<div class="reminder-settings-block daily-decision-history"><div class="reminder-settings-title"><strong>Historique des décisions</strong><span>Conservé 180 jours · séparé des performances</span></div>${rows.length?`<div class="daily-decision-history-list">${rows.map(row=>`<div><span>${row.state==='done'?'✓':row.state==='postponed'?'↷':'×'}</span><div><strong>${esc(row.snapshot?.title||'Tâche')}</strong><small>${esc(label(row))} · ${esc(when(row))}</small></div></div>`).join('')}</div>`:'<p class="reminder-local-note">Aucune décision manuelle enregistrée pour le moment.</p>'}</div>`;
}
const _renderReminderSettingsV10122=renderReminderSettings;
renderReminderSettings=function(){const html=_renderReminderSettingsV10122();const history=renderDailyTaskDecisionHistory();return history?html.replace('</section>',history+'</section>'):html;};

/* ========================================================================== */
/* KINETIK v10.123 · Step 9 · Individual assessment freshness                 */
/* Each performance protocol owns its cadence and due date. Completing one    */
/* protocol never refreshes the others.                                        */
/* ========================================================================== */
const V10123_PROTOCOL_FRESHNESS_DAYS = Object.freeze({
  pullups:42,
  dips:42,
  dead_hang:42,
  towel_hang:56,
  one_arm_assisted_hang:56,
  chest_to_bar:42,
  muscle_up:56,
  handstand_free:42,
  l_sit:42,
  front_lever:56,
  human_flag:56,
  hspu_free:56,
  toes_to_bar:42,
  cooper12:56,
  run5k:56
});
function protocolFreshnessDays(protocol){
  return Math.max(14,Math.min(180,Number(V10123_PROTOCOL_FRESHNESS_DAYS[protocol?.id]||42)));
}
function v10123LegacyProtocolReferences(protocol){
  if(!protocol||protocol.kind!=='test'||!protocol.testId)return [];
  return getTests().filter(row=>row.testId===protocol.testId&&(row.source==null||row.source===''||row.source==='kinetik')).map(row=>({
    id:row.id,date:row.date,protocolId:protocol.id,evidenceLevel:3,source:row.source||'legacy-periodic',legacy:true
  }));
}
protocolLastValidated=function(protocol){
  if(!protocol)return null;
  const assessmentRows=getAssessments().filter(row=>row.protocolId===protocol.id&&Number(row.evidenceLevel)>=3);
  const rows=[...assessmentRows,...v10123LegacyProtocolReferences(protocol)].filter(row=>row?.date&&!Number.isNaN(new Date(row.date).getTime())).sort((a,b)=>new Date(b.date)-new Date(a.date));
  return rows[0]||null;
};
function protocolFreshness(protocol,now=new Date()){
  const currentNow=now instanceof Date?now:new Date(now||Date.now()),freshnessDays=protocolFreshnessDays(protocol),last=protocolLastValidated(protocol);
  if(!last){
    return {state:'never',due:true,validatedToday:false,freshnessDays,lastDate:null,dueDate:null,daysUntil:0,overdueDays:0};
  }
  const lastMs=new Date(last.date).getTime(),dueMs=lastMs+freshnessDays*86400000,diff=(dueMs-currentNow.getTime())/86400000;
  const daysUntil=Math.max(0,Math.ceil(diff)),overdueDays=diff<=0?Math.max(0,Math.floor(-diff)+1):0;
  const key=value=>{try{return typeof localDateKey==='function'?localDateKey(value):new Date(value).toISOString().slice(0,10);}catch(_){return'';}};
  const validatedToday=key(last.date)===key(currentNow);
  return {
    state:validatedToday?'fresh':diff<=0?'due':'fresh',
    due:!validatedToday&&diff<=0,
    validatedToday,
    freshnessDays,
    lastDate:last.date,
    dueDate:new Date(dueMs).toISOString(),
    daysUntil:validatedToday?freshnessDays:daysUntil,
    overdueDays:validatedToday?0:overdueDays,
    source:last.source||null,
    legacy:!!last.legacy
  };
}
function v10123ProtocolReminderPriority(protocol,freshness){
  const goal=Math.max(0,Number(typeof protocolGoalWeight==='function'?protocolGoalWeight(protocol):0))*2;
  const evidence=Math.max(0,Number(typeof protocolEvidence==='function'?protocolEvidence(protocol):0));
  const evidenceNeed=evidence<2?3:evidence<3?1:0;
  const never=freshness?.state==='never'?4:0;
  const overdue=Math.min(5,Math.ceil(Number(freshness?.overdueDays||0)/14));
  return Math.min(15,goal+evidenceNeed+never+overdue);
}
function assessmentProtocolStatuses(now=new Date()){
  return ASSESSMENT_PROTOCOLS.map(protocol=>{
    const freshness=protocolFreshness(protocol,now),current=protocolCurrent(protocol);
    return {...protocol,current,evidence:protocolEvidence(protocol),freshness,reminderPriority:v10123ProtocolReminderPriority(protocol,freshness)};
  });
}
protocolDue=function(protocol){return protocolFreshness(protocol,new Date()).due;};
testDueSummary=function(now=new Date()){
  const rows=assessmentProtocolStatuses(now),due=rows.filter(row=>row.freshness.due).sort((a,b)=>b.reminderPriority-a.reminderPriority||b.freshness.overdueDays-a.freshness.overdueDays),fresh=rows.filter(row=>!row.freshness.due).sort((a,b)=>a.freshness.daysUntil-b.freshness.daysUntil);
  if(due.length){
    const next=due[0];
    return {overdue:true,label:`${next.name} à ${next.freshness.state==='never'?'confirmer':'re-tester'}`,dueCount:due.length,protocolId:next.id,days:0};
  }
  const next=fresh[0];
  if(!next)return{overdue:false,label:'Batterie à jour',dueCount:0,protocolId:null,days:null};
  return {overdue:false,label:`prochain re-test dans ${next.freshness.daysUntil} j`,dueCount:0,protocolId:next.id,days:next.freshness.daysUntil};
};

/* The full assessment library now exposes each protocol's own freshness. */
renderAssessmentProtocolRow=function(protocol){
  const current=protocolCurrent(protocol),verified=typeof v1089VerifiedBenchmark==='function'?v1089VerifiedBenchmark(protocol):null,freshness=protocolFreshness(protocol,new Date());
  const status=freshness.validatedToday
    ? 'Validé aujourd’hui'
    : freshness.state==='never'
      ? `À confirmer · cadence ${freshness.freshnessDays} j`
      : freshness.due
        ? `À re-tester${freshness.overdueDays?` · +${freshness.overdueDays} j`:''}`
        : `À jour · re-test dans ${freshness.daysUntil} j`;
  const tone=freshness.validatedToday?'done':freshness.due||freshness.state==='never'?'due':'fresh';
  return `<div class="assessment-protocol-row assessment94-protocol-row assessment123-protocol-row">
    <div class="assessment-row-main">
      <strong>${esc(protocol.name)}</strong>
      <span>${current.value?`${current.value} ${protocol.unit}${verified?` · confirmé ${verified.value} ${protocol.unit}`:''}`:'Pas encore mesuré'}</span>
      <small class="assessment123-freshness is-${tone}">${esc(status)}</small>
    </div>
    <button class="assessment-start" data-assessment-start="${protocol.id}">${current.value?'Retester':'Tester'} →</button>
  </div>`;
};

/* Expose read-only helpers for the Daily Tasks module and diagnostics. */
window.assessmentProtocolStatuses=assessmentProtocolStatuses;
window.protocolFreshness=protocolFreshness;
window.protocolFreshnessDays=protocolFreshnessDays;


/* ========================================================================== */
/* KINETIK v10.124 · Step 10 · Local intelligent notifications               */
/* P1 activates the preferred-time reminder while the PWA runtime is alive.   */
/* Reliable closed-app scheduling remains explicitly reserved for Web Push.   */
/* ========================================================================== */
const V10124_LOCAL_REMINDER_DEFAULTS=Object.freeze({
  localNotifications:false,
  notificationDetail:'discreet',
  snoozeMinutes:30,
  workoutFollowup:true,
  workoutFollowupDelay:120
});
const _getReminderPrefsV10124=getReminderPrefs;
getReminderPrefs=function(){
  const base=_getReminderPrefsV10124(),raw=parse(STORAGE.reminders,{});
  const snooze=[15,30,60,120].includes(Number(raw.snoozeMinutes))?Number(raw.snoozeMinutes):V10124_LOCAL_REMINDER_DEFAULTS.snoozeMinutes;
  const followDelay=[60,120,180,240].includes(Number(raw.workoutFollowupDelay))?Number(raw.workoutFollowupDelay):V10124_LOCAL_REMINDER_DEFAULTS.workoutFollowupDelay;
  return {...base,version:3,
    localNotifications:raw.localNotifications===true,
    notificationDetail:raw.notificationDetail==='detailed'?'detailed':'discreet',
    snoozeMinutes:snooze,
    workoutFollowup:raw.workoutFollowup!==false,
    workoutFollowupDelay:followDelay
  };
};
setReminderPrefs=function(v){
  const next={...getReminderPrefs(),...(v||{}),version:3};
  next.upcomingDays=clamp(Math.round(Number(next.upcomingDays||REMINDER_DEFAULTS.upcomingDays)),1,14);
  next.preferredMoment=['morning','afternoon','evening','custom'].includes(next.preferredMoment)?next.preferredMoment:REMINDER_DEFAULTS.preferredMoment;
  next.preferredTime=normalizeReminderTime(next.preferredTime,reminderMomentTime(next.preferredMoment)||REMINDER_DEFAULTS.preferredTime);
  next.visibility=['due-only','due-and-soon'].includes(next.visibility)?next.visibility:REMINDER_DEFAULTS.visibility;
  next.localNotifications=next.localNotifications===true;
  next.notificationDetail=next.notificationDetail==='detailed'?'detailed':'discreet';
  next.snoozeMinutes=[15,30,60,120].includes(Number(next.snoozeMinutes))?Number(next.snoozeMinutes):V10124_LOCAL_REMINDER_DEFAULTS.snoozeMinutes;
  next.workoutFollowup=next.workoutFollowup!==false;
  next.workoutFollowupDelay=[60,120,180,240].includes(Number(next.workoutFollowupDelay))?Number(next.workoutFollowupDelay):V10124_LOCAL_REMINDER_DEFAULTS.workoutFollowupDelay;
  save(STORAGE.reminders,next);
  try{queueMicrotask(()=>window.KinetikLocalReminders?.refresh?.());}catch(_){try{setTimeout(()=>window.KinetikLocalReminders?.refresh?.(),0);}catch(__){}}
  return next;
};
function v10124NotificationFallbackStatus(){
  const supported=typeof Notification!=='undefined'&&'serviceWorker' in navigator,permission=typeof Notification!=='undefined'?(Notification.permission||'default'):'unsupported';
  const standalone=!!(window.matchMedia?.('(display-mode: standalone)')?.matches||navigator.standalone);
  const ios=/iPad|iPhone|iPod/.test(String(navigator.userAgent||''));
  return {supported:supported&&!(ios&&!standalone),permission,standalone,requiresInstall:ios&&!standalone,nextLabel:null};
}
function v10124NotificationStatus(){return window.KinetikLocalReminders?.getStatus?.()||v10124NotificationFallbackStatus();}
function v10124PermissionLabel(status){
  if(status.requiresInstall)return ['À installer','Installe KINETIK sur l’écran d’accueil pour autoriser les notifications sur iPhone.'];
  if(!status.supported)return ['Indisponible','Ce navigateur ne permet pas les notifications locales KINETIK.'];
  if(status.permission==='granted')return ['Autorisées','Cet appareil peut afficher les rappels locaux.'];
  if(status.permission==='denied')return ['Refusées','L’autorisation a été refusée. Elle doit être réactivée depuis les réglages du navigateur ou de l’appareil.'];
  return ['À activer','KINETIK demandera l’autorisation uniquement après ton clic.'];
}
function renderLocalNotificationSettings(){
  const p=getReminderPrefs(),status=v10124NotificationStatus(),[badge,note]=v10124PermissionLabel(status),granted=status.permission==='granted',enabled=granted&&p.localNotifications;
  const next=status.nextLabel?`<div class="local-notification-next"><span>Prochaine échéance locale</span><strong>${esc(status.nextLabel)}</strong></div>`:'';
  return `<div class="reminder-settings-block local-notification-settings"><div class="reminder-settings-title"><strong>Notifications locales</strong><span>Heure préférée, snooze et relance de séance</span></div>
    <div class="local-notification-status"><div><span class="local-notification-dot ${granted?'is-on':status.permission==='denied'?'is-off':'is-idle'}"></span><div><strong>${esc(badge)}</strong><small>${esc(note)}</small></div></div><span class="pill">P1 local</span></div>
    ${status.requiresInstall?`<p class="reminder-local-note">Sur iPhone/iPad, ajoute d’abord KINETIK à l’écran d’accueil puis ouvre la PWA installée avant d’activer les notifications.</p>`:''}
    ${status.supported&&status.permission==='default'?`<button type="button" class="btn btn-primary local-notification-request" id="requestLocalNotifications">Activer les notifications</button>`:''}
    ${status.permission==='denied'?`<p class="reminder-local-note">KINETIK ne peut pas redemander automatiquement une autorisation refusée. Réactive les notifications dans les réglages du navigateur/appareil puis recharge l’application.</p>`:''}
    ${granted?`<div class="switchline local-notification-master"><div><strong>Rappels locaux sur cet appareil</strong><div class="small muted">Utilise l’heure préférée définie juste au-dessus.</div></div><input id="localNotificationsEnabled" type="checkbox" ${enabled?'checked':''}></div>
      <div class="reminder-preference-grid local-notification-grid"><label><span>Snooze par défaut</span><select id="localReminderSnooze">${[[15,'15 min'],[30,'30 min'],[60,'1 h'],[120,'2 h']].map(([v,l])=>`<option value="${v}" ${p.snoozeMinutes===v?'selected':''}>${l}</option>`).join('')}</select></label><label><span>Relance séance</span><select id="localWorkoutFollowupDelay" ${p.workoutFollowup?'':'disabled'}>${[[60,'1 h'],[120,'2 h'],[180,'3 h'],[240,'4 h']].map(([v,l])=>`<option value="${v}" ${p.workoutFollowupDelay===v?'selected':''}>${l} après le rappel</option>`).join('')}</select></label></div>
      <div class="switchline"><div><strong>Relancer une séance encore à faire</strong><div class="small muted">Au plus tôt à 18:00 et jamais après 21:30.</div></div><input id="localWorkoutFollowup" type="checkbox" ${p.workoutFollowup?'checked':''}></div>
      <div class="switchline"><div><strong>Détails sur l’écran verrouillé</strong><div class="small muted">Désactivé par défaut : le contenu reste discret et n’affiche pas les noms de tes tâches.</div></div><input id="localNotificationDetail" type="checkbox" ${p.notificationDetail==='detailed'?'checked':''}></div>
      <div class="local-notification-actions"><button type="button" class="btn btn-outline compact" id="testLocalNotification">Tester une notification</button>${next}</div>`:''}
    <p class="reminder-local-note local-notification-limit"><strong>Limite P1 :</strong> ces rappels sont planifiés localement tant que KINETIK reste en cours d’exécution. iOS/Android peuvent suspendre une PWA fermée ou longtemps en arrière-plan. La livraison garantie app fermée sera ajoutée en P2 avec Web Push + planification serveur.</p>
  </div>`;
}
const _renderReminderSettingsV10124=renderReminderSettings;
renderReminderSettings=function(){
  let html=_renderReminderSettingsV10124();
  html=html.replace('KINETIK utilise ces préférences pour filtrer ce qui mérite ton attention lorsque tu ouvres l’app. Elles ne déclenchent pas encore de notification système lorsque l’iPhone est verrouillé.','KINETIK utilise ces préférences pour filtrer ton parcours quotidien et, si tu les actives ci-dessous, déclencher des rappels locaux tant que la PWA reste en cours d’exécution.');
  html=html.replace('Préférence enregistrée pour la future couche de notifications','Heure utilisée par les rappels locaux de cet appareil');
  html=html.replace('Pour l’instant, une tâche due reste visible dans l’app quelle que soit l’heure. Cette préférence sera réutilisée par la couche de notifications sans devoir te la redemander.','Une tâche due reste visible dans l’app quelle que soit l’heure. Si les notifications locales sont activées, cette heure sert de déclencheur principal.');
  const block=renderLocalNotificationSettings(),historyMarker='<div class="reminder-settings-block daily-decision-history">';
  if(html.includes(historyMarker))return html.replace(historyMarker,block+historyMarker);
  return html.replace(/<\/section>\s*$/,block+'</section>');
};
function openTodayAgendaFromReminder(taskId=null){
  state.view='today';state.selectedHistoryId=null;render();
  const focus=()=>{
    const selector=taskId?`[data-daily-task-card="${String(taskId).replace(/"/g,'\\"')}"]`:'.today-agenda';
    const target=document.querySelector(selector)||document.querySelector('.today-agenda');
    if(!target)return false;
    target.classList?.add('local-reminder-target');target.scrollIntoView?.({behavior:'smooth',block:'start'});
    if(taskId)setTimeout(()=>target.classList?.remove('local-reminder-target'),1800);
    return true;
  };
  if(!focus()&&typeof requestAnimationFrame==='function')requestAnimationFrame(focus);
  return true;
}
window.openTodayAgendaFromReminder=openTodayAgendaFromReminder;
const _renderTodayAgendaTaskV10124=renderTodayAgendaTask;
renderTodayAgendaTask=function(task){
  const html=_renderTodayAgendaTaskV10124(task);
  return html.replace('<article class="today-agenda-task',`<article data-daily-task-card="${esc(task.id)}" class="today-agenda-task`);
};
const _bindEventsV10124=bindEvents;
bindEvents=function(){
  _bindEventsV10124();
  const manager=window.KinetikLocalReminders;
  const request=document.getElementById('requestLocalNotifications');if(request)request.onclick=async()=>{await manager?.requestPermission?.();render();};
  const enabled=document.getElementById('localNotificationsEnabled');if(enabled)enabled.onchange=async()=>{if(enabled.checked&&v10124NotificationStatus().permission!=='granted'){await manager?.requestPermission?.();}else if(manager?.setEnabled){manager.setEnabled(enabled.checked);}else{setReminderPrefs({...getReminderPrefs(),localNotifications:enabled.checked});}render();};
  const snooze=document.getElementById('localReminderSnooze');if(snooze)snooze.onchange=()=>{setReminderPrefs({...getReminderPrefs(),snoozeMinutes:Number(snooze.value||30)});render();};
  const follow=document.getElementById('localWorkoutFollowup');if(follow)follow.onchange=()=>{setReminderPrefs({...getReminderPrefs(),workoutFollowup:follow.checked});render();};
  const delay=document.getElementById('localWorkoutFollowupDelay');if(delay)delay.onchange=()=>{setReminderPrefs({...getReminderPrefs(),workoutFollowupDelay:Number(delay.value||120)});render();};
  const details=document.getElementById('localNotificationDetail');if(details)details.onchange=()=>{setReminderPrefs({...getReminderPrefs(),notificationDetail:details.checked?'detailed':'discreet'});render();};
  const test=document.getElementById('testLocalNotification');if(test)test.onclick=async()=>{const ok=await manager?.testNotification?.();if(!ok)alert('Notification de test impossible sur cet appareil.');};
};

/* ========================================================================== */
/* KINETIK v10.125 · Step 11 · Reliable Web Push                             */
/* P2 subscribes the installed PWA to standards-based Push API delivery and  */
/* synchronizes a minimal reminder manifest to the server scheduler.          */
/* ========================================================================== */
function v10125WebPushStatus(){
  return window.KinetikWebPush?.getStatus?.()||{configured:false,configLoaded:false,active:false,enabled:false,subscribed:false,permission:typeof Notification!=='undefined'?(Notification.permission||'default'):'unsupported',supported:false,requiresInstall:false,lastSyncAt:null,lastManifestDays:0,timezone:null,lastError:null};
}
function v10125WebPushBadge(status){
  if(status.requiresInstall)return ['À installer','Ajoute KINETIK à l’écran d’accueil puis ouvre la PWA installée.'];
  if(!status.configLoaded)return ['Vérification…','KINETIK vérifie la configuration Web Push du serveur.'];
  if(!status.configured)return ['Backend à configurer','Ajoute les variables VAPID, Redis et QStash indiquées dans P2_SETUP.md.'];
  if(status.permission==='denied')return ['Refusées','Les notifications sont bloquées dans les réglages de cet appareil.'];
  if(!status.supported)return ['Indisponible','Push API ou Service Worker indisponible sur ce navigateur.'];
  if(status.active)return ['Actif','Les rappels sont planifiés côté serveur et peuvent arriver PWA fermée.'];
  return ['Prêt','Active Web Push sur cet appareil pour recevoir les rappels PWA fermée.'];
}
function renderWebPushSettings(){
  const status=v10125WebPushStatus(),[badge,note]=v10125WebPushBadge(status),active=!!status.active;
  const synced=status.lastSyncAt?new Date(status.lastSyncAt).toLocaleString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):null;
  return `<div class="reminder-settings-block web-push-settings ${active?'is-active':''}"><div class="reminder-settings-title"><strong>Notifications fiables</strong><span>Web Push · même lorsque KINETIK est fermé</span></div>
    <div class="local-notification-status"><div><span class="local-notification-dot ${active?'is-on':status.permission==='denied'?'is-off':'is-idle'}"></span><div><strong>${esc(badge)}</strong><small>${esc(note)}</small></div></div><span class="pill">P2 Web Push</span></div>
    ${status.configured&&status.supported&&status.permission!=='denied'&&!active?`<button type="button" class="btn btn-primary local-notification-request" id="activateWebPush">Activer Web Push</button>`:''}
    ${active?`<div class="web-push-summary"><div><span>Planification</span><strong>${status.lastManifestDays||0} jours synchronisés</strong></div><div><span>Fuseau</span><strong>${esc(status.timezone||'—')}</strong></div>${synced?`<div><span>Dernière synchro</span><strong>${esc(synced)}</strong></div>`:''}</div>
      <div class="local-notification-actions"><button type="button" class="btn btn-outline compact" id="testWebPush">Tester depuis le serveur</button><button type="button" class="btn btn-outline compact" id="syncWebPush">Synchroniser</button><button type="button" class="btn btn-ghost compact" id="disableWebPush">Désactiver</button></div>`:''}
    ${status.lastError?`<p class="reminder-local-note web-push-error"><strong>Dernière erreur :</strong> ${esc(status.lastError)}</p>`:''}
    <p class="reminder-local-note"><strong>Données serveur minimales :</strong> abonnement de cet appareil, fuseau horaire et calendrier de rappels. Les mensurations, photos, notes et performances restent locales. En mode discret, le serveur ne stocke pas le nom des tâches.</p>
    <p class="reminder-local-note"><strong>iPhone/iPad :</strong> Web Push fonctionne pour les web apps ajoutées à l’écran d’accueil et l’autorisation doit être demandée après une action de l’utilisateur.</p>
  </div>`;
}
const _renderReminderSettingsV10125=renderReminderSettings;
renderReminderSettings=function(){
  let html=_renderReminderSettingsV10125(),block=renderWebPushSettings(),marker='<div class="reminder-settings-block local-notification-settings">';
  if(html.includes(marker))html=html.replace(marker,block+marker);
  else html=html.replace(/<\/section>\s*$/,block+'</section>');
  html=html.replace('KINETIK utilise ces préférences pour filtrer ton parcours quotidien et, si tu les actives ci-dessous, déclencher des rappels locaux tant que la PWA reste en cours d’exécution.','KINETIK utilise ces préférences pour filtrer ton parcours quotidien. Web Push P2 peut délivrer les rappels même PWA fermée ; le mode local P1 reste disponible en fallback.');
  html=html.replace('Heure utilisée par les rappels locaux de cet appareil','Heure utilisée par les rappels locaux et Web Push');
  html=html.replace('<strong>Limite P1 :</strong> ces rappels sont planifiés localement tant que KINETIK reste en cours d’exécution. iOS/Android peuvent suspendre une PWA fermée ou longtemps en arrière-plan. La livraison garantie app fermée sera ajoutée en P2 avec Web Push + planification serveur.','<strong>Fallback P1 :</strong> ces rappels locaux dépendent du runtime. Lorsque Web Push P2 est actif, ce fallback est automatiquement mis en veille pour éviter les doublons.');
  if(v10125WebPushStatus().active)html=html.replace('<strong>Notifications locales</strong><span>Heure préférée, snooze et relance de séance</span>','<strong>Fallback local</strong><span>P1 reste silencieux tant que Web Push P2 est actif</span>');
  return html;
};
const _setReminderPrefsV10125=setReminderPrefs;
setReminderPrefs=function(v){const next=_setReminderPrefsV10125(v);try{window.KinetikWebPush?.scheduleSync?.();}catch(_){}return next;};
const _bindEventsV10125=bindEvents;
bindEvents=function(){
  _bindEventsV10125();
  const manager=window.KinetikWebPush;
  const activate=document.getElementById('activateWebPush');if(activate)activate.onclick=async()=>{activate.disabled=true;const ok=await manager?.activate?.();if(!ok&&!v10125WebPushStatus().configured)alert('Le backend Web Push doit d’abord être configuré sur Vercel.');render();};
  const disable=document.getElementById('disableWebPush');if(disable)disable.onclick=async()=>{await manager?.disable?.();render();};
  const sync=document.getElementById('syncWebPush');if(sync)sync.onclick=async()=>{sync.disabled=true;const ok=await manager?.sync?.();if(!ok)alert('Synchronisation Web Push impossible. Vérifie la configuration serveur.');render();};
  const test=document.getElementById('testWebPush');if(test)test.onclick=async()=>{test.disabled=true;const ok=await manager?.test?.();if(!ok)alert('Notification Web Push de test impossible.');test.disabled=false;};
  const clear=document.getElementById('clearAllData');if(clear)clear.onclick=async()=>{if(confirm('Effacer historique, tests, skills, mesures, rappels serveur et photos ?')){await manager?.disable?.({unsubscribeBrowser:true,render:false});Object.values(STORAGE).forEach(k=>localStorage.removeItem(k));await clearPhotos();render();}};
};

/* ========================================================================== */
/* KINETIK v10.126 · Step 12 · Notification health & current device          */
/* Adds explicit diagnostics/repair without introducing a cloud user account. */
/* ========================================================================== */
function v10126HealthDate(value){
  if(!value)return 'Jamais';
  const d=new Date(value);if(Number.isNaN(d.getTime()))return '—';
  return d.toLocaleString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
}
function v10126RepairLabel(reason){
  return ({permission_denied:'Notifications bloquées',subscription_missing:'Abonnement Push perdu',subscription_changed:'Abonnement Push modifié',vapid_key_changed:'Clé Push renouvelée',server_missing:'Appareil absent du serveur',device_auth_failed:'Identité appareil désynchronisée',account_device_revoked:'Appareil révoqué du compte',repair_failed:'Réparation incomplète'})[reason]||'Connexion Push à réparer';
}
function v10126ErrorLabel(code){
  return ({subscription_expired:'Abonnement expiré',push_auth_failed:'Authentification Push refusée',push_rate_limited:'Service Push temporairement limité',push_service_unavailable:'Service Push indisponible',push_timeout:'Délai Push dépassé',push_network_error:'Erreur réseau Push',delivery_failed:'Échec de remise',subscription_missing:'Abonnement Push perdu',vapid_key_changed:'Clé Push renouvelée',permission_denied:'Notifications bloquées',device_auth_failed:'Identité appareil désynchronisée',account_device_revoked:'Appareil révoqué du compte',server_missing:'Appareil absent du serveur'})[code]||String(code||'—').replace(/_/g,' ');
}
function v10126NotificationHealthBadge(status){
  const h=status.serverHealth||{};
  if(status.repairReason)return ['À réparer',v10126RepairLabel(status.repairReason),'is-repair'];
  if(Number(h.consecutiveFailures||0)>0||h.lastDeliveryError)return ['À surveiller',v10126ErrorLabel(h.lastDeliveryError),'is-warning'];
  if(status.active)return ['Opérationnel','Abonnement client et appareil serveur sont synchronisés.','is-healthy'];
  if(status.configured)return ['Prêt','Active Web Push pour commencer le suivi de santé.','is-idle'];
  return ['Indisponible','Le backend Web Push doit être configuré.','is-idle'];
}
function renderWebPushHealth(){
  const status=v10125WebPushStatus(),health=status.serverHealth||{},server=status.serverInfo||{},[badge,note,tone]=v10126NotificationHealthBadge(status),enabled=!!status.enabled;
  if(!status.configured&&!enabled)return '';
  const schedules=server.schedules?`${server.schedules.primary?'rappel ✓':'rappel —'} · ${server.schedules.followup?'relance ✓':'relance —'}`:'—';
  const delivery=health.lastDeliveryAcceptedAt?v10126HealthDate(health.lastDeliveryAcceptedAt):'Aucune encore';
  const lastError=health.lastDeliveryError?v10126ErrorLabel(health.lastDeliveryError):(status.lastError?v10126ErrorLabel(status.lastError):'Aucune');
  const canRepair=enabled&&status.permission==='granted'&&!!status.repairReason;
  return `<div class="web-push-health ${tone}"><div class="web-push-health-head"><div><span class="local-notification-dot ${tone==='is-healthy'?'is-on':tone==='is-repair'||tone==='is-warning'?'is-off':'is-idle'}"></span><div><strong>Santé des notifications · ${esc(badge)}</strong><small>${esc(note)}</small></div></div><button type="button" class="btn btn-outline compact" id="checkWebPushHealth" ${enabled?'':'disabled'}>Vérifier</button></div>
    ${enabled?`<div class="web-push-device"><div class="web-push-device-title"><div><strong>Cet appareil</strong><small>${esc(status.devicePlatform||'other')} · installation …${esc(status.installationSuffix||'—')}</small></div><span class="pill">P2.1</span></div><div class="web-push-device-label"><label for="webPushDeviceLabel">Nom de l’appareil</label><div><input id="webPushDeviceLabel" maxlength="48" value="${esc(status.deviceLabel||'Cet appareil')}"><button type="button" class="btn btn-ghost compact" id="saveWebPushDeviceLabel">Enregistrer</button></div></div></div>
    <div class="web-push-health-grid"><div><span>Abonnement navigateur</span><strong>${status.subscribed?'Connecté':'Absent'}</strong></div><div><span>Appareil serveur</span><strong>${status.serverExists?'Présent':'Absent'}</strong></div><div><span>Schedules</span><strong>${esc(schedules)}</strong></div><div><span>Dernière synchro</span><strong>${esc(v10126HealthDate(status.lastSyncAt))}</strong></div><div><span>Dernière remise Push</span><strong>${esc(delivery)}</strong></div><div><span>Dernier test serveur</span><strong>${esc(v10126HealthDate(health.lastTestAcceptedAt))}</strong></div></div>
    ${(health.lastDeliveryError||status.lastError)?`<div class="web-push-health-alert"><strong>Dernier incident</strong><span>${esc(lastError)}${Number(health.consecutiveFailures||0)>0?` · ${Number(health.consecutiveFailures)} échec${Number(health.consecutiveFailures)>1?'s':''} consécutif${Number(health.consecutiveFailures)>1?'s':''}`:''}</span></div>`:''}
    ${canRepair?`<button type="button" class="btn btn-primary" id="repairWebPush">Réparer Web Push</button>`:''}
    <p class="reminder-local-note"><strong>Diagnostic :</strong> « Dernière remise Push » signifie que le service Push a accepté la notification côté serveur ; ce n’est pas une preuve que l’utilisateur l’a ouverte.</p>
    <p class="reminder-local-note"><strong>Multi-appareils :</strong> la liste et la révocation des appareils sont maintenant gérées dans la section Compte & appareils des Réglages.</p>`:''}
  </div>`;
}
const _renderWebPushSettingsV10126=renderWebPushSettings;
renderWebPushSettings=function(){
  let html=_renderWebPushSettingsV10126(),status=v10125WebPushStatus(),health=renderWebPushHealth();
  if(status.enabled&&status.repairReason)html=html.replace(/<button[^>]+id="activateWebPush"[^>]*>Activer Web Push<\/button>/,'');
  const marker='<p class="reminder-local-note"><strong>Données serveur minimales :</strong>';
  return html.includes(marker)?html.replace(marker,health+marker):html.replace(/<\/div>\s*$/,health+'</div>');
};
const _bindEventsV10126=bindEvents;
bindEvents=function(){
  _bindEventsV10126();
  const manager=window.KinetikWebPush;
  const check=document.getElementById('checkWebPushHealth');if(check)check.onclick=async()=>{check.disabled=true;await manager?.checkHealth?.({force:true});render();};
  const repair=document.getElementById('repairWebPush');if(repair)repair.onclick=async()=>{repair.disabled=true;const ok=await manager?.repair?.();if(!ok)alert('Réparation Web Push impossible. Vérifie l’autorisation de notifications et la connexion réseau.');render();};
  const saveLabel=document.getElementById('saveWebPushDeviceLabel');if(saveLabel)saveLabel.onclick=async()=>{const input=document.getElementById('webPushDeviceLabel');saveLabel.disabled=true;await manager?.setDeviceLabel?.(input?.value||'Cet appareil');render();};
  const label=document.getElementById('webPushDeviceLabel');if(label)label.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();document.getElementById('saveWebPushDeviceLabel')?.click();}};
};


/* ========================================================================== */
/* KINETIK v10.127 · Step 13 · Push resilience & observability                */
/* Distinguishes accepted/received/opened delivery, exposes adaptive backoff  */
/* and provides a privacy-safe support diagnostic export.                     */
/* ========================================================================== */
function v10127Duration(ms){
  const n=Number(ms);if(!Number.isFinite(n)||n<0)return '—';
  if(n<60000)return `${Math.max(1,Math.round(n/1000))} s`;
  if(n<3600000)return `${Math.round(n/60000)} min`;
  return `${Math.round(n/360000)/10} h`;
}
function v10127BackoffText(health){
  if(!health?.backoffUntil)return null;const until=new Date(health.backoffUntil);if(Number.isNaN(until.getTime())||until.getTime()<=Date.now())return null;
  return `Pause automatique jusqu’au ${until.toLocaleString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}`;
}
const _renderWebPushHealthV10127=renderWebPushHealth;
renderWebPushHealth=function(){
  let html=_renderWebPushHealthV10127(),status=v10125WebPushStatus(),health=status.serverHealth||{};
  if(!html||!status.enabled)return html;
  const accepted=v10126HealthDate(health.lastDeliveryAcceptedAt),received=v10126HealthDate(health.lastReceivedAt),opened=v10126HealthDate(health.lastOpenedAt),delay=health.lastOpenedAt&&health.lastOpenDelayMs!=null?v10127Duration(health.lastOpenDelayMs):'—',backoff=v10127BackoffText(health);
  const observability=`<div class="web-push-observability"><div class="web-push-observability-title"><strong>Parcours de la dernière notification</strong><span>Serveur → appareil → ouverture</span></div><div class="web-push-observability-flow"><div><span>1</span><small>Acceptée</small><strong>${esc(accepted)}</strong></div><i>→</i><div><span>2</span><small>Reçue</small><strong>${esc(received)}</strong></div><i>→</i><div><span>3</span><small>Ouverte</small><strong>${esc(opened)}</strong></div></div>${health.lastOpenedAt?`<p class="reminder-local-note">Dernière ouverture : <strong>${esc(delay)}</strong> après l’envoi serveur.</p>`:''}${backoff?`<div class="web-push-backoff"><strong>Protection active</strong><span>${esc(backoff)} · ${esc(v10126ErrorLabel(health.backoffReason))}</span></div>`:''}<div class="local-notification-actions"><button type="button" class="btn btn-outline compact" id="exportWebPushDiagnostic">Exporter diagnostic support</button></div><p class="reminder-local-note"><strong>Diagnostic exporté :</strong> état technique, horaires et codes d’erreur uniquement. Aucun secret, endpoint Push complet, manifeste de tâches, mesure, photo ou performance n’est inclus.</p></div>`;
  const marker='<p class="reminder-local-note"><strong>Diagnostic :</strong>';
  html=html.includes(marker)?html.replace(marker,observability+marker):html.replace(/<\/div>\s*$/,observability+'</div>');
  return html.replace('ce n’est pas une preuve que l’utilisateur l’a ouverte.','KINETIK distingue maintenant cette acceptation, la réception par le Service Worker et l’ouverture explicite par l’utilisateur.');
};
const _bindEventsV10127=bindEvents;
bindEvents=function(){
  _bindEventsV10127();
  const manager=window.KinetikWebPush,exportBtn=document.getElementById('exportWebPushDiagnostic');
  if(exportBtn)exportBtn.onclick=()=>{const ok=manager?.downloadSupportDiagnostic?.();if(!ok){const data=manager?.supportDiagnostic?.();if(data)prompt('Diagnostic KINETIK (copier le JSON)',JSON.stringify(data,null,2));}};
};

/* ========================================================================== */
/* KINETIK v10.130 · Step 15 · Account identity & multi-device                */
/* Local-first account groups installations only. Sports data stays local.    */
/* ========================================================================== */
function v10130AccountStatus(){return window.KinetikAccount?.getStatus?.()||{linked:false,members:[],loading:false,lastError:null,deviceLabel:'Cet appareil'};}
function v10130AccountError(code){return ({rate_limited:'Trop de tentatives. Réessaie plus tard.',pairing_code_invalid:'Code d’association invalide ou expiré.',device_limit_reached:'Limite de 8 appareils atteinte.',member_auth_failed:'Cet appareil a été révoqué du compte.',account_not_found:'Compte introuvable.',account_unavailable:'Compte temporairement indisponible.',pairing_failed:'Association impossible.',device_revoked:'Cet appareil a été révoqué.'})[code]||String(code||'').replace(/_/g,' ');}
function v10130AccountDate(value){if(!value)return '—';const d=new Date(value);return Number.isNaN(d.getTime())?'—':d.toLocaleString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});}
function v10130DeviceIcon(platform){return platform==='ios'?'◫':platform==='android'?'▯':platform==='windows'?'▣':platform==='macos'?'◇':'▤';}
function renderAccountSettings(){
  const s=v10130AccountStatus();
  if(!s.linked){
    return `<section class="p88-settings-section account-settings"><div class="p88-section-head"><div><div class="kicker">Compte & appareils</div><h2>Identité KINETIK</h2></div><span class="pill">Local-first</span></div>
      <p class="p88-muted">Crée une identité KINETIK pour rattacher iPhone, PC, iPad ou autre appareil. <strong>Aucune séance, mesure, photo ou performance n’est synchronisée.</strong></p>
      ${s.revokedAt?`<div class="account-alert"><strong>Appareil révoqué</strong><span>Cet appareil n’est plus membre de son ancien compte. Tu peux créer ou rejoindre un compte à nouveau.</span></div>`:''}
      ${s.lastError?`<div class="account-alert"><strong>Association</strong><span>${esc(v10130AccountError(s.lastError))}</span></div>`:''}
      <div class="account-onboarding-grid"><button class="account-choice" id="createKinetikAccount"><span>＋</span><div><strong>Créer mon compte KINETIK</strong><small>Crée une identité privée et rattache cet appareil.</small></div></button>
      <div class="account-join"><div><strong>Rejoindre un compte existant</strong><small>Saisis le code affiché sur un appareil déjà connecté.</small></div><div class="account-code-entry"><input id="kinetikPairCodeInput" inputmode="text" autocomplete="one-time-code" maxlength="9" placeholder="ABCD-EFGH"><button class="btn btn-primary compact" id="joinKinetikAccount">Associer</button></div></div></div>
      <p class="reminder-local-note"><strong>Pas d’email requis :</strong> pour cette première version, l’identité est contrôlée par les appareils déjà liés. Si tous les appareils sont perdus, le compte n’est pas récupérable automatiquement.</p>
    </section>`;
  }
  const members=Array.isArray(s.members)?s.members:[];
  const devices=members.map(m=>`<div class="account-device ${m.current?'is-current':''}"><div class="account-device-main"><span class="account-device-icon">${v10130DeviceIcon(m.platform)}</span><div><strong>${esc(m.label||'Cet appareil')}${m.current?' · cet appareil':''}</strong><small>${esc(m.platform||'other')}${m.standalone?' · PWA':' · navigateur'} · …${esc(m.deviceIdSuffix||'—')}</small><small>Vu ${esc(v10130AccountDate(m.lastSeenAt))}${m.pushLinked?` · Push …${esc(m.pushInstallationSuffix||'—')}`:' · Push non lié'}</small></div></div><div class="account-device-actions"><button type="button" class="btn ${m.notificationsMuted?'btn-outline':'btn-ghost'} compact account-device-mute" data-device="${esc(m.deviceId)}" data-muted="${m.notificationsMuted?'1':'0'}">${m.notificationsMuted?'Réactiver rappels':'Suspendre rappels'}</button>${!m.current?`<button type="button" class="btn btn-danger compact account-device-revoke" data-device="${esc(m.deviceId)}" data-label="${esc(m.label||'Cet appareil')}">Révoquer</button>`:''}</div></div>`).join('');
  const pairValid=s.pairCode&&(!s.pairExpiresAt||new Date(s.pairExpiresAt).getTime()>Date.now());
  return `<section class="p88-settings-section account-settings is-linked"><div class="p88-section-head"><div><div class="kicker">Compte & appareils</div><h2>Compte KINETIK · …${esc(s.accountSuffix||'—')}</h2></div><span class="pill">${members.length}/${s.maxDevices||8} appareils</span></div>
    <p class="p88-muted">Ce compte synchronise uniquement l’<strong>identité des appareils et leurs préférences de notifications</strong>. Ton historique sportif reste local sur chaque appareil.</p>
    ${s.lastError?`<div class="account-alert"><strong>Compte</strong><span>${esc(v10130AccountError(s.lastError))}</span></div>`:''}
    <div class="account-current-label"><label for="kinetikAccountDeviceLabel">Nom de cet appareil</label><div><input id="kinetikAccountDeviceLabel" maxlength="48" value="${esc(s.deviceLabel||'Cet appareil')}"><button class="btn btn-ghost compact" id="saveKinetikAccountLabel">Enregistrer</button></div></div>
    <div class="account-devices"><div class="account-subhead"><div><strong>Appareils liés</strong><span>${members.length} installation${members.length>1?'s':''}</span></div><button class="btn btn-outline compact" id="refreshKinetikAccount">Actualiser</button></div>${devices||'<p class="p88-muted">Chargement des appareils…</p>'}</div>
    <div class="account-pairing"><div><strong>Ajouter un appareil</strong><small>Génère un code à saisir sur le nouvel appareil. Il expire après 10 minutes et ne fonctionne qu’une fois.</small></div>${pairValid?`<div class="account-pair-code"><code>${esc(s.pairCode)}</code><button class="btn btn-outline compact" id="copyKinetikPairCode">Copier</button><span>expire ${esc(v10130AccountDate(s.pairExpiresAt))}</span></div>`:`<button class="btn btn-primary" id="createKinetikPairCode">Générer un code d’association</button>`}</div>
    <div class="account-danger"><button class="btn btn-ghost" id="leaveKinetikAccount">Dissocier cet appareil du compte</button></div>
  </section>`;
}
const _renderProfileV10130=renderProfile;
renderProfile=function(){
  let html=_renderProfileV10130(),block=renderAccountSettings();
  const marker='<section class="p88-settings-section"><div class="p88-section-head"><div><div class="kicker">Coaching</div>';
  return html.includes(marker)?html.replace(marker,block+marker):html.replace(/<\/header>/,'</header>'+block);
};
const _bindEventsV10130=bindEvents;
bindEvents=function(){
  _bindEventsV10130();
  const manager=window.KinetikAccount;
  const create=document.getElementById('createKinetikAccount');if(create)create.onclick=async()=>{create.disabled=true;const ok=await manager?.create?.();if(!ok)alert('Création du compte KINETIK impossible.');render();};
  const join=document.getElementById('joinKinetikAccount');if(join)join.onclick=async()=>{const input=document.getElementById('kinetikPairCodeInput');join.disabled=true;const ok=await manager?.join?.(input?.value||'');if(!ok)alert('Code invalide, expiré ou association impossible.');render();};
  const codeInput=document.getElementById('kinetikPairCodeInput');if(codeInput){codeInput.oninput=()=>{const pos=codeInput.selectionStart;codeInput.value=manager?.normalizeCode?.(codeInput.value)||codeInput.value;try{codeInput.setSelectionRange(pos,pos);}catch(_){}};codeInput.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();join?.click();}};}
  const pair=document.getElementById('createKinetikPairCode');if(pair)pair.onclick=async()=>{pair.disabled=true;const code=await manager?.createPairCode?.();if(!code)alert('Impossible de générer le code d’association.');render();};
  const copy=document.getElementById('copyKinetikPairCode');if(copy)copy.onclick=async()=>{const code=v10130AccountStatus().pairCode||'';try{await navigator.clipboard.writeText(code);copy.textContent='Copié ✓';}catch(_){prompt('Code d’association',code);}};
  const saveLabel=document.getElementById('saveKinetikAccountLabel');if(saveLabel)saveLabel.onclick=async()=>{const input=document.getElementById('kinetikAccountDeviceLabel');saveLabel.disabled=true;await manager?.rename?.(input?.value||'Cet appareil');render();};
  document.querySelectorAll('.account-device-mute').forEach(btn=>btn.onclick=async()=>{btn.disabled=true;await manager?.setMuted?.(btn.dataset.device,btn.dataset.muted!=='1');render();});
  document.querySelectorAll('.account-device-revoke').forEach(btn=>btn.onclick=async()=>{if(!confirm(`Révoquer « ${btn.dataset.label||'cet appareil'} » ? Ses notifications serveur seront supprimées et il devra être associé à nouveau.`))return;btn.disabled=true;await manager?.revoke?.(btn.dataset.device);render();});
  const refresh=document.getElementById('refreshKinetikAccount');if(refresh)refresh.onclick=async()=>{refresh.disabled=true;await manager?.refresh?.({force:true});render();};
  const leave=document.getElementById('leaveKinetikAccount');if(leave)leave.onclick=async()=>{if(!confirm('Dissocier cet appareil du compte KINETIK ? Les données sportives locales resteront sur cet appareil.'))return;leave.disabled=true;await manager?.leave?.();render();};
  const clear=document.getElementById('clearAllData');if(clear)clear.onclick=async()=>{if(confirm('Effacer historique, tests, skills, mesures, compte appareil, rappels serveur et photos ?')){await manager?.clearAll?.();await window.KinetikWebPush?.disable?.({unsubscribeBrowser:true,render:false});Object.values(STORAGE).forEach(k=>localStorage.removeItem(k));await clearPhotos();render();}};
};

/* ========================================================================== */
/* KINETIK v10.132 · Lot B · UX simplification                                */
/* Today owns one action per intent; notification internals are progressive.   */
/* ========================================================================== */
const _todayAgendaActionV10132=todayAgendaAction;
todayAgendaAction=function(task){
  /* The workout hero owns the workout start action. The agenda keeps status/progress only. */
  if(task?.kind==='workout')return '';
  return _todayAgendaActionV10132(task);
};

function v10132ReminderCategories(p){
  const rows=[
    ['workout','🏋️','Séance','Entraînement prévu'],
    ['activities','🏃','Activités','Course, vélo, boxe…'],
    ['measurements','📏','Mesures','Poids, tour de taille, photos'],
    ['tests','◇','Évaluations','Tests KINETIK à renouveler'],
    ['mobility','∿','Mobilité','Routines et évaluations'],
    ['recovery','◌','Récupération','Jours de repos et routines douces']
  ];
  return `<div class="reminder-category-grid reminder-category-grid-v10132">${rows.map(([id,icon,label,note])=>`<label class="reminder-category ${p[id]!==false?'active':''}"><span class="reminder-category-icon">${icon}</span><span><strong>${label}</strong><small>${note}</small></span><input class="reminder-toggle" data-reminder="${id}" type="checkbox" ${p[id]!==false?'checked':''}></label>`).join('')}</div>`;
}
function v10132DeviceDetails(){
  const p=getReminderPrefs(),local=v10124NotificationStatus(),[localBadge,localNote]=v10124PermissionLabel(local),localGranted=local.permission==='granted';
  const push=v10125WebPushStatus(),[pushBadge,pushNote]=v10125WebPushBadge(push),pushActive=!!push.active;
  const synced=push.lastSyncAt?v10126HealthDate(push.lastSyncAt):'Jamais';
  return `<details class="reminder-progressive reminder-device-details"><summary><div><strong>Détails appareil</strong><span>${pushActive?'Web Push actif':localGranted?'Notifications autorisées':'Notifications à configurer'}</span></div><b>⌄</b></summary><div class="reminder-progressive-body">
    <div class="reminder-device-row"><div><span class="local-notification-dot ${localGranted?'is-on':local.permission==='denied'?'is-off':'is-idle'}"></span><div><strong>Notifications de cet appareil · ${esc(localBadge)}</strong><small>${esc(localNote)}</small></div></div>${local.supported&&local.permission==='default'?`<button type="button" class="btn btn-outline compact" id="requestLocalNotifications">Autoriser</button>`:localGranted?`<label class="reminder-inline-switch"><span>Fallback local</span><input id="localNotificationsEnabled" type="checkbox" ${p.localNotifications?'checked':''}></label>`:''}</div>
    <div class="reminder-device-row"><div><span class="local-notification-dot ${pushActive?'is-on':push.permission==='denied'?'is-off':'is-idle'}"></span><div><strong>Web Push · ${esc(pushBadge)}</strong><small>${esc(pushNote)}</small></div></div>${push.configured&&push.supported&&push.permission!=='denied'&&!pushActive?`<button type="button" class="btn btn-primary compact" id="activateWebPush">Activer</button>`:''}</div>
    ${pushActive?`<div class="reminder-device-summary"><span><small>Planification</small><strong>${push.lastManifestDays||0} jours</strong></span><span><small>Fuseau</small><strong>${esc(push.timezone||'—')}</strong></span><span><small>Dernière synchro</small><strong>${esc(synced)}</strong></span></div><div class="local-notification-actions"><button type="button" class="btn btn-outline compact" id="testWebPush">Tester</button><button type="button" class="btn btn-outline compact" id="syncWebPush">Synchroniser</button><button type="button" class="btn btn-ghost compact" id="disableWebPush">Désactiver</button></div>`:''}
    ${push.lastError?`<p class="reminder-local-note web-push-error"><strong>Dernière erreur :</strong> ${esc(push.lastError)}</p>`:''}
    <p class="reminder-local-note">Web Push est la voie fiable lorsque KINETIK est fermé. Le rappel local P1 reste un fallback de cet appareil et se met en veille lorsque P2 est actif.</p>
  </div></details>`;
}
function v10132AdvancedReminderDetails(p){
  const push=v10125WebPushStatus(),health=push.enabled?renderWebPushHealth():'';
  return `<details class="reminder-progressive reminder-advanced-details"><summary><div><strong>Avancé & support</strong><span>Affichage, confidentialité et diagnostic technique</span></div><b>⌄</b></summary><div class="reminder-progressive-body">
    <div class="reminder-preference-grid"><label><span>Échéances dans Aujourd’hui</span><select id="reminderVisibility"><option value="due-only" ${p.visibility==='due-only'?'selected':''}>Uniquement ce qui est dû</option><option value="due-and-soon" ${p.visibility==='due-and-soon'?'selected':''}>Dû + bientôt à refaire</option></select></label><label class="reminder-upcoming-field ${p.visibility==='due-and-soon'?'':'is-muted'}"><span>Fenêtre “bientôt”</span><div class="reminder-number"><input id="reminderUpcomingDays" type="number" min="1" max="14" value="${p.upcomingDays}" ${p.visibility==='due-and-soon'?'':'disabled'}><small>jours</small></div></label></div>
    <div class="switchline"><div><strong>Détails sur l’écran verrouillé</strong><div class="small muted">Désactivé par défaut : les noms des tâches restent privés.</div></div><input id="localNotificationDetail" type="checkbox" ${p.notificationDetail==='detailed'?'checked':''}></div>
    ${typeof Notification!=='undefined'&&Notification.permission==='granted'?`<button type="button" class="btn btn-outline compact" id="testLocalNotification">Tester le fallback local</button>`:''}
    ${health||'<p class="reminder-local-note">Le diagnostic Web Push apparaîtra ici après activation sur cet appareil.</p>'}
  </div></details>`;
}
renderReminderSettings=function(){
  const p=getReminderPrefs(),active=reminderCategoryCount(p),disabled=p.enabled?'':' reminder-settings-disabled';
  return `<section class="p88-settings-section reminder-settings reminder-settings-v10132${disabled}"><div class="p88-section-head"><div><div class="kicker">Notifications</div><h2>Rappels</h2></div><span class="pill">${p.enabled?active+' catégories':'désactivés'}</span></div>
    <p class="p88-muted">Choisis simplement <strong>quoi</strong> te rappeler et <strong>quand</strong>. Les détails techniques de l’appareil restent repliés.</p>
    <div class="reminder-master switchline"><div><strong>Rappels intelligents</strong><div class="small muted">Pilote les priorités d’Aujourd’hui et les notifications.</div></div><input id="remindersEnabled" type="checkbox" ${p.enabled?'checked':''}></div>
    <div class="reminder-settings-body">
      <div class="reminder-settings-block"><div class="reminder-settings-title"><strong>Catégories</strong><span>Ce que KINETIK peut te rappeler</span></div>${v10132ReminderCategories(p)}</div>
      <div class="reminder-settings-block reminder-main-schedule"><div class="reminder-settings-title"><strong>Horaire</strong><span>Réglages habituels de notification</span></div><div class="reminder-preference-grid"><label><span>Heure principale</span><input id="reminderPreferredTime" type="time" value="${p.preferredTime}"></label><label><span>Snooze par défaut</span><select id="localReminderSnooze">${[[15,'15 min'],[30,'30 min'],[60,'1 h'],[120,'2 h']].map(([v,l])=>`<option value="${v}" ${p.snoozeMinutes===v?'selected':''}>${l}</option>`).join('')}</select></label><label><span>Relance séance</span><select id="localWorkoutFollowupDelay" ${p.workoutFollowup?'':'disabled'}>${[[60,'1 h'],[120,'2 h'],[180,'3 h'],[240,'4 h']].map(([v,l])=>`<option value="${v}" ${p.workoutFollowupDelay===v?'selected':''}>${l} après</option>`).join('')}</select></label></div><div class="switchline"><div><strong>Relancer une séance encore à faire</strong><div class="small muted">Au plus tôt à 18:00 et jamais après 21:30.</div></div><input id="localWorkoutFollowup" type="checkbox" ${p.workoutFollowup?'checked':''}></div></div>
      ${v10132DeviceDetails()}
      ${v10132AdvancedReminderDetails(p)}
    </div>
  </section>`;
};

function renderDecisionJournalSettings(){
  return `<section class="p88-settings-section decision-journal-settings"><details class="p88-settings-details"><summary><div><div class="kicker">Données</div><strong>Journal du parcours</strong><span>Fait, reporté et ignoré · historique local sur 180 jours</span></div><b>⌄</b></summary>${renderDailyTaskDecisionHistory()}</details></section>`;
}
function renderSettings(){
  let html=renderProfile();
  const marker='<section class="p88-settings-section"><div class="p88-section-head"><div><div class="kicker">Données</div><h2>Sauvegarde locale</h2>';
  if(html.includes(marker))html=html.replace(marker,renderDecisionJournalSettings()+marker);
  return html;
}
