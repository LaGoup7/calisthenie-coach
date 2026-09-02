/* KINETIK v10.148 · Mobility, progression UX and product-coaching layers. */
/* V10.145 · Mobility finalisation                                            */
/* Today → Mobility balance → Progression → Secondary details                 */
/* ========================================================================== */
const V10145_MOBILITY_STALE_DAYS=28;
function v10145MobilityLevel(score){
  const n=Number(score);
  if(!Number.isFinite(n))return {label:'À évaluer',tone:'unassessed'};
  if(n<50)return {label:'À travailler',tone:'work'};
  if(n<65)return {label:'À améliorer',tone:'improve'};
  if(n<80)return {label:'Correcte',tone:'correct'};
  if(n<90)return {label:'Bonne',tone:'good'};
  return {label:'Excellente',tone:'excellent'};
}
function v10145DaysSince(value){
  if(!value)return null;
  const d=new Date(value);if(Number.isNaN(d.getTime()))return null;
  const now=new Date(),a=new Date(now.getFullYear(),now.getMonth(),now.getDate()),b=new Date(d.getFullYear(),d.getMonth(),d.getDate());
  return Math.max(0,Math.floor((a-b)/86400000));
}
function v10145MobilityFreshness(profile){
  if(!profile?.assessed||!profile.latest)return {label:'À évaluer',detail:'Aucune référence',tone:'unassessed',age:null,stale:true};
  const age=v10145DaysSince(profile.latest)??0;
  const partial=!profile.complete;
  if(partial)return {label:'Bilan partiel',detail:`${age===0?'Mesuré aujourd’hui':age===1?'Mesuré hier':`Dernière mesure · ${age} j`}`,tone:'partial',age,stale:true};
  if(age>=V10145_MOBILITY_STALE_DAYS)return {label:'À actualiser',detail:`Dernière mesure · ${age} j`,tone:'stale',age,stale:true};
  if(age===0)return {label:'À jour',detail:'Mesuré aujourd’hui',tone:'fresh',age,stale:false};
  if(age===1)return {label:'À jour',detail:'Mesuré hier',tone:'fresh',age,stale:false};
  return {label:'À jour',detail:`Mesuré il y a ${age} jours`,tone:'fresh',age,stale:false};
}
function v10145ZoneDefs(zone){return (zone?.tests||[]).map(id=>MOBILITY_TESTS.find(t=>t.id===id)).filter(Boolean);}
function v10145ZoneLatestRows(zone){
  return v10145ZoneDefs(zone).map(def=>({def,value:latestMobilityValue(def.id)}));
}
function v10145ZoneScoreAt(zone,cutoff){
  const defs=v10145ZoneDefs(zone).filter(d=>d.score!==false),logs=getMobilityTests();
  const rows=defs.map(def=>{
    const row=logs.filter(x=>x.testId===def.id&&new Date(x.date).getTime()<=cutoff).sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
    const value=row?Number(row.value):null;return {def,value,score:mobilityTestScore(def,value)};
  }).filter(x=>x.score!=null);
  if(!rows.length)return null;
  let score=rows.reduce((sum,x)=>sum+x.score,0)/rows.length;
  const sides=rows.filter(x=>x.def.side&&Number.isFinite(Number(x.value)));
  if(sides.length>=2){const target=Math.max(1,Number(sides[0].def.target||1)),asym=Math.abs(Number(sides[0].value)-Number(sides[1].value));score-=Math.min(15,(asym/target)*45);}
  return Math.round(clamp(score,0,100));
}
function v10145ZoneScoreHistory(zoneId){
  const zone=MOBILITY_ZONES.find(z=>z.id===zoneId)||MOBILITY_ZONES[0],ids=new Set(zone.tests||[]),logs=getMobilityTests().filter(x=>ids.has(x.testId)&&Number.isFinite(new Date(x.date).getTime()));
  const days=[...new Set(logs.map(x=>localDateKey(new Date(x.date))))].sort();
  return days.map(key=>{const d=new Date(`${key}T23:59:59.999`),score=v10145ZoneScoreAt(zone,d.getTime());return {key,date:d,score};}).filter(x=>x.score!=null);
}
function v10145TodayFlexLog(){
  const key=localDateKey();return getFlexLogs().filter(x=>localDateKey(new Date(x.date))===key).sort((a,b)=>new Date(b.date)-new Date(a.date))[0]||null;
}
function v10145MobilityToday(priority,recommended,targeted,cfg,mode){
  const goal=typeof getAthleteProfile==='function'?getAthleteProfile().primaryGoal||'Progression générale':'Progression générale',done=v10145TodayFlexLog();
  const priorityReason=!priority?.id
    ?'Quelques mesures suffisent pour que KINETIK identifie la zone la plus utile à travailler.'
    :priority.assessed
      ?`${priority.label} ressort de tes mesures${mobilityGoalWeights()[priority.id]>0?` et de ton objectif « ${esc(goal)} »`:''}.`
      :`${priority.label} est liée à ton objectif actuel. Une mesure permettra de confirmer ce choix.`;
  const impact=priority?.id?(priority.impact||[]).slice(0,3).join(' · '):'';
  const modeLabel=mode==='Recovery'?'Récupération':'Progression';
  return `<section class="mob145-today">
    <div class="mob145-today-copy">
      <div class="kicker">Aujourd’hui${priority?.id?` · ${modeLabel}`:''}</div>
      <div class="mob145-priority-line"><span>Zone à travailler</span><strong>${priority?.id?priority.label:'Bilan à compléter'}</strong>${priority?.assessed?`<b>${v10145MobilityLevel(priority.score).label} · ${priority.score}</b>`:''}</div>
      <h1>${priority?.id?recommended.name:'Construis ton bilan mobilité'}</h1>
      <p>${priorityReason}</p>
      ${impact?`<div class="mob145-why"><span>Pourquoi c’est utile</span><strong>${esc(impact)}</strong>${priority?.asymmetry!=null?`<small>Écart gauche / droite · ${priority.asymmetry.toFixed(1)} ${priority.asymmetryUnit||''}</small>`:''}</div>`:''}
      ${priority?.id?`<div class="mob145-routine-meta"><span>${recommended.duration} min</span><span>${recommended.focus}</span><span>Intensité douce · ${cfg.intensityMin}–${cfg.intensityMax}/10</span></div>`:''}
      ${done?`<div class="mob145-done"><span>✓</span><div><strong>Routine terminée aujourd’hui</strong><small>${Number(done.durationMinutes||0)||'—'} min${done.comfort?` · confort ${done.comfort}/5`:''}</small></div></div>`:''}
    </div>
    ${priority?.id?`<button class="btn btn-primary mob145-start start-flex" data-flex="${recommended.id}">${done?'Refaire une routine':'Commencer'}</button>`:`<button class="btn btn-primary mob145-start" id="openMobilityAssessment">Compléter mon bilan</button>`}
    <details class="mob145-formats"><summary>Choisir un autre format</summary><div>
      <button class="start-flex" data-flex="reset-10"><strong>Récupération</strong><span>≈ 10 min · doux</span></button>
      <button class="start-flex" data-flex="${targeted.id}"><strong>Ciblée</strong><span>≈ ${targeted.duration} min · ${priority?.label||targeted.focus}</span></button>
      <button class="start-flex" data-flex="full-25"><strong>Complète</strong><span>≈ 25 min · corps entier</span></button>
    </div></details>
  </section>`;
}
function v10145MobilityBalance(profiles,priority){
  const assessed=profiles.filter(x=>x.assessed).length;
  return `<section class="mob145-balance" id="mobilityAssessment">
    <div class="mob145-section-head"><div><div class="kicker">Ton bilan mobilité</div><h2>6 zones · une lecture simple</h2><p>Le score mesure ta distance à une amplitude fonctionnelle. Ouvre une zone pour voir ou mettre à jour ses mesures.</p></div><span>${assessed}/${profiles.length} évaluées</span></div>
    <div class="mob145-zone-grid">${profiles.map(p=>{
      const level=v10145MobilityLevel(p.score),fresh=v10145MobilityFreshness(p),defs=v10145ZoneDefs(p),done=defs.filter(d=>latestMobilityValue(d.id)!=null).length;
      return `<details class="mob145-zone mob-test-group ${level.tone} ${p.id===priority?.id?'priority':''}">
        <summary>
          <div class="mob145-zone-title"><strong>${p.label}</strong>${p.id===priority?.id?'<em>Zone à travailler</em>':''}</div>
          <div class="mob145-zone-score"><b>${p.assessed?p.score:'—'}</b><span>${level.label}</span></div>
          <div class="mob145-zone-meta"><span class="${fresh.tone}">${fresh.label}</span><small>${fresh.detail}${p.asymmetry!=null?` · écart ${p.asymmetry.toFixed(1)} ${p.asymmetryUnit||''}`:''}</small></div>
          <i><u style="width:${p.assessed?p.score:0}%"></u></i>
          <span class="mob145-zone-open">${done}/${defs.length} mesures · détails →</span>
        </summary>
        <div class="mob145-zone-body">
          ${defs.map(def=>{const latest=latestMobilityValue(def.id);return `<div class="mob-test-row"><div><strong>${def.name}</strong><small>${def.note}</small></div><div class="mob-test-current">${latest==null?'—':latest+' '+def.unit}</div><div class="mobility-entry"><input id="mob_${def.id}" type="number" inputmode="decimal" min="${def.min}" ${def.max!=null?`max="${def.max}"`:''} step="${def.step}" placeholder="${def.unit}"><button class="btn btn-secondary compact save-mobility" data-test="${def.id}">OK</button></div></div>`}).join('')}
          <div class="mob145-zone-footer"><button type="button" class="mob145-progress-link" data-mobility-zone="${p.id}">Voir la progression de ${p.label.toLowerCase()} →</button></div>
        </div>
      </details>`;
    }).join('')}</div>
  </section>`;
}
function v10145MobilityProgress(profiles,chartZone){
  const zone=MOBILITY_ZONES.find(z=>z.id===chartZone)||MOBILITY_ZONES[0],profile=profiles.find(p=>p.id===zone.id)||mobilityZoneProfile(zone),history=v10145ZoneScoreHistory(zone.id),level=v10145MobilityLevel(profile.score),fresh=v10145MobilityFreshness(profile);
  let content='';
  if(!history.length){
    content=`<div class="mob145-progress-empty"><strong>Aucune référence pour ${zone.label.toLowerCase()}</strong><span>Enregistre les premières mesures de cette zone pour créer ton point de départ.</span><button class="btn btn-outline compact" id="openMobilityAssessmentSecondary">Évaluer</button></div>`;
  }else if(history.length===1){
    content=`<div class="mob145-progress-baseline"><div><span>Première référence</span><strong>${profile.score} · ${level.label}</strong><small>${fresh.detail}</small></div><p>Une seule date de mesure pour le moment. Refais ce bilan dans quelques semaines pour visualiser une vraie évolution.</p></div>`;
  }else{
    const first=history[0].score,last=history[history.length-1].score,delta=last-first;
    content=`<div class="mob145-progress-summary"><div><span>Score actuel</span><strong>${last} · ${level.label}</strong></div><div><span>Depuis la première référence</span><strong>${delta>0?'+':''}${delta} pts</strong></div><div><span>Dernière mesure</span><strong>${fresh.age===0?'Aujourd’hui':fresh.age===1?'Hier':`${fresh.age} j`}</strong></div></div>${renderMobilityChart(zone.id)}`;
  }
  return `<section class="mob145-progress">
    <div class="mob145-section-head"><div><div class="kicker">Progression</div><h2>Est-ce que ça s’améliore ?</h2></div></div>
    <div class="mob145-zone-switch">${MOBILITY_ZONES.map(z=>`<button data-mobility-zone="${z.id}" class="${chartZone===z.id?'active':''}">${z.label}</button>`).join('')}</div>
    ${content}
  </section>`;
}
function v10145MobilityHistory(logs){
  return `<details class="mob145-secondary"><summary><div><div class="kicker">Historique</div><strong>${logs.length} routine${logs.length>1?'s':''} enregistrée${logs.length>1?'s':''}</strong></div><span>⌄</span></summary><div class="mob145-secondary-body">${logs.length?`<div class="mob-history">${logs.slice(0,10).map(l=>`<div><span>${formatDate(l.date)}</span><strong>${esc(l.name)}</strong><span>${l.durationMinutes} min</span><span>confort ${l.comfort||'—'}/5</span></div>`).join('')}</div>`:'<p class="muted">Ta première routine apparaîtra ici.</p>'}</div></details>`;
}
function v10145MobilityUnderstanding(cfg){
  return `<details class="mob145-secondary"><summary><div><div class="kicker">Comprendre</div><strong>Comment KINETIK choisit les recommandations</strong></div><span>⌄</span></summary><div class="mob145-secondary-body flex-research-body">
    <div class="research-rule"><b>1</b><p><strong>Amplitude mesurée :</strong> les tests comptent davantage que le simple temps passé à s’étirer.</p></div>
    <div class="research-rule"><b>2</b><p><strong>Objectif sportif :</strong> les zones utiles à tes skills et à ton programme sont davantage prioritaires.</p></div>
    <div class="research-rule"><b>3</b><p><strong>Travail récent :</strong> une zone déjà beaucoup sollicitée cette semaine est temporairement moins prioritaire.</p></div>
    <div class="research-rule"><b>4</b><p><strong>Actualisation :</strong> KINETIK conseille de rafraîchir un bilan après ${V10145_MOBILITY_STALE_DAYS} jours.</p></div>
  </div></details>`;
}
function v10145MobilitySafety(cfg){
  return `<details class="mob145-safety"><summary><span>ⓘ</span><strong>Ne force jamais une amplitude douloureuse.</strong><b>Consignes</b></summary><div>Recherche une tension confortable autour de ${cfg.intensityMin}–${cfg.intensityMax}/10. Arrête la routine en cas de douleur vive, pincement, engourdissement ou sensation électrique.</div></details>`;
}
function v1079MobilityProfile(profiles,priority,chartZone){return v10145MobilityBalance(profiles,priority);}

renderFlexibility=function(){
  const logs=getFlexLogs(),cfg=getFlexConfig(),recommended=recommendedFlexRoutine(),targeted=targetedFlexRoutine(),priority=mobilityPriority(),profiles=mobilityProfiles(),mode=mobilityRoutineMode(),chartZone=state.mobilityChartZone||priority?.id||'ankles';
  return shell(`<header class="topbar mobility-topbar mob145-topbar"><div><div class="brand">Mobilité</div><div class="daylabel">Aujourd’hui · bilan · progression</div></div></header>
    ${v10145MobilityToday(priority,recommended,targeted,cfg,mode)}
    ${v10145MobilityBalance(profiles,priority)}
    ${v10145MobilityProgress(profiles,chartZone)}
    <section class="mob145-secondary-group">
      ${v10145MobilityHistory(logs)}
      ${v10145MobilityUnderstanding(cfg)}
      ${renderFlexSettings()}
      ${v10145MobilitySafety(cfg)}
    </section>`,"flexibility");
};

/* ========================================================================== */
/* V10.80 · Progression Visual Clarity                                        */
/* Answer 3 questions: am I progressing, where, what next?                     */
/* ========================================================================== */
function v1080ProgressInsight(){
  const i=v1060InsightDecision(30),s=i.state,lim=i.limiter?.limiter;
  const signals=[
    {label:'Force',value:s.force?.value||'—',tone:s.force?.tone||'',symbol:s.force?.symbol||'—'},
    {label:'Skills',value:s.skills?.value||'—',tone:s.skills?.tone||'',symbol:s.skills?.symbol||'—'},
    {label:'Charge',value:s.load?.value||'—',tone:s.load?.tone||'',symbol:s.load?.symbol||'—'}
  ];
  return `<section class="p80-insight ${i.tone}">
    <div class="p80-insight-head"><div><div class="kicker">KINETIK Insight · 30 jours</div><h2>${esc(i.title)}</h2></div><button class="p80-text-action" data-progress-tab="performance">Voir l’analyse →</button></div>
    <p>${esc(i.text)}</p>
    <div class="p80-signal-row">${signals.map(x=>`<div class="${x.tone}"><span>${x.label}</span><strong>${x.symbol} ${esc(String(x.value))}</strong></div>`).join('')}</div>
    <div class="p80-insight-next">
      <div><span>Prochain meilleur choix</span><strong>${esc(i.next.label)}</strong><small>${esc(i.next.detail)}</small></div>
      <button ${i.next.action==='assessment'?'data-view="assessment"':i.next.action==='performance'?'data-progress-tab="performance"':'data-view="today"'}>Ouvrir →</button>
    </div>
    ${lim?`<div class="p80-limiter"><span>Facteur limitant · ${esc(getAthleteProfile().primaryGoal||'objectif actuel')}</span><strong>${esc(lim.label)}</strong></div>`:''}
  </section>`;
}
function v1080RankRow(){
  const r=getRankState(),next=r.next,readiness=Math.round(Number(r.readiness||0)*100);
  return `<button class="p80-rank-row rank-${r.current.id}" data-open-rank="true">
    <div><div class="kicker">Rang actuel</div><strong>${esc(r.displayName)}</strong><span>${next?`${readiness}% des exigences vers ${esc(next.name)}`:'Rang maximal atteint'}</span></div>
    <b>Exigences →</b>
  </button>`;
}
function v1080MainTrends(limit=4){
  const records=currentRecords().slice(0,limit);
  if(!records.length)return `<div class="p80-empty">Tes premières performances créeront les références.</div>`;
  return `<div class="p80-main-trends">${records.map(r=>{
    const stats=exerciseHistoryStats(r.exercise,30),trend=stats.trend;
    return `<button data-exercise-progress="${encodeURIComponent(r.exercise)}"><div><strong>${esc(r.exercise)}</strong><span>${formatShortDate(r.date)}</span></div><b>${recordValueText(r)}</b><small>${trend==null?'Référence':`${trend>=0?'+':''}${Math.round(trend)}% tendance`}</small></button>`;
  }).join('')}</div>`;
}
function v1080MobilityLine(){
  const profiles=mobilityProfiles(),assessed=profiles.filter(x=>x.assessed),p=mobilityPriority();
  return `<button class="p80-mobility-line" data-view="flexibility"><div><span>Mobilité</span><strong>${assessed.length}/${profiles.length} zones évaluées${p?.id?` · priorité ${p.label.toLowerCase()}`:''}</strong></div><b>Voir →</b></button>`;
}
renderProgressOverview=function(){
  const x=progressWeekStats(),rank=getRankState(),cycle=getCycleState(),recs=x.recs||[],coverage=assessmentCoverage();
  const sessionPct=x.cycle.planned?Math.round(x.cycle.done/x.cycle.planned*100):0;
  return `<section class="p80-week">
    <div><div class="kicker">Cette semaine · ${esc(getActiveTrainingCycle().name)}</div><h1>Semaine ${cycle.week} / ${cycle.weekCount}</h1><p>${esc(cycle.name)} · RIR ${cycle.rir} · ${Math.round(cycle.setFactor*100)}% volume prévu</p></div>
    <div class="p80-week-stats">
      <div><strong>${x.cycle.done}/${x.cycle.planned}</strong><span>Séances</span><small>${Math.min(100,sessionPct)}% prévu</small></div>
      <div><strong>${x.mins}</strong><span>Minutes</span><small>7 jours</small></div>
      <div><strong>${x.reps7.reps.toLocaleString('fr-FR')}</strong><span>Répétitions</span><small>${x.reps7.sets} séries</small></div>
    </div>
  </section>

  ${v1080ProgressInsight()}

  <section class="p80-actions">
    <div class="p80-section-head"><div><div class="kicker">À faire</div><h2>Ce qui demande ton attention</h2></div></div>
    <div class="p80-action-list">
      ${recs.length?`<button data-progress-tab="performance"><span>↗</span><div><strong>${recs.length} progression${recs.length>1?'s':''} disponible${recs.length>1?'s':''}</strong><small>${recs.slice(0,2).map(r=>`${r.current.name} → ${r.next.name}`).join(' · ')}</small></div><b>Voir →</b></button>`:''}
      <button data-view="assessment"><span>◷</span><div><strong>Évaluations</strong><small>${coverage.verifiedPct}% vérifié · ${x.due.label}</small></div><b>Évaluer →</b></button>
      ${v1080RankRow()}
    </div>
  </section>

  <section class="p80-trends">
    <div class="p80-section-head"><div><div class="kicker">Tendances principales</div><h2>Dernières performances</h2></div><button class="p80-text-action" data-progress-tab="performance">Tout voir →</button></div>
    ${v1080MainTrends(4)}
  </section>

  ${v1080MobilityLine()}`;
};

function v1080TestsBlock(){
  const due=testDueSummary(),coverage=assessmentCoverage();
  return `<details class="p80-tests">
    <summary><div><div class="kicker">Évaluations</div><strong>${coverage.tested}/${coverage.total} repères renseignés</strong><span>${due.label} · les validations standardisées passent par le Centre d’évaluation KINETIK.</span></div><b>Voir →</b></summary>
    <div class="p80-tests-body">
      <p class="p88-muted">Une performance enregistrée en séance ou en Quick Log reste une référence utile, mais seule une validation guidée KINETIK rafraîchit l’échéance d’un protocole standardisé.</p>
      <button class="btn btn-primary compact" data-view="assessment">Ouvrir le Centre d’évaluation →</button>
    </div>
  </details>`;
}

function v1080PerformanceRecords(){
  const records=currentRecords().slice(0,12);
  return `<section class="p80-performance-records">
    <div class="p80-section-head"><div><div class="kicker">Records principaux</div><h2>Ce qui devient meilleur</h2></div><span>${records.length} références</span></div>
    ${records.length?`<div class="p80-record-grid">${records.map(r=>{const s=exerciseHistoryStats(r.exercise,30);return `<button data-exercise-progress="${encodeURIComponent(r.exercise)}"><span>${esc(r.exercise)}</span><strong>${recordValueText(r)}</strong><small>${s.trend==null?'Référence actuelle':`${s.trend>=0?'↗ +':'↘ '}${Math.abs(Math.round(s.trend))}% · 30 j`}</small></button>`}).join('')}</div>`:'<div class="p80-empty">Enregistre quelques séances pour créer tes premières références.</div>'}
  </section>`;
}
renderProgressPerformance=function(){
  return `${v1080PerformanceRecords()}
    <section class="p80-performance-section">
      <div class="p80-section-head"><div><div class="kicker">Propositions</div><h2>Prêt à progresser</h2></div></div>
      ${renderProgressionRecommendations()}
    </section>
    <section class="p80-performance-section">
      <div class="p80-section-head"><div><div class="kicker">Tendances</div><h2>Par exercice</h2></div><span>5 dernières</span></div>
      <div class="p80-trend-body">${exerciseProgressRows()||'<div class="p80-empty">Termine quelques séances pour voir les tendances.</div>'}</div>
    </section>
    ${v1080TestsBlock()}
    ${state.exerciseDetailName?renderExerciseProgressDetail(state.exerciseDetailName):''}`;
};

function v1080VolumePeriodData(){
  const id=state.repVolumePeriod||'7d';
  return repetitionVolume(id);
}
renderProgressVolume=function(){
  const d=v1080VolumePeriodData(),top=d.rows.filter(r=>r.reps>0||r.holdSeconds>0).slice(0,12),
        max=Math.max(1,...top.map(r=>r.reps||Math.round(r.holdSeconds/3)));
  const periodButtons=[['7d','7 j'],['30d','30 j'],['90d','90 j'],['365d','1 an'],['all','Tout']];
  return `<section class="p80-volume">
    <div class="p80-section-head"><div><div class="kicker">Volume global</div><h2>Ce que tu as réellement accumulé</h2></div></div>
    <div class="p80-periods">${periodButtons.map(([id,label])=>`<button class="${state.repVolumePeriod===id?'active':''}" data-rep-period="${id}">${label}</button>`).join('')}</div>
    <div class="p80-volume-kpis">
      <div><strong>${d.reps.toLocaleString('fr-FR')}</strong><span>Répétitions</span></div>
      <div><strong>${d.sets.toLocaleString('fr-FR')}</strong><span>Séries</span></div>
      <div><strong>${d.exerciseCount}</strong><span>Exercices</span></div>
      <div><strong>${Math.round(d.holdSeconds/60)}</strong><span>Min de holds</span></div>
    </div>
    <p class="p80-volume-note">Séances guidées, Express, libres et Quick Logs sont réunis dans un même volume. La source reste disponible dans les données détaillées mais ne concurrence plus la lecture principale.</p>
    <div class="p80-volume-list">${top.length?top.map((r,i)=>{
      const amount=r.reps||Math.round(r.holdSeconds/3),label=r.reps?`${r.reps.toLocaleString('fr-FR')} reps`:`${coreTimerFormat(r.holdSeconds)} holds`;
      return `<div><div><span><i>${i+1}</i><strong>${esc(r.name)}</strong></span><b>${label}</b></div><u><i style="width:${Math.max(3,amount/max*100)}%"></i></u><small>${r.sets} séries</small></div>`;
    }).join(''):'<div class="p80-empty">Aucun volume enregistré sur cette période.</div>'}</div>
    <details class="p80-volume-advanced"><summary><div><strong>Analyse musculaire avancée</strong><span>Répartition par groupes et cibles personnelles</span></div><b>Ouvrir →</b></summary><div>${renderVolumePanel()}</div></details>
  </section>`;
};

renderProgressHistory=function(){
  const x=progressWeekStats(),h=x.h;
  return `<section class="p80-history-head">
    <div><div class="kicker">Historique</div><h1>Ton journal d’entraînement</h1><p>Retrouve ce que tu as réellement fait, sans mélanger historique et progression.</p></div>
    <div class="p80-history-stats"><div><strong>${h.length}</strong><span>Séances</span></div><div><strong>${x.recent.length}</strong><span>7 jours</span></div><div><strong>${x.mins}</strong><span>Min · 7 j</span></div></div>
  </section>
  <section class="p80-history-list">
    <div class="p80-section-head"><div><div class="kicker">Journal chronologique</div><h2>Dernières séances</h2></div></div>
    ${h.length?h.slice(0,40).map(s=>`<button class="p80-history-item" data-history="${s.id}">
      <div><strong>${esc(s.name)}</strong><span>${formatDate(s.date)} · ${s.durationMinutes} min · RPE ${s.rpe||'—'}</span>${summaryLine(s)}</div>
      <b>Voir →</b>
    </button>`).join(''):'<div class="p80-empty">Ta première séance terminée apparaîtra ici.</div>'}
  </section>
  ${state.selectedHistoryId?v1080HistoryDetail(state.selectedHistoryId):''}`;
};
function v1080HistoryDetail(id){
  const s=getHistory().find(x=>String(x.id)===String(id));if(!s)return'';
  return `<section class="p80-history-detail"><div class="p80-section-head"><div><div class="kicker">${formatDate(s.date)} · ${s.durationMinutes} min · RPE ${s.rpe||'—'}</div><h2>${esc(s.name)}</h2></div><button class="icon-btn" id="closeHistory">×</button></div>
    ${s.prs?.length?`<div class="history-prs">🏆 ${s.prs.map(p=>`${p.exercise} ${recordValueText(p)}`).join(' · ')}</div>`:''}
    <div class="p80-history-exercises">${(s.entries||[]).map(e=>`<div><span>${esc(e.exercise)} · S${e.set}${e.substitutedFrom?' · remplace '+esc(e.substitutedFrom):''}</span><strong>${e.value}${String(e.type||'').startsWith('hold')?' s':' reps'}${e.band?' · '+esc(e.band):''}${e.loadKg?' · sac '+e.loadKg+' kg':''}</strong></div>`).join('')}</div>
  </section>`;
}
renderProgress=function(){
  const content=state.progressTab==='performance'?renderProgressPerformance():state.progressTab==='volume'?renderProgressVolume():state.progressTab==='history'?renderProgressHistory():renderProgressOverview();
  return shell(`<header class="topbar p80-topbar"><div><div class="brand">Progression</div><div class="daylabel">Est-ce que je progresse · où · quoi faire ensuite</div></div></header>
    ${renderProgressTabs()}
    <div class="p80-content">${content}</div>`, "progress");
};


/* ========================================================================== */
/* V10.81 · Actionable Progress Insight                                       */
/* Problem → recommendation → supporting context                              */
/* ========================================================================== */
function v1081InsightSupportRow(s){
  const items=[
    {label:'Force',value:s.force?.value||'—',symbol:s.force?.symbol||'—'},
    {label:'Skills',value:s.skills?.value||'—',symbol:s.skills?.symbol||'—'},
    {label:'Charge',value:s.load?.value||'—',symbol:s.load?.symbol||'—'}
  ];
  return `<div class="p81-insight-support">${items.map(x=>`<span><b>${x.label}</b>${x.symbol} ${esc(String(x.value))}</span>`).join('')}</div>`;
}
v1080ProgressInsight=function(){
  const i=v1060InsightDecision(30),s=i.state,lim=i.limiter?.limiter;
  const issue=lim?.label||i.next?.label||'Progression générale';
  let reason=i.text||'KINETIK rassemble tes dernières données pour identifier le point qui mérite le plus ton attention.';
  let advice=i.next?.detail||'Continue ton cycle actuel et consolide les performances enregistrées.';
  if(lim){
    reason=`${issue} est actuellement le facteur le moins avancé parmi les dimensions mesurées de ton objectif.`;
  }
  return `<section class="p81-insight ${i.tone}">
    <div class="p81-insight-head">
      <div><div class="kicker">À surveiller maintenant</div><h2>${esc(issue)}</h2></div>
      <button class="p80-text-action" data-progress-tab="performance">Voir pourquoi →</button>
    </div>
    <p class="p81-insight-reason">${esc(reason)}</p>
    <div class="p81-advice">
      <span>Ce que KINETIK te conseille</span>
      <strong>${esc(i.next?.label||'Continuer le cycle')}</strong>
      <p>${esc(advice)}</p>
      <button ${i.next?.action==='assessment'?'data-view="assessment"':i.next?.action==='performance'?'data-progress-tab="performance"':'data-view="today"'}>Ouvrir →</button>
    </div>
    ${v1081InsightSupportRow(s)}
  </section>`;
};


/* ========================================================================== */
/* V10.82 · Étape 1 — Vocabulaire produit                                     */
/* Une notion = un terme visible. Les termes techniques restent secondaires.  */
/* ========================================================================== */
function v1082RirCopy(n){
  n=Number(n);
  return Number.isFinite(n)?`RIR ${n} · environ ${n} rep${n!==1?'s':''} en réserve`:'RIR —';
}
function v1082EffortCopy(n){
  n=Number(n);
  return Number.isFinite(n)?`Effort ${n}/10`:'Effort —';
}
function v1082LoadCopy(n){
  n=Math.round(Number(n)||0);
  return `Charge estimée · ${n.toLocaleString('fr-FR')} UA`;
}

/* "Quick Log" stays an internal data source; users see "Enregistrement rapide". */
const _renderQuickLogModalV1082=renderQuickLogModal;
renderQuickLogModal=function(){
  let html=_renderQuickLogModalV1082();
  return html
    .replace('<div class="kicker">Quick Log</div>','<div class="kicker">Enregistrement rapide</div>')
    .replace('Ajouter une micro-série','Enregistrer une performance')
    .replace('Répéter en 1 tap','Répéter rapidement');
};

/* Mobility uses its own vocabulary: a zone to work, not another generic priority. */
const _v1079MobilityProfileV1082=v1079MobilityProfile;
v1079MobilityProfile=function(profiles,priority,chartZone){
  return _v1079MobilityProfileV1082(profiles,priority,chartZone)
    .replace(/<em>Priorité<\/em>/g,'<em>À travailler</em>');
};

const _renderFlexibilityV1082=renderFlexibility;
renderFlexibility=function(){
  let html=_renderFlexibilityV1082();
  html=html
    .replace('<div class="mob79-priority-line"><span>Priorité</span>','<div class="mob79-priority-line"><span>Zone à travailler</span>')
    .replace(/Priorité ([^<]+) selon tes mesures/g,'Zone à travailler : $1')
    .replace(/Priorité ([^<]+) ·/g,'Zone à travailler : $1 ·');
  return html;
};

/* Planning: explain the abstract load unit at the point where it matters. */
const _v1076RenderKinetikV1082=v1076RenderKinetik;
v1076RenderKinetik=function(day){
  let html=_v1076RenderKinetikV1082(day);
  if(day?.kinetik && !day.actualStrength?.[0]){
    const load=Number(day.kinetik.load||0);
    html=html.replace(`<span>${load} UA</span>`,`<span title="UA = durée × effort perçu. Cette unité sert à comparer la charge entre tes journées et tes semaines.">${v1082LoadCopy(load)}</span>`);
  }
  return html;
};

/* Activity logging: RPE is useful internally, "effort" is clearer in the main UI. */
const _renderActivityEditorV1082=renderActivityEditor;
renderActivityEditor=function(){
  let html=_renderActivityEditorV1082();
  return html
    .replace(/RPE réel/g,'Effort réel')
    .replace(/RPE prévu/g,'Effort prévu')
    .replace(/RPE/g,'effort')
    .replace(/durée × effort/gi,'durée × effort perçu')
    .replace(/<small>UA<\/small>/g,'<small title="Unité de charge : durée × effort perçu">UA</small>');
};

/* Progression: remove technical shorthand from the first reading level. */
const _renderProgressOverviewV1082=renderProgressOverview;
renderProgressOverview=function(){
  let html=_renderProgressOverviewV1082();
  const c=getCycleState();
  html=html.replace(`RIR ${c.rir} ·`,`${v1082RirCopy(c.rir)} ·`);
  return html;
};

const _renderProgressHistoryV1082=renderProgressHistory;
renderProgressHistory=function(){
  return _renderProgressHistoryV1082().replace(/RPE ([0-9]+(?:\.[0-9]+)?|—)/g,'Effort $1/10');
};
const _v1080HistoryDetailV1082=v1080HistoryDetail;
v1080HistoryDetail=function(id){
  return _v1080HistoryDetailV1082(id).replace(/RPE ([0-9]+(?:\.[0-9]+)?|—)/g,'Effort $1/10');
};

/* Vocabulary shown in the consolidated volume view. */
const _renderProgressVolumeV1082=renderProgressVolume;
renderProgressVolume=function(){
  return _renderProgressVolumeV1082()
    .replace(/Quick Logs/g,'enregistrements rapides')
    .replace(/Quick Log/g,'enregistrement rapide');
};


/* ========================================================================== */
/* V10.83 · Étape 2 — Recommandations par contexte                            */
/* Aujourd’hui = focus d’exécution · Planning = importance · Mobilité = zone  */
/* Progression = analyse · Capacités = données, pas un second coach.           */
/* ========================================================================== */

/* TODAY — one coaching voice only: execute today's session. */
renderTodayCoachStrip=function(){
  const d=v1060PrimaryExerciseDecision(),r=v1060ReadinessState(),a=d.workout?.coachAdaptation;
  const adjusted=a&&a.mode!=='normal';
  return `<section class="today-coach-strip mode-${r.mode} today-focus-v1083">
    <div class="today-coach-main">
      <div class="kicker">Focus du jour</div>
      <strong>${esc(d.label)}</strong>
      <span>${esc(d.detail)}</span>
    </div>
    <div class="today-coach-side">
      <span>État de séance</span>
      <strong>${r.label}</strong>
      ${adjusted?`<small>${esc(a.label)}</small>`:'<small>Programme prévu conservé</small>'}
    </div>
    ${a?.mode==='reduce-accessories'?`<div class="today-coach-adaptation"><span>Ajustement du jour</span><strong>${esc(a.reason)}</strong></div>`:''}
  </section>`;
};

/* Tests, rank and progression opportunities belong to Progression, not Today. */
renderTodayUsefulActions=function(){return '';};

/* PLANNING — the stored "priority" field means scheduling importance, not coaching priority. */
v1070PriorityLabel=function(id){
  return ({priority:'Fixe',important:'À préserver',flexible:'Flexible'})[id]||'Flexible';
};
const _renderPlanningEventEditorV1083=renderPlanningEventEditor;
renderPlanningEventEditor=function(){
  let html=_renderPlanningEventEditorV1083();
  return html
    .replace('<div class="planning-priority"><span>Priorité</span>','<div class="planning-priority"><span>Importance dans la semaine</span>')
    .replace(/>Prioritaire</g,'>Fixe<')
    .replace(/>Importante</g,'>À préserver<')
    .replace('KINETIK ne la déplace pas','ne sera pas déplacée')
    .replace('à protéger si possible','à conserver si possible')
    .replace('peut être proposée ailleurs','peut être déplacée si nécessaire')
    .replace(/RPE prévu/g,'Effort prévu')
    .replace('utilise la durée et le RPE prévus','utilise la durée et l’effort prévus');
};

/* PROGRESSION — this remains the only place making a cross-domain recommendation. */
const _v1080ProgressInsightV1083=v1080ProgressInsight;
v1080ProgressInsight=function(){
  let html=_v1080ProgressInsightV1083();
  return html
    .replace('Ce que KINETIK te conseille','Action recommandée')
    .replace('Voir pourquoi →','Comprendre →');
};

/* CAPACITÉS — describe evidence; do not behave like a second coaching surface. */
const _renderSkillsV1083=renderSkills;
renderSkills=function(){
  let html=_renderSkillsV1083();
  return html
    .replace(/<div class="kicker">Lecture objectif<\/div>/g,'<div class="kicker">Données de l’objectif</div>')
    .replace(/Facteur limitant · /g,'Point le moins avancé mesuré · ')
    .replace(/Facteur limitant à confirmer/g,'Données à compléter');
};

/* MOBILITY — reinforce that the concept is a local body zone, never a global priority. */
const _renderFlexibilityV1083=renderFlexibility;
renderFlexibility=function(){
  return _renderFlexibilityV1083()
    .replace(/priorité réelle/gi,'zone à travailler fiable')
    .replace(/cette priorité/gi,'cette zone à travailler');
};


/* ========================================================================== */
/* V10.84 · Étape 3 — Confiance du moteur "À surveiller"                     */
/* Coverage + evidence + goal importance. No strong claim on partial data.     */
/* ========================================================================== */
function v1084FactorWeight(f){
  const goal=String(getAthleteProfile().primaryGoal||'').toLowerCase(),label=String(f.label||'').toLowerCase(),id=String(f.id||'').toLowerCase();
  if(/muscle.?up/.test(goal)){
    if(/explos|chest|tirage haut/.test(label+id))return 1.6;
    if(/force de tirage|pullups/.test(label+id))return 1.45;
    if(/pouss|dips/.test(label+id))return .9;
    if(/grip|dead_hang/.test(label+id))return .8;
    if(/mobilité|shoulder/.test(label+id))return .65;
  }
  if(/handstand|hspu/.test(goal)){
    if(/base inversée|wall_handstand/.test(label+id))return 1.45;
    if(/équilibre libre|handstand libre/.test(label+id))return 1.55;
    if(/poussée verticale|push/.test(label+id))return 1.35;
    if(/poignet|shoulder|épaule/.test(label+id))return .95;
  }
  if(/front lever/.test(goal)){
    if(/tirage|pull/.test(label+id))return 1.5;
    if(/core/.test(label+id))return 1.35;
    if(/grip/.test(label+id))return 1.15;
    if(/front lever/.test(label+id))return 1.6;
  }
  if(/human flag/.test(goal)){
    if(/human flag/.test(label+id))return 1.6;
    if(/core/.test(label+id))return 1.4;
    if(/tirage|poussée|pull|push/.test(label+id))return 1.25;
    if(/équilibre|balance/.test(label+id))return 1.0;
  }
  if(/l.?sit/.test(goal)){
    if(/l-sit|l sit/.test(label+id))return 1.55;
    if(/core/.test(label+id))return 1.4;
    if(/postérieure|hanches|posterior|hips/.test(label+id))return 1.05;
  }
  return 1;
}
function v1084EvidenceNumeric(f){
  const c=Number(f?.confidence||0);
  return clamp(c,0,3);
}
function v1084ConfidenceLabel(score){
  score=Math.round(clamp(Number(score)||0,0,100));
  if(score>=75)return {id:'high',label:'Élevée'};
  if(score>=50)return {id:'medium',label:'Moyenne'};
  if(score>0)return {id:'low',label:'Faible'};
  return {id:'none',label:'Insuffisante'};
}
function v1084GoalAnalysis(){
  const factors=v1060GoalFactors().map(f=>({...f,weight:v1084FactorWeight(f)}));
  const totalWeight=factors.reduce((s,f)=>s+f.weight,0)||1;
  const known=factors.filter(f=>f.score!=null),missing=factors.filter(f=>f.score==null);
  const coveredWeight=known.reduce((s,f)=>s+f.weight,0);
  const coveragePct=Math.round(coveredWeight/totalWeight*100);
  const evidencePct=known.length?Math.round(known.reduce((s,f)=>s+(v1084EvidenceNumeric(f)/3)*f.weight,0)/Math.max(.01,coveredWeight)*100):0;

  /* Urgency mixes deficit with importance. Evidence only breaks close ties:
     a strongly important but poorly measured factor is not allowed to become a
     confident limiter; it instead lowers global confidence. */
  const ranked=known.map(f=>{
    const deficit=100-clamp(Number(f.score),0,100);
    const urgency=deficit*f.weight;
    return {...f,deficit,urgency,evidence:v1084EvidenceNumeric(f)};
  }).sort((a,b)=>b.urgency-a.urgency || b.evidence-a.evidence);

  const candidate=ranked[0]||null;
  const criticalMissing=missing.filter(f=>f.weight>=1.25).sort((a,b)=>b.weight-a.weight);
  const candidateEvidencePct=candidate?Math.round(candidate.evidence/3*100):0;
  const confidenceScore=candidate
    ? Math.round(coveragePct*.55 + evidencePct*.25 + candidateEvidencePct*.20)
    : 0;
  const confidence=v1084ConfidenceLabel(confidenceScore);

  return {
    factors,known,missing,candidate,criticalMissing,
    coveragePct,evidencePct,confidenceScore,confidence,
    complete:missing.length===0
  };
}

/* Preserve the legacy return shape for all existing consumers. */
v1060GoalLimiter=function(){
  const a=v1084GoalAnalysis();
  return {
    limiter:a.candidate,
    missing:a.missing,
    factors:a.factors,
    confidence:a.confidence,
    confidenceScore:a.confidenceScore,
    coveragePct:a.coveragePct,
    evidencePct:a.evidencePct,
    criticalMissing:a.criticalMissing,
    complete:a.complete,
    knownCount:a.known.length
  };
};

v1060NextBestChoice=function(){
  const readiness=v1060ReadinessState(),lim=v1060GoalLimiter(),plateau=v1060PlateauCandidate(),quality=v1060AssessmentQuality();
  if(readiness.mode==='reduced')return {id:'recover',label:'Respecter la séance allégée',detail:readiness.reasons[0]||'Charge récente élevée.',action:'today'};

  /* A missing high-importance prerequisite wins over a speculative focus. */
  const critical=lim.criticalMissing?.[0];
  if(critical)return {
    id:'assess',
    label:`Mesurer ${critical.label.toLowerCase()}`,
    detail:`Cette donnée est importante pour ton objectif et manque encore. KINETIK évite de désigner un point faible tant qu’elle n’est pas connue.`,
    action:'assessment'
  };

  if(lim.coveragePct<70){
    const missing=lim.missing?.[0];
    return {
      id:'assess',
      label:missing?`Compléter ${missing.label.toLowerCase()}`:'Compléter les évaluations',
      detail:`Seulement ${lim.coveragePct}% des facteurs utiles à ton objectif sont actuellement renseignés.`,
      action:'assessment'
    };
  }

  if(plateau)return {id:'plateau',label:`Revoir la progression · ${plateau.name}`,detail:plateau.reason,action:'performance'};

  if(lim.limiter&&lim.limiter.score<55&&lim.confidenceScore>=60)return {
    id:'focus',
    label:`Travailler ${lim.limiter.label.toLowerCase()}`,
    detail:`C’est le point le moins avancé parmi les facteurs suffisamment documentés de ton objectif.`,
    action:'today'
  };

  if(lim.limiter&&lim.confidenceScore<60)return {
    id:'confirm',
    label:'Confirmer les données',
    detail:`KINETIK voit un signal possible sur ${lim.limiter.label.toLowerCase()}, mais la confiance reste ${lim.confidence.label.toLowerCase()}.`,
    action:'assessment'
  };

  return {id:'continue',label:'Continuer le cycle actuel',detail:'Aucun signal suffisamment fiable ne justifie actuellement un changement important du programme.',action:'today'};
};

v1060InsightDecision=function(days=30){
  const s=v1060AthleteState(days),r=v1060ReadinessState(),lim=v1060GoalLimiter(),plateau=v1060PlateauCandidate(),body=v1060BodySignal(),next=v1060NextBestChoice();
  let title='Progression en construction',tone='neutral',text=next.detail;
  if(r.mode==='reduced'){title='Charge récente à absorber';tone='warn';text='La charge récente justifie surtout un ajustement de la séance, pas une conclusion sur tes capacités.';}
  else if(plateau){title='Progression ralentie à vérifier';tone='warn';text=plateau.reason;}
  else if(lim.coveragePct<70){title='Données encore incomplètes';tone='neutral';text=`${lim.coveragePct}% des facteurs utiles à ton objectif sont renseignés. KINETIK préfère compléter le profil avant de conclure.`;}
  else if(lim.limiter&&lim.confidenceScore>=60){title=`Point à surveiller · ${lim.limiter.label}`;tone='neutral';text=`${lim.limiter.detail}. Confiance ${lim.confidence.label.toLowerCase()} (${lim.confidenceScore}%).`;}
  else if(s.force.tone==='up'&&s.load.delta!=null&&s.load.delta<=25){title='Progression cohérente';tone='good';text='Les performances de force progressent sans hausse rapide de la charge sportive enregistrée.';}
  return {title,tone,text,state:s,readiness:r,limiter:lim,plateau,body,next};
};

/* Replace the v10.81 overview block with certainty-aware language. */
v1080ProgressInsight=function(){
  const i=v1060InsightDecision(30),s=i.state,lim=i.limiter,issue=lim.limiter?.label;
  const enough=lim.coveragePct>=70&&lim.confidenceScore>=60;
  const title=enough&&issue?issue:(lim.coveragePct<70?'Profil à compléter':issue||'Progression générale');
  const reason=enough&&issue
    ?`${issue} ressort comme le point le moins avancé parmi les facteurs actuellement suffisamment documentés.`
    :lim.coveragePct<70
      ?`KINETIK connaît ${lim.coveragePct}% des facteurs utiles à ton objectif. Il manque encore des données pour identifier un point faible de façon crédible.`
      :`Un signal existe${issue?` sur ${issue.toLowerCase()}`:''}, mais la confiance est encore ${lim.confidence.label.toLowerCase()}.`;

  return `<section class="p81-insight ${i.tone} p84-insight">
    <div class="p81-insight-head">
      <div><div class="kicker">À surveiller maintenant</div><h2>${esc(title)}</h2></div>
      <div class="p84-confidence ${lim.confidence.id}"><span>Confiance</span><strong>${lim.confidence.label}</strong><small>${lim.confidenceScore}%</small></div>
    </div>
    <p class="p81-insight-reason">${esc(reason)}</p>
    <div class="p84-data-coverage">
      <div><span>Facteurs connus</span><strong>${lim.knownCount??(lim.factors.length-lim.missing.length)}/${lim.factors.length}</strong></div>
      <div><span>Couverture utile</span><strong>${lim.coveragePct}%</strong></div>
      <div><span>Qualité des preuves</span><strong>${lim.evidencePct}%</strong></div>
    </div>
    ${lim.missing.length?`<div class="p84-missing"><span>Encore à renseigner</span><strong>${lim.missing.slice(0,3).map(x=>esc(x.label)).join(' · ')}</strong></div>`:''}
    <div class="p81-advice">
      <span>Action recommandée</span>
      <strong>${esc(i.next?.label||'Continuer le cycle')}</strong>
      <p>${esc(i.next?.detail||'')}</p>
      <button ${i.next?.action==='assessment'?'data-view="assessment"':i.next?.action==='performance'?'data-progress-tab="performance"':'data-view="today"'}>Ouvrir →</button>
    </div>
    ${v1081InsightSupportRow(s)}
  </section>`;
};


/* ========================================================================== */
/* V10.85 · Étape 4 — Performance → Évaluation → Capacités → Rang             */
/* A single mental model shared by Progression, Assessment and Capacities.      */
/* ========================================================================== */
function v1085ProgressionChain(active='performance',compact=false){
  const steps=[
    {id:'performance',n:'01',label:'Performance',text:'Ce que tu réalises réellement en séance.',action:'progress'},
    {id:'assessment',n:'02',label:'Évaluation',text:'Confirme les performances qui ont besoin d’une preuve plus solide.',action:'assessment'},
    {id:'capabilities',n:'03',label:'Capacités',text:'Regroupe tes performances en forces, grip, core, équilibre…',action:'skills'},
    {id:'rank',n:'04',label:'Rang',text:'Synthétise plusieurs capacités avec des exigences strictes.',action:'skills'}
  ];
  return `<${compact?'div':'details'} class="p85-chain ${compact?'compact':''}" ${compact?'':'open'}>
    ${compact?'':`<summary><div><div class="kicker">Comment fonctionne KINETIK</div><strong>Performance → Évaluation → Capacités → Rang</strong><span>Une seule chaîne, quatre rôles différents.</span></div><b>Comprendre ↓</b></summary>`}
    <div class="p85-chain-steps">${steps.map(s=>`<button class="${active===s.id?'active':''}" ${s.action==='progress'?'data-progress-tab="performance"':`data-view="${s.action}"`}>
      <i>${s.n}</i><div><strong>${s.label}</strong><span>${s.text}</span></div>
    </button>`).join('')}</div>
    ${compact?'':`<p class="p85-chain-note"><strong>Important :</strong> une performance peut être enregistrée sans test. L’évaluation sert surtout à augmenter la fiabilité des données importantes ; elle n’est pas obligatoire après chaque séance.</p>`}
  </${compact?'div':'details'}>`;
}

/* Progression is the entry point: show the mental model once, after the weekly summary. */
const _renderProgressOverviewV1085=renderProgressOverview;
renderProgressOverview=function(){
  let html=_renderProgressOverviewV1085();
  const marker='</section>';
  const firstEnd=html.indexOf(marker);
  if(firstEnd>=0)html=html.slice(0,firstEnd+marker.length)+v1085ProgressionChain('performance')+html.slice(firstEnd+marker.length);
  return html;
};

/* Assessment = step 2. Explain why the user is here before protocols. */
const _renderAssessmentCenterV1085=renderAssessmentCenter;
renderAssessmentCenter=function(){
  let html=_renderAssessmentCenterV1085();
  const marker='<section class="assessment-hero">';
  const context=`<section class="p85-context p85-assessment-context">
    <div><div class="kicker">Étape 2 sur 4 · Évaluation</div><strong>Tu ne repars pas de zéro.</strong><p>KINETIK connaît déjà tes performances enregistrées. Ici, tu confirmes seulement celles qui ont besoin d’une preuve plus fiable pour les analyses, les Capacités ou certains rangs.</p></div>
    ${v1085ProgressionChain('assessment',true)}
  </section>`;
  return html.includes(marker)?html.replace(marker,context+marker):context+html;
};

/* Capacities = step 3, Rank = step 4 on the same screen. */
const _renderSkillsV1085=renderSkills;
renderSkills=function(){
  let html=_renderSkillsV1085();
  const marker='<section class="cap-rank-intro">';
  const context=`<section class="p85-context p85-cap-context">
    <div><div class="kicker">Étapes 3 & 4 · Capacités puis Rang</div><strong>Deux niveaux de lecture différents.</strong><p><b>Capacités</b> = ton profil détaillé. <b>Rang</b> = une synthèse exigeante qui n’augmente que lorsque plusieurs critères sont réellement validés.</p></div>
    ${v1085ProgressionChain('capabilities',true)}
  </section>`;
  return html.includes(marker)?html.replace(marker,context+marker):context+html;
};

/* Assessment wording: don't imply that every metric must become a formal test. */
const _renderAssessmentProtocolRowV1085=renderAssessmentProtocolRow;
renderAssessmentProtocolRow=function(p){
  return _renderAssessmentProtocolRowV1085(p)
    .replace('Non évalué','Pas encore confirmé')
    .replace('Évaluer →','Confirmer →');
};


/* ========================================================================== */
/* V10.86 · Étape 5 — Suppression du système d’ancienneté                     */
/* Rangs = performances validées uniquement.                                  */
/* ========================================================================== */
function v1086RankIntegrity(){
  const r=getRankState();
  return {rank:r.displayName,readiness:r.readiness,criteria:r.nextEval?.gates||[],performanceOnly:true};
}


/* ========================================================================== */
/* V10.87 · Étape 6 — Intégrité du coaching                                   */
/* KINETIK observe et propose. Aucune adaptation contextuelle n'est appliquée  */
/* silencieusement : l'utilisateur valide avant toute modification de séance.  */
/* ========================================================================== */
Object.assign(state,{
  multisportProposalChoice:null, /* null | "apply" | "keep" */
  multisportProposalDate:null
});

function v1087TodayKey(){return localDateKey(new Date());}
function v1087ResetProposalIfNeeded(){
  const key=v1087TodayKey();
  if(state.multisportProposalDate!==key){
    state.multisportProposalDate=key;
    state.multisportProposalChoice=null;
  }
}
function v1087MultisportProposal(){
  v1087ResetProposalIfNeeded();
  const a=v1060MultisportAdjustment();
  if(a.mode!=='reduce-accessories')return null;
  const base=_preparedWorkoutV1060(todayDay(),null,'full');
  if(!base?.exercises?.length)return null;
  const keep=v1060GoalPriorityRegex(),changes=[];let mainSeen=0;
  for(const e of base.exercises){
    if((e.phase||'main')!=='main'||e.type==='timer')continue;
    mainSeen++;
    if(mainSeen<=2||keep.test(String(e.name||''))||Number(e.sets||0)<3)continue;
    changes.push({name:e.name,from:Number(e.sets||1),to:Math.max(2,Number(e.sets||1)-1)});
  }
  if(!changes.length)return null;
  return {...a,changes,minutesSaved:changes.length*3};
}
function v1087ApplyMultisportProposal(w,proposal){
  if(!w||!proposal?.changes?.length)return w;
  const map=new Map(proposal.changes.map(x=>[x.name,x]));
  let changed=0;
  w.exercises=w.exercises.map(e=>{
    const c=map.get(e.name);
    if(!c)return e;
    changed++;
    return {...e,sets:c.to,coachAdjusted:true,prescriptionStatus:e.prescriptionStatus==='progress'?'maintain':e.prescriptionStatus,
      prescriptionNote:`${e.prescriptionNote||''}${e.prescriptionNote?' · ':''}Adaptation multisport validée : ${c.from} → ${c.to} séries.`};
  });
  if(changed){
    w.duration=Math.max(20,Number(w.duration||45)-changed*3);
    w.coachAdaptation={...proposal,changed,userApproved:true};
  }
  return w;
}

/* Authoritative workout preparation:
   - retains cycle/readiness rules already chosen by the user;
   - bypasses the old automatic multisport mutation;
   - applies multisport only after explicit approval. */
preparedWorkout=function(day,readiness=null,sessionLength="full"){
  const w=_preparedWorkoutV1060(day,readiness,sessionLength);
  if(!w?.exercises?.length)return w;
  if(Number(day)!==Number(todayDay())||sessionLength==='short')return w;
  if(readiness&&readinessPlan(readiness).mode!=='normal')return w;
  const proposal=v1087MultisportProposal();
  if(!proposal)return w;
  w.coachAdaptation={...proposal,proposed:true,userApproved:false};
  if(state.multisportProposalChoice==='apply')return v1087ApplyMultisportProposal(w,proposal);
  return w;
};

function v1087ProposalBlock(){
  const p=v1087MultisportProposal();
  if(!p)return '';
  const choice=state.multisportProposalChoice;
  return `<section class="today-proposal-v1087 ${choice||''}">
    <div class="today-proposal-head">
      <div><div class="kicker">Proposition pour aujourd’hui</div><h2>Réduire légèrement les accessoires ?</h2></div>
      <span>${choice==='apply'?'Appliquée':choice==='keep'?'Refusée':'À valider'}</span>
    </div>
    <p>${esc(p.reason)}</p>
    <div class="today-proposal-changes">${p.changes.map(x=>`<div><strong>${esc(x.name)}</strong><span>${x.from} → ${x.to} séries</span></div>`).join('')}</div>
    <small>Les mouvements principaux restent inchangés. Estimation : ≈ ${p.minutesSaved} min de moins.</small>
    <div class="today-proposal-actions">
      <button class="btn btn-outline compact" id="keepMultisportPlan">${choice==='keep'?'Programme conservé':'Garder le programme prévu'}</button>
      <button class="btn btn-primary compact" id="applyMultisportProposal">${choice==='apply'?'Adaptation appliquée':'Appliquer cette adaptation'}</button>
    </div>
  </section>`;
}

/* TODAY = execution only. The proposal is visible, specific and reversible. */
renderTodayCoachStrip=function(){
  const d=v1060PrimaryExerciseDecision(),r=v1060ReadinessState();
  return `<section class="today-coach-strip mode-${r.mode} today-focus-v1083">
    <div class="today-coach-main"><div class="kicker">Focus du jour</div><strong>${esc(d.label)}</strong><span>${esc(d.detail)}</span></div>
    <div class="today-coach-side"><span>État de séance</span><strong>${r.label}</strong><small>${r.mode==='good'?'Programme prévu conservé':'À prendre en compte avant de démarrer'}</small></div>
  </section>${v1087ProposalBlock()}`;
};

/* PLANNING = organisation, never a second coach. Strip legacy auto-adaptation banners. */
const _renderWeekV1087=renderWeek;
renderWeek=function(){
  let html=_renderWeekV1087();
  html=html.replace(/<section class="planning-coach-banner[\s\S]*?<\/section>/g,'');
  return html;
};

/* Old long-form report becomes analysis only; recommendations remain in the
   single Progression "À surveiller" surface. */
renderAdaptiveReport=function(){
  const days=state.reportPeriod==='90d'?90:30,i=v1060InsightDecision(days),s=i.state,lim=i.limiter;
  return `<section class="card adaptive-report intelligence-report ${i.tone}">
    <div class="section-head"><div><div class="kicker">Analyse · ${days} jours</div><h2>${esc(i.title)}</h2></div><div class="report-tabs"><button data-report-period="30d" class="${days===30?'active':''}">30 j</button><button data-report-period="90d" class="${days===90?'active':''}">90 j</button></div></div>
    <p class="intelligence-lead">${esc(i.text)}</p>
    <div class="athlete-state-grid">${[s.force,s.skills,s.mobility,s.cardio,s.load,s.data].map(renderV1060StateItem).join('')}</div>
    <p class="muted small">Analyse descriptive uniquement. Les changements de programme ou de séance demandent une action explicite de ta part.</p>
  </section>`;
};

/* Update the confidence-aware Progression copy: it can suggest where to look,
   but it never claims that opening Today has changed the workout. */
const _v1060NextBestChoiceV1087=v1060NextBestChoice;
v1060NextBestChoice=function(){
  const x=_v1060NextBestChoiceV1087();
  if(x.id==='recover')return {...x,label:'Examiner la charge du jour',detail:`${x.detail} Si une adaptation est proposée sur Aujourd’hui, elle restera à valider.`};
  if(x.id==='focus')return {...x,label:x.label.replace(/^Travailler /,'Surveiller '),action:'performance',detail:`${x.detail} KINETIK ne modifie pas le cycle automatiquement.`};
  return x;
};

const _bindEventsV1087=bindEvents;
bindEvents=function(){
  _bindEventsV1087();
  const apply=document.getElementById('applyMultisportProposal');
  if(apply)apply.onclick=()=>{v1087ResetProposalIfNeeded();state.multisportProposalChoice='apply';render();};
  const keep=document.getElementById('keepMultisportPlan');
  if(keep)keep.onclick=()=>{v1087ResetProposalIfNeeded();state.multisportProposalChoice='keep';render();};
};


/* ========================================================================== */
/* V10.88 · Étape 7 — Profil Visual Clarity                                   */
/* Profil = identité + objectifs + contexte. Les analyses restent ailleurs.   */
/* ========================================================================== */
function v1088BodySummary(){
  const logs=getBodyLogs(),latest=logs[0],derived=latest?bodyDerived(latest):{};
  if(!latest)return `<button class="p88-data-row" data-view="measurements"><div><span>Données corporelles</span><strong>Aucun relevé</strong><small>Poids, mensurations et photos</small></div><b>Commencer →</b></button>`;
  const weight=bodyValue(latest,'weight'),waist=bodyValue(latest,'waist');
  return `<button class="p88-data-row" data-view="measurements"><div><span>Données corporelles</span><strong>${weight?`${Number(weight).toFixed(1)} kg`:'Poids —'}${waist?` · tour de taille ${Number(waist).toFixed(1)} cm`:''}</strong><small>Dernier relevé · ${formatDate(latest.date)}${derived.bf!=null?` · MG estimée ${derived.bf.toFixed(1)}%`:''}</small></div><b>Voir →</b></button>`;
}
function v1088ConnectionSection(){
  const st=state.stravaStatus,meta=getStravaMeta();
  if(!st.checked)return `<section class="p88-section"><div class="p88-section-head"><div><div class="kicker">Connexions</div><h2>Services externes</h2></div></div><div class="p88-connection"><div><strong>Strava</strong><span>Vérification de la connexion…</span></div><b>…</b></div></section>`;
  if(!st.connected)return `<section class="p88-section"><div class="p88-section-head"><div><div class="kicker">Connexions</div><h2>Services externes</h2></div></div>
    <div class="p88-connection"><div><strong>Strava</strong><span>Non connecté · import automatique des courses facultatif</span></div><a href="/api/strava/auth">Connecter →</a></div>
  </section>`;
  const athlete=st.athlete?`${st.athlete.firstname||''} ${st.athlete.lastname||''}`.trim():'';
  return `<section class="p88-section"><div class="p88-section-head"><div><div class="kicker">Connexions</div><h2>Services externes</h2></div></div>
    <div class="p88-connection connected"><div><strong>Strava</strong><span>${athlete?esc(athlete)+' · ':''}${meta.lastSync?`synchro ${formatDate(meta.lastSync)}`:'connecté'}</span></div><div class="p88-connection-actions"><button id="syncStrava">Synchroniser →</button><button type="button" class="btn btn-ghost compact" id="disconnectStrava">Déconnecter</button></div></div>
  </section>`;
}
function v1088ProfileContext(p){
  const sports=(p.sports||[]).map(athleteSportLabel),places=(p.locations||[]).map(x=>({home:'Maison',outdoor:'Parc / extérieur',gym:'Salle',club:'Club / box'}[x]||x));
  return `<section class="p88-section"><div class="p88-section-head"><div><div class="kicker">Contexte sportif</div><h2>Où et comment tu t’entraînes</h2></div><button id="editAthleteProfile">Modifier →</button></div>
    <div class="p88-context-grid">
      <div><span>Sports</span><strong>${sports.join(' · ')||'Non renseignés'}</strong></div>
      <div><span>Lieux</span><strong>${places.join(' · ')||'Non renseignés'}</strong></div>
      <div><span>Rythme</span><strong>${p.weeklySessions} séance${p.weeklySessions>1?'s':''}/sem · ${p.preferredDuration} min</strong></div>
      <div><span>Format</span><strong>${esc(p.sessionPreference)}</strong></div>
    </div>
  </section>`;
}
function v1088EquipmentSection(){
  const setup=getEquipmentSetup(),equipment=EQUIPMENT_CATALOG.filter(x=>setup[x.id]),active=getActiveTrainingCycle(),missing=[];
  Object.values(active.days||{}).forEach(w=>(w.exercises||[]).forEach(e=>{const a=exerciseAdaptation(e.name);if(!a.equipment.available&&exerciseInfo(e.name))missing.push(e.name);}));
  return `<section class="p88-section"><div class="p88-section-head"><div><div class="kicker">Matériel</div><h2>${equipment.length} équipement${equipment.length>1?'s':''} disponible${equipment.length>1?'s':''}</h2></div><button id="editAthleteProfile">Modifier →</button></div>
    ${equipment.length?`<div class="p88-equipment">${equipment.map(x=>`<div>${equipmentVisualIcon(x.label)}<span>${esc(x.label)}</span></div>`).join('')}</div>`:'<p class="p88-muted">Aucun matériel renseigné.</p>'}
    ${missing.length?`<div class="p88-equipment-warning"><strong>${[...new Set(missing)].length} exercice${[...new Set(missing)].length>1?'s':''} du cycle à adapter</strong><span>KINETIK signalera une variante compatible au moment utile.</span></div>`:'<div class="p88-equipment-ok">Cycle actuel compatible avec ton matériel.</div>'}
  </section>`;
}

renderMore=function(){
  const p=getAthleteProfile(),cycle=getActiveTrainingCycle(),cs=getCycleState(),completion=athleteProfileCompletion(p),rank=getRankState();
  return shell(`<header class="topbar p88-topbar"><div><div class="brand">Profil</div><div class="daylabel">Qui tu es · ce que tu vises · ce dont KINETIK dispose</div></div><button class="btn btn-primary compact" id="editAthleteProfile">Modifier</button></header>

    <section class="p88-identity">
      <div class="athlete-avatar large">${athleteInitials(p.name)}</div>
      <div><div class="kicker">Identité sportive</div><h1>${esc(p.name||'Mon profil')}</h1><p>${esc(p.experience)}${p.yearsTraining?` · ${p.yearsTraining} an${p.yearsTraining>1?'s':''} de pratique`:''}${p.age?` · ${p.age} ans`:''}</p></div>
      <div class="p88-completion"><strong>${completion}%</strong><span>profil renseigné</span></div>
    </section>

    <section class="p88-goal">
      <div class="p88-section-head"><div><div class="kicker">Objectifs</div><h2>${esc(p.primaryGoal)}</h2></div><button id="editAthleteProfile">Modifier →</button></div>
      ${p.secondaryGoal?`<p><span>Secondaire</span><strong>${esc(p.secondaryGoal)}</strong></p>`:''}
      <div class="p88-goal-cycle"><div><span>Cycle actuel</span><strong>${esc(cycle.name)} · S${cs.week}/${cs.weekCount}</strong></div>${p.goalHorizon?`<div><span>Horizon</span><strong>${esc(p.goalHorizon)}</strong></div>`:''}</div>
      <button class="p88-inline-link" data-view="week">Voir le programme actuel →</button>
    </section>

    ${v1088ProfileContext(p)}

    ${v1088EquipmentSection()}

    <section class="p88-section"><div class="p88-section-head"><div><div class="kicker">Données personnelles</div><h2>Ce que KINETIK utilise pour te suivre</h2></div></div>
      ${v1088BodySummary()}
      <button class="p88-data-row" data-view="skills"><div><span>Capacités & rang</span><strong>${esc(rank.displayName)}</strong><small>Profil de capacités et exigences validées</small></div><b>Voir →</b></button>
      <button class="p88-data-row" data-view="flexibility"><div><span>Mobilité</span><strong>${mobilityProfiles().filter(x=>x.assessed).length}/${mobilityProfiles().length} zones évaluées</strong><small>Tests et zones à travailler</small></div><b>Voir →</b></button>
    </section>

    ${v1088ConnectionSection()}

    <section class="p88-settings-link">
      <button data-view="settings"><div><div class="kicker">Application</div><strong>Réglages KINETIK</strong><span>Coach, timers, écran, bibliothèque, sauvegarde et installation</span></div><b>→</b></button>
    </section>`, 'athlete');
};

/* Settings no longer duplicates athlete profile/equipment. */
renderProfile=function(){
  const p=getPrefs();
  return shell(`<header class="topbar p88-settings-top"><div><button class="profile-back-link" data-view="athlete">← Profil</button><div class="brand">Réglages KINETIK</div><div class="daylabel">Comportement de l’application et données</div></div></header>

    <section class="p88-settings-section"><div class="p88-section-head"><div><div class="kicker">Coaching</div><h2>Comportement de KINETIK</h2></div></div>
      <div class="switchline"><div><strong>Progression intelligente</strong><div class="small muted">Analyse tes dernières séances et propose des ajustements. Les changements contextuels restent à valider.</div></div><input id="smartPref" type="checkbox" ${p.smartProgression!==false?'checked':''}></div>
    </section>

    ${renderRestrictionSettings()}

    <section class="p88-settings-section"><div class="p88-section-head"><div><div class="kicker">Séance</div><h2>Timers & écran</h2></div></div>
      <div class="switchline"><div><strong>Son du timer</strong><div class="small muted">Signal à la fin d’un chrono.</div></div><input id="soundPref" type="checkbox" ${p.sound?'checked':''}></div>
      <div class="switchline"><div><strong>Garder l’écran actif</strong><div class="small muted">Évite la mise en veille pendant la séance quand le navigateur le permet.</div></div><input id="keepAwakePref" type="checkbox" ${p.keepAwake!==false?'checked':''}></div>
      <div class="switchline"><div><strong>Vibration</strong><div class="small muted">Uniquement sur les navigateurs compatibles.</div></div><input id="vibrationPref" type="checkbox" ${p.vibration?'checked':''}></div>
    </section>

    ${renderReminderSettings()}

    <section class="p88-settings-section"><div class="p88-section-head"><div><div class="kicker">Contenu</div><h2>Exercices & tutoriels</h2></div></div>
      <button class="p88-settings-action" id="openExerciseLibrary"><div><strong>Bibliothèque d’exercices</strong><span>Exercices, variantes et disponibilité</span></div><b>Ouvrir →</b></button>
      <button class="p88-settings-action" id="manageTutorials"><div><strong>Tutoriels</strong><span>${tutorialStats().exact}/${tutorialStats().total} contenus validés</span></div><b>Gérer →</b></button>
      ${Object.entries(getExerciseChoices()).length?`<details class="p88-settings-details"><summary><div><strong>Variantes adoptées</strong><span>${Object.entries(getExerciseChoices()).length} choix actifs</span></div><b>↓</b></summary><div>${Object.entries(getExerciseChoices()).map(([base,chosen])=>`<div class="choice-row"><span>${esc(base)} → <strong>${esc(chosen)}</strong></span><button class="btn btn-outline compact reset-choice" data-base="${encodeURIComponent(base)}">Réinitialiser</button></div>`).join('')}</div></details>`:''}
    </section>

    ${renderAppearanceSettings()}

    <section class="p88-settings-section"><div class="p88-section-head"><div><div class="kicker">Application</div><h2>Installation</h2></div></div>
      <p class="p88-muted">Android/Chrome : installation directe si disponible. iPhone/Safari : Partager → Ajouter à l’écran d’accueil.</p>
      <button class="btn btn-primary" id="installApp" ${state.deferredInstall?'':'disabled'}>${state.deferredInstall?'Installer KINETIK':'Installation via le navigateur'}</button>
    </section>

    <section class="p88-settings-section"><div class="p88-section-head"><div><div class="kicker">Données</div><h2>Sauvegarde locale</h2></div></div>
      <p class="p88-muted">Exporte une sauvegarde avant un changement de téléphone, navigateur ou domaine. Les fichiers restent sous ton contrôle.</p>
      <div class="data-actions"><button class="btn btn-primary" id="exportData">Exporter mes données</button><button class="btn btn-secondary" id="importData">Importer une sauvegarde</button><input id="importDataFile" type="file" accept="application/json,.json" hidden></div>
      <div class="p88-danger-zone"><button class="btn btn-danger" id="clearAllData">Effacer toutes les données</button></div>
    </section>`, 'settings');
};


/* ========================================================================== */
/* V10.89 · Étape 8 — Performance Evidence Integrity                         */
/* Une valeur et son niveau de preuve sont désormais indissociables.           */
/* ========================================================================== */
function v1089EvidenceFromLegacySource(source){
  return source==='kinetik'?3:source==='workout'?2:1;
}
function v1089PerformanceEvent({value=0,date=null,source=null,evidence=0,exercise=null,testId=null,protocolId=null,id=null}={}){
  return {
    id:id||null,
    value:Number(value||0),
    date:date||null,
    source:source||null,
    evidence:clamp(Number(evidence||0),0,3),
    exercise:exercise||null,
    testId:testId||null,
    protocolId:protocolId||null
  };
}
function v1089TestEvents(testId){
  const names=TEST_GUIDED_EXERCISES[testId]||[],out=[];
  getAssessments().filter(a=>a.testId===testId&&Number(a.value)>0).forEach(a=>out.push(v1089PerformanceEvent({
    id:`assessment:${a.id}`,value:a.value,date:a.date,source:evidenceInfo(a.evidenceLevel).label,
    evidence:a.evidenceLevel,exercise:a.exercise,testId,protocolId:a.protocolId
  })));
  getHistory().forEach(s=>(s.entries||[]).forEach((e,idx)=>{
    if(names.includes(e.exercise)&&Number(e.value)>0&&e.type!=='reps_band')out.push(v1089PerformanceEvent({
      id:`session:${s.id}:${idx}`,value:e.value,date:s.date,source:'Séance',evidence:2,exercise:e.exercise,testId
    }));
  }));
  getQuickLogs().forEach(q=>{
    if(names.includes(q.exercise)&&Number(q.value)>0&&q.type!=='timer'&&q.type!=='reps_band')out.push(v1089PerformanceEvent({
      id:`quick:${q.id}`,value:q.value,date:q.date,source:'Déclaré / série libre',evidence:1,exercise:q.exercise,testId
    }));
  });
  getTests().filter(x=>x.testId===testId&&Number(x.value)>0).forEach(x=>out.push(v1089PerformanceEvent({
    id:`legacy-test:${x.id}`,value:x.value,date:x.date,source:x.source==='kinetik'?'Test KINETIK':x.source==='workout'?'Séance':'Déclaré',
    evidence:v1089EvidenceFromLegacySource(x.source),testId
  })));
  return out;
}
function v1089ExerciseEvents(name){
  const out=[];
  getAssessments().filter(a=>a.exercise===name&&Number(a.value)>0).forEach(a=>out.push(v1089PerformanceEvent({
    id:`assessment:${a.id}`,value:a.value,date:a.date,source:evidenceInfo(a.evidenceLevel).label,
    evidence:a.evidenceLevel,exercise:name,protocolId:a.protocolId
  })));
  getHistory().forEach(s=>(s.entries||[]).forEach((e,idx)=>{
    if(e.exercise===name&&Number(e.value)>0&&e.type!=='reps_band')out.push(v1089PerformanceEvent({
      id:`session:${s.id}:${idx}`,value:e.value,date:s.date,source:'Séance',evidence:2,exercise:name
    }));
  }));
  getQuickLogs().filter(q=>q.exercise===name&&Number(q.value)>0&&q.type!=='timer'&&q.type!=='reps_band').forEach(q=>out.push(v1089PerformanceEvent({
    id:`quick:${q.id}`,value:q.value,date:q.date,source:'Déclaré / série libre',evidence:1,exercise:name
  })));
  return out;
}
function v1089BestEvent(events,minEvidence=0){
  return (events||[]).filter(e=>Number(e.value)>0&&Number(e.evidence)>=Number(minEvidence||0))
    .sort((a,b)=>Number(b.value)-Number(a.value)||Number(b.evidence)-Number(a.evidence)||new Date(b.date||0)-new Date(a.date||0))[0]||v1089PerformanceEvent();
}
function v1089BestTestEvent(testId,minEvidence=0){return v1089BestEvent(v1089TestEvents(testId),minEvidence);}
function v1089BestExerciseEvent(name,minEvidence=0){return v1089BestEvent(v1089ExerciseEvents(name),minEvidence);}

/* Current record = one concrete event. Never graft stronger evidence from another attempt. */
performanceDetailsForTest=function(id){
  const e=v1089BestTestEvent(id,0);
  return {value:e.value,date:e.date,source:e.source,exercise:e.exercise,evidence:e.evidence,eventId:e.id};
};
assessmentEvidenceForTest=function(testId){return Number(v1089BestTestEvent(testId,0).evidence||0);};
assessmentBestForTest=function(testId){
  const e=v1089BestTestEvent(testId,0);if(!e.value)return null;
  return {id:e.id,date:e.date,testId,value:e.value,evidenceLevel:e.evidence,source:e.source,exercise:e.exercise};
};
assessmentEvidenceForExercise=function(name){return Number(v1089BestExerciseEvent(name,0).evidence||0);};
assessmentBestForExercise=function(name){
  const e=v1089BestExerciseEvent(name,0);if(!e.value)return null;
  return {id:e.id,date:e.date,exercise:name,value:e.value,evidenceLevel:e.evidence,source:e.source};
};
bestExerciseValue=function(name){return Number(v1089BestExerciseEvent(name,0).value||0);};

/* Assessment UI also binds the badge to the displayed record. */
protocolCurrent=function(p){
  if(p.kind==='test'){
    const e=v1089BestTestEvent(p.testId,0);
    return {value:e.value,source:e.source,evidence:e.evidence,date:e.date,eventId:e.id};
  }
  if(p.kind==='exercise'){
    const e=v1089BestExerciseEvent(p.exercise,0);
    return {value:e.value,source:e.source,evidence:e.evidence,date:e.date,eventId:e.id};
  }
  const a=assessmentLatest(p.id);
  return {value:Number(a?.value||0),source:a?evidenceInfo(a.evidenceLevel).label:null,evidence:Number(a?.evidenceLevel||0),date:a?.date||null,eventId:a?.id||null};
};
protocolEvidence=function(p){return Number(protocolCurrent(p).evidence||0);};

function v1089VerifiedBenchmark(p){
  const e=p.kind==='test'?v1089BestTestEvent(p.testId,3):p.kind==='exercise'?v1089BestExerciseEvent(p.exercise,3):v1089BestEvent(getAssessments().filter(a=>a.protocolId===p.id).map(a=>v1089PerformanceEvent({id:a.id,value:a.value,date:a.date,source:evidenceInfo(a.evidenceLevel).label,evidence:a.evidenceLevel,protocolId:a.protocolId})),3);
  return e?.value?e:null;
}
renderAssessmentProtocolRow=function(p){
  const current=protocolCurrent(p),verified=v1089VerifiedBenchmark(p),sameVerified=verified&&verified.id===current.eventId;
  const secondary=verified&&!sameVerified?` · max vérifié ${verified.value} ${p.unit}`:'';
  return `<div class="assessment-protocol-row"><div class="assessment-row-main"><strong>${esc(p.name)}</strong><span>${current.value?`${current.value} ${p.unit} · ${esc(current.source||'référence')}${secondary}`:'Pas encore confirmé'}</span></div>${evidenceMark(current.evidence)}<button class="assessment-start" data-assessment-start="${p.id}">${current.value?'Retester':'Confirmer'} →</button></div>`;
};

/* Rank proofs query the best performance that independently satisfies the
   required evidence threshold. */
function v1089RankProofEvent(proof){
  if(!proof)return v1089PerformanceEvent();
  if(proof.kind==='skill')return v1089PerformanceEvent({value:skillDoneSafe(proof.id)?1:0,source:'Validation technique',evidence:skillDoneSafe(proof.id)?2:0});
  const minEv=Number(proof.evidenceMin||0);
  return proof.kind==='test'?v1089BestTestEvent(proof.id,minEv):v1089BestExerciseEvent(proof.name,minEv);
}
rankProofValue=function(proof){return Number(v1089RankProofEvent(proof).value||0);};
rankProofEvidenceLevel=function(proof){return Number(v1089RankProofEvent(proof).evidence||0);};

rankGateRows=function(rank){
  const rule=rankRuleFor(rank),caps=capabilityScores(),capMap=Object.fromEntries(caps.map(x=>[x.id,x])),
        skillPoints=technicalSkillPoints(),mastery=masterySkillCount(),majorMastery=majorMasterySkillCount();
  const avg=Math.round(caps.reduce((s,x)=>s+(x.assessed?x.score:0),0)/Math.max(1,caps.length)),rows=[];
  if(rule.avg)rows.push({id:'avg',label:'Moyenne des 6 capacités',current:avg,target:rule.avg,unit:'/100',detail:'les capacités non évaluées comptent comme 0'});
  Object.entries(rule.caps||{}).forEach(([id,target])=>rows.push({
    id:`cap-${id}`,label:capMap[id]?.label||id,current:capMap[id]?.assessed?capMap[id].score:0,target,unit:'/100',
    detail:capMap[id]?.assessed?capMap[id].detail:'non évalué'
  }));
  (rule.proofs||[]).forEach((proof,i)=>{
    const event=v1089RankProofEvent(proof),current=Number(event.value||0),minEv=Number(proof.evidenceMin||0);
    const strongestAny=proof.kind==='test'?v1089BestTestEvent(proof.id,0):proof.kind==='exercise'?v1089BestExerciseEvent(proof.name,0):event;
    let detail=proof.kind==='skill'?'validation technique requise':'barème de performance';
    if(minEv){
      detail=current
        ?`${evidenceInfo(event.evidence).label} · valeur et preuve issues du même enregistrement`
        :strongestAny.value
          ?`Record ${strongestAny.value}${proof.unit?` ${proof.unit}`:''} (${evidenceInfo(strongestAny.evidence).label}) · preuve ${evidenceInfo(minEv).label} requise`
          :`preuve ${evidenceInfo(minEv).label} requise`;
    }
    rows.push({
      id:`proof-${i}-${proof.kind}`,label:proof.label,current,target:Number(proof.value||1),unit:proof.unit||'',detail,
      forceDone:current>=Number(proof.value||1),evidence:event.evidence,evidenceMin:minEv,eventId:event.id
    });
  });
  if(rule.skillPoints)rows.push({id:'skills',label:'Difficulté technique cumulée',current:skillPoints,target:rule.skillPoints,unit:'pts'});
  if(rule.mastery)rows.push({id:'mastery',label:'Skills de maîtrise',current:mastery,target:rule.mastery,unit:''});
  if(rule.majorMastery)rows.push({id:'major-mastery',label:'Skills majeurs de maîtrise',current:majorMastery,target:rule.majorMastery,unit:'',detail:'Muscle-up avancé · HSPU libre · Front lever · Human flag'});
  return rows.map(x=>{
    const valueProgress=clamp(Number(x.current)/Math.max(1,Number(x.target)),0,1);
    const done=x.forceDone!==undefined?x.forceDone:Number(x.current)>=Number(x.target);
    return {...x,done,progress:valueProgress};
  });
};

/* Small integrity explanation where evidence matters most. */
const _renderAssessmentCenterV1089=renderAssessmentCenter;
renderAssessmentCenter=function(){
  let html=_renderAssessmentCenterV1089();
  const marker='<section class="assessment-next">';
  const note=`<section class="p89-integrity-note"><div><div class="kicker">Intégrité des performances</div><strong>Une preuve valide uniquement la performance avec laquelle elle a été enregistrée.</strong><p>Exemple : 20 tractions déclarées et un test KINETIK à 10 restent deux références distinctes. Le rang ne traitera jamais les 20 comme un test KINETIK.</p></div></section>`;
  return html.includes(marker)?html.replace(marker,note+marker):note+html;
};


/* ========================================================================== */
/* V10.90 · FAB placement                                                     */
/* Bouton Ajouter flottant uniquement sur Aujourd'hui et Planning.             */
/* ========================================================================== */


/* ========================================================================== */
/* V10.91 · FAB placement                                                     */
/* Bouton Ajouter sur Aujourd'hui, Planning, Mobilité et Progression.           */
/* Profil et sous-pages profil restent sans FAB.                               */
/* ========================================================================== */


/* ========================================================================== */
/* V10.92 · Progression chain simplification                                  */
/* Progression: short mental model, details on demand.                         */
/* ========================================================================== */
const _v1085ProgressionChainV1092=v1085ProgressionChain;
v1085ProgressionChain=function(active='performance',compact=false){
  /* Keep the smaller contextual version used inside Assessment/Capacities. */
  if(compact)return _v1085ProgressionChainV1092(active,true);

  const steps=[
    {id:'performance',label:'Performance',action:'progress'},
    {id:'assessment',label:'Évaluation',action:'assessment'},
    {id:'capabilities',label:'Capacités',action:'skills'},
    {id:'rank',label:'Rang',action:'skills'}
  ];
  return `<details class="p92-chain">
    <summary>
      <div class="p92-chain-title">
        <div class="kicker">Comment KINETIK mesure ton niveau</div>
        <strong>De tes performances à ton rang</strong>
      </div>
      <span>Comprendre <b>↓</b></span>
    </summary>

    <div class="p92-chain-flow" aria-label="Performance, Évaluation, Capacités, Rang">
      ${steps.map((s,i)=>`
        <button class="${active===s.id?'active':''}" ${s.action==='progress'?'data-progress-tab="performance"':`data-view="${s.action}"`}>
          <i>${i+1}</i><strong>${s.label}</strong>
        </button>${i<steps.length-1?'<span class="p92-chain-arrow">→</span>':''}
      `).join('')}
    </div>

    <div class="p92-chain-explain">
      <p><strong>Performance</strong> : ce que tu réalises en séance.</p>
      <p><strong>Évaluation</strong> : confirme une performance seulement quand une preuve plus fiable est utile.</p>
      <p><strong>Capacités</strong> : regroupe tes performances par domaine.</p>
      <p><strong>Rang</strong> : synthétise plusieurs capacités validées.</p>
    </div>
    <p class="p92-chain-note">Tu n’as pas besoin de passer un test après chaque séance.</p>
  </details>`;
};


/* ========================================================================== */
/* V10.93 · Fix navigation in Progression chain                               */
/* Performance always opens Progression/Performance; Rang opens rank details. */
/* ========================================================================== */
const _v1085ProgressionChainV1093=v1085ProgressionChain;
v1085ProgressionChain=function(active='performance',compact=false){
  if(compact)return _v1085ProgressionChainV1093(active,true);
  const steps=[
    {id:'performance',label:'Performance'},
    {id:'assessment',label:'Évaluation'},
    {id:'capabilities',label:'Capacités'},
    {id:'rank',label:'Rang'}
  ];
  return `<details class="p92-chain">
    <summary>
      <div class="p92-chain-title">
        <div class="kicker">Comment KINETIK mesure ton niveau</div>
        <strong>De tes performances à ton rang</strong>
      </div>
      <span>Comprendre <b>↓</b></span>
    </summary>
    <div class="p92-chain-flow" aria-label="Performance, Évaluation, Capacités, Rang">
      ${steps.map((s,i)=>`
        <button class="${active===s.id?'active':''}" data-progression-chain="${s.id}">
          <i>${i+1}</i><strong>${s.label}</strong>
        </button>${i<steps.length-1?'<span class="p92-chain-arrow">→</span>':''}
      `).join('')}
    </div>
    <div class="p92-chain-explain">
      <p><strong>Performance</strong> : ce que tu réalises en séance.</p>
      <p><strong>Évaluation</strong> : confirme une performance seulement quand une preuve plus fiable est utile.</p>
      <p><strong>Capacités</strong> : regroupe tes performances par domaine.</p>
      <p><strong>Rang</strong> : synthétise plusieurs capacités validées.</p>
    </div>
    <p class="p92-chain-note">Tu n’as pas besoin de passer un test après chaque séance.</p>
  </details>`;
};

function v1093OpenRank(){
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
}

const _bindEventsV1093=bindEvents;
bindEvents=function(){
  _bindEventsV1093();
  document.querySelectorAll('[data-progression-chain]').forEach(b=>b.onclick=()=>{
    const target=b.dataset.progressionChain;
    if(target==='performance'){
      state.view='progress';
      state.progressTab='performance';
      state.selectedHistoryId=null;
      render();
      return;
    }
    if(target==='assessment'){
      state.view='assessment';
      render();
      return;
    }
    if(target==='capabilities'){
      state.view='skills';
      render();
      return;
    }
    if(target==='rank'){
      v1093OpenRank();
    }
  });
};


/* ========================================================================== */
/* V10.94 · Évaluation simplifiée                                             */
/* Mission unique : confirmer les performances importantes, sans jargon.       */
/* ========================================================================== */
renderAssessmentCenter=function(){
  const coverage=assessmentCoverage(),recommended=assessmentRecommended().slice(0,3),cat=state.assessmentCategory||'all';
  const confirmed=coverage.verified;
  const known=coverage.tested;

  return shell(`<header class="topbar assessment94-topbar">
    <div>
      <button class="profile-back-link" data-view="progress">← Progression</button>
      <div class="brand">Évaluation</div>
      <div class="daylabel">Confirme uniquement les performances qui en ont besoin</div>
    </div>
  </header>

  <section class="assessment94-intro">
    <div>
      <div class="kicker">À quoi sert cette page ?</div>
      <h1>Confirmer ton niveau.</h1>
      <p>Les performances enregistrées pendant tes séances comptent déjà. Ici, KINETIK te propose seulement quelques tests lorsqu’une mesure plus fiable est utile pour tes Capacités ou ton Rang.</p>
    </div>
    <div class="assessment94-summary">
      <div><strong>${known}</strong><span>références connues</span></div>
      <div><strong>${confirmed}</strong><span>confirmées par un test</span></div>
    </div>
  </section>

  <section class="assessment94-recommended">
    <div class="assessment94-head">
      <div><div class="kicker">À faire maintenant</div><h2>${recommended.length?'Tests utiles':'Rien d’urgent'}</h2></div>
      <span>${recommended.length?`${recommended.length} proposition${recommended.length>1?'s':''}`:'Profil suffisant'}</span>
    </div>

    ${recommended.length?`<div class="assessment94-list">
      ${recommended.map(p=>{
        const cur=protocolCurrent(p);
        return `<button class="assessment94-test" data-assessment-start="${p.id}">
          <div>
            <strong>${esc(p.name)}</strong>
            <span>${cur.value?`Référence actuelle · ${cur.value} ${p.unit}`:'Aucune référence fiable pour le moment'}</span>
          </div>
          <div class="assessment94-test-action"><small>≈ ${p.duration} min</small><b>${cur.value?'Confirmer':'Faire le test'} →</b></div>
        </button>`;
      }).join('')}
    </div>`:`<div class="assessment94-empty"><strong>Aucun test nécessaire maintenant.</strong><span>Continue simplement ton entraînement. KINETIK te proposera une évaluation lorsqu’elle apportera quelque chose d’utile.</span></div>`}
  </section>

  <details class="assessment94-all">
    <summary>
      <div><div class="kicker">Tous les tests</div><strong>Voir la bibliothèque d’évaluations</strong><span>Force, grip, compétences, mobilité et cardio</span></div>
      <b>↓</b>
    </summary>

    <div class="assessment94-all-body">
      <div class="assessment94-tabs">
        <button class="${cat==='all'?'active':''}" data-assessment-category="all">Tout</button>
        ${ASSESSMENT_CATEGORIES.map(c=>`<button class="${cat===c.id?'active':''}" data-assessment-category="${c.id}">${c.label}</button>`).join('')}
      </div>

      <div class="assessment94-categories">
        ${ASSESSMENT_CATEGORIES.filter(c=>cat==='all'||cat===c.id).map(c=>{
          const s=assessmentCategoryStatus(c.id);
          return `<section class="assessment94-category">
            <div class="assessment94-category-head"><div><strong>${c.label}</strong><span>${c.description}</span></div><small>${s.tested}/${s.total} renseignés</small></div>
            <div>${c.id==='mobility'
              ?renderMobilityAssessmentRows()
              :ASSESSMENT_PROTOCOLS.filter(p=>p.category===c.id).map(renderAssessmentProtocolRow).join('')}</div>
          </section>`;
        }).join('')}
      </div>
    </div>
  </details>

  <section class="assessment94-help">
    <strong>Pas besoin de tout tester.</strong>
    <span>Une séance normale peut déjà créer une référence. Un Test KINETIK sert seulement à confirmer une performance importante dans des conditions reproductibles.</span>
  </section>`, 'progress');
};

/* Keep row wording simple throughout the full test library. */
const _renderAssessmentProtocolRowV1094=renderAssessmentProtocolRow;
renderAssessmentProtocolRow=function(p){
  const current=protocolCurrent(p),verified=v1089VerifiedBenchmark(p);
  return `<div class="assessment-protocol-row assessment94-protocol-row">
    <div class="assessment-row-main">
      <strong>${esc(p.name)}</strong>
      <span>${current.value?`${current.value} ${p.unit}${verified?` · confirmé ${verified.value} ${p.unit}`:''}`:'Pas encore mesuré'}</span>
    </div>
    <button class="assessment-start" data-assessment-start="${p.id}">${current.value?'Retester':'Tester'} →</button>
  </div>`;
};



/* ========================================================================== */
/* V10.96 · Correctif affichage Vue d’ensemble visuelle                       */
/* Le renderer V10.95 est réappliqué en dernier : les anciens overrides ne    */
/* peuvent plus le remplacer.                                                  */
/* ========================================================================== */
renderProgressOverview=v1095RenderProgressOverview;

const _bindEventsV1096=bindEvents;
bindEvents=function(){
  _bindEventsV1096();
  document.querySelectorAll('[data-body-mode]').forEach(b=>b.onclick=()=>{state.progressBodyMode=b.dataset.bodyMode||'overall';state.progressBodyZone=null;render();});
  document.querySelectorAll('[data-body-view]').forEach(b=>b.onclick=()=>{state.progressBodyView=b.dataset.bodyView||'front';state.progressBodyZone=null;render();});
  document.querySelectorAll('[data-body-zone]').forEach(b=>{
    b.onclick=()=>{state.progressBodyZone=b.dataset.bodyZone||null;render();};
    b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();state.progressBodyZone=b.dataset.bodyZone||null;render();}};
  });
  document.querySelectorAll('[data-body-zone-cycle]').forEach(b=>b.onclick=()=>{const dir=b.dataset.bodyZoneCycle==='prev'?-1:1;v1095CycleBodyZone(dir,state.progressBodyMode||'overall',state.progressBodyView||'front');render();});
};



/* ========================================================================== */
/* V10.97 · Suppression du bloc explicatif Progression                        */
/* La chaîne Performance → Évaluation → Capacités → Rang n'est plus affichée */
/* dans la vue d'ensemble : le corps humain devient le repère visuel principal. */
/* ========================================================================== */
const _v1085ProgressionChainV1097=v1085ProgressionChain;
v1085ProgressionChain=function(active='performance',compact=false){
  if(!compact)return '';
  return _v1085ProgressionChainV1097(active,true);
};


/* ========================================================================== */
/* V10.95 · Vue d’ensemble visuelle — corps humain, moins de texte            */
/* Progression > Vue d’ensemble : lecture immédiate par zones du corps.       */
/* ========================================================================== */
function v1095Avg(){
  const vals=[...arguments].map(v=>Number(v)).filter(v=>Number.isFinite(v)&&v>=0);
  return vals.length?Math.round(vals.reduce((s,v)=>s+v,0)/vals.length):null;
}
function v1095CapabilityScore(id){const row=capabilityScores().find(x=>x.id===id);return row?.assessed?Number(row.score):null;}
function v1095MobilityScore(id){const row=mobilityProfiles().find(x=>x.id===id);return row?.assessed?Number(row.score):null;}
function v1095LegsScore(){const tree=SKILL_TREES.find(t=>t.id==='legs');if(!tree)return null;const p=skillTreeProgress(tree);return p&&p.pct>0?Math.round(p.pct):null;}
function v1095BodyTone(score){
  if(score==null)return {id:'none',label:'À évaluer',short:'—'};
  if(score<35)return {id:'low',label:'Fragile',short:'Faible'};
  if(score<55)return {id:'watch',label:'À travailler',short:'Moyen'};
  if(score<70)return {id:'ok',label:'Correct',short:'Correct'};
  if(score<85)return {id:'good',label:'Solide',short:'Bon'};
  return {id:'great',label:'Avancé',short:'Fort'};
}
function v1095GoalText(){const p=getAthleteProfile();return p?.primaryGoal||'Progression générale';}
function v1095BodyZones(mode='overall',view='front'){
  const pull=v1095CapabilityScore('pull'),push=v1095CapabilityScore('push'),core=v1095CapabilityScore('core'),grip=v1095CapabilityScore('grip'),balance=v1095CapabilityScore('balance'),explosive=v1095CapabilityScore('explosive');
  const mShoulders=v1095MobilityScore('shoulders'),mThorax=v1095MobilityScore('thorax'),mWrists=v1095MobilityScore('wrists'),mHips=v1095MobilityScore('hips'),mPosterior=v1095MobilityScore('posterior'),mAnkles=v1095MobilityScore('ankles');
  const legs=v1095LegsScore();
  const data={
    overall:{
      shoulders:{score:v1095Avg(push,balance,mShoulders),label:'Épaules',desc:'Poussée, stabilité et mobilité des épaules.',action:'skills'},
      chest:{score:v1095Avg(push,balance),label:'Pectoraux',desc:'Lecture surtout basée sur la poussée.',action:'skills'},
      back:{score:v1095Avg(pull,explosive,mThorax),label:'Dos',desc:'Tractions, tirage haut et ouverture thoracique.',action:'skills'},
      arms:{score:v1095Avg(pull,push),label:'Bras',desc:'Synthèse tirage + poussée.',action:'skills'},
      forearms:{score:v1095Avg(grip),label:'Avant-bras',desc:'Grip et tenue à la barre.',action:'skills'},
      wrists:{score:v1095Avg(grip,mWrists,balance),label:'Poignets',desc:'Grip, stabilité et extension utile.',action:'flexibility'},
      core:{score:v1095Avg(core,balance),label:'Core / abdos',desc:'Gainage, compression et contrôle.',action:'skills'},
      hips:{score:v1095Avg(legs,mHips,core),label:'Hanches',desc:'Force unilatérale et mobilité de hanche.',action:'flexibility'},
      quads:{score:v1095Avg(legs,mHips),label:'Quadriceps',desc:'Jambes unilatérales et squat.',action:'skills'},
      hamstrings:{score:v1095Avg(legs,mPosterior),label:'Ischios',desc:'Chaîne postérieure et contrôle des jambes.',action:'flexibility'},
      calves:{score:v1095Avg(legs,mAnkles),label:'Mollets',desc:'Appui et contrôle du bas de jambe.',action:'skills'},
      ankles:{score:v1095Avg(mAnkles,legs),label:'Chevilles',desc:'Mobilité utile au squat et à la course.',action:'flexibility'}
    },
    strength:{
      shoulders:{score:v1095Avg(push,balance),label:'Épaules',desc:'Poussée verticale et stabilité inversée.',action:'skills'},
      chest:{score:v1095Avg(push),label:'Pectoraux',desc:'Basé sur les dips et variantes de poussée.',action:'skills'},
      back:{score:v1095Avg(pull,explosive),label:'Dos',desc:'Basé sur le tirage et l’explosivité.',action:'skills'},
      arms:{score:v1095Avg(pull,push),label:'Bras',desc:'Synthèse tirage + poussée.',action:'skills'},
      forearms:{score:v1095Avg(grip),label:'Avant-bras',desc:'Grip et suspension.',action:'skills'},
      wrists:{score:v1095Avg(grip,balance),label:'Poignets',desc:'Stabilité utile au handstand et au grip.',action:'skills'},
      core:{score:v1095Avg(core,balance),label:'Core / abdos',desc:'Compression et maintien.',action:'skills'},
      hips:{score:v1095Avg(legs,core),label:'Hanches',desc:'Contrôle du bassin et jambes.',action:'skills'},
      quads:{score:v1095Avg(legs),label:'Quadriceps',desc:'Lecture via les skills jambes.',action:'skills'},
      hamstrings:{score:v1095Avg(legs),label:'Ischios',desc:'Lecture via les skills jambes.',action:'skills'},
      calves:{score:v1095Avg(legs),label:'Mollets',desc:'Lecture globale des jambes.',action:'skills'},
      ankles:{score:null,label:'Chevilles',desc:'Pas de score force dédié pour le moment.',action:'flexibility'}
    },
    mobility:{
      shoulders:{score:v1095Avg(mShoulders),label:'Épaules',desc:'Flexion et confort au-dessus de la tête.',action:'flexibility'},
      chest:{score:v1095Avg(mThorax),label:'Thorax',desc:'Ouverture du haut du tronc.',action:'flexibility'},
      back:{score:v1095Avg(mThorax),label:'Thorax / dos',desc:'Rotation thoracique et ouverture.',action:'flexibility'},
      arms:{score:null,label:'Bras',desc:'Les bras n’ont pas de test mobilité direct.',action:'flexibility'},
      forearms:{score:null,label:'Avant-bras',desc:'Les avant-bras n’ont pas de test mobilité direct.',action:'flexibility'},
      wrists:{score:v1095Avg(mWrists),label:'Poignets',desc:'Extension utile pour appuis et handstand.',action:'flexibility'},
      core:{score:v1095Avg(mThorax,mHips),label:'Tronc',desc:'Mobilité du tronc et des hanches.',action:'flexibility'},
      hips:{score:v1095Avg(mHips),label:'Hanches',desc:'Rotation interne et squat profond.',action:'flexibility'},
      quads:{score:v1095Avg(mHips),label:'Quadriceps / hanches',desc:'Lecture indirecte via squat profond.',action:'flexibility'},
      hamstrings:{score:v1095Avg(mPosterior),label:'Chaîne postérieure',desc:'Flexion avant et ischios.',action:'flexibility'},
      calves:{score:v1095Avg(mAnkles),label:'Bas de jambe',desc:'Lecture indirecte via chevilles.',action:'flexibility'},
      ankles:{score:v1095Avg(mAnkles),label:'Chevilles',desc:'Knee-to-wall gauche et droite.',action:'flexibility'}
    }
  };
  const base=(data[mode]||data.overall);
  const ids=view==='back'
    ?['shoulders','back','arms','forearms','wrists','core','hips','hamstrings','calves','ankles']
    :['shoulders','chest','arms','forearms','wrists','core','hips','quads','calves','ankles'];
  return ids.map(id=>({id,...base[id],tone:v1095BodyTone(base[id]?.score)}));
}
function v1095BodyZoneLookup(mode='overall'){
  const front=v1095BodyZones(mode,'front'),back=v1095BodyZones(mode,'back');
  const map={};
  [...front,...back].forEach(z=>{if(!map[z.id]||((z.score??-1)>(map[z.id].score??-1)))map[z.id]=z;});
  return map;
}
function v1095PriorityZones(mode='overall',limit=3){
  return Object.values(v1095BodyZoneLookup(mode)).filter(z=>z.score!=null).sort((a,b)=>a.score-b.score).slice(0,limit);
}
function v1095StrongZones(mode='overall',limit=3){
  return Object.values(v1095BodyZoneLookup(mode)).filter(z=>z.score!=null).sort((a,b)=>b.score-a.score).slice(0,limit);
}
function v1095SelectedBodyZone(mode='overall',view='front'){
  const zones=v1095BodyZones(mode,view),lookup=v1095BodyZoneLookup(mode),wanted=state.progressBodyZone;
  if(wanted&&lookup[wanted])return lookup[wanted];
  const priority=v1095PriorityZones(mode,1)[0];
  return priority||zones.find(z=>z.score!=null)||zones[0];
}
function v1095BalanceText(){
  const caps=capabilityScores();
  const pull=caps.find(x=>x.id==='pull')?.score??null,push=caps.find(x=>x.id==='push')?.score??null,legs=v1095LegsScore();
  const vals=[['Haut du corps',v1095Avg(pull,push)],['Jambes',legs]];
  if(vals[0][1]==null&&vals[1][1]==null)return 'Profil encore à construire';
  if(vals[0][1]!=null&&vals[1][1]!=null){
    const diff=vals[0][1]-vals[1][1];
    if(Math.abs(diff)<=8)return 'Équilibre global correct';
    return diff>0?'Haut du corps dominant':'Bas du corps dominant';
  }
  return vals[0][1]!=null?'Lecture surtout haut du corps':'Lecture surtout bas du corps';
}
function v1095OverviewSummary(){
  const zones=Object.values(v1095BodyZoneLookup('overall'));
  const assessed=zones.filter(z=>z.score!=null), strong=v1095StrongZones('overall',1)[0], weak=v1095PriorityZones('overall',1)[0];
  const mobilityAssessed=mobilityProfiles().filter(x=>x.assessed).length;
  const capsAssessed=capabilityScores().filter(x=>x.assessed).length;
  const global=assessed.length?Math.round(assessed.reduce((s,z)=>s+z.score,0)/assessed.length):null;
  return {
    global,
    globalLabel:global==null?'À construire':v1095BodyTone(global).label,
    strong,
    weak,
    coverage:`${assessed.length}/${zones.length} zones`,
    evidence:`${capsAssessed} capacités · ${mobilityAssessed} zones mobilité`,
    balance:v1095BalanceText()
  };
}
function v1095ActionButton(action='skills'){
  if(action==='flexibility')return 'data-view="flexibility"';
  if(action==='performance')return 'data-progress-tab="performance"';
  if(action==='measurements')return 'data-view="measurements"';
  return 'data-view="skills"';
}
function v1095BodyMapSVG(view='front',mode='overall',selectedId=''){
  const zones=v1095BodyZones(mode,view);
  const find=id=>zones.find(z=>z.id===id)||{id,label:id,tone:{id:'none'},score:null};
  const zoneAttrs=id=>`class="bodymap-zone tone-${find(id).tone.id}${selectedId===id?' selected':''}" data-body-zone="${id}" role="button" tabindex="0" aria-label="${esc(find(id).label)}${find(id).score!=null?` ${find(id).score} sur 100`:''}"`;
  const front=view==='front';
  return `<svg class="bodymap-figure" viewBox="0 0 240 420" role="img" aria-label="Corps humain ${front?'vue de face':'vue de dos'}">
    <text x="120" y="16" text-anchor="middle" class="bodymap-caption">${front?'Vue face':'Vue dos'}</text>
    <circle cx="120" cy="44" r="24" class="bodymap-base"/>
    <rect x="90" y="72" width="60" height="28" rx="14" class="bodymap-base"/>
    <g ${zoneAttrs('shoulders')}><rect x="62" y="84" width="116" height="20" rx="10"/></g>
    ${front
      ?`<g ${zoneAttrs('chest')}><rect x="84" y="104" width="72" height="58" rx="26"/></g>`
      :`<g ${zoneAttrs('back')}><rect x="82" y="102" width="76" height="84" rx="28"/></g>`}
    <g ${zoneAttrs('arms')}><rect x="40" y="102" width="22" height="80" rx="11"/><rect x="178" y="102" width="22" height="80" rx="11"/></g>
    <g ${zoneAttrs('forearms')}><rect x="42" y="182" width="20" height="78" rx="10"/><rect x="178" y="182" width="20" height="78" rx="10"/></g>
    <g ${zoneAttrs('wrists')}><circle cx="52" cy="272" r="10"/><circle cx="188" cy="272" r="10"/></g>
    <g ${zoneAttrs('core')}><rect x="92" y="166" width="56" height="72" rx="22"/></g>
    <g ${zoneAttrs('hips')}><rect x="88" y="238" width="64" height="34" rx="14"/></g>
    ${front
      ?`<g ${zoneAttrs('quads')}><rect x="90" y="272" width="24" height="76" rx="12"/><rect x="126" y="272" width="24" height="76" rx="12"/></g>`
      :`<g ${zoneAttrs('hamstrings')}><rect x="90" y="272" width="24" height="76" rx="12"/><rect x="126" y="272" width="24" height="76" rx="12"/></g>`}
    <g ${zoneAttrs('calves')}><rect x="92" y="346" width="20" height="48" rx="10"/><rect x="128" y="346" width="20" height="48" rx="10"/></g>
    <g ${zoneAttrs('ankles')}><circle cx="102" cy="404" r="8"/><circle cx="138" cy="404" r="8"/></g>
  </svg>`;
}
function v1095ZoneChip(z){
  return `<button class="body-overview-chip tone-${z.tone.id}" data-body-zone="${z.id}"><span>${esc(z.label)}</span><strong>${z.score!=null?z.score+'/100':z.tone.label}</strong></button>`;
}
function v1095ZoneDetailCard(mode='overall',view='front'){
  const zone=v1095SelectedBodyZone(mode,view);
  if(!zone)return '';
  const actionLabel=zone.action==='flexibility'?'Voir mobilité':zone.action==='measurements'?'Voir mesures':'Voir capacités';
  return `<article class="body-zone-detail card">
    <div class="body-zone-detail-head">
      <div><div class="kicker">Zone sélectionnée</div><h3>${esc(zone.label)}</h3></div>
      <div class="body-zone-score tone-${zone.tone.id}">${zone.score!=null?`${zone.score}<small>/100</small>`:zone.tone.label}</div>
    </div>
    <div class="body-zone-state"><span>Statut</span><strong>${zone.tone.label}</strong></div>
    <p>${esc(zone.desc||'')}</p>
    <div class="body-zone-mini-actions">
      <button class="btn btn-secondary compact" data-body-zone-cycle="prev">← Zone</button>
      <button class="btn btn-secondary compact" data-body-zone-cycle="next">Zone →</button>
      <button class="btn btn-outline compact" ${v1095ActionButton(zone.action)}>${actionLabel} →</button>
    </div>
  </article>`;
}
function v1095CycleBodyZone(dir=1,mode='overall',view='front'){
  const zones=v1095BodyZones(mode,view); if(!zones.length)return;
  const id=v1095SelectedBodyZone(mode,view)?.id; let idx=zones.findIndex(z=>z.id===id);
  if(idx<0)idx=0;
  idx=(idx+dir+zones.length)%zones.length;
  state.progressBodyZone=zones[idx].id;
}
function v1095RenderProgressOverview(){
  const mode=state.progressBodyMode||'overall';
  const view=state.progressBodyView||'front';
  const summary=v1095OverviewSummary();
  const selected=v1095SelectedBodyZone(mode,view);
  state.progressBodyZone=selected?.id||state.progressBodyZone;
  const priority=v1095PriorityZones(mode,3),strong=v1095StrongZones(mode,3);
  const modeLabel=mode==='strength'?'Force':mode==='mobility'?'Mobilité':'Vue d’ensemble';
  return `
    <section class="card body-overview-hero">
      <div class="section-head">
        <div><div class="kicker">Vue d’ensemble</div><h2>Ton corps en un coup d’œil</h2></div>
        <span class="pill">Objectif · ${esc(v1095GoalText())}</span>
      </div>
      <div class="body-overview-stats">
        <article><span>Niveau global</span><strong>${summary.global!=null?summary.global+'/100':'—'}</strong><small>${esc(summary.globalLabel)}</small></article>
        <article><span>Plus solide</span><strong>${esc(summary.strong?.label||'—')}</strong><small>${summary.strong?.score!=null?summary.strong.score+'/100':'À construire'}</small></article>
        <article><span>Zone prioritaire</span><strong>${esc(summary.weak?.label||'—')}</strong><small>${summary.weak?.score!=null?summary.weak.score+'/100':'À évaluer'}</small></article>
        <article><span>Équilibre</span><strong>${esc(summary.balance)}</strong><small>${esc(summary.coverage)} · ${esc(summary.evidence)}</small></article>
      </div>
    </section>

    <section class="card body-overview-card">
      <div class="body-overview-toolbar">
        <div class="body-overview-toggle" role="tablist" aria-label="Mode de lecture">
          <button class="${mode==='overall'?'active':''}" data-body-mode="overall">Vue d’ensemble</button>
          <button class="${mode==='strength'?'active':''}" data-body-mode="strength">Force</button>
          <button class="${mode==='mobility'?'active':''}" data-body-mode="mobility">Mobilité</button>
        </div>
        <div class="body-overview-toggle" role="tablist" aria-label="Vue du corps">
          <button class="${view==='front'?'active':''}" data-body-view="front">Face</button>
          <button class="${view==='back'?'active':''}" data-body-view="back">Dos</button>
        </div>
      </div>
      <div class="body-overview-model-wrap">
        <div class="body-overview-model">${v1095BodyMapSVG(view,mode,selected?.id||'')}</div>
        <div class="body-overview-side">
          ${v1095ZoneDetailCard(mode,view)}
          <div class="body-overview-legend">
            <span><i class="tone-none"></i>À évaluer</span>
            <span><i class="tone-partial"></i>Données limitées</span>
            <span><i class="tone-low"></i>Fragile</span>
            <span><i class="tone-watch"></i>À travailler</span>
            <span><i class="tone-ok"></i>Correct</span>
            <span><i class="tone-good"></i>Solide</span>
            <span><i class="tone-great"></i>Avancé</span>
          </div>
        </div>
      </div>
    </section>

    <section class="body-overview-grid">
      <article class="card body-overview-list-card">
        <div class="section-head"><div><div class="kicker">À travailler</div><h3>Les zones les moins avancées</h3></div><span class="pill">${modeLabel}</span></div>
        <div class="body-overview-chip-list">
          ${priority.length?priority.map(v1095ZoneChip).join(''):'<div class="empty">Pas assez de données pour identifier une priorité.</div>'}
        </div>
      </article>
      <article class="card body-overview-list-card">
        <div class="section-head"><div><div class="kicker">Points forts</div><h3>Ce qui soutient ton objectif</h3></div><span class="pill">${modeLabel}</span></div>
        <div class="body-overview-chip-list">
          ${strong.length?strong.map(v1095ZoneChip).join(''):'<div class="empty">Tes points forts apparaîtront ici avec plus de données.</div>'}
        </div>
      </article>
    </section>

    <section class="card body-overview-actions">
      <div class="section-head"><div><div class="kicker">Actions rapides</div><h3>Aller au bon endroit</h3></div></div>
      <div class="body-overview-action-grid">
        <button data-progress-tab="performance"><span>Performances</span><strong>Voir les records et tendances</strong><b>→</b></button>
        <button data-view="skills"><span>Capacités</span><strong>Voir le profil détaillé</strong><b>→</b></button>
        <button data-view="flexibility"><span>Mobilité</span><strong>Voir les zones à travailler</strong><b>→</b></button>
        <button data-view="assessment"><span>Évaluation</span><strong>Confirmer les repères utiles</strong><b>→</b></button>
      </div>
    </section>`;
};
const _bindEventsV1095=bindEvents;
bindEvents=function(){
  _bindEventsV1095();
  document.querySelectorAll('[data-body-mode]').forEach(b=>b.onclick=()=>{state.progressBodyMode=b.dataset.bodyMode||'overall';state.progressBodyZone=null;render();});
  document.querySelectorAll('[data-body-view]').forEach(b=>b.onclick=()=>{state.progressBodyView=b.dataset.bodyView||'front';state.progressBodyZone=null;render();});
  document.querySelectorAll('[data-body-zone]').forEach(b=>{
    b.onclick=()=>{state.progressBodyZone=b.dataset.bodyZone||null;render();};
    b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();state.progressBodyZone=b.dataset.bodyZone||null;render();}};
  });
  document.querySelectorAll('[data-body-zone-cycle]').forEach(b=>b.onclick=()=>{const dir=b.dataset.bodyZoneCycle==='prev'?-1:1;v1095CycleBodyZone(dir,state.progressBodyMode||'overall',state.progressBodyView||'front');render();});
};



/* ========================================================================== */
/* V10.99 · Runtime scope + Service Worker fix                                */
/* V10.95 body overview helpers moved to global scope.                         */
/* ========================================================================== */


/* ========================================================================== */

/* ========================================================================== */
/* KINETIK v10.148 · Progression finalisation                                */
/* Résumé → Performances → Skills → Corps → Historique                       */
/* ========================================================================== */
Object.assign(state,{
  progressPeriod:state.progressPeriod||'30d',
  progressMetric:state.progressMetric||null,
  progressBodyMetric:state.progressBodyMetric||'weight',
  progressHistoryFilter:state.progressHistoryFilter||'all'
});

const V10146_PERIODS=[['30d','30 j'],['90d','3 mois'],['180d','6 mois'],['all','Tout']];
function v10146PeriodBounds(period=state.progressPeriod){
  const end=Date.now();
  if(period==='all')return {start:null,end,label:'Depuis le début',days:null};
  const days=period==='90d'?90:period==='180d'?180:30;
  return {start:end-(days-1)*86400000,end,label:days===30?'30 derniers jours':days===90?'3 derniers mois':'6 derniers mois',days};
}
function v10146InPeriod(date,bounds=v10146PeriodBounds()){
  const t=new Date(date).getTime();if(!Number.isFinite(t))return false;
  return (bounds.start==null||t>=bounds.start)&&t<=bounds.end+86400000;
}
function v10146PeriodControl(){
  return `<div class="p146-periods" aria-label="Période de progression">${V10146_PERIODS.map(([id,label])=>`<button class="${state.progressPeriod===id?'active':''}" data-progress-period="${id}">${label}</button>`).join('')}</div>`;
}
function v10146Number(v,digits=0){
  const n=Number(v);if(!Number.isFinite(n))return '—';
  return n.toLocaleString('fr-FR',{minimumFractionDigits:digits,maximumFractionDigits:digits});
}
function v10146Signed(v,unit='',digits=0){
  const n=Number(v);if(!Number.isFinite(n))return '—';
  const s=n>0?'+':'';return `${s}${v10146Number(n,digits)}${unit?` ${unit}`:''}`;
}
function v10146ExerciseType(name){
  const info=exerciseInfo(name);return info?.prescription?.type||'reps';
}
function v10146ExerciseUnit(name,type=null){
  const t=type||v10146ExerciseType(name);return String(t||'').startsWith('hold')?'s':'reps';
}
function v10146PerformanceSeries(name,bounds=v10146PeriodBounds()){
  const rows=[];
  getHistory().forEach(session=>{
    if(!v10146InPeriod(session.date,bounds))return;
    (session.entries||[]).forEach(e=>{
      if(e.exercise!==name||e.type==='timer')return;
      const value=Number(e.value);if(!(value>0))return;
      rows.push({date:session.date,value,type:entryResolvedType(e),source:'Séance'});
    });
  });
  getQuickLogs().forEach(e=>{
    if(e.exercise!==name||!v10146InPeriod(e.date,bounds))return;
    const value=Number(e.value);if(!(value>0))return;
    rows.push({date:e.date,value,type:entryResolvedType(e),source:e.source==='core_timer'?'Gainage':'Quick Log'});
  });
  const daily=new Map();
  rows.sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(row=>{
    const key=localDateKey(new Date(row.date)),old=daily.get(key);
    if(!old||row.value>old.value)daily.set(key,{...row,key});
  });
  return [...daily.values()].sort((a,b)=>new Date(a.date)-new Date(b.date));
}
function v10146PerformanceSummary(name,bounds=v10146PeriodBounds()){
  const points=v10146PerformanceSeries(name,bounds),unit=v10146ExerciseUnit(name,points.at(-1)?.type);
  if(!points.length)return {name,points,unit,best:null,first:null,last:null,delta:null,pct:null,lastPr:null,daysSincePr:null};
  const first=points[0].value,last=points.at(-1).value,best=Math.max(...points.map(x=>x.value));
  const bestPoint=[...points].reverse().find(x=>x.value===best)||points.at(-1);
  const delta=best-first,pct=first>0?delta/first*100:null;
  const daysSincePr=Math.max(0,Math.floor((Date.now()-new Date(bestPoint.date).getTime())/86400000));
  return {name,points,unit,best,first,last,delta,pct,lastPr:bestPoint.date,daysSincePr};
}
function v10146MetricNames(){
  const preferred=['Tractions strictes','Dips','Dead hang','Pompes'];
  const names=new Set();
  currentRecords().forEach(r=>{if(r.exercise)names.add(r.exercise);});
  getQuickLogs().forEach(r=>{if(r.exercise)names.add(r.exercise);});
  getHistory().forEach(s=>(s.entries||[]).forEach(e=>{if(e.exercise&&e.type!=='timer')names.add(e.exercise);}));
  const arr=[...names];
  return [...preferred.filter(x=>names.has(x)),...arr.filter(x=>!preferred.includes(x)).sort((a,b)=>a.localeCompare(b,'fr'))];
}
function v10146PrimaryMetrics(){
  const names=v10146MetricNames();
  const preferred=['Tractions strictes','Dips','Dead hang','Pompes'];
  const picked=preferred.filter(x=>names.includes(x));
  for(const n of names)if(picked.length<5&&!picked.includes(n))picked.push(n);
  return picked.slice(0,5);
}
function v10146BodySeries(key,bounds=v10146PeriodBounds()){
  const cfg=getBodyConfig();
  const rows=getBodyLogs().slice().sort((a,b)=>new Date(a.date)-new Date(b.date)).filter(l=>v10146InPeriod(l.date,bounds)).map(l=>{
    const value=key==='bodyFat'?bodyFatForLog(l,cfg):bodyValue(l,key);
    return {date:l.date,value:Number(value)};
  }).filter(x=>Number.isFinite(x.value)&&x.value>0);
  return rows;
}
function v10146BodySummary(key,bounds=v10146PeriodBounds()){
  const points=v10146BodySeries(key,bounds),def={weight:{label:'Poids',unit:'kg',digits:1},waist:{label:'Tour de taille',unit:'cm',digits:1},bodyFat:{label:'Masse grasse estimée',unit:'%',digits:1}}[key]||{label:key,unit:'',digits:1};
  if(!points.length)return {...def,key,points,first:null,last:null,delta:null};
  const first=points[0].value,last=points.at(-1).value;return {...def,key,points,first,last,delta:last-first};
}
function v10146SparkSvg(points,{unit='',digits=0,height=210}={}){
  if(!points||points.length<2)return '';
  const W=760,H=height,padX=38,padTop=25,padBottom=35,vals=points.map(x=>Number(x.value)).filter(Number.isFinite);
  let min=Math.min(...vals),max=Math.max(...vals);if(max===min){max+=1;min-=1;}const margin=(max-min)*.12;min-=margin;max+=margin;
  const x=i=>padX+(i/(points.length-1))*(W-padX*2),y=v=>padTop+(max-v)/(max-min)*(H-padTop-padBottom);
  const path=points.map((p,i)=>`${i?'L':'M'} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ');
  const first=points[0],last=points.at(-1),fmt=v=>`${v10146Number(v,digits)}${unit?` ${unit}`:''}`;
  return `<svg class="p146-chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Évolution ${esc(fmt(first.value))} vers ${esc(fmt(last.value))}">
    <line x1="${padX}" y1="${H-padBottom}" x2="${W-padX}" y2="${H-padBottom}" class="p146-grid-line"/>
    <path d="${path}" class="p146-line" fill="none"/>
    ${points.map((p,i)=>`<circle cx="${x(i).toFixed(1)}" cy="${y(p.value).toFixed(1)}" r="${i===points.length-1?5:3}" class="p146-point"><title>${formatShortDate(p.date)} · ${fmt(p.value)}</title></circle>`).join('')}
    <text x="${padX}" y="${H-10}" class="p146-axis">${formatShortDate(first.date)}</text>
    <text x="${W-padX}" y="${H-10}" text-anchor="end" class="p146-axis">${formatShortDate(last.date)}</text>
    <text x="${padX}" y="17" class="p146-axis strong">${fmt(max-margin)}</text>
  </svg>`;
}
function v10146MetricDeltaCard(label,summary,{body=false}={}){
  if(summary.best==null&&summary.last==null)return `<article class="p146-kpi empty"><span>${esc(label)}</span><strong>—</strong><small>Pas encore assez de données</small></article>`;
  const current=body?summary.last:summary.best,delta=summary.delta,unit=summary.unit||'';
  const digits=body?summary.digits||1:0;
  let detail='Première référence';
  if(delta!=null&&Math.abs(delta)>.0001){
    if(body)detail=`${v10146Signed(delta,unit,digits)} sur la période`;
    else detail=`${v10146Signed(delta,unit,digits)} · ${summary.pct!=null?v10146Signed(summary.pct,'%',0):'depuis la référence'}`;
  }else if((summary.points||[]).length>1)detail='Stable sur la période';
  return `<article class="p146-kpi"><span>${esc(label)}</span><strong>${v10146Number(current,digits)} <small>${esc(unit)}</small></strong><small>${esc(detail)}</small></article>`;
}
function v10146TrendRows(){
  const bounds=v10146PeriodBounds(),rows=[];
  for(const name of v10146PrimaryMetrics()){
    const s=v10146PerformanceSummary(name,bounds);if(s.points.length<2)continue;
    if(s.delta>0){
      rows.push({tone:'up',icon:'↑',title:name,detail:`${v10146Number(s.first)} → ${v10146Number(s.best)} ${s.unit}`,note:s.daysSincePr<=21?'Nouveau meilleur niveau sur la période':`Record inchangé depuis ${s.daysSincePr} j`});
    }else if(s.daysSincePr>=21&&s.points.length>=3){
      rows.push({tone:'flat',icon:'→',title:name,detail:`${v10146Number(s.best)} ${s.unit}`,note:`Stable depuis ${s.daysSincePr} jours`});
    }
  }
  for(const zone of MOBILITY_ZONES){
    const h=v10145ZoneScoreHistory(zone.id).filter(x=>v10146InPeriod(x.date,bounds));if(h.length<2)continue;
    const delta=h.at(-1).score-h[0].score;if(Math.abs(delta)<4)continue;
    rows.push({tone:delta>0?'up':'down',icon:delta>0?'↑':'↓',title:`Mobilité · ${zone.label}`,detail:`${h[0].score} → ${h.at(-1).score}`,note:delta>0?'Progression mesurée':'À surveiller'});
  }
  return rows.sort((a,b)=>({down:0,flat:1,up:2}[a.tone]-{down:0,flat:1,up:2}[b.tone])).slice(0,5);
}
function v10146CompactRecords(limit=5){
  const records=currentRecords().slice(0,limit);
  if(!records.length)return `<div class="p146-empty">Tes premiers records apparaîtront après quelques performances enregistrées.</div>`;
  return `<div class="p146-records">${records.map(r=>`<button data-exercise-progress="${encodeURIComponent(r.exercise)}"><div><strong>${esc(r.exercise)}</strong><small>${formatShortDate(r.date)}</small></div><b>${recordValueText(r)}</b></button>`).join('')}</div>`;
}
function v10146SkillCards(limit=3){
  const focus=primarySkillTree(),ordered=[focus,...SKILL_TREES.filter(t=>t.id!==focus.id).sort((a,b)=>skillTreeProgress(b).pct-skillTreeProgress(a).pct)];
  return ordered.slice(0,limit).map(tree=>{const p=skillTreeProgress(tree);return `<button class="p146-skill-card" data-progress-tab="skills"><div><span>${tree.id===focus.id?'Objectif principal':'Skill'}</span><strong>${esc(tree.name)}</strong><small>${p.next?`Prochaine étape · ${esc(p.next.name)}`:'Parcours validé'}</small></div><b>${p.pct}%</b><i><u style="width:${p.pct}%"></u></i></button>`;}).join('');
}
function v10146RankCompact(){
  const r=getRankState(),pct=Math.round(r.readiness*100);
  return `<button class="p146-rank rank-${r.current.id}" data-progress-tab="rank"><div><span>Rang</span><strong>${esc(r.displayName)}</strong><small>${r.next?`${pct}% vers ${esc(r.next.name)} · ${r.nextEval.completed}/${r.nextEval.required} exigences`:'Rang maximal atteint'}</small></div><b>Voir les rangs →</b></button>`;
}
function v10147RankRoadmap(){
  const rs=getRankState();
  return `<div class="p147-rank-roadmap">${RANKS.map((r,i)=>`<button class="p147-rank-node rank-${r.id} ${i<rs.index?'done':''} ${i===rs.index?'current':''} ${i>rs.index?'future':''}" data-rank-select="${r.id}"><span>${i<rs.index?'✓':i+1}</span><strong>${esc(r.name)}</strong><small>${i<rs.index?'Validé':i===rs.index?'Actuel':'À atteindre'}</small></button>`).join('')}</div>`;
}
function v10148RankGateKind(g){
  if(String(g.id||'').startsWith('proof-'))return 'proof';
  if(g.id==='avg'||String(g.id||'').startsWith('cap-'))return 'capability';
  return 'mastery';
}
function v10148RankGateValue(g){
  const cur=Number(g.current||0),target=Number(g.target||0),unit=String(g.unit||'').trim();
  const curText=Number.isInteger(cur)?String(cur):cur.toFixed(1);
  if(v10148RankGateKind(g)==='capability'){
    return `<span class="p148-gate-value-main">${curText} pts</span><small>seuil ≥ ${target}</small>`;
  }
  if((unit===''||unit==='/100')&&target===1){
    return `<span class="p148-gate-value-main">${g.done?'Validé':'À valider'}</span>`;
  }
  if(g.id==='skills')return `<span class="p148-gate-value-main">${curText} pts</span><small>objectif ${target} pts</small>`;
  if(g.id==='mastery'||g.id==='major-mastery')return `<span class="p148-gate-value-main">${curText} / ${target}</span><small>skills validés</small>`;
  return `<span class="p148-gate-value-main">${curText} / ${target}${unit?` ${esc(unit.replace('/100','pts'))}`:''}</span>`;
}
function v10148RankGateDetail(g){
  const kind=v10148RankGateKind(g);
  if(g.id==='avg')return `Indice global KINETIK · moyenne des 6 capacités${g.detail?` · ${esc(g.detail)}`:''}`;
  if(kind==='capability')return `Indice composite KINETIK${g.detail?` · ${esc(g.detail)}`:''}`;
  return g.detail?esc(g.detail):'';
}
function v10148RankGateRows(gates){
  const groups=[
    ['proof','Standards mesurables','Valeurs réelles à démontrer'],
    ['capability','Équilibre du profil','À partir de Platine, ces indices vérifient qu’une force isolée ne masque pas une faiblesse.'],
    ['mastery','Maîtrise technique','Diversité et skills nécessaires aux rangs plus élevés.']
  ];
  return groups.map(([kind,title,help])=>{
    const rows=(gates||[]).filter(g=>v10148RankGateKind(g)===kind);if(!rows.length)return '';
    return `<div class="p148-rank-group"><div class="p148-rank-group-head"><div><strong>${title}</strong><small>${help}</small></div><span>${rows.filter(x=>x.done).length}/${rows.length}</span></div><div class="rank-v2-content p148-rank-rows">${rows.map(g=>`<div class="${g.done?'done':''}"><div><span>${g.done?'✓':'○'}</span><strong>${esc(g.label)}</strong>${v10148RankGateDetail(g)?`<small>${v10148RankGateDetail(g)}</small>`:''}</div><b class="p148-gate-value">${v10148RankGateValue(g)}</b></div>`).join('')}</div></div>`;
  }).join('');
}
function renderProgressRank(){
  const rs=getRankState();
  const selectedIndex=rankIndexById(state.selectedRankId||rs.current.id);
  const selected=RANKS[selectedIndex]||rs.current;
  const ev=evaluateRank(selected),next=rs.next,pct=Math.round(rs.readiness*100);
  const nextEval=next?evaluateRank(next):null;
  const nextIncomplete=(nextEval?.gates||[]).filter(g=>!g.done);
  const selectedStatus=selectedIndex<rs.index?'Validé':selectedIndex===rs.index?'Rang actuel':'À atteindre';
  return `<section class="p147-rank-head rank-${rs.current.id}"><div><div class="kicker">Rang KINETIK</div><h1>${esc(rs.displayName)}</h1><p>Des standards réels et transparents. Les indices composites n’interviennent qu’à partir de Platine.</p></div><div class="p147-rank-head-score"><strong>${next?`${pct}%`:'Max'}</strong><span>${next?`vers ${esc(next.name)}`:'Légende atteinte'}</span></div></section>
    <section class="p147-rank-summary">
      <article><span>Rang actuel</span><strong>${esc(rs.displayName)}</strong><small>${esc(rs.current.title)}</small></article>
      <article><span>Prochain rang</span><strong>${next?esc(next.name):'—'}</strong><small>${nextEval?`${nextEval.completed}/${nextEval.required} exigences validées`:'Rang maximal atteint'}</small></article>
      <article><span>Prochaine exigence</span><strong>${nextIncomplete[0]?esc(nextIncomplete[0].label):'Aucune'}</strong><small>${nextIncomplete[0]?(nextIncomplete[0].detail?esc(nextIncomplete[0].detail):'À valider'):'Toutes les exigences sont remplies'}</small></article>
    </section>
    <section class="p146-section"><div class="p146-section-head"><div><div class="kicker">Roadmap</div><h2>Échelle des rangs</h2></div></div>${v10147RankRoadmap()}</section>
    <section class="card rank-detail rank-${selected.id} p147-rank-detail"><div class="rank-detail-head"><div class="rank-emblem rank-emblem-large">${selectedIndex===6?'★':selectedIndex+1}</div><div class="grow"><div class="kicker">Barèmes de performance</div><div class="rank-name">${esc(selected.name)}</div><h2>${esc(selected.title)}</h2><p>${esc(selected.description)}</p></div><span class="rank-status-pill">${selectedStatus}</span></div><div class="section-head rank-missions-head"><div><div class="kicker">Exigences du rang</div><h2>${selected.id==='bronze'?'Point de départ':`${ev.completed} sur ${ev.required} validées`}</h2></div>${selected.id!=='bronze'?`<span class="pill">${ev.completed}/${ev.required}</span>`:''}</div>${(ev.gates||[]).length?v10148RankGateRows(ev.gates):'<div class="p148-rank-entry"><strong>Bronze est le rang d’entrée.</strong><span>Il permet de commencer à enregistrer tes références. La promotion vers Argent dépend ensuite de standards mesurables.</span></div>'}${selectedIndex===rs.index&&next?`<p class="rank-rule-note">Progression actuelle : ${pct}% vers ${esc(next.name)}. Cette valeur estime la proximité avec les exigences restantes ; elle ne remplace jamais les barèmes réels.</p>`:'<p class="rank-rule-note">Une promotion est obtenue uniquement lorsque toutes les exigences du rang sont validées.</p>'}</section>`;
}
function v10146BodySnapshot(){
  const weight=v10146BodySummary('weight'),waist=v10146BodySummary('waist');
  return `<button class="p146-body-snapshot" data-progress-tab="body"><div><span>Corps</span><strong>${weight.last!=null?`${v10146Number(weight.last,1)} kg`:'Poids —'}${waist.last!=null?` · ${v10146Number(waist.last,1)} cm taille`:''}</strong><small>${weight.delta!=null&&weight.points.length>1?`Poids ${v10146Signed(weight.delta,'kg',1)}`:'Mesures corporelles'}${waist.delta!=null&&waist.points.length>1?` · taille ${v10146Signed(waist.delta,'cm',1)}`:''}</small></div><b>Voir →</b></button>`;
}

renderProgressTabs=function(){
  const tabs=[['overview','Vue d’ensemble','Résumé'],['performance','Performances','Records & courbe'],['skills','Skills','Compétences'],['body','Corps','Mesures'],['history','Historique','Journal'],['rank','Rang','Barèmes']];
  return `<nav class="progress-hub-tabs p146-tabs p147-tabs" aria-label="Sections Progression">${tabs.map(([id,label,small])=>`<button class="progress-hub-tab ${state.progressTab===id?'active':''}" data-progress-tab="${id}"><strong>${label}</strong><small>${small}</small></button>`).join('')}</nav>`;
};

renderProgressOverview=function(){
  const bounds=v10146PeriodBounds();
  const pull=v10146PerformanceSummary('Tractions strictes',bounds),dips=v10146PerformanceSummary('Dips',bounds),hang=v10146PerformanceSummary('Dead hang',bounds),weight=v10146BodySummary('weight',bounds),waist=v10146BodySummary('waist',bounds),trends=v10146TrendRows();
  return `<section class="p146-overview-head"><div><div class="kicker">Vue d’ensemble · ${esc(bounds.label)}</div><h1>Est-ce que tu progresses ?</h1><p>Les changements utiles, sans mélanger planning et historique d’entraînement.</p></div></section>
  <section class="p146-kpis">
    ${v10146MetricDeltaCard('Tractions',pull)}
    ${v10146MetricDeltaCard('Dips',dips)}
    ${v10146MetricDeltaCard('Dead hang',hang)}
    ${v10146MetricDeltaCard('Poids',weight,{body:true})}
    ${v10146MetricDeltaCard('Tour de taille',waist,{body:true})}
  </section>

  <section class="p146-section p146-trends-section"><div class="p146-section-head"><div><div class="kicker">Tendances</div><h2>Ce qui progresse · ce qui stagne</h2></div><span>${trends.length||'—'}</span></div>
    ${trends.length?`<div class="p146-trend-list">${trends.map(x=>`<div class="${x.tone}"><span>${x.icon}</span><div><strong>${esc(x.title)}</strong><small>${esc(x.detail)} · ${esc(x.note)}</small></div></div>`).join('')}</div>`:`<div class="p146-empty"><strong>Encore trop tôt pour dégager une tendance.</strong><span>Deux à trois références comparables suffisent pour commencer.</span></div>`}
  </section>

  <section class="p146-two-col">
    <article class="p146-section"><div class="p146-section-head"><div><div class="kicker">Records personnels</div><h2>Tes meilleures références</h2></div><button data-progress-tab="performance">Tout voir →</button></div>${v10146CompactRecords(5)}</article>
    <article class="p146-section"><div class="p146-section-head"><div><div class="kicker">Skills</div><h2>Parcours techniques</h2></div><button data-progress-tab="skills">Détails →</button></div><div class="p146-skill-cards">${v10146SkillCards(3)}</div></article>
  </section>

  <section class="p146-overview-bottom">${v10146BodySnapshot()}${v10146RankCompact()}</section>`;
};

function v10146PerformanceMetricSelector(names,selected){
  return `<div class="p146-metric-switch">${names.slice(0,8).map(name=>`<button class="${name===selected?'active':''}" data-progress-metric="${encodeURIComponent(name)}">${esc(name)}</button>`).join('')}</div>`;
}
function v10146VolumeData(bounds=v10146PeriodBounds()){
  const by=new Map();let reps=0,holdSeconds=0,sets=0;
  const add=e=>{const r=repValueForEntry(e),h=holdSecondsForEntry(e);if(!(r>0||h>0))return;const name=e.exercise||'Exercice',row=by.get(name)||{name,reps:0,holdSeconds:0,sets:0};row.reps+=r;row.holdSeconds+=h;row.sets++;by.set(name,row);reps+=r;holdSeconds+=h;sets++;};
  getHistory().forEach(session=>{if(v10146InPeriod(session.date,bounds))(session.entries||[]).forEach(add);});
  getQuickLogs().forEach(log=>{if(v10146InPeriod(log.date,bounds))add(log);});
  const rows=[...by.values()].sort((a,b)=>(b.reps-a.reps)||(b.holdSeconds-a.holdSeconds));
  return {rows,reps,holdSeconds,sets,exerciseCount:rows.length};
}
function v10146CompactVolume(){
  const d=v10146VolumeData();
  return `<details class="p146-secondary"><summary><div><strong>Volume d’entraînement</strong><span>${d.reps.toLocaleString('fr-FR')} répétitions · ${d.sets} séries · ${d.exerciseCount} exercices</span></div><b>↓</b></summary><div class="p146-secondary-body"><div class="p146-volume-mini">${d.rows.slice(0,8).map(r=>`<div><span>${esc(r.name)}</span><strong>${r.reps?r.reps.toLocaleString('fr-FR')+' reps':Math.round(r.holdSeconds/60)+' min'}</strong></div>`).join('')||'<span class="p146-empty">Aucun volume sur cette période.</span>'}</div></div></details>`;
}
renderProgressPerformance=function(){
  const bounds=v10146PeriodBounds(),names=v10146MetricNames();
  let selected=state.progressMetric&&names.includes(state.progressMetric)?state.progressMetric:null;
  if(!selected)selected=v10146PrimaryMetrics()[0]||names[0]||'Tractions strictes';state.progressMetric=selected;
  const s=v10146PerformanceSummary(selected,bounds),digits=0;
  return `<section class="p146-performance-head"><div><div class="kicker">Performances · ${esc(bounds.label)}</div><h1>${esc(selected)}</h1><p>Une seule métrique à la fois pour lire clairement la progression.</p></div></section>
    ${v10146PerformanceMetricSelector(names,selected)}
    <section class="p146-main-chart">
      <div class="p146-chart-kpis"><div><span>Meilleur</span><strong>${s.best!=null?`${v10146Number(s.best,digits)} ${s.unit}`:'—'}</strong></div><div><span>Référence de départ</span><strong>${s.first!=null?`${v10146Number(s.first,digits)} ${s.unit}`:'—'}</strong></div><div><span>Progression</span><strong>${s.delta!=null&&s.points.length>1?v10146Signed(s.delta,s.unit,digits):'—'}</strong><small>${s.pct!=null&&s.points.length>1?v10146Signed(s.pct,'%',0):'Pas assez de données'}</small></div><div><span>Dernier record</span><strong>${s.lastPr?formatShortDate(s.lastPr):'—'}</strong></div></div>
      ${s.points.length>=2?v10146SparkSvg(s.points,{unit:s.unit,digits}):`<div class="p146-chart-empty"><strong>${s.points.length?'Première référence enregistrée':'Aucune performance enregistrée'}</strong><span>${s.points.length?'Une seconde référence comparable fera apparaître la courbe.':'Utilise une séance ou Quick Log pour commencer.'}</span></div>`}
    </section>
    <section class="p146-section"><div class="p146-section-head"><div><div class="kicker">Records personnels</div><h2>Meilleures performances</h2></div><span>${currentRecords().length}</span></div>${v10146CompactRecords(10)}</section>
    ${v10146CompactVolume()}
    <details class="p146-secondary"><summary><div><strong>Évaluations standardisées</strong><span>${testDueSummary().label} · pour confirmer les repères importants</span></div><b>↓</b></summary><div class="p146-secondary-body"><p class="p146-evidence-note">Une performance enregistrée reste une référence utile ; seule une validation guidée KINETIK confirme un protocole standardisé.</p><button class="btn btn-outline compact" data-view="assessment">Ouvrir le Centre d’évaluation →</button></div></details>
    ${state.exerciseDetailName?renderExerciseProgressDetail(state.exerciseDetailName):''}`;
};

renderProgressSkills=function(){
  const focus=primarySkillTree(),rank=getRankState(),caps=capabilityScores(),ordered=[focus,...SKILL_TREES.filter(t=>t.id!==focus.id)];
  return `<section class="p146-skills-head"><div><div class="kicker">Skills</div><h1>Compétences techniques</h1><p>Les performances sont des mesures. Les skills sont des parcours à maîtriser.</p></div><button class="btn btn-outline compact" data-view="skills">Voir toutes les capacités →</button></section>
    <section class="p146-skill-focus"><div><div class="kicker">Objectif technique principal</div><h2>${esc(focus.name)}</h2><p>${esc(focus.description)}</p></div>${(()=>{const p=skillTreeProgress(focus);return `<div class="p146-focus-score"><strong>${p.pct}%</strong><span>${p.next?`Prochaine étape · ${esc(p.next.name)}`:'Parcours validé'}</span></div>`})()}</section>
    <section class="p146-section"><div class="p146-section-head"><div><div class="kicker">Parcours</div><h2>Où tu en es</h2></div></div><div class="p146-skills-grid">${ordered.map(tree=>{const p=skillTreeProgress(tree);return `<article class="${tree.id===focus.id?'focus':''}"><div><strong>${esc(tree.name)}</strong><span>${p.next?`Prochaine étape · ${esc(p.next.name)}`:'Validé'}</span></div><b>${p.pct}%</b><i><u style="width:${p.pct}%"></u></i></article>`;}).join('')}</div></section>
    <section class="p146-section"><div class="p146-section-head"><div><div class="kicker">Capacités fondamentales</div><h2>Le socle derrière les skills</h2></div><button data-view="skills">Analyse complète →</button></div><div class="p146-cap-grid">${caps.map(c=>`<div class="${c.assessed?'':'empty'}"><span>${esc(c.label)}</span><strong>${c.assessed?c.score:'—'}</strong><small>${esc(c.level||'À évaluer')}</small><i><u style="width:${c.assessed?c.score:0}%"></u></i></div>`).join('')}</div></section>
    ${v10146RankCompact()}`;
};

function v10148BodyMapPanel(){
  const mode=state.progressBodyMode||'overall';
  const view=state.progressBodyView||'front';
  const display=typeof v10107DisplayMode==='function'?v10107DisplayMode():(state.progressBodyDisplay||'3d');
  const selected=typeof v1095SelectedBodyZone==='function'?v1095SelectedBodyZone(mode,view):null;
  if(selected)state.progressBodyZone=selected.id||state.progressBodyZone;
  const visual=typeof v10107RenderBodyVisual==='function'?v10107RenderBodyVisual(view,mode,selected?.id||''):'<div class="p146-empty">Carte corporelle indisponible.</div>';
  const detail=typeof v1095ZoneDetailCard==='function'?v1095ZoneDetailCard(mode,view):'';
  return `<section class="p148-body-map-section">
    <div class="p148-body-map-head"><div><div class="kicker">Carte corporelle</div><h1>Ton corps en 3D</h1><p>Explore tes zones de force et de mobilité, puis fais tourner le modèle à 360°.</p></div><span class="p148-body-map-badge">${display==='3d'?'3D interactive':'Vue 2D'}</span></div>
    <div class="body-overview-toolbar p148-body-toolbar">
      <div class="body-overview-toggle" role="tablist" aria-label="Mode de lecture corporelle">
        <button class="${mode==='overall'?'active':''}" data-body-mode="overall">Vue d’ensemble</button>
        <button class="${mode==='strength'?'active':''}" data-body-mode="strength">Force</button>
        <button class="${mode==='mobility'?'active':''}" data-body-mode="mobility">Mobilité</button>
      </div>
      <div class="body-toolbar-right">
        <div class="body-overview-toggle body-display-toggle" role="tablist" aria-label="Affichage du corps">
          <button class="${display==='2d'?'active':''}" data-body-display="2d">2D</button>
          <button class="${display==='3d'?'active':''}" data-body-display="3d">3D</button>
        </div>
        <div class="body-overview-toggle" role="tablist" aria-label="Orientation du corps">
          <button class="${view==='front'?'active':''}" data-body-view="front">Face</button>
          <button class="${view==='back'?'active':''}" data-body-view="back">Dos</button>
        </div>
      </div>
    </div>
    <div class="body-overview-model-wrap p148-body-map-wrap">
      <div class="body-overview-model body-overview-model-3d p148-body-model">${visual}</div>
      <aside class="body-overview-side p148-body-side">
        ${detail}
        <div class="body-overview-legend p148-body-legend">
          <span><i class="tone-none"></i>À évaluer</span>
          <span><i class="tone-partial"></i>Données limitées</span>
          <span><i class="tone-low"></i>Fragile</span>
          <span><i class="tone-watch"></i>À travailler</span>
          <span><i class="tone-ok"></i>Correct</span>
          <span><i class="tone-good"></i>Solide</span>
          <span><i class="tone-great"></i>Avancé</span>
        </div>
        <p class="p148-body-note">${display==='3d'?'Glisse pour tourner · clique une zone pour afficher son détail.':'Clique une zone pour afficher son détail.'}</p>
      </aside>
    </div>
  </section>`;
}

function v10146BodyMetricSelector(){
  const defs=[['weight','Poids'],['waist','Tour de taille'],['bodyFat','Masse grasse']];
  return `<div class="p146-metric-switch p146-body-switch">${defs.map(([id,label])=>`<button class="${state.progressBodyMetric===id?'active':''}" data-progress-body-metric="${id}">${label}</button>`).join('')}</div>`;
}
renderProgressBody=function(){
  const bounds=v10146PeriodBounds(),metric=state.progressBodyMetric||'weight',s=v10146BodySummary(metric,bounds),latest=getBodyLogs().slice().sort((a,b)=>new Date(b.date)-new Date(a.date))[0]||null;
  const derived=latest?bodyDerived(latest):{};
  return `${v10148BodyMapPanel()}<section class="p146-body-head p148-body-measures-head"><div><div class="kicker">Mesures · ${esc(bounds.label)}</div><h1>Évolution corporelle</h1><p>Poids, tour de taille et composition corporelle restent suivis séparément de la carte 3D.</p></div><button class="btn btn-outline compact" data-view="measurements">Toutes les mesures →</button></section>
    ${v10146BodyMetricSelector()}
    <section class="p146-main-chart p146-body-chart">
      <div class="p146-chart-kpis"><div><span>Actuel</span><strong>${s.last!=null?`${v10146Number(s.last,s.digits)} ${s.unit}`:'—'}</strong></div><div><span>Début période</span><strong>${s.first!=null?`${v10146Number(s.first,s.digits)} ${s.unit}`:'—'}</strong></div><div><span>Variation</span><strong>${s.delta!=null&&s.points.length>1?v10146Signed(s.delta,s.unit,s.digits):'—'}</strong></div><div><span>Mesures</span><strong>${s.points.length}</strong></div></div>
      ${s.points.length>=2?v10146SparkSvg(s.points,{unit:s.unit,digits:s.digits}):`<div class="p146-chart-empty"><strong>${s.points.length?'Première référence enregistrée':'Aucune mesure sur cette période'}</strong><span>${s.points.length?'Une seconde mesure fera apparaître la courbe.':'Ajoute une mesure depuis + Ajouter ou Mesures corporelles.'}</span></div>`}
    </section>
    <section class="p146-section"><div class="p146-section-head"><div><div class="kicker">Dernier relevé</div><h2>Composition & repères</h2></div><button data-view="measurements">Détails →</button></div><div class="p146-body-kpis"><div><span>Poids</span><strong>${latest&&bodyValue(latest,'weight')?`${v10146Number(bodyValue(latest,'weight'),1)} kg`:'—'}</strong></div><div><span>Tour de taille</span><strong>${latest&&bodyValue(latest,'waist')?`${v10146Number(bodyValue(latest,'waist'),1)} cm`:'—'}</strong></div><div><span>Masse grasse estimée</span><strong>${derived.bf!=null?`${v10146Number(derived.bf,1)} %`:'—'}</strong></div><div><span>Masse maigre estimée</span><strong>${derived.lean!=null?`${v10146Number(derived.lean,1)} kg`:'—'}</strong></div></div></section>`;
};

function v10146SkillExerciseSet(){
  const set=new Set();SKILL_TREES.forEach(t=>t.levels.forEach(l=>{if(l.auto?.exercise)set.add(l.auto.exercise);}));return set;
}
function v10146UnifiedHistory(){
  const skillSet=v10146SkillExerciseSet(),rows=[];
  getHistory().forEach(s=>{
    const entries=(s.entries||[]).filter(e=>e.type!=='timer'),skillCount=entries.filter(e=>skillSet.has(e.exercise)||/handstand|muscle.?up|front lever|human flag|l-sit|hspu/i.test(e.exercise||'')).length;
    rows.push({id:`session:${s.id}`,rawId:s.id,date:s.date,category:entries.length&&skillCount>=Math.max(1,entries.length/2)?'skills':'force',kind:'session',title:s.name||'Séance KINETIK',detail:`${s.durationMinutes||0} min · effort ${s.rpe||'—'}/10`,action:true});
  });
  getQuickLogs().forEach(q=>{const skill=skillSet.has(q.exercise)||/handstand|muscle.?up|front lever|human flag|l-sit|hspu/i.test(q.exercise||'');rows.push({id:`quick:${q.id}`,date:q.date,category:skill?'skills':'force',kind:'quick',title:q.exercise||'Performance rapide',detail:`${quickLogJournalValue(q)} · Quick Log`});});
  getActivities().forEach(a=>{const t=activityType(a.type);rows.push({id:`activity:${a.id}`,date:a.date,category:a.type==='mobility'?'body':'cardio',kind:'activity',title:t.label,detail:`${a.duration||0} min${a.distance?` · ${a.distance} ${t.metric||'km'}`:''} · effort ${a.rpe||'—'}/10`});});
  getFlexLogs().forEach(f=>rows.push({id:`flex:${f.id}`,date:f.date,category:'body',kind:'mobility',title:f.name||'Mobilité',detail:`${f.durationMinutes||0} min · confort ${f.comfort||'—'}/5`}));
  getBodyLogs().forEach(b=>{const w=bodyValue(b,'weight'),wa=bodyValue(b,'waist');if(w==null&&wa==null)return;rows.push({id:`body:${b.id||b.date}`,date:b.date,category:'body',kind:'body',title:'Mesures corporelles',detail:`${w!=null?`${v10146Number(w,1)} kg`:''}${w!=null&&wa!=null?' · ':''}${wa!=null?`taille ${v10146Number(wa,1)} cm`:''}`});});
  return rows.sort((a,b)=>new Date(b.date)-new Date(a.date));
}
function v10146HistoryRowHtml(r){
  const label=({force:'Force',skills:'Skill',body:'Corps',cardio:'Cardio'}[r.category]||'');
  const inner=`<span class="p146-history-dot ${r.category}"></span><div><strong>${esc(r.title)}</strong><small>${formatDate(r.date)} · ${esc(r.detail)}</small></div><b>${r.action?'Voir →':label}</b>`;
  return r.action?`<button class="p146-history-row" data-history="${esc(String(r.rawId))}">${inner}</button>`:`<div class="p146-history-row">${inner}</div>`;
}
renderProgressHistory=function(){
  const bounds=v10146PeriodBounds(),filter=state.progressHistoryFilter||'all',all=v10146UnifiedHistory().filter(x=>v10146InPeriod(x.date,bounds)),rows=all.filter(x=>filter==='all'||x.category===filter);
  const filters=[['all','Tout'],['force','Force'],['skills','Skills'],['body','Corps'],['cardio','Cardio']];
  return `<section class="p146-history-head"><div><div class="kicker">Historique · ${esc(bounds.label)}</div><h1>Journal de progression</h1><p>Séances, performances rapides, corps et cardio réunis chronologiquement.</p></div><strong>${rows.length}</strong></section>
    <div class="p146-history-filters">${filters.map(([id,label])=>`<button class="${filter===id?'active':''}" data-progress-history-filter="${id}">${label}</button>`).join('')}</div>
    <section class="p146-history-list">${rows.length?rows.slice(0,60).map(v10146HistoryRowHtml).join(''):'<div class="p146-empty"><strong>Aucune donnée dans ce filtre.</strong><span>Change de période ou de catégorie.</span></div>'}</section>
    ${state.selectedHistoryId?v1080HistoryDetail(state.selectedHistoryId):''}`;
};

renderProgress=function(){
  if(!['overview','performance','skills','body','history','rank'].includes(state.progressTab))state.progressTab='overview';
  const content=state.progressTab==='performance'?renderProgressPerformance():state.progressTab==='skills'?renderProgressSkills():state.progressTab==='body'?renderProgressBody():state.progressTab==='history'?renderProgressHistory():state.progressTab==='rank'?renderProgressRank():renderProgressOverview();
  const showPeriod=!['skills','rank'].includes(state.progressTab);
  return shell(`<header class="topbar p146-topbar"><div><div class="brand">Progression</div><div class="daylabel">Est-ce que je progresse · sur quoi · depuis quand</div></div></header>
    ${renderProgressTabs()}
    ${showPeriod?v10146PeriodControl():''}
    <div class="p146-content">${content}</div>`, 'progress');
};

const _bindEventsV10146=bindEvents;
bindEvents=function(){
  _bindEventsV10146();
  document.querySelectorAll('[data-progress-period]').forEach(b=>b.onclick=()=>{state.progressPeriod=b.dataset.progressPeriod||'30d';state.selectedHistoryId=null;render();});
  document.querySelectorAll('[data-progress-metric]').forEach(b=>b.onclick=()=>{try{state.progressMetric=decodeURIComponent(b.dataset.progressMetric||'');}catch(e){state.progressMetric=b.dataset.progressMetric||null;}render();});
  document.querySelectorAll('[data-progress-body-metric]').forEach(b=>b.onclick=()=>{state.progressBodyMetric=b.dataset.progressBodyMetric||'weight';render();});
  document.querySelectorAll('[data-progress-history-filter]').forEach(b=>b.onclick=()=>{state.progressHistoryFilter=b.dataset.progressHistoryFilter||'all';state.selectedHistoryId=null;render();});
};
