/* KINETIK v10.156 · First-install athlete setup. */
STORAGE.onboarding = "kinetik_onboarding_v1";

const KINETIK_ONBOARDING_VERSION = 1;
const KINETIK_ONBOARDING_LAST_STEP = 6;

function onboardingHasExistingUserData(){
  if(localStorage.getItem(STORAGE.athleteProfile))return true;
  return [STORAGE.history,STORAGE.body,STORAGE.tests,STORAGE.quickLogs,STORAGE.activities,STORAGE.mobilityTests]
    .some(key=>Array.isArray(parse(key,[]))&&parse(key,[]).length>0);
}

function onboardingBlankEquipment(){
  return Object.fromEntries(EQUIPMENT_CATALOG.map(item=>[item.id,false]));
}

function onboardingDraftFromProfile({fresh=false}={}){
  const p=getAthleteProfile(),goalPreset=athleteGoalPreset(p.primaryGoal);
  const setup=fresh&&!localStorage.getItem(STORAGE.equipmentSetup)?onboardingBlankEquipment():getEquipmentSetup();
  const preferredDays=fresh?[2,4,6,0]:(p.trainingDays||[]);
  return {
    name:p.name||'',experience:p.experience||'Intermédiaire',age:p.age||'',height:p.height||'',weight:p.weight||'',
    primaryGoalPreset:goalPreset,primaryGoalCustom:goalPreset==='custom'?p.primaryGoal:'',secondaryGoal:p.secondaryGoal||'',goalHorizon:p.goalHorizon||'',targetWeight:p.targetWeight||'',
    trainingDays:preferredDays.length?preferredDays:[2,4,6,0],preferredDuration:fresh?60:p.preferredDuration,
    sessionPreference:p.sessionPreference||'Complet + Express',coachStyle:p.coachStyle||'Équilibré',
    sports:Array.isArray(p.sports)&&p.sports.length?p.sports:['calisthenics'],locations:Array.isArray(p.locations)&&p.locations.length?p.locations:['home'],
    equipment:{...setup},restrictions:typeof getRestrictions==='function'?{...getRestrictions()}:{},
    timedSetPrepSeconds:timedSetPrepSeconds(),notes:p.notes||''
  };
}

function normalizeOnboardingDraft(raw={},options={}){
  const base=onboardingDraftFromProfile(options),draft={...base,...raw};
  draft.trainingDays=[...new Set((Array.isArray(raw.trainingDays)?raw.trainingDays:base.trainingDays).map(Number).filter(day=>day>=0&&day<=6))];
  draft.sports=[...new Set(Array.isArray(raw.sports)?raw.sports:base.sports)];
  draft.locations=[...new Set(Array.isArray(raw.locations)?raw.locations:base.locations)];
  draft.equipment={...base.equipment,...(raw.equipment||{})};
  draft.restrictions={...base.restrictions,...(raw.restrictions||{})};
  return draft;
}

function initialOnboardingWizard(){
  const saved=parse(STORAGE.onboarding,null);
  if(saved?.status==='in_progress')return {step:clamp(Number(saved.step||0),0,KINETIK_ONBOARDING_LAST_STEP),draft:normalizeOnboardingDraft(saved.draft||{}),error:''};
  if(saved?.status)return null;
  if(onboardingHasExistingUserData()){
    save(STORAGE.onboarding,{version:KINETIK_ONBOARDING_VERSION,status:'existing_user',updatedAt:new Date().toISOString()});
    return null;
  }
  return {step:0,draft:onboardingDraftFromProfile({fresh:true}),error:''};
}

Object.assign(state,{onboardingWizard:initialOnboardingWizard()});

function onboardingPersist(status='in_progress'){
  const wizard=state.onboardingWizard;
  save(STORAGE.onboarding,{
    version:KINETIK_ONBOARDING_VERSION,status,step:wizard?.step||0,draft:wizard?.draft||null,updatedAt:new Date().toISOString()
  });
}

function openOnboardingWizard({step=1}={}){
  const saved=parse(STORAGE.onboarding,null),fresh=!onboardingHasExistingUserData();
  state.onboardingWizard={step,draft:normalizeOnboardingDraft(saved?.draft||{}, {fresh}),error:''};
  state.active=null;state.athleteProfileEditor=false;state.view='today';
  onboardingPersist();render();
}

function deferOnboarding(){
  onboardingSyncFromDom();onboardingPersist('deferred');state.onboardingWizard=null;state.view='today';render();
}

function onboardingGoalLabel(draft){
  return draft.primaryGoalPreset==='custom'
    ? String(draft.primaryGoalCustom||'').trim()
    : (ATHLETE_GOALS.find(([id])=>id===draft.primaryGoalPreset)?.[1]||'Progression générale');
}

function onboardingProgress(step){
  const pct=step===0?0:Math.round(step/KINETIK_ONBOARDING_LAST_STEP*100);
  return `<div class="onb-progress" aria-label="Configuration ${pct}% terminée"><span style="width:${pct}%"></span></div>`;
}

function onboardingChoiceButton({active=false,attr='',title='',detail='',icon=''}){
  return `<button type="button" class="onb-choice ${active?'active':''}" ${attr}>${icon?`<b>${icon}</b>`:''}<span><strong>${esc(title)}</strong>${detail?`<small>${esc(detail)}</small>`:''}</span><i>${active?'✓':''}</i></button>`;
}

function renderOnboardingWelcome(){
  return `<div class="onb-welcome"><span class="onb-orbit" aria-hidden="true"></span><div class="onb-kicker">PREMIÈRE CONFIGURATION</div><h1>Ton entraînement.<br><em>Pas un profil générique.</em></h1><p>En quelques choix, KINETIK comprend ton niveau, ton objectif, tes disponibilités et le matériel réellement accessible.</p><div class="onb-promise"><div><strong>≈ 2 min</strong><span>pour personnaliser l’app</span></div><div><strong>Local</strong><span>tes données restent sur cet appareil</span></div><div><strong>Modifiable</strong><span>tout reste éditable dans Profil</span></div></div></div>`;
}

function renderOnboardingIdentity(d){
  const levels=[['Débutant','Je construis mes bases'],['Intermédiaire','Je maîtrise les mouvements de base'],['Avancé','Je travaille des skills exigeants'],['Expert','Je vise des standards très élevés']];
  return `<div class="onb-step"><div class="onb-kicker">01 · POINT DE DÉPART</div><h1>Qui s’entraîne ?</h1><p>Le niveau ajuste le vocabulaire et les repères. Les mesures physiques restent facultatives.</p><label class="onb-field wide"><span>Prénom ou pseudo <b>requis</b></span><input id="onbName" autocomplete="name" value="${esc(d.name)}" placeholder="Ton prénom"></label><div class="onb-choice-grid two">${levels.map(([title,detail])=>onboardingChoiceButton({active:d.experience===title,attr:`data-onb-experience="${title}"`,title,detail})).join('')}</div><div class="onb-field-grid three"><label class="onb-field"><span>Âge <small>optionnel</small></span><input id="onbAge" type="number" inputmode="numeric" min="12" max="100" value="${esc(String(d.age||''))}" placeholder="—"></label><label class="onb-field"><span>Taille <small>cm</small></span><input id="onbHeight" type="number" inputmode="decimal" min="100" max="230" value="${esc(String(d.height||''))}" placeholder="—"></label><label class="onb-field"><span>Poids <small>kg</small></span><input id="onbWeight" type="number" inputmode="decimal" min="30" max="250" step=".1" value="${esc(String(d.weight||''))}" placeholder="—"></label></div></div>`;
}

function renderOnboardingGoal(d){
  const featured=[['muscle-up','Muscle-up','Tirage explosif & transition'],['pullups-10','10 tractions','Force de tirage'],['handstand','Handstand','Équilibre & poussée'],['human-flag','Human Flag','Force latérale'],['weight-loss','Perte de poids','Composition corporelle'],['general','Progression générale','Force, skills & régularité']];
  return `<div class="onb-step"><div class="onb-kicker">02 · MISSION</div><h1>Qu’est-ce qui compte vraiment ?</h1><p>Un seul objectif principal guide les priorités. Tu peux garder une ambition secondaire sans créer deux moteurs concurrents.</p><div class="onb-choice-grid two">${featured.map(([id,title,detail])=>onboardingChoiceButton({active:d.primaryGoalPreset===id,attr:`data-onb-goal="${id}"`,title,detail})).join('')}${onboardingChoiceButton({active:d.primaryGoalPreset==='custom',attr:'data-onb-goal="custom"',title:'Autre objectif',detail:'Définir ma propre cible'})}</div>${d.primaryGoalPreset==='custom'?`<label class="onb-field wide"><span>Ton objectif <b>requis</b></span><input id="onbGoalCustom" value="${esc(d.primaryGoalCustom||'')}" placeholder="Ex. 20 tractions strictes"></label>`:''}<div class="onb-field-grid three"><label class="onb-field"><span>Objectif secondaire <small>optionnel</small></span><input id="onbSecondaryGoal" value="${esc(d.secondaryGoal||'')}" placeholder="Ex. Mobilité"></label><label class="onb-field"><span>Horizon</span><select id="onbGoalHorizon">${['','4 semaines','8 semaines','3 mois','6 mois','12 mois','Progression durable'].map(value=>`<option value="${value}" ${d.goalHorizon===value?'selected':''}>${value||'Sans date précise'}</option>`).join('')}</select></label><label class="onb-field"><span>Poids cible <small>kg, optionnel</small></span><input id="onbTargetWeight" type="number" inputmode="decimal" min="30" max="250" step=".1" value="${esc(String(d.targetWeight||''))}" placeholder="—"></label></div></div>`;
}

function renderOnboardingRhythm(d){
  return `<div class="onb-step"><div class="onb-kicker">03 · RYTHME RÉEL</div><h1>Quand peux-tu vraiment t’entraîner ?</h1><p>Sélectionne tes jours disponibles. KINETIK les enregistre comme ton rythme personnel ; le programme reste ajustable dans Planning.</p><div class="onb-days" aria-label="Jours d’entraînement">${[1,2,3,4,5,6,0].map(day=>`<button type="button" class="${d.trainingDays.includes(day)?'active':''}" data-onb-day="${day}"><span>${athleteDayLabel(day).slice(0,3)}</span><b>${d.trainingDays.includes(day)?'●':'○'}</b></button>`).join('')}</div><div class="onb-rhythm-count"><strong>${d.trainingDays.length}</strong><span>séance${d.trainingDays.length>1?'s':''} visée${d.trainingDays.length>1?'s':''} par semaine</span></div><div class="onb-field-grid three"><label class="onb-field"><span>Durée idéale</span><select id="onbDuration">${[30,45,60,75,90,120].map(n=>`<option value="${n}" ${Number(d.preferredDuration)===n?'selected':''}>${n} min</option>`).join('')}</select></label><label class="onb-field"><span>Format</span><select id="onbSessionPreference">${['Complet + Express','Complet','Express','Flexible'].map(value=>`<option ${d.sessionPreference===value?'selected':''}>${value}</option>`).join('')}</select></label><label class="onb-field"><span>Style du coach</span><select id="onbCoachStyle">${['Prudent','Équilibré','Ambitieux'].map(value=>`<option ${d.coachStyle===value?'selected':''}>${value}</option>`).join('')}</select></label></div></div>`;
}

function renderOnboardingContext(d){
  const locationDefs=[['home','Maison'],['outdoor','Parc / extérieur'],['gym','Salle'],['club','Club / box']];
  return `<div class="onb-step"><div class="onb-kicker">04 · TERRAIN DE JEU</div><h1>Où bouges-tu ?</h1><p>KINETIK suit toute ta charge sportive, mais garde le cardio séparé des séances de calisthénie.</p><h2>Sports pratiqués</h2><div class="onb-chip-grid">${ATHLETE_SPORTS.map(([id,label])=>`<label class="${d.sports.includes(id)?'active':''}"><input type="checkbox" class="onb-sport" value="${id}" ${d.sports.includes(id)?'checked':''}><span>${esc(label)}</span></label>`).join('')}</div><h2>Lieux accessibles</h2><div class="onb-choice-grid two">${locationDefs.map(([id,title])=>onboardingChoiceButton({active:d.locations.includes(id),attr:`data-onb-location="${id}"`,title,detail:id==='home'?'Chez moi':id==='outdoor'?'Street workout / plein air':id==='gym'?'Équipement de salle':'Cours ou box'})).join('')}</div></div>`;
}

function renderOnboardingSetup(d){
  const activeEquipment=EQUIPMENT_CATALOG.filter(item=>d.equipment[item.id]).length;
  return `<div class="onb-step"><div class="onb-kicker">05 · SETUP & SÉCURITÉ</div><h1>Avec quoi t’entraînes-tu ?</h1><p>Un matériel absent déclenche une alerte et une variante. Une zone à ménager adapte durablement les exercices concernés.</p><div class="onb-preset-row"><span>${activeEquipment} équipement${activeEquipment>1?'s':''} sélectionné${activeEquipment>1?'s':''}</span><div><button type="button" data-onb-equipment-preset="none">Aucun</button><button type="button" data-onb-equipment-preset="essential">Essentiel</button><button type="button" data-onb-equipment-preset="all">Tout</button></div></div><div class="onb-equipment-grid">${EQUIPMENT_CATALOG.map(item=>`<label class="${d.equipment[item.id]?'active':''}"><input type="checkbox" class="onb-equipment" data-equipment-id="${item.id}" ${d.equipment[item.id]?'checked':''}><b>${item.icon}</b><span><strong>${esc(item.label)}</strong><small>${esc(item.note)}</small></span></label>`).join('')}</div><h2>Zones à ménager <small>facultatif</small></h2><div class="onb-chip-grid restrictions">${RESTRICTION_AREAS.map(([id,label])=>`<label class="${d.restrictions[id]?'active warning':''}"><input type="checkbox" class="onb-restriction" data-restriction-id="${id}" ${d.restrictions[id]?'checked':''}><span>${esc(label)}</span></label>`).join('')}</div><div class="onb-field-grid two onb-final-prefs"><label class="onb-field"><span>Préparation avant un maintien</span><select id="onbPrepSeconds">${[0,3,5,10,15].map(n=>`<option value="${n}" ${Number(d.timedSetPrepSeconds)===n?'selected':''}>${n===0?'Aucune':n+' secondes'}</option>`).join('')}</select><small>Dead Hang et autres séries chronométrées du jour.</small></label><label class="onb-field"><span>Note permanente <small>optionnel</small></span><textarea id="onbNotes" rows="3" placeholder="Ex. genou sensible, horaires variables…">${esc(d.notes||'')}</textarea></label></div><p class="onb-safety">KINETIK adapte l’entraînement, mais ne pose aucun diagnostic. En cas de douleur vive ou inhabituelle, arrête le mouvement.</p></div>`;
}

function renderOnboardingReview(d){
  const equipment=EQUIPMENT_CATALOG.filter(item=>d.equipment[item.id]),restrictions=RESTRICTION_AREAS.filter(([id])=>d.restrictions[id]);
  return `<div class="onb-step onb-review"><div class="onb-kicker">06 · PRÊT</div><h1>Ton système est configuré.</h1><p>KINETIK utilisera ces informations dans Aujourd’hui, les adaptations de séance et ton Profil. Tu pourras aligner le cycle sur tes jours dans Planning.</p><div class="onb-review-hero"><span>MISSION ACTIVE</span><strong>${esc(onboardingGoalLabel(d))}</strong><small>${d.trainingDays.length} séance${d.trainingDays.length>1?'s':''} · ${d.preferredDuration} min · coach ${esc(String(d.coachStyle).toLowerCase())}</small></div><div class="onb-review-grid"><div><span>ATHLÈTE</span><strong>${esc(d.name||'—')}</strong><small>${esc(d.experience)}${d.height?` · ${d.height} cm`:''}${d.weight?` · ${d.weight} kg`:''}${d.targetWeight?` · cible ${d.targetWeight} kg`:''}</small></div><div><span>DISPONIBILITÉS</span><strong>${d.trainingDays.map(day=>athleteDayLabel(day).slice(0,3)).join(' · ')}</strong><small>${esc(d.sessionPreference)}</small></div><div><span>TERRAIN</span><strong>${d.locations.map(id=>({home:'Maison',outdoor:'Extérieur',gym:'Salle',club:'Club'}[id]||id)).join(' · ')}</strong><small>${d.sports.slice(0,4).map(athleteSportLabel).join(' · ')}</small></div><div><span>ADAPTATIONS</span><strong>${equipment.length} équipement${equipment.length>1?'s':''}</strong><small>${restrictions.length?`${restrictions.length} zone${restrictions.length>1?'s':''} à ménager`:'Aucune restriction permanente'}</small></div></div><div class="onb-local-note"><b>✓</b><span><strong>Sauvegarde locale</strong><small>Ces informations restent sur cet appareil et sont incluses dans l’export KINETIK.</small></span></div></div>`;
}

function renderOnboardingWizard(){
  const wizard=state.onboardingWizard,d=wizard.draft,step=wizard.step;
  const content=step===0?renderOnboardingWelcome():step===1?renderOnboardingIdentity(d):step===2?renderOnboardingGoal(d):step===3?renderOnboardingRhythm(d):step===4?renderOnboardingContext(d):step===5?renderOnboardingSetup(d):renderOnboardingReview(d);
  const nextLabel=step===0?'Configurer mon KINETIK':step===KINETIK_ONBOARDING_LAST_STEP?'Ouvrir mon Aujourd’hui':'Continuer';
  return `<main class="onboarding-shell"><section class="onboarding-card"><header class="onb-head"><div><span class="onb-mark">K</span><strong>KINETIK</strong></div>${step>0?`<button type="button" id="deferOnboarding">Continuer plus tard</button>`:''}</header>${onboardingProgress(step)}<div class="onb-content">${content}${wizard.error?`<div class="onb-error" role="alert">${esc(wizard.error)}</div>`:''}</div><footer class="onb-footer">${step===0?`<button type="button" class="onb-later" id="deferOnboardingWelcome">Découvrir d’abord</button>`:`<button type="button" class="onb-back" id="onboardingBack" ${step===1?'disabled':''}>← Retour</button>`}<button type="button" class="onb-next" id="onboardingNext">${nextLabel} <span>→</span></button></footer></section></main>`;
}

function onboardingSyncFromDom(){
  const wizard=state.onboardingWizard;if(!wizard)return;const d=wizard.draft,step=wizard.step;
  if(step===1){d.name=(document.getElementById('onbName')?.value||d.name||'').trim();d.age=document.getElementById('onbAge')?.value||'';d.height=document.getElementById('onbHeight')?.value||'';d.weight=document.getElementById('onbWeight')?.value||'';}
  if(step===2){d.primaryGoalCustom=document.getElementById('onbGoalCustom')?.value||d.primaryGoalCustom||'';d.secondaryGoal=document.getElementById('onbSecondaryGoal')?.value||'';d.goalHorizon=document.getElementById('onbGoalHorizon')?.value||'';d.targetWeight=document.getElementById('onbTargetWeight')?.value||'';}
  if(step===3){d.preferredDuration=Number(document.getElementById('onbDuration')?.value||d.preferredDuration||60);d.sessionPreference=document.getElementById('onbSessionPreference')?.value||d.sessionPreference;d.coachStyle=document.getElementById('onbCoachStyle')?.value||d.coachStyle;}
  if(step===4)d.sports=[...document.querySelectorAll('.onb-sport:checked')].map(input=>input.value);
  if(step===5){d.equipment=Object.fromEntries(EQUIPMENT_CATALOG.map(item=>[item.id,!!document.querySelector(`.onb-equipment[data-equipment-id="${item.id}"]`)?.checked]));d.restrictions=Object.fromEntries(RESTRICTION_AREAS.map(([id])=>[id,!!document.querySelector(`.onb-restriction[data-restriction-id="${id}"]`)?.checked]));d.timedSetPrepSeconds=Number(document.getElementById('onbPrepSeconds')?.value??d.timedSetPrepSeconds);d.notes=document.getElementById('onbNotes')?.value||'';}
}

function onboardingValidationMessage(step,d){
  if(step===1&&!String(d.name||'').trim())return 'Ajoute un prénom ou un pseudo pour personnaliser KINETIK.';
  if(step===1&&d.height&&(Number(d.height)<100||Number(d.height)>230))return 'Vérifie la taille saisie (entre 100 et 230 cm).';
  if(step===1&&d.weight&&(Number(d.weight)<30||Number(d.weight)>250))return 'Vérifie le poids saisi (entre 30 et 250 kg).';
  if(step===2&&!onboardingGoalLabel(d))return 'Choisis ou écris ton objectif principal.';
  if(step===2&&d.targetWeight&&(Number(d.targetWeight)<30||Number(d.targetWeight)>250))return 'Vérifie le poids cible (entre 30 et 250 kg).';
  if(step===3&&!d.trainingDays.length)return 'Choisis au moins un jour d’entraînement.';
  if(step===4&&!d.sports.length)return 'Choisis au moins un sport pratiqué.';
  if(step===4&&!d.locations.length)return 'Choisis au moins un lieu accessible.';
  return '';
}

function completeOnboarding(){
  const d=state.onboardingWizard.draft,old=getAthleteProfile(),trainingDays=[...d.trainingDays].sort((a,b)=>a-b),restDays=[0,1,2,3,4,5,6].filter(day=>!trainingDays.includes(day));
  setAthleteProfile({...old,name:String(d.name||'').trim(),age:Number(d.age)||null,height:Number(d.height)||null,targetWeight:Number(d.targetWeight)||null,experience:d.experience||'Intermédiaire',primaryGoal:onboardingGoalLabel(d)||'Progression générale',secondaryGoal:String(d.secondaryGoal||'').trim(),goalHorizon:d.goalHorizon||'',weeklySessions:trainingDays.length,preferredDuration:Number(d.preferredDuration)||60,sessionPreference:d.sessionPreference||'Complet + Express',coachStyle:d.coachStyle||'Équilibré',trainingDays,restDays,sports:d.sports.length?d.sports:['calisthenics'],locations:d.locations.length?d.locations:['home'],notes:String(d.notes||'').trim()});
  setCanonicalHeight(Number(d.height)||null);if(Number(d.weight)>0)recordCurrentWeight(Number(d.weight),'onboarding');
  setEquipmentSetup({...d.equipment});if(typeof setRestrictions==='function')setRestrictions({...d.restrictions});
  setPrefs({...getPrefs(),timedSetPrepSeconds:Number(d.timedSetPrepSeconds)||0});
  save(STORAGE.onboarding,{version:KINETIK_ONBOARDING_VERSION,status:'completed',completedAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
  state.onboardingWizard=null;state.view='today';state.quickToast='Profil KINETIK configuré';render();
}

function bindOnboardingEvents(){
  if(!state.onboardingWizard)return;
  const rerender=()=>{state.onboardingWizard.error='';onboardingPersist();render();};
  document.getElementById('deferOnboarding')?.addEventListener('click',deferOnboarding);
  document.getElementById('deferOnboardingWelcome')?.addEventListener('click',deferOnboarding);
  document.getElementById('onboardingBack')?.addEventListener('click',()=>{onboardingSyncFromDom();state.onboardingWizard.step=Math.max(1,state.onboardingWizard.step-1);rerender();});
  document.getElementById('onboardingNext')?.addEventListener('click',()=>{onboardingSyncFromDom();const wizard=state.onboardingWizard,error=onboardingValidationMessage(wizard.step,wizard.draft);if(error){wizard.error=error;render();return;}if(wizard.step===KINETIK_ONBOARDING_LAST_STEP){completeOnboarding();return;}wizard.step+=1;rerender();});
  document.querySelectorAll('[data-onb-experience]').forEach(button=>button.onclick=()=>{onboardingSyncFromDom();state.onboardingWizard.draft.experience=button.dataset.onbExperience;rerender();});
  document.querySelectorAll('[data-onb-goal]').forEach(button=>button.onclick=()=>{onboardingSyncFromDom();state.onboardingWizard.draft.primaryGoalPreset=button.dataset.onbGoal;rerender();});
  document.querySelectorAll('[data-onb-day]').forEach(button=>button.onclick=()=>{onboardingSyncFromDom();const day=Number(button.dataset.onbDay),days=state.onboardingWizard.draft.trainingDays;state.onboardingWizard.draft.trainingDays=days.includes(day)?days.filter(value=>value!==day):[...days,day];rerender();});
  document.querySelectorAll('.onb-sport').forEach(input=>input.onchange=()=>{onboardingSyncFromDom();rerender();});
  document.querySelectorAll('[data-onb-location]').forEach(button=>button.onclick=()=>{onboardingSyncFromDom();const id=button.dataset.onbLocation,locations=state.onboardingWizard.draft.locations;state.onboardingWizard.draft.locations=locations.includes(id)?locations.filter(value=>value!==id):[...locations,id];rerender();});
  document.querySelectorAll('.onb-equipment,.onb-restriction').forEach(input=>input.onchange=()=>{onboardingSyncFromDom();rerender();});
  document.querySelectorAll('[data-onb-equipment-preset]').forEach(button=>button.onclick=()=>{onboardingSyncFromDom();const preset=button.dataset.onbEquipmentPreset,essential=new Set(['powerTower','bands','mat']);state.onboardingWizard.draft.equipment=Object.fromEntries(EQUIPMENT_CATALOG.map(item=>[item.id,preset==='all'||(preset==='essential'&&essential.has(item.id))]));rerender();});
}

const _renderSettingsV10156=renderSettings;
renderSettings=function(){
  const html=_renderSettingsV10156(),marker='<section class="p88-settings-section"><div class="p88-section-head"><div><div class="kicker">Application</div><h2>Installation</h2>';
  const onboardingStatus=parse(STORAGE.onboarding,null)?.status;
  const status=onboardingStatus==='completed'?'Configuration terminée':onboardingStatus==='existing_user'?'Profil existant':'À compléter';
  const block=`<section class="p88-settings-section onb-settings-entry"><div class="p88-section-head"><div><div class="kicker">Personnalisation</div><h2>Configuration initiale</h2></div><span class="pill">${status}</span></div><p class="p88-muted">Revois ton niveau, ta mission, tes disponibilités, tes lieux, ton matériel et les zones à ménager.</p><button type="button" class="p88-settings-action" id="openOnboardingWizard"><div><strong>Relancer le guide</strong><span>Les valeurs actuelles seront préremplies</span></div><b>Ouvrir →</b></button></section>`;
  return html.includes(marker)?html.replace(marker,block+marker):html;
};

const _bindEventsV10156=bindEvents;
bindEvents=function(){
  _bindEventsV10156();bindOnboardingEvents();
  const open=document.getElementById('openOnboardingWizard');if(open)open.onclick=()=>openOnboardingWizard({step:1});
};

const _renderV10156=render;
render=function(){
  document.body.classList.toggle('onboarding-active',!!state.onboardingWizard);
  if(state.onboardingWizard){document.body.classList.remove('athlete-passport');document.getElementById('app').innerHTML=renderOnboardingWizard();bindEvents();return;}
  return _renderV10156();
};

try{render();}catch(error){console.warn('KINETIK onboarding refresh',error);}
