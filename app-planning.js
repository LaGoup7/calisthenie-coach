/* KINETIK v10.137 · Multisport planning, timers and planning presentation. */
/* V10.70 · Multisport Planning                                               */
/* Planned vs completed · weekly load forecast · conflicts · opt-in optimizer */
/* ========================================================================== */
STORAGE.plannedEvents="kinetik_planned_events_v1";
Object.assign(state,{planningEditor:false,planningEditId:null,planningEditorDate:null,planningWeekOffset:0,planningOptimizeProposal:null,activityDraftPlanId:null});

function getPlannedEvents(){return parse(STORAGE.plannedEvents,[]);}
function setPlannedEvents(v){save(STORAGE.plannedEvents,v);}
function v1070Pad(n){return String(n).padStart(2,'0');}
function v1070DateKey(d){d=new Date(d);return `${d.getFullYear()}-${v1070Pad(d.getMonth()+1)}-${v1070Pad(d.getDate())}`;}
function v1070DateFromKey(k){const [y,m,d]=String(k||'').split('-').map(Number);return new Date(y,m-1,d,12,0,0);}
function v1070AddDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x;}
function v1070WeekStart(offset=state.planningWeekOffset||0){const d=mondayDate(new Date());d.setHours(12,0,0,0);d.setDate(d.getDate()+Number(offset||0)*7);return d;}
function v1070WeekLabel(start){const end=v1070AddDays(start,6),fmt=d=>d.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});return `${fmt(start)} — ${fmt(end)}`;}
function plannedEventById(id){return getPlannedEvents().find(x=>String(x.id)===String(id))||null;}
function plannedEventsForDate(key){return getPlannedEvents().filter(x=>x.date===key).sort((a,b)=>String(a.time||'99:99').localeCompare(String(b.time||'99:99')));}
function actualActivitiesForDate(key){return getActivities().filter(x=>v1070DateKey(x.date)===key).sort((a,b)=>v1070DateMs(a.date)-v1070DateMs(b.date));}
function actualStrengthForDate(key){return getHistory().filter(x=>v1070DateKey(x.date)===key).sort((a,b)=>v1070DateMs(a.date)-v1070DateMs(b.date));}
function plannedEventType(e){return activityType(e.type);}
function plannedEventLoad(e){return e.type==='mobility'?0:Math.round(Number(e.duration||0)*Math.max(1,Number(e.rpe||5)));}
function plannedEventRecoveryMinutes(e){return e.type==='mobility'?Number(e.duration||0):0;}
function plannedEventActual(e){
  const direct=getActivities().find(a=>String(a.linkedPlanId||'')===String(e.id));if(direct)return direct;
  const same=actualActivitiesForDate(e.date).filter(a=>a.type===e.type);
  return same.length===1?same[0]:null;
}
function v1070PlannedKinetikForDate(key){
  const d=v1070DateFromKey(key),day=d.getDay(),w=preparedWorkout(day,null,'full');
  if(!w?.exercises?.length)return null;
  const expectedRpe=6;
  return {day,name:w.name,duration:Number(w.duration||45),rpe:expectedRpe,load:Math.round(Number(w.duration||45)*expectedRpe),workout:w};
}
function v1070ActualKinetikLoad(key){return actualStrengthForDate(key).reduce((s,x)=>s+strengthSessionInternalLoad(x),0);}
function v1070DayPlan(key){
  const manual=plannedEventsForDate(key),kinetik=v1070PlannedKinetikForDate(key),actualManual=actualActivitiesForDate(key),actualStrength=actualStrengthForDate(key);
  const plannedSportLoad=(kinetik?.load||0)+manual.reduce((s,x)=>s+plannedEventLoad(x),0),plannedRecovery=manual.reduce((s,x)=>s+plannedEventRecoveryMinutes(x),0);
  const actualSportLoad=v1070ActualKinetikLoad(key)+actualManual.filter(x=>x.type!=='mobility').reduce((s,x)=>s+activityInternalLoad(x),0),actualRecovery=actualManual.filter(x=>x.type==='mobility').reduce((s,x)=>s+Number(x.duration||0),0);
  return {key,date:v1070DateFromKey(key),manual,kinetik,actualManual,actualStrength,plannedSportLoad,plannedRecovery,actualSportLoad,actualRecovery};
}
function v1070WeekDays(start=v1070WeekStart()){return Array.from({length:7},(_,i)=>v1070DayPlan(v1070DateKey(v1070AddDays(start,i))));}
function v1070WeekStats(start=v1070WeekStart()){
  const days=v1070WeekDays(start),planned=days.reduce((s,x)=>s+x.plannedSportLoad,0),actual=days.reduce((s,x)=>s+x.actualSportLoad,0),plannedRecovery=days.reduce((s,x)=>s+x.plannedRecovery,0),actualRecovery=days.reduce((s,x)=>s+x.actualRecovery,0);
  const plannedSessions=days.reduce((s,x)=>s+(x.kinetik?1:0)+x.manual.filter(e=>e.type!=='mobility').length,0),actualSessions=days.reduce((s,x)=>s+x.actualStrength.length+x.actualManual.filter(e=>e.type!=='mobility').length,0);
  return {days,planned,actual,plannedRecovery,actualRecovery,plannedSessions,actualSessions};
}
function v1070PriorityLabel(id){return ({priority:'Prioritaire',important:'Important',flexible:'Flexible'})[id]||'Flexible';}
function v1070DefaultPriority(type){return ['boxing','crossfit','hyrox'].includes(type)?'important':'flexible';}
function v1070LoadDelta(planned,actual){if(!planned||!actual)return null;return Math.round((actual-planned)/planned*100);}
function v1070PlanRealizationText(e){
  const a=plannedEventActual(e);if(!a)return null;
  const planned=plannedEventLoad(e),actual=a.type==='mobility'?0:activityInternalLoad(a),delta=v1070LoadDelta(planned,actual),type=activityType(a.type);
  return `${a.duration} min${a.distance?` · ${a.distance} ${type.metric||'km'}`:''} · RPE ${a.rpe||'—'}${delta!=null?` · charge ${delta>=0?'+':''}${delta}% vs prévu`:''}`;
}
function v1070Conflicts(start=v1070WeekStart()){
  const days=v1070WeekDays(start),rows=[];
  days.forEach((d,i)=>{
    const hard=d.manual.filter(e=>e.type!=='mobility'&&Number(e.rpe||0)>=8&&Number(e.duration||0)>=45);
    if(d.plannedSportLoad>=900)rows.push({level:'high',date:d.key,title:'Journée très dense',detail:`Charge prévue ${d.plannedSportLoad} UA.`});
    if(hard.length&&d.kinetik)rows.push({level:'medium',date:d.key,title:'Double contrainte le même jour',detail:`${hard.map(x=>plannedEventType(x).label).join(', ')} intense + ${d.kinetik.name}.`});
    if(i<6){
      const n=days[i+1],hardManual=hard.length||d.manual.some(e=>['boxing','crossfit','hyrox'].includes(e.type)&&Number(e.rpe||0)>=7);
      if(hardManual&&n.kinetik&&n.kinetik.duration>=45)rows.push({level:'medium',date:n.key,title:'Récupération à surveiller',detail:`Une activité intense précède ${n.kinetik.name}. La séance sera réévaluée après la charge réelle.`});
      if(d.plannedSportLoad>=550&&n.plannedSportLoad>=550)rows.push({level:'medium',date:n.key,title:'Deux journées chargées consécutives',detail:`${d.plannedSportLoad} puis ${n.plannedSportLoad} UA prévues.`});
    }
  });
  return rows.slice(0,6);
}
function v1070OptimizerProposal(start=v1070WeekStart()){
  const days=v1070WeekDays(start),load=Object.fromEntries(days.map(d=>[d.key,d.plannedSportLoad])),moves=[],protectedNotes=[],weight={flexible:0,important:1,priority:2};
  const movable=getPlannedEvents().filter(e=>days.some(d=>d.key===e.date)&&e.type!=='mobility').sort((a,b)=>weight[a.priority||'flexible']-weight[b.priority||'flexible']);
  for(const e of movable){
    const pr=e.priority||'flexible',day=days.find(d=>d.key===e.date);if(!day)continue;
    const idx=days.findIndex(d=>d.key===e.date),adjacentHeavy=((days[idx-1]?.plannedSportLoad||0)>=550||(days[idx+1]?.plannedSportLoad||0)>=550)&&day.plannedSportLoad>=450;
    const needs=day.plannedSportLoad>=800||adjacentHeavy;if(!needs)continue;
    if(pr==='priority'){protectedNotes.push(`${plannedEventType(e).label} ${formatShortDate(e.date)} protégée (prioritaire).`);continue;}
    const candidates=days.filter(d=>d.key!==e.date&&d.key>=v1070DateKey(new Date())&&load[d.key]+plannedEventLoad(e)<=650&&!d.manual.some(x=>x.type===e.type));
    candidates.sort((a,b)=>(load[a.key]+(a.kinetik?120:0))-(load[b.key]+(b.kinetik?120:0)));
    const target=candidates[0];if(!target)continue;
    moves.push({id:e.id,from:e.date,to:target.key,label:plannedEventType(e).label,reason:`Répartir la charge : ${load[e.date]} UA → journée à ${load[target.key]} UA.`});
    load[e.date]-=plannedEventLoad(e);load[target.key]+=plannedEventLoad(e);
  }
  return {moves,protectedNotes,createdAt:Date.now()};
}
function v1070ApplyOptimizer(){
  const p=state.planningOptimizeProposal;if(!p?.moves?.length)return;
  const rows=getPlannedEvents();p.moves.forEach(m=>{const e=rows.find(x=>String(x.id)===String(m.id));if(e)e.date=m.to;});setPlannedEvents(rows);state.planningOptimizeProposal=null;render();
}
function v1070DayLoadBar(day,max){const planned=Math.round(day.plannedSportLoad/max*100),actual=Math.round(day.actualSportLoad/max*100);return `<div class="planning-load-bar"><i style="width:${Math.max(0,planned)}%"></i>${actual?`<b style="width:${Math.max(0,actual)}%"></b>`:''}</div>`;}
function v1070RenderPlannedEvent(e){
  const type=plannedEventType(e),actual=plannedEventActual(e),realText=v1070PlanRealizationText(e);
  return `<div class="planned-event ${actual?'completed':''}"><div class="planned-event-time">${e.time||'—'}</div><div class="planned-event-main"><strong>${esc(type.label)}</strong><span>${e.duration} min · RPE prévu ${e.rpe} · ${v1070PriorityLabel(e.priority)}</span>${e.note?`<small>${esc(e.note)}</small>`:''}${realText?`<small class="planned-real">Réalisé · ${esc(realText)}</small>`:''}</div><div class="planned-event-actions">${!actual?`<button data-complete-plan="${e.id}">Réaliser</button>`:''}<button data-edit-plan="${e.id}">Modifier</button><button data-delete-plan="${e.id}" aria-label="Supprimer">×</button></div></div>`;
}
function v1070RenderUnplannedActual(a){const type=activityType(a.type);return `<div class="planning-actual-unplanned"><span>${activityUiIcon(a.type)}</span><div><strong>${esc(type.label)} · réalisé</strong><small>${a.duration} min${a.distance?` · ${a.distance} ${type.metric||'km'}`:''} · RPE ${a.rpe||'—'} · non planifié</small></div></div>`;}
function v1070RenderDay(day,maxLoad){
  const weekday=DAY_NAMES[day.date.getDay()].slice(0,3).toUpperCase(),today=day.key===v1070DateKey(new Date()),kinActual=day.actualStrength[0],linkedIds=new Set(day.manual.map(e=>String(plannedEventActual(e)?.id||''))),unplanned=day.actualManual.filter(a=>!linkedIds.has(String(a.id)));
  return `<article class="planning-day ${today?'today':''}"><div class="planning-day-head"><div class="planning-date"><span>${weekday}</span><strong>${day.date.getDate()}</strong></div><div class="planning-day-load"><span>${day.plannedSportLoad} UA prévues${day.actualSportLoad?` · ${day.actualSportLoad} réalisées`:''}</span>${v1070DayLoadBar(day,maxLoad)}</div><button class="planning-add" data-plan-date="${day.key}">＋</button></div><div class="planning-day-body">
  ${day.kinetik?`<div class="planning-kinetik ${kinActual?'completed':''}"><span class="planning-source">KINETIK</span><div><strong>${esc(day.kinetik.name)}</strong><small>${day.kinetik.duration} min · charge estimée ${day.kinetik.load} UA${kinActual?` · réalisé ${kinActual.durationMinutes||0} min / RPE ${kinActual.rpe||'—'}`:''}</small></div>${today?`<button class="week-quick-start start-day" data-day="${day.kinetik.day}">Démarrer</button>`:`<span class="planning-status">${kinActual?'Réalisé':'Planifié'}</span>`}</div>`:`<div class="planning-rest"><span>Repos programme</span><small>La journée reste disponible pour recovery ou activité externe.</small></div>`}
  ${day.manual.map(v1070RenderPlannedEvent).join('')}${unplanned.map(v1070RenderUnplannedActual).join('')}<div class="planning-mobility-line"><span>Mobilité</span><strong>${recommendedFlexRoutine(day.date.getDay()).duration} min recommandées</strong></div></div></article>`;
}
function renderPlanningOptimizer(){
  const p=state.planningOptimizeProposal;if(!p)return '';
  return `<section class="planning-optimizer-review"><div class="planning-section-head"><div><div class="kicker">Proposition KINETIK</div><h2>${p.moves.length?p.moves.length+' déplacement'+(p.moves.length>1?'s':''):'Aucun déplacement utile'}</h2></div><button class="planning-close-optimizer" aria-label="Fermer">×</button></div>${p.moves.length?`<div class="planning-moves">${p.moves.map(m=>`<div><strong>${esc(m.label)}</strong><span>${formatShortDate(m.from)} → ${formatShortDate(m.to)}</span><small>${esc(m.reason)}</small></div>`).join('')}</div><div class="planning-optimizer-actions"><button class="btn btn-outline planning-cancel-opt">Garder mon planning</button><button class="btn btn-primary planning-apply-opt">Appliquer la proposition</button></div>`:`<p class="muted">Les activités flexibles sont déjà correctement réparties, ou les contraintes concernent des séances protégées. KINETIK ne déplace jamais une séance prioritaire automatiquement.</p>`}${p.protectedNotes?.length?`<div class="planning-protected">${p.protectedNotes.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:''}</section>`;
}
renderWeek=function(){
  const start=v1070WeekStart(),stats=v1070WeekStats(start),conflicts=v1070Conflicts(start),maxLoad=Math.max(600,...stats.days.map(x=>x.plannedSportLoad),...stats.days.map(x=>x.actualSportLoad)),todayWeek=Number(state.planningWeekOffset||0)===0;
  return shell(`<header class="topbar"><div><div class="brand">Planning</div><div class="daylabel">Programme, sports et récupération dans une seule semaine</div></div></header>${renderPlanningTabs('calendar')}
  <section class="planning-week-header"><button data-week-shift="-1" aria-label="Semaine précédente">←</button><div><div class="kicker">${todayWeek?'Cette semaine':'Semaine'}</div><h1>${v1070WeekLabel(start)}</h1></div><button data-week-shift="1" aria-label="Semaine suivante">→</button></section>
  <section class="planning-week-summary"><div><span>Charge prévue</span><strong>${stats.planned.toLocaleString('fr-FR')} UA</strong></div><div><span>Charge réalisée</span><strong>${stats.actual.toLocaleString('fr-FR')} UA</strong></div><div><span>Sessions</span><strong>${stats.actualSessions}/${stats.plannedSessions}</strong></div><div><span>Recovery</span><strong>${stats.actualRecovery}/${stats.plannedRecovery} min</strong></div></section>
  <section class="planning-load-week"><div class="planning-section-head"><div><div class="kicker">Répartition</div><h2>Charge sportive de la semaine</h2></div><div class="planning-load-legend"><span><i></i>Prévu</span><span><b></b>Réalisé</span></div></div><div class="planning-load-columns">${stats.days.map(d=>`<div><div class="planning-load-column"><i style="height:${Math.max(3,d.plannedSportLoad/maxLoad*100)}%"></i>${d.actualSportLoad?`<b style="height:${Math.max(3,d.actualSportLoad/maxLoad*100)}%"></b>`:''}</div><span>${DAY_NAMES[d.date.getDay()].slice(0,1)}</span></div>`).join('')}</div></section>
  <section class="planning-command-row"><button class="planning-new-event" data-plan-date="${v1070DateKey(new Date())}">＋ Planifier une activité</button><button class="planning-optimize">Optimiser ma semaine</button>${todayWeek?'':`<button class="planning-today-week">Revenir à cette semaine</button>`}</section>
  ${conflicts.length?`<section class="planning-conflicts"><div class="kicker">À surveiller</div>${conflicts.map(c=>`<div class="${c.level}"><strong>${esc(c.title)}</strong><span>${formatShortDate(c.date)} · ${esc(c.detail)}</span></div>`).join('')}</section>`:''}
  ${renderPlanningOptimizer()}<section class="planning-days">${stats.days.map(d=>v1070RenderDay(d,maxLoad)).join('')}</section>`, "week");
};

function renderPlanningEventEditor(){
  const editing=state.planningEditId?plannedEventById(state.planningEditId):null,date=editing?.date||state.planningEditorDate||v1070DateKey(new Date()),type=editing?.type||'running',duration=Number(editing?.duration||45),rpe=Number(editing?.rpe||6),priority=editing?.priority||v1070DefaultPriority(type),time=editing?.time||'',note=editing?.note||'';
  return shell(`<header class="topbar"><div><button class="back-btn planning-editor-close">← Planning</button><div class="daylabel">${editing?'Modifier une activité planifiée':'Nouvelle activité planifiée'}</div></div></header>
  <section class="planning-editor"><div class="planning-editor-head"><div class="kicker">Multisport</div><h1>${editing?'Modifier':'Planifier'} une activité</h1><p>KINETIK utilise la durée et le RPE prévus pour estimer la charge. Le réalisé restera séparé.</p></div>
  <div class="planning-editor-grid"><label><span>Sport</span><select id="planType">${ACTIVITY_TYPES.map(x=>`<option value="${x.id}" ${x.id===type?'selected':''}>${x.label}</option>`).join('')}</select></label><label><span>Date</span><input id="planDate" type="date" value="${date}"></label><label><span>Heure <small>optionnel</small></span><input id="planTime" type="time" value="${time}"></label><label><span>Durée prévue</span><div class="planning-inline-input"><input id="planDuration" type="number" min="5" step="5" value="${duration}"><b>min</b></div></label></div>
  <div class="planning-rpe"><div><span>RPE prévu</span><strong id="planRpeValue">${rpe}</strong></div><input id="planRpe" type="range" min="1" max="10" value="${rpe}"><div><span>facile</span><span>modéré</span><span>intense</span></div></div>
  <div class="planning-priority"><span>Priorité</span>${[['priority','Prioritaire','KINETIK ne la déplace pas'],['important','Importante','à protéger si possible'],['flexible','Flexible','peut être proposée ailleurs']].map(([id,label,sub])=>`<label><input type="radio" name="planPriority" value="${id}" ${priority===id?'checked':''}><div><strong>${label}</strong><small>${sub}</small></div></label>`).join('')}</div>
  ${!editing?`<label class="planning-repeat"><span>Répéter</span><select id="planRepeat"><option value="1">Une seule fois</option><option value="4">Chaque semaine · 4 semaines</option><option value="8">Chaque semaine · 8 semaines</option><option value="12">Chaque semaine · 12 semaines</option></select></label>`:''}
  <label class="planning-note"><span>Note <small>optionnel</small></span><textarea id="planNote" rows="3" placeholder="Cours club, zone 2, terrain, objectif…">${esc(note)}</textarea></label>
  <div class="planning-load-preview"><span>Charge sportive estimée</span><strong id="planLoadPreview">${type==='mobility'?'Recovery':Math.round(duration*rpe)+' UA'}</strong></div><div class="planning-editor-actions"><button class="btn btn-outline planning-editor-close">Annuler</button><button class="btn btn-primary" id="savePlannedEvent">${editing?'Enregistrer':'Ajouter au planning'}</button></div></section>`,'week');
}
function v1070SavePlannedEvent(){
  const type=document.getElementById('planType')?.value||'running',date=document.getElementById('planDate')?.value||v1070DateKey(new Date()),time=document.getElementById('planTime')?.value||'',duration=Math.max(5,Number(document.getElementById('planDuration')?.value||45)),rpe=clamp(Number(document.getElementById('planRpe')?.value||6),1,10),priority=document.querySelector('input[name="planPriority"]:checked')?.value||v1070DefaultPriority(type),note=document.getElementById('planNote')?.value||'',rows=getPlannedEvents();
  if(state.planningEditId){const i=rows.findIndex(x=>String(x.id)===String(state.planningEditId));if(i>=0)rows[i]={...rows[i],date,time,type,duration,rpe,priority,note,updatedAt:new Date().toISOString()};}
  else{const repeat=Math.max(1,Number(document.getElementById('planRepeat')?.value||1));for(let n=0;n<repeat;n++){const d=v1070DateFromKey(date);d.setDate(d.getDate()+n*7);rows.push({id:`p${Date.now()}_${n}`,date:v1070DateKey(d),time,type,duration,rpe,priority,note,createdAt:new Date().toISOString()});}}
  setPlannedEvents(rows.sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.time||'99:99').localeCompare(String(b.time||'99:99'))));state.planningEditor=false;state.planningEditId=null;state.planningEditorDate=null;state.view='week';render();
}

const _renderActivityEditorV1070=renderActivityEditor;
renderActivityEditor=function(){
  if(!state.activityDraftPlanId)return _renderActivityEditorV1070();
  const plan=plannedEventById(state.activityDraftPlanId);if(!plan)return _renderActivityEditorV1070();
  const type=activityType(plan.type),date=plan.date,duration=Number(plan.duration||30),rpe=Number(plan.rpe||5);
  return shell(`<header class="topbar activity-topbar"><div><div class="brand">Activité réalisée</div><div class="daylabel">Prévu vs réalisé · ${esc(type.label)}</div></div></header><section class="activity-editor activity-editor-premium">
  <div class="activity-editor-intro"><div class="activity-editor-symbol">${activityUiIcon(type.id)}</div><div><div class="kicker">Planifié ${plan.duration} min · RPE ${plan.rpe}</div><h1>${esc(type.label)}</h1><p>Corrige les valeurs avec ce que tu as réellement fait. KINETIK comparera ensuite la charge au planning.</p></div></div>
  <div class="activity-form-section activity-editor-two"><label class="activity-field"><span>Type</span><select id="activityType">${ACTIVITY_TYPES.map(x=>`<option value="${x.id}" ${x.id===type.id?'selected':''}>${x.label}</option>`).join('')}</select></label><label class="activity-field"><span>Date</span><input id="activityDate" type="date" value="${date}"></label></div>
  <div class="activity-metrics-grid"><label class="activity-metric"><span>Durée réelle</span><div><input id="activityDuration" type="number" min="1" value="${duration}"><b>min</b></div></label><label class="activity-metric" id="activityDistanceWrap"><span>Distance <small>optionnel</small></span><div><input id="activityDistance" type="number" min="0" step=".1" placeholder="0"><b id="activityDistanceUnit">${type.metric||'km'}</b></div></label></div>
  <div class="activity-form-section activity-rpe-section"><div class="activity-rpe-head"><div><span>RPE réel</span><small>Ce que la séance t’a réellement demandé</small></div><strong id="activityRpeValue">${rpe}</strong></div><input id="activityRpe" class="activity-rpe-slider" type="range" min="1" max="10" value="${rpe}"></div>
  <div class="activity-form-section"><label class="activity-field"><span>Note</span><textarea id="activityNote" rows="3">${esc(plan.note||'')}</textarea></label></div><div class="activity-load-preview activity-load-premium"><div><span>Charge réelle</span><small>prévue ${plannedEventLoad(plan)} UA</small></div><strong id="activityLoadPreview">${plan.type==='mobility'?'—':Math.round(duration*rpe)+' <small>UA</small>'}</strong></div>
  <div class="activity-editor-actions"><button class="btn activity-cancel" id="cancelActivity">Annuler</button><button class="btn activity-save" id="saveActivity">Enregistrer le réalisé</button></div></section>`,'week');
};

function renderTodayPlannedEvents(){
  const events=plannedEventsForDate(v1070DateKey(new Date())).filter(e=>!plannedEventActual(e));if(!events.length)return '';
  return `<section class="today-planned-events"><div><div class="kicker">Aussi prévu aujourd’hui</div>${events.map(e=>{const type=plannedEventType(e);return `<button data-complete-plan="${e.id}"><span>${e.time||'—'}</span><div><strong>${esc(type.label)}</strong><small>${e.duration} min · RPE ${e.rpe}</small></div><b>Réaliser →</b></button>`}).join('')}</div></section>`;
}
const _renderTodayV1070=renderToday;
renderToday=function(){let html=_renderTodayV1070(),marker='<section class="today-cockpit today-primary-actions';return html.includes(marker)?html.replace(marker,renderTodayPlannedEvents()+marker):html;};

const _renderV1070=render;
render=function(){if(state.planningEditor){document.getElementById("app").innerHTML=renderPlanningEventEditor();bindEvents();return;}_renderV1070();};

const _bindEventsV1070=bindEvents;
bindEvents=function(){
  _bindEventsV1070();
  document.querySelectorAll('[data-week-shift]').forEach(b=>b.onclick=()=>{state.planningWeekOffset+=Number(b.dataset.weekShift||0);state.planningOptimizeProposal=null;render();});
  document.querySelectorAll('.planning-today-week').forEach(b=>b.onclick=()=>{state.planningWeekOffset=0;state.planningOptimizeProposal=null;render();});
  document.querySelectorAll('[data-plan-date],.planning-new-event').forEach(b=>b.onclick=()=>{state.planningEditor=true;state.planningEditId=null;state.planningEditorDate=b.dataset.planDate||v1070DateKey(new Date());render();});
  document.querySelectorAll('[data-edit-plan]').forEach(b=>b.onclick=()=>{const e=plannedEventById(b.dataset.editPlan);state.planningEditor=true;state.planningEditId=e?.id||null;state.planningEditorDate=e?.date||null;render();});
  document.querySelectorAll('[data-delete-plan]').forEach(b=>b.onclick=()=>{if(!confirm('Supprimer cette activité planifiée ?'))return;setPlannedEvents(getPlannedEvents().filter(x=>String(x.id)!==String(b.dataset.deletePlan)));render();});
  document.querySelectorAll('[data-complete-plan]').forEach(b=>b.onclick=()=>{state.activityDraftPlanId=b.dataset.completePlan;state.activityEditId=null;state.activityEditor=true;render();});
  document.querySelectorAll('.planning-editor-close').forEach(b=>b.onclick=()=>{state.planningEditor=false;state.planningEditId=null;state.planningEditorDate=null;render();});
  const savePlan=document.getElementById('savePlannedEvent');if(savePlan)savePlan.onclick=v1070SavePlannedEvent;
  const pType=document.getElementById('planType'),pDur=document.getElementById('planDuration'),pRpe=document.getElementById('planRpe'),pRpeV=document.getElementById('planRpeValue'),pLoad=document.getElementById('planLoadPreview');
  const syncPlan=()=>{if(!pType)return;const d=Number(pDur?.value||0),r=Number(pRpe?.value||5);if(pRpeV)pRpeV.textContent=r;if(pLoad)pLoad.textContent=pType.value==='mobility'?'Recovery':`${Math.round(d*r)} UA`;};if(pType)pType.onchange=syncPlan;if(pDur)pDur.oninput=syncPlan;if(pRpe)pRpe.oninput=syncPlan;syncPlan();
  document.querySelectorAll('.planning-optimize').forEach(b=>b.onclick=()=>{state.planningOptimizeProposal=v1070OptimizerProposal();render();});
  document.querySelectorAll('.planning-cancel-opt,.planning-close-optimizer').forEach(b=>b.onclick=()=>{state.planningOptimizeProposal=null;render();});
  document.querySelectorAll('.planning-apply-opt').forEach(b=>b.onclick=()=>{if(confirm('Appliquer uniquement les déplacements proposés ? Les séances prioritaires restent inchangées.'))v1070ApplyOptimizer();});
  if(state.activityDraftPlanId){
    const cancel=document.getElementById('cancelActivity');if(cancel)cancel.onclick=()=>{state.activityEditor=false;state.activityDraftPlanId=null;render();};
    const saveActivity=document.getElementById('saveActivity');if(saveActivity)saveActivity.onclick=()=>{
      const duration=Number(document.getElementById('activityDuration')?.value||0);if(duration<=0)return;
      const type=document.getElementById('activityType')?.value||'sport',distance=Number(document.getElementById('activityDistance')?.value||0),rpe=clamp(Number(document.getElementById('activityRpe')?.value||5),1,10),note=document.getElementById('activityNote')?.value||'',date=document.getElementById('activityDate')?.value||v1070DateKey(new Date()),rows=getActivities(),planId=state.activityDraftPlanId;
      rows.unshift({id:String(Date.now()),date:new Date(`${date}T12:00:00`).toISOString(),type,duration,distance:Math.max(0,distance),intensity:'rpe',note,rpe,load:Math.round(duration*rpe),linkedPlanId:planId});setActivities(rows.slice(0,1500));state.activityEditor=false;state.activityDraftPlanId=null;state.view='week';render();
    };
  }
};
const _activityUiIconV1070=activityUiIcon;
activityUiIcon=function(id){return id==='boxing'?'B':_activityUiIconV1070(id);};


/* ========================================================================== */
/* V10.71 · Planning readability pass                                         */
/* Program first · multisport around it · analysis progressively disclosed    */
/* ========================================================================== */
function v1071MainExercisePreview(w){
  const rows=(w?.exercises||[]).filter(e=>(e.phase||'main')==='main'&&e.type!=='timer');
  if(!rows.length)return '';
  const names=rows.slice(0,5).map(e=>esc(e.name));
  return `<div class="planning-exercise-preview">${names.join(' · ')}${rows.length>5?' · …':''}</div>`;
}
function v1071KinetikDetails(day){
  if(!day.kinetik)return '';
  const w=day.kinetik.workout,expanded=state.expandedWeekDay===day.kinetik.day;
  return `<div class="planning-kinetik-details ${expanded?'open':''}" ${expanded?'':'hidden'}>
    <div class="planning-details-head"><strong>${w.exercises.length} étapes</strong><span>Prescription actuelle · détails, séries et répétitions</span></div>
    <div class="week-exercise-list">${w.exercises.map(renderWeekExercise).join('')}</div>
    ${day.key===v1070DateKey(new Date())?`<button class="btn btn-primary start-day planning-start-workout" data-day="${day.kinetik.day}">Commencer cette séance</button>`:''}
  </div>`;
}
function v1071RenderKinetik(day){
  const k=day.kinetik;if(!k)return '';
  const actual=day.actualStrength[0],expanded=state.expandedWeekDay===k.day,w=k.workout;
  return `<section class="planning-kinetik-primary ${actual?'completed':''}">
    <button class="planning-kinetik-toggle week-toggle" data-day="${k.day}" aria-expanded="${expanded}">
      <div class="planning-session-copy"><span class="planning-source">KINETIK</span><h3>${esc(k.name)}</h3><p>${esc(w.subtitle||'')}</p>${v1071MainExercisePreview(w)}<div class="planning-session-meta"><span>${k.duration} min</span><span>${w.exercises.length} étapes</span>${actual?`<span>Réalisé · ${actual.durationMinutes||0} min · RPE ${actual.rpe||'—'}</span>`:`<span>Charge ${k.load} UA</span>`}</div></div>
      <span class="planning-expand-label">${expanded?'Réduire':'Voir les exercices'} <b>${expanded?'↑':'↓'}</b></span>
    </button>
    ${v1071KinetikDetails(day)}
  </section>`;
}
function v1071RenderExternalEvent(e){
  const type=plannedEventType(e),actual=plannedEventActual(e),realText=v1070PlanRealizationText(e);
  return `<div class="planning-external-event ${actual?'completed':''}">
    <div class="planning-external-time">${e.time||'—'}</div>
    <div class="planning-external-copy"><strong>${esc(type.label)}</strong><span>${e.duration} min · RPE ${e.rpe} · ${v1070PriorityLabel(e.priority)}</span>${e.note?`<small>${esc(e.note)}</small>`:''}${realText?`<small class="planned-real">Réalisé · ${esc(realText)}</small>`:''}</div>
    <div class="planning-external-actions">${!actual?`<button data-complete-plan="${e.id}">Réaliser</button>`:''}<button data-edit-plan="${e.id}">Modifier</button><button data-delete-plan="${e.id}" aria-label="Supprimer">×</button></div>
  </div>`;
}
function v1071RenderDay(day){
  const weekday=DAY_NAMES[day.date.getDay()].slice(0,3).toUpperCase(),today=day.key===v1070DateKey(new Date()),linkedIds=new Set(day.manual.map(e=>String(plannedEventActual(e)?.id||''))),unplanned=day.actualManual.filter(a=>!linkedIds.has(String(a.id))),hasAnything=!!day.kinetik||day.manual.length||unplanned.length;
  return `<article class="planning-day-v1071 ${today?'today':''}">
    <header class="planning-day-v1071-head"><div class="planning-date-v1071"><span>${weekday}</span><strong>${day.date.getDate()}</strong>${today?'<em>Aujourd’hui</em>':''}</div><button class="planning-add" data-plan-date="${day.key}" aria-label="Ajouter une activité">＋</button></header>
    <div class="planning-day-v1071-body">
      ${v1071RenderKinetik(day)}
      ${day.manual.map(v1071RenderExternalEvent).join('')}
      ${unplanned.map(v1070RenderUnplannedActual).join('')}
      ${!hasAnything?`<div class="planning-rest-v1071"><strong>Repos</strong><span>Aucune séance principale prévue.</span></div>`:!day.kinetik&&day.manual.length?`<div class="planning-no-kinetik">Pas de séance KINETIK prévue</div>`:''}
      <div class="planning-mobility-v1071"><span>Mobilité recommandée</span><strong>${recommendedFlexRoutine(day.date.getDay()).duration} min</strong></div>
    </div>
  </article>`;
}
function v1071RenderAnalysis(stats,conflicts,maxLoad){
  return `<details class="planning-analysis">
    <summary><div><strong>Analyser la charge de la semaine</strong><span>Prévu / réalisé, conflits et optimisation</span></div><b>⌄</b></summary>
    <div class="planning-analysis-body">
      <div class="planning-week-summary-v1071"><div><span>Prévue</span><strong>${stats.planned.toLocaleString('fr-FR')} UA</strong></div><div><span>Réalisée</span><strong>${stats.actual.toLocaleString('fr-FR')} UA</strong></div><div><span>Recovery</span><strong>${stats.actualRecovery}/${stats.plannedRecovery} min</strong></div></div>
      <div class="planning-load-week-v1071"><div class="planning-load-legend"><span><i></i>Prévu</span><span><b></b>Réalisé</span></div><div class="planning-load-columns">${stats.days.map(d=>`<div><div class="planning-load-column"><i style="height:${Math.max(3,d.plannedSportLoad/maxLoad*100)}%"></i>${d.actualSportLoad?`<b style="height:${Math.max(3,d.actualSportLoad/maxLoad*100)}%"></b>`:''}</div><span>${DAY_NAMES[d.date.getDay()].slice(0,1)}</span></div>`).join('')}</div></div>
      ${conflicts.length?`<div class="planning-conflicts-v1071"><div class="kicker">À surveiller</div>${conflicts.map(c=>`<div class="${c.level}"><strong>${esc(c.title)}</strong><span>${formatShortDate(c.date)} · ${esc(c.detail)}</span></div>`).join('')}</div>`:''}
      <div class="planning-analysis-actions"><button class="planning-optimize">Optimiser ma semaine</button><span>KINETIK propose seulement ; aucun déplacement n’est appliqué sans validation.</span></div>
      ${renderPlanningOptimizer()}
    </div>
  </details>`;
}
renderWeek=function(){
  const start=v1070WeekStart(),stats=v1070WeekStats(start),conflicts=v1070Conflicts(start),maxLoad=Math.max(600,...stats.days.map(x=>x.plannedSportLoad),...stats.days.map(x=>x.actualSportLoad)),todayWeek=Number(state.planningWeekOffset||0)===0;
  const plannedText=`${stats.plannedSessions} séance${stats.plannedSessions>1?'s':''} prévue${stats.plannedSessions>1?'s':''}`;
  return shell(`<header class="topbar"><div><div class="brand">Planning</div><div class="daylabel">Ta semaine d’entraînement</div></div></header>
    ${renderPlanningTabs('calendar')}
    <section class="planning-week-header-v1071"><button data-week-shift="-1" aria-label="Semaine précédente">←</button><div><div class="kicker">${todayWeek?'Cette semaine':'Semaine'}</div><h1>${v1070WeekLabel(start)}</h1><p>${plannedText} · ${stats.planned.toLocaleString('fr-FR')} UA prévues · ${stats.actualSessions} réalisée${stats.actualSessions>1?'s':''}</p></div><button data-week-shift="1" aria-label="Semaine suivante">→</button></section>
    <section class="planning-primary-actions"><button class="planning-new-event" data-plan-date="${v1070DateKey(new Date())}">＋ Planifier une activité</button>${todayWeek?'':`<button class="planning-today-week">Cette semaine</button>`}</section>
    ${v1071RenderAnalysis(stats,conflicts,maxLoad)}
    <section class="planning-days-v1071">${stats.days.map(v1071RenderDay).join('')}</section>`, "week");
};


/* ========================================================================== */
/* V10.73 · Rank shortcut from Progression                                    */
/* ========================================================================== */
const _renderProgressOverviewV1073=renderProgressOverview;
renderProgressOverview=function(){
  const rank=getRankState();
  let html=_renderProgressOverviewV1073();
  const target=`<h1>${rank.displayName}</h1>`;
  const replacement=`<button class="progress-rank-shortcut rank-${rank.current.id}" data-open-rank="true" aria-label="Ouvrir le système de rang ${rank.displayName}"><span class="progress-rank-shortcut-copy"><h1>${rank.displayName}</h1><small>Voir le rang et les exigences</small></span><b>→</b></button>`;
  if(html.includes(target))html=html.replace(target,replacement);
  return html;
};

const _bindEventsV1073=bindEvents;
bindEvents=function(){
  _bindEventsV1073();
  document.querySelectorAll('[data-open-rank]').forEach(b=>b.onclick=()=>{
    const rank=getRankState();
    state.selectedRankId=rank.current.id;
    state.view='skills';
    render();
    requestAnimationFrame(()=>{
      const details=document.querySelector('.cap-rank-details');
      if(details){
        details.open=true;
        requestAnimationFrame(()=>details.scrollIntoView({behavior:'smooth',block:'start'}));
      }
    });
  });
};


/* ========================================================================== */
/* V10.74 · Gainage Timer                                                     */
/* Standalone core holds · live timer · save every set into Quick Logs        */
/* ========================================================================== */
Object.assign(state,{
  coreTimerOpen:false,
  coreTimer:{
    exercise:"Planche avant-bras",
    target:0,
    running:false,
    startedAt:null,
    elapsedMs:0,
    sessionSets:[]
  }
});
const CORE_TIMER_EXERCISES=[
  {name:"Planche avant-bras",side:false},
  {name:"Side plank gauche",logName:"Side plank",side:true,sideLabel:"G"},
  {name:"Side plank droite",logName:"Side plank",side:true,sideLabel:"D"},
  {name:"Hollow hold",side:false},
  {name:"Reverse plank",side:false},
  {name:"Tuck L-sit",side:false}
];
function coreTimerDef(){return CORE_TIMER_EXERCISES.find(x=>x.name===state.coreTimer.exercise)||CORE_TIMER_EXERCISES[0];}
function coreTimerElapsedMs(){
  const c=state.coreTimer;if(!c)return 0;
  return Math.max(0,Number(c.elapsedMs||0)+(c.running&&c.startedAt?Date.now()-Number(c.startedAt):0));
}
function coreTimerElapsedSec(){return Math.max(0,Math.floor(coreTimerElapsedMs()/1000));}
function coreTimerDisplaySeconds(){
  const elapsed=coreTimerElapsedSec(),target=Number(state.coreTimer.target||0);
  return target>0?Math.max(0,target-elapsed):elapsed;
}
function coreTimerFormat(sec){sec=Math.max(0,Math.round(Number(sec)||0));return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;}
function coreTimerPause(){
  const c=state.coreTimer;if(!c?.running)return;
  c.elapsedMs=coreTimerElapsedMs();c.startedAt=null;c.running=false;
}
function coreTimerReset(){const c=state.coreTimer;c.running=false;c.startedAt=null;c.elapsedMs=0;}
function coreTimerStart(){
  const c=state.coreTimer;if(c.running)return;
  c.startedAt=Date.now();c.running=true;
}
function coreTimerSavedToday(){
  const names=new Set(["Planche avant-bras","Side plank","Hollow hold","Reverse plank","Tuck L-sit"]);
  return getQuickLogs().filter(x=>localDateKey(x.date)===localDateKey(new Date())&&names.has(x.exercise)&&String(x.type||'').startsWith('hold'));
}
function coreTimerTodaySummary(){
  const rows=coreTimerSavedToday(),seconds=rows.reduce((s,x)=>s+Number(x.value||0)*(x.type==='hold_side'?2:1),0);
  return {sets:rows.length,seconds};
}
function renderCoreTimerOverlay(){
  if(!state.coreTimerOpen)return '';
  const c=state.coreTimer,def=coreTimerDef(),elapsed=coreTimerElapsedSec(),display=coreTimerDisplaySeconds(),target=Number(c.target||0),session=c.sessionSets||[],total=session.reduce((s,x)=>s+x.seconds,0),today=coreTimerTodaySummary();
  return `<div class="core-timer-overlay" role="dialog" aria-modal="true" aria-label="Chronomètre de gainage">
    <section class="core-timer-sheet">
      <header class="core-timer-head"><div><div class="kicker">Gainage</div><h2>Chronomètre</h2></div><button class="icon-btn" id="closeCoreTimer" aria-label="Fermer">×</button></header>
      <div class="core-timer-exercises" role="listbox" aria-label="Exercice">${CORE_TIMER_EXERCISES.map(x=>`<button type="button" class="${x.name===c.exercise?'active':''}" data-core-exercise="${encodeURIComponent(x.name)}">${esc(x.name)}</button>`).join('')}</div>
      <div class="core-timer-targets"><span>Mode</span><button class="${target===0?'active':''}" data-core-target="0">Libre</button>${[30,45,60,90,120].map(n=>`<button class="${target===n?'active':''}" data-core-target="${n}">${n}s</button>`).join('')}</div>
      <div class="core-timer-clock ${c.running?'running':''} ${target>0&&elapsed>=target?'finished':''}">
        <span>${target>0?'RESTE':'CHRONO'}</span>
        <strong id="coreTimerClock">${coreTimerFormat(display)}</strong>
        <small id="coreTimerSub">${target>0?`${coreTimerFormat(elapsed)} réalisé · objectif ${coreTimerFormat(target)}`:'Appuie sur démarrer au début du maintien.'}</small>
      </div>
      <div class="core-timer-controls">
        <button class="btn btn-outline" id="resetCoreTimer">Réinitialiser</button>
        <button class="btn btn-primary core-timer-main" id="toggleCoreTimer">${c.running?'Pause':'Démarrer'}</button>
      </div>
      <button class="core-timer-save ${elapsed>0?'':'disabled'}" id="saveCoreTimerSet" ${elapsed>0?'':'disabled'}>
        <span>✓ Enregistrer cette série</span><strong>${elapsed?coreTimerFormat(elapsed):'—'}</strong>
      </button>
      ${session.length?`<section class="core-timer-session"><div><span>Cette session</span><strong>${session.length} série${session.length>1?'s':''} · ${coreTimerFormat(total)}</strong></div><div class="core-timer-set-list">${session.map((x,i)=>`<span><b>${i+1}</b>${esc(x.label)} · ${coreTimerFormat(x.seconds)}</span>`).join('')}</div></section>`:''}
      <footer class="core-timer-footer"><span>Aujourd’hui</span><strong>${today.sets} maintien${today.sets!==1?'s':''} · ${coreTimerFormat(today.seconds)}</strong><small>Chaque série enregistrée alimente Progression et le volume Core.</small></footer>
    </section>
  </div>`;
}
function coreTimerSaveSet(){
  coreTimerPause();
  const sec=Math.max(1,Math.round(coreTimerElapsedMs()/1000));if(sec<1)return;
  const def=coreTimerDef(),logName=def.logName||def.name,type=def.side?'hold_side':'hold';
  state.coreTimer.sessionSets=[...(state.coreTimer.sessionSets||[]),{label:def.name,seconds:sec,date:new Date().toISOString()}];
  const logs=getQuickLogs();
  logs.unshift({id:Date.now(),date:new Date().toISOString(),exercise:logName,type,value:sec,band:null,loadKg:null,source:'core_timer',side:def.sideLabel||null});
  setQuickLogs(logs.slice(0,5000));
  coreTimerReset();render();
}
function renderTodayCoreTimer(){
  const s=coreTimerTodaySummary();
  return `<section class="today-core-timer">
    <button type="button" data-open-core-timer="true"><span class="today-core-icon">${uiIcon('clock')}</span><div><strong>Gainage</strong><small>${s.sets?`${s.sets} maintien${s.sets>1?'s':''} · ${coreTimerFormat(s.seconds)} aujourd’hui`:'Chronomètre + enregistrement des maintiens'}</small></div><b>Chrono →</b></button>
  </section>`;
}

/* Put the gainage shortcut directly after the primary Today actions. */
const _renderTodayV1074=renderToday;
renderToday=function(){
  let html=_renderTodayV1074(),marker='</section>';
  const cockpit=html.indexOf('<section class="today-cockpit today-primary-actions');
  if(cockpit>=0){
    const close=html.indexOf(marker,cockpit);
    if(close>=0)html=html.slice(0,close+marker.length)+renderTodayCoreTimer()+html.slice(close+marker.length);
  }
  return html;
};

/* Overlay is available from every regular screen once opened. */
const _shellV1074=shell;
shell=function(content,activeTab=state.view){return _shellV1074(content,activeTab)+renderCoreTimerOverlay();};

let coreTimerTicker=null;
function stopCoreTimerTicker(){if(coreTimerTicker){clearInterval(coreTimerTicker);coreTimerTicker=null;}}
function updateCoreTimerDom(){
  if(!state.coreTimerOpen)return stopCoreTimerTicker();
  const clock=document.getElementById('coreTimerClock'),sub=document.getElementById('coreTimerSub'),save=document.getElementById('saveCoreTimerSet');if(!clock)return;
  const elapsed=coreTimerElapsedSec(),target=Number(state.coreTimer.target||0),display=target?Math.max(0,target-elapsed):elapsed;
  clock.textContent=coreTimerFormat(display);
  if(sub)sub.textContent=target?`${coreTimerFormat(elapsed)} réalisé · objectif ${coreTimerFormat(target)}`:'Chrono libre · arrête quand la position n’est plus propre.';
  if(save){save.disabled=elapsed<=0;save.classList.toggle('disabled',elapsed<=0);const strong=save.querySelector('strong');if(strong)strong.textContent=elapsed?coreTimerFormat(elapsed):'—';}
  if(target>0&&elapsed>=target&&state.coreTimer.running){
    coreTimerPause();stopCoreTimerTicker();render();
  }
}
function startCoreTimerTicker(){stopCoreTimerTicker();if(state.coreTimer.running)coreTimerTicker=setInterval(updateCoreTimerDom,250);}

/* Timer interactions. */
const _bindEventsV1074=bindEvents;
bindEvents=function(){
  _bindEventsV1074();
  document.querySelectorAll('[data-open-core-timer]').forEach(b=>b.onclick=()=>{state.coreTimerOpen=true;render();});
  const close=document.getElementById('closeCoreTimer');if(close)close.onclick=()=>{coreTimerPause();stopCoreTimerTicker();state.coreTimerOpen=false;render();};
  const toggle=document.getElementById('toggleCoreTimer');if(toggle)toggle.onclick=()=>{if(state.coreTimer.running)coreTimerPause();else coreTimerStart();render();};
  const reset=document.getElementById('resetCoreTimer');if(reset)reset.onclick=()=>{coreTimerReset();render();};
  const save=document.getElementById('saveCoreTimerSet');if(save)save.onclick=coreTimerSaveSet;
  document.querySelectorAll('[data-core-exercise]').forEach(b=>b.onclick=()=>{coreTimerPause();coreTimerReset();state.coreTimer.exercise=decodeURIComponent(b.dataset.coreExercise);render();});
  document.querySelectorAll('[data-core-target]').forEach(b=>b.onclick=()=>{coreTimerPause();coreTimerReset();state.coreTimer.target=Number(b.dataset.coreTarget||0);render();});
  startCoreTimerTicker();
};


/* ========================================================================== */
/* V10.75 · Gainage Routines                                                  */
/* Parametric hold circuits · rounds · rests · guided automatic timer         */
/* ========================================================================== */
STORAGE.coreRoutines="kinetik_core_routines_v1";
Object.assign(state,{
  coreRoutineTab:"timer",
  coreRoutineEditor:false,
  coreRoutineDraft:null,
  coreRoutineRun:null
});

const CORE_ROUTINE_EXERCISES=[
  "Planche avant-bras",
  "Side plank gauche",
  "Side plank droite",
  "Hollow hold",
  "Reverse plank",
  "Tuck L-sit",
  "Side plank étoile"
];

function getCoreRoutines(){return parse(STORAGE.coreRoutines,[]);}
function setCoreRoutines(v){save(STORAGE.coreRoutines,v);}
function coreRoutineById(id){return getCoreRoutines().find(x=>String(x.id)===String(id))||null;}
function defaultCoreRoutine(){
  return {
    id:null,
    name:"Ma routine gainage",
    rounds:3,
    restBetweenSteps:0,
    restBetweenRounds:90,
    steps:[
      {exercise:"Planche avant-bras",duration:60},
      {exercise:"Side plank gauche",duration:30},
      {exercise:"Side plank droite",duration:30}
    ]
  };
}
function normalizeCoreRoutine(r={}){
  const d=defaultCoreRoutine();
  return {
    id:r.id??d.id,
    name:String(r.name||d.name).slice(0,80),
    rounds:clamp(Math.round(Number(r.rounds||d.rounds)),1,20),
    restBetweenSteps:clamp(Math.round(Number(r.restBetweenSteps??d.restBetweenSteps)),0,600),
    restBetweenRounds:clamp(Math.round(Number(r.restBetweenRounds??d.restBetweenRounds)),0,900),
    steps:(Array.isArray(r.steps)&&r.steps.length?r.steps:d.steps).slice(0,20).map(x=>({
      exercise:CORE_ROUTINE_EXERCISES.includes(x.exercise)?x.exercise:"Planche avant-bras",
      duration:clamp(Math.round(Number(x.duration||30)),5,600)
    }))
  };
}
function coreRoutineTotalSeconds(r){
  r=normalizeCoreRoutine(r);
  const work=r.steps.reduce((s,x)=>s+x.duration,0)*r.rounds;
  const stepRests=Math.max(0,r.steps.length-1)*r.restBetweenSteps*r.rounds;
  const roundRests=Math.max(0,r.rounds-1)*r.restBetweenRounds;
  return work+stepRests+roundRests;
}
function coreRoutineWorkSeconds(r){r=normalizeCoreRoutine(r);return r.steps.reduce((s,x)=>s+x.duration,0)*r.rounds;}
function coreRoutineStepLogInfo(exercise){
  if(exercise==="Side plank gauche")return {exercise:"Side plank",side:"G"};
  if(exercise==="Side plank droite")return {exercise:"Side plank",side:"D"};
  if(exercise==="Side plank étoile")return {exercise:"Side plank étoile",side:null};
  return {exercise,side:null};
}
function saveCoreHold(exercise,seconds,source="core_timer",meta={}){
  const info=coreRoutineStepLogInfo(exercise),sec=Math.max(1,Math.round(Number(seconds)||0));
  const logs=getQuickLogs();
  logs.unshift({
    id:Date.now()+Math.floor(Math.random()*1000),
    date:new Date().toISOString(),
    exercise:info.exercise,
    type:"hold",
    value:sec,
    band:null,
    loadKg:null,
    source,
    side:info.side,
    ...meta
  });
  setQuickLogs(logs.slice(0,5000));
}
function openCoreRoutineEditor(id=null){
  const existing=id?coreRoutineById(id):null;
  state.coreRoutineDraft=normalizeCoreRoutine(existing||defaultCoreRoutine());
  state.coreRoutineEditor=true;
  state.coreRoutineTab="routines";
  render();
}
function syncCoreRoutineDraftFromDom(){
  const d=state.coreRoutineDraft;if(!d)return;
  const name=document.getElementById("coreRoutineName");if(name)d.name=name.value||"Ma routine gainage";
  const rounds=document.getElementById("coreRoutineRounds");if(rounds)d.rounds=clamp(Math.round(Number(rounds.value||1)),1,20);
  const rs=document.getElementById("coreRoutineStepRest");if(rs)d.restBetweenSteps=clamp(Math.round(Number(rs.value||0)),0,600);
  const rr=document.getElementById("coreRoutineRoundRest");if(rr)d.restBetweenRounds=clamp(Math.round(Number(rr.value||0)),0,900);
  const steps=[];
  document.querySelectorAll(".core-routine-step-edit").forEach(row=>{
    const exercise=row.querySelector(".core-routine-exercise")?.value||"Planche avant-bras";
    const duration=clamp(Math.round(Number(row.querySelector(".core-routine-duration")?.value||30)),5,600);
    steps.push({exercise,duration});
  });
  if(steps.length)d.steps=steps;
}
function saveCoreRoutineDraft(){
  syncCoreRoutineDraftFromDom();
  const d=normalizeCoreRoutine(state.coreRoutineDraft),rows=getCoreRoutines();
  if(d.id){
    const i=rows.findIndex(x=>String(x.id)===String(d.id));if(i>=0)rows[i]={...d,updatedAt:new Date().toISOString()};
  }else{
    d.id=`cr_${Date.now()}`;d.createdAt=new Date().toISOString();rows.unshift(d);
  }
  setCoreRoutines(rows.slice(0,50));
  state.coreRoutineEditor=false;state.coreRoutineDraft=null;state.coreRoutineTab="routines";render();
}
function deleteCoreRoutine(id){
  setCoreRoutines(getCoreRoutines().filter(x=>String(x.id)!==String(id)));
  if(state.coreRoutineDraft&&String(state.coreRoutineDraft.id)===String(id)){state.coreRoutineDraft=null;state.coreRoutineEditor=false;}
  render();
}
function coreRoutineSequence(r){
  r=normalizeCoreRoutine(r);const seq=[];
  for(let round=1;round<=r.rounds;round++){
    r.steps.forEach((step,i)=>{
      seq.push({kind:"work",round,index:i,exercise:step.exercise,duration:step.duration,label:step.exercise});
      if(i<r.steps.length-1&&r.restBetweenSteps>0)seq.push({kind:"rest",round,index:i,duration:r.restBetweenSteps,label:"Repos"});
    });
    if(round<r.rounds&&r.restBetweenRounds>0)seq.push({kind:"roundRest",round,index:r.steps.length-1,duration:r.restBetweenRounds,label:`Repos avant série ${round+1}`});
  }
  return seq;
}
function startCoreRoutine(id){
  const r=coreRoutineById(id);if(!r)return;
  coreTimerPause();stopCoreTimerTicker();
  const seq=coreRoutineSequence(r);
  state.coreRoutineRun={
    routine:normalizeCoreRoutine(r),
    sequence:seq,
    phaseIndex:0,
    running:false,
    startedAt:null,
    elapsedMs:0,
    completed:[],
    startedDate:new Date().toISOString()
  };
  state.coreRoutineTab="run";state.coreRoutineEditor=false;render();
}
function coreRoutineRunPhase(){const x=state.coreRoutineRun;return x?.sequence?.[x.phaseIndex]||null;}
function coreRoutineRunElapsedMs(){
  const x=state.coreRoutineRun;if(!x)return 0;
  return Math.max(0,Number(x.elapsedMs||0)+(x.running&&x.startedAt?Date.now()-Number(x.startedAt):0));
}
function coreRoutineRunElapsedSec(){return Math.floor(coreRoutineRunElapsedMs()/1000);}
function coreRoutineRunRemaining(){const p=coreRoutineRunPhase();return p?Math.max(0,Number(p.duration||0)-coreRoutineRunElapsedSec()):0;}
function coreRoutineRunPause(){
  const x=state.coreRoutineRun;if(!x?.running)return;
  x.elapsedMs=coreRoutineRunElapsedMs();x.startedAt=null;x.running=false;
}
function coreRoutineRunStart(){
  const x=state.coreRoutineRun;if(!x||x.running||!coreRoutineRunPhase())return;
  x.startedAt=Date.now();x.running=true;
}
function coreRoutineRunResetPhase(){const x=state.coreRoutineRun;if(!x)return;x.running=false;x.startedAt=null;x.elapsedMs=0;}
function coreRoutineAdvance({saveWork=true}={}){
  const x=state.coreRoutineRun,p=coreRoutineRunPhase();if(!x||!p)return;
  coreRoutineRunPause();
  const elapsed=Math.min(Number(p.duration||0),Math.max(0,Math.round(coreRoutineRunElapsedMs()/1000)));
  if(p.kind==="work"&&saveWork&&elapsed>0){
    saveCoreHold(p.exercise,elapsed,"core_routine",{routineId:x.routine.id,routineName:x.routine.name,round:p.round});
    x.completed.push({exercise:p.exercise,seconds:elapsed,round:p.round});
  }
  x.phaseIndex++;
  x.elapsedMs=0;x.startedAt=null;x.running=false;
  if(x.phaseIndex>=x.sequence.length){
    const summary={...x,finishedAt:new Date().toISOString()};
    state.coreRoutineRun={...summary,finished:true};
  }else{
    /* Once the routine has started, phases chain automatically. */
    x.startedAt=Date.now();x.running=true;
  }
  render();
}
function coreRoutineSkip(){
  const p=coreRoutineRunPhase();if(!p)return;
  const elapsed=coreRoutineRunElapsedSec();
  /* On a work phase, ending early records the actual clean hold. */
  coreRoutineAdvance({saveWork:p.kind==="work"&&elapsed>0});
}
function coreRoutineStop(){
  coreRoutineRunPause();state.coreRoutineRun=null;state.coreRoutineTab="routines";render();
}
function coreRoutineCurrentProgress(){
  const x=state.coreRoutineRun;if(!x)return 0;
  return x.sequence.length?Math.round(Math.min(x.phaseIndex,x.sequence.length)/x.sequence.length*100):0;
}
function renderCoreRoutineEditor(){
  const d=normalizeCoreRoutine(state.coreRoutineDraft||defaultCoreRoutine());
  return `<section class="core-routine-editor">
    <header><div><div class="kicker">Routine personnalisée</div><h3>${d.id?"Modifier":"Créer"} une routine</h3></div><button class="icon-btn" id="closeCoreRoutineEditor">×</button></header>
    <label class="core-routine-field"><span>Nom</span><input id="coreRoutineName" value="${esc(d.name)}" maxlength="80"></label>
    <div class="core-routine-settings">
      <label><span>Séries</span><input id="coreRoutineRounds" type="number" min="1" max="20" value="${d.rounds}"></label>
      <label><span>Repos entre exercices</span><div><input id="coreRoutineStepRest" type="number" min="0" max="600" step="5" value="${d.restBetweenSteps}"><b>s</b></div></label>
      <label><span>Repos entre séries</span><div><input id="coreRoutineRoundRest" type="number" min="0" max="900" step="5" value="${d.restBetweenRounds}"><b>s</b></div></label>
    </div>
    <div class="core-routine-builder-head"><div><span>Enchaînement</span><small>Ordre exécuté à chaque série</small></div><button id="addCoreRoutineStep">＋ Exercice</button></div>
    <div id="coreRoutineSteps" class="core-routine-steps-edit">${d.steps.map((s,i)=>renderCoreRoutineStepEditor(s,i)).join("")}</div>
    <div class="core-routine-preview"><span>Durée estimée</span><strong id="coreRoutinePreviewDuration">${coreTimerFormat(coreRoutineTotalSeconds(d))}</strong><small>${coreTimerFormat(coreRoutineWorkSeconds(d))} de gainage effectif</small></div>
    <div class="core-routine-editor-actions"><button class="btn btn-outline" id="cancelCoreRoutineEditor">Annuler</button><button class="btn btn-primary" id="saveCoreRoutine">Enregistrer la routine</button></div>
  </section>`;
}
function renderCoreRoutineStepEditor(step,i){
  return `<div class="core-routine-step-edit" data-step-index="${i}">
    <span class="core-routine-order">${i+1}</span>
    <select class="core-routine-exercise">${CORE_ROUTINE_EXERCISES.map(n=>`<option value="${esc(n)}" ${n===step.exercise?"selected":""}>${esc(n)}</option>`).join("")}</select>
    <div class="core-routine-duration-wrap"><input class="core-routine-duration" type="number" min="5" max="600" step="5" value="${step.duration}"><b>s</b></div>
    <div class="core-routine-step-actions"><button data-core-step-move="-1" ${i===0?"disabled":""}>↑</button><button data-core-step-move="1">↓</button><button data-core-step-delete="true" aria-label="Supprimer">×</button></div>
  </div>`;
}
function renderCoreRoutineLibrary(){
  const rows=getCoreRoutines();
  return `<section class="core-routine-library">
    <div class="core-routine-library-head"><div><div class="kicker">Mes routines</div><h3>${rows.length?`${rows.length} routine${rows.length>1?"s":""}`:"Crée ton premier circuit"}</h3></div><button id="newCoreRoutine">＋ Nouvelle</button></div>
    ${rows.length?`<div class="core-routine-list">${rows.map(r=>{
      const n=normalizeCoreRoutine(r),work=coreRoutineWorkSeconds(n),total=coreRoutineTotalSeconds(n);
      return `<article class="core-routine-row"><button class="core-routine-main" data-start-core-routine="${n.id}"><div><strong>${esc(n.name)}</strong><span>${n.rounds} série${n.rounds>1?"s":""} · ${n.steps.length} exercice${n.steps.length>1?"s":""} · ${coreTimerFormat(total)}</span><small>${n.steps.map(x=>`${esc(x.exercise)} ${x.duration}s`).join(" · ")}</small></div><b>Démarrer →</b></button><div class="core-routine-row-actions"><button data-edit-core-routine="${n.id}">Modifier</button><button data-delete-core-routine="${n.id}">×</button></div></article>`;
    }).join("")}</div>`:`<div class="core-routine-empty"><strong>Construis une routine exactement comme tu veux.</strong><span>Exemple : 60 s planche · 30 s côté gauche · 30 s côté droit · 3 séries · 90 s de repos entre séries.</span><button class="btn btn-primary" id="newCoreRoutineEmpty">Créer une routine</button></div>`}
  </section>`;
}
function renderCoreRoutineRun(){
  const x=state.coreRoutineRun;if(!x)return renderCoreRoutineLibrary();
  if(x.finished){
    const total=x.completed.reduce((s,a)=>s+a.seconds,0);
    return `<section class="core-routine-finished"><div class="core-routine-complete-mark">✓</div><div class="kicker">Routine terminée</div><h3>${esc(x.routine.name)}</h3><strong>${coreTimerFormat(total)} de gainage</strong><span>${x.completed.length} maintien${x.completed.length>1?"s":""} enregistrés automatiquement dans Progression.</span><button class="btn btn-primary" id="finishCoreRoutine">Terminer</button></section>`;
  }
  const p=coreRoutineRunPhase(),remaining=coreRoutineRunRemaining(),progress=coreRoutineCurrentProgress(),next=x.sequence[x.phaseIndex+1]||null;
  return `<section class="core-routine-run">
    <header><button class="back-btn" id="stopCoreRoutine">← Routines</button><div><span>Série ${p.round}/${x.routine.rounds}</span><strong>${esc(x.routine.name)}</strong></div></header>
    <div class="core-routine-run-progress"><i style="width:${progress}%"></i></div>
    <div class="core-routine-run-phase ${p.kind}">
      <span>${p.kind==="work"?"GAINAGE":"REPOS"}</span>
      <h3>${esc(p.label)}</h3>
      <strong id="coreRoutineRunClock">${coreTimerFormat(remaining)}</strong>
      <small id="coreRoutineRunSub">${p.kind==="work"?`Objectif ${coreTimerFormat(p.duration)} · maintien propre`:`Récupère · prochain : ${next?esc(next.label):"fin"}`}</small>
    </div>
    <div class="core-routine-run-actions">
      <button class="btn btn-outline" id="skipCoreRoutinePhase">${p.kind==="work"?(coreRoutineRunElapsedSec()>0?"Valider maintenant":"Passer"):"Passer le repos"}</button>
      <button class="btn btn-primary" id="toggleCoreRoutineRun">${x.running?"Pause":"Démarrer"}</button>
    </div>
    <div class="core-routine-run-next"><span>Ensuite</span><strong>${next?`${next.kind==="work"?esc(next.exercise):"Repos"} · ${coreTimerFormat(next.duration)}`:"Fin de la routine"}</strong></div>
    <details class="core-routine-run-plan"><summary>Voir toute la routine</summary><div>${x.sequence.map((s,i)=>`<span class="${i<x.phaseIndex?"done":i===x.phaseIndex?"current":""}"><b>${i+1}</b>${s.kind==="work"?esc(s.exercise):"Repos"} · ${coreTimerFormat(s.duration)}</span>`).join("")}</div></details>
  </section>`;
}

/* Upgrade the Gainage overlay with Timer / Routines tabs. */
const _renderCoreTimerOverlayV1075=renderCoreTimerOverlay;
renderCoreTimerOverlay=function(){
  if(!state.coreTimerOpen)return "";
  if(state.coreRoutineRun)return `<div class="core-timer-overlay" role="dialog" aria-modal="true" aria-label="Routine de gainage"><section class="core-timer-sheet core-routine-sheet">${renderCoreRoutineRun()}</section></div>`;
  const timerHtml=_renderCoreTimerOverlayV1075();
  const start=timerHtml.indexOf('<section class="core-timer-sheet">'),headEnd=timerHtml.indexOf('</header>',start);
  if(start<0||headEnd<0)return timerHtml;
  const tabs=`<div class="core-mode-tabs"><button class="${state.coreRoutineTab==="timer"?"active":""}" data-core-tab="timer">Chrono libre</button><button class="${state.coreRoutineTab==="routines"?"active":""}" data-core-tab="routines">Routines</button></div>`;
  if(state.coreRoutineTab==="timer"){
    return timerHtml.slice(0,headEnd+9)+tabs+timerHtml.slice(headEnd+9);
  }
  const end=timerHtml.lastIndexOf("</section></div>");
  const header=timerHtml.slice(0,headEnd+9);
  const body=state.coreRoutineEditor?renderCoreRoutineEditor():renderCoreRoutineLibrary();
  return header+tabs+body+(end>=0?timerHtml.slice(end):"</section></div>");
};

/* Today teaser shows routine count too. */
renderTodayCoreTimer=function(){
  const s=coreTimerTodaySummary(),r=getCoreRoutines();
  return `<section class="today-core-timer"><button type="button" data-open-core-timer="true"><span class="today-core-icon">${uiIcon("clock")}</span><div><strong>Gainage</strong><small>${s.sets?`${s.sets} maintien${s.sets>1?"s":""} · ${coreTimerFormat(s.seconds)} aujourd’hui`:"Chronomètre + routines personnalisées"}${r.length?` · ${r.length} routine${r.length>1?"s":""}`:""}</small></div><b>Ouvrir →</b></button></section>`;
};

let coreRoutineTicker=null;
function stopCoreRoutineTicker(){if(coreRoutineTicker){clearInterval(coreRoutineTicker);coreRoutineTicker=null;}}
function updateCoreRoutineRunDom(){
  const x=state.coreRoutineRun;if(!x||x.finished)return stopCoreRoutineTicker();
  const p=coreRoutineRunPhase(),clock=document.getElementById("coreRoutineRunClock"),sub=document.getElementById("coreRoutineRunSub");if(!p||!clock)return;
  const remaining=coreRoutineRunRemaining();clock.textContent=coreTimerFormat(remaining);
  if(sub&&p.kind==="work")sub.textContent=`${coreTimerFormat(coreRoutineRunElapsedSec())} réalisé · objectif ${coreTimerFormat(p.duration)}`;
  if(remaining<=0&&x.running){
    coreRoutineRunPause();stopCoreRoutineTicker();
    coreRoutineAdvance({saveWork:p.kind==="work"});
  }
}
function startCoreRoutineTicker(){stopCoreRoutineTicker();if(state.coreRoutineRun?.running)coreRoutineTicker=setInterval(updateCoreRoutineRunDom,200);}

/* Correct standalone left/right logs: one side is one measured hold, not doubled. */
coreTimerSaveSet=function(){
  coreTimerPause();
  const sec=Math.max(1,Math.round(coreTimerElapsedMs()/1000));if(sec<1)return;
  const def=coreTimerDef();
  state.coreTimer.sessionSets=[...(state.coreTimer.sessionSets||[]),{label:def.name,seconds:sec,date:new Date().toISOString()}];
  saveCoreHold(def.name,sec,"core_timer");
  coreTimerReset();render();
};

const _bindEventsV1075=bindEvents;
bindEvents=function(){
  _bindEventsV1075();
  document.querySelectorAll("[data-core-tab]").forEach(b=>b.onclick=()=>{coreTimerPause();stopCoreTimerTicker();state.coreRoutineTab=b.dataset.coreTab;state.coreRoutineEditor=false;state.coreRoutineDraft=null;render();});
  const newRoutine=()=>openCoreRoutineEditor(null);
  const nr=document.getElementById("newCoreRoutine");if(nr)nr.onclick=newRoutine;
  const nre=document.getElementById("newCoreRoutineEmpty");if(nre)nre.onclick=newRoutine;
  document.querySelectorAll("[data-edit-core-routine]").forEach(b=>b.onclick=()=>openCoreRoutineEditor(b.dataset.editCoreRoutine));
  document.querySelectorAll("[data-delete-core-routine]").forEach(b=>b.onclick=()=>{if(confirm("Supprimer cette routine ?"))deleteCoreRoutine(b.dataset.deleteCoreRoutine);});
  document.querySelectorAll("[data-start-core-routine]").forEach(b=>b.onclick=()=>startCoreRoutine(b.dataset.startCoreRoutine));
  const closeEditor=()=>{state.coreRoutineEditor=false;state.coreRoutineDraft=null;render();};
  const ce=document.getElementById("closeCoreRoutineEditor");if(ce)ce.onclick=closeEditor;
  const ca=document.getElementById("cancelCoreRoutineEditor");if(ca)ca.onclick=closeEditor;
  const save=document.getElementById("saveCoreRoutine");if(save)save.onclick=saveCoreRoutineDraft;
  const add=document.getElementById("addCoreRoutineStep");if(add)add.onclick=()=>{syncCoreRoutineDraftFromDom();state.coreRoutineDraft.steps.push({exercise:"Planche avant-bras",duration:30});render();};
  document.querySelectorAll(".core-routine-step-edit").forEach(row=>{
    const del=row.querySelector("[data-core-step-delete]");if(del)del.onclick=()=>{syncCoreRoutineDraftFromDom();const i=Number(row.dataset.stepIndex);if(state.coreRoutineDraft.steps.length>1)state.coreRoutineDraft.steps.splice(i,1);render();};
    row.querySelectorAll("[data-core-step-move]").forEach(b=>b.onclick=()=>{syncCoreRoutineDraftFromDom();const i=Number(row.dataset.stepIndex),j=i+Number(b.dataset.coreStepMove);if(j<0||j>=state.coreRoutineDraft.steps.length)return;const a=state.coreRoutineDraft.steps;[a[i],a[j]]=[a[j],a[i]];render();});
  });
  ["coreRoutineName","coreRoutineRounds","coreRoutineStepRest","coreRoutineRoundRest"].forEach(id=>{const e=document.getElementById(id);if(e)e.oninput=()=>{syncCoreRoutineDraftFromDom();const p=document.getElementById("coreRoutinePreviewDuration");if(p)p.textContent=coreTimerFormat(coreRoutineTotalSeconds(state.coreRoutineDraft));};});
  document.querySelectorAll(".core-routine-duration,.core-routine-exercise").forEach(e=>e.onchange=()=>{syncCoreRoutineDraftFromDom();const p=document.getElementById("coreRoutinePreviewDuration");if(p)p.textContent=coreTimerFormat(coreRoutineTotalSeconds(state.coreRoutineDraft));});
  const toggle=document.getElementById("toggleCoreRoutineRun");if(toggle)toggle.onclick=()=>{if(state.coreRoutineRun.running)coreRoutineRunPause();else coreRoutineRunStart();render();};
  const skip=document.getElementById("skipCoreRoutinePhase");if(skip)skip.onclick=coreRoutineSkip;
  const stop=document.getElementById("stopCoreRoutine");if(stop)stop.onclick=()=>{if(confirm("Quitter cette routine ? Les maintiens déjà terminés restent enregistrés."))coreRoutineStop();};
  const finish=document.getElementById("finishCoreRoutine");if(finish)finish.onclick=coreRoutineStop;
  startCoreRoutineTicker();
};


/* ========================================================================== */
/* V10.76 · Planning Visual Clarity                                           */
/* Strong day blocks · larger type · clearer workout hierarchy                */
/* ========================================================================== */
function v1076ExercisePreview(w){
  const rows=(w?.exercises||[]).filter(e=>(e.phase||'main')==='main'&&e.type!=='timer').slice(0,6);
  if(!rows.length)return '';
  return `<div class="planning-preview-v1076">${rows.map(e=>`<span>${esc(e.name)}</span>`).join('')}</div>`;
}
function v1076RenderKinetik(day){
  const k=day.kinetik;if(!k)return '';
  const actual=day.actualStrength[0],expanded=state.expandedWeekDay===k.day,w=k.workout;
  return `<section class="planning-session-v1076 ${actual?'completed':''}">
    <div class="planning-session-top-v1076">
      <div class="planning-session-title-v1076">
        <span class="planning-source-v1076">KINETIK</span>
        <h3>${esc(k.name)}</h3>
        <p>${esc(w.subtitle||'')}</p>
      </div>
      ${actual?`<span class="planning-status-v1076">Réalisé</span>`:''}
    </div>
    ${v1076ExercisePreview(w)}
    <div class="planning-session-meta-v1076">
      <span>${k.duration} min</span>
      <span>${w.exercises.length} étapes</span>
      ${actual?`<span>RPE ${actual.rpe||'—'}</span>`:`<span>${k.load} UA</span>`}
    </div>
    <button class="planning-exercises-action-v1076 week-toggle" data-day="${k.day}" aria-expanded="${expanded}">
      <span>${expanded?'Masquer les exercices':`Voir les ${w.exercises.length} exercices`}</span><b>${expanded?'↑':'↓'}</b>
    </button>
    ${v1071KinetikDetails(day)}
  </section>`;
}
function v1076RenderExternalEvent(e){
  const type=plannedEventType(e),actual=plannedEventActual(e),realText=v1070PlanRealizationText(e);
  return `<section class="planning-external-v1076 ${actual?'completed':''}">
    <div class="planning-external-v1076-head"><div><span>${e.time||'Activité'}</span><strong>${esc(type.label)}</strong></div><span>${v1070PriorityLabel(e.priority)}</span></div>
    <div class="planning-external-v1076-meta"><span>${e.duration} min</span><span>RPE ${e.rpe}</span>${realText?`<span>${esc(realText)}</span>`:''}</div>
    ${e.note?`<p>${esc(e.note)}</p>`:''}
    <div class="planning-external-v1076-actions">${!actual?`<button data-complete-plan="${e.id}">Réaliser</button>`:''}<button data-edit-plan="${e.id}">Modifier</button><button data-delete-plan="${e.id}">Supprimer</button></div>
  </section>`;
}
function v1076RenderDay(day){
  const weekday=DAY_NAMES[day.date.getDay()].slice(0,3).toUpperCase(),today=day.key===v1070DateKey(new Date()),
        linkedIds=new Set(day.manual.map(e=>String(plannedEventActual(e)?.id||''))),
        unplanned=day.actualManual.filter(a=>!linkedIds.has(String(a.id))),
        hasAnything=!!day.kinetik||day.manual.length||unplanned.length;
  return `<article class="planning-day-v1076 ${today?'today':''}">
    <header class="planning-day-head-v1076">
      <div class="planning-date-v1076">
        <span>${weekday}</span>
        <strong>${day.date.getDate()}</strong>
        ${today?'<em>Aujourd’hui</em>':''}
      </div>
      <button class="planning-day-add-v1076" data-plan-date="${day.key}" aria-label="Ajouter une activité">＋</button>
    </header>
    <div class="planning-day-content-v1076">
      ${v1076RenderKinetik(day)}
      ${day.manual.map(v1076RenderExternalEvent).join('')}
      ${unplanned.map(v1070RenderUnplannedActual).join('')}
      ${!hasAnything?`<section class="planning-rest-v1076"><strong>Repos</strong><span>Aucune séance principale prévue.</span></section>`:!day.kinetik&&day.manual.length?`<div class="planning-no-kinetik-v1076">Pas de séance KINETIK prévue</div>`:''}
      <button class="planning-mobility-v1076" data-view="flexibility"><span>Mobilité recommandée</span><strong>${recommendedFlexRoutine(day.date.getDay()).duration} min</strong><b>→</b></button>
    </div>
  </article>`;
}
renderWeek=function(){
  const start=v1070WeekStart(),stats=v1070WeekStats(start),conflicts=v1070Conflicts(start),
        maxLoad=Math.max(600,...stats.days.map(x=>x.plannedSportLoad),...stats.days.map(x=>x.actualSportLoad)),
        todayWeek=Number(state.planningWeekOffset||0)===0,
        plannedText=`${stats.plannedSessions} séance${stats.plannedSessions>1?'s':''}`;
  return shell(`<header class="topbar planning-topbar-v1076"><div><div class="brand">Planning</div><div class="daylabel">Ta semaine d’entraînement</div></div></header>
    ${renderPlanningTabs('calendar')}
    <section class="planning-week-header-v1076">
      <button data-week-shift="-1" aria-label="Semaine précédente">←</button>
      <div><div class="kicker">${todayWeek?'Cette semaine':'Semaine'}</div><h1>${v1070WeekLabel(start)}</h1><p>${plannedText} · ${stats.planned.toLocaleString('fr-FR')} UA prévues · ${stats.actualSessions} réalisée${stats.actualSessions>1?'s':''}</p></div>
      <button data-week-shift="1" aria-label="Semaine suivante">→</button>
    </section>
    <section class="planning-actions-v1076">
      <button class="planning-new-event" data-plan-date="${v1070DateKey(new Date())}">＋ Planifier une activité</button>
      ${todayWeek?'':`<button class="planning-today-week">Cette semaine</button>`}
    </section>
    ${v1071RenderAnalysis(stats,conflicts,maxLoad)}
    <section class="planning-days-v1076">${stats.days.map(v1076RenderDay).join('')}</section>`, "week");
};

/* V10.77 · Programmes heatmap moved to top for immediate cycle regularity visibility. */


/* ========================================================================== */
/* V10.78 · Planning consistency cleanup                                      */
/* Heatmap = regularity only. No rank implication.                         */
/* ========================================================================== */
const _renderCycleHeatmapV1078=renderCycleHeatmap;
renderCycleHeatmap=function(weeks=16){
  const today=new Date(),end=mondayDate(today);end.setDate(end.getDate()+6);
  const start=new Date(end);start.setDate(start.getDate()-(weeks*7-1));
  const cells=[],counts={done:0,'done-express':0,'rest-ok':0,missed:0,'rest-broken':0};
  for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)){
    const st=dailyCycleStatus(new Date(d));
    if(counts[st.status]!=null)counts[st.status]++;
    const label=st.status==='done'?'séance complète':
      st.status==='done-express'?'séance express':
      st.status==='rest-ok'?'repos respecté':
      st.status==='rest-planned'?'repos prévu':
      st.status==='rest-broken'?'repos interrompu':
      st.status==='missed'?'séance manquée':
      st.status==='planned'?'séance prévue':
      st.status==='untracked'?'avant suivi':'à venir';
    const title=`${st.key} · ${st.cycle.name} · ${label}`;
    cells.push(`<i class="cycle-heat-cell ${st.status}" title="${esc(title)}" aria-label="${esc(title)}"></i>`);
  }
  const completed=counts.done+counts['done-express'],planned=completed+counts.missed;
  const adherence=planned?Math.round(completed/planned*100):null;
  return `<section class="card cycle-heat-card cycle-heat-card-v1078">
    <div class="section-head cycle-heat-head-v1078">
      <div><div class="kicker">Régularité · ${weeks} semaines</div><h2>Historique du cycle</h2><p>Un aperçu simple de la façon dont le programme a réellement été suivi.</p></div>
      ${adherence!=null?`<div class="cycle-adherence-v1078"><strong>${adherence}%</strong><span>séances suivies</span></div>`:''}
    </div>
    <div class="cycle-heat-summary cycle-heat-summary-v1078">
      <span><strong>${completed}</strong> séances terminées</span>
      <span><strong>${counts['rest-ok']}</strong> repos respectés</span>
      <span><strong>${counts.missed}</strong> séances manquées</span>
    </div>
    <div class="cycle-heat-wrap">
      <div class="cycle-heat-days"><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span></div>
      <div class="cycle-heat-grid">${cells.join('')}</div>
    </div>
    <div class="cycle-heat-legend">
      <span><i class="done"></i>Complète</span>
      <span><i class="done-express"></i>Express</span>
      <span><i class="rest-ok"></i>Repos</span>
      <span><i class="missed"></i>Manquée</span>
      <span><i class="rest-broken"></i>Repos interrompu</span>
    </div>
    <p class="cycle-heat-note-v1078">Cette visualisation mesure uniquement la régularité du cycle. Elle n’influence pas ton rang KINETIK, qui reste basé sur les performances validées.</p>
  </section>`;
};


/* ========================================================================== */
