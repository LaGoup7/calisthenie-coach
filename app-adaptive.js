/* KINETIK v10.132 · Adaptive coaching, assessment and progression intelligence. */
/* V10.0 · Adaptive Local Coach                                                */
/* Cloud/onboarding intentionally excluded.                                    */
/* ========================================================================== */
STORAGE.equipmentSetup = "cc_equipment_setup_v2";
STORAGE.restrictions = "cc_training_restrictions_v1";
STORAGE.skillPriorities = "cc_skill_priorities_v1";
STORAGE.reminders = "cc_smart_reminders_v1";
Object.assign(state,{reportPeriod:"30d",exerciseDetailName:null,setupMessage:null});

const EQUIPMENT_CATALOG = [
  {id:"powerTower",label:"Power Tower / barre haute",icon:"↟",default:true,note:"Tractions, hangs et exercices suspendus."},
  {id:"parallelBars",label:"Barres parallèles",icon:"Ⅱ",default:true,note:"Dips, L-sit et supports."},
  {id:"pushupHandles",label:"Poignées de pompes",icon:"⌑",default:true,note:"Pompes et appuis poignets neutres."},
  {id:"bands",label:"Bandes élastiques",icon:"≈",default:true,note:"Assistance et résistance."},
  {id:"anchor",label:"Point d’ancrage bandes",icon:"⌁",default:true,note:"Face pulls, Pallof, curls et tirages."},
  {id:"mat",label:"Tapis",icon:"▭",default:true,note:"Core, mobilité et confort au sol."},
  {id:"support",label:"Banc / support stable",icon:"▰",default:false,note:"Pompes/pike surélevées et certaines régressions."},
  {id:"lowBarRings",label:"Anneaux / barre basse",icon:"◎",default:false,note:"Australian rows et variantes de tirage horizontal."},
  {id:"verticalPole",label:"Barre verticale sûre",icon:"│",default:false,note:"Progressions Human Flag."},
  {id:"externalLoad",label:"Charge additionnelle",icon:"＋",default:false,note:"Lest externe. Désactivé dans le cycle de base."}
];
const EQUIPMENT_BY_ID = Object.fromEntries(EQUIPMENT_CATALOG.map(x=>[x.id,x]));
function getEquipmentSetup(){
  const saved=parse(STORAGE.equipmentSetup,{}),out={};
  EQUIPMENT_CATALOG.forEach(x=>out[x.id]=saved[x.id]===undefined?x.default:!!saved[x.id]);
  return out;
}
function setEquipmentSetup(v){save(STORAGE.equipmentSetup,v);}
function equipmentLabel(id){return EQUIPMENT_BY_ID[id]?.label||id;}
function equipmentRequirements(name){
  const raw=(exerciseInfo(name)?.equipment||'').toLowerCase();
  const req={all:[],any:[],preferred:[]};
  const add=x=>{if(x&&!req.all.includes(x))req.all.push(x)};
  const pref=x=>{if(x&&!req.preferred.includes(x))req.preferred.push(x)};
  if(/barres parallèles \/ poignées/.test(raw))req.any.push(['parallelBars','pushupHandles']);
  else if(/barres parallèles \/ sol/.test(raw))pref('parallelBars');
  else if(/barres parallèles/.test(raw))add('parallelBars');
  else if(/^barres( \+|$)/.test(raw))add('parallelBars');
  if(/barre basse \/ anneaux/.test(raw))add('lowBarRings');
  else if(/barre verticale/.test(raw))add('verticalPole');
  else if(/\bbarre\b/.test(raw)&&!/barres/.test(raw)&&!/barre basse/.test(raw)&&!/barre verticale/.test(raw))add('powerTower');
  if(/power tower/.test(raw))add('powerTower');
  if(/bande/.test(raw))add('bands');
  if(/ancrage/.test(raw)){add('bands');add('anchor');}
  if(/poignées \+ support/.test(raw)){pref('pushupHandles');add('support');}
  else if(/poignées \/ sol/.test(raw))pref('pushupHandles');
  if(/support surélevé/.test(raw)||raw==='support')add('support');
  else if(/mur \/ support/.test(raw))pref('support');
  if(/tapis/.test(raw))pref('mat');
  if(/sac à dos|charge/.test(raw))add('externalLoad');
  // Name-level fallbacks for entries with generic equipment strings.
  if(/^(Tractions|Chin-ups|Chest-to-bar|Dead hang|Towel hang|Hanging|Scapular pull-ups|Muscle-up)/i.test(name))add('powerTower');
  if(/^Dips/i.test(name))add('parallelBars');
  if(/assisté/i.test(name)&&/(Tractions|Chin-ups|Muscle-up|Dips)/i.test(name))add('bands');
  if(/avec bande|face pulls|pallof|rotation externe|band chest|curl biceps|hamstring curl/i.test(name))add('bands');
  if(/human flag/i.test(name))add('verticalPole');
  return req;
}
function equipmentAvailability(name){
  const setup=getEquipmentSetup(),r=equipmentRequirements(name),missing=[];
  r.all.forEach(id=>{if(!setup[id])missing.push(id)});
  r.any.forEach(group=>{if(!group.some(id=>setup[id]))missing.push(group.join('|'));});
  const preferredMissing=r.preferred.filter(id=>!setup[id]);
  return {available:missing.length===0,missing,preferredMissing,requirements:r};
}
function missingEquipmentLabels(status){
  return (status?.missing||[]).map(id=>id.includes('|')?id.split('|').map(equipmentLabel).join(' ou '):equipmentLabel(id));
}

const RESTRICTION_AREAS = [
  ['wrists','Poignets'],['elbows','Coudes'],['shoulders','Épaules'],['back','Dos / lombaires'],['knees','Genoux'],['ankles','Chevilles']
];
function getRestrictions(){const raw=parse(STORAGE.restrictions,{});return Object.fromEntries(RESTRICTION_AREAS.map(([id])=>[id,!!raw[id]]));}
function setRestrictions(v){save(STORAGE.restrictions,v);}
function restrictionLabel(id){return RESTRICTION_AREAS.find(x=>x[0]===id)?.[1]||id;}
function exerciseStressAreas(name){
  const n=String(name).toLowerCase(),out=[];
  const add=x=>{if(!out.includes(x))out.push(x)};
  if(/pompe|handstand|hspu|pike|planche|l-sit|v-sit/.test(n))add('wrists');
  if(/traction|chin|dips|curl|triceps|muscle-up|row|front lever|human flag/.test(n))add('elbows');
  if(/dips|pompe|handstand|hspu|pike|traction|chin|muscle-up|front lever|human flag|face pull/.test(n))add('shoulders');
  if(/deadlift|good morning|dragon flag|front lever/.test(n))add('back');
  if(/squat|fente|lunge|bulgarian|pistol|shrimp|jump|nordic/.test(n))add('knees');
  if(/squat|fente|lunge|pistol|shrimp|mollet|calf|jump|knee-to-wall|deep squat/.test(n))add('ankles');
  return out;
}
function activeRestrictionIds(readiness=null){
  const p=getRestrictions(),ids=Object.keys(p).filter(k=>p[k]);
  for(const z of (readiness?.painZones||[]))if(!ids.includes(z))ids.push(z);
  return ids;
}
function exerciseRestrictionStatus(name,readiness=null){
  const active=activeRestrictionIds(readiness),hits=exerciseStressAreas(name).filter(x=>active.includes(x));
  return {restricted:hits.length>0,zones:hits};
}
const EQUIPMENT_FALLBACKS = {
  'Tractions strictes':['Tractions assistées','Row avec bande'], 'Tractions assistées':['Row avec bande'],
  'Chin-ups':['Chin-ups assistés','Row avec bande'], 'Chin-ups assistés':['Row avec bande'],
  'Chest-to-bar':['Tractions strictes','Row avec bande'], 'Tractions explosives':['Chest-to-bar','Tractions strictes','Row avec bande'],
  'Australian rows':['Row avec bande'], 'Dead hang':['Row avec bande'], 'Towel hang':['Dead hang','Row avec bande'],
  'Dips':['Pompes serrées','Band chest press'], 'Dips assistés':['Pompes serrées','Band chest press'], 'Dips tempo':['Dips','Pompes serrées'],
  'Hanging knee raises':['Reverse crunch','Dead bug'], 'Hanging leg raises':['Reverse crunch','Dead bug'], 'Toes-to-bar':['Hanging knee raises','Reverse crunch'],
  'Tuck L-sit':['V-sit compression','Hollow hold'], 'One-leg L-sit':['Tuck L-sit','V-sit compression'], 'L-sit':['Tuck L-sit','V-sit compression'],
  'Pike push-ups pieds surélevés':['Pike push-ups'], 'Pompes pieds surélevés':['Pompes'], 'Pompes inclinées':['Pompes'],
  'Human flag support vertical':['Side plank','Pallof press avec bande'], 'Tuck human flag':['Side plank','Pallof press avec bande'],
  'One-leg human flag':['Side plank','Pallof press avec bande'], 'Straddle human flag':['Side plank','Pallof press avec bande'], 'Human flag':['Side plank','Pallof press avec bande']
};
function candidateSubstitutionNames(name){
  const item=exerciseInfo(name),raw=[item?.regression,...(item?.substitutes||[]),...(EQUIPMENT_FALLBACKS[name]||[]),item?.progression].filter(Boolean);
  return [...new Set(raw)].filter(x=>x!==name&&exerciseInfo(x));
}
function bestAvailableSubstitution(name,readiness=null){
  const candidates=candidateSubstitutionNames(name);
  const safe=candidates.find(n=>equipmentAvailability(n).available&&!exerciseRestrictionStatus(n,readiness).restricted);
  if(safe)return safe;
  // If a restriction is active, do not pretend that another movement stressing the same zone is a safe alternative.
  // It is better to show “aucune variante proche” than to make a medical-style recommendation.
  if(activeRestrictionIds(readiness).length)return null;
  return candidates.find(n=>equipmentAvailability(n).available)||candidates[0]||null;
}
function exerciseAdaptation(name,readiness=null){
  const eq=equipmentAvailability(name),rest=exerciseRestrictionStatus(name,readiness),suggestion=(!eq.available||rest.restricted)?bestAvailableSubstitution(name,readiness):null;
  return {equipment:eq,restriction:rest,suggestion};
}
function renderExerciseAvailabilityNotice(e,readiness=null){
  const a=exerciseAdaptation(e.name,readiness);if(a.equipment.available&&!a.restriction.restricted)return '';
  const issues=[];if(!a.equipment.available)issues.push(`Matériel manquant : ${missingEquipmentLabels(a.equipment).join(', ')}`);if(a.restriction.restricted)issues.push(`Zone à ménager : ${a.restriction.zones.map(restrictionLabel).join(', ')}`);
  return `<div class="exercise-availability-warning"><strong>⚠ Adaptation conseillée</strong><span>${esc(issues.join(' · '))}</span>${a.suggestion?`<button type="button" class="btn btn-secondary compact direct-substitution" data-direct-sub="${encodeURIComponent(a.suggestion)}">Utiliser ${esc(a.suggestion)}</button>`:'<small>Aucune variante proche n’est disponible avec le setup actuel.</small>'}</div>`;
}
function renderExerciseAvailabilityBadge(name){
  const a=exerciseAdaptation(name);if(a.equipment.available&&!a.restriction.restricted)return '<span class="microbadge equipment-ok">setup ✓</span>';
  const label=!a.equipment.available?'matériel manquant':'restriction';return `<span class="microbadge equipment-missing">${label}</span>`;
}

function techniqueGuide(name){
  const n=String(name).toLowerCase();
  if(/traction|chin-up|chest-to-bar/.test(n))return {cues:['Départ bras tendus et omoplates actives','Poitrine vers la barre sans casser la ligne','Descente contrôlée jusqu’à l’extension'],errors:['Élan des jambes','Demi-amplitude ou épaules relâchées']};
  if(/dips/.test(n))return {cues:['Barres stables, épaules basses','Descente contrôlée dans une amplitude confortable','Pousse sans perdre le gainage'],errors:['Épaules qui montent vers les oreilles','Descendre plus bas que ton contrôle articulaire']};
  if(/pompe|pike|hspu/.test(n))return {cues:['Corps gainé','Mains stables et coudes contrôlés','Amplitude identique à chaque rep'],errors:['Bassin qui s’effondre','Répétitions accélérées en fin de série']};
  if(/handstand/.test(n))return {cues:['Pousse le sol en permanence','Côtes rentrées et fessiers actifs','Regard stable entre les mains'],errors:['Cambrure excessive','Tenir après perte complète de la ligne']};
  if(/squat|fente|bulgarian|pistol|shrimp/.test(n))return {cues:['Pied entier en contact','Genou suit la direction des orteils','Amplitude que tu contrôles sans douleur'],errors:['Genou qui s’effondre vers l’intérieur','Rebonder au point bas']};
  if(/deadlift|rdl/.test(n))return {cues:['Hanches vers l’arrière','Dos neutre','Tension ischios avant de remonter'],errors:['Transformer le mouvement en squat','Arrondir le bas du dos']};
  if(/l-sit|v-sit/.test(n))return {cues:['Pousse fort les supports','Épaules basses','Compression active des jambes'],errors:['S’affaisser entre les épaules','Retenir la respiration']};
  if(/row|face pull/.test(n))return {cues:['Initie avec les omoplates','Coudes suivent une trajectoire stable','Retour lent et complet'],errors:['Tirer uniquement avec les bras','Épaules qui remontent']};
  if(/hold|plank|hollow|dead bug|pallof/.test(n))return {cues:['Respiration contrôlée','Position stable avant durée','Arrête avant perte de forme'],errors:['Chercher le chrono au détriment de la posture','Bloquer complètement la respiration']};
  return {cues:['Répétitions contrôlées','Amplitude confortable et reproductible','Arrête la série avant la dégradation technique'],errors:['Douleur articulaire vive','Accélérer pour terminer la série']};
}
function renderTechniqueCoach(name){const g=techniqueGuide(name);return `<details class="coach-technique"><summary>Technique · points clés</summary><div><strong>À rechercher</strong>${g.cues.map(x=>`<span>✓ ${esc(x)}</span>`).join('')}<strong>À éviter</strong>${g.errors.map(x=>`<span>× ${esc(x)}</span>`).join('')}</div></details>`;}

function nextHarderBand(label){
  const ids=['green','purple','black','red','yellow','none'],cur=bandByLabel(label).id,i=ids.indexOf(cur);if(i<0||i>=ids.length-1)return BAND_INVENTORY[0].label;return BAND_INVENTORY.find(b=>b.id===ids[i+1])?.label||BAND_INVENTORY[0].label;
}
const _prescriptionForV97=prescriptionFor;
prescriptionFor=function(e,allowProgress=true){
  if(e.type==='timer')return _prescriptionForV97(e,allowProgress);
  const prefs=getPrefs();if(!prefs.smartProgression)return _prescriptionForV97(e,allowProgress);
  const sessions=exerciseSessions(e.name,6);if(!sessions.length)return _prescriptionForV97(e,allowProgress);
  const last=sessions[0],lastRatio=sessionExerciseRatio(last.entries),lastRir=Number(last.session.reviewRir??last.session.rirReported??NaN),lastRpe=Number(last.session.rpe||0),lastTarget=Math.max(e.baseTarget,sessionProgressionTarget(last)||e.baseTarget);
  const joint=!!last.session.jointDiscomfort,hard=joint||lastRpe>=8||(Number.isFinite(lastRir)&&lastRir<=1);
  const usable=sessions.filter(isProgressionSessionUsable),same=usable.filter(s=>Math.abs(sessionProgressionTarget(s)-lastTarget)<.01).slice(0,2);
  const mastered=same.length>=2&&same.every(s=>{const rir=Number(s.session.reviewRir??NaN);return sessionExerciseRatio(s.entries)>=.98&&Number(s.session.rpe||0)<=7&&(!Number.isFinite(rir)||rir>=2)});
  if(hard||lastRatio<.80){
    const target=e.type.startsWith('hold')?Math.max(10,lastTarget-5):Math.max(3,lastTarget-1);
    return {target,status:'recover',note:joint?'Gêne signalée : cible réduite et variante conseillée si nécessaire.':`Dernière séance exigeante${Number.isFinite(lastRir)?` (${lastRir} RIR`:''}${Number.isFinite(lastRir)?')':''} : consolide avant de progresser.`};
  }
  if(!allowProgress)return {target:lastTarget,status:'maintain',note:'Semaine de consolidation/deload : progression volontairement gelée.'};
  if(mastered){
    if(e.type==='reps_band'){
      const lastBand=last.entries.find(x=>x.band)?.band||lastBandForExercise(e.name),harder=nextHarderBand(lastBand);
      return {target:lastTarget,status:'progress',suggestedBand:harder,note:`Deux séances maîtrisées : conserve ${lastTarget} reps et essaie ${bandByLabel(harder).short.toLowerCase()} d’assistance si la technique reste propre.`};
    }
    if(e.type.startsWith('hold'))return {target:lastTarget+5,status:'progress',note:`+5 sec : deux séances propres avec une marge suffisante.`};
    return {target:lastTarget+1,status:'progress',note:`+1 rep : deux séances propres avec au moins ~2 RIR.`};
  }
  if(lastRatio>=1&&Number.isFinite(lastRir)&&lastRir>=3)return {target:lastTarget,status:'maintain',note:`Objectif maîtrisé avec ${lastRir} RIR. Confirme une seconde fois avant d’augmenter.`};
  return {target:lastTarget,status:'maintain',note:'Même objectif : consolide la technique et garde la marge prévue.'};
};
const _progressionReadyV97=progressionReady;
progressionReady=function(baseName,currentName){
  const item=exerciseInfo(currentName);if(!item?.progression||!item.advanceAt)return null;
  const sessions=exerciseSessions(currentName,5).filter(isProgressionSessionUsable);if(sessions.length<2)return null;
  const gate=Number(item.advanceAt),two=sessions.slice(0,2),ready=two.every(s=>{const rir=Number(s.session.reviewRir??NaN);return sessionProgressionTarget(s)>=gate&&sessionExerciseRatio(s.entries)>=.98&&Number(s.session.rpe||0)<=7&&(!Number.isFinite(rir)||rir>=2)});
  return ready?{baseName,current:item,next:exerciseInfo(item.progression),gate}:null;
};

const LEGACY_SKILL_GOAL_LABELS={pull:'Tractions strictes',push:'Dips stricts',handstand:'Handstand libre',core:'L-sit',muscleup:'Muscle-up',lever:'Front lever',flag:'Human flag',legs:'Pistol squat'};
function migrateLegacySkillPriorities(){
  const raw=parse(STORAGE.skillPriorities,null);if(!raw||typeof raw!=='object')return false;
  const ranked=Object.entries(raw).filter(([,v])=>v==='high'||v==='medium').sort((a,b)=>(b[1]==='high')-(a[1]==='high'));
  if(ranked.length){
    const stored=parse(STORAGE.athleteProfile,{}),next={...stored};
    if(!stored.primaryGoal||stored.primaryGoal==='Progression générale')next.primaryGoal=LEGACY_SKILL_GOAL_LABELS[ranked[0][0]]||stored.primaryGoal||'Progression générale';
    if(!stored.secondaryGoal&&ranked[1])next.secondaryGoal=LEGACY_SKILL_GOAL_LABELS[ranked[1][0]]||'';
    if(JSON.stringify(next)!==JSON.stringify(stored))setAthleteProfile(next);
  }
  localStorage.removeItem(STORAGE.skillPriorities);return true;
}
migrateLegacySkillPriorities();
function getSkillPriorities(){return Object.fromEntries(SKILL_TREES.map(t=>[t.id,'off']));}
function setSkillPriorities(){localStorage.removeItem(STORAGE.skillPriorities);}
function nextSkillLevelForTree(treeId){const t=SKILL_TREES.find(x=>x.id===treeId);return t?.levels.find(x=>!skillDone(x))||t?.levels[t.levels.length-1]||null;}
function skillFocusExercise(treeId){
  const t=SKILL_TREES.find(x=>x.id===treeId),level=nextSkillLevelForTree(treeId);if(!t||!level)return null;
  if(level.auto?.exercise)return level.auto.exercise;
  if(level.auto?.test){const names=TEST_GUIDED_EXERCISES[level.auto.test]||[];if(names.length)return names[0];}
  return null;
}
function applySkillPrioritiesToBase(base){return clone(base);}

const _prepareWorkoutObjectV97=prepareWorkoutObject;
prepareWorkoutObject=function(base,readiness=null){
  const prioritized=applySkillPrioritiesToBase(base),w=_prepareWorkoutObjectV97(prioritized,readiness);
  w.exercises=(w.exercises||[]).map(e=>{const a=exerciseAdaptation(e.name,readiness);return {...e,equipmentMissing:a.equipment.missing,restrictionZones:a.restriction.zones,adaptationSuggestion:a.suggestion};});
  return w;
};

function renderSkillPriorityPanel(){return '';}

const _renderSkillsV97=renderSkills;
renderSkills=function(){let html=_renderSkillsV97();const marker='<section class="skills-section-head skill-tree-heading">';if(html.includes(marker))html=html.replace(marker,renderSkillPriorityPanel()+marker);return html;};

function renderEquipmentSetupCard(compact=false){
  const setup=getEquipmentSetup(),active=getActiveTrainingCycle(),used=new Set();Object.values(active.days||{}).forEach(w=>(w.exercises||[]).forEach(e=>equipmentForExercise(e.name).forEach(x=>used.add(x))));
  const missingInCycle=[];Object.values(active.days||{}).forEach(w=>(w.exercises||[]).forEach(e=>{const a=exerciseAdaptation(e.name);if(!a.equipment.available&&exerciseInfo(e.name))missingInCycle.push(e.name);}));
  return `<section class="card setup-card"><div class="section-head"><div><div class="kicker">Ton setup</div><h2>Matériel disponible</h2></div><span class="pill ${missingInCycle.length?'badge-warn':'badge-success'}">${missingInCycle.length?missingInCycle.length+' à adapter':'cycle compatible ✓'}</span></div><p class="muted small">Coche uniquement ce que tu peux utiliser aujourd’hui. Un exercice incompatible sera signalé et l’app proposera une variante disponible.</p><div class="setup-grid">${EQUIPMENT_CATALOG.map(x=>`<label class="setup-option ${setup[x.id]?'available':''}"><input class="equipment-toggle" data-equipment-id="${x.id}" type="checkbox" ${setup[x.id]?'checked':''}><span class="setup-icon">${x.icon}</span><span><strong>${x.label}</strong><small>${x.note}</small></span></label>`).join('')}</div>${!compact&&missingInCycle.length?`<div class="setup-impact"><strong>Exercices du cycle à adapter</strong><span>${[...new Set(missingInCycle)].slice(0,8).map(esc).join(' · ')}${missingInCycle.length>8?'…':''}</span></div>`:''}</section>`;
}
function saveEquipmentSetupFromDom(){const cfg=getEquipmentSetup();document.querySelectorAll('.equipment-toggle').forEach(el=>cfg[el.dataset.equipmentId]=el.checked);setEquipmentSetup(cfg);state.setupMessage='Setup mis à jour';render();}
function renderRestrictionSettings(){const r=getRestrictions();return `<section class="card restriction-card"><div class="section-head"><div><div class="kicker">Adaptations</div><h2>Zones à ménager</h2></div><span class="pill">facultatif</span></div><p class="muted small">Utilise ceci pour adapter l’entraînement, pas pour diagnostiquer une douleur. Une douleur vive ou inhabituelle doit faire arrêter le mouvement concerné.</p><div class="restriction-grid">${RESTRICTION_AREAS.map(([id,l])=>`<label class="restriction-option ${r[id]?'active':''}"><input class="restriction-toggle" data-restriction-id="${id}" type="checkbox" ${r[id]?'checked':''}><span>${l}</span></label>`).join('')}</div></section>`;}
function saveRestrictionsFromDom(){const r=getRestrictions();document.querySelectorAll('.restriction-toggle').forEach(el=>r[el.dataset.restrictionId]=el.checked);setRestrictions(r);render();}

const REMINDER_DEFAULTS=Object.freeze({
  version:2,enabled:true,workout:true,activities:true,measurements:true,tests:true,mobility:true,recovery:true,
  visibility:'due-only',upcomingDays:3,preferredMoment:'morning',preferredTime:'08:00'
});
function normalizeReminderTime(value,fallback='08:00'){const v=String(value||'');return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(v)?v:fallback;}
function reminderMomentTime(moment){return ({morning:'08:00',afternoon:'15:00',evening:'19:00'})[moment]||null;}
function getReminderPrefs(){
  const raw=parse(STORAGE.reminders,{}),moment=['morning','afternoon','evening','custom'].includes(raw.preferredMoment)?raw.preferredMoment:REMINDER_DEFAULTS.preferredMoment;
  return {
    version:2,enabled:raw.enabled!==false,workout:raw.workout!==false,activities:raw.activities!==false,measurements:raw.measurements!==false,tests:raw.tests!==false,mobility:raw.mobility!==false,recovery:raw.recovery!==false,
    visibility:['due-only','due-and-soon'].includes(raw.visibility)?raw.visibility:REMINDER_DEFAULTS.visibility,
    upcomingDays:clamp(Math.round(Number(raw.upcomingDays??REMINDER_DEFAULTS.upcomingDays)),1,14),
    preferredMoment:moment,preferredTime:normalizeReminderTime(raw.preferredTime,reminderMomentTime(moment)||REMINDER_DEFAULTS.preferredTime)
  };
}
function setReminderPrefs(v){const next={...getReminderPrefs(),...(v||{}),version:2};next.upcomingDays=clamp(Math.round(Number(next.upcomingDays||REMINDER_DEFAULTS.upcomingDays)),1,14);next.preferredMoment=['morning','afternoon','evening','custom'].includes(next.preferredMoment)?next.preferredMoment:REMINDER_DEFAULTS.preferredMoment;next.preferredTime=normalizeReminderTime(next.preferredTime,reminderMomentTime(next.preferredMoment)||REMINDER_DEFAULTS.preferredTime);next.visibility=['due-only','due-and-soon'].includes(next.visibility)?next.visibility:REMINDER_DEFAULTS.visibility;save(STORAGE.reminders,next);return next;}
function reminderCategoryCount(p=getReminderPrefs()){return ['workout','activities','measurements','tests','mobility','recovery'].filter(k=>p[k]!==false).length;}
function smartReminderItems(){
  const p=getReminderPrefs();if(!p.enabled)return [];
  const out=[],day=todayDay(),todayW=workoutTemplateForDay(day),done=getHistory().some(s=>localDateKey(s.date)===localDateKey()&&String(s.trainingCycleId||getActiveTrainingCycleId())===String(getActiveTrainingCycleId()));
  if(p.workout&&(todayW.exercises||[]).length&&!done)out.push({type:'workout',label:`Séance ${todayW.name} à faire`,detail:`Complète ${todayW.duration} min · Express ${todayW.shortDuration||'—'} min`});
  if(p.activities||p.mobility){(plannedEventsForDate(localDateKey())||[]).forEach(event=>{const type=plannedEventType(event),isMobility=(event.type||type?.id)==='mobility';if((isMobility&&!p.mobility)||(!isMobility&&!p.activities)||plannedEventActual(event))return;out.push({type:isMobility?'mobility':'activity',label:`${type?.label||event.label||'Activité'} prévue`,detail:`${event.time||'Aujourd’hui'} · ${Number(event.duration||0)||'—'} min`});});}
  if(p.measurements){const schedule=bodyTrackingSchedule(),due=schedule.filter(x=>x.due),soon=p.visibility==='due-and-soon'?schedule.filter(x=>!x.due&&Math.max(0,Number(x.every||1)-Number(x.age||0))<=p.upcomingDays):[];if(due.length)out.push({type:'measure',label:`${due.length} suivi${due.length>1?'s':''} mesure à jour`,detail:due.map(x=>x.label).join(' · ')});if(soon.length)out.push({type:'measure',label:'Mesures bientôt à refaire',detail:soon.map(x=>`${x.label} · ${x.text}`).join(' · ')});}
  if(p.tests){const d=testDueSummary();if(d.overdue)out.push({type:'tests',label:'Tests périodiques disponibles',detail:d.label});else if(p.visibility==='due-and-soon'){const days=Number((String(d.label).match(/\d+/)||[])[0]||999);if(days<=p.upcomingDays)out.push({type:'tests',label:'Bilan performance bientôt dû',detail:d.label});}}
  return out;
}
function renderReminderSettings(){const p=getReminderPrefs(),active=reminderCategoryCount(p),disabled=p.enabled?'':' reminder-settings-disabled';return `<section class="p88-settings-section reminder-settings reminder-settings-v10118${disabled}"><div class="p88-section-head"><div><div class="kicker">Parcours quotidien</div><h2>Rappels & priorités</h2></div><span class="pill">${p.enabled?active+' catégories':'désactivés'}</span></div><p class="p88-muted reminder-intro">KINETIK utilise ces préférences pour filtrer ce qui mérite ton attention lorsque tu ouvres l’app. Elles ne déclenchent pas encore de notification système lorsque l’iPhone est verrouillé.</p><div class="reminder-master switchline"><div><strong>Rappels intelligents</strong><div class="small muted">Active ou masque l’ensemble des rappels du parcours quotidien.</div></div><input id="remindersEnabled" type="checkbox" ${p.enabled?'checked':''}></div><div class="reminder-settings-body"><div class="reminder-settings-block"><div class="reminder-settings-title"><strong>Catégories</strong><span>Choisis ce que KINETIK peut te rappeler</span></div><div class="reminder-category-grid">${[['workout','🏋️','Séance du jour','Entraînement prévu'],['activities','🏃','Activités','Course, vélo, boxe…'],['measurements','📏','Mesures','Poids, tour de taille, photos…'],['tests','🧪','Tests','Bilans de performance'],['mobility','🧘','Mobilité','Routines et activités mobilité'],['recovery','◌','Récupération','Jours de repos et routines douces']].map(([id,icon,label,note])=>`<label class="reminder-category ${p[id]!==false?'active':''}"><span class="reminder-category-icon">${icon}</span><span><strong>${label}</strong><small>${note}</small></span><input class="reminder-toggle" data-reminder="${id}" type="checkbox" ${p[id]!==false?'checked':''}></label>`).join('')}</div></div><div class="reminder-settings-block"><div class="reminder-settings-title"><strong>Ce qui apparaît</strong><span>La fréquence propre aux mesures reste configurée dans Mesures</span></div><div class="reminder-preference-grid"><label><span>Échéances affichées</span><select id="reminderVisibility"><option value="due-only" ${p.visibility==='due-only'?'selected':''}>Uniquement ce qui est dû</option><option value="due-and-soon" ${p.visibility==='due-and-soon'?'selected':''}>Dû + bientôt à refaire</option></select></label><label class="reminder-upcoming-field ${p.visibility==='due-and-soon'?'':'is-muted'}"><span>Considérer “bientôt”</span><div class="reminder-number"><input id="reminderUpcomingDays" type="number" min="1" max="14" value="${p.upcomingDays}" ${p.visibility==='due-and-soon'?'':'disabled'}><small>jours</small></div></label></div></div><div class="reminder-settings-block"><div class="reminder-settings-title"><strong>Moment préféré</strong><span>Préférence enregistrée pour la future couche de notifications</span></div><div class="reminder-preference-grid"><label><span>Moment</span><select id="reminderPreferredMoment"><option value="morning" ${p.preferredMoment==='morning'?'selected':''}>Matin</option><option value="afternoon" ${p.preferredMoment==='afternoon'?'selected':''}>Après-midi</option><option value="evening" ${p.preferredMoment==='evening'?'selected':''}>Soir</option><option value="custom" ${p.preferredMoment==='custom'?'selected':''}>Personnalisé</option></select></label><label><span>Heure préférée</span><input id="reminderPreferredTime" type="time" value="${p.preferredTime}"></label></div><p class="reminder-local-note">Pour l’instant, une tâche due reste visible dans l’app quelle que soit l’heure. Cette préférence sera réutilisée par la couche de notifications sans devoir te la redemander.</p></div></div></section>`;}
function renderAppearanceSettings(){const p=getPrefs(),theme=p.appTheme||'system';return `<section class="card"><div class="kicker">Interface</div><h2>Apparence & accessibilité</h2><label class="field-label">Thème</label><select class="select" id="appTheme"><option value="system" ${theme==='system'?'selected':''}>Système</option><option value="light" ${theme==='light'?'selected':''}>Clair</option><option value="dark" ${theme==='dark'?'selected':''}>Sombre</option></select><p class="muted small">Les animations respectent automatiquement “Réduire les animations” du système et les éléments interactifs gardent une zone tactile adaptée au mobile.</p></section>`;}
function applyAppTheme(){const p=getPrefs(),wanted=p.appTheme||'system',dark=wanted==='dark'||(wanted==='system'&&window.matchMedia?.('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=dark?'dark':'light';const meta=document.querySelector('meta[name=\"theme-color\"]');if(meta)meta.setAttribute('content',dark?'#090d14':'#f7f8fa');}

const _renderAthleteProfileV1023=renderMore;
const _renderProfileV97=renderProfile;
renderProfile=function(){
  let html=_renderProfileV97();
  const oldSetup=/<section class="card"><div class="kicker">Matériel maison<\/div><h2>Power Tower \+ barres parallèles \+ poignées \+ bandes \+ tapis<\/h2>[\s\S]*?<\/section>/;
  html=html.replace(oldSetup,'');
  const alertMarker='<section class="card"><h2>Alertes & écran</h2>';
  if(html.includes(alertMarker))html=html.replace(alertMarker,renderEquipmentSetupCard(false)+renderRestrictionSettings()+renderReminderSettings()+renderAppearanceSettings()+alertMarker);
  return html;
};
// v10.23.2 · legacy compatibility
// Keep the modern athlete profile as the sole renderer for the main Profile tab.
renderMore=function(){ return _renderAthleteProfileV1023(); };

function annotateWeekExercise(e){
  const a=exerciseAdaptation(e.name),issue=!a.equipment.available||a.restriction.restricted;
  if(!issue)return '';
  return `<div class="week-adaptation"><strong>⚠ ${!a.equipment.available?'Matériel indisponible':'Adaptation'}</strong><span>${!a.equipment.available?missingEquipmentLabels(a.equipment).join(', '):a.restriction.zones.map(restrictionLabel).join(', ')}</span>${a.suggestion?`<small>Variante : ${esc(a.suggestion)}</small>`:''}</div>`;
}
renderWeekExercise=function(e,i){
  const rest=e.rest>0?` · repos ${fmtTime(e.rest)}`:'',status=e.prescriptionStatus==='progress'?'<span class="microbadge good">progression</span>':e.prescriptionStatus==='recover'?'<span class="microbadge warn">allégé</span>':'';
  return `<div class="week-exercise-row">${exerciseImage(e.name,'mini')}<div class="num">${i+1}</div><div class="grow"><div class="exercise-name">${e.name}</div><div class="exercise-detail">${describe(e)}${rest}</div>${e.tip?`<div class="week-exercise-tip">${e.tip}</div>`:''}${annotateWeekExercise(e)}<div class="exercise-tools"><span class="microbadge phase-${e.phase||'main'}">${phaseLabel(e.phase)}</span>${status}${renderExerciseAvailabilityBadge(e.name)}${tutorialLink(e.name,true)}</div></div></div>`;
};

const _renderTodayV97=renderToday;
renderToday=function(){
  // Keep the compact V9.7 layout, but make equipment status actionable without another permanent block.
  let html=_renderTodayV97();const day=todayDay(),w=preparedWorkout(day),issues=(w.exercises||[]).filter(e=>e.equipmentMissing?.length||e.restrictionZones?.length);
  if(issues.length){const marker='<button class="btn btn-primary" id="startWorkout"';const notice=`<div class="today-adaptation-note"><strong>⚠ ${issues.length} étape${issues.length>1?'s':''} à adapter</strong><span>${issues.slice(0,3).map(e=>`${e.name}${e.adaptationSuggestion?' → '+e.adaptationSuggestion:''}`).join(' · ')}</span></div>`;if(html.includes(marker))html=html.replace(marker,notice+marker);}
  return html;
};

function renderExerciseLibrary(){
  const visible=visibleExerciseLibrary(),cats=['Tous',...new Set(visible.map(x=>x.category))];
  return `<main class="shell"><section class="card library-head"><button class="back-btn" id="closeExerciseLibrary">← Retour</button><div class="kicker">V10.1 · bibliothèque adaptative</div><h1>${visible.length} exercices</h1><p class="muted">Matériel, muscles, technique, régression, progression, substitutions et disponibilité avec ton setup actuel.</p><input class="library-search" id="librarySearch" type="search" placeholder="Rechercher un exercice, muscle, matériel…"><div class="library-filters">${cats.map(c=>`<button class="library-filter ${state.libraryCategory===c?'active':''}" data-library-category="${c}">${c}</button>`).join('')}</div></section><section class="library-list" id="libraryList">${visible.map(item=>{const a=exerciseAdaptation(item.name),g=techniqueGuide(item.name);return `<details class="card library-item ${a.equipment.available&&!a.restriction.restricted?'':'library-unavailable'}" data-lib-category="${item.category}" data-lib-text="${esc((item.name+' '+item.category+' '+item.level+' '+item.equipment+' '+item.muscles.join(' ')).toLowerCase())}"><summary>${exerciseImage(item.name,'mini')}<div class="grow"><strong>${item.name}</strong><span>${item.category} · ${item.level}</span></div>${renderExerciseAvailabilityBadge(item.name)}<b>⌄</b></summary><div class="library-body"><div class="meta"><span class="pill">${item.equipment}</span>${item.muscles.map(m=>`<span class="pill">${m}</span>`).join('')}</div>${!a.equipment.available?`<div class="library-availability warn"><strong>Matériel manquant</strong><span>${missingEquipmentLabels(a.equipment).join(' · ')}</span>${a.suggestion?`<small>Variante disponible : <b>${esc(a.suggestion)}</b></small>`:''}</div>`:''}${a.restriction.restricted?`<div class="library-availability warn"><strong>Zone à ménager</strong><span>${a.restriction.zones.map(restrictionLabel).join(' · ')}</span>${a.suggestion?`<small>Alternative possible : <b>${esc(a.suggestion)}</b></small>`:''}</div>`:''}${item.prescription?`<div class="library-prescription"><strong>Repère</strong><span>${item.prescription.type.startsWith('hold')?item.prescription.target+' sec':item.prescription.target+' reps'} · repos ${fmtTime(item.prescription.rest||0)}</span></div>`:''}<div class="library-path"><span>↓ Régression <strong>${item.regression||'—'}</strong></span><span>↑ Progression <strong>${item.progression||'—'}</strong></span></div>${item.substitutes.length?`<p class="small muted">Substitutions : ${item.substitutes.join(' · ')}</p>`:''}<details class="technique-library"><summary>Technique</summary><div><strong>Points clés</strong>${g.cues.map(x=>`<span>✓ ${esc(x)}</span>`).join('')}<strong>Erreurs fréquentes</strong>${g.errors.map(x=>`<span>× ${esc(x)}</span>`).join('')}</div></details>${equipmentUseNote(item.name)?`<p class="equipment-tip">🧰 ${equipmentUseNote(item.name)}</p>`:''}<div class="library-actions"><button class="btn btn-outline compact view-exercise-progress" data-exercise-progress="${encodeURIComponent(item.name)}">Voir ma progression</button>${tutorialLink(item.name)}</div></div></details>`}).join('')}</section></main>`;
}
const _substitutionOptionsV97=substitutionOptions;
substitutionOptions=function(e){
  const names=[...candidateSubstitutionNames(e.name),..._substitutionOptionsV97(e).map(x=>x.name)],seen=new Set(),out=[];
  names.forEach(n=>{if(seen.has(n))return;seen.add(n);const info=exerciseInfo(n);if(info)out.push(info);});
  return out.sort((a,b)=>Number(!equipmentAvailability(a.name).available)-Number(!equipmentAvailability(b.name).available)||Number(exerciseRestrictionStatus(a.name,state.active?.readiness).restricted)-Number(exerciseRestrictionStatus(b.name,state.active?.readiness).restricted));
};
const _renderSubstituteEditorV97=renderSubstituteEditor;
renderSubstituteEditor=function(){
  const a=state.active,idx=state.substituteEditor,e=a.workout.exercises[idx],opts=substitutionOptions(e);
  return `<main class="shell"><section class="card editor-card"><button class="back-btn" id="closeSubstitute">← Retour à la séance</button><div class="kicker">Substitution · aujourd’hui seulement</div><h1>${e.name}</h1><p class="muted">Les variantes compatibles avec ton matériel et tes zones à ménager sont affichées en premier.</p><div class="sub-list">${opts.map(o=>{const ad=exerciseAdaptation(o.name,a.readiness),ok=ad.equipment.available&&!ad.restriction.restricted;return `<div class="sub-card ${ok?'sub-compatible':'sub-warning'}"><div><strong>${o.name}</strong><small>${o.level} · ${o.muscles.join(', ')}</small><span>${ok?'✓ Compatible':!ad.equipment.available?'⚠ '+missingEquipmentLabels(ad.equipment).join(', '):'⚠ '+ad.restriction.zones.map(restrictionLabel).join(', ')}</span></div><div class="exercise-tools">${tutorialLink(o.name,true)}<button class="btn btn-secondary compact choose-sub" data-sub="${encodeURIComponent(o.name)}">Choisir</button></div></div>`}).join('')||'<div class="empty">Aucune substitution structurée.</div>'}</div></section></main>`;
};

function renderReadiness(){
  const r=state.readinessEditor,base=workoutForReadiness(r),plan=readinessPlan(r),c=getCycleState(),label=r.customWorkoutId?'Séance personnelle':DAY_NAMES[Number(r.day)];if(!base)return `<main class="shell"><section class="card"><h1>Séance introuvable</h1><button class="btn btn-primary" id="cancelReadiness">Retour</button></section></main>`;
  const activeZones=r.painZones||[];
  return `<main class="shell readiness-shell"><section class="card"><button class="back-btn" id="cancelReadiness">← Retour</button><div class="kicker">Avant la séance · ${label}</div><h1>Comment tu récupères ?</h1><p class="muted">Trois réponses suffisent pour adapter le volume. Si une zone gêne, indique-la pour faire remonter les variantes les plus pertinentes.</p><div class="readiness-group"><strong>Énergie</strong><span class="muted small">1 = à plat · 5 = très en forme</span><div class="readiness-scale">${[1,2,3,4,5].map(n=>`<button data-energy="${n}" class="${Number(r.energy)===n?'active':''}">${n}</button>`).join('')}</div></div><div class="readiness-group"><strong>Courbatures</strong><span class="muted small">1 = aucune · 5 = très fortes</span><div class="readiness-scale">${[1,2,3,4,5].map(n=>`<button data-soreness="${n}" class="${Number(r.soreness)===n?'active':''}">${n}</button>`).join('')}</div></div><div class="readiness-group"><strong>Articulations / tendons</strong><div class="joint-choice"><button data-joints="ok" class="${r.joints==='ok'?'active':''}">OK</button><button data-joints="sensitive" class="${r.joints==='sensitive'?'active':''}">Sensibles</button><button data-joints="pain" class="${r.joints==='pain'?'active':''}">Gênées</button></div>${r.joints!=='ok'?`<div class="pain-zone-picker">${RESTRICTION_AREAS.map(([id,l])=>`<button class="pain-zone ${activeZones.includes(id)?'active':''}" data-pain-zone="${id}">${l}</button>`).join('')}</div>`:''}</div><div class="readiness-result mode-${plan.mode}"><div><div class="kicker">Plan du jour</div><strong>${plan.label}</strong></div><p>${plan.note}</p><div class="meta"><span class="pill">Progression S${c.week}</span><span class="pill">${base.name}</span>${r.sessionLength?`<span class="pill">${r.sessionLength==='short'?'Express':'Complète'}</span>`:''}<span class="pill">${Math.round(plan.setFactor*100)} % volume readiness</span></div></div><div class="warmup-box"><strong>Échauffement prévu</strong>${warmupForWorkout(base).map(x=>`<span>• ${x}</span>`).join('')}</div><button class="btn btn-primary" id="confirmReadiness">${plan.mode==='recovery'?'Lancer très léger':'Lancer la séance'}</button></section></main>`;
}

const _startWorkoutV97=startWorkout;
startWorkout=function(day=todayDay(),readiness=null){_startWorkoutV97(day,readiness);if(state.active){state.active.reviewRir=2;state.active.reviewEnergyAfter=3;state.active.reviewLengthFit='good';state.active.reviewPainZones=[];}};
function renderWorkoutReview(){
  const a=state.active,duration=activeDurationMinutes(a),counted=a.entries.filter(x=>x.type!=="timer"),hit=counted.filter(x=>x.value>=x.target).length,score=counted.length?Math.round(hit/counted.length*100):100;
  if(a.kind==='flexibility')return `<main class="shell coach-shell"><section class="card review-card"><div class="kicker">Routine terminée</div><h1>Mobilité faite.</h1><div class="stat-grid"><div class="stat"><div class="stat-value">${duration}</div><div class="stat-label">minutes</div></div><div class="stat"><div class="stat-value">${a.workout.exercises.length}</div><div class="stat-label">étapes</div></div></div><div class="divider"></div><h2>Confort global</h2><div class="comfort-row">${[1,2,3,4,5].map(n=>`<button class="comfort-btn ${a.reviewComfort===n?'active':''}" data-comfort="${n}">${n}</button>`).join('')}</div><label class="checkline"><input id="jointDiscomfort" type="checkbox" ${a.reviewDiscomfort?'checked':''}><span><strong>Douleur ou pincement inhabituel</strong></span></label><label class="field-label">Note facultative</label><textarea class="textarea" id="reviewNote">${esc(a.reviewNote)}</textarea><button class="btn btn-primary" id="saveWorkout">Enregistrer la routine</button></section></main>`;
  const zones=a.reviewPainZones||[];
  return `<main class="shell coach-shell"><section class="card review-card"><div class="kicker">Séance terminée</div><h1>Check-in rapide</h1><div class="stat-grid"><div class="stat"><div class="stat-value">${duration}</div><div class="stat-label">minutes</div></div><div class="stat"><div class="stat-value">${score}%</div><div class="stat-label">cibles atteintes</div></div></div><div class="review-grid"><div><h3>Effort global · RPE</h3><div class="rpe-row">${[4,5,6,7,8,9].map(n=>`<button class="rpe-btn ${a.reviewRpe===n?'active':''}" data-rpe="${n}">${n}</button>`).join('')}</div></div><div><h3>Marge moyenne · RIR</h3><div class="review-choice five">${[0,1,2,3,4].map(n=>`<button class="review-rir ${a.reviewRir===n?'active':''}" data-review-rir="${n}">${n===4?'4+':n}</button>`).join('')}</div><small class="muted">Combien de reps auraient encore été possibles sur les séries principales ?</small></div><div><h3>Énergie après séance</h3><div class="review-choice five">${[1,2,3,4,5].map(n=>`<button class="review-energy ${a.reviewEnergyAfter===n?'active':''}" data-review-energy="${n}">${n}</button>`).join('')}</div></div><div><h3>Durée</h3><div class="review-choice three">${[['long','Trop longue'],['good','Adaptée'],['short','J’avais du temps']].map(([id,l])=>`<button class="review-length ${a.reviewLengthFit===id?'active':''}" data-review-length="${id}">${l}</button>`).join('')}</div></div></div><label class="checkline"><input id="jointDiscomfort" type="checkbox" ${a.reviewDiscomfort?'checked':''}><span><strong>Gêne articulaire ou tendineuse</strong><small>Si oui, sélectionne la zone ci-dessous.</small></span></label><div class="pain-zone-picker review-pain-zones">${RESTRICTION_AREAS.map(([id,l])=>`<button class="pain-zone ${zones.includes(id)?'active':''}" data-review-pain-zone="${id}">${l}</button>`).join('')}</div><label class="field-label">Note facultative</label><textarea class="textarea" id="reviewNote" placeholder="Grip, technique, fatigue, exercice trop facile…">${esc(a.reviewNote)}</textarea><div class="adaptive-review-note">Le moteur V2 utilise les reps réalisées + RPE + RIR + gêne pour ajuster la prochaine prescription.</div><button class="btn btn-primary" id="saveWorkout">Enregistrer la séance</button></section></main>`;
}
const _saveWorkoutReviewV97=saveWorkoutReview;
saveWorkoutReview=function(){
  const a=state.active;if(a?.kind!=='flexibility'){a.reviewDiscomfort=document.getElementById('jointDiscomfort')?.checked||false;a.reviewNote=document.getElementById('reviewNote')?.value||'';}
  if(a?.kind==='flexibility')return _saveWorkoutReviewV97();
  const durationMinutes=activeDurationMinutes(a),counted=a.entries.filter(x=>x.type!=="timer"),hit=counted.filter(x=>x.value>=x.target).length,score=counted.length?Math.round(hit/counted.length*100):100,beforeRank=getRankState().current.id,history=getHistory(),prs=detectPRs(a.entries,history);
  history.unshift({id:Date.now(),date:new Date().toISOString(),day:a.day,name:a.workout.name,durationMinutes,score,rpe:a.reviewRpe,reviewRir:a.reviewRir,energyAfter:a.reviewEnergyAfter,lengthFit:a.reviewLengthFit,jointDiscomfort:a.reviewDiscomfort,painZones:a.reviewPainZones||[],note:a.reviewNote,sessionLength:a.sessionLength||'full',customWorkoutId:a.customWorkoutId||null,trainingCycleId:a.trainingCycleId||null,readiness:{...a.readiness,mode:readinessPlan(a.readiness).mode},cycle:a.cycle,prs,entries:a.entries});setHistory(history.slice(0,1000));if(prs.length)state.prNotice=prs;const afterRank=getRankState();if(afterRank.current.id!==beforeRank)state.rankUpNotice=afterRank.current.name;state.active=null;state.undoSetSnapshot=null;state.view='progress';state.progressTab='overview';render();
};

function dateCutoff(days){return Date.now()-days*86400000;}
function sessionsBetween(start,end=Date.now()){return getHistory().filter(s=>{const t=new Date(s.date).getTime();return t>=start&&t<end;});}
function quickBetween(start,end=Date.now()){return getQuickLogs().filter(s=>{const t=new Date(s.date).getTime();return t>=start&&t<end;});}
function periodRepStats(start,end){let reps=0,sets=0,holds=0;for(const s of sessionsBetween(start,end))for(const e of (s.entries||[])){if(e.type==='timer')continue;sets++;reps+=repValueForEntry(e);holds+=holdSecondsForEntry(e);}for(const q of quickBetween(start,end)){sets++;reps+=repValueForEntry(q);holds+=holdSecondsForEntry(q);}return {reps,sets,holds};}
function bestExerciseBetween(name,start,end){let best=0;for(const s of sessionsBetween(start,end))for(const e of (s.entries||[]))if(e.exercise===name)best=Math.max(best,Number(e.value||0));return best;}
function measurementPeriodDelta(key,days){const all=getBodyLogs().slice().sort((a,b)=>new Date(a.date)-new Date(b.date)),start=Date.now()-days*86400000,inside=all.filter(x=>new Date(x.date).getTime()>=start&&bodyValue(x,key)!=null);if(inside.length<2)return null;const first=bodyValue(inside[0],key),last=bodyValue(inside[inside.length-1],key);return {first,last,delta:last-first};}
function reportSummary(days){
  const now=Date.now(),start=now-days*86400000,prevStart=start-days*86400000,cur=sessionsBetween(start,now),prev=sessionsBetween(prevStart,start),reps=periodRepStats(start,now),prevReps=periodRepStats(prevStart,start),pull=bestExerciseBetween('Tractions strictes',start,now),prevPull=bestExerciseBetween('Tractions strictes',prevStart,start),dips=bestExerciseBetween('Dips',start,now),prevDips=bestExerciseBetween('Dips',prevStart,start),waist=measurementPeriodDelta('waist',days),weight=measurementPeriodDelta('weight',days),flex=getFlexLogs().filter(x=>new Date(x.date).getTime()>=start),pain=cur.filter(x=>x.jointDiscomfort).length,avgRpe=cur.length?cur.reduce((a,x)=>a+Number(x.rpe||0),0)/cur.length:0,expected=Math.max(1,Math.round(days/7*6)),adherence=Math.min(100,Math.round(cur.length/expected*100));
  let decision='Continue le cycle et accumule des données propres.';let tone='neutral';
  const perfUp=(pull>prevPull&&pull>0)||(dips>prevDips&&dips>0)||(reps.reps>prevReps.reps*1.08&&prevReps.reps>0);
  if(cur.length>=4&&pain/cur.length>.2){decision='Plusieurs séances comportent une gêne : utilise les adaptations et évite de forcer la progression.';tone='warn';}
  else if(avgRpe>=8){decision='La charge perçue est élevée : consolide les cibles avant d’ajouter du volume.';tone='warn';}
  else if(adherence<60){decision='Le meilleur levier est la régularité : privilégie les formats Express plutôt que de sauter la séance.';tone='warn';}
  else if(perfUp){decision='La tendance de performance est positive : conserve la structure actuelle.';tone='good';}
  return {days,cur,prev,reps,prevReps,pull,prevPull,dips,prevDips,waist,weight,flex,pain,avgRpe,adherence,decision,tone};
}
function deltaText(d,unit){if(!d)return '—';const sign=d.delta>0?'+':'';return `${sign}${d.delta.toFixed(1).replace('.0','')} ${unit}`;}
function renderAdaptiveReport(){const days=state.reportPeriod==='90d'?90:30,r=reportSummary(days);return `<section class="card adaptive-report ${r.tone}"><div class="section-head"><div><div class="kicker">Bilan automatique</div><h2>${days} derniers jours</h2></div><div class="report-tabs"><button data-report-period="30d" class="${days===30?'active':''}">30 j</button><button data-report-period="90d" class="${days===90?'active':''}">90 j</button></div></div><div class="report-kpis"><div><span>Régularité</span><strong>${r.adherence}%</strong><small>${r.cur.length} séances</small></div><div><span>Volume</span><strong>${r.reps.reps.toLocaleString('fr-FR')}</strong><small>reps · ${r.reps.sets} séries</small></div><div><span>Tractions</span><strong>${r.pull||'—'}</strong><small>${r.prevPull?`avant ${r.prevPull}`:'meilleure série'}</small></div><div><span>Dips</span><strong>${r.dips||'—'}</strong><small>${r.prevDips?`avant ${r.prevDips}`:'meilleure série'}</small></div><div><span>Poids</span><strong>${deltaText(r.weight,'kg')}</strong><small>variation période</small></div><div><span>Tour de taille</span><strong>${deltaText(r.waist,'cm')}</strong><small>variation période</small></div></div><div class="report-decision"><span>Décision coach</span><strong>${r.decision}</strong></div><p class="muted small">Bilan descriptif basé sur tes données enregistrées. Il ne remplace pas une évaluation médicale ou un suivi clinique.</p></section>`;}
function renderSmartReminderCard(){const items=smartReminderItems();if(!items.length)return '';return `<section class="card smart-reminder-card"><div class="section-head"><div><div class="kicker">À faire</div><h2>${items.length} rappel${items.length>1?'s':''}</h2></div><span class="pill">local</span></div>${items.map(x=>`<div class="smart-reminder-item"><strong>${x.label}</strong><span>${x.detail}</span></div>`).join('')}</section>`;}

function exerciseHistoryStats(name,days=90){const start=Date.now()-days*86400000,sessions=exerciseSessions(name,100).filter(x=>new Date(x.session.date).getTime()>=start),entries=sessions.flatMap(x=>x.entries),type=exerciseInfo(name)?.prescription?.type||entries[0]?.type||'reps',best=entries.reduce((m,e)=>Math.max(m,Number(e.value||0)),0),total=entries.reduce((a,e)=>a+(type.startsWith('hold')?Number(e.value||0):repValueForEntry(e)),0),recent=sessions.slice(0,3),old=sessions.slice(-3),avg=arr=>{const vals=arr.flatMap(s=>s.entries.map(e=>Number(e.value||0)));return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0},recentAvg=avg(recent),oldAvg=avg(old),trend=oldAvg&&recentAvg?((recentAvg-oldAvg)/oldAvg)*100:null;return {name,type,sessions,entries,best,total,recentAvg,oldAvg,trend};}
function renderExerciseProgressDetail(name){const info=exerciseInfo(name),s=exerciseHistoryStats(name,90),p=prescriptionFor(exerciseFromLibrary(name,{sets:3}),getCycleState().allowProgress),a=exerciseAdaptation(name),g=techniqueGuide(name);return `<section class="card detail-card exercise-progress-detail"><div class="section-head"><div><div class="kicker">Progression exercice · 90 jours</div><h2>${esc(name)}</h2></div><button class="icon-btn" id="closeExerciseProgress">×</button></div>${exerciseImage(name,'hero')}<div class="exercise-detail-kpis"><div><span>Meilleur</span><strong>${s.best||'—'}${s.best?(s.type.startsWith('hold')?' s':' reps'):''}</strong></div><div><span>Séances</span><strong>${s.sessions.length}</strong></div><div><span>Volume</span><strong>${Math.round(s.total).toLocaleString('fr-FR')}</strong><small>${s.type.startsWith('hold')?'secondes':'reps'}</small></div><div><span>Tendance</span><strong>${s.trend==null?'—':`${s.trend>=0?'+':''}${Math.round(s.trend)}%`}</strong></div></div><div class="exercise-next-prescription"><span>Prochaine prescription</span><strong>${p.target} ${s.type.startsWith('hold')?'sec':'reps'} · ${p.note}</strong></div>${!a.equipment.available||a.restriction.restricted?renderExerciseAvailabilityNotice({name},null):''}<div class="library-path"><span>↓ Régression <strong>${info?.regression||'—'}</strong></span><span>↑ Progression <strong>${info?.progression||'—'}</strong></span></div><div class="technique-detail"><strong>3 points clés</strong>${g.cues.map(x=>`<span>✓ ${esc(x)}</span>`).join('')}</div>${tutorialLink(name)}</section>`;}
function trackedExerciseNames(){const seen=new Map();for(const s of getHistory())for(const e of (s.entries||[])){if(e.type==='timer'||!exerciseInfo(e.exercise))continue;seen.set(e.exercise,(seen.get(e.exercise)||0)+1);}return [...seen.entries()].sort((a,b)=>b[1]-a[1]).slice(0,12).map(x=>x[0]);}
function renderExerciseTracker(){const names=trackedExerciseNames();return `<section class="card exercise-tracker-card"><div class="section-head"><div><div class="kicker">Suivi par exercice</div><h2>Ouvrir une fiche de progression</h2></div><span class="pill">90 j</span></div>${names.length?`<div class="exercise-tracker-grid">${names.map(name=>{const s=exerciseHistoryStats(name,90);return `<button class="exercise-progress-button" data-exercise-progress="${encodeURIComponent(name)}">${exerciseImage(name,'mini')}<span><strong>${esc(name)}</strong><small>best ${s.best||'—'}${s.type.startsWith('hold')?' s':' reps'}${s.trend!=null?` · ${s.trend>=0?'↑':'↓'} ${Math.abs(Math.round(s.trend))}%`:''}</small></span><b>→</b></button>`}).join('')}</div>`:'<div class="empty">Les exercices suivis apparaîtront après tes premières séances.</div>'}</section>`;}

renderProgressOverview=function(){
  const x=progressWeekStats(),rank=getRankState(),next=rank.next,sessionPct=x.cycle.planned?Math.round(x.cycle.done/x.cycle.planned*100):0;
  const records=currentRecords().slice(0,4);
  return `<section class="progress-command-center rank-${rank.current.id}">
    <div class="progress-command-main">
      <div class="progress-command-copy"><div class="kicker">Ton niveau maintenant</div><h1>${rank.current.name}</h1><p>${rank.current.title}</p></div>
      <div class="progress-command-rank"><span>${next?`Vers ${next.name}`:'Rang maximal'}</span><strong>${next?Math.round(rank.readiness*100):100}%</strong><div class="progress-command-track"><i style="width:${next?rank.readiness*100:100}%"></i></div><small>${next?rankProgressText(next,rank.nextEval)+' validées':'Légende atteinte'}</small></div>
    </div>
    <div class="progress-command-stats">
      <article><span>Séances</span><strong>${x.cycle.done}/${x.cycle.planned}</strong><small>${Math.min(100,sessionPct)} % cette semaine</small></article>
      <article><span>Temps</span><strong>${x.mins}<em> min</em></strong><small>7 derniers jours</small></article>
      <article><span>Volume</span><strong>${x.reps7.reps.toLocaleString('fr-FR')}</strong><small>${x.reps7.sets} séries</small></article>
      <article><span>Qualité</span><strong>${x.avg||'—'}${x.avg?'<em> %</em>':''}</strong><small>${x.avg?'score moyen':'en attente'}</small></article>
    </div>
  </section>
  <section class="progress-focus-grid">
    <section class="card progress-overview-trends progress-primary-card"><div class="section-head"><div><div class="kicker">Évolution</div><h2>Est-ce que tu progresses ?</h2></div><button class="progress-text-link" data-progress-tab="performance">Tout analyser →</button></div>${exerciseProgressRows()||'<div class="empty">Termine quelques séances pour voir tes tendances.</div>'}</section>
    <section class="card progress-records-compact"><div class="section-head"><div><div class="kicker">Records personnels</div><h2>Meilleures performances</h2></div><button class="progress-text-link" data-progress-tab="performance">Tous →</button></div>${records.length?`<div class="progress-record-strip">${records.map(r=>`<div><span>${esc(r.exercise)}</span><strong>${recordValueText(r)}</strong><small>${formatShortDate(r.date)}</small></div>`).join('')}</div>`:'<div class="empty">Tes premiers records apparaîtront ici.</div>'}</section>
  </section>
  ${renderAdaptiveReport()}${renderSmartReminderCard()}
  <section class="card progress-watch-card"><div class="section-head"><div><div class="kicker">À surveiller</div><h2>Prochaines actions utiles</h2></div><span class="pill">${x.recs.length+(x.due.overdue?1:0)}</span></div><div class="progress-watch-list">${x.recs.length?`<button class="progress-watch-item" data-progress-tab="performance"><span class="progress-watch-icon">↗</span><div><strong>${x.recs.length} progression${x.recs.length>1?'s':''} disponible${x.recs.length>1?'s':''}</strong><small>${x.recs.slice(0,2).map(r=>`${r.current.name} → ${r.next.name}`).join(' · ')}</small></div><b>Voir →</b></button>`:''}<button class="progress-watch-item" data-progress-tab="performance"><span class="progress-watch-icon">◷</span><div><strong>Tests périodiques</strong><small>${x.due.label}</small></div><b>Voir →</b></button>${next?`<button class="progress-watch-item rank-${rank.current.id}" data-view="skills"><span class="progress-watch-icon">◆</span><div><strong>${rank.current.name} → ${next.name}</strong><small>${rankProgressText(next,rank.nextEval)}</small></div><b>Rangs →</b></button>`:''}</div></section>
  ${renderCycleMini()}`;
};
renderProgressPerformance=function(){const tests=getTests(),due=testDueSummary();return `${renderProgressionRecommendations()}${renderRecordsPanel()}${renderExerciseTracker()}<section class="card"><div class="section-head"><div><div class="kicker">Progression intelligente</div><h2>Tendances par exercice</h2></div><span class="pill">5 dernières</span></div>${exerciseProgressRows()||'<div class="empty">Termine quelques séances pour voir les tendances.</div>'}</section><section class="card standardized-tests"><div class="section-head"><div><div class="kicker">Batterie standardisée · fin de bloc</div><h2>Tests périodiques</h2></div><span class="pill ${due.overdue?'badge-warn':'badge-success'}">${due.label}</span></div><p class="muted small">Refais les mêmes tests dans des conditions comparables, idéalement pendant la semaine Deload + tests. La qualité prime sur l’échec absolu.</p><div class="test-grid">${TEST_DEFS.map(t=>{const best=bestTestValue(t.id),last=tests.filter(x=>x.testId===t.id).sort((a,b)=>new Date(b.date)-new Date(a.date))[0];return `<button class="test-tile edit-test" data-test="${t.id}"><span>${t.name}</span><strong>${best?best+' '+t.unit:'—'}</strong><small>${last?'Dernier '+formatShortDate(last.date):'À mesurer'}</small></button>`}).join('')}</div></section><section class="card progress-rank-link rank-${getRankState().current.id}"><div><div class="kicker">Gamification</div><h2>${getRankState().current.name} · ${getRankState().current.title}</h2><p>Rangs et Skill Tree restent regroupés dans Skills.</p></div><button class="btn btn-secondary compact" data-view="skills">Voir Skills & Rangs</button></section>${state.exerciseDetailName?renderExerciseProgressDetail(state.exerciseDetailName):''}`;};

function renderProgramAudit(){
  const a=programAudit(),cardioOK=a.cardioMinutes>=a.cfg.cardioMin&&a.cardioMinutes<=a.cfg.cardioMax,missing=[];for(const day of a.days){const w=preparedWorkout(day,null,'full');for(const e of w.exercises){const ad=exerciseAdaptation(e.name);if(!ad.equipment.available&&exerciseInfo(e.name))missing.push({day,name:e.name,suggestion:ad.suggestion});}}
  return `<section class="card program-audit"><div class="section-head"><div><div class="kicker">Audit automatique · ${esc(getActiveTrainingCycle().name)}</div><h2>Couverture hebdomadaire</h2></div><span class="pill ${a.covered===VOLUME_GROUPS.length&&!missing.length?'badge-success':'badge-warn'}">${a.covered}/${VOLUME_GROUPS.length} zones · ${missing.length} adaptations</span></div><div class="audit-hero"><div><strong>${a.days.length}/7</strong><span>jours actifs</span></div><div><strong>${a.cardioMinutes}</strong><span>min cardio · cible ${a.cfg.cardioMin}–${a.cfg.cardioMax}</span></div><div><strong>${a.warmups}/${a.days.length}</strong><span>échauffements</span></div><div><strong>${a.cooldowns}/${a.days.length}</strong><span>retours au calme</span></div></div>${missing.length?`<div class="audit-equipment-warnings"><strong>Setup à adapter</strong>${missing.slice(0,8).map(x=>`<span>${DAY_NAMES[x.day]} · ${x.name}${x.suggestion?' → '+x.suggestion:''}</span>`).join('')}</div>`:''}<div class="audit-section"><strong>Muscles / fonctions · programme complet</strong><div class="audit-chip-grid">${VOLUME_GROUPS.map(g=>{const n=a.muscles[g]||0,t=a.cfg.volumeTargets[g],ok=n>=t.min&&n<=t.max;return `<span class="audit-chip ${ok?'ok':'warn'}">${v10110VolumeLabel(g)} <b>${n.toFixed(1)}</b> <small>${t.min}–${t.max}</small></span>`}).join('')}</div></div><div class="audit-note ${cardioOK?'audit-ok':''}"><strong>Mode Express</strong><span>${a.expressCardioMinutes} min de cardio si toutes les séances actives étaient faites en Express.</span></div></section>`;
}

const _bindEventsV97=bindEvents;
bindEvents=function(){
  _bindEventsV97();
  document.querySelectorAll('.equipment-toggle').forEach(el=>el.onchange=saveEquipmentSetupFromDom);
  document.querySelectorAll('.restriction-toggle').forEach(el=>el.onchange=saveRestrictionsFromDom);
  document.querySelectorAll('.skill-priority-btn').forEach(b=>b.onclick=()=>{const p=getSkillPriorities();p[b.dataset.skillPriority]=b.dataset.priorityValue;setSkillPriorities(p);render();});
  document.querySelectorAll('[data-pain-zone]').forEach(b=>b.onclick=()=>{const arr=state.readinessEditor.painZones||[],id=b.dataset.painZone;state.readinessEditor.painZones=arr.includes(id)?arr.filter(x=>x!==id):[...arr,id];render();});
  document.querySelectorAll('[data-review-pain-zone]').forEach(b=>b.onclick=()=>{const arr=state.active.reviewPainZones||[],id=b.dataset.reviewPainZone;state.active.reviewPainZones=arr.includes(id)?arr.filter(x=>x!==id):[...arr,id];render();});
  document.querySelectorAll('[data-review-rir]').forEach(b=>b.onclick=()=>{state.active.reviewRir=Number(b.dataset.reviewRir);render();});
  document.querySelectorAll('[data-review-energy]').forEach(b=>b.onclick=()=>{state.active.reviewEnergyAfter=Number(b.dataset.reviewEnergy);render();});
  document.querySelectorAll('[data-review-length]').forEach(b=>b.onclick=()=>{state.active.reviewLengthFit=b.dataset.reviewLength;render();});
  document.querySelectorAll('.direct-substitution').forEach(b=>b.onclick=()=>{state.substituteEditor=state.active.exerciseIndex;chooseSubstitution(decodeURIComponent(b.dataset.directSub));});
  document.querySelectorAll('[data-report-period]').forEach(b=>b.onclick=()=>{state.reportPeriod=b.dataset.reportPeriod;render();});
  document.querySelectorAll('.view-exercise-progress,.exercise-progress-button').forEach(b=>b.onclick=()=>{state.exerciseDetailName=decodeURIComponent(b.dataset.exerciseProgress);state.exerciseLibrary=false;state.view='progress';state.progressTab='performance';render();});
  const closeEP=document.getElementById('closeExerciseProgress');if(closeEP)closeEP.onclick=()=>{state.exerciseDetailName=null;render();};
  const remEnabled=document.getElementById('remindersEnabled');if(remEnabled)remEnabled.onchange=()=>{setReminderPrefs({...getReminderPrefs(),enabled:remEnabled.checked});render();};
  document.querySelectorAll('.reminder-toggle').forEach(el=>el.onchange=()=>{setReminderPrefs({...getReminderPrefs(),[el.dataset.reminder]:el.checked});render();});
  const reminderVisibility=document.getElementById('reminderVisibility');if(reminderVisibility)reminderVisibility.onchange=()=>{setReminderPrefs({...getReminderPrefs(),visibility:reminderVisibility.value});render();};
  const reminderUpcomingDays=document.getElementById('reminderUpcomingDays');if(reminderUpcomingDays)reminderUpcomingDays.onchange=()=>{setReminderPrefs({...getReminderPrefs(),upcomingDays:Number(reminderUpcomingDays.value||3)});render();};
  const reminderMoment=document.getElementById('reminderPreferredMoment');if(reminderMoment)reminderMoment.onchange=()=>{const moment=reminderMoment.value,p=getReminderPrefs(),preset=reminderMomentTime(moment);setReminderPrefs({...p,preferredMoment:moment,preferredTime:preset||p.preferredTime});render();};
  const reminderTime=document.getElementById('reminderPreferredTime');if(reminderTime)reminderTime.onchange=()=>{setReminderPrefs({...getReminderPrefs(),preferredMoment:'custom',preferredTime:reminderTime.value});render();};
  const theme=document.getElementById('appTheme');if(theme)theme.onchange=()=>{const p=getPrefs();p.appTheme=theme.value;setPrefs(p);



applyAppTheme();render();};
};

/* ========================================================================== */
/* V10.40 · Intelligence foundation                                           */
/* ========================================================================== */
Object.assign(state,{activityEditId:null});

function progressionRirMinV1040(name){return /muscle.?up|front lever|human flag|handstand|hspu|planche/i.test(String(name||''))?3:2;}
const _startWorkoutV1040=startWorkout;
startWorkout=function(day=todayDay(),readiness=null){_startWorkoutV1040(day,readiness);if(state.active&&state.active.kind!=='flexibility')state.active.reviewTechnique=4;};
const _prescriptionForV1040=prescriptionFor;
prescriptionFor=function(e,allowProgress=true){
  const base=_prescriptionForV1040(e,allowProgress);if(!e||e.type==='timer'||!getPrefs().smartProgression)return base;
  const sessions=exerciseSessions(e.name,6);if(!sessions.length)return base;
  const last=sessions[0],target=Math.max(Number(e.baseTarget||0),Number(sessionProgressionTarget(last)||e.baseTarget||0)),tech=Number(last.session.reviewTechnique??4),minRir=progressionRirMinV1040(e.name);
  if(last.session.jointDiscomfort||tech<=2){return {target:e.type.startsWith('hold')?Math.max(10,target-5):Math.max(3,target-1),status:'recover',note:last.session.jointDiscomfort?'Gêne signalée : cible réduite et variante conseillée.':'Technique dégradée : réduis la cible et reconstruis des répétitions propres.'};}
  if(base.status==='progress'){
    const same=sessions.filter(s=>Math.abs(Number(sessionProgressionTarget(s))-target)<.01).slice(0,2);
    const ok=same.length>=2&&same.every(s=>{const rir=Number(s.session.reviewRir??NaN),q=Number(s.session.reviewTechnique??4);return sessionExerciseRatio(s.entries)>=.98&&Number(s.session.rpe||0)<=7&&!s.session.jointDiscomfort&&q>=4&&(!Number.isFinite(rir)||rir>=minRir);});
    if(!ok)return {target,status:'maintain',note:`Progression en attente : valide 2 séances propres à technique ≥ 4/5 et ${minRir}+ RIR.`};
  }
  return base;
};

renderWorkoutReview=function(){
  const a=state.active,duration=activeDurationMinutes(a),counted=a.entries.filter(x=>x.type!=="timer"),hit=counted.filter(x=>x.value>=x.target).length,score=counted.length?Math.round(hit/counted.length*100):100;
  if(a.kind==='flexibility')return `<main class="shell coach-shell"><section class="card review-card"><div class="kicker">Routine terminée</div><h1>Mobilité faite.</h1><div class="stat-grid"><div class="stat"><div class="stat-value">${duration}</div><div class="stat-label">minutes</div></div><div class="stat"><div class="stat-value">${a.workout.exercises.length}</div><div class="stat-label">étapes</div></div></div><div class="divider"></div><h2>Confort global</h2><div class="comfort-row">${[1,2,3,4,5].map(n=>`<button class="comfort-btn ${a.reviewComfort===n?'active':''}" data-comfort="${n}">${n}</button>`).join('')}</div><label class="checkline"><input id="jointDiscomfort" type="checkbox" ${a.reviewDiscomfort?'checked':''}><span><strong>Douleur ou pincement inhabituel</strong></span></label><label class="field-label">Note facultative</label><textarea class="textarea" id="reviewNote">${esc(a.reviewNote)}</textarea><button class="btn btn-primary" id="saveWorkout">Enregistrer la routine</button></section></main>`;
  const zones=a.reviewPainZones||[],tech=Number(a.reviewTechnique||4);
  return `<main class="shell coach-shell"><section class="card review-card"><div class="kicker">Séance terminée</div><h1>Check-in rapide</h1><div class="stat-grid"><div class="stat"><div class="stat-value">${duration}</div><div class="stat-label">minutes</div></div><div class="stat"><div class="stat-value">${score}%</div><div class="stat-label">cibles atteintes</div></div></div><div class="review-grid"><div><h3>Effort global · RPE</h3><div class="rpe-row">${[4,5,6,7,8,9].map(n=>`<button class="rpe-btn ${a.reviewRpe===n?'active':''}" data-rpe="${n}">${n}</button>`).join('')}</div></div><div><h3>Marge · RIR</h3><div class="review-choice five">${[0,1,2,3,4].map(n=>`<button class="review-rir ${a.reviewRir===n?'active':''}" data-review-rir="${n}">${n===4?'4+':n}</button>`).join('')}</div></div><div><h3>Qualité technique</h3><div class="review-choice five">${[1,2,3,4,5].map(n=>`<button class="review-technique ${tech===n?'active':''}" data-review-technique="${n}">${n}</button>`).join('')}</div><small class="muted">1 = dégradée · 5 = très propre.</small></div><div><h3>Énergie après</h3><div class="review-choice five">${[1,2,3,4,5].map(n=>`<button class="review-energy ${a.reviewEnergyAfter===n?'active':''}" data-review-energy="${n}">${n}</button>`).join('')}</div></div><div><h3>Durée</h3><div class="review-choice three">${[['long','Trop longue'],['good','Adaptée'],['short','J’avais du temps']].map(([id,l])=>`<button class="review-length ${a.reviewLengthFit===id?'active':''}" data-review-length="${id}">${l}</button>`).join('')}</div></div></div><label class="checkline"><input id="jointDiscomfort" type="checkbox" ${a.reviewDiscomfort?'checked':''}><span><strong>Gêne articulaire ou tendineuse</strong><small>Si oui, sélectionne la zone.</small></span></label><div class="pain-zone-picker review-pain-zones">${RESTRICTION_AREAS.map(([id,l])=>`<button class="pain-zone ${zones.includes(id)?'active':''}" data-review-pain-zone="${id}">${l}</button>`).join('')}</div><label class="field-label">Note facultative</label><textarea class="textarea" id="reviewNote">${esc(a.reviewNote)}</textarea><div class="adaptive-review-note">Le moteur utilise réalisation + RPE + RIR + technique + gêne.</div><button class="btn btn-primary" id="saveWorkout">Enregistrer la séance</button></section></main>`;
};

saveWorkoutReview=function(){
  const a=state.active;if(a?.kind==='flexibility')return _saveWorkoutReviewV97();if(!a)return;
  a.reviewDiscomfort=document.getElementById('jointDiscomfort')?.checked||false;a.reviewNote=document.getElementById('reviewNote')?.value||'';
  const durationMinutes=activeDurationMinutes(a),counted=a.entries.filter(x=>x.type!=="timer"),hit=counted.filter(x=>x.value>=x.target).length,score=counted.length?Math.round(hit/counted.length*100):100,beforeRank=getRankState().current.id,history=getHistory(),prs=detectPRs(a.entries,history);
  history.unshift({id:Date.now(),date:new Date().toISOString(),day:a.day,name:a.workout.name,durationMinutes,score,rpe:a.reviewRpe,reviewRir:a.reviewRir,reviewTechnique:Number(a.reviewTechnique||4),energyAfter:a.reviewEnergyAfter,lengthFit:a.reviewLengthFit,jointDiscomfort:a.reviewDiscomfort,painZones:a.reviewPainZones||[],note:a.reviewNote,sessionLength:a.sessionLength||'full',customWorkoutId:a.customWorkoutId||null,trainingCycleId:a.trainingCycleId||null,readiness:{...a.readiness,mode:readinessPlan(a.readiness).mode},cycle:a.cycle,prs,entries:a.entries});setHistory(history.slice(0,1000));if(prs.length)state.prNotice=prs;const afterRank=getRankState();if(afterRank.current.id!==beforeRank)state.rankUpNotice=afterRank.current.name;state.active=null;state.undoSetSnapshot=null;state.view='progress';state.progressTab='overview';render();
};

function strengthSessionInternalLoad(s){return Math.round(Number(s.durationMinutes||0)*Math.max(1,Number(s.rpe||5)));}
function activityInternalLoad(a){return Math.round(Number(a.duration||0)*Math.max(1,Number(a.rpe||5)));}
function trainingWindowStats(start,end=Date.now()){
  const strength=getHistory().filter(x=>{const d=new Date(x.date).getTime();return d>=start&&d<end;}),manual=getActivities().filter(x=>{const d=new Date(x.date).getTime();return d>=start&&d<end;}),flex=getFlexLogs().filter(x=>{const d=new Date(x.date).getTime();return d>=start&&d<end;}),sportManual=manual.filter(x=>x.type!=='mobility'),manualMobility=manual.filter(x=>x.type==='mobility');
  return {strength,manual,sportManual,flex,sportLoad:strength.reduce((s,x)=>s+strengthSessionInternalLoad(x),0)+sportManual.reduce((s,x)=>s+activityInternalLoad(x),0),recoveryMinutes:flex.reduce((s,x)=>s+Number(x.durationMinutes||0),0)+manualMobility.reduce((s,x)=>s+Number(x.duration||0),0),sessions:strength.length+sportManual.length};
}
totalTrainingStats=function(days=7){const start=Date.now()-days*86400000,w=trainingWindowStats(start),a=activityStats(days),s=strengthVolumeStats(days),unrated=getStravaActivities().filter(x=>new Date(x.start_date||x.start_date_local||0).getTime()>=start&&isRunActivity(x)).length;return {minutes:a.minutes+s.minutes,sessions:a.sessions+s.sessions,load:w.sportLoad,sportLoad:w.sportLoad,recoveryMinutes:w.recoveryMinutes,unratedSessions:unrated,strength:s,activities:a};};

function activityById(id){return getActivities().find(x=>String(x.id)===String(id))||null;}
renderActivityEditor=function(){const editing=state.activityEditId?activityById(state.activityEditId):null,type=activityType(editing?.type||'running'),date=(editing?.date||new Date().toISOString()).slice(0,10),duration=Number(editing?.duration||30),distance=editing?.distance||'',rpe=Number(editing?.rpe||5),note=editing?.note||'';return shell(`<header class="topbar activity-topbar"><div><div class="brand">${editing?'Modifier l’activité':'Nouvelle activité'}</div><div class="daylabel">Toutes tes disciplines au même endroit</div></div></header><section class="activity-editor activity-editor-premium"><div class="activity-editor-intro"><div class="activity-editor-symbol" id="activityEditorSymbol">${activityUiIcon(type.id)}</div><div><div class="kicker">${editing?'Édition':'Activité'}</div><h1 id="activityEditorTitle">${esc(type.label)}</h1><p>La charge sportive utilise durée × RPE. La mobilité reste séparée comme recovery.</p></div></div><div class="activity-form-section activity-editor-two"><label class="activity-field"><span>Type</span><select id="activityType">${ACTIVITY_TYPES.map(x=>`<option value="${x.id}" ${x.id===type.id?'selected':''}>${x.label}</option>`).join('')}</select></label><label class="activity-field"><span>Date</span><input id="activityDate" type="date" value="${date}"></label></div><div class="activity-metrics-grid"><label class="activity-metric"><span>Durée</span><div><input id="activityDuration" type="number" min="1" value="${duration}"><b>min</b></div></label><label class="activity-metric" id="activityDistanceWrap"><span>Distance</span><div><input id="activityDistance" type="number" min="0" step=".1" value="${distance}"><b id="activityDistanceUnit">${type.metric||'km'}</b></div></label></div><div class="activity-form-section activity-rpe-section"><div class="activity-rpe-head"><div><span>Effort perçu</span><small>1 très facile · 10 maximal</small></div><strong id="activityRpeValue">${rpe}</strong></div><input id="activityRpe" class="activity-rpe-slider" type="range" min="1" max="10" value="${rpe}"></div><div class="activity-form-section"><label class="activity-field"><span>Note</span><textarea id="activityNote" rows="3">${esc(note)}</textarea></label></div><div class="activity-load-preview activity-load-premium"><div><span>${type.id==='mobility'?'Recovery':'Charge sportive'}</span><small>${type.id==='mobility'?'séparée de la charge sportive':'durée × RPE'}</small></div><strong id="activityLoadPreview">${type.id==='mobility'?'—':Math.round(duration*rpe)+' <small>UA</small>'}</strong></div><div class="activity-editor-actions"><button class="btn activity-cancel" id="cancelActivity">Annuler</button><button class="btn activity-save" id="saveActivity">${editing?'Enregistrer':'Ajouter'}</button></div></section>`,'today');};

renderActivityHub=function(){const all=totalTrainingStats(7),prev=trainingWindowStats(Date.now()-14*86400000,Date.now()-7*86400000),s=all.activities,recent=getActivities().slice(0,5),categories=[['Calisthénie / force',all.strength.minutes],...Object.entries(s.rows).filter(([n])=>n!=='Mobilité / étirements').map(([n,v])=>[n,v.minutes])].filter(x=>x[1]>0),max=Math.max(1,...categories.map(x=>x[1])),delta=prev.sportLoad?Math.round((all.sportLoad-prev.sportLoad)/prev.sportLoad*100):null;return `<section class="card activity-hub activity-hub-v1040"><div class="section-head"><div><div class="kicker">Charge sportive · 7 jours</div><h2>${all.sportLoad.toLocaleString('fr-FR')} UA${delta==null?'':` · ${delta>=0?'+':''}${delta}%`}</h2><p class="muted small">${all.sessions} sessions · ${all.recoveryMinutes} min recovery${all.unratedSessions?` · ${all.unratedSessions} Strava sans RPE`:''}</p></div><button class="btn btn-secondary compact" data-open-activity="true">＋ Activité</button></div>${categories.length?`<div class="training-mix">${categories.map(([name,min])=>`<div class="training-mix-row"><div><span>${esc(name)}</span><strong>${Math.round(min)} min</strong></div><div class="training-mix-track"><i style="width:${Math.max(4,Math.round(min/max*100))}%"></i></div></div>`).join('')}</div>`:'<p class="muted small">Ajoute une activité pour construire ta charge sportive.</p>'}${recent.length?`<details class="activity-recent"><summary>Dernières activités manuelles</summary><div>${recent.map(a=>{const x=activityType(a.type);return `<div class="activity-recent-row"><span>${activityUiIcon(x.id)}</span><div><strong>${esc(x.label)}</strong><small>${formatShortDate(a.date)} · ${a.duration} min${a.distance?` · ${a.distance} ${x.metric||'km'}`:''} · RPE ${a.rpe||'—'}</small></div><button class="activity-row-action edit-activity" data-activity-id="${a.id}">Modifier</button><button class="activity-row-action danger delete-activity" data-activity-id="${a.id}">×</button></div>`}).join('')}</div></details>`:''}</section>`;};

function athleteTimelineEvents(limit=8){const rows=[];getHistory().forEach(x=>rows.push({date:x.date,icon:'↟',title:x.name,detail:`${x.durationMinutes||0} min · RPE ${x.rpe||'—'}${x.reviewTechnique?` · technique ${x.reviewTechnique}/5`:''}`}));getActivities().forEach(x=>{const a=activityType(x.type);rows.push({date:x.date,icon:activityUiIcon(a.id),title:a.label,detail:`${x.duration||0} min${x.distance?` · ${x.distance} ${a.metric||'km'}`:''}`});});getFlexLogs().forEach(x=>rows.push({date:x.date,icon:'∿',title:x.name||'Mobilité',detail:`${x.durationMinutes||0} min · confort ${x.comfort||'—'}/5`}));return rows.sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,limit);}
function renderAthleteTimeline(){const rows=athleteTimelineEvents();if(!rows.length)return '';return `<section class="card athlete-timeline"><div class="section-head"><div><div class="kicker">Journal athlète</div><h2>Derniers événements</h2></div><span class="timeline-source-note">multisport</span></div><div class="athlete-timeline-list">${rows.map(x=>`<div><span>${x.icon}</span><div><strong>${esc(x.title)}</strong><small>${esc(x.detail)}</small></div><time>${formatShortDate(x.date)}</time></div>`).join('')}</div></section>`;}

renderTodayUsefulActions=function(){const x=progressWeekStats(),rank=getRankState(),next=rank.next,count=(x.recs?.length||0)+(x.due?.overdue?1:0)+(next?1:0);return `<section class="card today-actions-card"><div class="section-head"><div><div class="kicker">À surveiller</div><h2>Prochaines actions utiles</h2></div><span class="pill">${count}</span></div><div class="progress-watch-list">${x.recs?.length?`<button class="progress-watch-item today-progress-link" data-today-progress="performance"><span class="progress-watch-icon">↗</span><div><strong>${x.recs.length} progression${x.recs.length>1?'s':''} disponible${x.recs.length>1?'s':''}</strong><small>${x.recs.slice(0,2).map(r=>`${r.current.name} → ${r.next.name}`).join(' · ')}</small></div><b>Voir →</b></button>`:''}<button class="progress-watch-item today-progress-link" data-today-progress="performance"><span class="progress-watch-icon">◷</span><div><strong>Tests périodiques</strong><small>${x.due.label}</small></div><b>Ouvrir →</b></button>${next?`<button class="progress-watch-item rank-${rank.current.id}" data-view="skills"><span class="progress-watch-icon">◆</span><div><strong>${rank.displayName} → ${next.name}</strong><small>${Math.round(rank.readiness*100)}% des exigences du prochain rang</small></div><b>Rangs →</b></button>`:''}</div></section>`;};

/* ancien patch de progression basé sur un compteur retiré en v10.86 */

const _renderProgressPerformanceV1040=renderProgressPerformance;
renderProgressPerformance=function(){const rs=getRankState();let html=_renderProgressPerformanceV1040();html=html.replace('Gamification','Niveau KINETIK').replace(`${rs.current.name} · ${rs.current.title}`,`${rs.displayName} · ${rs.current.title}`).replace('Rangs et Skill Tree restent regroupés dans Skills.','Le rang dépend des barèmes validés, pas de l’ancienneté dans l’application.').replace('Voir Skills & Rangs','Voir Capacités');return html;};

const _bindEventsV1040=bindEvents;
bindEvents=function(){_bindEventsV1040();document.querySelectorAll('[data-review-technique]').forEach(b=>b.onclick=()=>{state.active.reviewTechnique=Number(b.dataset.reviewTechnique);render();});document.querySelectorAll('[data-open-activity]').forEach(b=>b.onclick=()=>{state.activityEditId=null;state.activityEditor=true;render();});document.querySelectorAll('.edit-activity').forEach(b=>b.onclick=()=>{state.activityEditId=b.dataset.activityId;state.activityEditor=true;render();});document.querySelectorAll('.delete-activity').forEach(b=>b.onclick=()=>{if(confirm('Supprimer cette activité ?')){setActivities(getActivities().filter(x=>String(x.id)!==String(b.dataset.activityId)));render();}});const cancel=document.getElementById('cancelActivity');if(cancel)cancel.onclick=()=>{state.activityEditor=false;state.activityEditId=null;render();};const saveBtn=document.getElementById('saveActivity');if(saveBtn)saveBtn.onclick=()=>{const duration=Number(document.getElementById('activityDuration')?.value||0);if(duration<=0)return;const type=document.getElementById('activityType')?.value||'sport',distance=Number(document.getElementById('activityDistance')?.value||0),rpe=Number(document.getElementById('activityRpe')?.value||5),note=document.getElementById('activityNote')?.value||'',dateValue=document.getElementById('activityDate')?.value;if(state.activityEditId){const rows=getActivities(),i=rows.findIndex(x=>String(x.id)===String(state.activityEditId));if(i>=0){rows[i]={...rows[i],date:dateValue?new Date(`${dateValue}T12:00:00`).toISOString():rows[i].date,type,duration,distance:Math.max(0,distance),rpe:clamp(rpe,1,10),note,load:Math.round(duration*clamp(rpe,1,10))};setActivities(rows);}}else{addActivityLog(type,duration,distance,'rpe',note,rpe);if(dateValue&&dateValue!==new Date().toISOString().slice(0,10)){const rows=getActivities();if(rows[0])rows[0].date=new Date(`${dateValue}T12:00:00`).toISOString();setActivities(rows);}}state.activityEditor=false;state.activityEditId=null;render();};const typeEl=document.getElementById('activityType'),rpeEl=document.getElementById('activityRpe'),durEl=document.getElementById('activityDuration');const sync=()=>{if(!typeEl)return;const type=activityType(typeEl.value),wrap=document.getElementById('activityDistanceWrap'),unit=document.getElementById('activityDistanceUnit'),rpe=Number(rpeEl?.value||5),mins=Number(durEl?.value||0),rv=document.getElementById('activityRpeValue'),title=document.getElementById('activityEditorTitle'),symbol=document.getElementById('activityEditorSymbol'),lp=document.getElementById('activityLoadPreview');if(wrap)wrap.style.display=type.distance?'':'none';if(unit)unit.textContent=type.metric||'km';if(rv)rv.textContent=rpe;if(title)title.textContent=type.label;if(symbol)symbol.textContent=activityUiIcon(type.id);if(lp)lp.innerHTML=type.id==='mobility'?'—':`${Math.round(mins*rpe)} <small>UA</small>`;};if(typeEl)typeEl.onchange=sync;if(rpeEl)rpeEl.oninput=sync;if(durEl)durEl.oninput=sync;sync();};

/* ========================================================================== */
/* V10.50 · Centre d’évaluation KINETIK                                       */
/* Standard protocols · evidence quality · rank verification · assessment hub */
/* ========================================================================== */
STORAGE.assessments = "kinetik_assessments_v1";

const EVIDENCE_LEVELS = {
  declared:{level:1,label:"Déclaré",short:"Déclaré"},
  workout:{level:2,label:"Enregistré en séance",short:"Séance"},
  kinetik:{level:3,label:"Test KINETIK",short:"KINETIK"}
};
function getAssessments(){return parse(STORAGE.assessments,[]);}
function setAssessments(v){save(STORAGE.assessments,v);}
function evidenceInfo(level){
  const n=Number(level||0);
  return n>=3?EVIDENCE_LEVELS.kinetik:n>=2?EVIDENCE_LEVELS.workout:EVIDENCE_LEVELS.declared;
}
function assessmentLatest(protocolId){
  return getAssessments().filter(x=>x.protocolId===protocolId).sort((a,b)=>new Date(b.date)-new Date(a.date))[0]||null;
}
function assessmentBest(protocolId){
  return getAssessments().filter(x=>x.protocolId===protocolId&&Number.isFinite(Number(x.value))).sort((a,b)=>Number(b.value)-Number(a.value)||Number(b.evidenceLevel||0)-Number(a.evidenceLevel||0))[0]||null;
}
function assessmentBestForTest(testId){
  return getAssessments().filter(x=>x.testId===testId&&Number.isFinite(Number(x.value))).sort((a,b)=>Number(b.value)-Number(a.value)||Number(b.evidenceLevel||0)-Number(a.evidenceLevel||0))[0]||null;
}
function assessmentBestForExercise(name){
  return getAssessments().filter(x=>x.exercise===name&&Number.isFinite(Number(x.value))).sort((a,b)=>Number(b.value)-Number(a.value)||Number(b.evidenceLevel||0)-Number(a.evidenceLevel||0))[0]||null;
}
function assessmentEvidenceForTest(testId){
  const a=assessmentBestForTest(testId);
  const guided=(TEST_GUIDED_EXERCISES[testId]||[]).some(name=>bestMetricDetails(getHistory(),name).value>0)?2:0;
  const q=bestQuickMetricDetails(TEST_GUIDED_EXERCISES[testId]||[]).value>0?1:0;
  const legacy=getTests().filter(x=>x.testId===testId).reduce((m,x)=>Math.max(m,x.source==='kinetik'?3:x.source==='workout'?2:1),0);
  return Math.max(Number(a?.evidenceLevel||0),guided,q,legacy);
}
function assessmentEvidenceForExercise(name){
  const a=assessmentBestForExercise(name),guided=bestMetricDetails(getHistory(),name).value>0?2:0,quick=bestQuickMetricDetails(name).value>0?1:0;
  return Math.max(Number(a?.evidenceLevel||0),guided,quick);
}

/* Standardized protocols. Values are internal test standards, not population percentiles. */
const ASSESSMENT_PROTOCOLS = [
  {id:"pullups",category:"force",name:"Tractions strictes",kind:"test",testId:"pullups",unit:"reps",duration:7,targetLabel:"Maximum propre",warmup:["3–5 min de montée en température","2 × 5 scapular pull-ups","1–2 séries faciles à 40–60 % du maximum"],criteria:["Départ bras tendus et épaules contrôlées","Menton clairement au-dessus de la barre","Pas de kipping ni impulsion des jambes","Descente contrôlée jusqu’à l’extension"],stop:"Arrête dès que la répétition ne respecte plus les critères."},
  {id:"dips",category:"force",name:"Dips stricts",kind:"test",testId:"dips",unit:"reps",duration:7,targetLabel:"Maximum propre",warmup:["Mobilité épaules légère","2 × 5 pompes faciles","1–2 séries de dips sous-maximales"],criteria:["Départ coudes verrouillés sans relâcher les épaules","Descente contrôlée, bras au moins parallèle au sol","Retour complet en haut","Pas d’élan des jambes"],stop:"La première répétition raccourcie ou instable termine le test."},
  {id:"dead_hang",category:"grip",name:"Dead hang",kind:"test",testId:"dead_hang",unit:"sec",duration:5,targetLabel:"Temps propre",warmup:["Poignets et doigts 2 min","2 hangs faciles de 10–15 s"],criteria:["Prise pronation identique à chaque test","Deux mains sur la barre, sans assistance","Pas de contact des pieds au sol","Pas de changement volontaire de prise"],stop:"Arrête si la prise s’ouvre ou si une gêne inhabituelle apparaît."},
  {id:"towel_hang",category:"grip",name:"Towel hang",kind:"exercise",exercise:"Towel hang",unit:"sec",duration:6,targetLabel:"Temps propre",warmup:["Dead hang léger 15–20 s","Prise serviette progressive"],criteria:["Même serviette et même épaisseur si possible","Deux mains à hauteur comparable","Corps suspendu sans appui au sol","Aucun réajustement majeur de prise"],stop:"Arrête quand une main commence à glisser franchement."},
  {id:"one_arm_assisted_hang",category:"grip",name:"One-arm assisted hang",kind:"exercise",exercise:"One-arm assisted hang",unit:"sec",duration:7,targetLabel:"Meilleur côté faible",warmup:["2 dead hangs faciles","2 hangs asymétriques courts par côté"],criteria:["Main principale sur la barre","Main d’assistance sur une serviette verticale au même repère à chaque test","Même installation à gauche et à droite","Enregistre le côté le plus faible"],stop:"Arrête dès que l’assistance change fortement ou que l’épaule perd le contrôle."},
  {id:"chest_to_bar",category:"skills",name:"Chest-to-bar",kind:"exercise",exercise:"Chest-to-bar",unit:"reps",duration:7,targetLabel:"Répétitions propres",warmup:["Scapular pull-ups","2 séries de tractions strictes faciles","2–3 tirages explosifs progressifs"],criteria:["Départ en extension contrôlée","Contact ou hauteur nette du haut de poitrine à la barre","Pas de kipping","Chaque répétition retrouve le même standard"],stop:"Arrête dès que la hauteur chute nettement."},
  {id:"muscle_up",category:"skills",name:"Muscle-up strict",kind:"exercise",exercise:"Muscle-up strict",unit:"reps",duration:8,targetLabel:"Répétitions strictes",warmup:["Tractions strictes faciles","2–3 chest-to-bar","Transitions assistées légères"],criteria:["Départ en suspension contrôlée","Pas de kip volontaire ni balancement créé pour passer","Passage au-dessus de la barre sans appui externe","Verrouillage contrôlé en haut"],stop:"Arrête avant que le mouvement devienne fortement asymétrique ou kippé."},
  {id:"handstand_free",category:"skills",name:"Handstand libre",kind:"exercise",exercise:"Handstand libre",unit:"sec",duration:8,targetLabel:"Meilleur maintien",warmup:["Poignets 2–3 min","2 handstands au mur faciles","3–5 entrées progressives"],criteria:["Aucun contact avec un support pendant le chrono","Coudes verrouillés","Contrôle volontaire de la sortie","Chrono à partir de la stabilisation"],stop:"Garde au maximum 3–5 tentatives de qualité."},
  {id:"l_sit",category:"skills",name:"L-sit",kind:"exercise",exercise:"L-sit",unit:"sec",duration:6,targetLabel:"Maintien propre",warmup:["Compression assise légère","Tuck L-sit court","Échauffement poignets"],criteria:["Coudes verrouillés","Hanches décollées du support","Jambes tendues pour la variante L-sit complète","Pas d’appui des talons"],stop:"Le chrono s’arrête dès que les talons touchent ou que la position s’effondre."},
  {id:"front_lever",category:"skills",name:"Front lever",kind:"exercise",exercise:"Front lever",unit:"sec",duration:8,targetLabel:"Maintien full",warmup:["Scapular pulls","Tuck lever facile","Progression de levier sous-maximale"],criteria:["Variante full uniquement pour ce protocole","Corps aligné et horizontal","Coudes verrouillés","Pas d’élan d’entrée compté dans le chrono"],stop:"Arrête lorsque les hanches chutent nettement sous la ligne."},
  {id:"human_flag",category:"skills",name:"Human flag",kind:"exercise",exercise:"Human flag",unit:"sec",duration:8,targetLabel:"Côté le plus faible",warmup:["Épaules et poignets","Side plank","Tuck flag progressif"],criteria:["Full flag pour ce protocole","Corps proche de l’horizontale","Bras stables et contrôlés","Teste les deux côtés et conserve le plus faible"],stop:"Arrête lorsque la ligne n’est plus maintenue."},
  {id:"hspu_free",category:"skills",name:"HSPU libre",kind:"exercise",exercise:"Handstand push-up libre",unit:"reps",duration:8,targetLabel:"Répétitions propres",warmup:["Handstand facile","Pike push-ups","1–2 HSPU au mur sous-max"],criteria:["Départ et fin en équilibre libre","Amplitude reproductible","Verrouillage complet","Pas de contact avec un mur ou support"],stop:"La première rep assistée ou fortement raccourcie termine le test."},
  {id:"toes_to_bar",category:"skills",name:"Toes-to-bar",kind:"exercise",exercise:"Toes-to-bar",unit:"reps",duration:6,targetLabel:"Répétitions propres",warmup:["Hollow hold","Hanging knee raises","2–3 reps faciles"],criteria:["Contact des pieds avec la barre","Retour contrôlé","Balancement limité et reproductible","Pas d’impulsion excessive"],stop:"Arrête quand le contact ou le contrôle n’est plus reproductible."},
  {id:"cooper12",category:"cardio",name:"Test 12 minutes",kind:"test",testId:"cardio12",unit:"m",duration:20,targetLabel:"Distance totale",warmup:["8–10 min faciles","3 accélérations progressives de 15–20 s","2 min faciles avant le départ"],criteria:["Surface ou parcours comparable","12 minutes exactes","Distance mesurée de la même manière à chaque test","Note les conditions si elles sont inhabituelles"],stop:"Le test doit rester volontaire. Arrête en cas de symptôme inhabituel ou malaise."},
  {id:"run5k",category:"cardio",name:"5 km",kind:"assessment",unit:"min",duration:35,targetLabel:"Temps total",warmup:["10 min faciles","3 accélérations courtes","Départ contrôlé"],criteria:["Distance 5,00 km","Parcours comparable autant que possible","Pas de pause chrono","Note le terrain et les conditions"],stop:"Ce test est facultatif ; ne le place pas dans une semaine déjà très chargée."}
];
const ASSESSMENT_CATEGORIES = [
  {id:"force",label:"Force",description:"Tractions et dips stricts"},
  {id:"grip",label:"Grip",description:"Suspension et préhension"},
  {id:"skills",label:"Skills",description:"Contrôle et mouvements avancés"},
  {id:"mobility",label:"Mobilité",description:"Amplitude et asymétries"},
  {id:"cardio",label:"Cardio",description:"Endurance mesurable"}
];

function assessmentProtocol(id){return ASSESSMENT_PROTOCOLS.find(x=>x.id===id)||null;}
function protocolEvidence(p){
  if(p.kind==="test")return assessmentEvidenceForTest(p.testId);
  if(p.kind==="exercise")return assessmentEvidenceForExercise(p.exercise);
  const a=assessmentLatest(p.id);return Number(a?.evidenceLevel||0);
}
function protocolCurrent(p){
  if(p.kind==="test"){
    const d=performanceDetailsForTest(p.testId);return {value:Number(d.value||0),source:d.source||null,evidence:assessmentEvidenceForTest(p.testId)};
  }
  if(p.kind==="exercise"){
    const a=assessmentBestForExercise(p.exercise),h=bestMetricDetails(getHistory(),p.exercise),q=bestQuickMetricDetails(p.exercise);
    const candidates=[
      {value:Number(a?.value||0),source:a?'Test KINETIK':null,evidence:Number(a?.evidenceLevel||0)},
      {value:Number(h?.value||0),source:h?.value?'Séance':null,evidence:h?.value?2:0},
      {value:Number(q?.value||0),source:q?.value?'Déclaré / série libre':null,evidence:q?.value?1:0}
    ].sort((x,y)=>y.value-x.value||y.evidence-x.evidence);
    return candidates[0]||{value:0,evidence:0};
  }
  const a=assessmentLatest(p.id);return {value:Number(a?.value||0),source:a?evidenceInfo(a.evidenceLevel).label:null,evidence:Number(a?.evidenceLevel||0)};
}
function protocolLastValidated(p){
  const rows=getAssessments().filter(x=>x.protocolId===p.id&&Number(x.evidenceLevel)>=3).sort((a,b)=>new Date(b.date)-new Date(a.date));
  return rows[0]||null;
}
function protocolDue(p){
  const last=protocolLastValidated(p);if(!last)return true;
  return Date.now()-new Date(last.date).getTime()>42*86400000;
}
function mobilityAssessmentSummary(){
  const profiles=mobilityProfiles(),assessed=profiles.filter(x=>x.assessed),complete=profiles.filter(x=>x.complete);
  return {assessed:assessed.length,complete:complete.length,total:profiles.length,avg:assessed.length?Math.round(assessed.reduce((s,x)=>s+x.score,0)/assessed.length):null};
}
function assessmentCategoryStatus(id){
  if(id==="mobility"){
    const m=mobilityAssessmentSummary();return {tested:m.assessed,total:m.total,verified:m.complete,score:m.avg};
  }
  const p=ASSESSMENT_PROTOCOLS.filter(x=>x.category===id),tested=p.filter(x=>protocolCurrent(x).value>0).length,verified=p.filter(x=>protocolEvidence(x)>=3).length;
  return {tested,total:p.length,verified,score:null};
}
function assessmentCoverage(){
  const cats=ASSESSMENT_CATEGORIES.map(c=>({...c,...assessmentCategoryStatus(c.id)}));
  const total=cats.reduce((s,x)=>s+x.total,0),tested=cats.reduce((s,x)=>s+x.tested,0),verified=cats.reduce((s,x)=>s+x.verified,0);
  return {cats,total,tested,verified,pct:total?Math.round(tested/total*100):0,verifiedPct:total?Math.round(verified/total*100):0};
}
function protocolGoalWeight(p){
  const profile=getAthleteProfile(),text=`${profile.primaryGoal||""} ${profile.secondaryGoal||""}`.toLowerCase();
  let n=0;
  if(/muscle.?up/.test(text)&&["pullups","chest_to_bar","muscle_up","dead_hang"].includes(p.id))n+=4;
  if(/handstand|hspu/.test(text)&&["handstand_free","hspu_free"].includes(p.id))n+=4;
  if(/l.?sit/.test(text)&&["l_sit","toes_to_bar"].includes(p.id))n+=4;
  if(/front lever/.test(text)&&["pullups","front_lever","dead_hang"].includes(p.id))n+=4;
  if(/human flag/.test(text)&&["human_flag","pullups","dips"].includes(p.id))n+=4;
  return n;
}
function proofProtocol(proof){
  if(proof.kind==="test")return ASSESSMENT_PROTOCOLS.find(p=>p.testId===proof.id)||null;
  if(proof.kind==="exercise")return ASSESSMENT_PROTOCOLS.find(p=>p.exercise===proof.name)||null;
  return null;
}
function assessmentRecommended(){
  const rs=getRankState(),rankProofs=(rankRuleFor(rs.next)||{}).proofs||[],rankIds=new Set(rankProofs.map(proofProtocol).filter(Boolean).map(p=>p.id));
  return ASSESSMENT_PROTOCOLS.map(p=>{
    const cur=protocolCurrent(p),ev=protocolEvidence(p),never=!cur.value,due=protocolDue(p);
    let priority=(never?30:0)+(due?15:0)+protocolGoalWeight(p)*10+(rankIds.has(p.id)?25:0)+(ev<2?10:ev<3?4:0);
    return {...p,priority,current:cur,evidence:ev,due};
  }).sort((a,b)=>b.priority-a.priority).slice(0,4);
}
function evidenceMark(level){
  const e=evidenceInfo(level);
  return `<span class="assessment-evidence e${e.level}"><i></i>${e.label}</span>`;
}
function assessmentMetricLabel(p,current){
  if(!current?.value)return "Non évalué";
  return `${current.value} ${p.unit}`;
}
function renderAssessmentProtocolRow(p){
  const current=protocolCurrent(p),last=protocolLastValidated(p),ev=protocolEvidence(p);
  return `<div class="assessment-protocol-row"><div class="assessment-row-main"><strong>${esc(p.name)}</strong><span>${assessmentMetricLabel(p,current)}${last?` · validé ${formatShortDate(last.date)}`:""}</span></div>${evidenceMark(ev)}<button class="assessment-start" data-assessment-start="${p.id}">${current.value?"Retester":"Évaluer"} →</button></div>`;
}
function renderMobilityAssessmentRows(){
  const profiles=mobilityProfiles();
  return profiles.map(p=>`<div class="assessment-protocol-row"><div class="assessment-row-main"><strong>${p.label}</strong><span>${p.assessed?`${p.score}/100${p.complete?"":" · partiel"}`:"Non évalué"}</span></div>${evidenceMark(p.complete?2:p.assessed?1:0)}<button class="assessment-start" data-view="flexibility">Ouvrir →</button></div>`).join("");
}
function renderAssessmentCenter(){
  const coverage=assessmentCoverage(),recommended=assessmentRecommended(),rank=getRankState(),next=rank.next;
  const cat=state.assessmentCategory||"all";
  return shell(`<header class="topbar assessment-topbar"><div><div class="brand">Évaluation</div><div class="daylabel">Protocoles standardisés · qualité des données · niveau réel</div></div></header>
  <section class="assessment-hero">
    <div><div class="kicker">Centre d’évaluation KINETIK</div><h1>${coverage.verifiedPct}% vérifié</h1><p>${coverage.tested}/${coverage.total} repères renseignés · ${coverage.verified} validés avec un protocole KINETIK.</p></div>
    <div class="assessment-evidence-scale"><div><span>1</span><strong>Déclaré</strong><small>utile comme point de départ</small></div><div><span>2</span><strong>Séance</strong><small>observé dans l’entraînement</small></div><div><span>3</span><strong>KINETIK</strong><small>protocole standardisé</small></div></div>
  </section>

  <section class="assessment-next">
    <div class="assessment-section-head"><div><div class="kicker">Bilan recommandé</div><h2>${recommended.length} tests prioritaires</h2></div><p>Priorité calculée à partir de ton objectif, du prochain rang et de la fraîcheur des données.</p></div>
    <div class="assessment-recommended">${recommended.map((p,i)=>`<button data-assessment-start="${p.id}"><span>0${i+1}</span><div><strong>${esc(p.name)}</strong><small>${p.current.value?`${p.current.value} ${p.unit} · ${evidenceInfo(p.evidence).short}`:"Pas encore évalué"}</small></div><b>≈ ${p.duration} min</b></button>`).join("")}</div>
  </section>

  ${next?`<section class="assessment-rank-link rank-${rank.current.id}"><div><div class="kicker">Fiabilité du rang</div><h2>${rank.displayName} → ${next.name}</h2><p>Pour les rangs élevés, certains barèmes doivent désormais être confirmés par une séance ou un protocole KINETIK.</p></div><button class="btn btn-secondary compact" data-view="skills">Voir les exigences</button></section>`:""}

  <section class="assessment-categories">
    <div class="assessment-section-head"><div><div class="kicker">Batterie complète</div><h2>Choisir une capacité</h2></div></div>
    <div class="assessment-category-tabs"><button class="${cat==="all"?"active":""}" data-assessment-category="all">Tout</button>${ASSESSMENT_CATEGORIES.map(c=>`<button class="${cat===c.id?"active":""}" data-assessment-category="${c.id}">${c.label}</button>`).join("")}</div>
    <div class="assessment-category-list">${ASSESSMENT_CATEGORIES.filter(c=>cat==="all"||cat===c.id).map(c=>{const s=assessmentCategoryStatus(c.id);return `<details class="assessment-category" ${cat===c.id?"open":""}><summary><div><strong>${c.label}</strong><span>${c.description}</span></div><div class="assessment-category-score"><b>${s.tested}/${s.total}</b><small>${s.verified} vérifiés</small></div></summary><div class="assessment-category-body">${c.id==="mobility"?renderMobilityAssessmentRows():ASSESSMENT_PROTOCOLS.filter(p=>p.category===c.id).map(renderAssessmentProtocolRow).join("")}</div></details>`}).join("")}</div>
  </section>

  <section class="assessment-method"><div><div class="kicker">Principe</div><h2>Le chiffre ne suffit pas</h2><p>Les rangs et Capacités utilisent toujours la performance réelle, mais KINETIK connaît maintenant la qualité de la preuve. Un athlète expérimenté peut donc progresser immédiatement dans les rangs en passant les barèmes, sans attendre des mois d’utilisation.</p></div><div><strong>Déclaré</strong><span>Saisie ou série libre</span><strong>Séance</strong><span>Performance observée pendant un entraînement</span><strong>Test KINETIK</strong><span>Protocole reproductible et critères respectés</span></div></section>`, "progress");
}
function renderAssessmentEditor(){
  const p=assessmentProtocol(state.assessmentEditor);if(!p)return renderAssessmentCenter();
  const last=assessmentLatest(p.id),current=protocolCurrent(p);
  return shell(`<header class="topbar assessment-editor-top"><div><button class="back-btn" id="closeAssessment">← Évaluation</button><div class="daylabel">Protocole standardisé</div></div></header>
  <section class="assessment-editor">
    <div class="assessment-editor-head"><div><div class="kicker">${p.category} · ≈ ${p.duration} min</div><h1>${esc(p.name)}</h1><p>${p.targetLabel} · ${p.unit}</p></div>${evidenceMark(current.evidence)}</div>
    <div class="assessment-protocol">
      <div><span>01</span><section><h3>Préparation</h3>${p.warmup.map(x=>`<p>${esc(x)}</p>`).join("")}</section></div>
      <div><span>02</span><section><h3>Critères de validité</h3>${p.criteria.map(x=>`<p>${esc(x)}</p>`).join("")}</section></div>
      <div><span>03</span><section><h3>Fin du test</h3><p>${esc(p.stop)}</p></section></div>
    </div>
    <div class="assessment-result">
      <div><div class="kicker">Résultat</div><h2>${last?"Nouveau test":"Première référence"}</h2></div>
      <label><span>${p.targetLabel}</span><div class="assessment-big-input"><input id="assessmentValue" type="number" inputmode="decimal" min="0" step="${p.unit==="reps"?"1":".1"}" value="" placeholder="${current.value||0}"><b>${p.unit}</b></div></label>
      <label class="assessment-check"><input id="assessmentCriteria" type="checkbox"><span><strong>Les critères ci-dessus ont été respectés</strong><small>Sinon, le résultat peut être conservé comme donnée déclarée mais ne sera pas un Test KINETIK.</small></span></label>
      <label class="assessment-check"><input id="assessmentConditions" type="checkbox"><span><strong>Conditions reproductibles</strong><small>Installation, variante et mesure identiques à ce protocole.</small></span></label>
      <label><span>Note <small>optionnel</small></span><textarea id="assessmentNote" rows="3" placeholder="Sensations, matériel, conditions…"></textarea></label>
      <div class="assessment-editor-actions"><button class="btn btn-outline" id="saveAssessmentDeclared">Enregistrer sans validation</button><button class="btn btn-primary" id="saveAssessmentValidated">Valider le Test KINETIK</button></div>
    </div>
    <p class="assessment-safety">Les tests maximaux ne sont jamais obligatoires. Arrête si la technique se dégrade ou en cas de symptôme inhabituel.</p>
  </section>`, "progress");
}
function saveAssessment(validated){
  const p=assessmentProtocol(state.assessmentEditor),el=document.getElementById("assessmentValue");if(!p||!el)return;
  const value=Number(el.value);if(!Number.isFinite(value)||value<=0)return;
  const criteria=document.getElementById("assessmentCriteria")?.checked||false,conditions=document.getElementById("assessmentConditions")?.checked||false;
  if(validated&&(!criteria||!conditions)){alert("Pour valider un Test KINETIK, confirme les critères de mouvement et les conditions reproductibles.");return;}
  const level=validated?3:1,source=validated?"kinetik":"declared",note=document.getElementById("assessmentNote")?.value||"",rows=getAssessments();
  rows.unshift({id:String(Date.now()),date:new Date().toISOString(),protocolId:p.id,category:p.category,kind:p.kind,testId:p.testId||null,exercise:p.exercise||null,value,unit:p.unit,evidenceLevel:level,source,protocolVersion:1,criteria,conditions,note});
  setAssessments(rows.slice(0,1000));
  if(p.kind==="test"&&p.testId){
    const tests=getTests();tests.unshift({id:Date.now()+1,date:new Date().toISOString(),testId:p.testId,value,note,source});setTests(tests.slice(0,500));
  }
  state.assessmentEditor=null;state.view="assessment";render();
}

/* Assessment evidence participates in current performances. */
const _performanceDetailsForTestV1050=performanceDetailsForTest;
performanceDetailsForTest=function(id){
  const old=_performanceDetailsForTestV1050(id),a=assessmentBestForTest(id);
  const candidate=a?{value:Number(a.value||0),date:a.date,source:evidenceInfo(a.evidenceLevel).label,exercise:null,evidence:Number(a.evidenceLevel||0)}:{value:0,evidence:0};
  const oldEvidence=assessmentEvidenceForTest(id);
  return [candidate,{...old,evidence:oldEvidence}].sort((x,y)=>Number(y.value||0)-Number(x.value||0)||Number(y.evidence||0)-Number(x.evidence||0))[0];
};
const _bestExerciseValueV1050=bestExerciseValue;
bestExerciseValue=function(name){
  const a=assessmentBestForExercise(name);
  return Math.max(Number(_bestExerciseValueV1050(name)||0),Number(a?.value||0));
};

/* Upper ranks require stronger evidence, never account age or tenure. */
["diamond","master","legend"].forEach(id=>{
  const rule=KINETIK_RANK_RULES[id];if(!rule)return;
  (rule.proofs||[]).forEach(p=>{if(p.kind==="test"||p.kind==="exercise")p.evidenceMin=id==="diamond"?2:3;});
});
function rankProofEvidenceLevel(proof){
  if(proof.kind==="test")return assessmentEvidenceForTest(proof.id);
  if(proof.kind==="exercise")return assessmentEvidenceForExercise(proof.name);
  return proof.kind==="skill"&&skillDoneSafe(proof.id)?2:0;
}
rankGateRows=function(rank){
  const rule=rankRuleFor(rank),caps=capabilityScores(),capMap=Object.fromEntries(caps.map(x=>[x.id,x])),skillPoints=technicalSkillPoints(),mastery=masterySkillCount(),majorMastery=majorMasterySkillCount();
  const avg=Math.round(caps.reduce((s,x)=>s+(x.assessed?x.score:0),0)/Math.max(1,caps.length)),rows=[];
  if(rule.avg)rows.push({id:"avg",label:"Moyenne des 6 capacités",current:avg,target:rule.avg,unit:"/100",detail:"les capacités non évaluées comptent comme 0"});
  Object.entries(rule.caps||{}).forEach(([id,target])=>rows.push({id:`cap-${id}`,label:capMap[id]?.label||id,current:capMap[id]?.assessed?capMap[id].score:0,target,unit:"/100",detail:capMap[id]?.assessed?capMap[id].detail:"non évalué"}));
  (rule.proofs||[]).forEach((proof,i)=>{
    const current=rankProofValue(proof),ev=rankProofEvidenceLevel(proof),minEv=Number(proof.evidenceMin||0),valueDone=current>=Number(proof.value||1),evidenceDone=!minEv||ev>=minEv;
    rows.push({id:`proof-${i}-${proof.kind}`,label:proof.label,current,target:Number(proof.value||1),unit:proof.unit||"",detail:minEv?`${evidenceInfo(ev).label} · preuve requise : ${evidenceInfo(minEv).label}`:(proof.kind==="skill"?"validation technique requise":"barème de performance"),forceDone:valueDone&&evidenceDone,evidence:ev,evidenceMin:minEv});
  });
  if(rule.skillPoints)rows.push({id:"skills",label:"Difficulté technique cumulée",current:skillPoints,target:rule.skillPoints,unit:"pts"});
  if(rule.mastery)rows.push({id:"mastery",label:"Skills de maîtrise",current:mastery,target:rule.mastery,unit:""});
  if(rule.majorMastery)rows.push({id:"major-mastery",label:"Skills majeurs de maîtrise",current:majorMastery,target:rule.majorMastery,unit:"",detail:"Muscle-up avancé · HSPU libre · Front lever · Human flag"});
  return rows.map(x=>{const valueProgress=clamp(Number(x.current)/Math.max(1,Number(x.target)),0,1),evidenceProgress=x.evidenceMin?clamp(Number(x.evidence||0)/Number(x.evidenceMin),0,1):1,done=x.forceDone!==undefined?x.forceDone:Number(x.current)>=Number(x.target);return {...x,done,progress:Math.min(valueProgress,evidenceProgress)};});
};

/* Integrate the center into existing screens. */
const _renderMoreV1050=renderMore;
renderMore=function(){
  let html=_renderMoreV1050();
  const marker='<button data-view="skills"><span>${uiIcon(\'skills\')}</span><div><strong>Capacités</strong><small>Skills, performances et rang</small></div><b>→</b></button>';
  if(html.includes(marker))html=html.replace(marker,marker+`<button data-view="assessment"><span>${uiIcon("award")}</span><div><strong>Centre d’évaluation</strong><small>Tests standardisés et qualité des données</small></div><b>→</b></button>`);
  return html;
};
const _renderSkillsV1050=renderSkills;
renderSkills=function(){
  let html=_renderSkillsV1050();
  const marker='<section class="cap-profile-section">';
  if(html.includes(marker))html=html.replace(marker,`<section class="skills-assessment-link"><div><div class="kicker">Qualité des données</div><strong>Valider mes performances</strong><span>Les rangs élevés demandent des preuves plus solides.</span></div><button class="btn btn-outline compact" data-view="assessment">Centre d’évaluation</button></section>${marker}`);
  return html;
};
const _renderProgressOverviewV1050=renderProgressOverview;
renderProgressOverview=function(){
  let html=_renderProgressOverviewV1050(),c=assessmentCoverage(),card=`<section class="assessment-progress-link"><div><div class="kicker">Évaluation</div><h3>${c.verifiedPct}% de la batterie vérifiée</h3><p>${c.verified} protocoles KINETIK validés · ${c.tested}/${c.total} repères renseignés.</p></div><button class="btn btn-outline compact" data-view="assessment">Évaluer →</button></section>`;
  const marker='<section class="card adaptive-report';
  const i=html.indexOf(marker);return i>=0?html.slice(0,i)+card+html.slice(i):html+card;
};
const _renderTodayUsefulActionsV1050=renderTodayUsefulActions;
renderTodayUsefulActions=function(){
  let html=_renderTodayUsefulActionsV1050();
  html=html.replace(/<button class="progress-watch-item today-progress-link" data-today-progress="performance"><span class="progress-watch-icon">◷<\/span><div><strong>Tests périodiques<\/strong><small>(.*?)<\/small><\/div><b>Ouvrir →<\/b><\/button>/,`<button class="progress-watch-item" data-view="assessment"><span class="progress-watch-icon">◷</span><div><strong>Centre d’évaluation</strong><small>$1</small></div><b>Évaluer →</b></button>`);
  return html;
};

/* Event layer */
const _bindEventsV1050=bindEvents;
bindEvents=function(){
  _bindEventsV1050();
  document.querySelectorAll("[data-assessment-start]").forEach(b=>b.onclick=()=>{state.assessmentEditor=b.dataset.assessmentStart;render();});
  document.querySelectorAll("[data-assessment-category]").forEach(b=>b.onclick=()=>{state.assessmentCategory=b.dataset.assessmentCategory;render();});
  const close=document.getElementById("closeAssessment");if(close)close.onclick=()=>{state.assessmentEditor=null;state.view="assessment";render();};
  const sd=document.getElementById("saveAssessmentDeclared");if(sd)sd.onclick=()=>saveAssessment(false);
  const sv=document.getElementById("saveAssessmentValidated");if(sv)sv.onclick=()=>saveAssessment(true);
};


/* ========================================================================== */
/* V10.60 · Progression Intelligence                                          */
/* Athlete State · limiting factor · readiness · plateau · cross-sport coach  */
/* ========================================================================== */

/* Fix evidence lookup for Quick Logs: TEST_GUIDED_EXERCISES stores arrays. */
assessmentEvidenceForTest=function(testId){
  const a=assessmentBestForTest(testId),names=TEST_GUIDED_EXERCISES[testId]||[];
  const guided=names.some(name=>Number(bestMetricDetails(getHistory(),name)?.value||0)>0)?2:0;
  const quick=names.some(name=>Number(bestQuickMetricDetails(name)?.value||0)>0)?1:0;
  const legacy=getTests().filter(x=>x.testId===testId).reduce((m,x)=>Math.max(m,x.source==='kinetik'?3:x.source==='workout'?2:1),0);
  return Math.max(Number(a?.evidenceLevel||0),guided,quick,legacy);
};

function v1060DateMs(x){const n=new Date(x||0).getTime();return Number.isFinite(n)?n:0;}
function v1060MetricEvents(rx){
  const rows=[];
  getHistory().forEach(s=>(s.entries||[]).forEach(e=>{if(rx.test(String(e.exercise||'')))rows.push({date:s.date,value:Number(e.value||0),source:'workout',rpe:Number(s.rpe||0),rir:Number(s.reviewRir??NaN),technique:Number(s.reviewTechnique||0),discomfort:!!s.jointDiscomfort});}));
  getQuickLogs().forEach(q=>{const n=String(q.exercise||q.name||'');if(rx.test(n))rows.push({date:q.date,value:Number(q.value||0),source:'declared'});});
  getAssessments().forEach(a=>{const n=String(a.exercise||assessmentProtocol(a.protocolId)?.name||'');if(rx.test(n))rows.push({date:a.date,value:Number(a.value||0),source:'assessment',evidence:Number(a.evidenceLevel||0)});});
  getTests().forEach(x=>{const d=TEST_DEFS.find(t=>t.id===x.testId);if(d&&rx.test(String(d.name||'')))rows.push({date:x.date,value:Number(x.value||0),source:x.source||'declared',evidence:x.source==='kinetik'?3:x.source==='workout'?2:1});});
  return rows.filter(x=>x.value>0&&v1060DateMs(x.date)).sort((a,b)=>v1060DateMs(a.date)-v1060DateMs(b.date));
}
function v1060BestPeriod(rx,days=30,offsetDays=0){
  const end=Date.now()-offsetDays*86400000,start=end-days*86400000,rows=v1060MetricEvents(rx).filter(x=>{const d=v1060DateMs(x.date);return d>=start&&d<end;});
  return rows.length?Math.max(...rows.map(x=>x.value)):0;
}
function v1060TrendLabel(cur,prev,step=1){
  if(!cur&&!prev)return {id:'unknown',label:'À mesurer',symbol:'—'};
  if(cur&&!prev)return {id:'baseline',label:'Référence créée',symbol:'•'};
  const d=cur-prev;
  if(d>=step)return {id:'up',label:'En progression',symbol:'↗'};
  if(d<=-step)return {id:'down',label:'En baisse',symbol:'↘'};
  return {id:'stable',label:'Stable',symbol:'→'};
}
function v1060EvidenceLabel(level){
  if(level>=2.5)return {id:'high',label:'Élevée'};
  if(level>=1.5)return {id:'medium',label:'Moyenne'};
  if(level>0)return {id:'low',label:'Faible'};
  return {id:'none',label:'À construire'};
}
function v1060AssessmentQuality(){
  const c=assessmentCoverage(),score=Math.round(c.pct*.4+c.verifiedPct*.6);
  return {score,coverage:c,confidence:v1060EvidenceLabel(score>=75?3:score>=45?2:score>0?1:0)};
}
function v1060ForceState(days=30){
  const pull=v1060BestPeriod(/tractions strictes|pull.?ups?/i,days,0),pullPrev=v1060BestPeriod(/tractions strictes|pull.?ups?/i,days,days);
  const dips=v1060BestPeriod(/\bdips?\b/i,days,0),dipsPrev=v1060BestPeriod(/\bdips?\b/i,days,days);
  const p=v1060TrendLabel(pull,pullPrev,1),d=v1060TrendLabel(dips,dipsPrev,1);
  let trend=p.id==='up'||d.id==='up'?{id:'up',label:'En progression',symbol:'↗'}:(p.id==='unknown'&&d.id==='unknown'?{id:'unknown',label:'À mesurer',symbol:'—'}:{id:'stable',label:'Stable',symbol:'→'});
  const evidence=Math.max(assessmentEvidenceForTest('pullups'),assessmentEvidenceForTest('dips'));
  return {id:'force',label:'Force',value:trend.label,symbol:trend.symbol,tone:trend.id,detail:pull||d?`${pull||'—'} tractions · ${dips||'—'} dips`:'Aucune référence',confidence:v1060EvidenceLabel(evidence)};
}
function v1060SkillsState(){
  const tree=primarySkillTree(),p=skillTreeProgress(tree),recent=getAssessments().filter(x=>x.category==='skills'&&Date.now()-v1060DateMs(x.date)<=30*86400000);
  const value=p.pct>=75?'Avancé':p.pct>=40?'En construction':p.pct>0?'Fondations':'À évaluer';
  return {id:'skills',label:'Skills',value,symbol:recent.length?'↗':p.pct?'→':'—',tone:recent.length?'up':p.pct?'stable':'unknown',detail:`${tree.name} · ${p.pct}%`,confidence:v1060EvidenceLabel(recent.reduce((m,x)=>Math.max(m,Number(x.evidenceLevel||0)),0))};
}
function v1060MobilityTrend(){
  const deltas=[];
  for(const def of MOBILITY_TESTS.filter(x=>x.score!==false)){
    const rows=getMobilityTests().filter(x=>x.testId===def.id).sort((a,b)=>v1060DateMs(a.date)-v1060DateMs(b.date));
    if(rows.length<2)continue;
    const a=mobilityTestScore(def,rows[rows.length-2].value),b=mobilityTestScore(def,rows[rows.length-1].value);
    if(a!=null&&b!=null)deltas.push(b-a);
  }
  const profiles=mobilityProfiles(),assessed=profiles.filter(x=>x.assessed),avg=assessed.length?Math.round(assessed.reduce((s,x)=>s+x.score,0)/assessed.length):null,delta=deltas.length?deltas.reduce((s,x)=>s+x,0)/deltas.length:null;
  const trend=delta==null?(avg!=null?{id:'stable',label:'Référence créée',symbol:'•'}:{id:'unknown',label:'À évaluer',symbol:'—'}):delta>=3?{id:'up',label:'En progression',symbol:'↗'}:delta<=-3?{id:'down',label:'À surveiller',symbol:'↘'}:{id:'stable',label:'Stable',symbol:'→'};
  const complete=profiles.filter(x=>x.complete).length;
  return {id:'mobility',label:'Mobilité',value:trend.label,symbol:trend.symbol,tone:trend.id,detail:avg==null?'Aucune évaluation':`${avg}/100 · ${assessed.length}/${profiles.length} zones`,confidence:v1060EvidenceLabel(complete>=4?2:assessed.length?1:0)};
}
function v1060CardioState(days=30){
  const cooper=getAssessments().filter(x=>x.protocolId==='cooper12').sort((a,b)=>v1060DateMs(a.date)-v1060DateMs(b.date));
  const run5=getAssessments().filter(x=>x.protocolId==='run5k').sort((a,b)=>v1060DateMs(a.date)-v1060DateMs(b.date));
  let trend={id:'unknown',label:'À évaluer',symbol:'—'},detail='Aucun test cardio',evidence=0;
  if(cooper.length){const cur=Number(cooper.at(-1).value||0),prev=Number(cooper.at(-2)?.value||0);trend=v1060TrendLabel(cur,prev,50);detail=`12 min · ${cur} m`;evidence=Number(cooper.at(-1).evidenceLevel||0);}
  else if(run5.length){const cur=Number(run5.at(-1).value||0),prev=Number(run5.at(-2)?.value||0);trend=prev?(cur<=prev-.2?{id:'up',label:'En progression',symbol:'↗'}:Math.abs(cur-prev)<.2?{id:'stable',label:'Stable',symbol:'→'}:{id:'down',label:'À surveiller',symbol:'↘'}):{id:'baseline',label:'Référence créée',symbol:'•'};detail=`5 km · ${cur} min`;evidence=Number(run5.at(-1).evidenceLevel||0);}
  else {
    const start=Date.now()-days*86400000,acts=getActivities().filter(a=>v1060DateMs(a.date)>=start&&['running','cycling','swimming','rowing','crossfit','hyrox','sport'].includes(a.type));
    if(acts.length)trend={id:'baseline',label:'Actif',symbol:'•'},detail=`${acts.length} activité${acts.length>1?'s':''} / ${days} j`,evidence=1;
  }
  return {id:'cardio',label:'Cardio',value:trend.label,symbol:trend.symbol,tone:trend.id,detail,confidence:v1060EvidenceLabel(evidence)};
}
function v1060LoadState(){
  const cur=trainingWindowStats(Date.now()-7*86400000,Date.now()),prev=trainingWindowStats(Date.now()-14*86400000,Date.now()-7*86400000),delta=prev.sportLoad?Math.round((cur.sportLoad-prev.sportLoad)/prev.sportLoad*100):null;
  const tone=delta==null?'unknown':delta>35?'warn':delta<-25?'down':'stable';
  return {id:'load',label:'Charge',value:delta==null?'Référence en cours':`${delta>=0?'+':''}${delta}%`,symbol:delta==null?'—':delta>25?'↗':delta<-15?'↘':'→',tone,detail:`${cur.sportLoad.toLocaleString('fr-FR')} UA · 7 j`,delta,current:cur,previous:prev,confidence:v1060EvidenceLabel(cur.sessions>=3?2:cur.sessions?1:0)};
}
function v1060AthleteState(days=30){
  const q=v1060AssessmentQuality();
  return {
    days,
    force:v1060ForceState(days),
    skills:v1060SkillsState(),
    mobility:v1060MobilityTrend(),
    cardio:v1060CardioState(days),
    load:v1060LoadState(),
    data:{id:'data',label:'Données',value:`${q.score}%`,symbol:q.score>=70?'✓':'○',tone:q.score>=70?'up':q.score>=35?'stable':'unknown',detail:`${q.coverage.verified} tests KINETIK vérifiés`,confidence:q.confidence}
  };
}

function v1060MobilityFactor(id,label){
  const p=mobilityProfiles().find(x=>x.id===id);
  return {label,score:p?.assessed?p.score:null,detail:p?.assessed?`${p.score}/100${p.complete?'':' · partiel'}`:'Non évalué',confidence:p?.complete?2:p?.assessed?1:0,type:'mobility',id};
}
function v1060TestFactor(label,testId,target){
  const v=Number(performanceValueForTest(testId)||0),e=assessmentEvidenceForTest(testId);
  return {label,score:v?Math.min(100,Math.round(v/target*100)):null,detail:v?`${v} / ${target}`:'Non évalué',confidence:e,type:'test',id:testId};
}
function v1060ExerciseFactor(label,name,target){
  const v=Number(bestExerciseValue(name)||0),e=assessmentEvidenceForExercise(name);
  return {label,score:v?Math.min(100,Math.round(v/target*100)):null,detail:v?`${v} / ${target}`:'Non évalué',confidence:e,type:'exercise',id:name};
}
function v1060CapabilityFactor(label,id,target=70){
  const c=capabilityScores().find(x=>x.id===id);
  return {label,score:c?.assessed?Math.min(100,Math.round(c.score/target*100)):null,detail:c?.assessed?`${c.score}/100 KINETIK`:'Non évalué',confidence:c?.assessed?1:0,type:'capability',id};
}
function v1060GoalFactors(){
  const g=String(getAthleteProfile().primaryGoal||'').toLowerCase();
  if(/muscle.?up/.test(g))return [
    v1060TestFactor('Force de tirage','pullups',10),
    v1060ExerciseFactor('Tirage haut','Chest-to-bar',5),
    v1060CapabilityFactor('Explosivité','explosive',60),
    v1060TestFactor('Poussée / dips','dips',12),
    v1060TestFactor('Grip de base','dead_hang',60),
    v1060MobilityFactor('shoulders','Mobilité épaules')
  ];
  if(/handstand|hspu/.test(g))return [
    v1060TestFactor('Base inversée','wall_handstand',60),
    v1060ExerciseFactor('Équilibre libre','Handstand libre',30),
    v1060MobilityFactor('wrists','Extension poignets'),
    v1060MobilityFactor('shoulders','Flexion épaules'),
    v1060CapabilityFactor('Poussée verticale','push',60)
  ];
  if(/l.?sit/.test(g))return [
    v1060CapabilityFactor('Core','core',60),
    v1060MobilityFactor('posterior','Chaîne postérieure'),
    v1060MobilityFactor('hips','Hanches'),
    v1060ExerciseFactor('L-sit','L-sit',20)
  ];
  if(/front lever/.test(g))return [
    v1060CapabilityFactor('Tirage','pull',70),
    v1060CapabilityFactor('Core','core',60),
    v1060CapabilityFactor('Grip','grip',60),
    v1060ExerciseFactor('Front lever','Front lever',10)
  ];
  if(/human flag/.test(g))return [
    v1060CapabilityFactor('Tirage','pull',65),
    v1060CapabilityFactor('Poussée','push',65),
    v1060CapabilityFactor('Core','core',60),
    v1060CapabilityFactor('Équilibre','balance',55),
    v1060ExerciseFactor('Human flag','Human flag',10)
  ];
  const caps=capabilityScores().filter(x=>x.assessed).map(x=>({label:x.label,score:x.score,detail:`${x.score}/100 KINETIK`,confidence:1,type:'capability',id:x.id}));
  return caps;
}
function v1060GoalLimiter(){
  const factors=v1060GoalFactors(),known=factors.filter(x=>x.score!=null),missing=factors.filter(x=>x.score==null);
  const limiter=known.sort((a,b)=>a.score-b.score)[0]||null;
  const evidence=known.length?known.reduce((s,x)=>s+Number(x.confidence||0),0)/known.length:0;
  return {limiter,missing,factors,confidence:v1060EvidenceLabel(evidence)};
}

function v1060RecentExternalSport(hours=30){
  const start=Date.now()-hours*3600000,rows=getActivities().filter(a=>v1060DateMs(a.date)>=start&&a.type!=='mobility'),load=rows.reduce((s,a)=>s+activityInternalLoad(a),0),maxRpe=rows.reduce((m,a)=>Math.max(m,Number(a.rpe||0)),0),minutes=rows.reduce((s,a)=>s+Number(a.duration||0),0);
  const hard=rows.some(a=>Number(a.rpe||0)>=8&&Number(a.duration||0)>=45)||load>=450;
  const elevated=!hard&&(load>=300||rows.some(a=>Number(a.rpe||0)>=7&&Number(a.duration||0)>=60));
  return {rows,load,maxRpe,minutes,mode:hard?'high':elevated?'elevated':'normal'};
}
function v1060ReadinessState(){
  const ext=v1060RecentExternalSport(),load=v1060LoadState(),recentStrength=getHistory().filter(s=>Date.now()-v1060DateMs(s.date)<=72*3600000).slice(0,3);
  const avgRpe=recentStrength.length?recentStrength.reduce((s,x)=>s+Number(x.rpe||0),0)/recentStrength.length:0,avgTech=recentStrength.filter(x=>x.reviewTechnique).length?recentStrength.filter(x=>x.reviewTechnique).reduce((s,x)=>s+Number(x.reviewTechnique||0),0)/recentStrength.filter(x=>x.reviewTechnique).length:null;
  const reasons=[];let score=0;
  if(ext.mode==='high'){score+=2;reasons.push(`${ext.minutes} min de sport externe récent · charge ${ext.load} UA`);}
  else if(ext.mode==='elevated'){score+=1;reasons.push(`activité externe soutenue dans les ${30} dernières heures`);}
  if(load.delta!=null&&load.delta>35){score+=1;reasons.push(`charge 7 j en hausse de ${load.delta}%`);}
  if(avgRpe>=8){score+=1;reasons.push(`RPE récent élevé (${avgRpe.toFixed(1)})`);}
  if(avgTech!=null&&avgTech<3.5){score+=1;reasons.push(`qualité technique récente moyenne (${avgTech.toFixed(1)}/5)`);}
  if(recentStrength.some(x=>x.jointDiscomfort)){score+=1;reasons.push('gêne signalée sur une séance récente');}
  const mode=score>=3?'reduced':score>=1?'prudent':'good';
  return {mode,label:mode==='reduced'?'Allégée':mode==='prudent'?'Prudente':'Bonne',reasons:reasons.length?reasons:['charge et retours récents compatibles avec le programme'],external:ext,load,avgRpe,avgTech};
}
function v1060GoalPriorityRegex(){
  const g=String(getAthleteProfile().primaryGoal||'').toLowerCase();
  if(/muscle.?up/.test(g))return /tractions strictes|chest-to-bar|traction.*explos|muscle.?up/i;
  if(/handstand|hspu/.test(g))return /handstand|hspu|pike push/i;
  if(/l.?sit/.test(g))return /l.?sit|hanging knee|toes-to-bar|hollow/i;
  if(/front lever/.test(g))return /front lever|tractions strictes|row/i;
  if(/human flag/.test(g))return /human flag|side plank|tractions|dips/i;
  return /$a/;
}
function v1060MultisportAdjustment(){
  const r=v1060ReadinessState(),ext=r.external;
  if(ext.mode!=='high')return {mode:ext.mode==='elevated'?'note':'normal',label:ext.mode==='elevated'?'Charge externe à considérer':'Aucune adaptation multisport',reason:ext.mode==='elevated'?`Sport externe récent : ${ext.minutes} min · ${ext.load} UA.`:'',setFactor:1};
  return {mode:'reduce-accessories',label:'Accessoires légèrement réduits',reason:`Sport externe intense dans les 30 dernières heures : ${ext.minutes} min · ${ext.load} UA. Les mouvements prioritaires restent inchangés.`,setFactor:.8};
}
const _preparedWorkoutV1060=preparedWorkout;
preparedWorkout=function(day,readiness=null,sessionLength="full"){
  const w=_preparedWorkoutV1060(day,readiness,sessionLength);
  if(Number(day)!==Number(todayDay())||sessionLength==='short'||!w?.exercises?.length)return w;
  if(readiness&&readinessPlan(readiness).mode!=='normal')return w;
  const a=v1060MultisportAdjustment();if(a.mode!=='reduce-accessories'){w.coachAdaptation=a;return w;}
  const keep=v1060GoalPriorityRegex();let mainSeen=0,changed=0;
  w.exercises=w.exercises.map(e=>{
    if((e.phase||'main')!=='main'||e.type==='timer')return e;
    mainSeen++;
    if(mainSeen<=2||keep.test(String(e.name||''))||Number(e.sets||0)<3)return e;
    changed++;return {...e,sets:Math.max(2,Number(e.sets||1)-1),coachAdjusted:true,prescriptionStatus:e.prescriptionStatus==='progress'?'maintain':e.prescriptionStatus,prescriptionNote:`${e.prescriptionNote||''}${e.prescriptionNote?' · ':''}1 série retirée après charge multisport élevée.`};
  });
  if(changed){w.duration=Math.max(20,Number(w.duration||45)-changed*3);w.coachAdaptation={...a,changed};}
  return w;
};

function v1060PlateauCandidate(){
  const g=String(getAthleteProfile().primaryGoal||'').toLowerCase();
  const candidates=/muscle.?up|front lever/.test(g)?['Tractions strictes','Chest-to-bar']:/handstand|hspu/.test(g)?['Handstand libre','Dips']:/l.?sit/.test(g)?['L-sit','Hanging knee raises']:/human flag/.test(g)?['Tractions strictes','Dips']:['Tractions strictes','Dips'];
  for(const name of candidates){
    const sessions=exerciseSessions(name,20).filter(x=>Date.now()-v1060DateMs(x.session.date)<=56*86400000).sort((a,b)=>v1060DateMs(a.session.date)-v1060DateMs(b.session.date));
    if(sessions.length<5)continue;
    const span=v1060DateMs(sessions.at(-1).session.date)-v1060DateMs(sessions[0].session.date);if(span<21*86400000)continue;
    const best=s=>Math.max(...s.entries.map(e=>Number(e.value||0))),half=Math.floor(sessions.length/2),first=Math.max(...sessions.slice(0,half).map(best)),last=Math.max(...sessions.slice(half).map(best));
    const recent=sessions.slice(-3),rir=recent.map(x=>Number(x.session.reviewRir)).filter(Number.isFinite),tech=recent.map(x=>Number(x.session.reviewTechnique)).filter(Number.isFinite),goodMargin=rir.length>=2&&rir.reduce((a,b)=>a+b,0)/rir.length>=2,goodTech=tech.length>=2&&tech.reduce((a,b)=>a+b,0)/tech.length>=4,noPain=recent.every(x=>!x.session.jointDiscomfort);
    if(last<=first*1.03&&goodMargin&&goodTech&&noPain)return {name,first,last,weeks:Math.round(span/604800000),reason:`${name} stable sur ~${Math.round(span/604800000)} semaines malgré une marge et une technique correctes.`};
  }
  return null;
}
function v1060BodySignal(days=90){
  const rows=getBodyLogs().filter(x=>Date.now()-v1060DateMs(x.date)<=days*86400000).sort((a,b)=>v1060DateMs(a.date)-v1060DateMs(b.date));
  if(rows.length<2)return null;
  const first=rows[0],last=rows.at(-1),w0=Number(first.weight),w1=Number(last.weight),wa0=Number(first.waist),wa1=Number(last.waist);
  if(![w0,w1,wa0,wa1].every(Number.isFinite))return null;
  const dw=w1-w0,dwa=wa1-wa0,force=v1060ForceState(Math.min(days,45));
  if(Math.abs(dw)<=1.5&&dwa<=-1.5&&force.tone==='up')return {id:'recomp',label:'Recomposition possible',detail:`Poids ${dw>=0?'+':''}${dw.toFixed(1)} kg · tour de taille ${dwa.toFixed(1)} cm · force en progression.`};
  if(dw>0&&dw<=2.5&&dwa<=0&&force.tone==='up')return {id:'recomp',label:'Évolution corporelle favorable possible',detail:`Poids +${dw.toFixed(1)} kg, tour de taille stable/en baisse et performances en hausse.`};
  return null;
}
function v1060NextBestChoice(){
  const readiness=v1060ReadinessState(),lim=v1060GoalLimiter(),plateau=v1060PlateauCandidate(),quality=v1060AssessmentQuality();
  if(readiness.mode==='reduced')return {id:'recover',label:'Respecter la séance allégée',detail:readiness.reasons[0]||'Charge récente élevée.',action:'today'};
  const importantMissing=lim.missing.find(x=>x.type==='test'||x.type==='exercise'||x.type==='mobility');
  if(importantMissing&&quality.score<70)return {id:'assess',label:`Évaluer ${importantMissing.label.toLowerCase()}`,detail:'Cette donnée manque pour confirmer le facteur limitant de ton objectif.',action:'assessment'};
  if(plateau)return {id:'plateau',label:`Revoir la progression · ${plateau.name}`,detail:plateau.reason,action:'performance'};
  if(lim.limiter&&lim.limiter.score<55)return {id:'focus',label:`Prioriser ${lim.limiter.label.toLowerCase()}`,detail:`C’est actuellement la dimension la moins avancée parmi les facteurs mesurés de ton objectif.`,action:'today'};
  return {id:'continue',label:'Continuer le cycle actuel',detail:'Aucun signal enregistré ne justifie actuellement un changement important du programme.',action:'today'};
}
function v1060PrimaryExerciseDecision(){
  const w=preparedWorkout(todayDay()),keep=v1060GoalPriorityRegex();
  const mains=(w.exercises||[]).filter(e=>(e.phase||'main')==='main'&&e.type!=='timer');
  const e=mains.find(x=>keep.test(String(x.name||'')))||mains[0]||null;
  if(!e)return {workout:w,exercise:null,label:'Recovery / mobilité',detail:'Aucune séance de force planifiée aujourd’hui.'};
  const status=e.prescriptionStatus==='progress'?'Progression':e.prescriptionStatus==='recover'?'Allégé':e.prescriptionStatus==='maintain'?'Maintien':'Prescription';
  return {workout:w,exercise:e,label:`${status} · ${e.name}`,detail:e.prescriptionNote||`${e.sets} × ${e.target} prévu aujourd’hui.`};
}
function v1060InsightDecision(days=30){
  const s=v1060AthleteState(days),r=v1060ReadinessState(),lim=v1060GoalLimiter(),plateau=v1060PlateauCandidate(),body=v1060BodySignal(),next=v1060NextBestChoice();
  let title='Progression en construction',tone='neutral',text=next.detail;
  if(r.mode==='reduced'){title='Charge récente à absorber';tone='warn';text='KINETIK conserve les mouvements prioritaires mais réduit les accessoires lorsque la charge multisport récente est élevée.';}
  else if(plateau){title='Progression ralentie détectée';tone='warn';text=plateau.reason;}
  else if(s.force.tone==='up'&&s.load.delta!=null&&s.load.delta<=25){title='Progression cohérente';tone='good';text='Les performances de force progressent sans hausse rapide de la charge sportive enregistrée.';}
  else if(s.load.delta!=null&&s.load.delta>35){title='Charge en hausse rapide';tone='warn';text=`La charge sportive des 7 derniers jours est ${s.load.delta}% au-dessus des 7 jours précédents. Ce signal sert à ajuster le volume, pas à prédire une blessure.`;}
  else if(lim.limiter){title=`Priorité · ${lim.limiter.label}`;tone='neutral';text=`${lim.limiter.detail}. ${lim.missing.length?'Certaines dimensions restent à évaluer.':'Les principaux facteurs de ton objectif sont renseignés.'}`;}
  return {title,tone,text,state:s,readiness:r,limiter:lim,plateau,body,next};
}
function renderV1060StateItem(x){
  return `<div class="athlete-state-item ${x.tone||''}"><div><span>${x.label}</span><strong>${x.symbol} ${x.value}</strong></div><small>${esc(x.detail)}</small></div>`;
}
renderAdaptiveReport=function(){
  const days=state.reportPeriod==='90d'?90:30,i=v1060InsightDecision(days),s=i.state,lim=i.limiter.limiter,conf=i.limiter.confidence;
  return `<section class="card adaptive-report intelligence-report ${i.tone}">
    <div class="section-head"><div><div class="kicker">Lecture KINETIK</div><h2>${i.title}</h2></div><div class="report-tabs"><button data-report-period="30d" class="${days===30?'active':''}">30 j</button><button data-report-period="90d" class="${days===90?'active':''}">90 j</button></div></div>
    <p class="intelligence-lead">${i.text}</p>
    <div class="athlete-state-grid">${[s.force,s.skills,s.mobility,s.cardio,s.load,s.data].map(renderV1060StateItem).join('')}</div>
    <div class="intelligence-lower">
      <div class="intelligence-limiter"><span>Facteur limitant · ${esc(getAthleteProfile().primaryGoal||'objectif actuel')}</span><strong>${lim?esc(lim.label):'Données insuffisantes'}</strong><small>${lim?`${esc(lim.detail)} · confiance ${conf.label.toLowerCase()}`:'Passe quelques évaluations pour identifier une priorité crédible.'}</small></div>
      <div class="intelligence-readiness mode-${i.readiness.mode}"><span>Disponibilité estimée</span><strong>${i.readiness.label}</strong><small>${esc(i.readiness.reasons[0]||'')}</small></div>
    </div>
    <div class="next-best-choice"><div><span>Prochain meilleur choix</span><strong>${esc(i.next.label)}</strong><small>${esc(i.next.detail)}</small></div><button class="btn btn-outline compact" ${i.next.action==='assessment'?'data-view="assessment"':i.next.action==='performance'?'data-progress-tab="performance"':'data-view="today"'}>Ouvrir →</button></div>
    ${i.plateau?`<div class="intelligence-signal warn"><strong>Plateau possible</strong><span>${esc(i.plateau.reason)}</span></div>`:''}
    ${i.body?`<div class="intelligence-signal good"><strong>${esc(i.body.label)}</strong><span>${esc(i.body.detail)}</span></div>`:''}
    <p class="muted small">Lecture descriptive basée sur les données KINETIK. La disponibilité et les tendances ne sont ni un diagnostic ni une prédiction de blessure.</p>
  </section>`;
};

function renderTodayCoachStrip(){
  const d=v1060PrimaryExerciseDecision(),r=v1060ReadinessState(),lim=v1060GoalLimiter(),a=d.workout?.coachAdaptation,next=v1060NextBestChoice();
  return `<section class="today-coach-strip mode-${r.mode}">
    <div class="today-coach-main"><div class="kicker">Coach du jour</div><strong>${esc(d.label)}</strong><span>${esc(d.detail)}</span></div>
    <div class="today-coach-side"><span>Disponibilité</span><strong>${r.label}</strong>${a&&a.mode!=='normal'?`<small>${esc(a.label)}</small>`:lim.limiter?`<small>Focus · ${esc(lim.limiter.label)}</small>`:''}</div>
    ${a?.mode==='reduce-accessories'?`<div class="today-coach-adaptation"><span>Adaptation multisport</span><strong>${esc(a.reason)}</strong></div>`:''}
  </section>`;
}
const _renderTodayV1060=renderToday;
renderToday=function(){
  let html=_renderTodayV1060(),marker='<section class="today-cockpit today-primary-actions">';
  return html.includes(marker)?html.replace(marker,renderTodayCoachStrip()+marker):html;
};

const _renderWeekV1060=renderWeek;
renderWeek=function(){
  let html=_renderWeekV1060(),a=v1060MultisportAdjustment(),r=v1060ReadinessState();
  if(a.mode==='normal'&&r.mode==='good')return html;
  const banner=`<section class="planning-coach-banner mode-${r.mode}"><div><div class="kicker">Adaptation du jour</div><strong>${a.mode==='reduce-accessories'?a.label:r.label}</strong><span>${esc(a.reason||r.reasons[0]||'')}</span></div><small>Seule la séance d’aujourd’hui est adaptée automatiquement.</small></section>`;
  const marker='<div class="week-heatmap">';
  return html.includes(marker)?html.replace(marker,banner+marker):html;
};

const _renderSkillsV1060=renderSkills;
renderSkills=function(){
  let html=_renderSkillsV1060(),lim=v1060GoalLimiter(),quality=v1060AssessmentQuality();
  const section=`<section class="cap-intelligence-link"><div><div class="kicker">Lecture objectif</div><strong>${lim.limiter?`Facteur limitant · ${esc(lim.limiter.label)}`:'Facteur limitant à confirmer'}</strong><span>${lim.limiter?`${esc(lim.limiter.detail)} · confiance ${lim.confidence.label.toLowerCase()}`:`${quality.score}% de qualité de données globale`}</span></div><button class="btn btn-outline compact" data-view="assessment">${lim.missing.length?'Compléter les tests':'Vérifier'}</button></section>`;
  const marker='<section class="cap-profile-section">';
  return html.includes(marker)?html.replace(marker,section+marker):html;
};

/* Final event layer for intelligence actions */
const _bindEventsV1060=bindEvents;
bindEvents=function(){
  _bindEventsV1060();
  document.querySelectorAll('.next-best-choice [data-progress-tab]').forEach(b=>b.onclick=()=>{state.view='progress';state.progressTab=b.dataset.progressTab||'performance';render();});
};


/* ========================================================================== */
