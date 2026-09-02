/* KINETIK v10.148 · Core runtime, data, storage and foundational UI. */
const DAY_NAMES = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const STORAGE = {
  history: "cc_history",
  prefs: "cc_prefs",
  tests: "cc_tests",
  skills: "cc_skills",
  body: "cc_body",
  bodyConfig: "cc_body_config_v1",
  flexibility: "cc_flexibility",
  mobilityTests: "cc_mobility_tests",
  tutorials: "cc_tutorials",
  exerciseChoices: "cc_exercise_choices",
  quickLogs: "cc_quick_logs",
  quickFavorites: "cc_quick_favorites_v1",
  quickFavoritePresets: "cc_quick_favorite_presets_v1",
  stravaActivities: "cc_strava_activities",
  stravaMeta: "cc_strava_meta",
  customWorkouts: "cc_custom_workouts",
  trainingConfig: "cc_training_config_v1",
  flexConfig: "cc_flex_config_v1",
  trainingCycles: "cc_training_cycles_v1",
  cycleActivationHistory: "cc_cycle_activation_history_v1",
  cycleProgressions: "cc_cycle_progressions_v1",
  cycleProgressionStates: "cc_cycle_progression_states_v1",
  activities: "cc_activities_v1",
  athleteProfile: "kinetik_athlete_profile_v1",
  dailyTaskDecisions: "cc_daily_task_decisions_v1",
  localNotificationState: "cc_local_notification_state_v1",
  webPushDeviceState: "cc_web_push_device_v1",
};

function ex(name, type, sets, target, rest, tip, opts={}) {
  return {
    name, type, sets, target, rest, tip, baseTarget: target,
    phase: opts.phase || "main",
    express: !!opts.express,
    shortSets: opts.shortSets ?? null,
    shortTarget: opts.shortTarget ?? null,
    guide: opts.guide || null,
  };
}

// V10.0 · Progress Hub · Progrès organisé en Vue d’ensemble / Performance / Volume / Historique.
// Chaque journée conserve échauffement + travail principal + cardio + retour au calme,
// y compris en mode Express. Lundi reste le jour de récupération complète.
const workouts = {
  1: { name: "Repos", subtitle: "Récupération complète", duration: 0, shortDuration: 0, intensity: "Repos", exercises: [] },
  2: {
    name: "Push + Handstand", subtitle: "Poussée complète · épaules, pectoraux, triceps et contrôle", duration: 72, shortDuration: 32, intensity: "Intermédiaire · modérée",
    exercises: [
      ex("Échauffement épaules & poignets", "timer", 1, 420, 0, "Prépare les poignets avant les appuis et monte progressivement en température.", {phase:"warmup",express:true,shortTarget:240,guide:["60 s de mobilisation douce des poignets + appuis progressifs","12 pass-through avec bande légère","10 scapular push-ups sur poignées ou au sol","10 rotations externes par côté avec bande légère","2 × 5 pompes faciles, sans fatigue"]}),
      ex("Handstand au mur", "hold", 3, 25, 60, "Qualité de ligne avant durée. Arrête la série avant de perdre le contrôle.", {express:true,shortSets:2}),
      ex("Dips", "reps", 4, 6, 120, "Barres parallèles stables. Garde environ 2 répétitions en réserve.", {express:true,shortSets:3}),
      ex("Pompes", "reps", 3, 10, 90, "Utilise les poignées si elles rendent les poignets plus confortables. Corps gainé.", {express:true,shortSets:2}),
      ex("Pike push-ups", "reps", 3, 7, 90, "Tête entre les mains, descente contrôlée, épaules actives.", {express:true,shortSets:2}),
      ex("Hollow hold", "hold", 3, 25, 60, "Bas du dos au tapis ; raccourcis le levier si nécessaire.", {express:true,shortSets:2}),
      ex("Cardio Zone 2", "timer", 1, 1200, 0, "20 min faciles : course, marche rapide ou vélo. Tu dois pouvoir parler en phrases complètes.", {phase:"cardio",express:true,shortTarget:480}),
      ex("Mobilité épaules / pectoraux / poignets", "timer", 1, 480, 0, "Retour au calme progressif, sans douleur vive.", {phase:"cooldown",express:true,shortTarget:240,guide:["Étirement pectoral 45 s par côté","Grand dorsal 45 s par côté","Poignets flexion/extension 30 s dans chaque position","Respiration lente 60–90 s"]})
    ]
  },
  3: {
    name: "Pull + Grip + Core", subtitle: "Dos complet · tractions, tirage horizontal, bras, grip et abdos", duration: 72, shortDuration: 32, intensity: "Intermédiaire · modérée",
    exercises: [
      ex("Échauffement tirage", "timer", 1, 420, 0, "Active les omoplates avant les tractions.", {phase:"warmup",express:true,shortTarget:240,guide:["30–45 s dead hang très léger","2 × 6 scapular pull-ups","15 face pulls avec bande légère","8 rows bande très faciles","1–2 séries de tractions assistées faciles"]}),
      ex("Tractions strictes", "reps", 4, 4, 120, "Répétitions strictes. Garde 1–2 reps en réserve plutôt que d'aller à l'échec.", {express:true,shortSets:3}),
      ex("Tractions assistées", "reps_band", 2, 6, 105, "Back-off technique : amplitude complète et assistance suffisante.", {express:false}),
      ex("Row avec bande", "reps_band", 3, 12, 75, "Tire les coudes vers l'arrière et marque une courte pause.", {express:true,shortSets:2}),
      ex("Face pulls", "reps_band", 2, 15, 60, "Bande légère à moyenne, épaules basses.", {express:false}),
      ex("Curl biceps avec bande", "reps_band", 2, 12, 60, "Pas d'élan ; contrôle le retour.", {express:false}),
      ex("Dead hang", "hold", 2, 35, 90, "Travail de grip sans chercher un record après les tractions.", {express:true,shortSets:2,shortTarget:25}),
      ex("Hanging knee raises", "reps", 3, 8, 75, "Monte le bassin légèrement et évite le balancement.", {express:true,shortSets:2}),
      ex("Cardio Zone 2", "timer", 1, 1200, 0, "20 min faciles. Si tu cours, enregistre l'activité avec Strava.", {phase:"cardio",express:true,shortTarget:480}),
      ex("Mobilité dos / avant-bras / épaules", "timer", 1, 420, 0, "Décompresse le haut du corps et les avant-bras.", {phase:"cooldown",express:true,shortTarget:180,guide:["Child's pose latéral 45 s par côté","Étirement avant-bras 30 s dans chaque sens","Rotation thoracique 6 reps par côté","Respiration lente 60 s"]})
    ]
  },
  4: {
    name: "Jambes + Cardio", subtitle: "Quadriceps, ischios, fessiers, mollets, stabilité et endurance", duration: 78, shortDuration: 35, intensity: "Intermédiaire · modérée",
    exercises: [
      ex("Échauffement jambes", "timer", 1, 420, 0, "Prépare chevilles, genoux et hanches avant la charge.", {phase:"warmup",express:true,shortTarget:240,guide:["10 knee-to-wall par cheville","8 ouvertures 90/90 dynamiques par côté","15 squats poids du corps","8 fentes arrière alternées par côté","10 hip hinges sans charge"]}),
      ex("Squat avec bande", "reps_band", 3, 12, 90, "Place la bande sous les pieds et sur les épaules. Tension progressive, tronc solide et genoux dans l'axe.", {express:true,shortSets:2,shortTarget:10}),
      ex("Bulgarian split squat", "reps_side", 3, 8, 105, "8 par jambe. Poids du corps pour le moment ; utilise la Power Tower comme support d'équilibre si nécessaire.", {express:true,shortSets:2}),
      ex("Romanian deadlift avec bande", "reps_band", 3, 12, 75, "Hanches vers l'arrière, tension dans les ischios, dos neutre.", {express:true,shortSets:2}),
      ex("Hamstring curl avec bande", "reps_band", 3, 12, 60, "Contrôle surtout la phase de retour.", {express:true,shortSets:2}),
      ex("Mollets une jambe", "reps_side", 3, 15, 60, "Amplitude complète avec pause en haut.", {express:true,shortSets:2}),
      ex("Pallof press avec bande", "reps_side", 2, 10, 45, "Résiste à la rotation, cage thoracique et bassin face devant.", {express:false}),
      ex("Cardio Zone 2", "timer", 1, 1500, 0, "25 min faciles. Course lente si les jambes récupèrent bien, sinon marche rapide.", {phase:"cardio",express:true,shortTarget:600}),
      ex("Mobilité jambes", "timer", 1, 480, 0, "Relâche surtout chevilles, quadriceps, hanches et ischios.", {phase:"cooldown",express:true,shortTarget:240,guide:["Couch stretch 45 s par côté","Ischios 45 s par côté","Mollets 45 s par côté","90/90 hanches 45 s par côté"]})
    ]
  },
  5: {
    name: "Skills + Mobilité", subtitle: "Technique, stabilité scapulaire, core et récupération active", duration: 60, shortDuration: 27, intensity: "Intermédiaire · légère",
    exercises: [
      ex("Échauffement général", "timer", 1, 360, 0, "Journée technique : chauffe-toi sans créer de fatigue.", {phase:"warmup",express:true,shortTarget:240,guide:["60 s de marche active ou jumping jacks faciles","Cercles épaules + poignets","8 scapular pull-ups faciles","8 scapular push-ups","2 montées handstand très courtes"]}),
      ex("Handstand au mur", "hold", 3, 25, 60, "Cherche une meilleure ligne, pas un record.", {express:true,shortSets:2}),
      ex("Tuck L-sit", "hold", 3, 12, 60, "Barres parallèles ou poignées ; pousse fort le support et garde les épaules basses.", {express:true,shortSets:2,shortTarget:10}),
      ex("Scapular pull-ups", "reps", 2, 8, 60, "Bras tendus, mouvement uniquement des omoplates.", {express:true,shortSets:2}),
      ex("Scapular push-ups", "reps", 2, 10, 45, "Poignées possibles ; coudes verrouillés.", {express:true,shortSets:2}),
      ex("Rotation externe avec bande", "reps_band", 2, 15, 45, "Bande légère, coude proche du corps.", {express:true,shortSets:2}),
      ex("Side plank", "hold_side", 2, 30, 45, "Bassin haut et corps aligné.", {express:true,shortSets:1,shortTarget:25}),
      ex("Cardio Zone 2", "timer", 1, 1200, 0, "20 min très confortables pour favoriser la récupération active.", {phase:"cardio",express:true,shortTarget:480}),
      ex("Mobilité complète", "timer", 1, 600, 0, "Mobilité globale contrôlée.", {phase:"cooldown",express:true,shortTarget:240,guide:["Rotation thoracique 6 par côté","90/90 hanches 45 s par côté","Étirement pectoral 45 s par côté","Deep squat hold 45–60 s","Respiration diaphragmatique 60 s"]})
    ]
  },
  6: {
    name: "Full Body", subtitle: "Force générale · rappel push/pull/jambes/core avec charge", duration: 75, shortDuration: 35, intensity: "Intermédiaire · modérée",
    exercises: [
      ex("Échauffement général", "timer", 1, 420, 0, "Monte progressivement en température avant la séance mixte.", {phase:"warmup",express:true,shortTarget:240,guide:["Poignets + épaules 60 s","10 squats + 6 fentes par côté","8 scapular pull-ups","8 scapular push-ups","1 série très facile de traction, dip et squat"]}),
      ex("Tractions strictes", "reps", 3, 5, 120, "Reste strict ; passe en assisté si la qualité se dégrade.", {express:true,shortSets:2,shortTarget:4}),
      ex("Dips", "reps", 3, 6, 120, "Barres parallèles stables, épaules contrôlées.", {express:true,shortSets:2}),
      ex("Pompes", "reps", 2, 10, 90, "Poignées recommandées si confortables.", {express:false}),
      ex("Fentes arrière", "reps_side", 3, 10, 90, "10 par jambe. Pas contrôlé et amplitude confortable ; ajoute de la tension par bande plus tard si nécessaire.", {express:true,shortSets:2,shortTarget:8}),
      ex("Romanian deadlift avec bande", "reps_band", 2, 12, 75, "Rappel ischios/fessiers, sans chercher l'échec.", {express:true,shortSets:2}),
      ex("Row avec bande", "reps_band", 2, 12, 75, "Rappel de tirage horizontal.", {express:false}),
      ex("Hanging knee raises", "reps", 2, 10, 75, "Gainage strict, pas d'élan.", {express:true,shortSets:2,shortTarget:8}),
      ex("Mollets", "reps", 2, 15, 60, "Amplitude complète et contrôle.", {express:false}),
      ex("Cardio Zone 2", "timer", 1, 900, 0, "15 min faciles. Ne transforme pas la fin de séance en interval training.", {phase:"cardio",express:true,shortTarget:480}),
      ex("Retour au calme", "timer", 1, 420, 0, "Respire et relâche les groupes sollicités.", {phase:"cooldown",express:true,shortTarget:180,guide:["Pectoraux 30–45 s par côté","Grand dorsal 30–45 s par côté","Fléchisseurs de hanche 45 s par côté","Ischios 45 s par côté","Respiration lente 60 s"]})
    ]
  },
  0: {
    name: "Endurance + Mobilité", subtitle: "Zone 2 longue, souplesse et récupération active", duration: 82, shortDuration: 30, intensity: "Légère",
    exercises: [
      ex("Échauffement général", "timer", 1, 300, 0, "Prépare doucement chevilles et hanches avant le cardio.", {phase:"warmup",express:true,shortTarget:180,guide:["2 min de marche facile","10 mobilisations de cheville par côté","8 ouvertures de hanche par côté","30 s de respiration calme"]}),
      ex("Cardio Zone 2", "timer", 1, 3600, 0, "60 min faciles. Course, marche active, randonnée ou vélo en restant conversationnel.", {phase:"cardio",express:true,shortTarget:1200}),
      ex("Deep squat hold", "hold", 2, 45, 30, "Respire et garde les talons au sol si possible.", {phase:"cooldown",express:true,shortSets:1}),
      ex("90/90 hanches", "hold_side", 2, 45, 30, "45 secondes de chaque côté.", {phase:"cooldown",express:true,shortSets:1}),
      ex("Frog stretch", "hold", 2, 45, 30, "Progressif, aucune douleur vive.", {phase:"cooldown",express:false}),
      ex("Étirement ischios", "hold_side", 2, 45, 30, "Respiration lente.", {phase:"cooldown",express:true,shortSets:1}),
      ex("Fléchisseurs de hanche", "hold_side", 2, 45, 30, "Bassin légèrement rétroversé.", {phase:"cooldown",express:true,shortSets:1}),
      ex("Étirement mollets", "hold_side", 2, 45, 30, "Garde le talon au sol.", {phase:"cooldown",express:true,shortSets:1}),
      ex("Rotation thoracique", "reps_side", 2, 8, 30, "Amplitude confortable.", {phase:"cooldown",express:true,shortSets:1,shortTarget:6}),
      ex("Épaules / grand dorsal / pectoraux", "timer", 1, 360, 0, "Finis tranquillement par le haut du corps.", {phase:"cooldown",express:true,shortTarget:180,guide:["Grand dorsal 45 s par côté","Pectoraux 45 s par côté","Respiration diaphragmatique 60 s"]})
    ]
  }
};

const BAND_INVENTORY = [
  { id:"none", label:"Aucune", short:"Aucune", color:"#cbd5e1", lbs:"—", kg:"—" },
  { id:"yellow", label:"Jaune · 2,3–6,8 kg", short:"Jaune", color:"#facc15", lbs:"5–15 lb", kg:"2,3–6,8 kg" },
  { id:"red", label:"Rouge · 6,8–15,9 kg", short:"Rouge", color:"#ef4444", lbs:"15–35 lb", kg:"6,8–15,9 kg" },
  { id:"black", label:"Noire · 11,3–29,5 kg", short:"Noire", color:"#111827", lbs:"25–65 lb", kg:"11,3–29,5 kg" },
  { id:"purple", label:"Violette · 15,9–38,6 kg", short:"Violette", color:"#7c3aed", lbs:"35–85 lb", kg:"15,9–38,6 kg" },
  { id:"green", label:"Verte · 22,7–56,7 kg", short:"Verte", color:"#22c55e", lbs:"50–125 lb", kg:"22,7–56,7 kg" },
  { id:"custom", label:"Personnalisée", short:"Perso", color:"#94a3b8", lbs:"—", kg:"—" }
];
const bands = BAND_INVENTORY.map(b=>b.label);
function bandByLabel(label){return BAND_INVENTORY.find(b=>b.label===label||b.short===label)||BAND_INVENTORY[0];}
function defaultBandForExercise(name){
  if(/traction|chin|dips|muscle-up/i.test(name))return BAND_INVENTORY.find(b=>b.id==='black').label;
  if(/deadlift|hamstring|squat|fente/i.test(name))return BAND_INVENTORY.find(b=>b.id==='purple').label;
  if(/face pull|rotation externe|pallof|triceps|curl|row|chest press/i.test(name))return BAND_INVENTORY.find(b=>b.id==='red').label;
  return BAND_INVENTORY.find(b=>b.id==='yellow').label;
}
function lastBandForExercise(name){
  for(const session of getHistory())for(const entry of (session.entries||[]))if(entry.exercise===name&&entry.band)return entry.band;
  for(const entry of getQuickLogs())if(entry.exercise===name&&entry.band)return entry.band;
  return null;
}
function renderBandPicker(current,name='',compact=false){
  const selected=current||lastBandForExercise(name)||defaultBandForExercise(name);
  return `<div class="band-picker ${compact?'compact-band-picker':''}">${BAND_INVENTORY.map(b=>`<button type="button" class="band-choice ${b.label===selected?'active':''}" data-band-label="${esc(b.label)}" title="${esc(b.lbs==='—'?b.label:`${b.short} · ${b.kg} (${b.lbs})`)}"><i class="band-swatch" style="--band-color:${b.color}"></i><span><strong>${b.short}</strong>${b.kg!=='—'?`<small>${b.kg}</small>`:''}</span></button>`).join('')}</div>`;
}

const HOME_EQUIPMENT = ["Power Tower", "Barres parallèles", "Poignées de pompes", "Bandes", "Tapis"];
const BACKPACK_ENABLED = false;
function usesBackpack(name){
  const info=exerciseInfo(name);
  return /sac à dos|sac a dos/i.test(name)||/sac à dos|sac a dos/i.test(info?.equipment||'');
}
function equipmentUseNote(name){
  if(name==="Squat avec bande") return "Place la bande sous les deux pieds puis sur le haut des épaules. Commence avec une résistance qui te laisse 2–3 répétitions en réserve.";
  if(/^(Dips|Dips assistés|Dips tempo|Dips lestés)$/i.test(name)) return "Utilise en priorité les nouvelles barres parallèles : elles sont idéales pour les dips si elles sont bien stables et à une largeur confortable.";
  if(/^(Tuck L-sit|One-leg L-sit|L-sit|V-sit compression)$/i.test(name)) return "Utilise les barres parallèles pour le travail de L-sit. Les poignées de pompes sont aussi utiles pour les versions basses et les premiers holds.";
  if(/Pompes|Pseudo-planche|Pike push-ups|Scapular push-ups/i.test(name)) return "Option recommandée : poignées de pompes pour garder les poignets neutres et gagner un peu d’amplitude. Reviens au sol si la variante devient trop difficile.";
  if(/Handstand/i.test(name)) return "Les poignées pourront servir plus tard pour un appui poignets neutres, mais garde le sol comme variante principale tant que l’équilibre est en progression.";
  return "";
}
function renderBackpackLoadInput(value=0,id='backpackLoadKg'){
  return `<div class="load-picker"><label class="small muted" for="${id}">Charge du sac</label><div class="load-input-wrap"><input id="${id}" class="load-input" type="number" inputmode="decimal" min="0" step="0.5" value="${Number(value||0)}"><span>kg</span></div><div class="load-presets">${[5,10,15,20].map(v=>`<button type="button" class="load-preset" data-load-target="${id}" data-load-value="${v}">${v} kg</button>`).join('')}</div></div>`;
}
function compactBandKg(value){
  const nums=String(value||'').match(/\d+(?:[,.]\d+)?/g)||[];
  if(nums.length<2)return String(value||'').replace(/\s+/g,' ').trim();
  const rounded=nums.slice(0,2).map(x=>Math.round(Number(String(x).replace(',','.'))));
  return `${rounded[0]}–${rounded[1]} kg`;
}
function renderPresetBandPicker(current,name,index){
  const selected=current||lastBandForExercise(name)||defaultBandForExercise(name);
  const items=BAND_INVENTORY.filter(b=>!['none','custom'].includes(b.id));
  return `<div class="band-picker compact-band-picker quick-band-taps" data-quick-band-index="${index}">${items.map(b=>`<button type="button" class="band-choice ${b.label===selected?'active':''}" data-band-label="${esc(b.label)}" title="${esc(`${b.short} · ${b.kg} (${b.lbs})`)}"><i class="band-swatch" style="--band-color:${b.color}"></i><span><strong>${b.short}</strong><small>${esc(compactBandKg(b.kg))}</small></span></button>`).join('')}</div>`;
}

const TUTORIAL_QUERIES = {
  "Échauffement épaules & poignets": "shoulder wrist warm up calisthenics",
  "Handstand au mur": "wall handstand beginner tutorial calisthenics",
  "Dips": "parallel bar dips proper form tutorial",
  "Pompes": "push up proper form tutorial",
  "Pike push-ups": "pike push up tutorial handstand push up",
  "Extension triceps avec bande": "resistance band triceps extension tutorial",
  "Hollow hold": "hollow body hold tutorial calisthenics",
  "Mobilité épaules / pectoraux / poignets": "shoulder chest wrist mobility routine calisthenics",
  "Échauffement tirage": "pull up warm up scapular dead hang tutorial",
  "Tractions assistées": "band assisted pull up tutorial proper form",
  "Row avec bande": "resistance band row tutorial",
  "Face pulls": "resistance band face pull tutorial",
  "Curl biceps avec bande": "resistance band biceps curl tutorial",
  "Dead hang": "dead hang proper form tutorial",
  "Hanging knee raises": "hanging knee raise tutorial calisthenics",
  "Pallof press avec bande": "resistance band Pallof press anti rotation proper form tutorial",
  "Mobilité dos / avant-bras / épaules": "back forearm shoulder mobility routine",
  "Échauffement jambes": "leg warm up bodyweight training mobility",
  "Squats poids du corps": "bodyweight squat proper form tutorial",
  "Fentes arrière": "reverse lunge proper form tutorial",
  "Romanian deadlift avec bande": "resistance band romanian deadlift tutorial",
  "Mollets": "standing calf raise proper form tutorial",
  "Étirement mollets": "calf stretch proper technique ankle mobility",
  "Cardio Zone 2": "zone 2 cardio explained beginner training",
  "Mobilité jambes": "lower body mobility routine hips hamstrings ankles",
  "Échauffement général": "calisthenics full body warm up beginner",
  "Tuck L-sit": "tuck l sit tutorial beginner calisthenics",
  "Scapular pull-ups": "scapular pull up tutorial",
  "Scapular push-ups": "scapular push up tutorial",
  "Rotation externe avec bande": "band external shoulder rotation tutorial",
  "Mobilité complète": "full body mobility routine calisthenics",
  "Bulgarian split squat": "bulgarian split squat bodyweight tutorial",
  "Retour au calme": "post workout cool down mobility routine",
  "Deep squat hold": "deep squat hold mobility tutorial",
  "90/90 hanches": "90 90 hip mobility tutorial",
  "Frog stretch": "frog stretch hip mobility tutorial",
  "Étirement ischios": "hamstring stretch proper technique",
  "Fléchisseurs de hanche": "hip flexor stretch proper technique",
  "Rotation thoracique": "thoracic rotation mobility tutorial",
  "Épaules / grand dorsal / pectoraux": "shoulder lat chest mobility stretch routine",
  "Respiration diaphragmatique": "diaphragmatic breathing exercise tutorial",
  "Cat-cow": "cat cow mobility exercise tutorial",
  "Knee-to-wall chevilles": "knee to wall ankle mobility tutorial",
  "Couch stretch": "couch stretch hip flexor tutorial",
  "Étirement pectoral encadrement": "doorway chest stretch tutorial",
  "Étirement grand dorsal": "lat stretch mobility tutorial",
  "Pass-through avec bande": "band shoulder pass through mobility tutorial",
  "Flexion avant ischios": "standing forward fold hamstring stretch tutorial",
  "Figure 4 fessiers": "figure four glute stretch tutorial",
  "Poignets flexion / extension": "wrist flexion extension mobility stretch tutorial",
  "Child's pose latéral": "child pose side lat stretch tutorial",
  "Adductor rock-back": "adductor rock back mobility tutorial"
};

const DEFAULT_TUTORIALS = {
  "90/90 hanches": { videoUrl:"https://www.youtube.com/watch?v=Lx07WIkllbA", source:"E3 Rehab", title:"90/90 Hip Transitions" },
  "Adductor rock-back": { videoUrl:"https://www.youtube.com/watch?v=1sSnSh-yKJU", source:"E3 Rehab", title:"Adductor Rock-Back" },
  "Advanced tuck front lever": { videoUrl:"https://www.youtube.com/watch?v=AGhb8V8M758", source:"FitnessFAQs", title:"Front Lever for Beginners — All Progressions" },
  "Archer pull-ups": { videoUrl:"https://www.youtube.com/watch?v=_LGLKUiQH5k", source:"Pullup & Dip", title:"Archer Pull-Up — 5 Progressions" },
  "Archer pull-ups assistés": { videoUrl:"https://www.youtube.com/watch?v=_LGLKUiQH5k", source:"Pullup & Dip", title:"Archer Pull-Up — 5 Progressions" },
  "Australian rows": { videoUrl:"https://www.youtube.com/watch?v=S3XfhC4P4ks", source:"FitnessFAQs", title:"How to Build a THICK Back — Bodyweight Row" },
  "Band chest press": { videoUrl:"https://www.youtube.com/watch?v=JdWpTEVISuw", source:"FITTR", title:"Resistance Band Chest Press" },
  "Bulgarian split squat": { videoUrl:"https://www.youtube.com/watch?v=hbw7hdyOpq0", source:"NASM", title:"Bulgarian Split Squat — Proper Form" },
  "Bulgarian split squat lesté (sac à dos)": { videoUrl:"https://www.youtube.com/watch?v=hbw7hdyOpq0", source:"NASM", title:"Bulgarian Split Squat — Proper Form" },
  "Cardio Zone 2": { videoUrl:"https://www.youtube.com/watch?v=AoB2AMUq8Wg", source:"Peter Attia MD", title:"How to Find Your Zone 2 Without a Lactate Meter" },
  "Cat-cow": { videoUrl:"https://www.youtube.com/watch?v=EC4MkH0XpXY", source:"Good Life Physical Therapy", title:"12 Minute Full Body Stretch" },
  "Chest-to-bar": { videoUrl:"https://www.youtube.com/watch?v=SmduaQzt8Jk", source:"FitnessFAQs", title:"How To Unlock Chest To Bar Pull-Ups" },
  "Child's pose latéral": { videoUrl:"https://www.youtube.com/watch?v=EC4MkH0XpXY", source:"Good Life Physical Therapy", title:"12 Minute Full Body Stretch" },
  "Chin-ups": { videoUrl:"https://www.youtube.com/watch?v=eGo4IYlbE5g", source:"Calisthenicmovement", title:"The Perfect Pull Up" },
  "Chin-ups assistés": { videoUrl:"https://www.youtube.com/watch?v=6GWT7GLXE3c", source:"Calisthenicmovement", title:"Pull Ups For Beginners — 0 to 5 Pull Ups" },
  "Couch stretch": { videoUrl:"https://www.youtube.com/watch?v=cVqb6UdfIpM", source:"Orillia Sports Medicine & Rehabilitation", title:"Couch Stretch Tutorial" },
  "Curl biceps avec bande": { videoUrl:"https://www.youtube.com/watch?v=R9f4TwH-1Q8", source:"Chris Gates Fitness", title:"Resistance Band Biceps Curl Tutorial" },
  "Dead bug": { videoUrl:"https://www.youtube.com/watch?v=bxn9FBrt4-A", source:"NASM", title:"Dead Bug" },
  "Dead hang": { videoUrl:"https://www.youtube.com/watch?v=ShkBXOGK7A8", source:"FitnessFAQs", title:"How Hanging Transforms Your Body" },
  "Deep squat hold": { videoUrl:"https://www.youtube.com/watch?v=jj2AAH6jbHk", source:"Tom Merrick", title:"12 Minute Hip Mobility Routine" },
  "Dips": { videoUrl:"https://www.youtube.com/watch?v=KoS_NMmuxMM", source:"FitnessFAQs", title:"Are You Doing Dips Correctly?" },
  "Dips assistés": { videoUrl:"https://www.youtube.com/watch?v=KoS_NMmuxMM", source:"FitnessFAQs", title:"Are You Doing Dips Correctly?" },
  "Dips lestés": { videoUrl:"https://www.youtube.com/watch?v=KoS_NMmuxMM", source:"FitnessFAQs", title:"Are You Doing Dips Correctly?" },
  "Dips tempo": { videoUrl:"https://www.youtube.com/watch?v=KoS_NMmuxMM", source:"FitnessFAQs", title:"Are You Doing Dips Correctly?" },
  "Dragon flag": { videoUrl:"https://www.youtube.com/watch?v=At0mMAHqWrQ", source:"FitnessFAQs", title:"Dragon Flag — Beginner & Advanced Progressions" },
  "Dragon flag négatives": { videoUrl:"https://www.youtube.com/watch?v=At0mMAHqWrQ", source:"FitnessFAQs", title:"Dragon Flag — Beginner & Advanced Progressions" },
  "Extension triceps avec bande": { videoUrl:"https://www.youtube.com/watch?v=er7ysEHhWt4", source:"Fit Gent", title:"Resistance Band Triceps Exercises" },
  "Face pulls": { videoUrl:"https://www.youtube.com/watch?v=5jgKj8ColLg", source:"BarBend demo", title:"Banded Face Pulls" },
  "Fentes arrière": { videoUrl:"https://www.youtube.com/watch?v=lKhZvT_NkOs", source:"NASM", title:"Reverse Lunge to Balance" },
  "Fentes arrière lestées (sac à dos)": { videoUrl:"https://www.youtube.com/watch?v=lKhZvT_NkOs", source:"NASM", title:"Reverse Lunge to Balance" },
  "Flexion avant ischios": { videoUrl:"https://www.youtube.com/watch?v=rCjKTy9NXM0", source:"Tom Merrick", title:"50 Minute Full Body Flexibility" },
  "Fléchisseurs de hanche": { videoUrl:"https://www.youtube.com/watch?v=cVqb6UdfIpM", source:"Orillia Sports Medicine & Rehabilitation", title:"Couch Stretch Tutorial" },
  "Frog stretch": { videoUrl:"https://www.youtube.com/watch?v=jj2AAH6jbHk", source:"Tom Merrick", title:"12 Minute Hip Mobility Routine" },
  "Front lever": { videoUrl:"https://www.youtube.com/watch?v=AGhb8V8M758", source:"FitnessFAQs", title:"Front Lever for Beginners — All Progressions" },
  "Hamstring curl avec bande": { videoUrl:"https://www.youtube.com/watch?v=6fD3kja6APs", source:"Laura Opstedal / BarBend demo", title:"Prone Banded Hamstring Curl" },
  "Handstand au mur": { videoUrl:"https://www.youtube.com/watch?v=ctunmnwbbSI", source:"Calisthenicmovement", title:"Handstand Tutorial" },
  "Handstand décollages du mur": { videoUrl:"https://www.youtube.com/watch?v=ctunmnwbbSI", source:"Calisthenicmovement", title:"Handstand Tutorial" },
  "Handstand libre": { videoUrl:"https://www.youtube.com/watch?v=ctunmnwbbSI", source:"Calisthenicmovement", title:"Handstand Tutorial" },
  "Handstand push-up au mur": { videoUrl:"https://www.youtube.com/watch?v=h0HjqYRlXYg", source:"Calisthenicmovement", title:"Master the Handstand Push Up" },
  "Handstand push-up libre": { videoUrl:"https://www.youtube.com/watch?v=h0HjqYRlXYg", source:"Calisthenicmovement", title:"Master the Handstand Push Up" },
  "Hanging knee raises": { videoUrl:"https://www.youtube.com/watch?v=QyVq5oUBpss", source:"FitnessFAQs", title:"Leg Raises — Mistakes & Technique" },
  "Hanging leg raises": { videoUrl:"https://www.youtube.com/watch?v=QyVq5oUBpss", source:"FitnessFAQs", title:"Leg Raises — Mistakes & Technique" },
  "Hollow hold": { videoUrl:"https://www.youtube.com/watch?v=4KdhjXUYvmM", source:"SaturnoMovement", title:"The Perfect Hollow Body" },
  "Hollow rocks": { videoUrl:"https://www.youtube.com/watch?v=4KdhjXUYvmM", source:"SaturnoMovement", title:"The Perfect Hollow Body" },
  "HSPU négatives au mur": { videoUrl:"https://www.youtube.com/watch?v=h0HjqYRlXYg", source:"Calisthenicmovement", title:"Master the Handstand Push Up" },
  "Human flag": { videoUrl:"https://www.youtube.com/watch?v=Cl_jIUGYh2w", source:"Calisthenics tutorial", title:"Complete Human Flag Tutorial" },
  "Human flag support vertical": { videoUrl:"https://www.youtube.com/watch?v=Cl_jIUGYh2w", source:"Calisthenics tutorial", title:"Complete Human Flag Tutorial" },
  "Ischios": { videoUrl:"https://www.youtube.com/watch?v=rCjKTy9NXM0", source:"Tom Merrick", title:"50 Minute Full Body Flexibility" },
  "Jump squats": { videoUrl:"https://www.youtube.com/watch?v=tZSYZdtbONc", source:"NASM", title:"Squat Jump" },
  "Knee-to-wall chevilles": { videoUrl:"https://www.youtube.com/watch?v=uippmmTdoWw", source:"Union Physical Therapy", title:"Ankle Mobility — Knee to Wall" },
  "L-sit": { videoUrl:"https://www.youtube.com/watch?v=cu0fHp8HCDo", source:"FitnessFAQs", title:"Best Exercises To Increase L-SIT HOLD" },
  "Mobilité complète": { videoUrl:"https://www.youtube.com/watch?v=R3WDe7byUXo", source:"Tom Merrick", title:"15 Minute Full Body Mobility Routine" },
  "Mobilité dos / avant-bras / épaules": { videoUrl:"https://www.youtube.com/watch?v=rdYq0hZa-Aw", source:"FitnessFAQs", title:"Do This BEFORE Every Calisthenics Workout" },
  "Mobilité jambes": { videoUrl:"https://www.youtube.com/watch?v=jj2AAH6jbHk", source:"Tom Merrick", title:"12 Minute Hip Mobility Routine" },
  "Mobilité épaules / pectoraux / poignets": { videoUrl:"https://www.youtube.com/watch?v=rdYq0hZa-Aw", source:"FitnessFAQs", title:"Do This BEFORE Every Calisthenics Workout" },
  "Mollets": { videoUrl:"https://www.youtube.com/watch?v=qPd73snQfUs", source:"Hospital for Special Surgery", title:"Single-Leg Calf Raise" },
  "Mollets une jambe": { videoUrl:"https://www.youtube.com/watch?v=qPd73snQfUs", source:"Hospital for Special Surgery", title:"Single-Leg Calf Raise" },
  "Muscle-up assisté": { videoUrl:"https://www.youtube.com/watch?v=N4u_sP0bbWI", source:"FitnessFAQs", title:"How To Muscle-Up For Beginners" },
  "Muscle-up strict": { videoUrl:"https://www.youtube.com/watch?v=N4u_sP0bbWI", source:"FitnessFAQs", title:"How To Muscle-Up For Beginners" },
  "Nordic curl": { videoUrl:"https://www.youtube.com/watch?v=_e9vFU9-tkc", source:"E3 Rehab", title:"Nordic Hamstring Curls — Progressions & Regressions" },
  "Nordic curl assisté": { videoUrl:"https://www.youtube.com/watch?v=_e9vFU9-tkc", source:"E3 Rehab", title:"Nordic Hamstring Curls — Progressions & Regressions" },
  "Nordic curl négatif": { videoUrl:"https://www.youtube.com/watch?v=_e9vFU9-tkc", source:"E3 Rehab", title:"Nordic Hamstring Curls — Progressions & Regressions" },
  "One-arm assisted hang": { videoUrl:"https://www.youtube.com/watch?v=ShkBXOGK7A8", source:"FitnessFAQs", title:"How Hanging Transforms Your Body" },
  "One-leg front lever": { videoUrl:"https://www.youtube.com/watch?v=AGhb8V8M758", source:"FitnessFAQs", title:"Front Lever for Beginners — All Progressions" },
  "One-leg human flag": { videoUrl:"https://www.youtube.com/watch?v=Cl_jIUGYh2w", source:"Calisthenics tutorial", title:"Complete Human Flag Tutorial" },
  "One-leg L-sit": { videoUrl:"https://www.youtube.com/watch?v=cu0fHp8HCDo", source:"FitnessFAQs", title:"Best Exercises To Increase L-SIT HOLD" },
  "Pallof press avec bande": { videoUrl:"https://www.youtube.com/watch?v=axgv7H_VQOo", source:"BarBend", title:"Pallof Press Exercise Guide" },
  "Pass-through avec bande": { videoUrl:"https://www.youtube.com/watch?v=osRimvxXlKQ", source:"Physical Therapy 101", title:"Band Pull Apart Series" },
  "Pike hold": { videoUrl:"https://www.youtube.com/watch?v=9WM4O96Jf7I", source:"Pullup & Dip", title:"First Pike Push-up — Beginner Tutorial" },
  "Pike push-ups": { videoUrl:"https://www.youtube.com/watch?v=9WM4O96Jf7I", source:"Pullup & Dip", title:"First Pike Push-up — Beginner Tutorial" },
  "Pike push-ups pieds surélevés": { videoUrl:"https://www.youtube.com/watch?v=9WM4O96Jf7I", source:"Pullup & Dip", title:"First Pike Push-up — Beginner Tutorial" },
  "Pistol squat": { videoUrl:"https://www.youtube.com/watch?v=R1mxpLzYgxM", source:"FitnessFAQs", title:"Complete Pistol Squat Checklist" },
  "Pistol squat assisté": { videoUrl:"https://www.youtube.com/watch?v=R1mxpLzYgxM", source:"FitnessFAQs", title:"Complete Pistol Squat Checklist" },
  "Poignets flexion / extension": { videoUrl:"https://www.youtube.com/watch?v=0VEOm0v5V6Y", source:"Tom Merrick", title:"Never Skip Your Wrist Warm Up!" },
  "Pompes": { videoUrl:"https://www.youtube.com/watch?v=GxW9MAMQSv0", source:"FitnessFAQs", title:"The PERFECT Push-Up Workout (ALL LEVELS)" },
  "Pompes archer": { videoUrl:"https://www.youtube.com/watch?v=GxW9MAMQSv0", source:"FitnessFAQs", title:"The PERFECT Push-Up Workout (ALL LEVELS)" },
  "Pompes inclinées": { videoUrl:"https://www.youtube.com/watch?v=GxW9MAMQSv0", source:"FitnessFAQs", title:"The PERFECT Push-Up Workout (ALL LEVELS)" },
  "Pompes lestées (sac à dos)": { videoUrl:"https://www.youtube.com/watch?v=GxW9MAMQSv0", source:"FitnessFAQs", title:"The PERFECT Push-Up Workout (ALL LEVELS)" },
  "Pompes pieds surélevés": { videoUrl:"https://www.youtube.com/watch?v=GxW9MAMQSv0", source:"FitnessFAQs", title:"The PERFECT Push-Up Workout (ALL LEVELS)" },
  "Pompes serrées": { videoUrl:"https://www.youtube.com/watch?v=GxW9MAMQSv0", source:"FitnessFAQs", title:"The PERFECT Push-Up Workout (ALL LEVELS)" },
  "Pseudo-planche push-ups": { videoUrl:"https://www.youtube.com/watch?v=GxW9MAMQSv0", source:"FitnessFAQs", title:"The PERFECT Push-Up Workout (ALL LEVELS)" },
  "Respiration diaphragmatique": { videoUrl:"https://www.youtube.com/watch?v=EC4MkH0XpXY", source:"Good Life Physical Therapy", title:"12 Minute Full Body Stretch" },
  "Retour au calme": { videoUrl:"https://www.youtube.com/watch?v=R3WDe7byUXo", source:"Tom Merrick", title:"15 Minute Full Body Mobility Routine" },
  "Reverse crunch": { videoUrl:"https://www.youtube.com/watch?v=wtKWBzDwfIM", source:"NASM", title:"Reverse Crunch to Knee-Up" },
  "Romanian deadlift avec bande": { videoUrl:"https://www.youtube.com/watch?v=2DswHFace6c", source:"BarBend demo", title:"Resistance Band Romanian Deadlift" },
  "Rotation externe avec bande": { videoUrl:"https://www.youtube.com/watch?v=_UvmPNGtlPM", source:"AskDoctorJo", title:"Shoulder External Rotation with Resistive Band" },
  "Rotation thoracique": { videoUrl:"https://www.youtube.com/watch?v=ADeGAWCDjhQ", source:"E3 Rehab", title:"Quadruped Thoracic Rotation" },
  "Row avec bande": { videoUrl:"https://www.youtube.com/watch?v=kRNFMY4P_ek", source:"FITTR", title:"Resistance Band Rows" },
  "Scapular pull-ups": { videoUrl:"https://www.youtube.com/watch?v=eGo4IYlbE5g", source:"Calisthenicmovement", title:"The Perfect Pull Up" },
  "Scapular push-ups": { videoUrl:"https://www.youtube.com/watch?v=rdYq0hZa-Aw", source:"FitnessFAQs", title:"Do This BEFORE Every Calisthenics Workout" },
  "Shrimp squat": { videoUrl:"https://www.youtube.com/watch?v=UAhhSlnZcOY", source:"VAHVA Fitness", title:"Shrimp Squat Progressions" },
  "Shrimp squat assisté": { videoUrl:"https://www.youtube.com/watch?v=UAhhSlnZcOY", source:"VAHVA Fitness", title:"Shrimp Squat Progressions" },
  "Side plank": { videoUrl:"https://www.youtube.com/watch?v=44ND4bOB-T0", source:"NASM", title:"Side Plank — Proper Form & Technique" },
  "Single-leg RDL": { videoUrl:"https://www.youtube.com/watch?v=6pEL3KxnlEo", source:"NASM", title:"Single-Leg Romanian Deadlift" },
  "Squat lesté (sac à dos)": { videoUrl:"https://www.youtube.com/watch?v=-W19J4VR7D0", source:"FitnessFAQs", title:"How to Squat Correctly" },
  "Squat avec bande": { videoUrl:"https://www.youtube.com/watch?v=-W19J4VR7D0", source:"FitnessFAQs", title:"How to Squat Correctly" },
  "Squat tempo": { videoUrl:"https://www.youtube.com/watch?v=-W19J4VR7D0", source:"FitnessFAQs", title:"How to Squat Correctly" },
  "Squats poids du corps": { videoUrl:"https://www.youtube.com/watch?v=-W19J4VR7D0", source:"FitnessFAQs", title:"How to Squat Correctly" },
  "Straddle front lever": { videoUrl:"https://www.youtube.com/watch?v=AGhb8V8M758", source:"FitnessFAQs", title:"Front Lever for Beginners — All Progressions" },
  "Straddle human flag": { videoUrl:"https://www.youtube.com/watch?v=Cl_jIUGYh2w", source:"Calisthenics tutorial", title:"Complete Human Flag Tutorial" },
  "Toes-to-bar": { videoUrl:"https://www.youtube.com/watch?v=v6dgseykbLI", source:"THENX", title:"How To Toes To Bar" },
  "Towel hang": { videoUrl:"https://www.youtube.com/watch?v=UejNxYlNkqo", source:"LiveWild Radio", title:"Towel Hangs" },
  "Tractions assistées": { videoUrl:"https://www.youtube.com/watch?v=6GWT7GLXE3c", source:"Calisthenicmovement", title:"Pull Ups For Beginners — 0 to 5 Pull Ups" },
  "Tractions explosives": { videoUrl:"https://www.youtube.com/watch?v=SmduaQzt8Jk", source:"FitnessFAQs", title:"How To Unlock Chest To Bar Pull-Ups" },
  "Tractions strictes": { videoUrl:"https://www.youtube.com/watch?v=eGo4IYlbE5g", source:"Calisthenicmovement", title:"The Perfect Pull Up" },
  "Tuck front lever": { videoUrl:"https://www.youtube.com/watch?v=AGhb8V8M758", source:"FitnessFAQs", title:"Front Lever for Beginners — All Progressions" },
  "Tuck human flag": { videoUrl:"https://www.youtube.com/watch?v=Cl_jIUGYh2w", source:"Calisthenics tutorial", title:"Complete Human Flag Tutorial" },
  "Tuck L-sit": { videoUrl:"https://www.youtube.com/watch?v=cu0fHp8HCDo", source:"FitnessFAQs", title:"Best Exercises To Increase L-SIT HOLD" },
  "V-sit compression": { videoUrl:"https://www.youtube.com/watch?v=cu0fHp8HCDo", source:"FitnessFAQs", title:"Best Exercises To Increase L-SIT HOLD" },
  "Échauffement général": { videoUrl:"https://www.youtube.com/watch?v=rdYq0hZa-Aw", source:"FitnessFAQs", title:"Do This BEFORE Every Calisthenics Workout" },
  "Échauffement jambes": { videoUrl:"https://www.youtube.com/watch?v=jj2AAH6jbHk", source:"Tom Merrick", title:"12 Minute Hip Mobility Routine" },
  "Échauffement tirage": { videoUrl:"https://www.youtube.com/watch?v=rdYq0hZa-Aw", source:"FitnessFAQs", title:"Do This BEFORE Every Calisthenics Workout" },
  "Échauffement épaules & poignets": { videoUrl:"https://www.youtube.com/watch?v=rdYq0hZa-Aw", source:"FitnessFAQs", title:"Do This BEFORE Every Calisthenics Workout" },
  "Épaules / grand dorsal / pectoraux": { videoUrl:"https://www.youtube.com/watch?v=rdYq0hZa-Aw", source:"FitnessFAQs", title:"Do This BEFORE Every Calisthenics Workout" },
  "Étirement grand dorsal": { videoUrl:"https://www.youtube.com/watch?v=EC4MkH0XpXY", source:"Good Life Physical Therapy", title:"12 Minute Full Body Stretch" },
  "Étirement ischios": { videoUrl:"https://www.youtube.com/watch?v=rCjKTy9NXM0", source:"Tom Merrick", title:"50 Minute Full Body Flexibility" },
  "Étirement mollets": { videoUrl:"https://www.youtube.com/watch?v=yZCfQ6YbAvA", source:"E3 Rehab", title:"Standing Calf Stretch" },
  "Étirement pectoral encadrement": { videoUrl:"https://www.youtube.com/watch?v=EC4MkH0XpXY", source:"Good Life Physical Therapy", title:"12 Minute Full Body Stretch" },
};

function youtubeVideoId(url="") {
  const m=String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}
function tutorialFor(name) {
  const saved=getTutorialOverrides()[name]||{};
  const builtin=DEFAULT_TUTORIALS[name]||{};
  const videoUrl=(saved.videoUrl||builtin.videoUrl||"").trim();
  const explicitImage=(saved.imageUrl||builtin.imageUrl||"").trim();
  const hasOverride=Boolean((saved.videoUrl||"").trim() || (saved.imageUrl||"").trim());
  const source=hasOverride ? "Tutoriel personnalisé" : (builtin.source||"").trim();
  const title=hasOverride ? "" : (builtin.title||"").trim();
  const query=TUTORIAL_QUERIES[name]||exerciseInfo(name)?.query||`${name} exercice tutoriel`;
  const fallback=`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  const ytId=youtubeVideoId(videoUrl);
  return {
    url: videoUrl || explicitImage || fallback,
    videoUrl,
    imageUrl: explicitImage || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : ""),
    exact: Boolean(videoUrl || explicitImage),
    mediaType: videoUrl ? "video" : (explicitImage ? "image" : "search"),
    source, title,
    label: videoUrl ? "Voir la vidéo" : (explicitImage ? "Voir l'image" : "Trouver une vidéo")
  };
}
function tutorialLink(name, compact=false) {
  const t=tutorialFor(name);
  if(compact) return `<a class="tutorial-link tutorial-link-compact ${t.exact?'exact':''}" href="${esc(t.url)}" target="_blank" rel="noopener noreferrer" aria-label="Tutoriel vidéo pour ${esc(name)}"><span aria-hidden="true">▶</span>${t.label}</a>`;
  return `<a class="tutorial-link tutorial-link-full ${t.exact?'exact':''}" href="${esc(t.url)}" target="_blank" rel="noopener noreferrer" aria-label="Tutoriel vidéo pour ${esc(name)}">
    ${t.imageUrl?`<img class="tutorial-thumb" src="${esc(t.imageUrl)}" alt="" loading="lazy">`:''}
    <span class="tutorial-copy"><strong><span aria-hidden="true">▶</span> ${t.label}</strong><small>${t.mediaType==='video'?(t.source?`${t.source}${t.title?` · ${t.title}`:''}`:'Vidéo sélectionnée pour cet exercice'):t.mediaType==='image'?'Image de référence sélectionnée':'Recherche de secours · tu peux choisir une vidéo précise dans Profil'}</small></span>
  </a>`;
}

function exerciseImage(name, size="small") {
  const t=tutorialFor(name);
  if(!t.imageUrl)return `<div class="exercise-image-placeholder ${size}" aria-hidden="true">${esc(String(name||'?').trim().charAt(0).toUpperCase())}</div>`;
  return `<a class="exercise-image ${size}" href="${esc(t.videoUrl||t.url)}" target="_blank" rel="noopener noreferrer" aria-label="Voir le tutoriel de ${esc(name)}"><img src="${esc(t.imageUrl)}" alt="Démonstration de ${esc(name)}" loading="lazy"></a>`;
}
function getStravaActivities(){return parse(STORAGE.stravaActivities,[]);}
function setStravaActivities(v){save(STORAGE.stravaActivities,v);}
function getStravaMeta(){return parse(STORAGE.stravaMeta,{lastSync:null});}
function setStravaMeta(v){save(STORAGE.stravaMeta,v);}
function isoDayLocal(){const d=new Date(),off=d.getTimezoneOffset()*60000;return new Date(d-off).toISOString().slice(0,10);}
function isRunActivity(a){return ['Run','TrailRun','VirtualRun'].includes(a?.sport_type)||a?.type==='Run';}
function todayStravaRuns(){const key=isoDayLocal();return getStravaActivities().filter(a=>isRunActivity(a)&&String(a.start_date_local||a.start_date||'').slice(0,10)===key);}
function stravaMinutes(a){return Math.round(Number(a.moving_time||a.elapsed_time||0)/60);}
function stravaDistanceKm(a){return Number(a.distance||0)/1000;}
function stravaPace(a){const km=stravaDistanceKm(a),sec=Number(a.moving_time||0);if(!km||!sec)return '—';const p=sec/km,m=Math.floor(p/60),ss=Math.round(p%60);return `${m}:${String(ss).padStart(2,'0')}/km`;}
function cardioTargetSeconds(w){return Number((w?.exercises||[]).find(e=>e.name==='Cardio Zone 2')?.target||0);}
function renderStravaRunRows(runs=todayStravaRuns()){return runs.map(a=>`<div class="strava-activity-row"><div><strong>${esc(a.name||'Course')}</strong><small>${stravaDistanceKm(a).toFixed(2)} km · ${stravaPace(a)}</small></div><span>${stravaMinutes(a)} min</span></div>`).join('');}
function stravaAthleteName(){const a=state.stravaStatus?.athlete;return a?`${a.firstname||''} ${a.lastname||''}`.trim():'';}
function renderStravaHomeStatus(){
  const st=state.stravaStatus,meta=getStravaMeta(),acts=getStravaActivities().filter(isRunActivity),latest=acts[0]||null;
  if(!st.checked)return `<section class="card strava-status-card"><div class="strava-status-line"><span class="strava-dot checking"></span><div><strong>Strava</strong><small>Vérification de la connexion…</small></div><span class="strava-wordmark">STRAVA</span></div></section>`;
  if(!st.connected)return `<section class="card strava-status-card"><div class="strava-status-line"><span class="strava-dot off"></span><div class="grow"><strong>Strava non connecté</strong><small>${state.stravaMessage?esc(state.stravaMessage):'Connecte ton compte pour synchroniser automatiquement tes courses.'}</small></div><span class="strava-wordmark">STRAVA</span></div><div class="strava-actions"><a class="btn btn-primary strava-home-connect" href="/api/strava/auth">Connecter Strava</a><a class="btn btn-outline" href="/api/strava/status?diagnostic=1" target="_blank" rel="noopener">Diagnostic</a></div></section>`;
  const athlete=stravaAthleteName();
  const syncLabel=meta.lastSync?`Dernière synchro : ${formatDate(meta.lastSync)}`:'Connexion confirmée · première synchro à faire';
  const latestText=latest?`${esc(latest.name||'Course')} · ${stravaDistanceKm(latest).toFixed(2)} km · ${stravaMinutes(latest)} min`:'Aucune course importée pour le moment';
  return `<section class="card strava-status-card connected"><div class="strava-status-line"><span class="strava-dot on"></span><div class="grow"><strong>Strava connecté${athlete?` · ${esc(athlete)}`:''} ✓</strong><small>${syncLabel}</small></div><span class="strava-wordmark">STRAVA</span></div><div class="strava-home-latest">${latestText}</div><div class="strava-actions"><a class="btn btn-outline" href="https://www.strava.com/" target="_blank" rel="noopener noreferrer">Ouvrir Strava</a><button class="btn btn-secondary" id="syncStrava" ${state.stravaSyncing?'disabled':''}>${state.stravaSyncing?'Synchronisation…':'Synchroniser'}</button></div></section>`;
}
function renderStravaToday(w){
  const target=cardioTargetSeconds(w);if(!target)return '';
  const st=state.stravaStatus,runs=todayStravaRuns(),done=runs.reduce((n,a)=>n+Number(a.moving_time||a.elapsed_time||0),0),pct=Math.min(100,Math.round(done/target*100));
  if(!st.checked)return `<section class="card strava-card"><div class="kicker">Course</div><h2>Strava</h2><p class="muted small">Vérification de la connexion…</p></section>`;
  if(!st.connected)return `<section class="card strava-card"><div class="strava-head"><div><div class="kicker">Course prévue</div><h2>≈ ${Math.round(target/60)} min de cardio</h2></div><span class="strava-wordmark">STRAVA</span></div><p class="muted">Connecte ton compte pour récupérer automatiquement la durée, la distance et l’allure de tes courses.</p><div class="strava-actions"><a class="btn btn-primary" href="/api/strava/auth">Connecter avec Strava</a><a class="btn btn-outline" href="/api/strava/status?diagnostic=1" target="_blank" rel="noopener">Diagnostic</a></div></section>`;
  return `<section class="card strava-card"><div class="strava-head"><div><div class="kicker">Cardio · Compatible avec Strava</div><h2>${runs.length?(pct>=100?'Durée validée ✓':`${Math.round(done/60)} / ${Math.round(target/60)} min`):`Objectif : ${Math.round(target/60)} min`}</h2></div><span class="strava-wordmark">STRAVA</span></div>${runs.length?`<div class="strava-progress"><span style="width:${pct}%"></span></div>${renderStravaRunRows(runs)}`:'<p class="muted small">Aucune course synchronisée aujourd’hui.</p>'}<div class="strava-actions"><a class="btn btn-primary" href="https://www.strava.com/" target="_blank" rel="noopener noreferrer">Ouvrir Strava</a><button class="btn btn-secondary" id="syncStrava">Synchroniser</button></div><p class="install-note">La durée peut être validée automatiquement. La Zone 2 reste à confirmer selon ta fréquence cardiaque ou ton ressenti.</p></section>`;
}
function renderStravaProfile(){
  const st=state.stravaStatus,meta=getStravaMeta(),acts=getStravaActivities().filter(isRunActivity).slice(0,5);
  if(!st.checked)return `<section class="card strava-card"><h2>Strava</h2><p class="muted">Vérification…</p></section>`;
  if(!st.connected)return `<section class="card strava-card"><div class="strava-head"><div><div class="kicker">Course</div><h2>Connexion Strava</h2></div><span class="strava-wordmark">STRAVA</span></div><p class="muted small">Synchronise tes courses pour valider le cardio prévu par KINETIK. Les identifiants Strava restent côté serveur Vercel.</p>${state.stravaMessage?`<div class="coach-note recover">${esc(state.stravaMessage)}</div>`:''}<div class="strava-actions"><a class="btn btn-primary" href="/api/strava/auth">Connecter avec Strava</a><a class="btn btn-outline" href="/api/strava/status?diagnostic=1" target="_blank" rel="noopener">Diagnostic</a></div></section>`;
  const athlete=st.athlete?`${st.athlete.firstname||''} ${st.athlete.lastname||''}`.trim():'';
  return `<section class="card strava-card"><div class="strava-head"><div><div class="kicker">Connecté</div><h2>${athlete||'Strava'}</h2></div><span class="strava-wordmark">STRAVA</span></div>${meta.lastSync?`<p class="muted small">Dernière synchronisation : ${formatDate(meta.lastSync)}</p>`:''}${acts.length?`<div class="strava-activity-list">${renderStravaRunRows(acts)}</div>`:'<p class="muted small">Synchronise pour importer tes dernières courses.</p>'}<div class="strava-actions"><button class="btn btn-primary" id="syncStrava">Synchroniser les courses</button><button class="btn btn-outline" id="disconnectStrava">Déconnecter</button></div></section>`;
}
async function loadStravaStatus(){
  state.stravaStatus.loading=true;
  try{const r=await fetch('/api/strava/status',{credentials:'same-origin',cache:'no-store'});const data=await r.json();state.stravaStatus={checked:true,loading:false,connected:!!data.connected,athlete:data.athlete||null,scope:data.scope||''};}
  catch{state.stravaStatus={checked:true,loading:false,connected:false,athlete:null,scope:''};}
  if(!state.active&&!state.quickEditor)render();
}
async function syncStravaActivities(){
  if(state.stravaSyncing)return;state.stravaSyncing=true;state.stravaMessage='Synchronisation…';render();
  try{const r=await fetch('/api/strava/activities?days=21',{credentials:'same-origin',cache:'no-store'});const data=await r.json();if(!r.ok)throw new Error(data.error||'Strava');setStravaActivities(data.activities||[]);setStravaMeta({lastSync:new Date().toISOString()});state.stravaMessage=`${(data.activities||[]).filter(isRunActivity).length} course(s) synchronisée(s)`;}
  catch(e){state.stravaMessage=e.message||'Synchronisation impossible';}
  finally{state.stravaSyncing=false;render();}
}
async function disconnectStrava(){
  try{await fetch('/api/strava/disconnect',{method:'POST',credentials:'same-origin'});}catch{}
  setStravaActivities([]);setStravaMeta({lastSync:null});state.stravaStatus={checked:true,loading:false,connected:false,athlete:null,scope:''};state.stravaMessage='Strava déconnecté';render();
}

const FLEX_ROUTINES = [
  {
    id:"reset-10", name:"Reset mobilité", subtitle:"Routine douce pour récupérer et rester mobile", duration:10, intensity:"Douce", focus:"Tout le corps",
    exercises:[
      ex("Respiration diaphragmatique","timer",1,60,0,"Respire lentement par le nez. Expiration longue, épaules relâchées."),
      ex("Cat-cow","reps",2,8,20,"Bouge vertèbre par vertèbre sans forcer l'amplitude."),
      ex("90/90 hanches","hold_side",1,40,20,"Reste dans une tension confortable et respire."),
      ex("Fléchisseurs de hanche","hold_side",1,40,20,"Rétroverse légèrement le bassin."),
      ex("Flexion avant ischios","hold",1,45,20,"Genoux légèrement fléchis si nécessaire."),
      ex("Child's pose latéral","hold_side",1,35,15,"Cherche l'allongement du flanc et du grand dorsal."),
      ex("Étirement pectoral encadrement","hold_side",1,30,0,"Épaule basse, aucune douleur à l'avant de l'épaule.")
    ]
  },
  {
    id:"lower-18", name:"Hanches & jambes", subtitle:"Chevilles, hanches, adducteurs et chaîne postérieure", duration:18, intensity:"Modérée", focus:"Bas du corps",
    exercises:[
      ex("Knee-to-wall chevilles","reps_side",2,10,25,"Talons au sol. Avance le genou sans effondrer la voûte plantaire."),
      ex("Deep squat hold","hold",2,45,30,"Talons au sol si possible. Utilise un support si nécessaire."),
      ex("90/90 hanches","hold_side",2,45,25,"Buste long, ne force pas le genou."),
      ex("Couch stretch","hold_side",2,40,30,"Fessier contracté légèrement, bassin neutre."),
      ex("Adductor rock-back","reps_side",2,8,25,"Recule les hanches lentement, dos neutre."),
      ex("Frog stretch","hold",2,40,30,"Tension progressive dans les adducteurs, jamais de douleur vive."),
      ex("Ischios","hold_side",2,45,20,"Respiration lente, amplitude progressive."),
      ex("Étirement mollets","hold_side",1,45,0,"Talons lourds au sol, genou aligné.")
    ]
  },
  {
    id:"upper-15", name:"Épaules & haut du corps", subtitle:"Poignets, épaules, pectoraux, dorsaux et thorax", duration:15, intensity:"Douce à modérée", focus:"Haut du corps",
    exercises:[
      ex("Poignets flexion / extension","timer",1,120,0,"Mouvements lents. Ne charge jamais un poignet douloureux."),
      ex("Rotation thoracique","reps_side",2,8,25,"Le bassin reste stable pendant la rotation."),
      ex("Pass-through avec bande","reps",2,10,25,"Prends une bande large et élargis les mains autant que nécessaire."),
      ex("Étirement pectoral encadrement","hold_side",2,35,25,"Évite de pousser l'épaule vers l'avant."),
      ex("Étirement grand dorsal","hold_side",2,40,25,"Respire dans les côtes et garde les abdos légèrement actifs."),
      ex("Child's pose latéral","hold_side",1,40,20,"Allonge le côté du tronc sans pincer l'épaule."),
      ex("Mobilité épaules / pectoraux / poignets","timer",1,180,0,"Finis avec des mouvements libres et doux.")
    ]
  },
  {
    id:"full-25", name:"Full Body souplesse", subtitle:"Routine complète pour construire de l'amplitude durable", duration:26, intensity:"Modérée", focus:"Tout le corps",
    exercises:[
      ex("Respiration diaphragmatique","timer",1,60,0,"Commence par relâcher le tonus inutile."),
      ex("Knee-to-wall chevilles","reps_side",2,10,20,"Cherche une amplitude symétrique."),
      ex("Deep squat hold","hold",2,45,25,"Respire en position basse sans t'écraser."),
      ex("90/90 hanches","hold_side",2,45,25,"Travaille les deux côtés."),
      ex("Couch stretch","hold_side",2,45,25,"Bassin légèrement rétroversé."),
      ex("Frog stretch","hold",2,45,25,"Reste loin de la douleur."),
      ex("Flexion avant ischios","hold",2,45,25,"Pense longueur plutôt que toucher le sol à tout prix."),
      ex("Rotation thoracique","reps_side",2,8,20,"Rotation douce et contrôlée."),
      ex("Pass-through avec bande","reps",2,10,20,"Amplitude sans pincement."),
      ex("Poignets flexion / extension","timer",1,60,15,"Mobilise doucement flexion et extension pour les appuis de handstand et pompes."),
      ex("Étirement pectoral encadrement","hold_side",1,40,20,"Respire profondément."),
      ex("Étirement grand dorsal","hold_side",1,40,0,"Finis sans forcer.")
    ]
  }
];

const MOBILITY_TESTS = [
  {id:"ankle_left", zone:"ankles", side:"Gauche", name:"Knee-to-wall gauche", short:"Cheville G", unit:"cm", target:10, max:25, note:"Distance gros orteil → mur, talon au sol.", min:0, step:.1},
  {id:"ankle_right", zone:"ankles", side:"Droite", name:"Knee-to-wall droite", short:"Cheville D", unit:"cm", target:10, max:25, note:"Même protocole à droite.", min:0, step:.1},
  {id:"hip_ir_left", zone:"hips", side:"Gauche", name:"Rotation interne hanche gauche", short:"Hanche G", unit:"°", target:35, max:90, note:"Mesure en position 90/90 avec bassin stable.", min:0, step:1},
  {id:"hip_ir_right", zone:"hips", side:"Droite", name:"Rotation interne hanche droite", short:"Hanche D", unit:"°", target:35, max:90, note:"Même protocole à droite.", min:0, step:1},
  {id:"forward_fold", zone:"posterior", name:"Flexion avant", short:"Chaîne postérieure", unit:"cm", target:0, max:30, note:"0 = doigts aux orteils. Positif = au-delà, négatif = avant les orteils.", min:-50, step:.5},
  {id:"deep_squat", zone:"hips", name:"Deep squat confortable", short:"Squat profond", unit:"sec", target:60, max:300, score:false, note:"Test fonctionnel : talons au sol, position stable et confortable.", min:0, step:1},
  {id:"shoulder_flex_left", zone:"shoulders", side:"Gauche", name:"Flexion épaule gauche", short:"Épaule G", unit:"°", target:170, max:210, note:"Bras au-dessus de la tête sans compensation lombaire.", min:0, step:1},
  {id:"shoulder_flex_right", zone:"shoulders", side:"Droite", name:"Flexion épaule droite", short:"Épaule D", unit:"°", target:170, max:210, note:"Même protocole à droite.", min:0, step:1},
  {id:"thoracic_rotation_left", zone:"thorax", side:"Gauche", name:"Rotation thoracique gauche", short:"Thorax G", unit:"°", target:45, max:90, note:"Rotation assise ou quadrupédie, bassin stable.", min:0, step:1},
  {id:"thoracic_rotation_right", zone:"thorax", side:"Droite", name:"Rotation thoracique droite", short:"Thorax D", unit:"°", target:45, max:90, note:"Même protocole à droite.", min:0, step:1},
  {id:"wrist_extension_left", zone:"wrists", side:"Gauche", name:"Extension poignet gauche", short:"Poignet G", unit:"°", target:70, max:110, note:"Coude tendu, paume en appui, mesure sans douleur.", min:0, step:1},
  {id:"wrist_extension_right", zone:"wrists", side:"Droite", name:"Extension poignet droite", short:"Poignet D", unit:"°", target:70, max:110, note:"Même protocole à droite.", min:0, step:1}
];


// V8 · Bibliothèque structurée et moteur d'entraînement
function lib(name, category, level, equipment, muscles, opts={}) {
  return {
    name, category, level, equipment, muscles,
    regression: opts.regression || null,
    progression: opts.progression || null,
    substitutes: opts.substitutes || [],
    query: opts.query || `${name} proper form tutorial`,
    prescription: opts.prescription || null,
    tip: opts.tip || "Exécution contrôlée, amplitude confortable et aucune douleur articulaire vive.",
    volume: opts.volume || {},
    advanceAt: opts.advanceAt || null,
  };
}

const EXERCISE_LIBRARY = [
  // PUSH
  lib("Pompes inclinées","Push","Débutant","Support surélevé",["Pectoraux","Triceps","Épaules"],{progression:"Pompes",substitutes:["Band chest press"],prescription:{type:"reps",target:10,rest:75},advanceAt:15,volume:{Pectoraux:1,Triceps:.6,Épaules:.35},query:"incline push up proper form beginner"}),
  lib("Pompes","Push","Débutant","Poignées / sol",["Pectoraux","Triceps","Épaules"],{regression:"Pompes inclinées",progression:"Pompes pieds surélevés",substitutes:["Band chest press","Pompes serrées"],prescription:{type:"reps",target:10,rest:90},advanceAt:15,volume:{Pectoraux:1,Triceps:.6,Épaules:.35},query:"push up perfect form tutorial"}),
  lib("Pompes pieds surélevés","Push","Intermédiaire","Poignées + support",["Pectoraux","Épaules","Triceps"],{regression:"Pompes",progression:"Pompes archer",substitutes:["Pseudo-planche push-ups"],prescription:{type:"reps",target:6,rest:90},advanceAt:12,volume:{Pectoraux:1,Épaules:.55,Triceps:.5},query:"decline push up proper form tutorial"}),
  lib("Pompes archer","Push","Intermédiaire","Poignées / sol",["Pectoraux","Triceps","Core"],{regression:"Pompes pieds surélevés",progression:"Pseudo-planche push-ups",substitutes:["Pompes"],prescription:{type:"reps_side",target:5,rest:105},advanceAt:8,volume:{Pectoraux:1,Triceps:.55,Core:.25},query:"archer push up tutorial calisthenics"}),
  lib("Pompes serrées","Push","Débutant","Poignées / sol",["Triceps","Pectoraux"],{regression:"Pompes inclinées",progression:"Dips assistés",substitutes:["Extension triceps avec bande"],prescription:{type:"reps",target:8,rest:75},advanceAt:15,volume:{Triceps:1,Pectoraux:.55},query:"diamond close grip push up proper form"}),
  lib("Pseudo-planche push-ups","Push","Avancé","Poignées / sol",["Épaules","Pectoraux","Triceps","Core"],{regression:"Pompes pieds surélevés",progression:"Planche lean",substitutes:["Pike push-ups"],prescription:{type:"reps",target:5,rest:120},advanceAt:10,volume:{Épaules:1,Pectoraux:.7,Triceps:.45,Core:.3},query:"pseudo planche push up tutorial"}),
  lib("Band chest press","Push","Débutant","Bande",["Pectoraux","Triceps"],{progression:"Pompes",substitutes:["Pompes inclinées"],prescription:{type:"reps_band",target:12,rest:60},advanceAt:18,volume:{Pectoraux:1,Triceps:.45},query:"resistance band chest press tutorial"}),
  lib("Dips assistés","Push","Débutant","Barres + bande",["Pectoraux","Triceps","Épaules"],{progression:"Dips",substitutes:["Pompes serrées"],prescription:{type:"reps_band",target:6,rest:120},advanceAt:10,volume:{Pectoraux:.8,Triceps:1,Épaules:.45},query:"band assisted dips proper form"}),
  lib("Dips","Push","Intermédiaire","Barres parallèles",["Pectoraux","Triceps","Épaules"],{regression:"Dips assistés",progression:"Dips tempo",substitutes:["Pompes serrées","Band chest press"],prescription:{type:"reps",target:6,rest:120},advanceAt:10,volume:{Pectoraux:.8,Triceps:1,Épaules:.45},query:"parallel bar dips proper form tutorial"}),
  lib("Dips tempo","Push","Intermédiaire","Barres parallèles",["Pectoraux","Triceps","Épaules"],{regression:"Dips",progression:"Dips lestés",substitutes:["Dips"],prescription:{type:"reps",target:5,rest:135},advanceAt:8,volume:{Pectoraux:.8,Triceps:1,Épaules:.45},query:"slow tempo dips tutorial"}),
  lib("Dips lestés","Push","Avancé","Barres + charge",["Pectoraux","Triceps","Épaules"],{regression:"Dips tempo",substitutes:["Dips"],prescription:{type:"reps",target:5,rest:150},advanceAt:8,volume:{Pectoraux:.85,Triceps:1,Épaules:.45},query:"weighted dips proper form tutorial"}),
  lib("Pike push-ups","Push","Débutant","Poignées / sol",["Épaules","Triceps"],{progression:"Pike push-ups pieds surélevés",substitutes:["Pompes"],prescription:{type:"reps",target:7,rest:90},advanceAt:10,volume:{Épaules:1,Triceps:.55},query:"pike push up tutorial handstand push up"}),
  lib("Pike push-ups pieds surélevés","Push","Intermédiaire","Support",["Épaules","Triceps"],{regression:"Pike push-ups",progression:"HSPU négatives au mur",substitutes:["Pike push-ups"],prescription:{type:"reps",target:5,rest:105},advanceAt:8,volume:{Épaules:1,Triceps:.6},query:"elevated pike push up tutorial"}),
  lib("HSPU négatives au mur","Push","Avancé","Mur",["Épaules","Triceps","Core"],{regression:"Pike push-ups pieds surélevés",progression:"Handstand push-up au mur",substitutes:["Pike push-ups"],prescription:{type:"reps",target:3,rest:150},advanceAt:6,volume:{Épaules:1,Triceps:.65,Core:.25},query:"wall handstand push up negative tutorial"}),
  lib("Handstand push-up au mur","Push","Avancé","Mur",["Épaules","Triceps","Core"],{regression:"HSPU négatives au mur",progression:"Handstand push-up libre",prescription:{type:"reps",target:3,rest:150},advanceAt:6,volume:{Épaules:1,Triceps:.7,Core:.3},query:"wall handstand push up tutorial"}),
  lib("Handstand push-up libre","Push","Expert","Sol",["Épaules","Triceps","Core"],{regression:"Handstand push-up au mur",prescription:{type:"reps",target:1,rest:180},advanceAt:5,volume:{Épaules:1,Triceps:.7,Core:.35},query:"freestanding handstand push up tutorial"}),
  lib("Extension triceps avec bande","Push","Débutant","Bande",["Triceps"],{substitutes:["Pompes serrées"],prescription:{type:"reps_band",target:12,rest:60},advanceAt:18,volume:{Triceps:1},query:"resistance band triceps extension tutorial"}),

  // PULL + GRIP
  lib("Row avec bande","Pull","Débutant","Bande",["Dos","Biceps"],{progression:"Australian rows",substitutes:["Face pulls"],prescription:{type:"reps_band",target:12,rest:75},advanceAt:18,volume:{Dos:1,Biceps:.5},query:"resistance band row proper form"}),
  lib("Australian rows","Pull","Débutant","Barre basse / anneaux",["Dos","Biceps","Core"],{regression:"Row avec bande",progression:"Tractions assistées",substitutes:["Row avec bande"],prescription:{type:"reps",target:8,rest:90},advanceAt:12,volume:{Dos:1,Biceps:.5,Core:.2},query:"australian pull up inverted row tutorial"}),
  lib("Tractions assistées","Pull","Débutant","Barre + bande",["Dos","Biceps","Grip"],{regression:"Australian rows",progression:"Tractions strictes",substitutes:["Row avec bande","Chin-ups assistés"],prescription:{type:"reps_band",target:6,rest:120},advanceAt:8,volume:{Dos:1,Biceps:.55,Grip:.5},query:"band assisted pull up tutorial proper form"}),
  lib("Tractions strictes","Pull","Intermédiaire","Barre",["Dos","Biceps","Grip"],{regression:"Tractions assistées",progression:"Chest-to-bar",substitutes:["Chin-ups"],prescription:{type:"reps",target:5,rest:120},advanceAt:10,volume:{Dos:1,Biceps:.55,Grip:.5},query:"strict pull up perfect form tutorial"}),
  lib("Chest-to-bar","Pull","Intermédiaire","Barre",["Dos","Biceps","Grip"],{regression:"Tractions strictes",progression:"Tractions explosives",substitutes:["Tractions strictes"],prescription:{type:"reps",target:4,rest:135},advanceAt:8,volume:{Dos:1,Biceps:.55,Grip:.5},query:"chest to bar pull up tutorial calisthenics"}),
  lib("Tractions explosives","Pull","Avancé","Barre",["Dos","Biceps","Grip","Core"],{regression:"Chest-to-bar",progression:"Muscle-up assisté",substitutes:["Chest-to-bar"],prescription:{type:"reps",target:3,rest:150},advanceAt:6,volume:{Dos:1,Biceps:.5,Grip:.5,Core:.2},query:"explosive pull up chest high tutorial"}),
  lib("Muscle-up assisté","Skill","Avancé","Barre + bande",["Dos","Pectoraux","Triceps","Core"],{regression:"Tractions explosives",progression:"Muscle-up strict",substitutes:["Chest-to-bar","Dips"],prescription:{type:"reps_band",target:3,rest:180},advanceAt:5,volume:{Dos:.8,Pectoraux:.5,Triceps:.5,Core:.25},query:"band assisted muscle up tutorial"}),
  lib("Muscle-up strict","Skill","Expert","Barre",["Dos","Pectoraux","Triceps","Core"],{regression:"Muscle-up assisté",prescription:{type:"reps",target:1,rest:180},advanceAt:5,volume:{Dos:.8,Pectoraux:.5,Triceps:.5,Core:.25},query:"strict bar muscle up tutorial"}),
  lib("Chin-ups assistés","Pull","Débutant","Barre + bande",["Dos","Biceps","Grip"],{progression:"Chin-ups",substitutes:["Tractions assistées"],prescription:{type:"reps_band",target:6,rest:105},advanceAt:10,volume:{Dos:.85,Biceps:.8,Grip:.45},query:"band assisted chin up tutorial"}),
  lib("Chin-ups","Pull","Intermédiaire","Barre",["Dos","Biceps","Grip"],{regression:"Chin-ups assistés",progression:"Archer pull-ups assistés",substitutes:["Tractions strictes"],prescription:{type:"reps",target:5,rest:120},advanceAt:10,volume:{Dos:.85,Biceps:.8,Grip:.45},query:"chin up proper form tutorial"}),
  lib("Archer pull-ups assistés","Pull","Avancé","Barre + bande",["Dos","Biceps","Grip"],{regression:"Chin-ups",progression:"Archer pull-ups",substitutes:["Chest-to-bar"],prescription:{type:"reps_side",target:3,rest:150},advanceAt:6,volume:{Dos:1,Biceps:.6,Grip:.5},query:"assisted archer pull up tutorial"}),
  lib("Archer pull-ups","Pull","Expert","Barre",["Dos","Biceps","Grip"],{regression:"Archer pull-ups assistés",prescription:{type:"reps_side",target:2,rest:165},advanceAt:5,volume:{Dos:1,Biceps:.6,Grip:.5},query:"archer pull up tutorial"}),
  lib("Scapular pull-ups","Pull","Débutant","Barre",["Dos","Épaules"],{progression:"Tractions assistées",substitutes:["Face pulls"],prescription:{type:"reps",target:8,rest:60},advanceAt:15,volume:{Dos:.5,Épaules:.3},query:"scapular pull up tutorial"}),
  lib("Face pulls","Pull","Débutant","Bande",["Dos","Épaules"],{substitutes:["Rotation externe avec bande"],prescription:{type:"reps_band",target:15,rest:60},advanceAt:20,volume:{Dos:.45,Épaules:.55},query:"resistance band face pull tutorial"}),
  lib("Curl biceps avec bande","Pull","Débutant","Bande",["Biceps"],{substitutes:["Chin-ups assistés"],prescription:{type:"reps_band",target:12,rest:60},advanceAt:18,volume:{Biceps:1},query:"resistance band biceps curl tutorial"}),
  lib("Dead hang","Grip","Débutant","Barre",["Grip","Dos","Épaules"],{progression:"Towel hang",prescription:{type:"hold",target:30,rest:90},advanceAt:60,volume:{Grip:1,Dos:.2,Épaules:.15},query:"dead hang proper form tutorial"}),
  lib("Towel hang","Grip","Intermédiaire","Barre + serviette",["Grip","Biceps"],{regression:"Dead hang",progression:"One-arm assisted hang",prescription:{type:"hold",target:20,rest:105},advanceAt:45,volume:{Grip:1,Biceps:.25},query:"towel hang grip training tutorial"}),
  lib("One-arm assisted hang","Grip","Avancé","Barre",["Grip","Dos","Épaules"],{regression:"Towel hang",prescription:{type:"hold_side",target:10,rest:120},advanceAt:25,volume:{Grip:1,Dos:.25,Épaules:.2},query:"assisted one arm dead hang tutorial"}),

  // CORE
  lib("Planche avant-bras","Core","Débutant","Tapis",["Core","Épaules"],{progression:"Hollow hold",substitutes:["Dead bug"],prescription:{type:"hold",target:30,rest:45},advanceAt:90,volume:{Core:1,Épaules:.1},query:"forearm plank proper form tutorial"}),
  lib("Side plank","Core","Débutant","Tapis",["Core","Épaules"],{progression:"Side plank étoile",substitutes:["Pallof press avec bande"],prescription:{type:"hold_side",target:20,rest:45},advanceAt:60,volume:{Core:1,Épaules:.1},query:"side plank proper form tutorial"}),
  lib("Side plank étoile","Core","Intermédiaire","Tapis",["Core","Hanches","Épaules"],{regression:"Side plank",prescription:{type:"hold_side",target:15,rest:60},advanceAt:45,volume:{Core:1,Hanches:.3,Épaules:.15},query:"star side plank tutorial"}),
  lib("Reverse plank","Core","Débutant","Tapis",["Core","Fessiers","Épaules"],{substitutes:["Planche avant-bras"],prescription:{type:"hold",target:30,rest:45},advanceAt:75,volume:{Core:.8,Fessiers:.35,Épaules:.15},query:"reverse plank proper form tutorial"}),
  lib("Dead bug","Core","Débutant","Tapis",["Core"],{progression:"Hollow hold",prescription:{type:"reps_side",target:8,rest:45},advanceAt:12,volume:{Core:1},query:"dead bug exercise proper form"}),
  lib("Hollow hold","Core","Débutant","Tapis",["Core"],{regression:"Dead bug",progression:"Hollow rocks",substitutes:["Dead bug"],prescription:{type:"hold",target:20,rest:60},advanceAt:40,volume:{Core:1},query:"hollow body hold tutorial calisthenics"}),
  lib("Hollow rocks","Core","Intermédiaire","Tapis",["Core"],{regression:"Hollow hold",progression:"Dragon flag négatives",prescription:{type:"reps",target:8,rest:75},advanceAt:15,volume:{Core:1},query:"hollow body rocks tutorial"}),
  lib("Hanging knee raises","Core","Débutant","Barre",["Core","Grip"],{progression:"Hanging leg raises",substitutes:["Reverse crunch"],prescription:{type:"reps",target:8,rest:75},advanceAt:12,volume:{Core:1,Grip:.3},query:"hanging knee raise tutorial calisthenics"}),
  lib("Hanging leg raises","Core","Intermédiaire","Barre",["Core","Grip"],{regression:"Hanging knee raises",progression:"Toes-to-bar",prescription:{type:"reps",target:6,rest:90},advanceAt:10,volume:{Core:1,Grip:.35},query:"hanging straight leg raise tutorial"}),
  lib("Toes-to-bar","Core","Avancé","Barre",["Core","Grip"],{regression:"Hanging leg raises",prescription:{type:"reps",target:5,rest:105},advanceAt:10,volume:{Core:1,Grip:.4},query:"strict toes to bar tutorial calisthenics"}),
  lib("Reverse crunch","Core","Débutant","Tapis",["Core"],{progression:"Hanging knee raises",substitutes:["Dead bug"],prescription:{type:"reps",target:10,rest:60},advanceAt:15,volume:{Core:1},query:"reverse crunch proper form tutorial"}),
  lib("Pallof press avec bande","Core","Débutant","Bande + ancrage",["Core"],{substitutes:["Side plank"],prescription:{type:"reps_side",target:10,rest:45},advanceAt:15,volume:{Core:.8},query:"resistance band pallof press anti rotation proper form tutorial"}),
  lib("Tuck L-sit","Core","Débutant","Barres parallèles / poignées",["Core","Triceps","Épaules"],{progression:"One-leg L-sit",substitutes:["Hollow hold"],prescription:{type:"hold",target:10,rest:60},advanceAt:20,volume:{Core:1,Triceps:.25,Épaules:.2},query:"tuck l sit tutorial beginner calisthenics"}),
  lib("One-leg L-sit","Core","Intermédiaire","Barres parallèles / poignées",["Core","Triceps","Épaules"],{regression:"Tuck L-sit",progression:"L-sit",prescription:{type:"hold_side",target:10,rest:75},advanceAt:20,volume:{Core:1,Triceps:.25,Épaules:.2},query:"one leg l sit progression tutorial"}),
  lib("L-sit","Core","Avancé","Barres parallèles / poignées",["Core","Triceps","Épaules"],{regression:"One-leg L-sit",progression:"V-sit compression",prescription:{type:"hold",target:10,rest:90},advanceAt:20,volume:{Core:1,Triceps:.25,Épaules:.2},query:"l sit proper form tutorial calisthenics"}),
  lib("V-sit compression","Core","Expert","Barres parallèles / sol",["Core","Hanches"],{regression:"L-sit",prescription:{type:"reps",target:6,rest:90},advanceAt:12,volume:{Core:1},query:"v sit compression drill tutorial"}),
  lib("Dragon flag négatives","Core","Avancé","Support",["Core"],{regression:"Hollow rocks",progression:"Dragon flag",prescription:{type:"reps",target:3,rest:120},advanceAt:6,volume:{Core:1},query:"dragon flag negative tutorial"}),
  lib("Dragon flag","Core","Expert","Support",["Core"],{regression:"Dragon flag négatives",prescription:{type:"reps",target:3,rest:135},advanceAt:8,volume:{Core:1},query:"dragon flag tutorial proper form"}),

  // LEGS
  lib("Squats poids du corps","Jambes","Débutant","Sol",["Quadriceps","Fessiers","Core"],{progression:"Squat tempo",substitutes:["Fentes arrière"],prescription:{type:"reps",target:12,rest:75},advanceAt:20,volume:{Quadriceps:1,Fessiers:.6,Core:.15},query:"bodyweight squat proper form tutorial"}),
  lib("Squat tempo","Jambes","Débutant","Sol",["Quadriceps","Fessiers"],{regression:"Squats poids du corps",progression:"Jump squats",substitutes:["Bulgarian split squat"],prescription:{type:"reps",target:10,rest:90},advanceAt:15,volume:{Quadriceps:1,Fessiers:.6},query:"tempo bodyweight squat tutorial"}),
  lib("Jump squats","Jambes","Intermédiaire","Sol",["Quadriceps","Fessiers","Mollets"],{regression:"Squat tempo",substitutes:["Squats poids du corps"],prescription:{type:"reps",target:5,rest:90},advanceAt:8,volume:{Quadriceps:.8,Fessiers:.6,Mollets:.35},query:"jump squat proper landing tutorial"}),
  lib("Fentes arrière","Jambes","Débutant","Sol",["Quadriceps","Fessiers"],{progression:"Bulgarian split squat",substitutes:["Squats poids du corps"],prescription:{type:"reps_side",target:8,rest:75},advanceAt:12,volume:{Quadriceps:1,Fessiers:.75},query:"reverse lunge proper form tutorial"}),
  lib("Bulgarian split squat","Jambes","Intermédiaire","Support",["Quadriceps","Fessiers"],{regression:"Fentes arrière",progression:"Shrimp squat assisté",substitutes:["Fentes arrière"],prescription:{type:"reps_side",target:8,rest:90},advanceAt:12,volume:{Quadriceps:1,Fessiers:.8},query:"bulgarian split squat bodyweight tutorial"}),
  lib("Shrimp squat assisté","Jambes","Avancé","Support",["Quadriceps","Fessiers","Core"],{regression:"Bulgarian split squat",progression:"Shrimp squat",substitutes:["Pistol squat assisté"],prescription:{type:"reps_side",target:5,rest:105},advanceAt:8,volume:{Quadriceps:1,Fessiers:.8,Core:.2},query:"assisted shrimp squat progression tutorial"}),
  lib("Shrimp squat","Jambes","Expert","Sol",["Quadriceps","Fessiers","Core"],{regression:"Shrimp squat assisté",prescription:{type:"reps_side",target:3,rest:120},advanceAt:6,volume:{Quadriceps:1,Fessiers:.8,Core:.2},query:"shrimp squat tutorial"}),
  lib("Pistol squat assisté","Jambes","Intermédiaire","Support",["Quadriceps","Fessiers","Core"],{regression:"Bulgarian split squat",progression:"Pistol squat",prescription:{type:"reps_side",target:4,rest:105},advanceAt:8,volume:{Quadriceps:1,Fessiers:.7,Core:.2},query:"assisted pistol squat tutorial"}),
  lib("Pistol squat","Jambes","Avancé","Sol",["Quadriceps","Fessiers","Core"],{regression:"Pistol squat assisté",prescription:{type:"reps_side",target:3,rest:120},advanceAt:8,volume:{Quadriceps:1,Fessiers:.7,Core:.2},query:"pistol squat tutorial proper form"}),
  lib("Romanian deadlift avec bande","Jambes","Débutant","Bande",["Ischios","Fessiers"],{progression:"Single-leg RDL",substitutes:["Hamstring curl avec bande"],prescription:{type:"reps_band",target:12,rest:75},advanceAt:18,volume:{Ischios:1,Fessiers:.7},query:"resistance band romanian deadlift tutorial"}),
  lib("Single-leg RDL","Jambes","Intermédiaire","Sol / bande",["Ischios","Fessiers","Core"],{regression:"Romanian deadlift avec bande",progression:"Nordic curl assisté",substitutes:["Hamstring curl avec bande"],prescription:{type:"reps_side",target:8,rest:90},advanceAt:12,volume:{Ischios:1,Fessiers:.7,Core:.2},query:"single leg romanian deadlift tutorial"}),
  lib("Hamstring curl avec bande","Jambes","Débutant","Bande",["Ischios"],{progression:"Nordic curl assisté",substitutes:["Romanian deadlift avec bande"],prescription:{type:"reps_band",target:12,rest:60},advanceAt:18,volume:{Ischios:1},query:"resistance band hamstring curl tutorial"}),
  lib("Nordic curl assisté","Jambes","Avancé","Ancrage + bande",["Ischios","Fessiers"],{regression:"Hamstring curl avec bande",progression:"Nordic curl négatif",prescription:{type:"reps",target:4,rest:120},advanceAt:7,volume:{Ischios:1,Fessiers:.25},query:"assisted nordic hamstring curl tutorial"}),
  lib("Nordic curl négatif","Jambes","Avancé","Ancrage",["Ischios","Fessiers"],{regression:"Nordic curl assisté",progression:"Nordic curl",prescription:{type:"reps",target:3,rest:135},advanceAt:6,volume:{Ischios:1,Fessiers:.25},query:"nordic curl negative tutorial"}),
  lib("Nordic curl","Jambes","Expert","Ancrage",["Ischios","Fessiers"],{regression:"Nordic curl négatif",prescription:{type:"reps",target:3,rest:150},advanceAt:6,volume:{Ischios:1,Fessiers:.25},query:"nordic hamstring curl tutorial"}),
  lib("Mollets","Jambes","Débutant","Sol / marche",["Mollets"],{progression:"Mollets une jambe",prescription:{type:"reps",target:18,rest:60},advanceAt:25,volume:{Mollets:1},query:"standing calf raise proper form tutorial"}),
  lib("Mollets une jambe","Jambes","Intermédiaire","Marche",["Mollets"],{regression:"Mollets",prescription:{type:"reps_side",target:12,rest:60},advanceAt:20,volume:{Mollets:1},query:"single leg calf raise tutorial"}),

  // HANDSTAND + STATIC SKILLS
  lib("Handstand au mur","Skill","Débutant","Mur",["Épaules","Core","Poignets"],{progression:"Handstand décollages du mur",substitutes:["Pike hold"],prescription:{type:"hold",target:25,rest:60},advanceAt:60,volume:{Épaules:.55,Core:.35},query:"wall handstand beginner tutorial calisthenics"}),
  lib("Handstand décollages du mur","Skill","Intermédiaire","Mur",["Épaules","Core","Poignets"],{regression:"Handstand au mur",progression:"Handstand libre",prescription:{type:"hold",target:10,rest:75},advanceAt:25,volume:{Épaules:.55,Core:.35},query:"handstand wall toe pulls balance drill tutorial"}),
  lib("Handstand libre","Skill","Avancé","Sol",["Épaules","Core","Poignets"],{regression:"Handstand décollages du mur",progression:"Handstand push-up au mur",prescription:{type:"hold",target:10,rest:90},advanceAt:30,volume:{Épaules:.55,Core:.35},query:"freestanding handstand tutorial beginner balance"}),
  lib("Pike hold","Skill","Débutant","Sol",["Épaules","Core"],{progression:"Handstand au mur",prescription:{type:"hold",target:20,rest:60},advanceAt:45,volume:{Épaules:.45,Core:.25},query:"pike handstand hold drill tutorial"}),
  lib("Tuck front lever","Skill","Intermédiaire","Barre",["Dos","Core","Grip"],{progression:"Advanced tuck front lever",substitutes:["Scapular pull-ups"],prescription:{type:"hold",target:8,rest:120},advanceAt:15,volume:{Dos:.8,Core:.6,Grip:.3},query:"tuck front lever tutorial"}),
  lib("Advanced tuck front lever","Skill","Avancé","Barre",["Dos","Core","Grip"],{regression:"Tuck front lever",progression:"One-leg front lever",prescription:{type:"hold",target:8,rest:135},advanceAt:15,volume:{Dos:.8,Core:.6,Grip:.3},query:"advanced tuck front lever tutorial"}),
  lib("One-leg front lever","Skill","Avancé","Barre",["Dos","Core","Grip"],{regression:"Advanced tuck front lever",progression:"Straddle front lever",prescription:{type:"hold_side",target:6,rest:150},advanceAt:12,volume:{Dos:.85,Core:.65,Grip:.3},query:"one leg front lever tutorial"}),
  lib("Straddle front lever","Skill","Expert","Barre",["Dos","Core","Grip"],{regression:"One-leg front lever",progression:"Front lever",prescription:{type:"hold",target:5,rest:165},advanceAt:10,volume:{Dos:.9,Core:.7,Grip:.3},query:"straddle front lever tutorial"}),
  lib("Front lever","Skill","Expert","Barre",["Dos","Core","Grip"],{regression:"Straddle front lever",prescription:{type:"hold",target:3,rest:180},advanceAt:10,volume:{Dos:.9,Core:.7,Grip:.3},query:"full front lever tutorial"}),
  lib("Side plank","Skill","Débutant","Tapis",["Core","Épaules"],{progression:"Human flag support vertical",prescription:{type:"hold_side",target:30,rest:60},advanceAt:60,volume:{Core:.8,Épaules:.25},query:"side plank proper form tutorial"}),
  lib("Human flag support vertical","Skill","Intermédiaire","Barre verticale",["Core","Épaules","Dos","Grip"],{regression:"Side plank",progression:"Tuck human flag",prescription:{type:"hold_side",target:10,rest:120},advanceAt:20,volume:{Core:.65,Épaules:.5,Dos:.35,Grip:.35},query:"human flag vertical support drill tutorial"}),
  lib("Tuck human flag","Skill","Avancé","Barres",["Core","Épaules","Dos","Grip"],{regression:"Human flag support vertical",progression:"One-leg human flag",prescription:{type:"hold_side",target:5,rest:150},advanceAt:10,volume:{Core:.7,Épaules:.55,Dos:.4,Grip:.35},query:"tuck human flag tutorial"}),
  lib("One-leg human flag","Skill","Avancé","Barres",["Core","Épaules","Dos","Grip"],{regression:"Tuck human flag",progression:"Straddle human flag",prescription:{type:"hold_side",target:4,rest:165},advanceAt:8,volume:{Core:.75,Épaules:.55,Dos:.4,Grip:.35},query:"one leg human flag tutorial"}),
  lib("Straddle human flag","Skill","Expert","Barres",["Core","Épaules","Dos","Grip"],{regression:"One-leg human flag",progression:"Human flag",prescription:{type:"hold_side",target:3,rest:180},advanceAt:7,volume:{Core:.8,Épaules:.6,Dos:.4,Grip:.35},query:"straddle human flag tutorial"}),
  lib("Human flag","Skill","Expert","Barres",["Core","Épaules","Dos","Grip"],{regression:"Straddle human flag",prescription:{type:"hold_side",target:3,rest:180},advanceAt:10,volume:{Core:.8,Épaules:.6,Dos:.4,Grip:.35},query:"full human flag tutorial calisthenics"}),

  // MOBILITÉ / PRÉHAB utiles
  lib("Scapular push-ups","Mobilité","Débutant","Sol",["Épaules","Core"],{substitutes:["Rotation externe avec bande"],prescription:{type:"reps",target:10,rest:45},advanceAt:15,volume:{Épaules:.25},query:"scapular push up tutorial"}),
  lib("Rotation externe avec bande","Mobilité","Débutant","Bande",["Épaules"],{substitutes:["Face pulls"],prescription:{type:"reps_band",target:15,rest:45},advanceAt:20,volume:{Épaules:.25},query:"band external shoulder rotation tutorial"}),
  lib("Knee-to-wall chevilles","Mobilité","Débutant","Mur",["Chevilles"],{prescription:{type:"reps_side",target:10,rest:20},query:"knee to wall ankle mobility tutorial"}),
  lib("90/90 hanches","Mobilité","Débutant","Tapis",["Hanches"],{prescription:{type:"hold_side",target:45,rest:20},query:"90 90 hip mobility tutorial"}),
  lib("Couch stretch","Mobilité","Débutant","Mur / support",["Hanches","Quadriceps"],{prescription:{type:"hold_side",target:45,rest:25},query:"couch stretch hip flexor tutorial"}),
  lib("Frog stretch","Mobilité","Débutant","Tapis",["Hanches","Adducteurs"],{prescription:{type:"hold",target:45,rest:25},query:"frog stretch hip mobility tutorial"}),
  lib("Adductor rock-back","Mobilité","Débutant","Tapis",["Adducteurs","Hanches"],{prescription:{type:"reps_side",target:8,rest:20},query:"adductor rock back mobility tutorial"}),
  lib("Rotation thoracique","Mobilité","Débutant","Tapis",["Thorax"],{prescription:{type:"reps_side",target:8,rest:20},query:"thoracic rotation mobility tutorial"}),
  lib("Pass-through avec bande","Mobilité","Débutant","Bande",["Épaules","Pectoraux"],{prescription:{type:"reps",target:10,rest:20},query:"band shoulder pass through mobility tutorial"}),
  lib("Poignets flexion / extension","Mobilité","Débutant","Tapis",["Poignets"],{prescription:{type:"timer",target:120,rest:0},query:"wrist flexion extension mobility calisthenics"}),
  lib("Pompes lestées (sac à dos)","Push","Intermédiaire","Tapis + sac à dos",["Pectoraux","Triceps","Épaules","Core"],{regression:"Pompes",progression:"Pseudo-planche push-ups",substitutes:["Pompes pieds surélevés"],prescription:{type:"reps",target:8,rest:105},advanceAt:12,volume:{Pectoraux:1,Triceps:.55,Épaules:.25,Core:.2},query:"weighted backpack push up proper form"}),
  lib("Squat avec bande","Jambes","Intermédiaire","Bande + tapis",["Quadriceps","Fessiers","Core"],{regression:"Squat tempo",progression:"Bulgarian split squat",substitutes:["Squats poids du corps","Squat tempo"],prescription:{type:"reps_band",target:12,rest:90},advanceAt:15,volume:{Quadriceps:1,Fessiers:.75,Core:.15},query:"resistance band squat proper form"}),
  lib("Squat lesté (sac à dos)","Jambes","Intermédiaire","Sac à dos",["Quadriceps","Fessiers","Core"],{regression:"Squat tempo",progression:"Bulgarian split squat lesté (sac à dos)",substitutes:["Bulgarian split squat"],prescription:{type:"reps",target:10,rest:90},advanceAt:15,volume:{Quadriceps:1,Fessiers:.7,Core:.15},query:"backpack weighted squat proper form"}),
  lib("Fentes arrière lestées (sac à dos)","Jambes","Intermédiaire","Sac à dos + tapis",["Quadriceps","Fessiers","Core"],{regression:"Fentes arrière",progression:"Bulgarian split squat lesté (sac à dos)",substitutes:["Squat lesté (sac à dos)"],prescription:{type:"reps_side",target:8,rest:90},advanceAt:12,volume:{Quadriceps:1,Fessiers:.8,Core:.15},query:"backpack reverse lunge proper form"}),
  lib("Bulgarian split squat lesté (sac à dos)","Jambes","Intermédiaire","Power Tower + sac à dos",["Quadriceps","Fessiers","Core"],{regression:"Bulgarian split squat",progression:"Pistol squat assisté",substitutes:["Fentes arrière lestées (sac à dos)"],prescription:{type:"reps_side",target:8,rest:105},advanceAt:12,volume:{Quadriceps:1,Fessiers:.85,Core:.2},query:"backpack bulgarian split squat proper form"})
];

const EXERCISE_BY_NAME = new Map(EXERCISE_LIBRARY.map(x=>[x.name,x]));
function visibleExerciseLibrary(){return BACKPACK_ENABLED?EXERCISE_LIBRARY:EXERCISE_LIBRARY.filter(x=>!usesBackpack(x.name));}
function exerciseInfo(name){ return EXERCISE_BY_NAME.get(name) || null; }
function getExerciseChoices(){ return parse(STORAGE.exerciseChoices, {}); }
function setExerciseChoices(v){ save(STORAGE.exerciseChoices, v); }
function currentExerciseName(baseName){ return getExerciseChoices()[baseName] || baseName; }
function exerciseFromLibrary(name, fallback={}){
  const item=exerciseInfo(name); if(!item) return {...fallback,name};
  const pr=item.prescription||{};
  return {...fallback,name:item.name,type:pr.type||fallback.type||"reps",sets:fallback.sets||3,target:pr.target||fallback.target||8,baseTarget:pr.target||fallback.baseTarget||fallback.target||8,rest:pr.rest??fallback.rest??75,tip:item.tip||fallback.tip||"",libraryName:item.name};
}

const VOLUME_GROUPS = ["Pectoraux","Dos","Épaules","Biceps","Triceps","Core","Quadriceps","Ischios","Fessiers","Mollets","Grip"];

// V9.2 · Paramètres d'équilibre. Les fourchettes sont des cibles de coaching
// modifiables, pas des limites médicales. Elles permettent de comparer la charge
// réelle (séances + Express + perso + Quick Logs) au programme et aux priorités.
const DEFAULT_TRAINING_CONFIG = {
  cardioMin: 150,
  cardioMax: 300,
  primaryThreshold: .75,
  secondaryThreshold: .30,
  volumeTargets: {
    "Pectoraux": {min:8,max:14}, "Dos": {min:12,max:18}, "Épaules": {min:8,max:16},
    "Biceps": {min:6,max:12}, "Triceps": {min:8,max:14}, "Core": {min:10,max:18},
    "Quadriceps": {min:8,max:14}, "Ischios": {min:6,max:12}, "Fessiers": {min:8,max:14},
    "Mollets": {min:4,max:10}, "Grip": {min:6,max:12}
  }
};
function getTrainingConfig(){
  const saved=parse(STORAGE.trainingConfig,{}), base=clone(DEFAULT_TRAINING_CONFIG);
  base.cardioMin=Number(saved.cardioMin??base.cardioMin);base.cardioMax=Number(saved.cardioMax??base.cardioMax);
  base.primaryThreshold=Number(saved.primaryThreshold??base.primaryThreshold);base.secondaryThreshold=Number(saved.secondaryThreshold??base.secondaryThreshold);
  VOLUME_GROUPS.forEach(g=>{const v=saved.volumeTargets?.[g];if(v){base.volumeTargets[g]={min:Number(v.min??base.volumeTargets[g].min),max:Number(v.max??base.volumeTargets[g].max)};}});
  return base;
}
function setTrainingConfig(v){save(STORAGE.trainingConfig,v);}

const FLEX_ZONES = ["Chevilles","Hanches","Fléchisseurs hanche","Adducteurs","Ischios","Épaules","Pectoraux","Thorax","Poignets"];
const DEFAULT_FLEX_CONFIG = {
  weeklyMinutesTarget: 30,
  sessionsTarget: 3,
  intensityMin: 3,
  intensityMax: 6,
  zoneTargets: {
    "Chevilles":{min:3,max:7,sessions:2}, "Hanches":{min:4,max:8,sessions:2},
    "Fléchisseurs hanche":{min:3,max:7,sessions:2}, "Adducteurs":{min:3,max:7,sessions:2},
    "Ischios":{min:4,max:8,sessions:2}, "Épaules":{min:4,max:8,sessions:2},
    "Pectoraux":{min:2,max:6,sessions:2}, "Thorax":{min:2,max:6,sessions:2}, "Poignets":{min:3,max:7,sessions:3}
  },
  testTargets:{ankle_left:10,ankle_right:10,hip_ir_left:35,hip_ir_right:35,forward_fold:0,deep_squat:60,shoulder_flex_left:170,shoulder_flex_right:170,thoracic_rotation_left:45,thoracic_rotation_right:45,wrist_extension_left:70,wrist_extension_right:70},
  ankleSymmetryMax:1.5
};
function getFlexConfig(){
  const saved=parse(STORAGE.flexConfig,{}),base=clone(DEFAULT_FLEX_CONFIG);
  for(const k of ['weeklyMinutesTarget','sessionsTarget','intensityMin','intensityMax','ankleSymmetryMax'])if(saved[k]!=null)base[k]=Number(saved[k]);
  FLEX_ZONES.forEach(z=>{const v=saved.zoneTargets?.[z];if(v)base.zoneTargets[z]={min:Number(v.min??base.zoneTargets[z].min),max:Number(v.max??base.zoneTargets[z].max),sessions:Number(v.sessions??base.zoneTargets[z].sessions)};});
  Object.keys(base.testTargets).forEach(k=>{if(saved.testTargets?.[k]!=null)base.testTargets[k]=Number(saved.testTargets[k]);});
  return base;
}
function setFlexConfig(v){save(STORAGE.flexConfig,v);}

// Répartition des exercices de mobilité vers les amplitudes utiles à la calisthénie.
// Les coefficients répartissent un exercice multi-zone sans prétendre mesurer une adaptation biologique exacte.
const FLEX_EXERCISE_ZONES = {
  "Knee-to-wall chevilles":{"Chevilles":1},
  "Deep squat hold":{"Chevilles":.45,"Hanches":.60,"Adducteurs":.30},
  "90/90 hanches":{"Hanches":1},
  "Couch stretch":{"Fléchisseurs hanche":1,"Hanches":.25},
  "Fléchisseurs de hanche":{"Fléchisseurs hanche":1},
  "Frog stretch":{"Adducteurs":1,"Hanches":.35},
  "Adductor rock-back":{"Adducteurs":1,"Hanches":.35},
  "Ischios":{"Ischios":1},
  "Flexion avant ischios":{"Ischios":1},
  "Étirement ischios":{"Ischios":1},
  "Étirement mollets":{"Chevilles":1},
  "Rotation thoracique":{"Thorax":1},
  "Cat-cow":{"Thorax":.55},
  "Pass-through avec bande":{"Épaules":1,"Pectoraux":.40},
  "Étirement grand dorsal":{"Épaules":.70,"Thorax":.25},
  "Child's pose latéral":{"Épaules":.55,"Thorax":.35},
  "Étirement pectoral encadrement":{"Pectoraux":1,"Épaules":.25},
  "Épaules / grand dorsal / pectoraux":{"Épaules":.60,"Pectoraux":.45,"Thorax":.20},
  "Poignets flexion / extension":{"Poignets":1},
  "Mobilité épaules / pectoraux / poignets":{"Épaules":.55,"Pectoraux":.35,"Poignets":.55},
  "Mobilité dos / avant-bras / épaules":{"Épaules":.35,"Thorax":.35,"Poignets":.25},
  "Mobilité jambes":{"Chevilles":.30,"Hanches":.35,"Fléchisseurs hanche":.25,"Ischios":.30},
  "Mobilité complète":{"Chevilles":.15,"Hanches":.25,"Fléchisseurs hanche":.15,"Adducteurs":.15,"Ischios":.20,"Épaules":.20,"Pectoraux":.12,"Thorax":.20,"Poignets":.12}
};


const TEST_DEFS = [
  { id: "pullups", name: "Tractions strictes", unit: "reps", input: "number", tip: "Répétitions propres, sans kipping. Arrête avant que la forme se dégrade fortement." },
  { id: "dips", name: "Dips stricts", unit: "reps", input: "number", tip: "Amplitude confortable et épaules stables." },
  { id: "dead_hang", name: "Dead hang", unit: "sec", input: "number", tip: "Chronomètre une seule tentative propre, sans douleur." },
  { id: "wall_handstand", name: "Handstand au mur", unit: "sec", input: "number", tip: "Ligne propre. Pas besoin de chercher l’échec." },
  { id: "l_sit", name: "L-sit / tuck L-sit", unit: "sec", input: "number", tip: "Note ton meilleur maintien propre et précise la variante dans les notes." },
  { id: "cardio12", name: "Cardio 12 min", unit: "m", input: "number", tip: "Distance en 12 minutes. Facultatif au début : garde une intensité contrôlée." }
];

// Les jalons mesurables peuvent être validés par un test dédié OU par une vraie série
// enregistrée dans une séance guidée. Les Quick Logs restent volontairement exclus.
const TEST_GUIDED_EXERCISES = {
  pullups:["Tractions strictes"],
  dips:["Dips"],
  dead_hang:["Dead hang"],
  wall_handstand:["Handstand au mur"],
  l_sit:["L-sit","Tuck L-sit"]
};

const SKILL_TREES = [
  { id:"pull", name:"Tirage", icon:"↟", description:"Construire la force de tirage avant les mouvements explosifs.", levels:[
    {id:"pull-1",name:"1 traction stricte",auto:{test:"pullups",value:1}},
    {id:"pull-5",name:"5 tractions strictes",auto:{test:"pullups",value:5}},
    {id:"pull-10",name:"10 tractions strictes",auto:{test:"pullups",value:10}},
    {id:"pull-15",name:"15 tractions strictes",auto:{test:"pullups",value:15}},
    {id:"pull-chest",name:"Chest-to-bar propre",auto:{exercise:"Chest-to-bar",value:1},manual:true},
    {id:"pull-explosive",name:"Traction explosive poitrine",auto:{exercise:"Tractions explosives",value:1},manual:true}
  ]},
  { id:"push", name:"Poussée", icon:"↑", description:"Dips, poussée verticale et force nécessaire aux HSPU.", levels:[
    {id:"dip-5",name:"5 dips stricts",auto:{test:"dips",value:5}},
    {id:"dip-10",name:"10 dips stricts",auto:{test:"dips",value:10}},
    {id:"dip-15",name:"15 dips stricts",auto:{test:"dips",value:15}},
    {id:"dip-20",name:"20 dips stricts",auto:{test:"dips",value:20}},
    {id:"pike-elevated",name:"Pike push-up pieds surélevés propre",auto:{exercise:"Pike push-ups pieds surélevés",value:1},manual:true},
    {id:"hspu-wall",name:"Handstand push-up au mur",auto:{exercise:"Handstand push-up au mur",value:1},manual:true},
    {id:"hspu-free",name:"Handstand push-up libre",auto:{exercise:"Handstand push-up libre",value:1},manual:true}
  ]},
  { id:"handstand", name:"Handstand", icon:"◇", description:"Ligne, équilibre et contrôle avant la poussée libre.", levels:[
    {id:"hs-wall-30",name:"Mur 30 sec",auto:{test:"wall_handstand",value:30}},
    {id:"hs-wall-60",name:"Mur 60 sec",auto:{test:"wall_handstand",value:60}},
    {id:"hs-free-5",name:"Libre 5 sec",auto:{exercise:"Handstand libre",value:5},manual:true},
    {id:"hs-free-20",name:"Libre 20 sec",auto:{exercise:"Handstand libre",value:20},manual:true},
    {id:"hs-free-30",name:"Libre 30 sec",auto:{exercise:"Handstand libre",value:30},manual:true}
  ]},
  { id:"core", name:"Core / L-sit", icon:"⌁", description:"Compression, gainage et contrôle du bassin.", levels:[
    {id:"tuck-10",name:"Tuck L-sit 10 sec",auto:{exercise:"Tuck L-sit",value:10}},
    {id:"tuck-20",name:"Tuck L-sit 20 sec",auto:{exercise:"Tuck L-sit",value:20}},
    {id:"oneleg-lsit",name:"One-leg L-sit 10 sec",auto:{exercise:"One-leg L-sit",value:10},manual:true},
    {id:"lsit-10",name:"L-sit 10 sec",auto:{exercise:"L-sit",value:10},manual:true},
    {id:"lsit-20",name:"L-sit 20 sec",auto:{exercise:"L-sit",value:20},manual:true},
    {id:"toes-bar",name:"Toes-to-bar propre",auto:{exercise:"Toes-to-bar",value:1},manual:true}
  ]},
  { id:"muscleup", name:"Muscle-up", icon:"↥", description:"Explosivité, transition et contrôle au-dessus de la barre.", levels:[
    {id:"mu-highpull",name:"Traction explosive poitrine",auto:{exercise:"Tractions explosives",value:1},manual:true},
    {id:"mu-assisted",name:"3 muscle-ups assistés propres",auto:{exercise:"Muscle-up assisté",value:3},manual:true},
    {id:"muscle-up",name:"1 muscle-up strict",auto:{exercise:"Muscle-up strict",value:1},manual:true},
    {id:"muscle-up-3",name:"3 muscle-ups stricts",auto:{exercise:"Muscle-up strict",value:3},manual:true}
  ]},
  { id:"lever", name:"Front lever", icon:"—", description:"Progression de levier : qualité de ligne avant durée.", levels:[
    {id:"lever-tuck",name:"Tuck front lever 10 sec",auto:{exercise:"Tuck front lever",value:10},manual:true},
    {id:"lever-adv",name:"Advanced tuck 10 sec",auto:{exercise:"Advanced tuck front lever",value:10},manual:true},
    {id:"lever-oneleg",name:"One-leg front lever 5 sec",auto:{exercise:"One-leg front lever",value:5},manual:true},
    {id:"lever-straddle",name:"Straddle front lever 5 sec",auto:{exercise:"Straddle front lever",value:5},manual:true},
    {id:"lever-full",name:"Front lever 5 sec",auto:{exercise:"Front lever",value:5},manual:true}
  ]},
  { id:"flag", name:"Human flag", icon:"⚑", description:"Stabilité latérale, tirage/poussée asymétrique et levier.", levels:[
    {id:"flag-support",name:"Support vertical solide",auto:{exercise:"Human flag support vertical",value:10},manual:true},
    {id:"flag-tuck",name:"Tuck human flag 5 sec",auto:{exercise:"Tuck human flag",value:5},manual:true},
    {id:"flag-oneleg",name:"One-leg human flag 5 sec",auto:{exercise:"One-leg human flag",value:5},manual:true},
    {id:"flag-straddle",name:"Straddle human flag 5 sec",auto:{exercise:"Straddle human flag",value:5},manual:true},
    {id:"flag-full",name:"Human flag 5 sec",auto:{exercise:"Human flag",value:5},manual:true}
  ]},
  { id:"legs", name:"Jambes unilatérales", icon:"△", description:"Force, équilibre et contrôle sur une jambe.", levels:[
    {id:"pistol-assisted",name:"Pistol squat assisté propre",auto:{exercise:"Pistol squat assisté",value:5},manual:true},
    {id:"pistol",name:"1 pistol squat par jambe",auto:{exercise:"Pistol squat",value:1},manual:true},
    {id:"pistol-5",name:"5 pistol squats par jambe",auto:{exercise:"Pistol squat",value:5},manual:true},
    {id:"shrimp",name:"Shrimp squat propre",auto:{exercise:"Shrimp squat",value:1},manual:true}
  ]}
];

const RANKS = [
  {id:"bronze",name:"Bronze",title:"Fondations",description:"Premières références techniques et physiques."},
  {id:"silver",name:"Argent",title:"Contrôle",description:"Bases de force, poussée et grip réellement démontrées."},
  {id:"gold",name:"Or",title:"Force de base",description:"Socle solide sur plusieurs capacités et premières compétences techniques."},
  {id:"platinum",name:"Platine",title:"Intermédiaire confirmé",description:"Niveau intermédiaire démontré dans l’ensemble du profil KINETIK."},
  {id:"diamond",name:"Diamant",title:"Athlète complet",description:"Profil complet avec performances avancées et skills validés."},
  {id:"master",name:"Maître",title:"Skills avancés",description:"Capacités élevées et maîtrise de plusieurs compétences avancées."},
  {id:"legend",name:"Légende",title:"Maîtrise",description:"Standards experts simultanés, sans raccourci lié au temps passé dans l’application."}
];

const state = {
  view: "today",
  active: null,
  timer: null,
  deferredInstall: null,
  bodyEditor: false,
  bodyEditorMode: "quick",
  bodyPeriod: "30d",
  bodyPeriodFrom: "",
  bodyPeriodTo: "",
  bodyPhotoComparePosition: "front",
  bodyPhotoCompareA: "",
  bodyPhotoCompareB: "",
  bodyMetric: "weight",
  bodyCompareMetric: "none",
  bodySettingsOpen: false,
  bodySettingsMessage: null,
  mobilityChartZone: "ankles",
  selectedHistoryId: null,
  rankUpNotice: null,
  selectedRankId: null,
  expandedWeekDay: null,
  expandedFlexRoutine: null,
  tutorialManager: false,
  exerciseLibrary: false,
  libraryCategory: "Tous",
  readinessEditor: null,
  substituteEditor: null,
  prNotice: null,
  quickEditor: false,
  quickToast: null,
  quickBand: null,
  quickLoadKg: 0,
  quickFavoritesEditor: false,
  quickFavoriteCategory: "Tous",
  quickFavoriteMessage: null,
  addHubOpen: false,
  activityPresetType: null,
  activityPresetData: null,
  undoSetSnapshot: null,
  stravaStatus: {checked:false,loading:false,connected:false,athlete:null,scope:""},
  stravaSyncing: false,
  stravaMessage: null,
  sessionModeEditor: null,
  customSessionEditor: null,
  customSessionDraft: null,
  cycleDayTarget: null,
  progressTab: "overview",
  repVolumePeriod: "30d",
  repVolumeFrom: "",
  repVolumeTo: "",
  cycleProgressionEditor: null,
  cycleProgressionDraft: null,
  activityEditor: false,
  athleteProfileEditor: false,
  assessmentEditor: null,
  assessmentCategory: "all",
};

function parse(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function getHistory() { return parse(STORAGE.history, []); }
function setHistory(v) { save(STORAGE.history, v); }
function getPrefs() { return parse(STORAGE.prefs, { sound:true, vibration:true, smartProgression:true, keepAwake:true }); }
function setPrefs(v) { save(STORAGE.prefs, v); }

/* V10.116 · Canonical anthropometrics
   - height: athlete profile is the single current source of truth
   - weight: latest body measurement is the single current source of truth
   Historic body-log height values remain snapshots so old BMI/body-fat calculations stay reproducible. */
function positiveNumber(v){const n=Number(v);return Number.isFinite(n)&&n>0?n:null;}
function latestBodyLogWith(key){
  return getBodyLogs().filter(l=>positiveNumber(bodyValue(l,key))!=null).sort((a,b)=>new Date(b.date)-new Date(a.date))[0]||null;
}
function getCanonicalHeight(){
  const raw=parse(STORAGE.athleteProfile,{}),prefs=getPrefs(),logs=getBodyLogs();
  return positiveNumber(raw.height)||positiveNumber(prefs.heightCm)||positiveNumber(logs.find(l=>positiveNumber(l.height))?.height)||null;
}
function getCurrentWeight(){
  const latest=latestBodyLogWith('weight');
  if(latest)return positiveNumber(bodyValue(latest,'weight'));
  // Legacy fallback only until migrateCanonicalAnthropometrics() has run.
  return positiveNumber(parse(STORAGE.athleteProfile,{}).weight);
}
function upsertBodyValuesForDate(values,dateKey=localDateKey(),meta={}){
  const clean=Object.fromEntries(Object.entries(values||{}).map(([k,v])=>[k,positiveNumber(v)]).filter(([,v])=>v!=null));
  if(!Object.keys(clean).length)return null;
  const arr=getBodyLogs(),idx=arr.findIndex(l=>localDateKey(new Date(l.date))===dateKey);
  if(idx>=0){
    arr[idx]={...arr[idx],...clean,...meta};
  }else{
    arr.push({id:Date.now(),date:new Date(`${dateKey}T12:00:00`).toISOString(),...clean,custom:{},note:'',measurementMode:'quick',...meta});
  }
  arr.sort((a,b)=>new Date(b.date)-new Date(a.date));
  setBodyLogs(arr.slice(0,1500));
  return arr.find(l=>localDateKey(new Date(l.date))===dateKey)||null;
}
function setCanonicalHeight(value){
  const height=positiveNumber(value),raw=parse(STORAGE.athleteProfile,{}),prefs=getPrefs();
  if(height)raw.height=height;else delete raw.height;
  delete raw.weight; // weight never belongs to the canonical profile anymore
  setAthleteProfile(raw);
  if(Object.prototype.hasOwnProperty.call(prefs,'heightCm')){delete prefs.heightCm;setPrefs(prefs);}
  return height;
}
function recordCurrentWeight(value,source='profile'){
  const weight=positiveNumber(value);if(!weight)return null;
  const current=getCurrentWeight();
  if(current!=null&&Math.abs(current-weight)<0.001)return latestBodyLogWith('weight');
  return upsertBodyValuesForDate({weight},localDateKey(),{anthropometricSource:source});
}
function migrateCanonicalAnthropometrics(){
  const raw=parse(STORAGE.athleteProfile,{}),prefs=getPrefs(),logs=getBodyLogs();
  const height=positiveNumber(raw.height)||positiveNumber(prefs.heightCm)||positiveNumber(logs.find(l=>positiveNumber(l.height))?.height);
  const legacyWeight=positiveNumber(raw.weight);
  const hasMeasuredWeight=logs.some(l=>positiveNumber(bodyValue(l,'weight'))!=null);
  let changedProfile=false,changedPrefs=false;
  if(height&&positiveNumber(raw.height)!==height){raw.height=height;changedProfile=true;}
  if(Object.prototype.hasOwnProperty.call(raw,'weight')){delete raw.weight;changedProfile=true;}
  if(Object.prototype.hasOwnProperty.call(prefs,'heightCm')){delete prefs.heightCm;changedPrefs=true;}
  if(changedProfile)setAthleteProfile(raw);
  if(changedPrefs)setPrefs(prefs);
  if(legacyWeight&&!hasMeasuredWeight)upsertBodyValuesForDate({weight:legacyWeight},localDateKey(),{anthropometricSource:'legacy-profile-migration',migrated:true});
  return {height:height||null,weight:getCurrentWeight()};
}

const ATHLETE_DAY_NAMES=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const ATHLETE_SPORTS=[
  ['calisthenics','Calisthénie'],['strength','Musculation'],['running','Course'],['cycling','Vélo'],
  ['swimming','Piscine'],['crossfit','CrossFit'],['hyrox','HYROX'],['boxing','Boxe / sports de combat'],
  ['walking','Marche / randonnée'],['rowing','Rameur'],['mobility','Mobilité'],['other','Autre']
];
function getAthleteProfile(){
  const raw=parse(STORAGE.athleteProfile,{});
  const active=typeof getActiveTrainingCycle==='function'?getActiveTrainingCycle():null;
  const activeDays=active&&active.days?Object.entries(active.days).filter(([d,w])=>(w&&w.exercises&&w.exercises.length)).map(([d])=>Number(d)):[];
  const restDays=active&&active.days?Object.entries(active.days).filter(([d,w])=>!(w&&w.exercises&&w.exercises.length)).map(([d])=>Number(d)):[];
  return {
    name:String(raw.name||'').trim(),
    age:raw.age?Number(raw.age):null,
    height:getCanonicalHeight(),
    weight:getCurrentWeight(),
    targetWeight:raw.targetWeight?Number(raw.targetWeight):null,
    experience:raw.experience||'Intermédiaire',
    yearsTraining:raw.yearsTraining?Number(raw.yearsTraining):null,
    primaryGoal:raw.primaryGoal||'Progression générale',
    secondaryGoal:raw.secondaryGoal||'',
    goalHorizon:raw.goalHorizon||'',
    weeklySessions:Math.max(1,Math.min(7,Number(raw.weeklySessions||(activeDays.length||4)))),
    preferredDuration:Math.max(15,Math.min(180,Number(raw.preferredDuration||60))),
    trainingDays:Array.isArray(raw.trainingDays)?raw.trainingDays:activeDays,
    restDays:Array.isArray(raw.restDays)?raw.restDays:restDays,
    sports:Array.isArray(raw.sports)&&raw.sports.length?raw.sports:['calisthenics'],
    locations:Array.isArray(raw.locations)&&raw.locations.length?raw.locations:['home'],
    sessionPreference:raw.sessionPreference||'Complet + Express',
    units:raw.units||'metric',
    coachStyle:raw.coachStyle||'Équilibré',
    notes:String(raw.notes||'').trim()
  };
}
function setAthleteProfile(v){const clean={...(v||{})};delete clean.weight;save(STORAGE.athleteProfile,clean);}
function athleteInitials(name){
  const parts=String(name||'').trim().split(/\s+/).filter(Boolean);
  return parts.length?parts.slice(0,2).map(x=>x.charAt(0).toUpperCase()).join(''):'K';
}
function athleteSportLabel(id){return (ATHLETE_SPORTS.find(x=>x[0]===id)||[id,id])[1];}
function athleteDayLabel(day){return ATHLETE_DAY_NAMES[Number(day)]||String(day);}
function athleteRecords(){
  const rows=currentRecords()||[];
  const defs=[
    {label:'Tractions',rx:/traction|pull.?up/i,unit:'reps'},
    {label:'Dips',rx:/\bdips?\b/i,unit:'reps'},
    {label:'Dead hang',rx:/dead hang/i,unit:'s'}
  ];
  return defs.map(d=>{
    const candidates=rows.filter(r=>d.rx.test(String(r.exercise||'')));
    if(!candidates.length)return null;
    const best=candidates.sort((x,y)=>Number(y.value||0)-Number(x.value||0))[0];
    return {label:d.label,value:Number(best.value||0),unit:(best.type||'').startsWith('hold')?'s':d.unit};
  }).filter(Boolean);
}
function athleteProfileCompletion(p=getAthleteProfile()){
  const checks=[p.name,p.age,p.height,p.experience,p.primaryGoal,p.secondaryGoal||p.goalHorizon,p.weeklySessions,p.preferredDuration,p.sports&&p.sports.length,p.locations&&p.locations.length];
  return Math.round(checks.filter(Boolean).length/checks.length*100);
}
function athleteProfileSummaryForAi(p=getAthleteProfile()){
  const setup=getEquipmentSetup();
  const eq=EQUIPMENT_CATALOG.filter(x=>setup[x.id]).map(x=>x.label).join(', ')||'non renseigné';
  return [
    `Expérience: ${p.experience}${p.yearsTraining?` · ${p.yearsTraining} an(s) de pratique`:''}`,
    `Objectif principal: ${p.primaryGoal}${p.secondaryGoal?` · secondaire: ${p.secondaryGoal}`:''}${p.goalHorizon?` · horizon: ${p.goalHorizon}`:''}`,
    `Rythme: ${p.weeklySessions} séances/semaine · durée préférée ${p.preferredDuration} min · format ${p.sessionPreference}`,
    `Jours d'entraînement préférés: ${(p.trainingDays||[]).map(athleteDayLabel).join(', ')||'non renseignés'}`,
    `Jours de repos préférés: ${(p.restDays||[]).map(athleteDayLabel).join(', ')||'non renseignés'}`,
    `Sports: ${(p.sports||[]).map(athleteSportLabel).join(', ')||'non renseignés'}`,
    `Lieux: ${(p.locations||[]).map(x=>({home:'Maison',outdoor:'Parc / extérieur',gym:'Salle',club:'Club / box'}[x]||x)).join(', ')||'non renseignés'}`,
    `Matériel disponible: ${eq}`,
    p.notes?`Notes utiles: ${p.notes}`:null
  ].filter(Boolean).join('\n');
}
function getTests() { return parse(STORAGE.tests, []); }
function setTests(v) { save(STORAGE.tests, v); }
function getManualSkills() { return parse(STORAGE.skills, {}); }
function setManualSkills(v) { save(STORAGE.skills, v); }
function getBodyLogs() { return parse(STORAGE.body, []); }
function setBodyLogs(v) { save(STORAGE.body, v); }
try{migrateCanonicalAnthropometrics();}catch(e){console.warn('KINETIK anthropometric migration',e);}
function getBodyConfig(){const raw=parse(STORAGE.bodyConfig,{});return mergeBodyConfig(raw);}
function setBodyConfig(v){save(STORAGE.bodyConfig,v);}
function getFlexLogs() { return parse(STORAGE.flexibility, []); }
function setFlexLogs(v) { save(STORAGE.flexibility, v); }
function getMobilityTests() { return parse(STORAGE.mobilityTests, []); }
function setMobilityTests(v) { save(STORAGE.mobilityTests, v); }
function getTutorialOverrides() { return parse(STORAGE.tutorials, {}); }
function setTutorialOverrides(v) { save(STORAGE.tutorials, v); }
function getQuickLogs() { return parse(STORAGE.quickLogs, []); }
function setQuickLogs(v) { save(STORAGE.quickLogs, v); }
function getCustomWorkouts() { return parse(STORAGE.customWorkouts, []); }
function setCustomWorkouts(v) { save(STORAGE.customWorkouts, v); }


const PROGRESSION_TEMPLATE_DEFS = {
  standard:{name:"Progression standard",goal:"Équilibré",description:"Construire, consolider, intensifier puis deload + tests.",weeks:[
    ["Construction",1.00,1.00,1.00,3,true,false],["Construction",1.00,1.04,1.00,3,true,false],["Construction",1.05,1.06,1.00,2,true,false],["Consolidation",.85,.95,.90,4,false,false],
    ["Intensification",1.00,1.05,1.05,2,true,false],["Intensification",1.05,1.08,1.08,2,true,false],["Pic contrôlé",1.08,1.10,1.05,1,true,false],["Deload + tests",.65,.90,.75,4,false,true]
  ]},
  restart:{name:"Reprise",goal:"Reprise",description:"Remonter progressivement le volume avec davantage de marge et un deload doux.",weeks:[
    ["Reprise",.75,.90,.85,4,false,false],["Reprise",.85,.95,.90,4,true,false],["Construction",.95,1.00,.95,3,true,false],["Consolidation",.80,.92,.85,4,false,false],
    ["Construction",1.00,1.00,1.00,3,true,false],["Progression",1.00,1.04,1.00,2,true,false],["Progression",1.05,1.06,1.00,2,true,false],["Deload + tests",.65,.90,.75,4,false,true]
  ]},
  strength:{name:"Force",goal:"Force",description:"Moins de volume, davantage d'intensité et des semaines hautes plus ciblées.",weeks:[
    ["Base force",.90,1.00,.90,3,true,false],["Base force",.95,1.04,.90,3,true,false],["Force",1.00,1.08,.90,2,true,false],["Consolidation",.75,.95,.80,4,false,false],
    ["Intensification",.90,1.08,.90,2,true,false],["Intensification",.95,1.12,.90,1,true,false],["Pic force",.90,1.15,.85,1,true,false],["Deload + tests",.60,.88,.70,4,false,true]
  ]},
  volume:{name:"Volume",goal:"Muscle / volume",description:"Accumuler davantage de séries et répétitions tout en gardant une semaine de consolidation.",weeks:[
    ["Volume",1.00,1.00,1.00,3,true,false],["Volume",1.05,1.03,1.00,3,true,false],["Volume",1.10,1.05,1.00,2,true,false],["Consolidation",.85,.95,.90,4,false,false],
    ["Volume",1.08,1.04,1.00,2,true,false],["Volume +",1.12,1.06,1.00,2,true,false],["Surcharge",1.15,1.08,.95,1,true,false],["Deload + tests",.65,.90,.75,4,false,true]
  ]},
  skills:{name:"Skills",goal:"Skills",description:"Priorité à la qualité technique, aux holds et aux progressions de mouvements.",weeks:[
    ["Technique",.90,1.00,.90,4,true,false],["Technique",.95,1.03,.90,3,true,false],["Construction skill",1.00,1.05,.90,3,true,false],["Consolidation",.80,.95,.85,4,false,false],
    ["Intensification skill",.95,1.06,.90,2,true,false],["Intensification skill",1.00,1.08,.90,2,true,false],["Tentatives propres",1.00,1.10,.85,1,true,false],["Deload + tests",.60,.88,.70,4,false,true]
  ]}
};
function progressionPhaseId(name=""){
  const n=String(name).toLowerCase();
  if(/deload|test/.test(n))return 'deload';if(/consolid/.test(n))return 'consolidate';if(/intens|pic|surcharge|force/.test(n))return 'intensify';if(/reprise/.test(n))return 'restart';return 'build';
}
function normalizeProgressionWeek(row,i){
  if(Array.isArray(row))return {week:i+1,name:row[0],phaseId:progressionPhaseId(row[0]),volumeFactor:Number(row[1]??1),targetFactor:Number(row[2]??1),cardioFactor:Number(row[3]??1),rir:Number(row[4]??3),allowProgress:row[5]!==false,tests:!!row[6]};
  const r=row||{};return {week:i+1,name:r.name||`Semaine ${i+1}`,phaseId:r.phaseId||progressionPhaseId(r.name),volumeFactor:Number(r.volumeFactor??1),targetFactor:Number(r.targetFactor??1),cardioFactor:Number(r.cardioFactor??1),rir:Number(r.rir??3),allowProgress:r.allowProgress!==false,tests:!!r.tests};
}
function templateProgression(id='standard'){
  const t=PROGRESSION_TEMPLATE_DEFS[id]||PROGRESSION_TEMPLATE_DEFS.standard;
  return {mode:'template',templateId:id,goal:t.goal,name:t.name,description:t.description,weeks:t.weeks.map(normalizeProgressionWeek)};
}
function automaticProgression(goal='Équilibré'){
  const map={'Reprise':'restart','Force':'strength','Muscle / volume':'volume','Skills':'skills','Équilibré':'standard'};
  const id=map[goal]||'standard',p=templateProgression(id);return {...p,mode:'auto',goal,name:`Automatique · ${goal}`,description:'L’application applique une structure cohérente et conserve la progression exercice par exercice selon tes performances.'};
}
function defaultProgressionPlan(){return automaticProgression('Équilibré');}
function getCycleProgressionOverrides(){return parse(STORAGE.cycleProgressions,{});}
function setCycleProgressionOverrides(v){save(STORAGE.cycleProgressions,v);}
function progressionPlanForCycle(cycleOrId){
  const c=typeof cycleOrId==='object'?cycleOrId:trainingCycleById(cycleOrId),over=getCycleProgressionOverrides();
  const raw=over[String(c?.id)]||c?.progression||defaultProgressionPlan();
  const p=clone(raw);p.weeks=(p.weeks?.length?p.weeks:defaultProgressionPlan().weeks).map(normalizeProgressionWeek);return p;
}
function setProgressionPlanForCycle(id,plan){
  const c=trainingCycleById(id),clean=clone(plan);clean.weeks=(clean.weeks||[]).map(normalizeProgressionWeek);
  if(!clean.weeks.length)clean.weeks=defaultProgressionPlan().weeks;
  if(c.base){const o=getCycleProgressionOverrides();o[String(id)]=clean;setCycleProgressionOverrides(o);}else{c.progression=clean;updateTrainingCycle(c);}
}
function getCycleProgressionStates(){return parse(STORAGE.cycleProgressionStates,{});}
function setCycleProgressionStates(v){save(STORAGE.cycleProgressionStates,v);}
function ensureCycleProgressionState(id){
  const states=getCycleProgressionStates(),key=String(id);if(!states[key]){const legacy=key===BASE_TRAINING_CYCLE_ID?getPrefs().cycleStart:null,isActive=String(getActiveTrainingCycleId())===key;states[key]={startedAt:legacy||mondayDate(new Date()).toISOString(),baseBlockNumber:1,pausedAt:isActive?null:new Date().toISOString()};setCycleProgressionStates(states);}return states[key];
}
function pauseProgressionState(id){const states=getCycleProgressionStates(),key=String(id),s=states[key]||ensureCycleProgressionState(key);s.pausedAt=new Date().toISOString();states[key]=s;setCycleProgressionStates(states);}
function resumeProgressionState(id){const states=getCycleProgressionStates(),key=String(id),s=states[key]||ensureCycleProgressionState(key);if(s.pausedAt){const delta=Date.now()-new Date(s.pausedAt).getTime();s.startedAt=new Date(new Date(s.startedAt).getTime()+Math.max(0,delta)).toISOString();s.pausedAt=null;}states[key]=s;setCycleProgressionStates(states);}
function resetProgressionForCycle(id=getActiveTrainingCycleId()){
  const states=getCycleProgressionStates(),key=String(id),old=states[key]||{};states[key]={startedAt:mondayDate(new Date()).toISOString(),baseBlockNumber:Number(old.baseBlockNumber||1)+1,pausedAt:null};setCycleProgressionStates(states);render();
}
function progressionModeLabel(p){return p.mode==='auto'?'Automatique':p.mode==='custom'?'Personnalisé':'Modèle';}
function progressionDifficulty(w){const score=Math.max(1,Math.min(5,Math.round(3+(Number(w.targetFactor||1)-1)*10+(3-Number(w.rir||3))*.45)));return '●'.repeat(score)+'○'.repeat(5-score);}

const BASE_TRAINING_CYCLE_ID = "base";
function baseTrainingCycle(){
  return {id:BASE_TRAINING_CYCLE_ID,name:"Cycle de base",description:"Programme intermédiaire complet · 6 jours actifs / 1 jour de repos",base:true,days:clone(workouts)};
}
function getStoredTrainingCycles(){return parse(STORAGE.trainingCycles,[]);}
function setStoredTrainingCycles(v){save(STORAGE.trainingCycles,v);}
function allTrainingCycles(includeArchived=true){
  const stored=getStoredTrainingCycles().filter(c=>includeArchived||!c.archived);
  return [baseTrainingCycle(),...stored];
}
function trainingCycleById(id){return allTrainingCycles(true).find(c=>String(c.id)===String(id))||baseTrainingCycle();}
function getActiveTrainingCycleId(){
  const p=getPrefs(),id=p.activeTrainingCycleId||BASE_TRAINING_CYCLE_ID,c=trainingCycleById(id);
  return c?.archived?BASE_TRAINING_CYCLE_ID:String(c.id);
}
function getActiveTrainingCycle(){return trainingCycleById(getActiveTrainingCycleId());}
function cycleDayTemplate(cycle,day){
  const w=cycle?.days?.[Number(day)];
  return clone(w||{name:"Repos",subtitle:"Récupération complète",duration:0,shortDuration:0,intensity:"Repos",exercises:[]});
}
function workoutTemplateForDay(day){return cycleDayTemplate(getActiveTrainingCycle(),Number(day));}
function cycleHasRest(cycle){return [0,1,2,3,4,5,6].some(day=>!(cycleDayTemplate(cycle,day).exercises||[]).length);}
function ensureCycleActivationHistory(){
  let rows=parse(STORAGE.cycleActivationHistory,[]);
  if(!rows.length){
    const h=getHistory().slice().sort((a,b)=>new Date(a.date)-new Date(b.date));
    const d=h[0]?.date?new Date(h[0].date):mondayDate(new Date());
    rows=[{date:localDateKey(d),at:d.toISOString(),cycleId:BASE_TRAINING_CYCLE_ID}];
    save(STORAGE.cycleActivationHistory,rows);
  }
  return rows;
}
function setCycleActivationHistory(v){save(STORAGE.cycleActivationHistory,v);}
function activateTrainingCycle(id){
  const cycle=trainingCycleById(id);if(!cycle||cycle.archived)return;
  if(!cycleHasRest(cycle)){alert("Ajoute au moins un jour de repos avant d’activer ce cycle.");return;}
  const previous=getActiveTrainingCycleId();if(String(previous)!==String(cycle.id)){pauseProgressionState(previous);resumeProgressionState(cycle.id);}
  const p=getPrefs();p.activeTrainingCycleId=String(cycle.id);setPrefs(p);
  const key=localDateKey(),rows=ensureCycleActivationHistory().filter(r=>r.date!==key);
  rows.push({date:key,at:new Date().toISOString(),cycleId:String(cycle.id)});rows.sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.at).localeCompare(String(b.at)));setCycleActivationHistory(rows);
  render();
}
function trainingCycleForDate(value){
  const key=localDateKey(value),rows=ensureCycleActivationHistory().slice().sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.at).localeCompare(String(b.at)));
  let id=BASE_TRAINING_CYCLE_ID;for(const r of rows){if(String(r.date)<=key)id=r.cycleId;else break;}return trainingCycleById(id);
}
function nextTrainingCycleName(){const n=getStoredTrainingCycles().filter(c=>!c.archived).length+2;return `Cycle ${n}`;}
function createTrainingCycle(sourceId=BASE_TRAINING_CYCLE_ID){
  const source=trainingCycleById(sourceId),list=getStoredTrainingCycles(),now=Date.now();
  const c={id:String(now),name:nextTrainingCycleName(),description:`Basé sur ${source.name}`,base:false,days:clone(source.days),progression:clone(progressionPlanForCycle(source)),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
  list.push(c);setStoredTrainingCycles(list);ensureCycleProgressionState(c.id);render();
}
function updateTrainingCycle(cycle){
  if(!cycle||cycle.base)return;const list=getStoredTrainingCycles(),i=list.findIndex(c=>String(c.id)===String(cycle.id));
  const item={...clone(cycle),updatedAt:new Date().toISOString()};if(i>=0)list[i]=item;else list.push(item);setStoredTrainingCycles(list);
}
function duplicateTrainingCycle(id){
  const source=trainingCycleById(id),list=getStoredTrainingCycles(),now=Date.now();
  const copy={...clone(source),id:String(now),name:`${source.name} · copie`,base:false,archived:false,progression:clone(progressionPlanForCycle(source)),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};list.push(copy);setStoredTrainingCycles(list);ensureCycleProgressionState(copy.id);render();
}
function renameTrainingCycle(id){
  const c=trainingCycleById(id);if(!c||c.base)return;const name=prompt("Nom du cycle",c.name);if(!name?.trim())return;c.name=name.trim();updateTrainingCycle(c);render();
}
function archiveTrainingCycle(id){
  const c=trainingCycleById(id);if(!c||c.base)return;if(String(getActiveTrainingCycleId())===String(id)){alert("Active un autre cycle avant d’archiver celui-ci.");return;}
  if(!confirm(`Archiver « ${c.name} » ? Son historique restera conservé.`))return;c.archived=true;updateTrainingCycle(c);render();
}
function setCycleDayRest(id,day){
  const c=trainingCycleById(id);if(!c||c.base)return;c.days=clone(c.days||{});c.days[Number(day)]={name:"Repos",subtitle:"Récupération complète",duration:0,shortDuration:0,intensity:"Repos",exercises:[]};updateTrainingCycle(c);render();
}
function restoreCycleDayFromBase(id,day){
  const c=trainingCycleById(id);if(!c||c.base)return;const candidate=clone(c);candidate.days=clone(candidate.days||{});candidate.days[Number(day)]=cycleDayTemplate(baseTrainingCycle(),Number(day));if(!cycleHasRest(candidate)){alert('Un cycle doit conserver au moins un jour de repos.');return;}updateTrainingCycle(candidate);render();
}
function openCycleDayEditor(id,day){
  const c=trainingCycleById(id);if(!c||c.base)return;const current=cycleDayTemplate(c,Number(day)),empty=!(current.exercises||[]).length,draft=empty?{...defaultCustomWorkout(),name:`${DAY_NAMES[Number(day)]} · séance`,subtitle:'Journée personnalisée du cycle'}:current;state.cycleDayTarget={cycleId:String(id),day:Number(day)};state.customSessionDraft=clone(draft);state.customSessionEditor=true;state.view='custom';render();
}
function isStrengthQuickLog(q){const cat=exerciseInfo(q.exercise)?.category||'';return !/Mobilité|Cardio/i.test(cat)&&!/^Échauffement|Mobilité|Retour au calme/i.test(q.exercise||'');}
function activityDateKey(a){return String(a?.start_date_local||a?.start_date||'').slice(0,10);}
function dailyCycleStatus(value){
  const d=value instanceof Date?value:new Date(value),key=localDateKey(d),today=localDateKey(),rows=ensureCycleActivationHistory(),trackedFrom=rows[0]?.date||today,cycle=trainingCycleForDate(d),w=cycleDayTemplate(cycle,d.getDay()),isRest=!(w.exercises||[]).length;
  if(key<trackedFrom)return {key,status:'untracked',cycle,w};
  if(key>today)return {key,status:'future',cycle,w};
  const sessions=getHistory().filter(h=>localDateKey(h.date)===key),quick=getQuickLogs().filter(q=>localDateKey(q.date)===key&&isStrengthQuickLog(q)),runs=getStravaActivities().filter(a=>activityDateKey(a)===key&&isRunActivity(a)&&Number(a.moving_time||a.elapsed_time||0)>=900);
  if(isRest){
    // Mobility, stretching, walking and cardio are compatible with a recovery day.
    // Only a real strength/calisthenics session or strength micro-set interrupts the planned rest.
    const strengthSessions=sessions.filter(h=>(h.entries||[]).some(e=>{const n=String(e.exercise||'');return !/mobilité|étirement|stretch|respiration|cardio|marche|échauffement|retour au calme/i.test(n);}));
    const breaksRest=strengthSessions.length||quick.length;
    if(key===today)return {key,status:breaksRest?'rest-broken':'rest-planned',cycle,w};
    return {key,status:breaksRest?'rest-broken':'rest-ok',cycle,w};
  }
  const plannedSessions=sessions.filter(h=>h.trainingCycleId?String(h.trainingCycleId)===String(cycle.id)&&Number(h.day)===d.getDay():!h.customWorkoutId&&Number(h.day)===d.getDay());
  if(plannedSessions.length){const session=plannedSessions[0],status=session.sessionLength==='short'?'done-express':'done';return {key,status,cycle,w,session};}
  return {key,status:key===today?'planned':'missed',cycle,w};
}
/* respectedRestDays retiré en v10.86 : le rang ne dépend plus d’un compteur d’ancienneté. */
function renderCycleHeatmap(weeks=16){
  const today=new Date(),end=mondayDate(today);end.setDate(end.getDate()+6);const start=new Date(end);start.setDate(start.getDate()-(weeks*7-1));
  const cells=[];const counts={done:0,'done-express':0,'rest-ok':0,missed:0,'rest-broken':0};
  for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)){const st=dailyCycleStatus(new Date(d));if(counts[st.status]!=null)counts[st.status]++;const title=`${st.key} · ${st.cycle.name} · ${st.status==='done'?'séance complète':st.status==='done-express'?'séance express':st.status==='rest-ok'?'repos respecté':st.status==='rest-planned'?'repos prévu':st.status==='rest-broken'?'repos interrompu':st.status==='missed'?'séance manquée':st.status==='planned'?'séance prévue':st.status==='untracked'?'avant suivi':'à venir'}`;cells.push(`<i class="cycle-heat-cell ${st.status}" title="${esc(title)}" aria-label="${esc(title)}"></i>`);}
  return `<section class="card cycle-heat-card"><div class="section-head"><div><div class="kicker">Régularité · ${weeks} semaines</div><h2>Historique du cycle</h2></div><span class="pill">régularité</span></div><div class="cycle-heat-summary"><span><strong>${counts.done+counts['done-express']}</strong> séances terminées</span><span><strong>${counts['rest-ok']}</strong> repos respectés</span><span><strong>${counts.missed}</strong> jours manqués</span></div><div class="cycle-heat-wrap"><div class="cycle-heat-days"><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span></div><div class="cycle-heat-grid">${cells.join('')}</div></div><div class="cycle-heat-legend"><span><i class="done"></i>Séance complète</span><span><i class="done-express"></i>Séance express</span><span><i class="rest-ok"></i>Repos respecté</span><span><i class="missed"></i>Manqué</span><span><i class="rest-broken"></i>Repos interrompu</span></div><p class="muted small">Un repos est validé le lendemain tant qu’aucun renforcement ou micro-série de force n’est enregistré. Étirements, mobilité, marche et cardio restent compatibles avec la récupération.</p></section>`;
}

const QUICK_PRESETS = [
  { name:"Tractions strictes", label:"Tractions", type:"reps", adds:[1,5] },
  { name:"Tractions assistées", label:"Tractions assistées", type:"reps_band", adds:[1,5] },
  { name:"Dips", label:"Dips", type:"reps", adds:[1,5] },
  { name:"Dips assistés", label:"Dips assistés", type:"reps_band", adds:[1,5] },
  { name:"Pompes", label:"Pompes", type:"reps", adds:[5,10] },
  { name:"Squats poids du corps", label:"Squats", type:"reps", adds:[10,20] },
  { name:"Dead hang", label:"Dead hang", type:"hold", adds:[15,30] },
];

function localDateKey(value=new Date()) {
  const d=value instanceof Date?value:new Date(value);
  const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function repsEquivalent(type,value){
  const v=Number(value||0);
  if(type==='reps_side')return v*2;
  return type?.startsWith('reps')?v:0;
}
function quickFamily(name){
  if(name==='Tractions strictes')return 'Tractions';
  if(name==='Pompes')return 'Pompes';
  if(name==='Squats poids du corps'||name==='Squat tempo')return 'Squats';
  if(name==='Dips')return 'Dips';
  if(name==='Dead hang')return 'Dead hang';
  return name;
}
function quickUnit(type){return type?.startsWith('hold')?'s':'reps';}
function quickFavoriteSupportedExercise(item){
  const type=item?.prescription?.type||'';
  return !!item?.name&&(type.startsWith('reps')||type.startsWith('hold'));
}
function quickFavoriteCandidates(){
  const selected=getQuickFavorites(),selectedIndex=new Map(selected.map((name,i)=>[name,i]));
  return visibleExerciseLibrary().filter(quickFavoriteSupportedExercise).sort((a,b)=>{
    const ai=selectedIndex.has(a.name)?selectedIndex.get(a.name):999,bi=selectedIndex.has(b.name)?selectedIndex.get(b.name):999;
    if(ai!==bi)return ai-bi;
    const score=quickFavoriteUsageScore(b.name)-quickFavoriteUsageScore(a.name);
    return score||a.name.localeCompare(b.name,'fr');
  });
}
function defaultQuickFavorites(){
  const available=new Set(visibleExerciseLibrary().filter(quickFavoriteSupportedExercise).map(x=>x.name));
  return QUICK_PRESETS.map(x=>x.name).filter(name=>available.has(name)).slice(0,6);
}
function getQuickFavorites(){
  const raw=parse(STORAGE.quickFavorites,null);
  const source=Array.isArray(raw)?raw:defaultQuickFavorites();
  const available=new Set(visibleExerciseLibrary().filter(quickFavoriteSupportedExercise).map(x=>x.name));
  return [...new Set(source.map(String).filter(name=>available.has(name)))].slice(0,8);
}
function setQuickFavorites(names){
  const available=new Set(visibleExerciseLibrary().filter(quickFavoriteSupportedExercise).map(x=>x.name));
  save(STORAGE.quickFavorites,[...new Set((names||[]).map(String).filter(name=>available.has(name)))].slice(0,8));
}
function quickFavoriteUsageScore(name){
  const since=Date.now()-90*86400000;
  let score=0;
  getQuickLogs().forEach(x=>{if(x.exercise===name&&new Date(x.date).getTime()>=since)score+=4;});
  getHistory().forEach(s=>{if(new Date(s.date).getTime()<since)return;(s.entries||[]).forEach(e=>{if(e.exercise===name)score+=1;});});
  return score;
}
function quickFavoriteLastLog(name){return getQuickLogs().find(x=>x.exercise===name)||null;}
function quickFavoriteDefaultValues(name,type){
  const last=quickFavoriteLastLog(name),info=exerciseInfo(name),target=Number(info?.prescription?.target||0),lastValue=Number(last?.value||0);
  if(String(type).startsWith('hold')){
    const base=Math.max(10,Math.round((lastValue||target||30)/5)*5),step=base>=60?15:base>=30?10:5;
    return [base,base+step,base+step*2];
  }
  const base=Math.max(1,Math.round(lastValue||target||5)),step=base>=20?5:base>=8?2:1;
  return [base,base+step,base+step*2];
}
function getQuickFavoritePresetMap(){const raw=parse(STORAGE.quickFavoritePresets,{});return raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};}
function normalizeQuickFavoriteValues(name,type,values){
  const defaults=quickFavoriteDefaultValues(name,type),out=[];
  (Array.isArray(values)?values:[]).forEach(v=>{v=Math.round(Number(v||0));if(v>0&&!out.includes(v))out.push(v);});
  defaults.forEach(v=>{if(out.length<3&&!out.includes(v))out.push(v);});
  return out.slice(0,3);
}
function quickFavoriteAddValues(name,type){return normalizeQuickFavoriteValues(name,type,getQuickFavoritePresetMap()[name]);}
function setQuickFavoritePresetValues(name,values){
  const info=exerciseInfo(name),type=info?.prescription?.type||'reps',map=getQuickFavoritePresetMap();
  map[name]=normalizeQuickFavoriteValues(name,type,values);save(STORAGE.quickFavoritePresets,map);return map[name];
}
function renderQuickFavoritePreset(name,index){
  const info=exerciseInfo(name),type=info?.prescription?.type||'reps',isBand=type==='reps_band',last=quickFavoriteLastLog(name),values=quickFavoriteAddValues(name,type),preferred=isBand?(last?.band||lastBandForExercise(name)||defaultBandForExercise(name)):null;
  const recent=last?`Dernière : ${Number(last.value||0)} ${quickUnit(type)}${last.band?' · '+bandByLabel(last.band).short:''}`:(isBand?'répétitions · assistance':type.startsWith('hold')?'secondes':'répétitions');
  return `<article class="quick-preset quick-preset-rich quick-favorite-card" data-quick-preset="fav-${index}"><div class="quick-preset-head"><div><strong>${esc(name)}</strong><small>${esc(recent)}</small></div><div class="quick-preset-actions">${values.map(v=>`<button class="quick-add quick-favorite-value" data-quick-preset-index="fav-${index}" data-quick-name="${encodeURIComponent(name)}" data-quick-type="${type}" data-quick-value="${v}">${v}${type.startsWith('hold')?'s':''}</button>`).join('')}</div></div>${isBand?`<div class="quick-preset-bandrow"><label>Bande</label>${renderPresetBandPicker(preferred,name,`fav-${index}`)}</div>`:''}<div class="quick-exact"><input class="quick-exact-input" id="quickExact_fav-${index}" type="number" inputmode="numeric" min="1" step="1" placeholder="Valeur exacte"><button class="quick-exact-add" data-quick-exact-index="fav-${index}" data-quick-preset-index="fav-${index}" data-quick-name="${encodeURIComponent(name)}" data-quick-type="${type}">Ajouter</button></div></article>`;
}
function renderQuickFavorites(){
  const favorites=getQuickFavorites();
  return `<section class="quick-favorites"><div class="quick-favorites-head"><div><span>Mes favoris</span><small>${favorites.length}/8 exercices épinglés</small></div><button type="button" id="manageQuickFavorites">Gérer</button></div>${favorites.length?`<div class="quick-presets quick-favorites-grid">${favorites.map(renderQuickFavoritePreset).join('')}</div>`:`<button type="button" class="quick-favorites-empty" id="manageQuickFavoritesEmpty"><strong>Choisir mes exercices favoris</strong><small>Épingle les mouvements que tu pratiques le plus pour les saisir en quelques secondes.</small></button>`}</section>`;
}
function renderQuickFavoritesManager(){
  if(!state.quickFavoritesEditor)return '';
  const selected=getQuickFavorites(),candidates=quickFavoriteCandidates(),categories=[...new Set(candidates.map(x=>x.category))].sort((a,b)=>a.localeCompare(b,'fr'));
  return `<div class="quick-favorite-manager"><div class="quick-favorite-manager-head"><div><div class="kicker">Personnalisation · ${selected.length}/8</div><h3>Mes exercices rapides</h3><p>Épingle jusqu’à 8 exercices et définis 3 valeurs rapides pour chacun. La saisie exacte reste toujours disponible.</p></div><button type="button" class="btn btn-primary compact" id="doneQuickFavorites">Terminé</button></div>${state.quickFavoriteMessage?`<div class="quick-favorite-message">${esc(state.quickFavoriteMessage)}</div>`:''}${selected.length?`<div class="quick-favorite-selected">${selected.map((name,i)=>{const type=exerciseInfo(name)?.prescription?.type||'reps',values=quickFavoriteAddValues(name,type),unit=type.startsWith('hold')?'sec':'reps';return `<div class="quick-favorite-selected-row"><div class="quick-favorite-selected-main"><span><b>${i+1}</b><strong>${esc(name)}</strong></span><span class="quick-favorite-order"><button type="button" data-quick-favorite-move="up" data-quick-favorite-name="${encodeURIComponent(name)}" ${i===0?'disabled':''}>↑</button><button type="button" data-quick-favorite-move="down" data-quick-favorite-name="${encodeURIComponent(name)}" ${i===selected.length-1?'disabled':''}>↓</button><button type="button" class="remove" data-quick-favorite-toggle="${encodeURIComponent(name)}">×</button></span></div><div class="quick-favorite-presets-editor"><span>Valeurs rapides</span>${values.map((v,j)=>`<label><small>${j+1}</small><input type="number" min="1" step="1" inputmode="numeric" value="${v}" data-quick-favorite-preset-name="${encodeURIComponent(name)}" data-quick-favorite-preset-index="${j}" aria-label="Valeur rapide ${j+1} pour ${esc(name)}"></label>`).join('')}<em>${unit}</em></div></div>`}).join('')}</div>`:''}<div class="quick-favorite-picker"><div class="quick-search-wrap"><span aria-hidden="true">⌕</span><input id="quickFavoriteSearch" type="search" placeholder="Rechercher un exercice…" autocomplete="off"></div><div class="quick-category-tabs favorite-tabs" role="tablist"><button type="button" class="quick-favorite-category ${state.quickFavoriteCategory==='Tous'?'active':''}" data-quick-favorite-category="Tous">Tous</button>${categories.map(c=>`<button type="button" class="quick-favorite-category ${state.quickFavoriteCategory===c?'active':''}" data-quick-favorite-category="${esc(c)}">${esc(c)}</button>`).join('')}</div><div class="quick-favorite-list" id="quickFavoriteList">${candidates.map(item=>{const active=selected.includes(item.name),usage=quickFavoriteUsageScore(item.name);return `<button type="button" class="quick-favorite-option ${active?'active':''}" data-quick-favorite-toggle="${encodeURIComponent(item.name)}" data-quick-favorite-category-name="${esc(item.category)}" data-quick-favorite-search="${esc((item.name+' '+item.category+' '+item.level+' '+(item.muscles||[]).join(' ')).toLowerCase())}"><span>${quickExerciseThumb(item.name)}</span><span><strong>${esc(item.name)}</strong><small>${esc(item.category)}${usage?` · utilisé récemment`:''}</small></span><b>${active?'★':'☆'}</b></button>`}).join('')}</div><div class="quick-exercise-empty" id="quickFavoriteEmpty" hidden>Aucun exercice ne correspond à cette recherche.</div></div></div>`;
}
function setQuickSearchVisibility(card,show){
  if(!card)return;
  card.hidden=!show;
  card.classList?.toggle('quick-search-hidden',!show);
  if(card.style)card.style.display=show?'':'none';
}
function setQuickSearchEmptyState(element,show){
  if(!element)return;
  element.hidden=!show;
  element.classList?.toggle('quick-search-hidden',!show);
  if(element.style)element.style.display=show?'':'none';
}
function filterQuickFavoritePicker(){
  const q=normalizeQuickSearchText(document.getElementById('quickFavoriteSearch')?.value||'');
  if(q){state.quickFavoriteCategory='Tous';document.querySelectorAll('[data-quick-favorite-category]').forEach(tab=>tab.classList.toggle('active',tab.dataset.quickFavoriteCategory==='Tous'));}
  const cat=q?'Tous':(state.quickFavoriteCategory||'Tous');let visible=0;
  document.querySelectorAll('.quick-favorite-option').forEach(card=>{const hay=normalizeQuickSearchText(card.dataset.quickFavoriteSearch||''),show=(cat==='Tous'||card.dataset.quickFavoriteCategoryName===cat)&&(!q||hay.includes(q));setQuickSearchVisibility(card,show);if(show)visible++;});
  setQuickSearchEmptyState(document.getElementById('quickFavoriteEmpty'),visible===0);
}
function toggleQuickFavorite(name){
  const list=getQuickFavorites(),i=list.indexOf(name);
  if(i>=0){list.splice(i,1);state.quickFavoriteMessage=null;setQuickFavorites(list);return true;}
  if(list.length>=8){state.quickFavoriteMessage='8 favoris maximum · retire un exercice pour en ajouter un autre.';return false;}
  list.push(name);state.quickFavoriteMessage=null;setQuickFavorites(list);return true;
}
function moveQuickFavorite(name,direction){
  const list=getQuickFavorites(),i=list.indexOf(name),delta=direction==='up'?-1:1,j=i+delta;if(i<0||j<0||j>=list.length)return;
  [list[i],list[j]]=[list[j],list[i]];setQuickFavorites(list);
}
function addQuickLog(name,value,type=null,band=null,loadKg=null){
  value=Number(value||0); if(!(value>0))return;
  const info=exerciseInfo(name);
  const resolvedType=type || info?.prescription?.type || 'reps';
  const logs=getQuickLogs();
  logs.unshift({id:Date.now(),date:new Date().toISOString(),exercise:name,type:resolvedType,value,band:resolvedType==='reps_band'?band:null,loadKg:usesBackpack(name)?Number(loadKg||0):null,source:'quick'});
  setQuickLogs(logs.slice(0,5000));
  state.quickToast=`${quickFamily(name)} +${value} ${quickUnit(resolvedType)}${band?' · '+bandByLabel(band).short:''}${usesBackpack(name)&&Number(loadKg)>0?' · sac '+Number(loadKg)+' kg':''}`;
  render();
}
function deleteQuickLog(id){
  const logs=getQuickLogs(),next=logs.filter(x=>String(x.id)!==String(id));
  if(next.length===logs.length)return false;
  setQuickLogs(next);state.quickToast='Ligne supprimée du journal';render();return true;
}
function quickLogJournalValue(log){
  const unit=quickUnit(log.type),band=log.band?` · ${bandByLabel(log.band).short}`:'',load=Number(log.loadKg||0)>0?` · ${Number(log.loadKg)} kg`:'';
  return `${Number(log.value||0)} ${unit}${band}${load}`;
}
function quickLogJournalDate(log){
  const d=new Date(log.date);if(Number.isNaN(d.getTime()))return '';
  const today=localDateKey(),key=localDateKey(d),time=d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  if(key===today)return `Aujourd’hui · ${time}`;
  const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
  if(key===localDateKey(yesterday))return `Hier · ${time}`;
  return `${d.toLocaleDateString('fr-FR',{day:'2-digit',month:'short'})} · ${time}`;
}
function renderQuickLogJournal(limit=20){
  const logs=getQuickLogs().slice(0,limit);
  return `<section class="quick-log-journal"><div class="quick-log-journal-head"><div><span>Journal</span><small>${logs.length?`${logs.length} dernier${logs.length>1?'s':''} enregistrement${logs.length>1?'s':''}`:'Aucune ligne enregistrée'}</small></div><span class="quick-log-journal-count">${getQuickLogs().length}</span></div>${logs.length?`<div class="quick-log-journal-list">${logs.map(log=>`<div class="quick-log-journal-row"><div class="quick-log-journal-main"><strong>${esc(log.exercise||'Exercice')}</strong><small>${esc(quickLogJournalDate(log))}</small></div><div class="quick-log-journal-value"><strong>${esc(quickLogJournalValue(log))}</strong>${log.source==='core_timer'?'<small>Gainage</small>':'<small>Rapide</small>'}</div><button type="button" class="quick-log-delete" data-delete-quick-log="${esc(String(log.id))}" aria-label="Supprimer ${esc(log.exercise||'cette ligne')}" title="Supprimer">${uiIcon('trash','quick-log-trash-icon')}</button></div>`).join('')}</div>`:'<div class="quick-log-journal-empty"><strong>Ton journal est vide</strong><small>Chaque série enregistrée rapidement apparaîtra ici et pourra être supprimée individuellement.</small></div>'}</section>`;
}
function quickLogsForRange(days=1){
  const cutoff=new Date(); cutoff.setHours(0,0,0,0); cutoff.setDate(cutoff.getDate()-(days-1));
  return getQuickLogs().filter(x=>new Date(x.date)>=cutoff);
}
function guidedEntriesForDate(date=new Date()){
  const key=localDateKey(date),out=[];
  getHistory().filter(s=>localDateKey(s.date)===key).forEach(s=>(s.entries||[]).forEach(e=>out.push(e)));
  return out;
}
function dailyVolumeRows(date=new Date()){
  const key=localDateKey(date),quick=getQuickLogs().filter(x=>localDateKey(x.date)===key),guided=guidedEntriesForDate(date);
  const families=new Map();
  const ensure=(family,type='reps')=>{if(!families.has(family))families.set(family,{family,type,quick:0,guided:0,quickSets:0,guidedSets:0});return families.get(family);};
  quick.forEach(x=>{const f=quickFamily(x.exercise),row=ensure(f,x.type);row.quick+=(x.type?.startsWith('hold')?Number(x.value||0):repsEquivalent(x.type,x.value));row.quickSets++;});
  guided.forEach(x=>{if(x.type==='timer')return;const f=quickFamily(x.exercise),row=ensure(f,x.type);row.guided+=(x.type?.startsWith('hold')?Number(x.value||0):repsEquivalent(x.type,x.value));row.guidedSets++;});
  const order=['Tractions','Tractions assistées','Dips','Dips assistés','Pompes','Squats','Dead hang'];
  return [...families.values()].sort((a,b)=>{const ai=order.indexOf(a.family),bi=order.indexOf(b.family);return (ai<0?99:ai)-(bi<0?99:bi)||a.family.localeCompare(b.family,'fr');});
}
function quickSummary(days=7){
  const logs=quickLogsForRange(days),by=new Map();let reps=0,seconds=0;
  logs.forEach(x=>{const f=quickFamily(x.exercise),k=`${f}::${quickUnit(x.type)}`;const row=by.get(k)||{family:f,unit:quickUnit(x.type),value:0,sets:0};const v=x.type?.startsWith('hold')?Number(x.value||0):repsEquivalent(x.type,x.value);row.value+=v;row.sets++;by.set(k,row);if(row.unit==='s')seconds+=v;else reps+=v;});
  return {logs,rows:[...by.values()].sort((a,b)=>b.value-a.value),reps,seconds,sets:logs.length};
}


function entryResolvedType(entry){
  return entry?.type || exerciseInfo(entry?.exercise||'')?.prescription?.type || 'reps';
}
function repValueForEntry(entry){
  const type=entryResolvedType(entry),value=Number(entry?.value||0);
  if(!(value>0) || type==='timer' || type?.startsWith('hold'))return 0;
  return type==='reps_side'?value*2:value;
}
function holdSecondsForEntry(entry){
  const type=entryResolvedType(entry),value=Number(entry?.value||0);
  if(!(value>0) || !type?.startsWith('hold'))return 0;
  return type==='hold_side'?value*2:value;
}
function repPeriodBounds(period=state.repVolumePeriod){
  const end=new Date();end.setHours(23,59,59,999);
  if(period==='all')return {start:null,end,label:'Depuis le début'};
  if(period==='custom'){
    const from=state.repVolumeFrom?new Date(`${state.repVolumeFrom}T00:00:00`):null;
    const to=state.repVolumeTo?new Date(`${state.repVolumeTo}T23:59:59.999`):end;
    return {start:from&&!Number.isNaN(from.getTime())?from:null,end:to&&!Number.isNaN(to.getTime())?to:end,label:'Période personnalisée'};
  }
  const days=period==='7d'?7:period==='90d'?90:period==='365d'?365:30;
  const start=new Date();start.setHours(0,0,0,0);start.setDate(start.getDate()-(days-1));
  return {start,end,label:days===365?'1 an':`${days} jours`};
}
function inRepPeriod(date,bounds){
  const t=new Date(date).getTime();if(Number.isNaN(t))return false;
  return (!bounds.start||t>=bounds.start.getTime())&&(!bounds.end||t<=bounds.end.getTime());
}
function repetitionVolume(period=state.repVolumePeriod){
  const bounds=repPeriodBounds(period),by=new Map();let reps=0,holdSeconds=0,sets=0,guidedReps=0,quickReps=0,guidedSets=0,quickSets=0;
  const ensure=(name)=>{if(!by.has(name))by.set(name,{name,reps:0,holdSeconds:0,sets:0,guidedReps:0,quickReps:0,guidedSets:0,quickSets:0});return by.get(name);};
  getHistory().forEach(session=>{if(!inRepPeriod(session.date,bounds))return;(session.entries||[]).forEach(entry=>{const type=entryResolvedType(entry);if(type==='timer')return;const r=repValueForEntry(entry),h=holdSecondsForEntry(entry);if(!(r>0||h>0))return;const row=ensure(entry.exercise||'Exercice');row.reps+=r;row.holdSeconds+=h;row.sets++;row.guidedReps+=r;row.guidedSets++;reps+=r;holdSeconds+=h;sets++;guidedReps+=r;guidedSets++;});});
  getQuickLogs().forEach(log=>{if(!inRepPeriod(log.date,bounds))return;const r=repValueForEntry(log),h=holdSecondsForEntry(log);if(!(r>0||h>0))return;const row=ensure(log.exercise||'Exercice');row.reps+=r;row.holdSeconds+=h;row.sets++;row.quickReps+=r;row.quickSets++;reps+=r;holdSeconds+=h;sets++;quickReps+=r;quickSets++;});
  const rows=[...by.values()].sort((a,b)=>(b.reps-a.reps)||(b.holdSeconds-a.holdSeconds)||a.name.localeCompare(b.name,'fr'));
  return {bounds,rows,reps,holdSeconds,sets,guidedReps,quickReps,guidedSets,quickSets,exerciseCount:rows.length};
}
function formatRepPeriodLabel(bounds){
  if(!bounds.start)return 'Depuis le début';
  const f=d=>d.toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:d.getFullYear()!==new Date().getFullYear()?'numeric':undefined});
  return `${f(bounds.start)} → ${f(bounds.end)}`;
}
function renderRepetitionVolumePanel(){
  const data=repetitionVolume(),all=repetitionVolume('all'),top=data.rows.filter(r=>r.reps>0).slice(0,10),holds=data.rows.filter(r=>r.holdSeconds>0).slice(0,6),max=Math.max(1,...top.map(r=>r.reps));
  const periodButtons=[['7d','7 j'],['30d','30 j'],['90d','90 j'],['365d','1 an'],['all','Tout'],['custom','Dates']];
  return `<section class="card rep-volume-card"><div class="section-head"><div><div class="kicker">Volume cumulé</div><h2>Répétitions</h2></div><span class="pill">${all.reps.toLocaleString('fr-FR')} reps total</span></div>
    <p class="muted small">Toutes les répétitions enregistrées dans les séances guidées, Express, personnelles et Quick Logs. Les holds sont suivis séparément en secondes.</p>
    <div class="rep-period-tabs">${periodButtons.map(([id,label])=>`<button class="rep-period ${state.repVolumePeriod===id?'active':''}" data-rep-period="${id}">${label}</button>`).join('')}</div>
    ${state.repVolumePeriod==='custom'?`<div class="rep-custom-range"><label><span>Du</span><input id="repVolumeFrom" type="date" value="${esc(state.repVolumeFrom||'')}"></label><label><span>Au</span><input id="repVolumeTo" type="date" value="${esc(state.repVolumeTo||'')}"></label></div>`:''}
    <div class="rep-period-label">${formatRepPeriodLabel(data.bounds)}</div>
    <div class="rep-volume-hero"><div><strong>${data.reps.toLocaleString('fr-FR')}</strong><span>répétitions</span></div><div><strong>${data.sets.toLocaleString('fr-FR')}</strong><span>séries enregistrées</span></div><div><strong>${data.exerciseCount}</strong><span>exercices</span></div><div><strong>${Math.round(data.holdSeconds/60)}</strong><span>min de holds</span></div></div>
    <div class="rep-source"><span>Séances <b>${data.guidedReps.toLocaleString('fr-FR')} reps · ${data.guidedSets} séries</b></span><span>Quick Log <b>${data.quickReps.toLocaleString('fr-FR')} reps · ${data.quickSets} séries</b></span></div>
    ${top.length?`<div class="rep-ranking">${top.map((r,i)=>`<div class="rep-rank-row"><div class="rep-rank-head"><span><i>${i+1}</i><strong>${r.name}</strong></span><b>${r.reps.toLocaleString('fr-FR')} reps</b></div><div class="rep-track"><i style="width:${Math.max(3,(r.reps/max)*100)}%"></i></div><small>${r.sets} séries · séances ${r.guidedReps.toLocaleString('fr-FR')} · Quick Log ${r.quickReps.toLocaleString('fr-FR')}</small></div>`).join('')}</div>`:'<div class="empty">Aucune répétition enregistrée sur cette période.</div>'}
    ${holds.length?`<details class="parameter-details rep-holds"><summary><div><strong>Holds & isométriques</strong><small>${Math.round(data.holdSeconds/60)} min cumulées</small></div><span>⌄</span></summary><div class="parameter-body">${holds.map(r=>`<div class="detail-row"><span>${r.name} · ${r.sets} séries</span><strong>${r.holdSeconds.toLocaleString('fr-FR')} s</strong></div>`).join('')}</div></details>`:''}
    ${data.rows.length>10?`<details class="parameter-details"><summary><div><strong>Tous les exercices</strong><small>${data.rows.length} exercices enregistrés</small></div><span>⌄</span></summary><div class="parameter-body rep-all-list">${data.rows.map(r=>`<div class="detail-row"><span>${r.name}<small>${r.sets} séries</small></span><strong>${r.reps?r.reps.toLocaleString('fr-FR')+' reps':''}${r.reps&&r.holdSeconds?' · ':''}${r.holdSeconds?r.holdSeconds.toLocaleString('fr-FR')+' s':''}</strong></div>`).join('')}</div></details>`:''}
    <details class="parameter-details"><summary><div><strong>Règles de comptage</strong><small>Pour garder un volume cohérent</small></div><span>⌄</span></summary><div class="parameter-body"><p>Une répétition unilatérale saisie « par côté » compte pour les deux côtés : 8 Bulgarian split squats par jambe = 16 répétitions totales. Les exercices assistés restent séparés des versions strictes. Les timers de cardio, échauffement et mobilité ne sont pas comptés en répétitions.</p><p>Le total historique est recalculé à partir de tes données existantes : tu n'as rien à ressaisir.</p></div></details>
  </section>`;
}

const PHOTO_DB = "calisthenie-coach-media";
function openPhotoDB(){
  return new Promise((resolve,reject)=>{
    if(!("indexedDB" in globalThis)){reject(new Error("IndexedDB indisponible"));return;}
    const req=indexedDB.open(PHOTO_DB,1);
    req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains("photos"))req.result.createObjectStore("photos",{keyPath:"id"});};
    req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
  });
}
async function putPhoto(id,blob){const db=await openPhotoDB();return new Promise((resolve,reject)=>{const tx=db.transaction("photos","readwrite");tx.objectStore("photos").put({id,blob});tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);});}
async function getPhoto(id){const db=await openPhotoDB();return new Promise((resolve,reject)=>{const tx=db.transaction("photos","readonly"),req=tx.objectStore("photos").get(id);req.onsuccess=()=>{db.close();resolve(req.result?.blob||null);};req.onerror=()=>reject(req.error);});}
async function clearPhotos(){try{const db=await openPhotoDB();return await new Promise((resolve,reject)=>{const tx=db.transaction("photos","readwrite");tx.objectStore("photos").clear();tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);});}catch{}}

function blobToDataURL(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(blob);});}
function dataURLToBlob(dataURL){const [meta,data]=String(dataURL||'').split(',');if(!meta||!data)return null;const mime=(meta.match(/data:([^;]+)/)||[])[1]||'application/octet-stream';const bin=atob(data),bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);return new Blob([bytes],{type:mime});}
function backupStorageEntries(){return Object.entries(STORAGE).filter(([name])=>!['localNotificationState','webPushDeviceState','skillPriorities'].includes(name));}
function bodyPhotoIdsForBackup(row){return [...new Set(['front','side','back'].map(pos=>typeof bodyPhotoId==='function'?bodyPhotoId(row,pos):(row?.photoIds?.[pos]||(pos==='front'?row?.photoId:null))).filter(Boolean))];}
async function exportBackup(){
  const data={};
  backupStorageEntries().forEach(([name,key])=>{data[name]=parse(key,null);});
  const photos={};
  for(const row of getBodyLogs()){
    for(const photoId of bodyPhotoIdsForBackup(row)){
      if(photos[photoId])continue;
      try{const blob=await getPhoto(photoId);if(blob)photos[photoId]=await blobToDataURL(blob);}catch(e){console.warn('Photo non exportée',photoId,e);}
    }
  }
  const backup={app:'KINETIK',schema:2,version:'10.148',exportedAt:new Date().toISOString(),data,photos};
  const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=`calisthenie-coach-backup-${localDateKey()}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function importBackupFile(file){
  if(!file)return;
  let backup;
  try{backup=JSON.parse(await file.text());}catch{alert('Ce fichier n’est pas un JSON valide.');return;}
  if(!backup||backup.app!=='KINETIK'||!backup.data||typeof backup.data!=='object'){alert('Ce fichier ne semble pas être une sauvegarde KINETIK valide.');return;}
  if(!confirm('Restaurer cette sauvegarde ? Les données actuelles de ce navigateur seront remplacées.'))return;
  try{
    await window.KinetikWebPush?.disable?.({unsubscribeBrowser:true,render:false});
    localStorage.removeItem(STORAGE.localNotificationState);
    localStorage.removeItem(STORAGE.webPushDeviceState);
    // A restore is a replacement of the sporting/app dataset, not a merge. Account identity stays device-local.
    backupStorageEntries().forEach(([,key])=>localStorage.removeItem(key));
    if(STORAGE.skillPriorities)localStorage.removeItem(STORAGE.skillPriorities);
    backupStorageEntries().forEach(([name,key])=>{if(!Object.prototype.hasOwnProperty.call(backup.data,name))return;const value=backup.data[name];if(value===null||value===undefined)localStorage.removeItem(key);else save(key,value);});
    await clearPhotos();
    if(backup.photos&&typeof backup.photos==='object'){
      for(const [id,dataURL] of Object.entries(backup.photos)){const blob=dataURLToBlob(dataURL);if(blob)await putPhoto(id,blob);}
    }
    state.active=null;state.quickEditor=false;state.bodyEditor=false;state.selectedHistoryId=null;state.view='athlete';render();alert('Sauvegarde restaurée avec succès.');
  }catch(e){console.error(e);alert('La restauration a échoué. Les données du fichier n’ont pas pu être entièrement importées.');}
}

async function compressPhoto(file){
  if(!file)return null;
  const bitmap=await createImageBitmap(file),max=1280,scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement("canvas");canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
  const ctx=canvas.getContext("2d");ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();
  return await new Promise(resolve=>canvas.toBlob(resolve,"image/jpeg",.76));
}
function estimateBodyFat(heightCm,waistCm,neckCm){
  const h=Number(heightCm),w=Number(waistCm),n=Number(neckCm);if(!(h>0&&w>n&&n>0))return null;
  const inch=2.54, result=86.010*Math.log10((w-n)/inch)-70.041*Math.log10(h/inch)+36.76;
  return clamp(result,2,60);
}

function fmtTime(sec) {
  sec = Math.max(0, Math.round(Number(sec) || 0));
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function formatDate(iso) {
  return new Intl.DateTimeFormat("fr-FR", { day:"2-digit", month:"short", year:"numeric" }).format(new Date(iso));
}
function formatShortDate(iso) {
  return new Intl.DateTimeFormat("fr-FR", { day:"2-digit", month:"2-digit" }).format(new Date(iso));
}
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function esc(v="") { return String(v).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c])); }
function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
function todayDay() { return new Date().getDay(); }

function describe(e) {
  if (e.type === "timer") return `${e.sets > 1 ? e.sets+' × ' : ''}${fmtTime(e.target)}`;
  if (e.type.startsWith("hold")) return `${e.sets} × ${e.target} sec${e.type==='hold_side'?' / côté':''}`;
  if (e.type.startsWith("reps")) return `${e.sets} × ${e.target} reps${e.type==='reps_side'?' / côté':''}${e.type==='reps_band'?' · bande':''}`;
  return "";
}

function exerciseSessions(name, limit=6) {
  const out = [];
  for (const session of getHistory()) {
    const entries = (session.entries || []).filter(e => e.exercise === name);
    if (entries.length) out.push({ session, entries });
    if (out.length >= limit) break;
  }
  return out;
}

function sessionExerciseRatio(entries) {
  if (!entries.length) return 1;
  return entries.reduce((sum,e)=>sum + (Number(e.value||0) / Math.max(1, Number(e.target||1))), 0) / entries.length;
}

function entryProgressionTarget(entry){ return Number(entry.progressionTarget || entry.target || entry.baseTarget || 0); }
function sessionProgressionTarget(s){
  const vals=s.entries.map(entryProgressionTarget).filter(v=>v>0);
  return vals.length ? Math.max(...vals) : 0;
}
function isProgressionSessionUsable(s){
  return s && !s.session?.jointDiscomfort && s.session?.readiness?.mode !== 'recovery' && Number(s.session?.cycle?.week||0)!==8;
}

function prescriptionFor(e, allowProgress=true) {
  if (e.type === "timer") return { target:e.baseTarget, status:"base", note:"Durée prévue conservée." };
  const prefs = getPrefs();
  if (!prefs.smartProgression) return { target:e.baseTarget, status:"base", note:"Progression intelligente désactivée." };
  const sessions = exerciseSessions(e.name, 5);
  if (!sessions.length) return { target:e.baseTarget, status:"base", note:"Première référence : reste volontairement sous ton maximum." };

  const last = sessions[0];
  const lastRatio = sessionExerciseRatio(last.entries);
  const lastHard = Number(last.session.rpe || 0) >= 8 || last.session.jointDiscomfort === true;
  const lastTarget = Math.max(e.baseTarget, sessionProgressionTarget(last) || e.baseTarget);
  const recentUsable=sessions.filter(isProgressionSessionUsable);
  const sameTargetSolid = recentUsable.length>=2 && recentUsable.slice(0,2).every(s=>{
    const t=sessionProgressionTarget(s);
    return Math.abs(t-lastTarget)<.01 && sessionExerciseRatio(s.entries)>=.98 && Number(s.session.rpe||0)<=7;
  });

  let target = lastTarget;
  let status = "maintain";
  let note = "Même objectif : consolide la technique.";

  if (lastHard) {
    target = e.type.startsWith("hold") ? Math.max(10, lastTarget - 5) : Math.max(3, lastTarget - 1);
    status = "recover";
    note = last.session.jointDiscomfort ? "Séance précédente avec gêne articulaire : objectif légèrement réduit." : "Séance précédente très difficile : progression gelée pour récupérer.";
  } else if (lastRatio < .80) {
    target = e.type.startsWith("hold") ? Math.max(10, lastTarget - 5) : Math.max(3, lastTarget - 1);
    status = "recover";
    note = "Objectif légèrement réduit pour retrouver des répétitions propres.";
  } else if (allowProgress && sameTargetSolid) {
    if (e.type === "reps_band") {
      target = lastTarget;
      status = "progress";
      note = "Deux séances solides : garde les reps et essaie une assistance légèrement plus faible si la forme reste propre.";
    } else if (e.type.startsWith("hold")) {
      target = lastTarget + 5;
      status = "progress";
      note = `+5 sec : deux séances maîtrisées à ${lastTarget} sec.`;
    } else {
      target = lastTarget + 1;
      status = "progress";
      note = `+1 rep : deux séances maîtrisées à ${lastTarget} reps.`;
    }
  } else if(!allowProgress){
    note="Semaine de consolidation/deload : progression volontairement gelée.";
  }
  return { target, status, note };
}

function mondayDate(date=new Date()){
  const d=new Date(date.getFullYear(),date.getMonth(),date.getDate());
  d.setDate(d.getDate()-((d.getDay()+6)%7)); d.setHours(0,0,0,0); return d;
}
function getCycleState(date=new Date(),cycleId=getActiveTrainingCycleId()){
  const cycle=trainingCycleById(cycleId),plan=progressionPlanForCycle(cycle),st=ensureCycleProgressionState(cycle.id),start=mondayDate(new Date(st.startedAt)),current=mondayDate(st.pausedAt?new Date(st.pausedAt):date);
  let elapsed=Math.floor((current-start)/604800000);if(elapsed<0)elapsed=0;
  const len=Math.max(1,plan.weeks.length),cycleNumber=Number(st.baseBlockNumber||1)+Math.floor(elapsed/len),week=(elapsed%len)+1,w=normalizeProgressionWeek(plan.weeks[week-1],week-1);
  const note=w.tests?'Réduis la charge, récupère puis teste seulement les mouvements pour lesquels tu te sens frais.':w.allowProgress?`Travaille autour de ${w.rir} RIR. La progression automatique reste autorisée si la technique et la récupération sont bonnes.`:`Semaine volontairement allégée : garde environ ${w.rir} RIR et n’ajoute pas de difficulté.`;
  return {start:start.toISOString(),cycleNumber,week,weekCount:len,name:w.name,phaseId:w.phaseId,setFactor:w.volumeFactor,targetFactor:w.targetFactor,cardioFactor:w.cardioFactor,rir:w.rir,allowProgress:w.allowProgress,tests:w.tests,note,planMode:plan.mode,planName:plan.name,goal:plan.goal||'',plan};
}
function resetCycle(){resetProgressionForCycle(getActiveTrainingCycleId());}

function applyExerciseChoice(e){
  const baseName=e.sourceExercise||e.name;
  const chosen=currentExerciseName(baseName);
  if(chosen===e.name)return {...e,sourceExercise:baseName};
  const changed=exerciseFromLibrary(chosen,e);
  return {...changed,sourceExercise:baseName};
}
function scaleSets(sets,factor){
  sets=Math.max(1,Number(sets||1));factor=Number(factor||1);
  if(factor>=1.14)return sets+1;
  if(factor>=1.07&&sets>=4)return sets+1;
  if(factor>=.98)return sets;
  if(factor>=.75)return sets>=3?sets-1:sets;
  return Math.max(1,Math.round(sets*factor));
}
function scaleTarget(target,type,factor){
  if(factor===1)return target;
  if(type.startsWith('hold')) return Math.max(10, Math.round((target*factor)/5)*5);
  if(type.startsWith('reps')) return Math.max(3, Math.round(target*factor));
  return Math.max(60, Math.round(target*factor));
}
function applyCycleToExercise(e,cycle){
  const out={...e,cycleWeek:cycle.week,progressionTarget:e.target};
  if(e.type==='timer'){
    if(/Cardio/i.test(e.name)) out.target=Math.max(300,Math.round(e.target*Number(cycle.cardioFactor||1)));
    return out;
  }
  out.sets=scaleSets(e.sets,cycle.setFactor);
  out.target=scaleTarget(e.target,e.type,cycle.targetFactor);
  return out;
}
function readinessPlan(r){
  if(!r)return {mode:'normal',label:'Normal',setFactor:1,targetFactor:1,note:'Séance normale.'};
  if(r.joints==='pain')return {mode:'recovery',label:'Très légère',setFactor:.6,targetFactor:.82,note:'Articulations gênées : récupération active recommandée. Si la douleur est vive, arrête le mouvement concerné.'};
  if(Number(r.energy)<=2||Number(r.soreness)>=4||r.joints==='sensitive')return {mode:'reduced',label:'Allégée',setFactor:.8,targetFactor:.9,note:'Fatigue/courbatures : environ 20 % de volume en moins aujourd’hui.'};
  return {mode:'normal',label:'Normale',setFactor:1,targetFactor:1,note:'Récupération compatible avec la séance prévue.'};
}
function applyReadinessToExercise(e,readiness){
  const plan=readinessPlan(readiness); if(plan.mode==='normal')return {...e,readinessMode:'normal'};
  if(e.type==='timer'){
    if(/Échauffement|Mobilité|Retour au calme/i.test(e.name))return {...e,readinessMode:plan.mode};
    return {...e,target:Math.max(120,Math.round(e.target*plan.targetFactor)),readinessMode:plan.mode};
  }
  return {...e,sets:scaleSets(e.sets,plan.setFactor),target:scaleTarget(e.target,e.type,plan.targetFactor),readinessMode:plan.mode};
}
function applySessionLength(base, sessionLength="full"){
  const w=clone(base);
  w.sessionLength=sessionLength;
  if(sessionLength!=="short")return w;
  w.duration=w.shortDuration||Math.max(20,Math.round((w.duration||45)*.48));
  w.intensity=(w.intensity||"").replace("modérée","courte") || "Express";
  w.exercises=(w.exercises||[]).filter(e=>e.express).map(e=>{
    const sets=e.shortSets!=null?e.shortSets:e.sets;
    const target=e.shortTarget!=null?e.shortTarget:e.target;
    return {...e,sets,target,baseTarget:target};
  });
  return w;
}
function prepareWorkoutObject(base, readiness=null){
  const w=clone(base),cycle=getCycleState();
  w.cycle=cycle;w.readiness=readiness;
  // Cardio is tracked as a separate activity, not as a mandatory step of strength sessions.
  w.cardioPlan=(w.exercises||[]).filter(e=>e.phase==='cardio');
  w.exercises=(w.exercises||[]).filter(e=>e.phase!=='cardio').map(e=>{
    let chosen=applyExerciseChoice(e),ai=aiWeeklyPrescriptionFor(chosen,cycle.week);
    if(ai){
      chosen={...chosen,sets:ai.sets,target:ai.target,baseTarget:ai.target,type:ai.type||chosen.type,progressionTarget:ai.target,prescriptionStatus:'ai-cycle',prescriptionNote:ai.note||`Prescription spécifique S${cycle.week}${ai.assistance?` · ${ai.assistance}`:''}`,aiAssistance:ai.assistance||''};
      if(chosen.type==='timer'&&/Cardio/i.test(chosen.name))chosen.target=Math.max(300,Math.round(chosen.target*Number(cycle.cardioFactor||1)));
    }else{
      const p=prescriptionFor(chosen,cycle.allowProgress);
      chosen={...chosen,target:p.target,progressionTarget:p.target,prescriptionStatus:p.status,prescriptionNote:p.note};
      chosen=applyCycleToExercise(chosen,cycle);
    }
    chosen=applyReadinessToExercise(chosen,readiness);
    return chosen;
  });
  return w;
}
function preparedWorkout(day, readiness=null, sessionLength="full") {
  const base=applySessionLength(workoutTemplateForDay(day),sessionLength);
  const out=prepareWorkoutObject(base,readiness);out.trainingCycleId=getActiveTrainingCycleId();out.trainingCycleName=getActiveTrainingCycle().name;return out;
}
function customWorkoutById(id){return getCustomWorkouts().find(x=>String(x.id)===String(id))||null;}
function preparedCustomWorkout(id,readiness=null){
  const base=customWorkoutById(id);if(!base)return null;
  return prepareWorkoutObject({...clone(base),sessionLength:"custom",duration:base.duration||estimateWorkoutMinutes(base)},readiness);
}
function estimateWorkoutMinutes(w){
  let sec=0;(w?.exercises||[]).forEach(e=>{if(e.type==='timer')sec+=Number(e.target||0);else if(e.type?.startsWith('hold'))sec+=(Number(e.target||0)+Number(e.rest||0))*Number(e.sets||1);else sec+=(35+Number(e.rest||0))*Number(e.sets||1);});
  return Math.max(10,Math.round(sec/60));
}
function workoutForReadiness(r){return r?.customWorkoutId?preparedCustomWorkout(r.customWorkoutId,null):preparedWorkout(Number(r?.day),null,r?.sessionLength||'full');}

function warmupForWorkout(w){
  const guided=(w?.exercises||[]).find(e=>e.phase==='warmup'&&e.guide?.length);
  if(guided)return guided.guide;
  const name=w?.name||"";
  if(/Push|Handstand/i.test(name))return ["1–2 min poignets","Cercles d’épaules","Scapular push-ups","2 séries faciles du premier push"];
  if(/Pull/i.test(name))return ["Dead hang très léger","Scapular pull-ups","Face pulls bande légère","2 séries assistées faciles"];
  if(/Jambes/i.test(name))return ["Chevilles knee-to-wall","Ouverture de hanches","Squats faciles","Fentes dynamiques"];
  if(/Full Body/i.test(name))return ["Poignets + épaules","Hanches + chevilles","Scapulas","1 série facile de chaque pattern"];
  return ["Mobilité articulaire douce","Montée progressive en température","Première série facile"];
}
function progressionPhaseForWeek(week,cycleId=getActiveTrainingCycleId()){
  const p=progressionPlanForCycle(cycleId),w=normalizeProgressionWeek(p.weeks[Math.max(0,Math.min(p.weeks.length-1,Number(week)-1))],Number(week)-1);
  return {id:w.phaseId,name:w.name,range:`S${week}`,short:`${progressionDifficulty(w)} · ${w.rir} RIR`,volume:`${Math.round(w.volumeFactor*100)} %`,progression:w.allowProgress,week:w};
}
function progressionNextStep(c){
  if(c.week<c.weekCount){const n=normalizeProgressionWeek(c.plan.weeks[c.week],c.week);return `S${c.week+1} · ${n.name} — volume ${Math.round(n.volumeFactor*100)} %, cible ${Math.round(n.targetFactor*100)} %, ${n.rir} RIR.`;}
  return `Bloc ${c.cycleNumber+1} · S1 — le même plan recommence avec tes niveaux et variantes actualisés.`;
}
function progressionWeekSnapshot(){
  const monday=mondayDate(new Date()),days=[];let planned=0,done=0,restPlanned=0,restOk=0,missed=0;
  for(let i=0;i<7;i++){const d=new Date(monday);d.setDate(d.getDate()+i);const st=dailyCycleStatus(d);const hasWorkout=(st.w?.exercises||[]).length>0;if(hasWorkout)planned++;else restPlanned++;if(st.status==='done')done++;if(st.status==='rest-ok')restOk++;if(st.status==='missed')missed++;days.push(st);}
  return {planned,done,restPlanned,restOk,missed,days};
}
function progressionWeekGoal(c){
  const w=normalizeProgressionWeek(c.plan.weeks[c.week-1],c.week-1);
  if(w.tests)return `Semaine de tests : environ ${Math.round(w.volumeFactor*100)} % du volume, ${w.rir} RIR sur le travail courant et tests seulement si tu es frais.`;
  if(!w.allowProgress)return `Semaine de consolidation : environ ${Math.round(w.volumeFactor*100)} % du volume habituel. Pas de progression forcée et environ ${w.rir} reps en réserve.`;
  return `${w.name} : vise environ ${w.rir} reps en réserve. Les exercices peuvent progresser si tes séries précédentes sont maîtrisées ; volume prévu ${Math.round(w.volumeFactor*100)} %.`;
}
function progressionPhases(plan){
  const out=[];(plan.weeks||[]).forEach((raw,i)=>{const w=normalizeProgressionWeek(raw,i),last=out[out.length-1];if(last&&last.id===w.phaseId&&last.name===w.name){last.end=i+1;}else out.push({id:w.phaseId,name:w.name,start:i+1,end:i+1});});return out;
}
function renderCycleMini(){
  const c=getCycleState(),snap=progressionWeekSnapshot(),activeCycle=getActiveTrainingCycle();
  const weeks=Array.from({length:c.weekCount},(_,i)=>normalizeProgressionWeek(c.plan.weeks[i],i));
  const current=weeks[c.week-1]||weeks[0],next=weeks[c.week]||null;
  const progressionLabel=c.allowProgress?'Active':'Gelée',mode=progressionModeLabel(c.plan);
  const weekStatus=i=>i+1<c.week?'done':i+1===c.week?'current':'future';
  return `<section class="card cycle-mini progression-cycle-card progression-cycle-v105">
    <div class="progression-cycle-head-v105"><div class="grow"><div class="kicker">Cycle de progression · ${esc(activeCycle.name)}</div><h2>${esc(c.name)}</h2><p class="progression-cycle-summary">Semaine <strong>${c.week} / ${c.weekCount}</strong> · ${esc(current.name)} · ${Math.round(c.setFactor*100)} % volume · ${c.rir} RIR</p></div><div class="progression-cycle-percent"><strong>${Math.round(((c.week-1)/Math.max(1,c.weekCount))*100)}%</strong><span>du cycle</span></div></div>
    <div class="progression-timeline-v105" aria-label="Progression du cycle">${weeks.map((w,i)=>`<div class="timeline-week ${weekStatus(i)}"><div class="timeline-node"><span>${i+1}</span></div><div class="timeline-copy"><strong>S${i+1}</strong><small>${esc(w.name)}</small><em>${Math.round(w.volumeFactor*100)}% · ${w.rir} RIR</em></div></div>`).join('')}</div>
    <div class="progression-now-v105"><div><span>Cette semaine</span><strong>${progressionWeekGoal(c)}</strong></div><div class="progression-now-stats"><b>${snap.done}/${snap.planned}</b><small>séances</small></div></div>
    <details class="progression-advanced-v105"><summary><span><b>Analyse technique</b><small>Volume, intensité, progression automatique et cardio</small></span><strong>Développer ↓</strong></summary><div class="progression-tech-grid"><div><span>Volume</span><strong>${Math.round(c.setFactor*100)} %</strong><small>nombre de séries vs base</small></div><div><span>Reps / holds</span><strong>${Math.round(c.targetFactor*100)} %</strong><small>cible vs prescription</small></div><div><span>Effort</span><strong>${c.rir} RIR</strong><small>${progressionDifficulty(c.plan.weeks[c.week-1])}</small></div><div><span>Cardio</span><strong>${Math.round(c.cardioFactor*100)} %</strong><small>durée vs cycle</small></div><div><span>Progression auto</span><strong>${progressionLabel}</strong><small>${c.allowProgress?'si maîtrise confirmée':'volontairement'}</small></div><div><span>Mode</span><strong>${esc(mode)}</strong><small>${c.goal?esc(c.goal):'progression structurée'}</small></div></div><div class="progression-next-v105"><span>Prochaine étape</span><strong>${next?`S${c.week+1} · ${esc(next.name)} · ${Math.round(next.volumeFactor*100)} % · ${next.rir} RIR`:progressionNextStep(c)}</strong></div><div class="progression-card-actions"><button class="btn btn-secondary compact edit-cycle-progression" data-cycle-id="${activeCycle.id}">Adapter mon cycle</button><button class="btn btn-outline compact" id="resetCycle">Nouveau bloc</button></div><div class="progression-tech-help"><strong>RIR</strong> = répétitions encore possibles en fin de série. Plus le RIR est bas, plus l'effort est proche de l'échec.</div></details>
  </section>`;
}
function renderSessionModeExercise(e,i){return `<div class="mode-program-row">${exerciseImage(e.name,'mini')}<span class="mode-program-num">${i+1}</span><div><strong>${esc(e.name)}</strong><small>${describe(e)} · ${phaseLabel(e.phase)}</small></div></div>`;}
function renderSessionModePicker(){
  const r=state.sessionModeEditor,day=Number(r.day),full=preparedWorkout(day,null,'full'),short=preparedWorkout(day,null,'short');
  const shortNames=new Set(short.exercises.map(e=>e.name)),removed=full.exercises.filter(e=>!shortNames.has(e.name));
  return `<main class="shell mode-shell"><section class="card mode-card"><button class="back-btn" id="cancelSessionMode">← Retour</button><div class="kicker">${DAY_NAMES[day]} · ${full.name}</div><h1>Combien de temps as-tu ?</h1><p class="muted">Compare le contenu avant de choisir. L'Express conserve l'essentiel, mais réduit certains volumes et retire les accessoires moins prioritaires.</p><div class="session-mode-grid mode-grid-detailed">
    <article class="session-mode-choice mode-choice-panel"><span class="mode-icon">◎</span><strong>Séance complète</strong><b>≈ ${full.duration} min</b><small>${full.exercises.length} étapes · volume complet · cardio ${Math.round(cardioTargetSeconds(full)/60)} min</small><details class="mode-program-details"><summary>Voir le programme <span>⌄</span></summary><div class="mode-program-list">${full.exercises.map(renderSessionModeExercise).join('')}</div></details><button class="btn btn-primary mode-start-btn" data-session-length="full">Commencer la séance complète</button></article>
    <article class="session-mode-choice mode-choice-panel express"><span class="mode-icon">⚡</span><strong>Séance Express</strong><b>≈ ${short.duration} min</b><small>${short.exercises.length} étapes · essentiels seulement · cardio ${Math.round(cardioTargetSeconds(short)/60)} min</small><details class="mode-program-details"><summary>Voir le programme <span>⌄</span></summary><div class="mode-program-list">${short.exercises.map(renderSessionModeExercise).join('')}</div>${removed.length?`<div class="mode-removed"><strong>Allégé par rapport à la complète</strong><span>${removed.map(e=>esc(e.name)).join(' · ')}</span></div>`:''}</details><button class="btn btn-primary mode-start-btn" data-session-length="short">Commencer l'Express</button></article>
  </div><p class="install-note">L’Express est une solution quand tu manques de temps, pas une obligation de compresser toutes les séances de la semaine.</p></section></main>`;
}
function renderReadiness(){
  const r=state.readinessEditor,base=workoutForReadiness(r),plan=readinessPlan(r),c=getCycleState(),label=r.customWorkoutId?'Séance personnelle':DAY_NAMES[Number(r.day)];
  if(!base)return `<main class="shell"><section class="card"><h1>Séance introuvable</h1><button class="btn btn-primary" id="cancelReadiness">Retour</button></section></main>`;
  return `<main class="shell readiness-shell"><section class="card"><button class="back-btn" id="cancelReadiness">← Retour</button><div class="kicker">Avant la séance · ${label}</div><h1>Comment tu récupères ?</h1><p class="muted">Trois réponses suffisent pour adapter le volume du jour. Une douleur vive ou inhabituelle reste un motif pour arrêter le mouvement concerné.</p>
    <div class="readiness-group"><strong>Énergie</strong><span class="muted small">1 = à plat · 5 = très en forme</span><div class="readiness-scale">${[1,2,3,4,5].map(n=>`<button data-energy="${n}" class="${Number(r.energy)===n?'active':''}">${n}</button>`).join('')}</div></div>
    <div class="readiness-group"><strong>Courbatures</strong><span class="muted small">1 = aucune · 5 = très fortes</span><div class="readiness-scale">${[1,2,3,4,5].map(n=>`<button data-soreness="${n}" class="${Number(r.soreness)===n?'active':''}">${n}</button>`).join('')}</div></div>
    <div class="readiness-group"><strong>Articulations / tendons</strong><div class="joint-choice"><button data-joints="ok" class="${r.joints==='ok'?'active':''}">OK</button><button data-joints="sensitive" class="${r.joints==='sensitive'?'active':''}">Sensibles</button><button data-joints="pain" class="${r.joints==='pain'?'active':''}">Gênées</button></div></div>
    <div class="readiness-result mode-${plan.mode}"><div><div class="kicker">Plan du jour</div><strong>${plan.label}</strong></div><p>${plan.note}</p><div class="meta"><span class="pill">Progression S${c.week}</span><span class="pill">${base.name}</span>${r.sessionLength?`<span class="pill">${r.sessionLength==='short'?'Express':'Complète'}</span>`:''}<span class="pill">${Math.round(plan.setFactor*100)} % volume readiness</span></div></div>
    <div class="warmup-box"><strong>Échauffement prévu</strong>${warmupForWorkout(base).map(x=>`<span>• ${x}</span>`).join('')}</div>
    <button class="btn btn-primary" id="confirmReadiness">${plan.mode==='recovery'?'Lancer très léger':'Lancer la séance'}</button></section></main>`;
}
function requestWorkoutStart(day=todayDay()){
  const w=workoutTemplateForDay(Number(day));if(!w?.exercises?.length)return;
  state.sessionModeEditor={day:Number(day)};render();
}
function requestCustomWorkoutStart(id){
  const w=customWorkoutById(id);if(!w)return;
  state.readinessEditor={customWorkoutId:id,energy:3,soreness:2,joints:'ok'};render();
}

function progressionReady(baseName,currentName){
  const item=exerciseInfo(currentName); if(!item?.progression||!item.advanceAt)return null;
  const sessions=exerciseSessions(currentName,4).filter(isProgressionSessionUsable);
  if(sessions.length<2)return null;
  const gate=Number(item.advanceAt);
  const two=sessions.slice(0,2);
  const ready=two.every(s=>sessionProgressionTarget(s)>=gate && sessionExerciseRatio(s.entries)>=.98 && Number(s.session.rpe||0)<=7);
  if(!ready)return null;
  return {baseName,current:item,next:exerciseInfo(item.progression),gate};
}
function progressionRecommendations(){
  const seen=new Set(),out=[];
  Object.values(getActiveTrainingCycle().days||workouts).forEach(w=>(w.exercises||[]).forEach(e=>{
    if(seen.has(e.name))return;seen.add(e.name);
    const current=currentExerciseName(e.name),rec=progressionReady(e.name,current);
    if(rec?.next)out.push(rec);
  }));
  return out;
}
function acceptProgression(baseName,nextName){const m=getExerciseChoices();m[baseName]=nextName;setExerciseChoices(m);render();}
function resetExerciseChoice(baseName){const m=getExerciseChoices();delete m[baseName];setExerciseChoices(m);render();}

function substitutionOptions(e){
  const item=exerciseInfo(e.name); if(!item)return [];
  const names=[item.regression,...item.substitutes,item.progression].filter(Boolean);
  return [...new Set(names)].map(exerciseInfo).filter(Boolean);
}
function renderSubstituteEditor(){
  const a=state.active,idx=state.substituteEditor,e=a.workout.exercises[idx],opts=substitutionOptions(e);
  return `<main class="shell"><section class="card editor-card"><button class="back-btn" id="closeSubstitute">← Retour à la séance</button><div class="kicker">Substitution · aujourd’hui seulement</div><h1>${e.name}</h1><p class="muted">Choisis une variante si le matériel manque, si le mouvement ne convient pas aujourd’hui ou si tu veux une option plus facile. Les séries seront adaptées sans modifier ton programme permanent.</p>${opts.length?`<div class="sub-list">${opts.map(o=>`<div class="sub-card"><div><strong>${o.name}</strong><small>${o.level} · ${o.muscles.join(', ')}</small></div><div class="exercise-tools">${tutorialLink(o.name,true)}<button class="btn btn-secondary compact choose-sub" data-sub="${encodeURIComponent(o.name)}">Choisir</button></div></div>`).join('')}</div>`:'<div class="empty">Aucune substitution structurée pour cet exercice.</div>'}</section></main>`;
}
function chooseSubstitution(name){
  const a=state.active,idx=state.substituteEditor,old=a.workout.exercises[idx],fresh=exerciseFromLibrary(name,old);
  const factor=(a.cycle?.targetFactor||1)*(readinessPlan(a.readiness).targetFactor||1);
  let next={...fresh,sets:old.sets,target:scaleTarget(fresh.target,fresh.type,factor),progressionTarget:fresh.target,sourceExercise:old.sourceExercise||old.name,substitutedFrom:old.name,prescriptionStatus:'maintain',prescriptionNote:`Substitution de ${old.name} pour cette séance.`};
  a.workout.exercises[idx]=next;a.currentValue=next.target;a.timerRemaining=next.type==='timer'||next.type.startsWith('hold')?next.target:null;a.currentBand=next.type==='reps_band'?(lastBandForExercise(next.name)||defaultBandForExercise(next.name)):'Aucune';state.substituteEditor=null;render();
}

function volumeAdd(total,volume,sets){Object.entries(volume||{}).forEach(([g,w])=>total[g]=(total[g]||0)+Number(w)*sets);return total;}
function emptyVolumeBreakdown(){return Object.fromEntries(VOLUME_GROUPS.map(g=>[g,{primary:0,secondary:0,technical:0,total:0}]));}
function volumeBreakdownAdd(out,volume,sets=1,config=getTrainingConfig()){
  Object.entries(volume||{}).forEach(([g,wRaw])=>{
    const w=Number(wRaw||0),n=w*Number(sets||1);if(!out[g])out[g]={primary:0,secondary:0,technical:0,total:0};
    const bucket=w>=config.primaryThreshold?'primary':w>=config.secondaryThreshold?'secondary':'technical';out[g][bucket]+=n;out[g].total+=n;
  });return out;
}
function volumeForWorkout(w){const total={};(w.exercises||[]).forEach(e=>{const info=exerciseInfo(e.name);if(info&&e.type!=='timer')volumeAdd(total,info.volume,e.sets||1);});return total;}
function volumeBreakdownForWorkout(w){const out=emptyVolumeBreakdown(),cfg=getTrainingConfig();(w.exercises||[]).forEach(e=>{const info=exerciseInfo(e.name);if(info&&e.type!=='timer')volumeBreakdownAdd(out,info.volume,e.sets||1,cfg);});return out;}
function weeklyVolume(){
  const start=mondayDate(new Date()).getTime(),actual={},actualBreakdown=emptyVolumeBreakdown(),cfg=getTrainingConfig();
  // Séances guidées, Express et personnelles : chaque entrée enregistrée correspond à une série réellement faite.
  getHistory().filter(s=>new Date(s.date).getTime()>=start).forEach(s=>(s.entries||[]).forEach(entry=>{if(entry.type==='timer')return;const info=exerciseInfo(entry.exercise);if(info){volumeAdd(actual,info.volume,1);volumeBreakdownAdd(actualBreakdown,info.volume,1,cfg);}}));
  // Les micro-séries Quick Log font partie de la charge réelle, même si elles restent hors PR / progression automatique.
  getQuickLogs().filter(x=>new Date(x.date).getTime()>=start).forEach(entry=>{if(entry.type==='timer')return;const info=exerciseInfo(entry.exercise);if(info){volumeAdd(actual,info.volume,1);volumeBreakdownAdd(actualBreakdown,info.volume,1,cfg);}});
  const planned={},plannedBreakdown=emptyVolumeBreakdown();[0,1,2,3,4,5,6].filter(day=>(workoutTemplateForDay(day).exercises||[]).length).forEach(day=>{const w=preparedWorkout(day,null,'full'),v=volumeForWorkout(w),b=volumeBreakdownForWorkout(w);Object.entries(v).forEach(([g,n])=>planned[g]=(planned[g]||0)+n);VOLUME_GROUPS.forEach(g=>{for(const k of ['primary','secondary','technical','total'])plannedBreakdown[g][k]+=b[g]?.[k]||0;});});
  return {actual,planned,actualBreakdown,plannedBreakdown};
}
function volumeStatus(value,target){if(value<target.min)return {label:'Sous cible',cls:'warn'};if(value>target.max)return {label:'Au-dessus',cls:'high'};return {label:'Dans la cible',cls:'good'};}
function renderVolumePanel(){
  const {actual,planned,actualBreakdown,plannedBreakdown}=weeklyVolume(),cfg=getTrainingConfig();
  const groups=VOLUME_GROUPS.filter(g=>(planned[g]||actual[g]||0)>0),quickCount=getQuickLogs().filter(x=>new Date(x.date).getTime()>=mondayDate(new Date()).getTime()).length;
  return `<section class="card param-volume-card"><div class="section-head"><div><div class="kicker">Équilibre hebdomadaire</div><h2>Volume musculaire</h2></div><span class="pill">séries pondérées</span></div>
    <p class="muted small">Charge réelle = séances complètes, Express, séances personnelles et Quick Logs. Le plan officiel reste affiché séparément. Les fourchettes cibles ci-dessous sont modifiables.</p>
    <div class="volume-legend"><span><i class="dot primary"></i>Principal ≥ ${cfg.primaryThreshold.toFixed(2)}</span><span><i class="dot secondary"></i>Secondaire ≥ ${cfg.secondaryThreshold.toFixed(2)}</span><span><i class="dot technical"></i>Technique / support</span></div>
    <div class="volume-list param-volume-list">${groups.map(g=>{const a=actual[g]||0,p=planned[g]||0,t=cfg.volumeTargets[g]||{min:0,max:99},st=volumeStatus(a,t),pct=clamp(a/Math.max(1,t.max),0,1.25)*100,b=actualBreakdown[g]||{primary:0,secondary:0,technical:0},pb=plannedBreakdown[g]||{};return `<div class="param-volume-row"><div class="param-volume-head"><div><strong>${v10110VolumeLabel(g)}</strong><span>${a.toFixed(1)} réel · ${p.toFixed(1)} planifié · cible ${t.min}–${t.max}</span></div><span class="target-state ${st.cls}">${st.label}</span></div><div class="volume-track target-track"><i style="width:${Math.min(100,pct)}%"></i><em style="left:${Math.min(100,t.min/Math.max(1,t.max)*100)}%"></em></div><div class="volume-breakdown"><span>P <b>${b.primary.toFixed(1)}</b></span><span>S <b>${b.secondary.toFixed(1)}</b></span><span>T <b>${b.technical.toFixed(1)}</b></span><small>plan P/S/T ${Number(pb.primary||0).toFixed(1)} / ${Number(pb.secondary||0).toFixed(1)} / ${Number(pb.technical||0).toFixed(1)}</small></div></div>`}).join('')}</div>
    <details class="parameter-details"><summary><div><strong>Comment c'est calculé ?</strong><small>${quickCount} Quick Log${quickCount>1?'s':''} inclus cette semaine</small></div><span>⌄</span></summary><div class="parameter-body"><p>Une série applique les coefficients de l'exercice à tous les muscles concernés. Exemple : une série de pompes peut compter 1,00 pectoraux + 0,60 triceps + 0,35 épaules. Les seuils ci-dessous classent ensuite chaque contribution en travail principal, secondaire ou technique.</p><p>Ce compteur sert au pilotage de la charge. Il ne signifie pas qu'une série technique fatigue autant qu'une série lourde.</p></div></details>
    <details class="parameter-details"><summary><div><strong>Pourquoi ces valeurs ?</strong><small>Base scientifique + choix de coaching</small></div><span>⌄</span></summary><div class="parameter-body"><p>L'ACSM 2026 recommande surtout la régularité, le travail de tous les grands groupes au moins 2 jours/semaine et l'individualisation. Pour l'hypertrophie, ~10 séries hebdomadaires par groupe est un repère général, pas une obligation.</p><p>Les fourchettes de cette app partent de ce socle puis donnent davantage de marge au dos, au core et au grip car ils soutiennent directement les tractions, L-sit, handstand et futurs skills. Bandes et poids du corps sont considérés comme des outils valides de renforcement.</p><div class="source-links"><a href="https://acsm.org/resistance-training-guidelines-update-2026/" target="_blank" rel="noopener">ACSM 2026</a><a href="https://www.who.int/europe/news-room/fact-sheets/item/everyday-actions-for-better-health-who-recommendations" target="_blank" rel="noopener">OMS · activité physique</a></div></div></details>
    <details class="parameter-details"><summary><div><strong>Modifier mes cibles</strong><small>Tout est enregistré localement</small></div><span>⌄</span></summary><div class="parameter-body"><div class="parameter-grid threshold-grid"><label><span>Seuil principal</span><input class="mini-input" id="primaryThreshold" type="number" min="0" max="1" step="0.05" value="${cfg.primaryThreshold}"></label><label><span>Seuil secondaire</span><input class="mini-input" id="secondaryThreshold" type="number" min="0" max="1" step="0.05" value="${cfg.secondaryThreshold}"></label><label><span>Cardio min / semaine</span><input class="mini-input" id="cardioMinTarget" type="number" min="0" step="5" value="${cfg.cardioMin}"></label><label><span>Cardio max / semaine</span><input class="mini-input" id="cardioMaxTarget" type="number" min="0" step="5" value="${cfg.cardioMax}"></label></div><div class="target-editor-list">${groups.map(g=>{const t=cfg.volumeTargets[g];return `<div class="target-editor-row"><strong>${v10110VolumeLabel(g)}</strong><label><span>Min</span><input class="mini-input volume-target-input" data-group="${g}" data-bound="min" type="number" min="0" step="0.5" value="${t.min}"></label><label><span>Max</span><input class="mini-input volume-target-input" data-group="${g}" data-bound="max" type="number" min="0" step="0.5" value="${t.max}"></label></div>`}).join('')}</div><div class="parameter-actions"><button class="btn btn-primary" id="saveTrainingConfig">Enregistrer les cibles</button><button class="btn btn-outline" id="resetTrainingConfig">Valeurs par défaut</button></div></div></details>
  </section>`;
}
function saveTrainingConfigFromDom(){
  const cfg=getTrainingConfig();cfg.primaryThreshold=clamp(Number(document.getElementById('primaryThreshold')?.value||cfg.primaryThreshold),0,1);cfg.secondaryThreshold=clamp(Number(document.getElementById('secondaryThreshold')?.value||cfg.secondaryThreshold),0,cfg.primaryThreshold);cfg.cardioMin=Math.max(0,Number(document.getElementById('cardioMinTarget')?.value||cfg.cardioMin));cfg.cardioMax=Math.max(cfg.cardioMin,Number(document.getElementById('cardioMaxTarget')?.value||cfg.cardioMax));
  document.querySelectorAll('.volume-target-input').forEach(el=>{const g=el.dataset.group,b=el.dataset.bound;if(cfg.volumeTargets[g])cfg.volumeTargets[g][b]=Math.max(0,Number(el.value||0));});VOLUME_GROUPS.forEach(g=>{if(cfg.volumeTargets[g].max<cfg.volumeTargets[g].min)cfg.volumeTargets[g].max=cfg.volumeTargets[g].min;});setTrainingConfig(cfg);state.quickToast='Cibles de volume enregistrées';render();
}

function recordKey(entry){return `${entry.exercise}::${entry.type==='reps_band'?(entry.band||'bande'):''}::${entry.loadKg?'load'+entry.loadKg:''}`;}
function recordValueText(entry){return `${entry.value}${entry.type?.startsWith('hold')?' s':' reps'}${entry.type==='reps_band'&&entry.band?' · '+entry.band:''}${entry.loadKg?' · sac '+entry.loadKg+' kg':''}`;}
function bestBefore(history,key){let best=0;history.forEach(s=>(s.entries||[]).forEach(e=>{if(recordKey(e)===key)best=Math.max(best,Number(e.value||0));}));return best;}
function detectPRs(entries,history){
  const byKey=new Map();entries.filter(e=>e.type!=='timer').forEach(e=>{const k=recordKey(e),cur=byKey.get(k);if(!cur||Number(e.value)>Number(cur.value))byKey.set(k,e);});
  const out=[];for(const [k,e] of byKey){const old=bestBefore(history,k);if(old>0&&Number(e.value)>old)out.push({...e,previous:old});}return out.sort((a,b)=>Number(b.value)-Number(a.value));
}
function currentRecords(){const map=new Map(),add=(e,date,source)=>{if(e.type==='timer')return;const k=recordKey(e),old=map.get(k);if(!old||Number(e.value)>Number(old.value))map.set(k,{...e,date,source});};getHistory().slice().reverse().forEach(s=>(s.entries||[]).forEach(e=>add(e,s.date,'séance')));getQuickLogs().forEach(e=>add(e,e.date,'série libre'));return [...map.values()].sort((a,b)=>new Date(b.date)-new Date(a.date));}
function renderPRNotice(){if(!state.prNotice?.length)return'';return `<section class="card pr-banner"><button class="icon-btn" id="dismissPR">×</button><div class="kicker">Nouveau record</div><h2>🏆 ${state.prNotice[0].exercise} · ${recordValueText(state.prNotice[0])}</h2>${state.prNotice.length>1?`<p class="muted">+ ${state.prNotice.length-1} autre${state.prNotice.length>2?'s':''} record${state.prNotice.length>2?'s':''} sur cette séance.</p>`:''}</section>`;}
function renderRecordsPanel(){const records=currentRecords().slice(0,10);return `<section class="card"><div class="section-head"><div><div class="kicker">Personal records</div><h2>Records actuels</h2></div><span class="pill">${records.length}</span></div>${records.length?`<div class="records-grid">${records.map(r=>`<div class="record-tile"><span>${r.exercise}</span><strong>${recordValueText(r)}</strong><small>${formatShortDate(r.date)}</small></div>`).join('')}</div>`:'<div class="empty">Les premiers résultats servent de référence. Les records apparaîtront ensuite.</div>'}</section>`;}

function renderProgressionRecommendations(){
  const recs=progressionRecommendations(); if(!recs.length)return'';
  return `<section class="card"><div class="section-head"><div><div class="kicker">Niveaux débloqués</div><h2>Progressions disponibles</h2></div><span class="pill badge-success">${recs.length}</span></div>${recs.map(r=>`<div class="progression-card"><div><strong>${r.current.name} → ${r.next.name}</strong><small>Deux séances propres au palier ${r.gate}${r.current.prescription?.type?.startsWith('hold')?' sec':' reps'}.</small></div><button class="btn btn-secondary compact accept-progression" data-base="${encodeURIComponent(r.baseName)}" data-next="${encodeURIComponent(r.next.name)}">Adopter</button></div>`).join('')}</section>`;
}

function renderDailyVolumeCard(){
  const rows=dailyVolumeRows(),quickToday=getQuickLogs().filter(x=>localDateKey(x.date)===localDateKey()),quickReps=quickToday.reduce((n,x)=>n+repsEquivalent(x.type,x.value),0);
  const relevant=rows.filter(r=>r.quick>0||r.guided>0),warning=dailyQuickLoadWarning();
  return `<section class="card daily-volume-card"><div class="section-head"><div><div class="kicker">Volume journalier</div><h2>Aujourd'hui</h2></div></div>
    <div class="daily-volume-hero"><div><strong>${quickReps}</strong><span>reps libres</span></div><div><strong>${quickToday.length}</strong><span>micro-séries</span></div></div>
    ${relevant.length?`<div class="daily-volume-list">${relevant.map(r=>{const unit=quickUnit(r.type),total=r.quick+r.guided;return `<div class="daily-volume-row"><div><strong>${r.family}</strong><small>${r.quick?`libre ${r.quick} ${unit}`:''}${r.quick&&r.guided?' · ':''}${r.guided?`séance ${r.guided} ${unit}`:''}</small></div><b>${total} ${unit}</b></div>`;}).join('')}</div>`:'<p class="muted small">Aucun volume enregistré aujourd’hui. Utilise le bouton + pour noter tes séries faites au fil de la journée.</p>'}
    ${warning?`<div class="volume-warning">⚠ ${warning}</div>`:''}
    <p class="muted small quick-policy">Le volume libre est suivi pour ta charge réelle, mais est suivi séparément et ne déclenche pas automatiquement une progression de niveau.</p>
  </section>`;
}
function recentQuickActions(){
  const out=[],seen=new Set();
  for(const x of getQuickLogs()){
    if(seen.has(x.exercise))continue;
    seen.add(x.exercise);out.push(x);
    if(out.length>=4)break;
  }
  return out;
}
function dailyQuickLoadWarning(){
  const today=getQuickLogs().filter(x=>localDateKey(x.date)===localDateKey());
  const counts={};today.forEach(x=>{const f=quickFamily(x.exercise);counts[f]=(counts[f]||0)+1;});
  const heavy=Object.entries(counts).filter(([,n])=>n>=5).sort((a,b)=>b[1]-a[1]);
  if(heavy.length)return `Volume libre élevé sur ${heavy[0][0].toLowerCase()} (${heavy[0][1]} micro-séries). Garde les prochaines séries faciles si la qualité baisse.`;
  if(today.length>=10)return `${today.length} micro-séries aujourd’hui : surveille surtout la qualité et la récupération.`;
  return '';
}

function renderQuickVolumePanel(){
  const q=quickSummary(7);
  return `<section class="card"><div class="section-head"><div><div class="kicker">Hors séances · 7 jours</div><h2>Volume libre</h2></div><span class="pill">${q.sets} micro-séries</span></div>
    ${q.rows.length?`<div class="quick-week-grid">${q.rows.slice(0,10).map(r=>`<div class="quick-week-row"><span>${r.family}<small>${r.sets} série${r.sets>1?'s':''}</small></span><strong>${r.value} ${r.unit}</strong></div>`).join('')}</div>`:'<div class="empty">Aucune série libre enregistrée sur les 7 derniers jours.</div>'}
    <p class="muted small">Ces micro-séries restent séparées des séries programmées : elles comptent dans ton activité réelle, mais pas dans les PR ou les promotions.</p></section>`;
}
function quickExerciseThumb(name){
  const t=tutorialFor(name);
  if(t.imageUrl)return `<img src="${esc(t.imageUrl)}" alt="" loading="lazy">`;
  return `<span class="quick-exercise-fallback" aria-hidden="true">${esc(String(name||'?').trim().charAt(0).toUpperCase())}</span>`;
}
function quickCategoryOrder(category){
  const order={Push:1,Pull:2,Jambes:3,Core:4,Grip:5,Skill:6,"Mobilité":7};
  return order[category]||99;
}
function renderQuickLogModal(){
  if(!state.quickEditor)return '';
  const quick=getQuickLogs(),recent=recentQuickActions();
  const options=visibleExerciseLibrary()
    .filter(x=>x.prescription&&(x.prescription.type.startsWith('reps')||x.prescription.type.startsWith('hold')))
    .sort((a,b)=>quickCategoryOrder(a.category)-quickCategoryOrder(b.category)||a.name.localeCompare(b.name,'fr'));
  const categories=[...new Set(options.map(x=>x.category))].sort((a,b)=>quickCategoryOrder(a)-quickCategoryOrder(b)||a.localeCompare(b,'fr'));
  const selected=options[0]||null;
  const normalContent=`${renderQuickFavorites()}
    ${recent.length?`<div class="quick-recent"><div class="quick-recent-title">Récents</div><div class="quick-recent-grid">${recent.slice(0,4).map((x,i)=>`<button class="quick-repeat" data-repeat-index="${i}" data-quick-name="${encodeURIComponent(x.exercise)}" data-quick-type="${x.type}" data-quick-value="${x.value}" data-quick-band="${x.band?encodeURIComponent(x.band):''}" data-quick-load="${Number(x.loadKg||0)}"><strong>${quickFamily(x.exercise)}</strong><span>${x.value} ${quickUnit(x.type)}${x.band?' · '+bandByLabel(x.band).short:''}${x.loadKg?' · '+x.loadKg+' kg':''}</span></button>`).join('')}</div></div>`:''}
    <details class="quick-custom"><summary>Autre exercice <span class="quick-custom-hint">Toute la bibliothèque</span></summary>
      <div class="quick-exercise-picker">
        <label class="field-label" for="quickExerciseSearch">Choisir un exercice</label>
        <div class="quick-search-wrap"><span aria-hidden="true">⌕</span><input id="quickExerciseSearch" class="quick-exercise-search" type="search" placeholder="Ex. tractions, jambes, épaules…" autocomplete="off"></div>
        <div class="quick-category-tabs" role="tablist" aria-label="Catégories d'exercices"><button type="button" class="quick-category active" data-quick-category="Tous">Tous</button>${categories.map(c=>`<button type="button" class="quick-category" data-quick-category="${esc(c)}">${esc(c)}</button>`).join('')}</div>
        <input type="hidden" id="quickExercise" value="${selected?esc(selected.name):''}" data-type="${selected?esc(selected.prescription.type):'reps'}">
        <div class="quick-exercise-grid" id="quickExerciseGrid">${options.map((x,i)=>`<button type="button" class="quick-exercise-card ${i===0?'selected':''}" data-quick-exercise-name="${encodeURIComponent(x.name)}" data-quick-exercise-type="${esc(x.prescription.type)}" data-quick-exercise-category="${esc(x.category)}" data-quick-exercise-search="${esc((x.name+' '+x.category+' '+x.level+' '+x.equipment+' '+(x.muscles||[]).join(' ')).toLowerCase())}"><span class="quick-exercise-thumb">${quickExerciseThumb(x.name)}</span><span class="quick-exercise-copy"><strong>${esc(x.name)}</strong><small>${esc(x.category)} · ${esc(x.level)}</small>${renderExerciseAvailabilityBadge(x.name)}</span><span class="quick-selected-check" aria-hidden="true">✓</span></button>`).join('')}</div>
        <div class="quick-exercise-empty" id="quickExerciseEmpty" hidden>Aucun exercice ne correspond à cette recherche.</div>
      </div>
      <div class="quick-selected-exercise" id="quickSelectedExercise">${selected?`${quickExerciseThumb(selected.name)}<div><small>Exercice sélectionné</small><strong>${esc(selected.name)}</strong>${renderExerciseAvailabilityBadge(selected.name)}</div>`:''}</div>
      <label class="field-label">Répétitions ou secondes</label><input class="big-input" id="quickValue" type="number" inputmode="numeric" min="1" step="1" placeholder="ex. 8"><div id="quickBandWrap" hidden><label class="field-label">Bande utilisée</label>${renderBandPicker(defaultBandForExercise(selected?.name||''),selected?.name||'',true)}</div><div id="quickLoadWrap" hidden>${renderBackpackLoadInput(0,'quickLoadKg')}</div><button class="btn btn-primary" id="saveQuickCustom">Ajouter</button></details>
    ${renderQuickLogJournal()}`;
  return `<div class="quick-overlay"><section class="quick-sheet quick-performance-sheet"><div class="quick-sheet-head"><div><div class="kicker">Quick Log</div><h2>Ajouter une micro-série</h2><p class="muted small">Tes exercices favoris restent immédiatement disponibles. Une série se saisit en quelques secondes.</p></div><button class="icon-btn" id="closeQuickLog">×</button></div>
    ${state.quickToast?`<div class="quick-toast">✓ ${esc(state.quickToast)}</div>`:''}
    ${state.quickFavoritesEditor?renderQuickFavoritesManager():normalContent}
  </section></div>`;
}

function addHubActivityTypes(){
  return ['running','walking','cycling','swimming','boxing','rowing','crossfit','hyrox','mobility','sport'];
}
function addHubRecentActivities(days=90){
  const cutoff=Date.now()-Math.max(1,Number(days||90))*86400000;
  return getActivities().filter(x=>new Date(x.date).getTime()>=cutoff);
}
function addHubPreferredActivityIds(limit=5){
  const fallback=['running','walking','cycling','swimming','boxing'];
  const counts=new Map();
  addHubRecentActivities().forEach((x,i)=>{
    if(x.type==='mobility')return;
    const rec=counts.get(x.type)||{count:0,last:0};
    rec.count+=1;rec.last=Math.max(rec.last,new Date(x.date).getTime()||0);counts.set(x.type,rec);
  });
  const ranked=[...counts.entries()].sort((a,b)=>b[1].count-a[1].count||b[1].last-a[1].last).map(x=>x[0]);
  return [...new Set([...ranked,...fallback])].filter(id=>ACTIVITY_TYPES.some(x=>x.id===id)).slice(0,limit);
}
function addHubLastActivity(){return getActivities().find(x=>x.type!=='mobility')||null;}
function addHubPreferredActivityType(){return addHubLastActivity()?.type||addHubPreferredActivityIds(1)[0]||'running';}
function addHubActivitySummary(a){
  if(!a)return '';
  const type=activityType(a.type),parts=[`${Number(a.duration||0)} min`];
  if(Number(a.distance||0)>0)parts.push(`${Number(a.distance)} ${type.metric||'km'}`);
  if(Number(a.rpe||0)>0)parts.push(`RPE ${Number(a.rpe)}`);
  return parts.join(' · ');
}
function renderAddHubModal(){
  if(!state.addHubOpen)return '';
  const favoriteIds=addHubPreferredActivityIds(5),preferred=activityType(addHubPreferredActivityType()),last=addHubLastActivity();
  const otherIds=addHubActivityTypes().filter(id=>!favoriteIds.includes(id));
  return `<div class="quick-overlay add-hub-overlay"><section class="quick-sheet add-hub-sheet" role="dialog" aria-modal="true" aria-label="Ajouter"><div class="quick-sheet-head add-hub-head"><div><div class="kicker">Ajouter</div><h2>Enregistrer quelque chose</h2><p class="muted small">Choisis l’intention. KINETIK garde ensuite uniquement les champs utiles.</p></div><button class="icon-btn" id="closeAddHub" aria-label="Fermer">×</button></div>
  ${last?`<button type="button" class="add-hub-resume" data-add-repeat-activity="${esc(last.id)}"><span class="add-hub-resume-icon">${activityUiIcon(last.type)}</span><div><small>Reprendre la dernière activité</small><strong>${esc(activityType(last.type).label)}</strong><span>${esc(addHubActivitySummary(last))}</span></div><b>Reprendre →</b></button>`:''}
  <div class="add-hub-grid add-hub-grid-primary"><button type="button" class="add-hub-card add-hub-card-primary" data-add-action="activity" data-activity-type="${esc(preferred.id)}"><span>${activityUiIcon(preferred.id)}</span><div><strong>Activité sportive</strong><small>${esc(preferred.label)} par défaut · course, natation, vélo…</small></div><b>Ajouter</b></button><button type="button" class="add-hub-card" data-add-action="quick"><span>${uiIcon('spark','add-hub-svg')}</span><div><strong>Performance rapide</strong><small>Une série libre ou un exercice hors séance</small></div><b>Quick log</b></button><button type="button" class="add-hub-card" data-add-action="core"><span>${uiIcon('clock','add-hub-svg')}</span><div><strong>Gainage</strong><small>Chronomètre, routines et maintien</small></div><b>Chrono</b></button><button type="button" class="add-hub-card" data-add-action="measure"><span>${uiIcon('measurements','add-hub-svg')}</span><div><strong>Mesure</strong><small>Poids, tour de taille et suivi corporel</small></div><b>Saisir</b></button></div>
  <div class="add-hub-section"><div class="add-hub-section-head"><div><strong>Sports rapides</strong><small>Les plus utilisés remontent automatiquement</small></div></div><div class="add-hub-chip-row">${favoriteIds.map(id=>{const x=activityType(id);return `<button type="button" class="add-hub-chip" data-add-activity-type="${x.id}"><span>${activityUiIcon(x.id)}</span>${esc(x.label)}</button>`}).join('')}</div>${otherIds.length?`<details class="add-hub-more"><summary>Plus d’activités <b>⌄</b></summary><div class="add-hub-chip-row">${otherIds.map(id=>{const x=activityType(id);return `<button type="button" class="add-hub-chip secondary" data-add-activity-type="${x.id}"><span>${activityUiIcon(x.id)}</span>${esc(x.label)}</button>`}).join('')}</div></details>`:''}</div>
  <button type="button" class="add-hub-plan" data-add-action="plan"><span>${uiIcon('week','add-hub-svg')}</span><div><strong>Planifier au lieu d’enregistrer</strong><small>Ajouter une activité future au planning</small></div><b>Planning →</b></button>
  </section></div>`;
}

function normalizeQuickSearchText(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
function filterQuickExercisePicker(){
  const input=document.getElementById('quickExerciseSearch'),q=normalizeQuickSearchText(input?.value||'');
  if(q){document.querySelectorAll('.quick-category').forEach(tab=>tab.classList.toggle('active',tab.dataset.quickCategory==='Tous'));}
  const active=q?'Tous':(document.querySelector('.quick-category.active')?.dataset.quickCategory||'Tous');
  let visible=0,firstVisible=null;
  document.querySelectorAll('.quick-exercise-card').forEach(card=>{
    const okCategory=active==='Tous'||card.dataset.quickExerciseCategory===active;
    const hay=normalizeQuickSearchText(card.dataset.quickExerciseSearch||'');
    const okSearch=!q||hay.includes(q);
    const show=okCategory&&okSearch;setQuickSearchVisibility(card,show);if(show){visible++;if(!firstVisible)firstVisible=card;}
  });
  setQuickSearchEmptyState(document.getElementById('quickExerciseEmpty'),visible===0);
  const selectedVisible=document.querySelector('.quick-exercise-card.selected:not(.quick-search-hidden)');
  if(q&&firstVisible&&!selectedVisible)selectQuickExerciseCard(firstVisible);
}
function selectQuickExerciseCard(card){
  const input=document.getElementById('quickExercise');if(!input||!card)return;
  const name=decodeURIComponent(card.dataset.quickExerciseName||''),type=card.dataset.quickExerciseType||exerciseInfo(name)?.prescription?.type||'reps';
  input.value=name;input.dataset.type=type;
  document.querySelectorAll('.quick-exercise-card').forEach(x=>x.classList.toggle('selected',x===card));
  const selected=document.getElementById('quickSelectedExercise');if(selected){const a=exerciseAdaptation(name);selected.innerHTML=`${quickExerciseThumb(name)}<div><small>Exercice sélectionné</small><strong>${esc(name)}</strong>${!a.equipment.available?`<span class="quick-setup-warning">⚠ ${esc(missingEquipmentLabels(a.equipment).join(', '))}${a.suggestion?` · variante : ${esc(a.suggestion)}`:''}</span>`:a.restriction.restricted?`<span class="quick-setup-warning">⚠ Zone à ménager${a.suggestion?` · variante : ${esc(a.suggestion)}`:''}</span>`:'<span class="quick-setup-ok">✓ Compatible avec ton setup</span>'}</div>`;}
  const wrap=document.getElementById('quickBandWrap'),loadWrap=document.getElementById('quickLoadWrap');if(wrap)wrap.hidden=type!=='reps_band';if(loadWrap)loadWrap.hidden=!usesBackpack(name);
  if(type==='reps_band'){const preferred=lastBandForExercise(name)||defaultBandForExercise(name);state.quickBand=preferred;document.querySelectorAll('#quickBandWrap .band-choice').forEach(x=>x.classList.toggle('active',x.dataset.bandLabel===preferred));}
}

function renderExerciseLibrary(){
  const visible=visibleExerciseLibrary();
  const cats=['Tous',...new Set(visible.map(x=>x.category))];
  return `<main class="shell"><section class="card library-head"><button class="back-btn" id="closeExerciseLibrary">← Retour</button><div class="kicker">V10.0 · bibliothèque structurée</div><h1>${visible.length} exercices</h1><p class="muted">Chaque fiche indique le niveau, le matériel, les muscles, la régression, la progression et les substitutions possibles.</p><input class="library-search" id="librarySearch" type="search" placeholder="Rechercher un exercice, muscle, matériel…"><div class="library-filters">${cats.map(c=>`<button class="library-filter ${state.libraryCategory===c?'active':''}" data-library-category="${c}">${c}</button>`).join('')}</div></section><section class="library-list" id="libraryList">${visible.map(item=>`<details class="card library-item" data-lib-category="${item.category}" data-lib-text="${esc((item.name+' '+item.category+' '+item.level+' '+item.equipment+' '+item.muscles.join(' ')).toLowerCase())}"><summary>${exerciseImage(item.name,'mini')}<div class="grow"><strong>${item.name}</strong><span>${item.category} · ${item.level}</span></div><b>⌄</b></summary><div class="library-body"><div class="meta"><span class="pill">${item.equipment}</span>${item.muscles.map(m=>`<span class="pill">${m}</span>`).join('')}</div>${item.prescription?`<div class="library-prescription"><strong>Repère</strong><span>${item.prescription.type.startsWith('hold')?item.prescription.target+' sec':item.prescription.target+' reps'} · repos ${fmtTime(item.prescription.rest||0)}</span></div>`:''}<div class="library-path"><span>↓ Régression <strong>${item.regression||'—'}</strong></span><span>↑ Progression <strong>${item.progression||'—'}</strong></span></div>${item.substitutes.length?`<p class="small muted">Substitutions : ${item.substitutes.join(' · ')}</p>`:''}${equipmentUseNote(item.name)?`<p class="equipment-tip">🧰 ${equipmentUseNote(item.name)}</p>`:''}${tutorialLink(item.name)}</div></details>`).join('')}</section></main>`;
}
function filterLibraryDom(){const q=(document.getElementById('librarySearch')?.value||'').trim().toLowerCase(),cat=state.libraryCategory;document.querySelectorAll('.library-item').forEach(el=>{const okCat=cat==='Tous'||el.dataset.libCategory===cat,okQ=!q||(el.dataset.libText||'').includes(q);el.style.display=okCat&&okQ?'':'none';});}

function exerciseTemplateByName(name){
  for(const w of Object.values(getActiveTrainingCycle().days||{})){const found=(w.exercises||[]).find(e=>e.name===name);if(found)return clone(found);}
  for(const w of Object.values(workouts)){const found=(w.exercises||[]).find(e=>e.name===name);if(found)return clone(found);}
  for(const r of (typeof FLEX_ROUTINES!=='undefined'?FLEX_ROUTINES:[])){const found=(r.exercises||[]).find(e=>e.name===name);if(found)return clone(found);}
  const info=exerciseInfo(name);if(info)return exerciseFromLibrary(name,{sets:3});
  return ex(name,'reps',3,8,75,'Exécution contrôlée et confortable.');
}
function customExerciseNames(){
  const special=['Échauffement général','Échauffement épaules & poignets','Échauffement tirage','Échauffement jambes','Cardio Zone 2','Retour au calme','Mobilité complète','Mobilité jambes','Mobilité épaules / pectoraux / poignets','Mobilité dos / avant-bras / épaules'];
  return [...new Set([...special,...visibleExerciseLibrary().map(x=>x.name)])].sort((a,b)=>a.localeCompare(b,'fr'));
}
function defaultCustomWorkout(){
  return {id:null,name:'Ma séance',subtitle:'Séance personnalisée',intensity:'Intermédiaire',duration:35,exercises:[
    {...exerciseTemplateByName('Échauffement général'),phase:'warmup',target:300,baseTarget:300},
    {...exerciseTemplateByName('Pompes'),phase:'main',sets:3,target:10,baseTarget:10},
    {...exerciseTemplateByName('Row avec bande'),phase:'main',sets:3,target:12,baseTarget:12},
    {...exerciseTemplateByName('Cardio Zone 2'),phase:'cardio',target:600,baseTarget:600},
    {...exerciseTemplateByName('Retour au calme'),phase:'cooldown',target:300,baseTarget:300}
  ]};
}
function openCustomSessionEditor(id=null,cloneDay=null){
  state.cycleDayTarget=null;let draft=null;
  if(id!=null)draft=customWorkoutById(id);
  else if(cloneDay!=null){const w=applySessionLength(workoutTemplateForDay(Number(cloneDay)),'full');draft={...clone(w),id:null,name:`${w.name} · perso`,subtitle:'Copie personnalisable du programme',duration:w.duration};}
  else draft=defaultCustomWorkout();
  state.customSessionDraft=clone(draft);state.customSessionEditor=true;state.view='custom';render();
}
function phaseLabel(phase){return ({warmup:'Échauffement',main:'Renforcement / skill',cardio:'Cardio',cooldown:'Étirements / retour au calme'})[phase]||'Renforcement / skill';}
function customSessionCoverage(w){
  const groups=new Set(),equipment=new Set();
  (w.exercises||[]).forEach(e=>{const info=exerciseInfo(e.name);(info?.muscles||[]).forEach(m=>groups.add(m));equipmentForExercise(e.name).forEach(x=>equipment.add(x));});
  return {groups:[...groups],equipment:[...equipment]};
}
function customSessionQuality(w){
  const phases=new Set((w.exercises||[]).map(e=>e.phase||'main')),cov=customSessionCoverage(w);
  return {warmup:phases.has('warmup'),cardio:phases.has('cardio'),cooldown:phases.has('cooldown'),groups:cov.groups.length,equipment:cov.equipment.length};
}
function cycleStats(c){
  const activeDays=[0,1,2,3,4,5,6].filter(d=>(cycleDayTemplate(c,d).exercises||[]).length),rest=7-activeDays.length,cardio=activeDays.reduce((n,d)=>n+Math.round(cardioTargetSeconds(cycleDayTemplate(c,d))/60),0);
  return {activeDays:activeDays.length,rest,cardio};
}

function openCycleProgressionEditor(id){const c=trainingCycleById(id);state.cycleProgressionEditor=String(c.id);state.cycleProgressionDraft=clone(progressionPlanForCycle(c));state.view='custom';render();}
function progressionDraftApplyMode(mode){
  const d=state.cycleProgressionDraft||defaultProgressionPlan();
  if(mode==='auto')state.cycleProgressionDraft=automaticProgression(d.goal||'Équilibré');
  else if(mode==='template')state.cycleProgressionDraft=templateProgression(d.templateId||'standard');
  else state.cycleProgressionDraft={...clone(d),mode:'custom',name:'Plan personnalisé',description:'Réglages semaine par semaine.',weeks:(d.weeks||defaultProgressionPlan().weeks).map(normalizeProgressionWeek)};
  render();
}
function syncProgressionDraftFromDom(){
  const d=state.cycleProgressionDraft;if(!d)return;
  const goal=document.getElementById('progressionGoal');if(goal&&d.mode==='auto'){const fresh=automaticProgression(goal.value);state.cycleProgressionDraft=fresh;return;}
  const tmpl=document.getElementById('progressionTemplate');if(tmpl&&d.mode==='template'){state.cycleProgressionDraft=templateProgression(tmpl.value);return;}
  document.querySelectorAll('.progression-week-field').forEach(el=>{const i=Number(el.dataset.weekIndex),key=el.dataset.key,w=d.weeks[i];if(!w)return;if(['volumeFactor','targetFactor','cardioFactor'].includes(key))w[key]=Math.max(.4,Math.min(1.5,Number(el.value||100)/100));else if(key==='rir')w[key]=Math.max(0,Math.min(5,Number(el.value||3)));else if(key==='name'){w.name=el.value||`Semaine ${i+1}`;w.phaseId=progressionPhaseId(w.name);}});
  document.querySelectorAll('.progression-week-bool').forEach(el=>{const i=Number(el.dataset.weekIndex),key=el.dataset.key;if(d.weeks[i])d.weeks[i][key]=!!el.checked;});
}
function renderProgressionWeekEditor(w,i){w=normalizeProgressionWeek(w,i);return `<article class="progression-week-editor"><div class="progression-week-editor-head"><span>S${i+1}</span><input class="progression-week-field" data-week-index="${i}" data-key="name" value="${esc(w.name)}"></div><div class="progression-week-editor-grid"><label><span>Volume</span><input class="progression-week-field" data-week-index="${i}" data-key="volumeFactor" type="number" min="40" max="150" step="5" value="${Math.round(w.volumeFactor*100)}"><small>%</small></label><label><span>Reps / holds</span><input class="progression-week-field" data-week-index="${i}" data-key="targetFactor" type="number" min="60" max="140" step="2" value="${Math.round(w.targetFactor*100)}"><small>%</small></label><label><span>Cardio</span><input class="progression-week-field" data-week-index="${i}" data-key="cardioFactor" type="number" min="50" max="150" step="5" value="${Math.round(w.cardioFactor*100)}"><small>%</small></label><label><span>RIR</span><input class="progression-week-field" data-week-index="${i}" data-key="rir" type="number" min="0" max="5" step="1" value="${w.rir}"><small>reps</small></label></div><div class="progression-week-toggles"><label><input class="progression-week-bool" data-week-index="${i}" data-key="allowProgress" type="checkbox" ${w.allowProgress?'checked':''}> Progression auto autorisée</label><label><input class="progression-week-bool" data-week-index="${i}" data-key="tests" type="checkbox" ${w.tests?'checked':''}> Semaine de tests</label></div></article>`;}

function cycleAiMetricCatalog(objective='',target=''){
  const q=`${objective} ${target}`.toLowerCase();
  if(/muscle.?up/.test(q))return [
    {label:'Tractions strictes',kind:'test',id:'pullups',unit:'reps'},
    {label:'Dips stricts',kind:'test',id:'dips',unit:'reps'},
    {label:'Chest-to-bar',kind:'exercise',id:'Chest-to-bar',unit:'reps'},
    {label:'Tractions explosives',kind:'exercise',id:'Tractions explosives',unit:'reps'},
    {label:'Dead hang',kind:'test',id:'dead_hang',unit:'sec'}
  ];
  if(/traction|tirage/.test(q))return [
    {label:'Tractions strictes',kind:'test',id:'pullups',unit:'reps'},
    {label:'Tractions assistées',kind:'exercise',id:'Tractions assistées',unit:'reps'},
    {label:'Dead hang',kind:'test',id:'dead_hang',unit:'sec'}
  ];
  if(/dip|poussée|push/.test(q))return [
    {label:'Dips stricts',kind:'test',id:'dips',unit:'reps'},
    {label:'Pompes',kind:'exercise',id:'Pompes',unit:'reps'},
    {label:'Pike push-ups',kind:'exercise',id:'Pike push-ups',unit:'reps'}
  ];
  if(/handstand|hspu/.test(q))return [
    {label:'Handstand au mur',kind:'test',id:'wall_handstand',unit:'sec'},
    {label:'Handstand libre',kind:'exercise',id:'Handstand libre',unit:'sec'},
    {label:'Pike push-ups',kind:'exercise',id:'Pike push-ups',unit:'reps'}
  ];
  if(/l.?sit|core/.test(q))return [
    {label:'Tuck L-sit',kind:'exercise',id:'Tuck L-sit',unit:'sec'},
    {label:'L-sit',kind:'exercise',id:'L-sit',unit:'sec'},
    {label:'Hanging knee raises',kind:'exercise',id:'Hanging knee raises',unit:'reps'}
  ];
  return [
    {label:'Tractions strictes',kind:'test',id:'pullups',unit:'reps'},
    {label:'Dips stricts',kind:'test',id:'dips',unit:'reps'},
    {label:'Dead hang',kind:'test',id:'dead_hang',unit:'sec'}
  ];
}
const AI_EVAL_KEY='calisthenieCoach.aiEvaluations.v1';
function getAiEvaluations(){try{return JSON.parse(localStorage.getItem(AI_EVAL_KEY)||'{}')||{};}catch(e){return {};}}
function setAiEvaluations(v){localStorage.setItem(AI_EVAL_KEY,JSON.stringify(v||{}));}
function aiEvaluationFor(id){return getAiEvaluations()[id]||null;}
function saveAiEvaluation(id,value,meta={}){const all=getAiEvaluations();all[id]={value:Number(value)||0,date:new Date().toISOString(),source:'évaluation guidée',...meta};setAiEvaluations(all);}
function aiMissingEvaluationTests(objective='',target=''){return cycleAiMetricCatalog(objective,target).filter(m=>{const v=cycleAiMetricValue(m);return !Number(v.value||0)&&v.source!=='évaluation guidée'&&['Chest-to-bar','Tractions explosives'].includes(m.label);});}
function aiEvaluationUi(objective='',target=''){
 const missing=aiMissingEvaluationTests(objective,target);
 if(!missing.length)return '<div class="ai-eval-complete"><strong>Évaluation complète ✓</strong><small>Les prérequis spécifiques utiles sont enregistrés.</small></div>';
 return `<section class="ai-eval-panel"><div class="ai-eval-head"><div><strong>Compléter mon évaluation</strong><small>${missing.length} test${missing.length>1?'s':''} ciblé${missing.length>1?'s':''} avant la programmation</small></div></div>${missing.map(m=>m.label==='Chest-to-bar'?`<div class="ai-eval-test"><div><b>Chest-to-bar</b><p>Après échauffement, teste uniquement des répétitions strictes propres. Arrête avant l'échec.</p></div><label><span>Meilleur résultat</span><select id="aiEvalChest"><option value="">Choisir…</option><option value="0">0 · pas encore</option><option value="1">1 rep</option><option value="2">2 reps</option><option value="3">3+ reps</option></select></label></div>`:`<div class="ai-eval-test"><div><b>Traction explosive</b><p>Sans élan. Indique la hauteur atteinte proprement. Arrête si tu ressens une gêne.</p></div><label><span>Hauteur atteinte</span><select id="aiEvalExplosive"><option value="">Choisir…</option><option value="1">Menton</option><option value="2">Haut de poitrine</option><option value="3">Bas de poitrine</option><option value="4">Barre sous les pectoraux</option></select></label></div>`).join('')}<p class="ai-eval-note">Ces tests servent à calibrer le programme, pas à établir un record maximal.</p><button type="button" class="btn btn-secondary" id="saveAiEvaluation">Enregistrer l’évaluation</button></section>`;
}
function cycleAiMetricValue(m){
  const ev=aiEvaluationFor(m.id);
  if(m.kind==='test'){const base=performanceDetailsForTest(m.id);return ev&&Number(ev.value||0)>=Number(base.value||0)?ev:base;}
  const a=bestMetricDetails(getHistory(),m.id),b=bestQuickMetricDetails(m.id),best=Number(b.value||0)>Number(a.value||0)?b:a;
  return ev&&Number(ev.value||0)>=Number(best.value||0)?ev:best;
}
function cycleAiDataSnapshot(objective='',target=''){
  const metrics=cycleAiMetricCatalog(objective,target).map(m=>({...m,...cycleAiMetricValue(m)}));
  const found=metrics.filter(m=>Number(m.value||0)>0||m.source==='évaluation guidée').length;
  const sessions=getHistory().length,quick=getQuickLogs().length;
  return {metrics,found,total:metrics.length,sessions,quick,status:found===metrics.length?'complete':found?'partial':'empty'};
}
function cycleAiDataText(objective='',target=''){
  const s=cycleAiDataSnapshot(objective,target);
  return s.metrics.map(m=>`- ${m.label}: ${Number(m.value||0)>0?`${m.detail?m.detail:`${m.value} ${m.unit}`}${m.source?` · ${m.source}`:''}`:m.source==='évaluation guidée'?`0 ${m.unit} · évaluation guidée`:'aucune donnée'}`).join('\n');
}

function cycleTrainingDays(c){
  return Array.from({length:7},(_,day)=>day).filter(day=>(cycleDayTemplate(c,day).exercises||[]).length);
}
function cycleRestDayNames(c){return Array.from({length:7},(_,day)=>day).filter(day=>!(cycleDayTemplate(c,day).exercises||[]).length).map(day=>DAY_NAMES[day]);}
function aiDesiredRestDays(){
  return [...document.querySelectorAll('input[name=cycleAiRestDay]:checked')].map(x=>x.value);
}
function aiSyncTrainingSchedule(){
  const count=Math.max(1,Math.min(6,Number(document.getElementById('cycleAiTrainingDays')?.value||6)));
  const need=7-count,boxes=[...document.querySelectorAll('input[name=cycleAiRestDay]')],selected=boxes.filter(x=>x.checked);
  if(selected.length>need){selected.slice(need).forEach(x=>x.checked=false);}
  boxes.forEach(x=>x.disabled=!x.checked&&boxes.filter(y=>y.checked).length>=need);
  const msg=document.getElementById('cycleAiRestHint'),now=boxes.filter(x=>x.checked).length;
  if(msg)msg.textContent=need===0?'Aucun jour de repos':now===need?`${need} jour${need>1?'s':''} de repos sélectionné${need>1?'s':''}`:`Choisis encore ${need-now} jour${need-now>1?'s':''} de repos`;
  return now===need;
}
function applyAiScheduleToCycle(cycle,schedule){
  const plan=Array.isArray(schedule?.dayPlan)?schedule.dayPlan:null;
  if(plan&&plan.length===7){
    const original={};for(let d=0;d<7;d++)original[d+1]=cycleDayTemplate(cycle,d);
    const nameToDay=Object.fromEntries(DAY_NAMES.map((n,i)=>[n,i])),next={};
    for(const row of plan){
      const day=nameToDay[row.day];if(day==null)continue;
      if(row.status==='rest'){next[day]={name:"Repos",subtitle:"Récupération complète",duration:0,shortDuration:0,intensity:"Repos",exercises:[]};continue;}
      const sources=(row.sourceDays||[]).map(n=>original[Number(n)]).filter(Boolean);
      if(!sources.length){next[day]={name:"Séance",subtitle:"Séance adaptée par ChatGPT",duration:45,shortDuration:25,intensity:"Modérée",exercises:[]};continue;}
      const first=clone(sources[0]),extra=sources.slice(1);
      first.exercises=[...(first.exercises||[]),...extra.flatMap(w=>(clone(w.exercises)||[]))];
      first.name=extra.length?`${first.name} · combinée`:first.name;
      first.subtitle=extra.length?'Séance combinée selon le nouveau rythme hebdomadaire':first.subtitle;
      first.duration=Math.max(10,Math.round(sources.reduce((s,w)=>s+Number(w.duration||45),0)*(extra.length?.68:1)));
      next[day]=first;
    }
    for(let d=0;d<7;d++)if(!next[d])next[d]={name:"Repos",subtitle:"Récupération complète",duration:0,shortDuration:0,intensity:"Repos",exercises:[]};
    cycle.days=next;return cycle;
  }
  const restSet=new Set(schedule?.restDays||[]),sourceSessions=Array.from({length:7},(_,d)=>cycleDayTemplate(cycle,d)).filter(w=>(w.exercises||[]).length).map(clone);
  const next={};let i=0;for(let d=0;d<7;d++){if(restSet.has(DAY_NAMES[d]))next[d]={name:"Repos",subtitle:"Récupération complète",duration:0,shortDuration:0,intensity:"Repos",exercises:[]};else next[d]=clone(sourceSessions[i++]||{name:"Séance",subtitle:"Séance personnalisée",duration:45,shortDuration:25,intensity:"Modérée",exercises:[]});}
  cycle.days=next;return cycle;
}

function aiExerciseLastPerformance(name){
  const sessions=getHistory().slice().reverse();
  for(const s of sessions){
    const entries=(s.entries||[]).filter(x=>x.exercise===name);
    if(!entries.length)continue;
    const vals=entries.map(x=>Number(x.value||x.reps||x.seconds||0)).filter(Number.isFinite);
    const rirs=entries.map(x=>Number(x.rir)).filter(Number.isFinite);
    return {date:s.date,best:vals.length?Math.max(...vals):0,rir:rirs.length?Math.min(...rirs):null,completed:true};
  }
  return null;
}
function aiProgressionGate(e,week,row){
  if(Number(week)<=1)return {allowed:true,reason:''};
  const prev=(e?.aiProgression||[]).find(r=>Number(r.week)===Number(week)-1);
  if(!prev)return {allowed:true,reason:''};
  const perf=aiExerciseLastPerformance(e.name),minRir=Number(row?.minRir??(AI_ADVANCED_SKILL_RX.test(e.name)?3:2));
  if(!perf)return {allowed:false,row:prev,reason:`S${week}: progression en attente · valide d'abord S${week-1}`};
  if(perf.rir!=null&&perf.rir<minRir)return {allowed:false,row:prev,reason:`S${week}: maintien · RIR précédent ${perf.rir} < ${minRir}`};
  return {allowed:true,reason:''};
}
function aiWeeklyPrescriptionFor(e,week){
  const rows=Array.isArray(e?.aiProgression)?e.aiProgression:[];
  let row=rows.find(r=>Number(r.week)===Number(week));
  if(!row)return null;
  const gate=aiProgressionGate(e,week,row);
  if(!gate.allowed&&gate.row)row=gate.row;
  return {
    sets:Number(row.sets||e.sets||1),
    target:Number(row.target||e.target||1),
    type:row.type||e.type,
    assistance:row.assistance||'',
    note:gate.reason||row.note||'',
    gated:!gate.allowed
  };
}
function cycleAiWeeklySummary(c){
  let strictPull=0,assistedPull=0,dips=0,cardioMin=0,trainingDays=0;
  for(let i=0;i<7;i++){
    const d=cycleDayTemplate(c,i),ex=d?.exercises||[];
    if(ex.length)trainingDays++;
    ex.forEach(x=>{
      const sets=Number(x.sets||1),target=Number(x.target||0);
      if(x.name==='Tractions strictes')strictPull+=sets*target;
      if(x.name==='Tractions assistées')assistedPull+=sets*target;
      if(x.name==='Dips')dips+=sets*target;
      if(/Cardio Zone 2/i.test(x.name)&&x.type==='timer')cardioMin+=target/60;
    });
  }
  return `Jours d'entraînement: ${trainingDays}/7\nTractions strictes programmées: ${Math.round(strictPull)} reps/semaine\nTractions assistées programmées: ${Math.round(assistedPull)} reps/semaine\nDips programmés: ${Math.round(dips)} reps/semaine\nCardio Zone 2 programmé: ${Math.round(cardioMin)} min/semaine`;
}

const AI_ADVANCED_SKILL_RX=/(muscle.?up|front lever|back lever|human flag|planche|handstand push|hspu)/i;
function cycleAiSafetyAssessment(objective='',target='',opts={}){
  const q=`${objective} ${target}`,snap=cycleAiDataSnapshot(objective,target),advanced=AI_ADVANCED_SKILL_RX.test(q);
  const missing=snap.metrics.filter(m=>!Number(m.value||0)&&m.source!=='évaluation guidée').map(m=>m.label);
  const pain=opts.context==='Gêne / douleur à prendre en compte';
  const restart=opts.context==='Reprise après un arrêt';
  const blockers=[];
  if(pain&&opts.painImpact==='Important')blockers.push('gêne/douleur déclarée importante');
  if(advanced&&snap.status!=='complete')blockers.push(`prérequis spécifiques incomplets: ${missing.join(', ')||'tests manquants'}`);
  const needsAssessment=advanced&&snap.status!=='complete';
  return {advanced,missing,pain,restart,needsAssessment,blockers,status:blockers.length?'assessment':pain||restart||snap.status!=='complete'?'caution':'ready'};
}
function cycleAiSafetyText(objective='',target='',opts={}){
  const a=cycleAiSafetyAssessment(objective,target,opts);
  return [
    `Niveau de prudence: ${a.status==='ready'?'standard':a.status==='caution'?'renforcé':'évaluation préalable requise'}`,
    a.advanced?'Objectif classé: skill avancé / technique':'Objectif classé: base ou skill standard',
    a.missing.length?`Données/prérequis manquants: ${a.missing.join(', ')}`:'Prérequis mesurés: suffisants pour proposer une progression',
    a.restart?'Reprise après arrêt: démarrage conservateur, pas de test maximal immédiat, volume initial réduit.':null,
    a.pain?'Gêne/douleur déclarée: ne pas programmer de progression agressive sur la zone concernée; demander un avis professionnel si douleur importante, persistante ou aggravée.':null
  ].filter(Boolean).map(x=>`- ${x}`).join('\n');
}
function cycleAiPreflightLabel(objective='',target='',opts={}){
  const a=cycleAiSafetyAssessment(objective,target,opts);
  if(a.status==='ready')return {tone:'ok',title:'Prêt pour la programmation',text:'Les données disponibles permettent une proposition prudente.'};
  if(a.needsAssessment)return {tone:'warn',title:'Évaluation préalable recommandée',text:`Il manque ${a.missing.join(', ')}. ChatGPT doit privilégier une phase/test d’évaluation avant une progression agressive.`};
  return {tone:'warn',title:'Progression conservatrice',text:'Le contexte impose davantage de marge et une progression conditionnelle.'};
}
function cycleAiPromptText(c,goal,opts={}){
  const cs=getCycleState(),setup=getEquipmentSetup(),history=getHistory(),records=currentRecords();
  const aiEquipmentNames={powerTower:'Power tower (barre de traction + dips)',parallelBars:'Barres parallèles',pushupHandles:'Poignées de pompes',bands:'Bandes élastiques',anchor:"Point d’ancrage pour bandes",mat:'Tapis',support:'Support / point fixe'};const equipment=Object.entries(setup).filter(([k,v])=>v===true).map(([k])=>EQUIPMENT_BY_ID[k]?.name||aiEquipmentNames[k]||k).join(', ')||'non renseigné';
  const weeks=(cs.plan.weeks||[]).map((w,i)=>{const n=normalizeProgressionWeek(w,i);return `S${i+1}: ${n.name} | volume ${Math.round(n.volumeFactor*100)}% | cible ${Math.round(n.targetFactor*100)}% | RIR ${n.rir} | cardio ${Math.round(n.cardioFactor*100)}% | progression ${n.allowProgress?'oui':'non'}`}).join('\n');
  const autoLevel=cycleAiDataText(opts.objective,opts.target);
  const recText=opts.source==='manual'?`- Niveau déclaré par l’utilisateur: ${opts.manualLevel||'non renseigné'}`:autoLevel;
  const recent=opts.source==='manual'?'- Historique non utilisé pour estimer le niveau actuel':(history.slice(-6).reverse().map(s=>{const entries=(s.entries||[]).filter(x=>x.type!=='timer').slice(0,8).map(x=>`${x.exercise}: ${recordValueText(x)}`).join('; ');return `- ${formatShortDate(s.date)}: ${entries||'séance enregistrée'}`}).join('\n')||'- Pas encore de séances exploitables');
  const program=Array.from({length:7},(_,i)=>{const d=cycleDayTemplate(c,i);const ex=(d?.exercises||[]).map(x=>`${x.name} (${describe(x)})`).join('; ');return ex?`J${i+1} (${DAY_NAMES[i]}): ${ex}`:`J${i+1} (${DAY_NAMES[i]}): repos`;}).join('\n');
  const contextParts=[
    opts.context&&opts.context!=='Aucun point particulier'?opts.context:null,
    opts.breakDuration?`Durée de l'arrêt: ${opts.breakDuration}`:null,
    opts.painZone?`Zone de gêne/douleur: ${opts.painZone}`:null,
    opts.painImpact?`Impact: ${opts.painImpact}`:null,
    opts.secondary?`Objectif secondaire: ${opts.secondary}`:null,
    goal?`Précision libre: ${goal}`:null
  ].filter(Boolean);
  return `Tu es un coach spécialisé en calisthénie et en programmation de l’entraînement. Aide-moi à adapter mon cycle de façon réaliste, mesurable et prudente.

RÈGLE IMPORTANTE
Conserve autant que possible le programme actuel, mais autorise l'ajout, le remplacement ou le retrait d'exercices lorsqu'ils sont réellement nécessaires à l'objectif. Justifie chaque modification importante.

OBJECTIF
Objectif principal: ${opts.objective||'non précisé'}
Résultat visé: ${opts.target||'non précisé'}
Échéance: ${opts.horizon||'progression durable'}
${contextParts.length?contextParts.join('\n'):'Contexte particulier: aucun'}

NIVEAU ACTUEL
Source: ${opts.source==='manual'?'saisie manuelle':'données KINETIK'}
${recText}

PROFIL SPORTIF KINETIK
${athleteProfileSummaryForAi()}

VALIDATION SÉCURITÉ / PRÉREQUIS
${cycleAiSafetyText(opts.objective,opts.target,opts)}
Pour un skill avancé, si les prérequis spécifiques sont incomplets, utilise les premières prescriptions comme évaluation/phase d'apprentissage prudente. Ne suppose jamais qu'un mouvement explosif ou avancé est maîtrisé uniquement à partir d'un nombre de répétitions sur un mouvement de base.

RYTHME HEBDOMADAIRE SOUHAITÉ
Séances par semaine: ${opts.trainingDays||cycleTrainingDays(c).length}
Jours de repos souhaités: ${(opts.restDays&&opts.restDays.length)?opts.restDays.join(', '):cycleRestDayNames(c).join(', ')}
Respecte ces jours de repos dans le nouveau cycle. Si le nombre de séances change, redistribue intelligemment le contenu et les priorités sans simplement supprimer au hasard des séances.

CYCLE ACTUEL
Cycle: ${c.name}
Phase: ${cs.name}
Semaine: ${cs.week}/${cs.weekCount}
Mode: ${progressionModeLabel(cs.plan)}
Volume: ${Math.round(cs.setFactor*100)}% | cible reps/holds: ${Math.round(cs.targetFactor*100)}% | RIR: ${cs.rir} | cardio: ${Math.round(cs.cardioFactor*100)}%
Matériel: ${equipment}

RÉSUMÉ HEBDOMADAIRE
${cycleAiWeeklySummary(c)}

6 DERNIÈRES SÉANCES ENREGISTRÉES
${recent}

PROGRAMME RÉEL DU CYCLE
${program}

PARAMÈTRES DES ${cs.weekCount} SEMAINES
${weeks}

TA MISSION
1. Vérifie la cohérence entre l'objectif, le niveau actuel, l'échéance et le programme.
2. Si une information réellement indispensable manque encore, pose au maximum 3 questions très ciblées avant de finaliser. Ne redemande jamais une information déjà présente ci-dessus.
3. Analyse les points forts et les limites du cycle actuel pour cet objectif.
4. Construis d'abord la RÉPARTITION HEBDOMADAIRE correspondant exactement au nombre de séances et aux jours de repos demandés. Conserve l'ordre logique push/pull/jambes/skill et évite deux grosses sollicitations identiques consécutives.
5. Réponds ensuite avec DEUX BLOCS DE CONFIGURATION clairement séparés:

BLOC A — COURBE DU CYCLE
Propose les ${cs.weekCount} semaines avec: phase, volume relatif %, cible reps/holds %, RIR, cardio %, progression automatique oui/non. Termine ce bloc par un tableau compact S1 à S${cs.weekCount}.

BLOC B — ADAPTATIONS DU PROGRAMME
Propose uniquement les modifications réellement utiles au programme actuel. Pour chaque modification indique:
- jour concerné;
- action: conserver / modifier / remplacer / ajouter / retirer;
- exercice actuel si applicable;
- nouvel exercice si applicable;
- prescription de départ (séries × reps/secondes, assistance si nécessaire);
- raison courte;
- semaines concernées ou règle de progression.

6. Ajoute ensuite PROGRESSION DES EXERCICES PRIORITAIRES: décris la progression concrète semaine par semaine des mouvements directement liés à l'objectif. La semaine suivante est une CIBLE CONDITIONNELLE, pas une progression automatique: n'augmente que si la prescription précédente a été validée avec technique propre, RIR suffisant et sans gêne. Sinon maintiens ou réduis. Pour chaque exercice prioritaire modifié/ajouté, fournis une prescription explicite pour chaque semaine concernée.
7. Identifie les exercices spécifiques à l'objectif absents du programme. N'en ajoute que si cela apporte un bénéfice clair.
8. Prévois consolidation/deload et gestion de fatigue si pertinent.
9. Si l'objectif ou l'échéance paraît irréaliste, explique-le et propose une cible intermédiaire mesurable.
10. Ne modifie pas un exercice sans raison liée à l'objectif, à la récupération ou à la sécurité.

FORMAT FINAL OBLIGATOIRE
Termine par un bloc intitulé CONFIGURATION À REPORTER DANS CALISTHENIE COACH contenant:
A. le tableau S1 à S${cs.weekCount};
B. une liste compacte des adaptations sous la forme:
J4 | REMPLACER | Curl biceps avec bande | Tractions explosives | 3×2 | S1-S3
J6 | AJOUTER | — | Muscle-up assisté | 3×2 | S1-S3
Utilise exactement les noms d'exercices du programme quand ils existent.

IMPORT AUTOMATIQUE — OBLIGATOIRE UNE FOIS L'ANALYSE FINALISÉE
Après CONFIGURATION À REPORTER DANS CALISTHENIE COACH, ajoute un unique bloc de code JSON valide, sans commentaire dans le JSON, respectant EXACTEMENT cette structure:
{
  "schemaVersion": 1,
  "cycle": {
    "name": "Nom court du nouveau cycle",
    "goal": "Objectif",
    "schedule": {"trainingDays":5,"restDays":["Lundi","Vendredi"],"dayPlan":[{"day":"Lundi","status":"rest","sourceDays":[]},{"day":"Mardi","status":"training","sourceDays":[1]},{"day":"Mercredi","status":"training","sourceDays":[3]}]},
    "weeks": [
      {"week":1,"phase":"Nom","volume":0.85,"target":0.95,"rir":4,"cardio":0.90,"autoProgress":false}
    ]
  },
  "programChanges": [
    {"day":4,"action":"replace","exercise":"Nom exact actuel","newExercise":"Nom exact bibliothèque","sets":3,"target":2,"type":"reps","weeks":[1,2,3],"reason":"Raison courte","progression":[{"week":1,"sets":3,"target":2,"type":"reps","assistance":"bande moyenne","minRir":3},{"week":2,"sets":3,"target":3,"type":"reps","assistance":"bande moyenne","minRir":2}]}
  ]
}
Règles JSON:
- cycle.weeks doit contenir exactement ${cs.weekCount} semaines;
- cycle.schedule.trainingDays doit correspondre au nombre de séances souhaité et restDays doit contenir exactement les jours de repos demandés;
- cycle.schedule.dayPlan doit contenir les 7 jours français exactement une fois. Pour chaque jour: status vaut "training" ou "rest"; sourceDays indique quels J1-J7 du programme actuel servent de base à cette journée;
- un jour de repos a sourceDays: [];
- si le nombre de séances diminue, tu peux fusionner des contenus avec plusieurs sourceDays (ex. [3,6]) ou omettre une séance secondaire, mais fais-le volontairement selon l'objectif et la récupération;
- si plusieurs sourceDays sont fusionnés, réduis ensuite les accessoires inutiles via programChanges afin d'éviter une séance démesurée;
- restDays utilise uniquement les noms français: Dimanche, Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi;
- volume, target et cardio sont des facteurs décimaux: 0.85 = 85%;
- rir doit être compris entre 0 et 5;
- day doit être compris entre 1 et 7;
- action doit être exactement "keep", "modify", "replace", "add" ou "remove";
- type doit être "reps", "reps_band", "hold" ou "timer";
- pour modify/remove/replace, exercise doit reprendre exactement le nom existant;
- pour add/replace, newExercise doit reprendre si possible un nom de la bibliothèque/programme;
- weeks est un tableau de numéros de semaines;
- progression est obligatoire pour chaque action modify/replace/add portant sur un exercice prioritaire et contient une ligne par semaine réellement prescrite;
- progression.week doit être entre 1 et ${cs.weekCount}; sets et target doivent être positifs; assistance est une courte description libre et peut être vide;
- minRir est facultatif (0 à 5) et indique le RIR minimal à obtenir sur la prescription précédente pour autoriser l'augmentation; par défaut utilise 2 pour les mouvements de base et 3 pour les skills avancés;
- une progression hebdomadaire est conditionnelle: si la semaine précédente n'est pas validée proprement, l'application doit pouvoir maintenir la prescription précédente au lieu d'augmenter;
- les prescriptions de progression sont des cibles finales: l'application les appliquera telles quelles pour l'exercice prioritaire, sans leur appliquer une seconde fois le facteur global de reps/volume;
- n'ajoute aucune clé non prévue sauf si elle est indispensable.
Si tu dois d'abord poser des questions parce qu'une donnée indispensable manque, NE FOURNIS PAS ce JSON avant d'avoir reçu les réponses.`;
}


function extractCycleAiJson(text){
  let raw=String(text||'').trim();
  if(!raw)return null;
  // Remove common rich-copy wrappers / smart formatting without changing JSON content.
  raw=raw.replace(/^\uFEFF/,'').replace(/\u00A0/g,' ');
  const tryJson=s=>{
    try{
      const o=JSON.parse(String(s).trim());
      return o&&Number(o.schemaVersion)===1&&o.cycle?o:null;
    }catch(e){return null;}
  };
  // Whole paste first.
  let found=tryJson(raw);if(found)return found;
  // Markdown fences: language label is optional.
  for(const m of raw.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)){
    found=tryJson(m[1]);if(found)return found;
  }
  // Robust fallback: scan every opening brace and extract balanced objects.
  // This survives prose before/after the JSON and ChatGPT copy formatting.
  for(let start=0;start<raw.length;start++){
    if(raw[start]!=='{')continue;
    let depth=0,inString=false,escaped=false;
    for(let i=start;i<raw.length;i++){
      const ch=raw[i];
      if(inString){
        if(escaped)escaped=false;
        else if(ch==='\\')escaped=true;
        else if(ch==='"')inString=false;
        continue;
      }
      if(ch==='"'){inString=true;continue;}
      if(ch==='{')depth++;
      else if(ch==='}'){
        depth--;
        if(depth===0){
          found=tryJson(raw.slice(start,i+1));
          if(found)return found;
          break;
        }
      }
    }
  }
  return null;
}
function validateCycleAiImport(data,sourceCycle){
  const errors=[],warnings=[];if(!data||data.schemaVersion!==1)errors.push('Version de format non reconnue.');
  const weeks=data?.cycle?.weeks;if(!Array.isArray(weeks)||weeks.length!==8)errors.push('Le cycle doit contenir exactement 8 semaines.');
  const schedule=data?.cycle?.schedule,validDayNames=new Set(DAY_NAMES);if(!schedule||!Number.isInteger(Number(schedule.trainingDays))||Number(schedule.trainingDays)<1||Number(schedule.trainingDays)>6)errors.push('Rythme hebdomadaire invalide.');const restDays=schedule?.restDays;if(!Array.isArray(restDays)||restDays.some(x=>!validDayNames.has(x))||restDays.length!==7-Number(schedule?.trainingDays||0))errors.push('Jours de repos incohérents avec le nombre de séances.');
  const dayPlan=schedule?.dayPlan;if(!Array.isArray(dayPlan)||dayPlan.length!==7)errors.push('Planification des 7 jours manquante.');else{const names=dayPlan.map(x=>x.day);if(new Set(names).size!==7||names.some(x=>!validDayNames.has(x)))errors.push('Les 7 jours de la semaine doivent apparaître exactement une fois.');dayPlan.forEach(x=>{if(!['training','rest'].includes(x.status))errors.push(`Planning ${x.day}: statut invalide.`);if(!Array.isArray(x.sourceDays)||x.sourceDays.some(n=>Number(n)<1||Number(n)>7))errors.push(`Planning ${x.day}: sourceDays invalide.`);if(x.status==='rest'&&x.sourceDays.length)errors.push(`Planning ${x.day}: un repos ne doit pas contenir de séance source.`);});const plannedRest=dayPlan.filter(x=>x.status==='rest').map(x=>x.day);if(plannedRest.length!==restDays?.length||plannedRest.some(x=>!restDays.includes(x)))errors.push('dayPlan ne correspond pas aux jours de repos.');}
  (weeks||[]).forEach((w,i)=>{if(Number(w.week)!==i+1)errors.push(`S${i+1}: numéro de semaine invalide.`);for(const k of ['volume','target','cardio']){const v=Number(w[k]);if(!Number.isFinite(v)||v<.4||v>1.5)errors.push(`S${i+1}: ${k} hors limites.`);}const rir=Number(w.rir);if(!Number.isFinite(rir)||rir<0||rir>5)errors.push(`S${i+1}: RIR invalide.`);});
  const allowed=new Set(['keep','modify','replace','add','remove']),types=new Set(['reps','reps_band','hold','timer']);
  (data?.programChanges||[]).forEach((ch,i)=>{const n=i+1,day=Number(ch.day);if(day<1||day>7)errors.push(`Adaptation ${n}: jour invalide.`);if(!allowed.has(ch.action))errors.push(`Adaptation ${n}: action inconnue.`);if(ch.type&&!types.has(ch.type))errors.push(`Adaptation ${n}: type inconnu.`);const dayEx=(cycleDayTemplate(sourceCycle,day-1).exercises||[]).map(x=>x.name);if(['modify','replace','remove'].includes(ch.action)&&!dayEx.includes(ch.exercise))errors.push(`J${day}: exercice actuel introuvable « ${ch.exercise||''} ».`);if(['add','replace'].includes(ch.action)&&ch.newExercise&&!exerciseInfo(ch.newExercise))warnings.push(`J${day}: « ${ch.newExercise} » n'est pas reconnu dans la bibliothèque; vérification nécessaire.`);if(ch.weeks&&!ch.weeks.every(w=>Number(w)>=1&&Number(w)<=8))errors.push(`Adaptation ${n}: semaines invalides.`);
    if(Array.isArray(ch.progression)){const seen=new Set();ch.progression.forEach(p=>{const wk=Number(p.week);if(wk<1||wk>8||seen.has(wk))errors.push(`Adaptation ${n}: progression hebdomadaire invalide.`);seen.add(wk);if(Number(p.sets)<=0||Number(p.target)<=0)errors.push(`Adaptation ${n}: séries/cible invalides en S${wk}.`);if(p.minRir!=null&&(Number(p.minRir)<0||Number(p.minRir)>5))errors.push(`Adaptation ${n}: minRir invalide en S${wk}.`);});}
    if(['modify','replace','add'].includes(ch.action)&&(!Array.isArray(ch.progression)||!ch.progression.length))warnings.push(`J${day}: aucune progression hebdomadaire détaillée pour « ${ch.newExercise||ch.exercise} »; la prescription restera statique.`);
  });
  return {ok:!errors.length,errors,warnings};
}
function previewCycleAiImport(data,validation){
  const weeks=data.cycle.weeks||[],changes=data.programChanges||[];
  return `<div class="ai-import-summary"><div><span>Nouveau cycle</span><strong>${esc(data.cycle.name||'Cycle ChatGPT')}</strong></div><div><span>Objectif</span><strong>${esc(data.cycle.goal||'—')}</strong></div><div><span>Rythme</span><strong>${Number(data.cycle.schedule?.trainingDays||0)} séances</strong><small>Repos: ${esc((data.cycle.schedule?.restDays||[]).join(', '))}</small></div><div><span>Adaptations</span><strong>${changes.filter(x=>x.action!=='keep').length}</strong></div></div>
  <div class="ai-import-weeks">${weeks.map(w=>`<div><b>S${w.week}</b><span>${esc(w.phase)}</span><small>${Math.round(Number(w.volume)*100)}% · cible ${Math.round(Number(w.target)*100)}% · RIR ${w.rir}</small></div>`).join('')}</div>
  ${data.cycle.schedule?.dayPlan?`<div class="ai-import-schedule">${['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'].map(name=>{const r=data.cycle.schedule.dayPlan.find(x=>x.day===name);return `<div class="${r?.status==='rest'?'is-rest':''}"><b>${name.slice(0,3)}</b><span>${r?.status==='rest'?'Repos':`Séance${(r?.sourceDays||[]).length>1?' combinée':''}`}</span><small>${r?.status==='training'?(r.sourceDays||[]).map(x=>'J'+x).join(' + '):'—'}</small></div>`}).join('')}</div>`:''}
  ${changes.length?`<div class="ai-import-changes">${changes.filter(x=>x.action!=='keep').map(ch=>`<div><b>J${ch.day} · ${esc(ch.action.toUpperCase())}</b><span>${esc(ch.exercise||'—')}${ch.newExercise?` → <strong>${esc(ch.newExercise)}</strong>`:''}</span><small>${Array.isArray(ch.progression)&&ch.progression.length?esc(ch.progression.map(p=>`S${p.week} ${p.sets}×${p.target}${p.assistance?` · ${p.assistance}`:''}`).join(' → ')):`${ch.sets?`${ch.sets}×${ch.target||''} · `:''}${esc((ch.weeks||[]).map(x=>'S'+x).join(', '))}`}</small></div>`).join('')}</div>`:''}
  ${validation.warnings.length?`<div class="ai-import-warning">${validation.warnings.map(x=>`<p>⚠ ${esc(x)}</p>`).join('')}</div>`:''}`;
}
function createCycleFromAiImport(data,sourceCycle){
  const now=Date.now(),copy={...clone(sourceCycle),id:String(now),name:String(data.cycle.name||`${sourceCycle.name} · IA`).trim(),description:`Adapté avec ChatGPT · ${data.cycle.goal||''}`.trim(),base:false,archived:false,days:clone(sourceCycle.days||{}),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
  // Materialize every source day so changes never affect/fall back to the original cycle.
  copy.days={};for(let d=0;d<7;d++)copy.days[d]=cycleDayTemplate(sourceCycle,d);
  for(const ch of (data.programChanges||[])){
    if(ch.action==='keep')continue;const day=Number(ch.day)-1,w=copy.days[day],arr=w.exercises||[],idx=arr.findIndex(x=>x.name===ch.exercise);
    const makeExercise=name=>{const fallback={name,type:ch.type||'reps',sets:Number(ch.sets||3),target:Number(ch.target||8),baseTarget:Number(ch.target||8)};const e=exerciseFromLibrary(name,fallback);e.sets=Number(ch.sets||e.sets||3);e.target=Number(ch.target||e.target||8);e.baseTarget=e.target;if(ch.type)e.type=ch.type;e.aiWeeks=Array.isArray(ch.weeks)?ch.weeks.map(Number):[];e.aiReason=ch.reason||'';e.aiProgression=Array.isArray(ch.progression)?clone(ch.progression):[];return e;};
    if(ch.action==='remove'&&idx>=0)arr.splice(idx,1);
    else if(ch.action==='replace'&&idx>=0)arr.splice(idx,1,makeExercise(ch.newExercise));
    else if(ch.action==='add'&&ch.newExercise)arr.push(makeExercise(ch.newExercise));
    else if(ch.action==='modify'&&idx>=0){arr[idx]={...arr[idx],sets:Number(ch.sets||arr[idx].sets),target:Number(ch.target||arr[idx].target),baseTarget:Number(ch.target||arr[idx].target),type:ch.type||arr[idx].type,aiWeeks:Array.isArray(ch.weeks)?ch.weeks.map(Number):[],aiReason:ch.reason||'',aiProgression:Array.isArray(ch.progression)?clone(ch.progression):[]};}
  }
  copy.schedule=clone(data.cycle.schedule||{trainingDays:cycleTrainingDays(copy).length,restDays:cycleRestDayNames(copy)});
  applyAiScheduleToCycle(copy,copy.schedule);
  copy.progression={mode:'custom',goal:data.cycle.goal||'Personnalisé',name:data.cycle.name||'Cycle ChatGPT',description:'Progression importée depuis une proposition ChatGPT.',weeks:data.cycle.weeks.map((w,i)=>normalizeProgressionWeek({week:i+1,name:w.phase||`Semaine ${i+1}`,volumeFactor:Number(w.volume),targetFactor:Number(w.target),cardioFactor:Number(w.cardio),rir:Number(w.rir),allowProgress:!!w.autoProgress},i))};
  const list=getStoredTrainingCycles();list.push(copy);setStoredTrainingCycles(list);ensureCycleProgressionState(copy.id);return copy;
}
function renderCycleProgressionEditor(){
  const id=state.cycleProgressionEditor,c=trainingCycleById(id),d=state.cycleProgressionDraft||progressionPlanForCycle(c),templates=Object.entries(PROGRESSION_TEMPLATE_DEFS),goals=['Équilibré','Reprise','Force','Muscle / volume','Skills'];
  return `<main class="shell progression-builder-shell"><section class="card progression-builder-head"><button class="back-btn" id="closeProgressionEditor">← Programmes</button><div class="kicker">${esc(c.name)} · Progression</div><h1>Comment ce cycle doit-il progresser ?</h1><p class="muted">Choisis le niveau de contrôle qui te convient. Le planning des exercices reste dans le cycle ; cette page décide comment sa difficulté évolue.</p><section class="cycle-ai-wizard-v109">
<div class="cycle-ai-copy"><div class="cycle-ai-icon">✦</div><div><strong>Assistant de cycle</strong><p>Quelques étapes suffisent. L’app utilise d’abord les informations qu’elle connaît et ne te demande que ce qui manque.</p></div></div>
<div class="ai-wizard-progress"><span class="active" data-ai-dot="1"></span><span data-ai-dot="2"></span><span data-ai-dot="3"></span><span data-ai-dot="4"></span><span data-ai-dot="5"></span><span data-ai-dot="6"></span></div>

<div class="ai-wizard-step active" data-ai-step="1">
<div class="kicker">Étape 1 sur 6</div><h3>Quel est ton objectif ?</h3>
<label><span>Objectif principal</span><select id="cycleAiObjective"><option>Plus de tractions</option><option>Plus de dips</option><option>Muscle / volume</option><option>Force</option><option>Endurance</option><option>Remise en forme</option><option>Skill</option><option>Personnalisé</option></select></label>
<label><span>Résultat ou skill visé</span><input id="cycleAiTarget" type="text" placeholder="Ex. 15 tractions ou premier Muscle-up"></label>
<label><span>Objectif secondaire · facultatif</span><input id="cycleAiSecondary" type="text" placeholder="Ex. préparer le muscle-up"></label>
</div>

<div class="ai-wizard-step" data-ai-step="2">
<div class="kicker">Étape 2 sur 6</div><h3>Quel délai veux-tu viser ?</h3>
<div class="ai-choice-grid" id="cycleAiHorizonChoices">
<button type="button" class="ai-choice active" data-value="Progression durable, sans date"><strong>Sans date</strong><small>Progression durable</small></button>
<button type="button" class="ai-choice" data-value="8 semaines"><strong>8 semaines</strong><small>Cycle actuel</small></button>
<button type="button" class="ai-choice" data-value="12 semaines"><strong>12 semaines</strong><small>Plus progressif</small></button>
<button type="button" class="ai-choice" data-value="16 semaines"><strong>16 semaines</strong><small>Long terme</small></button>
</div><input id="cycleAiHorizon" type="hidden" value="Progression durable, sans date">
</div>

<div class="ai-wizard-step" data-ai-step="3">
<div class="kicker">Étape 3 sur 6</div><h3>Combien de fois veux-tu t’entraîner ?</h3>
<label><span>Séances par semaine</span><select id="cycleAiTrainingDays">${Array.from({length:6},(_,i)=>{const n=i+1;return `<option value="${n}" ${n===cycleTrainingDays(c).length?'selected':''}>${n} séance${n>1?'s':''}</option>`}).join('')}</select></label>
<div class="ai-rest-days"><span>Choisis tes jours de repos</span><div class="ai-day-choice">${['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'].map(name=>`<label><input type="checkbox" name="cycleAiRestDay" value="${name}" ${cycleRestDayNames(c).includes(name)?'checked':''}><span>${name.slice(0,3)}</span></label>`).join('')}</div><small id="cycleAiRestHint" class="muted"></small></div>
<p class="small muted">L’app conserve au moins un jour de repos. ChatGPT adaptera la répartition des séances à ces disponibilités.</p>
</div>

<div class="ai-wizard-step" data-ai-step="4">
<div class="kicker">Étape 4 sur 6</div><h3>Ton niveau actuel</h3>
<div id="cycleAiDetectedData" class="ai-detected-data"></div><div id="cycleAiEvaluation"></div>
<div class="ai-source-choice">
<label class="ai-source-option active"><input type="radio" name="cycleAiSource" value="app" checked><span><strong>Utiliser mes données de l’app</strong><small>Recommandé</small></span></label>
<label class="ai-source-option"><input type="radio" name="cycleAiSource" value="manual"><span><strong>Renseigner manuellement</strong><small>Si elles ne reflètent pas ton niveau</small></span></label>
</div>
<label class="ai-manual-level" hidden><span>Décris seulement ton niveau actuel</span><textarea id="cycleAiManualLevel" rows="3" placeholder="Ex. 6 tractions strictes, 10 dips, dead hang 45 s..."></textarea></label>
</div>

<div class="ai-wizard-step" data-ai-step="5">
<div class="kicker">Étape 5 sur 6</div><h3>Quelque chose à prendre en compte ?</h3>
<label><span>Situation</span><select id="cycleAiContext"><option>Aucun point particulier</option><option>Reprise après un arrêt</option><option>Fatigue élevée</option><option>Sport complémentaire</option><option>Limiter le cardio</option><option>Gêne / douleur à prendre en compte</option></select></label>
<label id="cycleAiBreakWrap" hidden><span>Depuis combien de temps avais-tu arrêté ?</span><input id="cycleAiBreakDuration" type="text" placeholder="Ex. 3 mois"></label>
<div id="cycleAiPainWrap" hidden class="ai-guide-grid"><label><span>Zone concernée</span><select id="cycleAiPainZone"><option>Épaule</option><option>Coude</option><option>Poignet</option><option>Dos</option><option>Genou</option><option>Autre</option></select></label><label><span>Impact</span><select id="cycleAiPainImpact"><option>Léger</option><option>Modéré</option><option>Important</option></select></label></div>
<label><span>Autre précision · facultatif</span><textarea id="cycleAiGoal" rows="2" placeholder="Une contrainte ou préférence que l’app ne peut pas connaître…"></textarea></label>
</div>

<div class="ai-wizard-step" data-ai-step="6">
<div class="kicker">Étape 6 sur 6</div><h3>Vérification</h3>
<div id="cycleAiReview" class="ai-review-box"></div>
<div class="ai-output-plan"><strong>Ce que ChatGPT devra proposer</strong><div><span>01</span><p><b>Courbe du cycle</b><small>Volume, cible, RIR, cardio et progression S1–S8</small></p></div><div><span>02</span><p><b>Adaptations du programme</b><small>Exercices à conserver, modifier, remplacer ou ajouter</small></p></div><div><span>03</span><p><b>Progression prioritaire</b><small>Prescription concrète semaine par semaine</small></p></div></div><p class="small muted">Le prompt contient aussi le programme complet, le matériel et les dernières séances disponibles. Aucune donnée n’est envoyée automatiquement.</p>
<button class="btn btn-primary" id="generateCycleAiPrompt">Générer mon prompt</button>
<div class="cycle-ai-output" id="cycleAiOutput" hidden><div class="cycle-ai-output-head"><strong>Prompt prêt à utiliser</strong><button class="btn btn-primary compact" id="copyCycleAiPrompt">Copier le prompt</button></div><textarea id="cycleAiPrompt" rows="16" readonly></textarea></div>
</div>

<div class="ai-wizard-nav"><button type="button" class="btn btn-secondary" id="cycleAiPrev" hidden>← Retour</button><button type="button" class="btn btn-primary" id="cycleAiNext">Continuer →</button></div>
</section><section class="cycle-ai-importer"><div class="cycle-ai-copy"><div class="cycle-ai-icon">↧</div><div><strong>Importer la réponse ChatGPT</strong><p>Colle la réponse complète. L’app extrait la configuration, la vérifie et crée toujours un nouveau cycle.</p></div></div><textarea id="cycleAiImportText" rows="7" placeholder="Colle ici toute la réponse de ChatGPT…"></textarea><div class="cycle-ai-actions"><button type="button" class="btn btn-secondary" id="analyzeCycleAiImport">Analyser la proposition</button><span class="small muted">Ton cycle actuel ne sera jamais modifié.</span></div><div id="cycleAiImportResult" hidden></div></section><div class="progression-manual-divider"><span>ou configure manuellement</span></div><div class="progression-mode-grid"><button class="progression-mode ${d.mode==='auto'?'active':''}" data-progression-mode="auto"><span>🤖</span><strong>Automatique</strong><small>Recommandé · l'app gère les 8 semaines</small></button><button class="progression-mode ${d.mode==='template'?'active':''}" data-progression-mode="template"><span>▤</span><strong>Modèle</strong><small>Force, volume, reprise, skills…</small></button><button class="progression-mode ${d.mode==='custom'?'active':''}" data-progression-mode="custom"><span>⚙</span><strong>Personnalisé</strong><small>Tu règles chaque semaine</small></button></div></section>
  ${d.mode==='auto'?`<section class="card progression-builder-section"><div class="kicker">Objectif principal</div><h2>L'application choisit la courbe</h2><select class="select" id="progressionGoal">${goals.map(g=>`<option ${g===(d.goal||'Équilibré')?'selected':''}>${g}</option>`).join('')}</select><p class="muted small">Le moteur continue d'utiliser tes performances réelles pour faire progresser les exercices. Le bloc règle surtout la fatigue, la marge RIR, le cardio et les semaines allégées.</p></section>`:''}
  ${d.mode==='template'?`<section class="card progression-builder-section"><div class="kicker">Modèle</div><h2>Choisir une structure</h2><select class="select" id="progressionTemplate">${templates.map(([id,t])=>`<option value="${id}" ${id===(d.templateId||'standard')?'selected':''}>${t.name} · ${t.goal}</option>`).join('')}</select><p class="muted small">${esc((PROGRESSION_TEMPLATE_DEFS[d.templateId||'standard']||PROGRESSION_TEMPLATE_DEFS.standard).description)}</p></section>`:''}
  <section class="card progression-preview"><div class="section-head"><div><div class="kicker">Aperçu</div><h2>${esc(d.name||'Plan de progression')}</h2></div><span class="pill">8 semaines</span></div><div class="progression-preview-weeks">${(d.weeks||[]).map((w,i)=>{w=normalizeProgressionWeek(w,i);return `<div class="progression-preview-week"><span>S${i+1}</span><strong>${esc(w.name)}</strong><small>${Math.round(w.volumeFactor*100)} % vol · ${Math.round(w.targetFactor*100)} % cible · ${w.rir} RIR</small><em>${progressionDifficulty(w)}</em></div>`;}).join('')}</div></section>
  ${d.mode==='custom'?`<section class="progression-week-editors">${d.weeks.map(renderProgressionWeekEditor).join('')}</section>`:''}
  <section class="card progression-builder-save"><div><strong>${d.mode==='custom'?'Plan entièrement paramétrique':d.mode==='auto'?'Laisse le moteur travailler':'Modèle prêt à l’emploi'}</strong><p class="muted small">Tu pourras changer ce plan plus tard sans modifier les séances du cycle.</p></div><button class="btn btn-primary" id="saveCycleProgression">Enregistrer la progression</button></section></main>`;
}
function saveCycleProgression(){syncProgressionDraftFromDom();const id=state.cycleProgressionEditor,d=state.cycleProgressionDraft;if(!id||!d)return;setProgressionPlanForCycle(id,d);ensureCycleProgressionState(id);state.cycleProgressionEditor=null;state.cycleProgressionDraft=null;render();}

function renderTrainingCycleCard(c){
  const active=String(c.id)===String(getActiveTrainingCycleId()),st=cycleStats(c),days=[1,2,3,4,5,6,0];
  const pp=progressionPlanForCycle(c),ps=getCycleState(new Date(),c.id);
  return `<article class="card training-cycle-card ${active?'active-cycle':''}"><div class="training-cycle-head"><div><div class="kicker">${c.base?'Programme de référence':'Cycle personnalisé'}</div><h2>${esc(c.name)}</h2><p class="muted small">${esc(c.description||'Cycle personnalisé')}</p></div>${active?'<span class="cycle-active-badge">● ACTIF</span>':'<button class="btn btn-primary compact activate-cycle" data-cycle-id="'+c.id+'">Utiliser ce cycle</button>'}</div><div class="cycle-stat-line"><span>${st.activeDays} jours actifs</span><span>${st.rest} repos · ${esc(cycleRestDayNames(c).join(', ')||'aucun')}</span><span>${st.cardio} min cardio</span><span>${progressionModeLabel(pp)} · S${ps.week}/${ps.weekCount}</span></div><div class="cycle-day-list">${days.map(day=>{const w=cycleDayTemplate(c,day),rest=!(w.exercises||[]).length;return `<div class="cycle-day-item ${rest?'is-rest':''}"><span class="cycle-day-code">${DAY_NAMES[day].slice(0,3).toUpperCase()}</span><div class="grow"><strong>${rest?'Repos':esc(w.name)}</strong><small>${rest?'Récupération complète':`${w.duration||estimateWorkoutMinutes(w)} min · Express ${w.shortDuration||Math.max(20,Math.round((w.duration||45)*.48))}`}</small></div>${!c.base?`<div class="cycle-day-actions">${rest?`<button class="mini-action edit-cycle-day" data-cycle-id="${c.id}" data-day="${day}">Ajouter une séance</button>${(cycleDayTemplate(baseTrainingCycle(),day).exercises||[]).length?`<button class="mini-action restore-cycle-day" data-cycle-id="${c.id}" data-day="${day}">Copier le jour de base</button>`:''}`:`<button class="mini-action edit-cycle-day" data-cycle-id="${c.id}" data-day="${day}">Modifier</button><button class="mini-action rest-cycle-day" data-cycle-id="${c.id}" data-day="${day}">Repos</button>`}</div>`:''}</div>`}).join('')}</div><div class="training-cycle-actions"><button class="btn btn-secondary edit-cycle-progression" data-cycle-id="${c.id}">Progression</button>${c.base?`<button class="btn btn-outline duplicate-cycle" data-cycle-id="${c.id}">Dupliquer pour personnaliser</button><span class="muted small">Le planning de base reste protégé ; sa progression peut être personnalisée.</span>`:`<button class="btn btn-outline rename-cycle" data-cycle-id="${c.id}">Renommer</button><button class="btn btn-outline duplicate-cycle" data-cycle-id="${c.id}">Dupliquer</button><button class="btn btn-outline danger archive-cycle" data-cycle-id="${c.id}">Archiver</button>`}</div></article>`;
}
function renderCustomSessions(){
  if(state.cycleProgressionEditor)return renderCycleProgressionEditor();
  if(state.customSessionEditor)return renderCustomSessionEditor();
  const list=getCustomWorkouts(),cycles=allTrainingCycles(false),active=getActiveTrainingCycle();
  return shell(`<header class="topbar"><div><div class="brand">Planning</div><div class="daylabel">Cycles hebdomadaires et séances libres</div></div><div class="topbar-actions"><button class="btn btn-secondary compact" id="newCustomSession">＋ Séance</button><button class="btn btn-primary compact" id="newTrainingCycle">＋ Cycle</button></div></header>
    ${renderPlanningTabs('programs')}
    <section class="cycle-page-intro"><div><div class="kicker">Cycle actif</div><h1>${esc(active.name)}</h1><p class="muted">Le calendrier et la séance du jour utilisent automatiquement ce cycle.</p></div></section>
    <section class="training-cycle-list">${cycles.map(renderTrainingCycleCard).join('')}</section>
    <section class="custom-free-head"><div><div class="kicker">Hors cycle</div><h2>Séances libres</h2><p class="muted small">Pour un entraînement ponctuel qui ne remplace pas ton planning hebdomadaire.</p></div><button class="btn btn-secondary compact" id="newCustomSession2">＋ Nouvelle séance</button></section>
    <section class="card clone-card"><div class="kicker">Créer plus vite</div><h2>Partir d'une journée du cycle actif</h2><p class="muted small">La copie devient indépendante : tu peux la modifier sans toucher au cycle.</p><div class="clone-day-grid">${[1,2,3,4,5,6,0].map(day=>{const w=workoutTemplateForDay(day);return (w.exercises||[]).length?`<button class="btn btn-outline clone-program-day" data-clone-day="${day}">${DAY_NAMES[day]} · ${esc(w.name)}</button>`:''}).join('')}</div></section>
    ${list.length?`<section class="custom-session-list">${list.map(w=>{const cov=customSessionCoverage(w);return `<article class="card custom-session-card"><div class="section-head"><div><div class="kicker">Séance libre</div><h2>${esc(w.name)}</h2><p class="muted">${esc(w.subtitle||'')}</p></div><span class="pill">≈ ${w.duration||estimateWorkoutMinutes(w)} min</span></div><div class="meta"><span class="pill">${(w.exercises||[]).length} étapes</span><span class="pill">${cov.groups.length} zones</span><span class="pill">${cov.equipment.length} équipements</span></div><div class="custom-session-actions"><button class="btn btn-primary start-custom-session" data-custom-id="${w.id}">Lancer</button><button class="btn btn-secondary edit-custom-session" data-custom-id="${w.id}">Modifier</button><button class="btn btn-outline duplicate-custom-session" data-custom-id="${w.id}">Dupliquer</button><button class="btn btn-outline danger delete-custom-session" data-custom-id="${w.id}">Supprimer</button></div></article>`}).join('')}</section>`:`<section class="card empty-custom"><h2>Aucune séance libre</h2><p class="muted">Tes cycles suffisent pour le quotidien. Crée une séance libre uniquement pour un entraînement ponctuel.</p></section>`}`,'more');
}
function renderCustomSessionEditor(){
  const w=state.customSessionDraft||defaultCustomWorkout(),names=customExerciseNames(),quality=customSessionQuality(w),ct=state.cycleDayTarget,cycle=ct?trainingCycleById(ct.cycleId):null;
  return `<main class="shell custom-editor-shell"><section class="card editor-card"><button class="back-btn" id="closeCustomEditor">← Programmes</button><div class="kicker">${ct?`${esc(cycle.name)} · ${DAY_NAMES[ct.day]}`:'Éditeur de séance'}</div><h1>${ct?'Modifier la journée':w.id?'Modifier une séance':'Créer une séance'}</h1><p class="muted">Ajoute, remplace, supprime et réordonne librement les exercices. Le contrôle ci-dessous te signale si tu oublies une phase essentielle.</p><label class="field-label">Nom</label><input class="big-input custom-session-meta" data-custom-meta="name" value="${esc(w.name||'')}"><label class="field-label">Description</label><input class="url-input custom-session-meta" data-custom-meta="subtitle" value="${esc(w.subtitle||'')}"><div class="custom-quality"><span class="${quality.warmup?'ok':'warn'}">${quality.warmup?'✓':'!'} Échauffement</span><span class="${quality.cardio?'ok':'warn'}">${quality.cardio?'✓':'!'} Cardio</span><span class="${quality.cooldown?'ok':'warn'}">${quality.cooldown?'✓':'!'} Étirements</span><span>${quality.groups} zones</span><span>${quality.equipment} équipements</span></div><div class="custom-builder-head"><strong>Exercices</strong><button class="btn btn-secondary compact" id="addCustomExercise">＋ Ajouter</button></div><div class="custom-builder-list">${(w.exercises||[]).map((e,i)=>`<article class="custom-builder-row" data-custom-index="${i}"><div class="custom-builder-number">${i+1}</div><div class="custom-builder-main"><select class="select custom-exercise-name" data-custom-index="${i}">${names.map(n=>`<option value="${esc(n)}" ${n===e.name?'selected':''}>${n}</option>`).join('')}</select><div class="custom-builder-grid"><label><span>Phase</span><select class="select custom-ex-field" data-custom-index="${i}" data-key="phase">${['warmup','main','cardio','cooldown'].map(ph=>`<option value="${ph}" ${ph===(e.phase||'main')?'selected':''}>${phaseLabel(ph)}</option>`).join('')}</select></label>${ct?`<label class="cycle-express-toggle"><span>Express</span><input class="custom-ex-bool" data-custom-index="${i}" data-key="express" type="checkbox" ${e.express?'checked':''}><small>Inclure dans la séance courte</small></label>`:''}<label><span>Séries</span><input class="mini-input custom-ex-field" data-custom-index="${i}" data-key="sets" type="number" min="1" max="10" value="${Number(e.sets||1)}"></label><label><span>${e.type==='timer'||e.type?.startsWith('hold')?'Secondes':'Répétitions'}</span><input class="mini-input custom-ex-field" data-custom-index="${i}" data-key="target" type="number" min="1" value="${Number(e.target||1)}"></label><label><span>Repos (s)</span><input class="mini-input custom-ex-field" data-custom-index="${i}" data-key="rest" type="number" min="0" value="${Number(e.rest||0)}"></label></div><div class="custom-row-info"><span>${esc(equipmentForExercise(e.name).join(' · ')||exerciseInfo(e.name)?.equipment||'Sans matériel')}</span><span>${esc((exerciseInfo(e.name)?.muscles||[]).join(' · '))}</span></div>${(()=>{const a=exerciseAdaptation(e.name);return !a.equipment.available?`<div class="custom-setup-warning"><strong>⚠ Matériel manquant</strong><span>${esc(missingEquipmentLabels(a.equipment).join(', '))}</span>${a.suggestion?`<small>Variante proposée : ${esc(a.suggestion)}</small>`:''}</div>`:a.restriction.restricted?`<div class="custom-setup-warning"><strong>⚠ Zone à ménager</strong>${a.suggestion?`<small>Variante proposée : ${esc(a.suggestion)}</small>`:''}</div>`:''})()}</div><div class="custom-row-actions"><button class="icon-btn move-custom-up" data-custom-index="${i}" aria-label="Monter">↑</button><button class="icon-btn move-custom-down" data-custom-index="${i}" aria-label="Descendre">↓</button><button class="icon-btn remove-custom-ex" data-custom-index="${i}" aria-label="Supprimer">×</button></div></article>`).join('')}</div><div class="custom-editor-summary"><span>≈ ${estimateWorkoutMinutes(w)} min</span><span>${(w.exercises||[]).length} étapes</span></div><button class="btn btn-primary" id="saveCustomSession">Enregistrer la séance</button></section></main>`;
}
function syncCustomDraftFromDom(){
  const d=state.customSessionDraft;if(!d)return;
  document.querySelectorAll('.custom-session-meta').forEach(el=>d[el.dataset.customMeta]=el.value);
  document.querySelectorAll('.custom-ex-field').forEach(el=>{const i=Number(el.dataset.customIndex),key=el.dataset.key;if(!d.exercises[i])return;d.exercises[i][key]=['sets','target','rest'].includes(key)?Number(el.value||0):el.value;if(key==='target')d.exercises[i].baseTarget=Number(el.value||0);});
  document.querySelectorAll('.custom-ex-bool').forEach(el=>{const i=Number(el.dataset.customIndex),key=el.dataset.key;if(d.exercises[i])d.exercises[i][key]=!!el.checked;});
  d.duration=estimateWorkoutMinutes(d);
}
function saveCustomSession(){
  syncCustomDraftFromDom();const d=state.customSessionDraft;if(!d||!d.name?.trim()||!d.exercises?.length)return;
  if(state.cycleDayTarget){const t=state.cycleDayTarget,c=trainingCycleById(t.cycleId);if(c&& !c.base){const candidate=clone(c);candidate.days=clone(candidate.days||{});const savedDay={...clone(d),id:undefined,duration:estimateWorkoutMinutes(d),shortDuration:d.shortDuration||Math.max(20,Math.round(estimateWorkoutMinutes(d)*.48))};savedDay.exercises=(savedDay.exercises||[]).map(e=>{const essential=['warmup','cardio','cooldown'].includes(e.phase);const express=essential?true:!!e.express;let shortSets=e.shortSets,shortTarget=e.shortTarget;if(express&&shortSets==null&&e.phase==='main')shortSets=Math.max(1,Number(e.sets||1)-1);if(express&&shortTarget==null&&essential)shortTarget=Math.max(e.phase==='cardio'?300:120,Math.round(Number(e.target||0)*.5));return {...e,express,shortSets,shortTarget};});candidate.days[Number(t.day)]=savedDay;if(!cycleHasRest(candidate)){alert('Un cycle doit conserver au moins un jour de repos. Passe d’abord un autre jour en repos.');return;}updateTrainingCycle(candidate);}state.customSessionEditor=null;state.customSessionDraft=null;state.cycleDayTarget=null;render();return;}
  const list=getCustomWorkouts(),item={...clone(d),id:d.id||Date.now(),updatedAt:new Date().toISOString()};
  const idx=list.findIndex(x=>String(x.id)===String(item.id));if(idx>=0)list[idx]=item;else list.unshift(item);setCustomWorkouts(list.slice(0,50));state.customSessionEditor=null;state.customSessionDraft=null;render();
}
function equipmentForExercise(name){
  const info=exerciseInfo(name),eq=(info?.equipment||'').toLowerCase(),out=[];
  if(/traction|chin-up|dead hang|hanging|scapular pull/i.test(name)||/power tower/.test(eq)||(/barre/.test(eq)&&!/barres parallèles/.test(eq)))out.push('Power Tower');
  if(/dips|l-sit|v-sit/i.test(name)||/barres parallèles/.test(eq))out.push('Barres parallèles');
  if(/pompes|pike push|scapular push/i.test(name)||/poignées/.test(eq))out.push('Poignées de pompes');
  if(/bande/.test(eq)||/avec bande|face pulls|pallof|rotation externe|band chest/i.test(name))out.push('Bandes');
  if(/tapis/.test(eq)||/hollow|side plank|dead bug|reverse crunch|stretch|mobilité|90\/90|frog|deep squat/i.test(name))out.push('Tapis');
  if(/sac à dos|sac a dos/.test(eq)||/sac à dos|sac a dos/i.test(name))out.push('Sac à dos');
  return [...new Set(out)];
}
function programAudit(){
  const days=[0,1,2,3,4,5,6].filter(day=>(workoutTemplateForDay(day).exercises||[]).length),muscles={},equipment=Object.fromEntries(HOME_EQUIPMENT.map(x=>[x,new Set()]));let cardio=0,expressCardio=0,warmups=0,cooldowns=0;const cfg=getTrainingConfig();
  days.forEach(day=>{const w=preparedWorkout(day,null,'full'),short=preparedWorkout(day,null,'short');cardio+=cardioTargetSeconds(w);expressCardio+=cardioTargetSeconds(short);if(w.exercises.some(e=>e.phase==='warmup'))warmups++;if(w.exercises.some(e=>e.phase==='cooldown'))cooldowns++;const v=volumeForWorkout(w);Object.entries(v).forEach(([g,n])=>muscles[g]=(muscles[g]||0)+n);w.exercises.forEach(e=>equipmentForExercise(e.name).forEach(eq=>equipment[eq]?.add(day)));});
  const covered=VOLUME_GROUPS.filter(g=>(muscles[g]||0)>=(cfg.volumeTargets[g]?.min||0)).length;
  return {days,muscles,equipment,cardioMinutes:Math.round(cardio/60),expressCardioMinutes:Math.round(expressCardio/60),warmups,cooldowns,covered,cfg};
}
function renderProgramAudit(){
  const a=programAudit(),cardioOK=a.cardioMinutes>=a.cfg.cardioMin&&a.cardioMinutes<=a.cfg.cardioMax;
  return `<section class="card program-audit"><div class="section-head"><div><div class="kicker">Audit automatique · ${esc(getActiveTrainingCycle().name)}</div><h2>Couverture hebdomadaire</h2></div><span class="pill ${a.covered===VOLUME_GROUPS.length?'badge-success':'badge-warn'}">${a.covered}/${VOLUME_GROUPS.length} zones dans tes cibles</span></div><div class="audit-hero"><div><strong>${a.days.length}/7</strong><span>jours actifs</span></div><div><strong>${a.cardioMinutes}</strong><span>min cardio · cible ${a.cfg.cardioMin}–${a.cfg.cardioMax}</span></div><div><strong>${a.warmups}/${a.days.length}</strong><span>échauffements</span></div><div><strong>${a.cooldowns}/${a.days.length}</strong><span>retours au calme</span></div></div><div class="audit-section"><strong>Muscles / fonctions · programme complet</strong><div class="audit-chip-grid">${VOLUME_GROUPS.map(g=>{const n=a.muscles[g]||0,t=a.cfg.volumeTargets[g],ok=n>=t.min&&n<=t.max;return `<span class="audit-chip ${ok?'ok':'warn'}">${v10110VolumeLabel(g)} <b>${n.toFixed(1)}</b> <small>${t.min}–${t.max}</small></span>`}).join('')}</div></div><div class="audit-section"><strong>Matériel utilisé dans la semaine</strong><div class="equipment-audit">${HOME_EQUIPMENT.map(eq=>`<div><span>${eq}</span><strong>${a.equipment[eq]?.size||0} j</strong></div>`).join('')}</div></div><div class="audit-note ${cardioOK?'audit-ok':''}"><strong>Mode Express</strong><span>${a.expressCardioMinutes} min de cardio si tu faisais toutes les séances actives en Express. Les cibles cardio et musculaires sont maintenant les tiennes : modifie-les dans Volume musculaire selon ton objectif et ta récupération.</span></div><p class="muted small">L'audit compare désormais le programme complet à tes propres fourchettes paramétriques, au lieu d'un seuil fixe.</p></section>`;
}

function render() {
  const app = document.getElementById("app");
  if (state.active) app.innerHTML = renderCoach();
  else if (state.activityEditor) app.innerHTML = renderActivityEditor();
  else if (state.athleteProfileEditor) app.innerHTML = renderAthleteProfileEditor();
  else if (state.sessionModeEditor) app.innerHTML = renderSessionModePicker();
  else if (state.readinessEditor) app.innerHTML = renderReadiness();
  else if (state.exerciseLibrary) app.innerHTML = renderExerciseLibrary();
  else if (state.assessmentEditor) app.innerHTML = renderAssessmentEditor();
  else if (state.bodyEditor) app.innerHTML = renderBodyEditor();
  else if (state.tutorialManager) app.innerHTML = renderTutorialManager();
  else if (state.view === "week") app.innerHTML = renderWeek();
  else if (state.view === "flexibility") app.innerHTML = renderFlexibility();
  else if (state.view === "progress") app.innerHTML = renderProgress();
  else if (state.view === "assessment") app.innerHTML = renderAssessmentCenter();
  else if (state.view === "skills") app.innerHTML = renderSkills();
  else if (state.view === "measurements") app.innerHTML = renderMeasurements();
  else if (state.view === "athlete") app.innerHTML = renderMore();
  else if (state.view === "settings") app.innerHTML = renderSettings();
  else if (state.view === "custom") app.innerHTML = renderCustomSessions();
  else app.innerHTML = renderToday();
  bindEvents();
}


function uiIcon(name, cls="ui-icon") {
  const icons={
    add:'<path d="M12 5v14M5 12h14"/>',
    today:'<circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2"/>',
    week:'<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M7.5 3v4M16.5 3v4M3.5 9.5h17"/>',
    progress:'<path d="M4 17l5-5 3.5 3.5L20 8"/><path d="M15.5 8H20v4.5"/>',
    more:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
    flex:'<path d="M5 7c3.5 0 4.5 3 7 3s3.5-3 7-3M5 17c3.5 0 4.5-3 7-3s3.5 3 7 3"/>',
    skills:'<path d="M12 3.5l7.5 8.5-7.5 8.5L4.5 12 12 3.5z"/>',
    exercises:'<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
    sessions:'<path d="M5 7.5h14M5 12h14M5 16.5h9"/><path d="M17.5 15v6M14.5 18h6"/>',
    measurements:'<path d="M5 19L19 5"/><path d="M8 16l-2-2M11 13l-2-2M14 10l-2-2M17 7l-2-2"/>',
    profile:'<circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c.8-4 3-6 6.5-6s5.7 2 6.5 6"/>',
    clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    award:'<path d="M8 4h8v5a4 4 0 01-8 0V4z"/><path d="M6 5H4.5v2A3.5 3.5 0 008 10.5M18 5h1.5v2a3.5 3.5 0 01-3.5 3.5M12 13v4M8.5 20h7"/>',
    trash:'<path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/>',
    spark:'<path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M18.5 15.5l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1z"/>'
  };
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.spark}</svg>`;
}

function shell(content, activeTab=state.view) {
  const navTab=activeTab==='custom'?'week':['today','week','flexibility','progress'].includes(activeTab)?activeTab:'athlete';
  return `<main class="shell">${content}</main>
  ${['today','week','flexibility','progress'].includes(activeTab)?`<button class="quick-fab quick-fab-add" id="openAddHub" aria-label="Ajouter quelque chose"><span class="quick-fab-plus">＋</span><span>Ajouter</span></button>`:''}
  ${renderAddHubModal()}
  ${renderQuickLogModal()}
  <nav class="bottom-nav bottom-nav-simple" aria-label="Navigation principale">
    <button class="nav-btn ${navTab==='today'?'active':''}" data-view="today"><span>${uiIcon('today')}</span>Aujourd'hui</button>
    <button class="nav-btn ${navTab==='week'?'active':''}" data-view="week"><span>${uiIcon('week')}</span>Planning</button>
    <button class="nav-btn ${navTab==='flexibility'?'active':''}" data-view="flexibility"><span>${uiIcon('flex')}</span>Mobilité</button>
    <button class="nav-btn ${navTab==='progress'?'active':''}" data-view="progress"><span>${uiIcon('progress')}</span>Progression</button>
    <button class="nav-btn ${navTab==='athlete'?'active':''}" data-view="athlete"><span>${uiIcon('profile')}</span>Profil</button>
  </nav>`;
}

function renderProfileDaySelector(p){
  return `<div class="profile-day-selector">${[1,2,3,4,5,6,0].map(day=>`<label class="${(p.trainingDays||[]).includes(day)?'selected':''}"><input type="checkbox" class="athlete-training-day" value="${day}" ${(p.trainingDays||[]).includes(day)?'checked':''}><span>${athleteDayLabel(day).slice(0,3)}</span></label>`).join('')}</div>`;
}
function renderAthleteProfileEditor(){
  const p=getAthleteProfile(),sports=new Set(p.sports||[]),locations=new Set(p.locations||[]),setup=getEquipmentSetup();
  return shell(`<header class="topbar"><div><div class="brand">Modifier le profil</div><div class="daylabel">Une seule source pour personnaliser tout KINETIK</div></div></header>
  <section class="athlete-profile-editor-full">
    <section class="profile-editor-block"><div class="profile-editor-heading"><span>01</span><div><h2>Identité sportive</h2><p>Les informations de base de l'athlète.</p></div></div><div class="profile-form-grid">
      <label><span>Prénom ou pseudo</span><input id="athleteName" value="${esc(p.name)}" placeholder="Ton prénom"></label>
      <label><span>Niveau actuel</span><select id="athleteExperience">${['Débutant','Intermédiaire','Avancé','Expert'].map(x=>`<option ${p.experience===x?'selected':''}>${x}</option>`).join('')}</select></label>
      <label><span>Âge <small>optionnel</small></span><input id="athleteAge" type="number" min="12" max="100" value="${p.age||''}" placeholder="—"></label>
      <label><span>Taille</span><div class="profile-input-unit"><input id="athleteHeight" type="number" min="100" max="230" value="${p.height||''}" placeholder="—"><b>cm</b></div></label>
      <label><span>Poids actuel <small>enregistre une mesure</small></span><div class="profile-input-unit"><input id="athleteWeight" type="number" min="30" max="250" step=".1" value="${p.weight||''}" placeholder="—"><b>kg</b></div></label>
      <label><span>Années de pratique <small>optionnel</small></span><input id="athleteYears" type="number" min="0" max="60" step=".5" value="${p.yearsTraining||''}" placeholder="—"></label>
    </div></section>

    <section class="profile-editor-block"><div class="profile-editor-heading"><span>02</span><div><h2>Objectifs</h2><p>Ce que KINETIK doit prioriser dans les cycles et recommandations.</p></div></div><div class="profile-form-grid">
      <label class="wide"><span>Objectif principal</span><input id="athletePrimaryGoal" value="${esc(p.primaryGoal)}" placeholder="Ex. Muscle-up"></label>
      <label class="wide"><span>Objectif secondaire</span><input id="athleteSecondaryGoal" value="${esc(p.secondaryGoal)}" placeholder="Ex. 10 tractions strictes"></label>
      <label><span>Horizon</span><select id="athleteGoalHorizon">${['','4 semaines','8 semaines','3 mois','6 mois','12 mois','Progression durable'].map(x=>`<option value="${x}" ${p.goalHorizon===x?'selected':''}>${x||'Non défini'}</option>`).join('')}</select></label>
      <label><span>Poids cible <small>optionnel</small></span><div class="profile-input-unit"><input id="athleteTargetWeight" type="number" min="30" max="250" step=".1" value="${p.targetWeight||''}" placeholder="—"><b>kg</b></div></label>
    </div></section>

    <section class="profile-editor-block"><div class="profile-editor-heading"><span>03</span><div><h2>Organisation</h2><p>Le rythme auquel le programme doit réellement s'adapter.</p></div></div><div class="profile-form-grid">
      <label><span>Séances par semaine</span><select id="athleteWeeklySessions">${Array.from({length:7},(_,i)=>i+1).map(n=>`<option value="${n}" ${p.weeklySessions===n?'selected':''}>${n} séance${n>1?'s':''}</option>`).join('')}</select></label>
      <label><span>Durée idéale</span><select id="athletePreferredDuration">${[30,45,60,75,90,120].map(n=>`<option value="${n}" ${p.preferredDuration===n?'selected':''}>${n} min</option>`).join('')}</select></label>
      <label><span>Format préféré</span><select id="athleteSessionPreference">${['Complet + Express','Complet','Express','Flexible'].map(x=>`<option ${p.sessionPreference===x?'selected':''}>${x}</option>`).join('')}</select></label>
      <label><span>Style du coach</span><select id="athleteCoachStyle">${['Prudent','Équilibré','Ambitieux'].map(x=>`<option ${p.coachStyle===x?'selected':''}>${x}</option>`).join('')}</select></label>
    </div><div class="profile-editor-sub"><span>Jours d'entraînement préférés</span>${renderProfileDaySelector(p)}<small>Les autres jours seront considérés comme des jours de récupération préférés.</small></div></section>

    <section class="profile-editor-block"><div class="profile-editor-heading"><span>04</span><div><h2>Sports & lieux</h2><p>KINETIK suit l'ensemble de ton entraînement, pas uniquement la calisthénie.</p></div></div>
      <div class="profile-select-grid">${ATHLETE_SPORTS.map(([id,label])=>`<label class="${sports.has(id)?'selected':''}"><input type="checkbox" class="athlete-sport-check" value="${id}" ${sports.has(id)?'checked':''}><span>${label}</span></label>`).join('')}</div>
      <div class="profile-editor-sub"><span>Lieux disponibles</span><div class="profile-select-grid compact">${[['home','Maison'],['outdoor','Parc / extérieur'],['gym','Salle'],['club','Club / box']].map(([id,label])=>`<label class="${locations.has(id)?'selected':''}"><input type="checkbox" class="athlete-location-check" value="${id}" ${locations.has(id)?'checked':''}><span>${label}</span></label>`).join('')}</div></div>
    </section>

    <section class="profile-editor-block"><div class="profile-editor-heading"><span>05</span><div><h2>Équipement</h2><p>Un exercice indisponible pourra être remplacé automatiquement par une variante compatible.</p></div></div><div class="profile-equipment-editor">${EQUIPMENT_CATALOG.map(x=>`<label class="${setup[x.id]?'selected':''}"><input type="checkbox" class="athlete-equipment-check" data-equipment-id="${x.id}" ${setup[x.id]?'checked':''}><span class="profile-equipment-icon">${x.icon}</span><span><strong>${esc(x.label)}</strong><small>${esc(x.note)}</small></span></label>`).join('')}</div></section>

    <section class="profile-editor-block"><div class="profile-editor-heading"><span>06</span><div><h2>Contexte</h2><p>Informations permanentes utiles à la personnalisation.</p></div></div><label class="profile-notes"><span>Notes pour KINETIK <small>optionnel</small></span><textarea id="athleteNotes" rows="4" placeholder="Ex. contraintes de planning, préférences d'entraînement…">${esc(p.notes)}</textarea></label></section>

    <div class="profile-editor-sticky"><button class="btn btn-secondary" id="cancelAthleteProfile">Annuler</button><button class="btn btn-primary" id="saveAthleteProfile">Enregistrer le profil</button></div>
  </section>`, 'more');
}
function renderMore(){
  const p=getAthleteProfile(),cycle=getActiveTrainingCycle(),cs=getCycleState(),stats=totalTrainingStats(7),records=athleteRecords(),setup=getEquipmentSetup(),equipment=EQUIPMENT_CATALOG.filter(x=>setup[x.id]),completion=athleteProfileCompletion(p);
  const sports=(p.sports||[]).map(athleteSportLabel),training=(p.trainingDays||[]).map(athleteDayLabel);
  return shell(`<header class="topbar profile-main-topbar"><div><div class="brand">Profil</div><div class="daylabel">Le centre de personnalisation de KINETIK</div></div><button class="btn btn-primary compact" id="editAthleteProfile">Modifier</button></header>

    <section class="profile-identity-premium">
      <div class="athlete-avatar large">${athleteInitials(p.name)}</div>
      <div class="profile-identity-copy"><div class="kicker">Athlète KINETIK</div><h1>${esc(p.name||'Mon profil')}</h1><p>${esc(p.experience)}${p.yearsTraining?` · ${p.yearsTraining} an${p.yearsTraining>1?'s':''} de pratique`:''}</p></div>
      <div class="profile-completion"><strong>${completion}%</strong><span>profil complété</span><div><i style="width:${completion}%"></i></div></div>
    </section>

    <section class="profile-hero-grid">
      <article class="profile-goal-premium">
        <div class="kicker">Objectif principal</div><h2>${esc(p.primaryGoal)}</h2>${p.secondaryGoal?`<p>${esc(p.secondaryGoal)}</p>`:''}
        <div class="profile-cycle-line"><span>${esc(cycle.name)}</span><strong>S${cs.week} / ${cs.weekCount}</strong></div>
        <div class="profile-progress-line"><i style="width:${Math.round(Math.min(1,cs.week/cs.weekCount)*100)}%"></i></div>
        ${p.goalHorizon?`<small>Horizon · ${esc(p.goalHorizon)}</small>`:''}
      </article>
      <article class="profile-week-premium">
        <div class="kicker">Rythme personnel</div><div class="profile-week-number"><strong>${p.weeklySessions}</strong><span>séances<br>par semaine</span></div>
        <div class="profile-week-details"><span>${p.preferredDuration} min idéales</span><span>${esc(p.sessionPreference)}</span><span>${esc(p.coachStyle)}</span></div>
      </article>
    </section>

    <section class="profile-stat-line">
      <div><span>7 jours</span><strong>${Math.floor(stats.minutes/60)} h ${String(stats.minutes%60).padStart(2,'0')}</strong><small>entraînement</small></div>
      <div><span>Sessions</span><strong>${stats.sessions}/${p.weeklySessions}</strong><small>réalisées / cible</small></div>
      <div><span>Charge</span><strong>${Math.round(stats.load)}</strong><small>UA activités</small></div>
      ${p.weight?`<div><span>Poids</span><strong>${p.weight}</strong><small>kg${p.targetWeight?` · cible ${p.targetWeight}`:''}</small></div>`:''}
    </section>

    <section class="profile-section-clean"><div class="profile-section-title"><div><div class="kicker">Disponibilités</div><h2>Ma semaine idéale</h2></div><button data-view="week">Voir le planning →</button></div><div class="profile-week-days">${[1,2,3,4,5,6,0].map(d=>`<div class="${(p.trainingDays||[]).includes(d)?'training':'rest'}"><strong>${athleteDayLabel(d).slice(0,3)}</strong><span>${(p.trainingDays||[]).includes(d)?'Entraînement':'Repos'}</span></div>`).join('')}</div></section>

    ${records.length?`<section class="profile-section-clean"><div class="profile-section-title"><div><div class="kicker">Niveau actuel</div><h2>Repères de performance</h2></div><button data-view="progress">Progression →</button></div><div class="profile-records-premium">${records.map(r=>`<div><span>${esc(r.label)}</span><strong>${r.value}<small>${r.unit}</small></strong></div>`).join('')}</div></section>`:''}

    <section class="profile-section-clean"><div class="profile-section-title"><div><div class="kicker">Écosystème sportif</div><h2>${sports.length} sport${sports.length>1?'s':''} suivi${sports.length>1?'s':''}</h2></div></div><div class="profile-sports-premium">${sports.map(s=>`<div><i></i><span>${esc(s)}</span></div>`).join('')}</div><p class="profile-inline-info"><strong>Lieux</strong> ${(p.locations||[]).map(x=>({home:'Maison',outdoor:'Parc / extérieur',gym:'Salle',club:'Club / box'}[x]||x)).join(' · ')||'Non renseigné'}</p></section>

    <section class="profile-section-clean"><div class="profile-section-title"><div><div class="kicker">Setup</div><h2>${equipment.length} équipements disponibles</h2></div></div><div class="profile-equipment-premium">${equipment.slice(0,10).map(x=>`<div>${equipmentVisualIcon(x.label)}<span>${esc(x.label)}</span></div>`).join('')}</div></section>

    <section class="profile-links-premium">
      <button data-view="measurements"><span>${uiIcon('measurements')}</span><div><strong>Mesures corporelles</strong><small>Poids, mensurations et photos</small></div><b>→</b></button>
      <button data-view="skills"><span>${uiIcon('skills')}</span><div><strong>Capacités</strong><small>Skills, performances et rang</small></div><b>→</b></button>
      <button data-view="flexibility"><span>${uiIcon('flex')}</span><div><strong>Mobilité</strong><small>Évaluations, routines et préférences</small></div><b>→</b></button>
      <button data-view="settings"><span>${uiIcon('profile')}</span><div><strong>Réglages KINETIK</strong><small>Coach, écran, données et application</small></div><b>→</b></button>
    </section>`, 'athlete');
}
const ACTIVITY_TYPES=[
  {id:'running',label:'Course',distance:true,metric:'km'},
  {id:'cycling',label:'Vélo',distance:true,metric:'km'},
  {id:'swimming',label:'Piscine',distance:true,metric:'m'},
  {id:'crossfit',label:'CrossFit',distance:false},
  {id:'hyrox',label:'HYROX',distance:false},
  {id:'boxing',label:'Boxe / sports de combat',distance:false},
  {id:'walking',label:'Marche / randonnée',distance:true,metric:'km'},
  {id:'rowing',label:'Rameur',distance:true,metric:'km'},
  {id:'mobility',label:'Mobilité / étirements',distance:false},
  {id:'sport',label:'Autre sport',distance:false}
];
function getActivities(){return parse(STORAGE.activities,[]);}
function setActivities(v){save(STORAGE.activities,v);}
function activityType(id){return ACTIVITY_TYPES.find(x=>x.id===id)||{id,label:id||'Activité',unit:'min'};}
function addActivityLog(type,duration,distance=0,intensity='moderate',note='',rpe=5){
  const rows=getActivities(),mins=Math.max(1,Number(duration)||0),effort=Math.max(1,Math.min(10,Number(rpe)||5));
  rows.unshift({id:String(Date.now()),date:new Date().toISOString(),type,duration:mins,distance:Math.max(0,Number(distance)||0),intensity,note:String(note||''),rpe:effort,load:Math.round(mins*effort)});
  setActivities(rows.slice(0,1500));
}
function activityStats(days=7){
  const cut=Date.now()-days*86400000,manual=getActivities().filter(x=>new Date(x.date).getTime()>=cut);
  const strava=getStravaActivities().filter(a=>new Date(a.start_date||a.start_date_local||0).getTime()>=cut&&isRunActivity(a));
  const rows={};let load=0;
  for(const a of manual){const x=activityType(a.type),mins=Number(a.duration||0);if(!rows[x.label])rows[x.label]={minutes:0,sessions:0,distance:0};rows[x.label].minutes+=mins;rows[x.label].sessions++;rows[x.label].distance+=Number(a.distance||0);load+=Number(a.load||Math.round(mins*(Number(a.rpe)||5)));}
  const runMin=Math.round(strava.reduce((s,a)=>s+Number(a.moving_time||a.elapsed_time||0),0)/60);
  if(runMin){if(!rows['Course Strava'])rows['Course Strava']={minutes:0,sessions:0,distance:0};rows['Course Strava'].minutes+=runMin;rows['Course Strava'].sessions+=strava.length;rows['Course Strava'].distance+=strava.reduce((s,a)=>s+Number(a.distance||0)/1000,0);}
  return {minutes:Object.values(rows).reduce((a,b)=>a+b.minutes,0),sessions:manual.length+strava.length,load,rows,manual};
}
function strengthVolumeStats(days=7){
  const cut=Date.now()-days*86400000,rows=getHistory().filter(h=>new Date(h.date).getTime()>=cut);
  return {minutes:rows.reduce((s,h)=>s+Number(h.durationMinutes||0),0),sessions:rows.length};
}
function totalTrainingStats(days=7){
  const a=activityStats(days),s=strengthVolumeStats(days);
  return {minutes:a.minutes+s.minutes,sessions:a.sessions+s.sessions,load:a.load,strength:s,activities:a};
}
function renderActivityHub(){
  const all=totalTrainingStats(7),m=totalTrainingStats(30),s=all.activities;
  const categories=[['Calisthénie / force',all.strength.minutes],...Object.entries(s.rows).map(([n,v])=>[n,v.minutes])].filter(x=>x[1]>0);
  const max=Math.max(1,...categories.map(x=>x[1]));
  return `<section class="card activity-hub"><div class="section-head"><div><div class="kicker">Charge globale · 7 jours</div><h2>${Math.floor(all.minutes/60)} h ${String(all.minutes%60).padStart(2,'0')} d'entraînement</h2><p class="muted small">${all.sessions} sessions · charge interne ${Math.round(all.load)} UA</p></div></div>
  ${categories.length?`<div class="training-mix">${categories.map(([name,min])=>`<div class="training-mix-row"><div><span>${esc(name)}</span><strong>${Math.round(min)} min</strong></div><div class="training-mix-track"><i style="width:${Math.max(4,Math.round(min/max*100))}%"></i></div></div>`).join('')}</div>`:'<p class="muted small">Tes activités apparaîtront ici pour visualiser la répartition de ton volume.</p>'}
  <div class="activity-month"><span>30 jours</span><strong>${Math.floor(m.minutes/60)} h ${String(m.minutes%60).padStart(2,'0')} · ${m.sessions} sessions</strong></div></section>`;
}
function activityUiIcon(id){
  const icons={running:'↗',cycling:'◇',swimming:'≈',crossfit:'✦',hyrox:'H',walking:'⌁',rowing:'⇆',mobility:'∿',sport:'＋'};
  return icons[id]||'＋';
}
function renderActivityEditor(){
  return shell(`<header class="topbar activity-topbar"><div><div class="brand">Nouvelle activité</div><div class="daylabel">Ajoute une session à ton volume global</div></div></header>
  <section class="activity-editor activity-editor-premium">
    <div class="activity-editor-intro"><div class="activity-editor-symbol" id="activityEditorSymbol">↗</div><div><div class="kicker">Activité</div><h1 id="activityEditorTitle">Course</h1><p>Enregistre l'essentiel. KINETIK calcule automatiquement ta charge.</p></div></div>
    <div class="activity-form-section"><label class="activity-field activity-field-main"><span>Type d'activité</span><select id="activityType">${ACTIVITY_TYPES.map(x=>`<option value="${x.id}">${x.label}</option>`).join('')}</select></label></div>
    <div class="activity-metrics-grid">
      <label class="activity-metric"><span>Durée</span><div><input id="activityDuration" type="number" min="1" step="1" value="30"><b>min</b></div></label>
      <label class="activity-metric" id="activityDistanceWrap"><span>Distance <small>optionnel</small></span><div><input id="activityDistance" type="number" min="0" step=".1" placeholder="0"><b id="activityDistanceUnit">km</b></div></label>
    </div>
    <div class="activity-form-section activity-rpe-section"><div class="activity-rpe-head"><div><span>Effort perçu</span><small>À quel point la séance était exigeante ?</small></div><strong id="activityRpeValue">5</strong></div><input id="activityRpe" class="activity-rpe-slider" type="range" min="1" max="10" step="1" value="5"><div class="activity-rpe-scale"><span>1<br><small>Très facile</small></span><span>5<br><small>Modéré</small></span><span>8<br><small>Difficile</small></span><span>10<br><small>Maximal</small></span></div></div>
    <div class="activity-form-section"><label class="activity-field"><span>Note <small>optionnel</small></span><textarea id="activityNote" rows="3" placeholder="Sensations, contenu de séance, terrain…"></textarea></label></div>
    <div class="activity-load-preview activity-load-premium"><div><span>Charge de la session</span><small>Durée × effort perçu</small></div><strong id="activityLoadPreview">150 <small>UA</small></strong></div>
    <div class="activity-editor-actions"><button type="button" class="btn activity-cancel" id="cancelActivity">Annuler</button><button type="button" class="btn activity-save" id="saveActivity">Enregistrer l'activité</button></div>
  </section>`,'today');
}
function renderTodayUsefulActions(){
  const x=progressWeekStats(),rank=getRankState(),next=rank.next;
  const count=(x.recs?.length||0)+(x.due?.overdue?1:0)+(next?1:0);
  return `<section class="card today-actions-card"><div class="section-head"><div><div class="kicker">À surveiller</div><h2>Prochaines actions utiles</h2></div><span class="pill">${count}</span></div><div class="progress-watch-list">${x.recs?.length?`<button class="progress-watch-item today-progress-link" data-today-progress="performance"><span class="progress-watch-icon">↗</span><div><strong>${x.recs.length} progression${x.recs.length>1?'s':''} disponible${x.recs.length>1?'s':''}</strong><small>${x.recs.slice(0,2).map(r=>`${r.current.name} → ${r.next.name}`).join(' · ')}</small></div><b>Voir →</b></button>`:''}<button class="progress-watch-item today-progress-link" data-today-progress="performance"><span class="progress-watch-icon">◷</span><div><strong>Tests périodiques</strong><small>${x.due.label}</small></div><b>Ouvrir →</b></button>${next?`<button class="progress-watch-item rank-${rank.current.id}" data-view="skills"><span class="progress-watch-icon">◆</span><div><strong>${rank.current.name} → ${next.name}</strong><small>${rankProgressText(next,rank.nextEval)}</small></div><b>Rangs →</b></button>`:''}</div></section>`;
}

function equipmentVisualIcon(name){
  const n=String(name||'').toLowerCase();
  const svg=body=>`<svg viewBox="0 0 24 24" focusable="false">${body}</svg>`;
  if(/power tower|tour|barre haute/.test(n))return svg('<path d="M5 21V4m14 17V4M5 5h14M8 5v4m8-4v4M3 21h5m8 0h5"/>');
  if(/parall/.test(n))return svg('<path d="M5 7v14m14-14v14M3 7h7m4 0h7M3 21h5m8 0h5"/>');
  if(/poignée/.test(n))return svg('<path d="M4 18h6m4 0h6M7 18v-6c0-2 1-3 3-3h4c2 0 3 1 3 3v6"/>');
  if(/bande|élast/.test(n))return svg('<path d="M7 5c-4 3-4 11 0 14 2 2 4 0 5-3l2-8c1-3 3-5 5-3 3 3 2 11-2 14"/>');
  if(/tapis/.test(n))return svg('<path d="M5 7h12a3 3 0 0 1 0 6H7a3 3 0 0 0 0 6h12M5 7v12"/>');
  if(/ancrage|support/.test(n))return svg('<path d="M12 3v12m-5-7 5-5 5 5M5 21h14M8 15h8v6"/>');
  if(/sac|charge|lest/.test(n))return svg('<path d="M8 8h8l2 13H6L8 8Zm2 0V5h4v3"/>');
  return svg('<circle cx="12" cy="12" r="7"/><path d="M12 8v8M8 12h8"/>');
}
function renderToday() {
  const day=todayDay(),w=preparedWorkout(day),history=getHistory(),seven=Date.now()-7*86400000;
  const recent=history.filter(h=>new Date(h.date).getTime()>=seven),weeklyMinutes=recent.reduce((a,h)=>a+(h.durationMinutes||0),0);
  const rank=getRankState(),warning=dailyQuickLoadWarning(),todayEquipment=[...new Set((w.exercises||[]).flatMap(e=>equipmentForExercise(e.name)))];
  const baseToday=workoutTemplateForDay(day),activeCycle=getActiveTrainingCycle();
  const hero=!w.exercises.length?`<section class="card hero rest-banner"><div class="kicker">Aujourd'hui · ${DAY_NAMES[day]} · ${esc(activeCycle.name)}</div><h1>Repos planifié</h1><p class="muted">Récupération complète. Marche tranquille ou mobilité douce si tu en as envie.</p></section>`:`<section class="card hero"><div class="kicker">Aujourd'hui · ${DAY_NAMES[day]}</div><h1>${w.name}</h1><p class="muted">${w.subtitle}</p><div class="meta"><span class="pill">Complète ≈ ${w.duration} min</span><span class="pill">Express ≈ ${baseToday.shortDuration||Math.max(20,Math.round((baseToday.duration||45)*.48))} min</span></div>${todayEquipment.length?`<div class="today-equipment today-equipment-visual"><strong>Matériel prévu</strong><div class="today-equipment-grid">${todayEquipment.map(x=>`<div class="today-equipment-item"><span class="today-equipment-icon" aria-hidden="true">${equipmentVisualIcon(x)}</span><span>${esc(x)}</span></div>`).join('')}</div></div>`:''}<button class="btn btn-primary" id="startWorkout" data-day="${day}">Choisir le format</button></section>`;
  const program=w.exercises.length?`<details class="card today-details"><summary><div><div class="kicker">Séance complète</div><strong>Voir les ${w.exercises.length} étapes</strong></div><span>⌄</span></summary><div class="exercise-list">${w.exercises.map((e,i)=>`<div class="exercise-row exercise-row-visual">${exerciseImage(e.name,'mini')}<div class="num">${i+1}</div><div class="grow"><div class="exercise-name">${e.name}</div><div class="exercise-detail">${describe(e)} · ${phaseLabel(e.phase)}</div></div></div>`).join('')}</div></details>`:'';
  return shell(`<header class="topbar"><div><div class="brand">KINETIK</div><div class="daylabel">✓ Sauvegarde locale active</div></div></header>${renderPRNotice()}${hero}
    <section class="today-cockpit today-primary-actions today-primary-shortcuts">
      <button class="cockpit-card rank-cockpit rank-${rank.current.id}" data-view="skills"><span>${uiIcon('award')}</span><strong>${rank.displayName||rank.current.name}</strong><small>${rank.next?`${Math.round(rank.readiness*100)}% vers ${rank.next.name}`:'Rang maximal'}</small></button>
    </section>
    ${program}${renderTodayMobilityPrompt()}${renderActivityHub()}${renderDailyVolumeCard()}${renderTodayUsefulActions()}`, 'today');
}
function renderWeekExercise(e, i) {
  const rest = e.rest > 0 ? ` · repos ${fmtTime(e.rest)}` : '';
  const status = e.prescriptionStatus === 'progress'
    ? '<span class="microbadge good">progression</span>'
    : e.prescriptionStatus === 'recover'
      ? '<span class="microbadge warn">allégé</span>'
      : '';
  return `<div class="week-exercise-row">
    ${exerciseImage(e.name,'mini')}
    <div class="num">${i+1}</div>
    <div class="grow">
      <div class="exercise-name">${e.name}</div>
      <div class="exercise-detail">${describe(e)}${rest}</div>
      ${e.tip ? `<div class="week-exercise-tip">${e.tip}</div>` : ''}
      <div class="exercise-tools"><span class="microbadge phase-${e.phase||'main'}">${phaseLabel(e.phase)}</span>${status}${tutorialLink(e.name,true)}</div>
    </div>
  </div>`;
}

function renderPlanningTabs(active='calendar'){
  return `<div class="planning-tabs" role="tablist" aria-label="Planning">
    <button type="button" class="${active==='calendar'?'active':''}" data-view="week">Calendrier</button>
    <button type="button" class="${active==='programs'?'active':''}" data-view="custom">Programmes</button>
  </div>`;
}
function renderWeek() {
  const order = [1,2,3,4,5,6,0];
  const dayNow = todayDay();
  const audit=programAudit();
  const activeCycle=getActiveTrainingCycle();
  return shell(`<header class="topbar"><div><div class="brand">Planning</div><div class="daylabel">${esc(activeCycle.name)} · séances, activités et récupération</div></div></header>
    ${renderPlanningTabs('calendar')}
    <div class="week-heatmap">${renderCycleHeatmap(16)}</div>
    <section class="week-list">${order.map(day=>{
      const w=preparedWorkout(day), isToday=day===dayNow, expanded=state.expandedWeekDay===day;
      const details = w.exercises.length
        ? `<div class="week-details ${expanded?'open':''}" ${expanded?'':'hidden'}>
            <div class="week-details-head"><strong>${w.exercises.length} étapes</strong><span class="muted small">Objectifs adaptés à ta progression actuelle</span></div>
            <div class="week-exercise-list">${w.exercises.map(renderWeekExercise).join('')}</div>
            <button class="btn btn-primary start-day week-start" data-day="${day}">Commencer cette séance</button>
          </div>`
        : `<div class="week-details ${expanded?'open':''}" ${expanded?'':'hidden'}><p class="muted week-rest-copy">Repos complet. Marche tranquille ou mobilité douce uniquement si tu en as envie.</p></div>`;
      const cardioMin=Math.round(cardioTargetSeconds(w)/60);
      const dayShort=DAY_NAMES[day].slice(0,3).toUpperCase();
      return `<article class="card week-card week-card-pro ${isToday?'today-card':''} ${expanded?'expanded':''}" data-week-day="${day}">
        <button class="week-summary week-toggle" data-day="${day}" aria-expanded="${expanded}">
          <div class="week-daymark"><span>${dayShort}</span>${isToday?'<i aria-label="Aujourd’hui"></i>':''}</div>
          <div class="week-main">
            <div class="week-titleline"><h2>${w.name}</h2>${isToday?'<span class="week-today-label">Aujourd’hui</span>':''}</div>
            <p class="week-subtitle">${w.subtitle}</p>
            <div class="week-inline-meta">${w.exercises.length?`<span>${w.duration} min</span><span>Express ${workoutTemplateForDay(day).shortDuration||Math.max(20,Math.round((workoutTemplateForDay(day).duration||45)*.48))}</span>${cardioMin?`<span>Cardio ${cardioMin}</span>`:''}<span>Mobilité ${recommendedFlexRoutine(day).duration} min</span>`:`<span>Repos complet</span><span>Mobilité recovery ${recommendedFlexRoutine(day).duration} min</span>`}</div>
          </div>
          <span class="week-chevron" aria-hidden="true">⌄</span>
        </button>
        ${w.exercises.length?`<div class="week-card-actions"><button class="week-quick-start start-day" data-day="${day}"><span>Démarrer</span><b>→</b></button></div>`:''}
        ${details}
      </article>`;
    }).join('')}</section>`, "week");
}

function flexRoutineById(id){return FLEX_ROUTINES.find(r=>r.id===id);}
function flexZoneMap(name){return FLEX_EXERCISE_ZONES[name]||{};}
function flexEntryMinutes(entry){
  const v=Math.max(0,Number(entry.value??entry.target??0)),sets=Math.max(1,Number(entry.sets||1)),type=entry.type||'hold';
  // Pour comparer des routines hétérogènes : holds/timers = durée réelle ; mouvements dynamiques = 3 s/repetition.
  let sec=0;if(type==='hold_side')sec=v*2*sets;else if(type==='hold'||type==='timer')sec=v*sets;else if(type==='reps_side')sec=v*2*3*sets;else if(type?.startsWith('reps'))sec=v*3*sets;return sec/60;
}
function addFlexEntryDose(out,entry,sessionKey=null){const map=flexZoneMap(entry.exercise||entry.name);if(!Object.keys(map).length)return;const min=flexEntryMinutes(entry);Object.entries(map).forEach(([z,w])=>{if(!out[z])out[z]={minutes:0,sessions:new Set()};out[z].minutes+=min*Number(w);if(sessionKey)out[z].sessions.add(sessionKey);});}
function weeklyFlexBalance(){
  const start=mondayDate(new Date()).getTime(),zones=Object.fromEntries(FLEX_ZONES.map(z=>[z,{minutes:0,sessions:new Set()}]));let dedicatedMinutes=0,dedicatedSessions=0;
  getFlexLogs().filter(s=>new Date(s.date).getTime()>=start).forEach(s=>{dedicatedMinutes+=Number(s.durationMinutes||0);dedicatedSessions++;(s.entries||[]).forEach(e=>addFlexEntryDose(zones,e,`flex:${s.id}`));});
  // Une activité mobilité enregistrée depuis le journal cardio/multisport compte comme séance dédiée.
  // Sans détail d'exercices elle contribue au volume global, mais pas artificiellement à une zone précise.
  getActivities().filter(s=>s.type==='mobility'&&new Date(s.date).getTime()>=start).forEach(s=>{dedicatedMinutes+=Number(s.duration||0);dedicatedSessions++;});
  // Les étirements réellement terminés dans les séances de force comptent aussi dans la dose de mobilité.
  getHistory().filter(s=>new Date(s.date).getTime()>=start).forEach(s=>(s.entries||[]).forEach(e=>addFlexEntryDose(zones,e,`workout:${s.id}`)));
  return {zones,dedicatedMinutes,dedicatedSessions};
}
function flexZoneStatus(row,target){if(row.minutes<target.min||row.sessions.size<target.sessions)return {label:'À compléter',cls:'warn'};if(row.minutes>target.max*1.35)return {label:'Dose haute',cls:'high'};return {label:'Cible atteinte',cls:'good'};}
function renderFlexBalance(){
  const cfg=getFlexConfig(),b=weeklyFlexBalance(),hit=FLEX_ZONES.filter(z=>{const r=b.zones[z],t=cfg.zoneTargets[z];return r.minutes>=t.min&&r.sessions.size>=t.sessions;}).length;
  return `<section class="card flex-balance-card"><div class="section-head"><div><div class="kicker">Équilibre flexibilité · 7 jours</div><h2>${hit}/${FLEX_ZONES.length} zones dans la cible</h2></div><span class="pill">paramétrique</span></div><div class="flex-balance-hero"><div><strong>${b.dedicatedMinutes}</strong><span>min Flex dédiées</span></div><div><strong>${b.dedicatedSessions}</strong><span>routines · cible ${cfg.sessionsTarget}</span></div><div><strong>${cfg.weeklyMinutesTarget}</strong><span>min cible</span></div></div><p class="muted small">Les retours au calme de tes entraînements sont aussi comptés par zone. Les « minutes d'exposition » convertissent les répétitions dynamiques à ~3 s/repetition uniquement pour comparer les doses.</p><div class="flex-zone-list">${FLEX_ZONES.map(z=>{const r=b.zones[z],t=cfg.zoneTargets[z],st=flexZoneStatus(r,t),pct=clamp(r.minutes/Math.max(1,t.max),0,1.25)*100;return `<div class="flex-zone-row"><div class="param-volume-head"><div><strong>${z}</strong><span>${r.minutes.toFixed(1)} min · ${r.sessions.size} séance${r.sessions.size>1?'s':''} · cible ${t.min}–${t.max} min / ${t.sessions}+ séances</span></div><span class="target-state ${st.cls}">${st.label}</span></div><div class="volume-track target-track"><i style="width:${Math.min(100,pct)}%"></i><em style="left:${Math.min(100,t.min/Math.max(1,t.max)*100)}%"></em></div></div>`}).join('')}</div></section>`;
}
function mobilityGoalState(def,value,cfg){const goal=cfg.testTargets[def.id];if(value==null)return {label:'À mesurer',cls:''};const done=Number(value)>=Number(goal);return {label:done?'Objectif atteint':`Objectif ${goal} ${def.unit}`,cls:done?'good':'warn'};}
/* v10.128 cleanup: ancienne définition de renderFlexResearch supprimée ; seule la version canonique est conservée. */
function renderFlexSettings(){
  const cfg=getFlexConfig();return `<details class="card parameter-details flex-settings"><summary><div><div class="kicker">Réglages</div><strong>Préférences mobilité</strong><small>Dosage, intensité et repères avancés</small></div><span>⌄</span></summary><div class="parameter-body"><div class="parameter-grid"><label><span>Mobilité dédiée / semaine (min)</span><input class="mini-input" id="flexWeeklyMinutes" type="number" min="0" step="5" value="${cfg.weeklyMinutesTarget}"></label><label><span>Routines / semaine</span><input class="mini-input" id="flexSessionsTarget" type="number" min="0" max="7" value="${cfg.sessionsTarget}"></label><label><span>Tension min /10</span><input class="mini-input" id="flexIntensityMin" type="number" min="0" max="10" value="${cfg.intensityMin}"></label><label><span>Tension max /10</span><input class="mini-input" id="flexIntensityMax" type="number" min="0" max="10" value="${cfg.intensityMax}"></label></div><h3>Cibles par zone</h3><div class="target-editor-list">${FLEX_ZONES.map(z=>{const t=cfg.zoneTargets[z];return `<div class="target-editor-row flex-target-row"><strong>${z}</strong><label><span>Min</span><input class="mini-input flex-zone-input" data-zone="${z}" data-bound="min" type="number" min="0" step="0.5" value="${t.min}"></label><label><span>Max</span><input class="mini-input flex-zone-input" data-zone="${z}" data-bound="max" type="number" min="0" step="0.5" value="${t.max}"></label><label><span>Séances</span><input class="mini-input flex-zone-input" data-zone="${z}" data-bound="sessions" type="number" min="0" max="7" value="${t.sessions}"></label></div>`}).join('')}</div><h3>Objectifs de tests</h3><div class="parameter-grid">${MOBILITY_TESTS.map(t=>`<label><span>${t.name}</span><input class="mini-input flex-test-target" data-test-target="${t.id}" type="number" step="${t.step}" value="${cfg.testTargets[t.id]}"></label>`).join('')}<label><span>Écart cheville max (cm)</span><input class="mini-input" id="ankleSymmetryMax" type="number" min="0" step="0.1" value="${cfg.ankleSymmetryMax}"></label></div><div class="parameter-actions"><button class="btn btn-primary" id="saveFlexConfig">Enregistrer</button><button class="btn btn-outline" id="resetFlexConfig">Valeurs par défaut</button></div></div></details>`;
}
function saveFlexConfigFromDom(){
  const cfg=getFlexConfig();cfg.weeklyMinutesTarget=Math.max(0,Number(document.getElementById('flexWeeklyMinutes')?.value||cfg.weeklyMinutesTarget));cfg.sessionsTarget=clamp(Number(document.getElementById('flexSessionsTarget')?.value||cfg.sessionsTarget),0,7);cfg.intensityMin=clamp(Number(document.getElementById('flexIntensityMin')?.value||cfg.intensityMin),0,10);cfg.intensityMax=clamp(Number(document.getElementById('flexIntensityMax')?.value||cfg.intensityMax),cfg.intensityMin,10);cfg.ankleSymmetryMax=Math.max(0,Number(document.getElementById('ankleSymmetryMax')?.value||cfg.ankleSymmetryMax));document.querySelectorAll('.flex-zone-input').forEach(el=>{const z=el.dataset.zone,b=el.dataset.bound;if(cfg.zoneTargets[z])cfg.zoneTargets[z][b]=Math.max(0,Number(el.value||0));});FLEX_ZONES.forEach(z=>{if(cfg.zoneTargets[z].max<cfg.zoneTargets[z].min)cfg.zoneTargets[z].max=cfg.zoneTargets[z].min;cfg.zoneTargets[z].sessions=clamp(cfg.zoneTargets[z].sessions,0,7);});document.querySelectorAll('.flex-test-target').forEach(el=>{if(el.dataset.testTarget in cfg.testTargets)cfg.testTargets[el.dataset.testTarget]=Number(el.value||0);});setFlexConfig(cfg);state.quickToast='Cibles Flex enregistrées';render();
}

function startFlexRoutine(id){
  const routine=clone(flexRoutineById(id)); if(!routine)return;
  state.active={kind:"flexibility",day:"flex",workout:routine,startedAt:Date.now(),exerciseIndex:0,setIndex:0,phase:"work",entries:[],currentValue:routine.exercises[0].target,currentBand:"Aucune",timerRemaining:null,timerRunning:false,reviewComfort:3,reviewDiscomfort:false,reviewNote:""};
  render();
}
function latestMobilityValue(id){const arr=getMobilityTests().filter(x=>x.testId===id).sort((a,b)=>new Date(b.date)-new Date(a.date));return arr[0]?Number(arr[0].value):null;}
function bestMobilityValue(id){const vals=getMobilityTests().filter(x=>x.testId===id).map(x=>Number(x.value)).filter(Number.isFinite);return vals.length?Math.max(...vals):null;}
function renderFlexExercise(e,i){return `<div class="week-exercise-row">${exerciseImage(e.name,'mini')}<div class="num">${i+1}</div><div class="grow"><div class="exercise-name">${e.name}</div><div class="exercise-detail">${describe(e)}${e.rest?` · repos ${fmtTime(e.rest)}`:''}</div><div class="exercise-tools">${tutorialLink(e.name,true)}</div></div></div>`;}
const MOBILITY_ZONES = [
  {id:'ankles',label:'Chevilles',tests:['ankle_left','ankle_right'],routine:'lower-18',impact:['Pistol squat','Squat','Course']},
  {id:'hips',label:'Hanches',tests:['hip_ir_left','hip_ir_right','deep_squat'],routine:'lower-18',impact:['Pistol squat','Squat','L-sit']},
  {id:'posterior',label:'Chaîne postérieure',tests:['forward_fold'],routine:'lower-18',impact:['L-sit','Pike','Compression']},
  {id:'shoulders',label:'Épaules',tests:['shoulder_flex_left','shoulder_flex_right'],routine:'upper-15',impact:['Handstand','HSPU','Muscle-up']},
  {id:'thorax',label:'Thorax',tests:['thoracic_rotation_left','thoracic_rotation_right'],routine:'upper-15',impact:['Handstand','Muscle-up','Boxe']},
  {id:'wrists',label:'Poignets',tests:['wrist_extension_left','wrist_extension_right'],routine:'upper-15',impact:['Handstand','HSPU','Pompes']}
];
function mobilityTestScore(def,value){
  if(value==null||!Number.isFinite(Number(value)))return null;
  const v=Number(value),target=Number(getFlexConfig().testTargets?.[def.id]??def.target??1);
  if(def.id==='forward_fold')return Math.round(clamp((v+20)/20,0,1)*100);
  return Math.round(clamp(v/Math.max(.1,target),0,1)*100);
}
function mobilityZoneProfile(zone){
  const defs=zone.tests.map(id=>MOBILITY_TESTS.find(t=>t.id===id)).filter(Boolean);
  const scoredDefs=defs.filter(d=>d.score!==false);
  const rows=scoredDefs.map(def=>({def,value:latestMobilityValue(def.id)}));
  const scored=rows.map(x=>({...x,score:mobilityTestScore(x.def,x.value)})).filter(x=>x.score!=null);
  const functional=defs.filter(d=>d.score===false).map(def=>({def,value:latestMobilityValue(def.id)}));
  if(!scored.length)return {...zone,score:null,assessed:false,complete:false,asymmetry:null,asymmetryUnit:null,latest:null,functional};
  let score=scored.reduce((s,x)=>s+x.score,0)/scored.length;
  const sides=scored.filter(x=>x.def.side);
  let asymmetry=null,asymmetryUnit=null;
  if(sides.length>=2){
    const a=sides[0],b=sides[1],target=Math.max(1,Number(a.def.target||1));
    asymmetry=Math.abs(Number(a.value)-Number(b.value));asymmetryUnit=a.def.unit;
    score-=Math.min(15,(asymmetry/target)*45);
  }
  const complete=scored.length===scoredDefs.length;
  const latestDate=getMobilityTests().filter(x=>defs.some(d=>d.id===x.testId)).map(x=>new Date(x.date).getTime()).filter(Number.isFinite);
  return {...zone,score:Math.round(clamp(score,0,100)),assessed:true,complete,asymmetry,asymmetryUnit,latest:latestDate.length?new Date(Math.max(...latestDate)):null,functional};
}
function mobilityProfiles(){return MOBILITY_ZONES.map(mobilityZoneProfile);}
function mobilityGoalWeights(){
  const p=typeof getAthleteProfile==='function'?getAthleteProfile():{},text=`${p.primaryGoal||''} ${p.secondaryGoal||''}`.toLowerCase();
  const weights={ankles:0,hips:0,posterior:0,shoulders:0,thorax:0,wrists:0};
  const add=(ids,n)=>ids.forEach(id=>weights[id]+=n);
  if(/handstand|hspu/.test(text))add(['wrists','shoulders','thorax'],3);
  if(/muscle.?up/.test(text))add(['shoulders','thorax'],3);
  if(/pistol|squat/.test(text))add(['ankles','hips'],3);
  if(/l.?sit|compression/.test(text))add(['posterior','hips','wrists'],2);
  if(/front lever/.test(text))add(['shoulders','thorax'],2);
  if(/human flag/.test(text))add(['shoulders','thorax'],2);
  if(/boxe|boxing/.test(text))add(['thorax','hips','ankles'],2);
  return weights;
}
function mobilityContextWeights(day=todayDay()){
  const weights={...mobilityGoalWeights()};
  let w=null;try{w=workoutTemplateForDay(day);}catch(e){}
  const text=`${w?.name||''} ${w?.subtitle||''} ${(w?.exercises||[]).map(e=>e.name).join(' ')}`.toLowerCase();
  const add=(ids,n)=>ids.forEach(id=>weights[id]=(weights[id]||0)+n);
  if(/handstand|hspu|pike/.test(text))add(['wrists','shoulders','thorax'],1.5);
  if(/muscle.?up|traction|pull|front lever/.test(text))add(['shoulders','thorax'],1);
  if(/squat|pistol|fente|jamb|leg/.test(text))add(['ankles','hips','posterior'],1);
  if(/l.?sit|compression|ischio/.test(text))add(['posterior','hips'],1);
  return weights;
}
function mobilityPriority(day=todayDay()){
  const profiles=mobilityProfiles(),weights=mobilityContextWeights(day),balance=weeklyFlexBalance();
  const assessed=profiles.filter(p=>p.assessed);
  const maxGoal=Math.max(0,...Object.values(weights));
  if(!assessed.length&&maxGoal<=0)return {id:null,label:'À évaluer',assessed:false,complete:false,score:null,routine:'reset-10',impact:[],priorityScore:0,reason:'assessment'};
  const zoneDose={ankles:balance.zones['Chevilles']?.minutes||0,hips:(balance.zones['Hanches']?.minutes||0)+(balance.zones['Fléchisseurs hanche']?.minutes||0),posterior:balance.zones['Ischios']?.minutes||0,shoulders:balance.zones['Épaules']?.minutes||0,thorax:balance.zones['Thorax']?.minutes||0,wrists:balance.zones['Poignets']?.minutes||0};
  const ranked=profiles.map(p=>{
    const need=p.assessed?(100-p.score):(maxGoal>0?32:0);
    const goal=(weights[p.id]||0)*11;
    const recentPenalty=Math.min(18,zoneDose[p.id]*2.5);
    const incompleteBonus=p.assessed&&!p.complete?8:0;
    return {...p,priorityScore:need+goal+incompleteBonus-recentPenalty,goalWeight:weights[p.id]||0,recentDose:zoneDose[p.id],reason:p.assessed?'measure':goal>0?'goal':'assessment'};
  }).filter(p=>p.assessed||p.goalWeight>0).sort((a,b)=>b.priorityScore-a.priorityScore);
  return ranked[0]||{id:null,label:'À évaluer',assessed:false,complete:false,score:null,routine:'reset-10',impact:[],priorityScore:0,reason:'assessment'};
}
function mobilityObjectiveImpact(zone){
  const p=typeof getAthleteProfile==='function'?getAthleteProfile():{},goal=p.primaryGoal||'tes objectifs';
  const relevant=mobilityGoalWeights()[zone.id]>0;
  return relevant?`Cette zone influence directement ton objectif « ${esc(goal)} ».`:`Cette zone contribue à la qualité générale du mouvement.`;
}
function targetedFlexRoutine(day=todayDay()){
  const p=mobilityPriority(day);
  return flexRoutineById(p?.id?p.routine:'reset-10');
}
function recommendedFlexRoutine(day=todayDay()){
  const p=mobilityPriority(day),profile=typeof getAthleteProfile==='function'?getAthleteProfile():{},isRest=(profile.restDays||[]).includes(day)||!(preparedWorkout(day)?.exercises||[]).length;
  if(isRest||!p?.id)return flexRoutineById("reset-10");
  return flexRoutineById(p.routine||"reset-10");
}
function mobilityRoutineMode(day=todayDay()){
  const profile=typeof getAthleteProfile==='function'?getAthleteProfile():{},isRest=(profile.restDays||[]).includes(day)||!(preparedWorkout(day)?.exercises||[]).length;
  return isRest?'Recovery':'Progression';
}
function mobilityZoneSeries(zoneId){
  const zone=MOBILITY_ZONES.find(z=>z.id===zoneId)||MOBILITY_ZONES[0],defs=zone.tests.map(id=>MOBILITY_TESTS.find(t=>t.id===id)).filter(Boolean);
  return defs.map(def=>{
    const pts=getMobilityTests().filter(x=>x.testId===def.id).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(-16).map(x=>({date:x.date,value:Number(x.value)})).filter(x=>Number.isFinite(x.value));
    return {def,pts};
  }).filter(x=>x.pts.length);
}
function renderMobilityChart(zoneId){
  const zone=MOBILITY_ZONES.find(z=>z.id===zoneId)||MOBILITY_ZONES[0],series=mobilityZoneSeries(zone.id);
  if(!series.length)return `<div class="mob-chart-empty"><strong>${zone.label}</strong><span>Aucune mesure enregistrée. Lance une évaluation pour créer ta première référence.</span></div>`;
  const compatible=series.filter(s=>s.def.unit===series[0].def.unit),all=compatible.flatMap(s=>s.pts.map(p=>p.value)),unit=compatible[0].def.unit;
  if(!all.length)return'';
  const w=760,h=230,L=20,R=740,T=18,B=192,min=Math.min(...all),max=Math.max(...all),pad=Math.max((max-min)*.2,unit==='°'?3:.5),lo=min-pad,hi=max+pad,range=Math.max(.1,hi-lo);
  const allDates=compatible.flatMap(s=>s.pts.map(p=>new Date(p.date).getTime())),d0=Math.min(...allDates),d1=Math.max(...allDates),span=Math.max(1,d1-d0);
  const path=s=>s.pts.map(p=>{const x=L+((new Date(p.date).getTime()-d0)/span)*(R-L),y=T+(1-(p.value-lo)/range)*(B-T);return `${x},${y}`}).join(' ');
  const firstDate=new Date(d0),lastDate=new Date(d1);
  return `<div class="mob-chart"><div class="mob-chart-head"><div><span>${zone.label}</span><strong>${all[all.length-1]} ${unit}</strong></div><span>${compatible.length>1?'Gauche / Droite':'Évolution'}</span></div><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><line x1="${L}" y1="${T+(B-T)*.33}" x2="${R}" y2="${T+(B-T)*.33}" class="mob-grid"/><line x1="${L}" y1="${T+(B-T)*.66}" x2="${R}" y2="${T+(B-T)*.66}" class="mob-grid"/>${compatible.map((s,i)=>`<polyline points="${path(s)}" class="mob-line ${i?'secondary':''}" vector-effect="non-scaling-stroke"/>`).join('')}</svg><div class="mob-axis"><span>${formatShortDate(firstDate)}</span><span>${formatShortDate(lastDate)}</span></div>${compatible.length>1?`<div class="mob-legend">${compatible.map((s,i)=>`<span class="${i?'secondary':''}"><i></i>${s.def.side||s.def.short}</span>`).join('')}</div>`:''}</div>`;
}
function renderMobilityAssessment(){
  const grouped=MOBILITY_ZONES.map(zone=>({zone,defs:zone.tests.map(id=>MOBILITY_TESTS.find(t=>t.id===id)).filter(Boolean)}));
  return `<details class="mob-lower-section"><summary><div><div class="kicker">Évaluation</div><strong>Mesurer ma mobilité</strong></div><span>⌄</span></summary><div class="mob-lower-content"><p class="muted small">Mesure toujours dans des conditions comparables. Une valeur fonctionnelle est plus utile qu'une amplitude forcée.</p>${grouped.map(({zone,defs})=>`<details class="mob-test-group"><summary><strong>${zone.label}</strong><span>${defs.filter(d=>latestMobilityValue(d.id)!=null).length}/${defs.length} mesurés</span></summary><div>${defs.map(d=>{const latest=latestMobilityValue(d.id);return `<div class="mob-test-row"><div><strong>${d.name}</strong><small>${d.note}</small></div><div class="mob-test-current">${latest==null?'—':latest+' '+d.unit}</div><div class="mobility-entry"><input id="mob_${d.id}" type="number" inputmode="decimal" min="${d.min}" step="${d.step}" placeholder="${d.unit}"><button class="btn btn-secondary compact save-mobility" data-test="${d.id}">OK</button></div></div>`}).join('')}</div></details>`).join('')}</div></details>`;
}
function renderMobilityProfile(){
  const profiles=mobilityProfiles();
  return `<section class="mob-profile"><div class="mob-section-head"><div><div class="kicker">Ton profil</div><h2>Mobilité fonctionnelle</h2></div><p>Le score reflète la distance à une amplitude fonctionnelle, pas un niveau athlétique absolu.</p></div><div class="mob-profile-bars">${profiles.map(p=>`<div class="${p.assessed?'':'unassessed'}"><div><strong>${p.label}</strong><small>${p.assessed?(p.asymmetry!=null?`asymétrie ${p.asymmetry.toFixed(1)} ${p.asymmetryUnit||''}`:(p.complete?'mesuré':'évaluation partielle')):'à évaluer'}</small></div><div class="mob-track"><i style="width:${p.assessed?p.score:0}%"></i></div><b>${p.assessed?p.score:'—'}</b></div>`).join('')}</div></section>`;
}
function renderTodayMobilityPrompt(){
  const p=mobilityPriority(),r=recommendedFlexRoutine(),mode=mobilityRoutineMode();
  if(!p?.id)return `<section class="today-mobility"><div><span>${uiIcon('flex')}</span><div><strong>Mobilité · profil à évaluer</strong><small>Quelques tests suffisent pour personnaliser les routines.</small></div></div><button class="btn btn-outline compact" data-view="flexibility">Évaluer</button></section>`;
  const stateText=p.assessed?`Priorité ${p.label} · ${p.complete?p.score+'/100':'évaluation partielle'}`:`À évaluer pour ${p.label.toLowerCase()}`;
  return `<section class="today-mobility"><div><span>${uiIcon('flex')}</span><div><strong>${mode} mobilité · ${r.duration} min</strong><small>${stateText}</small></div></div><button class="btn btn-outline compact" data-view="flexibility">Voir</button></section>`;
}
function renderMobilityProgressSummary(){
  const profiles=mobilityProfiles().filter(x=>x.assessed),p=mobilityPriority();
  if(!profiles.length)return `<section class="progress-mobility-summary"><div><div class="kicker">Mobilité</div><h3>Pas encore évaluée</h3><p>Crée des références pour suivre l'amplitude et les asymétries.</p></div><button class="btn btn-outline compact" data-view="flexibility">Évaluer</button></section>`;
  const avg=Math.round(profiles.reduce((s,x)=>s+x.score,0)/profiles.length);
  return `<section class="progress-mobility-summary"><div><div class="kicker">Mobilité</div><h3>${avg}/100 · ${profiles.length}/${MOBILITY_ZONES.length} zones évaluées</h3><p>Priorité actuelle : ${p.label}${p.assessed?` · ${p.score}/100`:''}</p></div><button class="btn btn-outline compact" data-view="flexibility">Voir</button></section>`;
}
function renderFlexResearch(){
  return `<details class="mob-lower-section"><summary><div><div class="kicker">Méthodologie</div><strong>Comment KINETIK pilote la mobilité</strong></div><span>⌄</span></summary><div class="mob-lower-content flex-research-body"><div class="research-rule"><b>1</b><p><strong>Amplitude mesurée :</strong> les tests sont prioritaires sur le simple temps d'étirement.</p></div><div class="research-rule"><b>2</b><p><strong>Contexte sportif :</strong> les zones liées à ton objectif principal reçoivent davantage de priorité.</p></div><div class="research-rule"><b>3</b><p><strong>Charge récente :</strong> une zone déjà beaucoup travaillée cette semaine est temporairement moins prioritaire.</p></div><div class="research-rule"><b>4</b><p><strong>Intensité :</strong> recherche une tension tolérable ${getFlexConfig().intensityMin}–${getFlexConfig().intensityMax}/10, jamais une douleur vive.</p></div></div></details>`;
}
function renderFlexibility(){
  const logs=getFlexLogs(),cfg=getFlexConfig(),recommended=recommendedFlexRoutine(),targeted=targetedFlexRoutine(),priority=mobilityPriority(),profiles=mobilityProfiles(),assessed=profiles.filter(x=>x.assessed),weak=assessed.slice().sort((a,b)=>a.score-b.score)[0],strong=assessed.slice().sort((a,b)=>b.score-a.score)[0],mode=mobilityRoutineMode(),chartZone=state.mobilityChartZone||priority?.id||'ankles';
  const goal=typeof getAthleteProfile==='function'?getAthleteProfile().primaryGoal||'Progression générale':'Progression générale';
  return shell(`<header class="topbar mobility-topbar"><div><div class="brand">Mobilité</div><div class="daylabel">Amplitude · contrôle · souplesse</div></div></header>
    <section class="mob-status-line">
      <div><span>Zones évaluées</span><strong>${assessed.length}/${MOBILITY_ZONES.length}</strong></div>
      <div><span>Priorité</span><strong>${priority?.id?priority.label:'À évaluer'}</strong></div>
      <div><span>Plus forte</span><strong>${strong?.label||'—'}</strong></div>
      <div><span>Objectif lié</span><strong>${esc(goal)}</strong></div>
    </section>

    <section class="mob-today">
      <div class="mob-today-copy"><div class="kicker">Aujourd'hui · ${priority?.id?mode:'Point de départ'}</div><h1>${priority?.id?recommended.name:'Évalue ta mobilité'}</h1><p>${!priority?.id?'KINETIK ne choisit pas arbitrairement une zone faible. Enregistre quelques tests pour obtenir une priorité réelle.':mode==='Recovery'?'Routine douce compatible avec une journée de repos.':priority.assessed?`Priorité ${priority.label.toLowerCase()} selon tes mesures, ton objectif et le travail récent.`:`Routine orientée ${priority.label.toLowerCase()} d'après ton objectif ; mesure cette zone pour confirmer.`}</p>${priority?.id?`<div class="mob-today-meta"><span>${recommended.duration} min</span><span>${recommended.focus}</span><span>tension ${cfg.intensityMin}–${cfg.intensityMax}/10</span></div>`:''}</div>${priority?.id?`<button class="btn btn-primary start-flex" data-flex="${recommended.id}">Commencer</button>`:`<button class="btn btn-primary" id="openMobilityAssessment">Faire l'évaluation</button>`}
      <details class="mob-change-routine"><summary>Changer de format</summary><div><button class="mob-routine-option start-flex" data-flex="reset-10"><strong>Recovery</strong><span>≈ 10 min · doux</span></button><button class="mob-routine-option start-flex" data-flex="${targeted.id}"><strong>Ciblée</strong><span>≈ ${targeted.duration} min · ${priority?.label||targeted.focus}</span></button><button class="mob-routine-option start-flex" data-flex="full-25"><strong>Complète</strong><span>≈ 25 min · corps entier</span></button></div></details>
    </section>

    ${renderMobilityProfile()}

    <section class="mob-priority">
      <div><div class="kicker">Priorité actuelle</div><h2>${priority?.id?priority.label:'Évaluation nécessaire'} ${priority?.assessed?`· ${priority.score}/100`:''}</h2><p>${priority?.id?mobilityObjectiveImpact(priority):'Commence par les tests les plus pertinents. KINETIK établira ensuite une priorité à partir des mesures réelles.'}</p></div>
      <div class="mob-priority-side"><span>Impact possible</span><strong>${(priority?.impact||[]).slice(0,3).join(' · ')||'À déterminer après évaluation'}</strong>${priority?.asymmetry!=null?`<small>Asymétrie mesurée · ${priority.asymmetry.toFixed(1)} ${priority.asymmetryUnit||''}</small>`:''}${priority?.id?`<button class="btn btn-secondary compact start-flex" data-flex="${priority.routine||targeted.id}">Travailler cette zone</button>`:`<button class="btn btn-secondary compact" id="openMobilityAssessmentSecondary">Évaluer</button>`}</div>
    </section>

    <section class="mob-progress">
      <div class="mob-section-head"><div><div class="kicker">Progression</div><h2>Évolution mesurée</h2></div><div class="mob-zone-switch">${MOBILITY_ZONES.map(z=>`<button data-mobility-zone="${z.id}" class="${chartZone===z.id?'active':''}">${z.label}</button>`).join('')}</div></div>
      ${renderMobilityChart(chartZone)}
    </section>

    ${renderMobilityAssessment().replace('class="mob-lower-section"','class="mob-lower-section" id="mobilityAssessment"')}

    <details class="mob-lower-section"><summary><div><div class="kicker">Historique</div><strong>${logs.length} routine${logs.length>1?'s':''} enregistrée${logs.length>1?'s':''}</strong></div><span>⌄</span></summary><div class="mob-lower-content">${logs.length?`<div class="mob-history">${logs.slice(0,8).map(l=>`<div><span>${formatDate(l.date)}</span><strong>${esc(l.name)}</strong><span>${l.durationMinutes} min</span><span>confort ${l.comfort||'—'}/5</span></div>`).join('')}</div>`:'<p class="muted">Ta première routine apparaîtra ici.</p>'}</div></details>
    ${renderFlexResearch()}
    ${renderFlexSettings()}
    <div class="flex-safety-line"><span>✓</span><p><strong>Sécurité :</strong> tension ${cfg.intensityMin}–${cfg.intensityMax}/10. Stop en cas de douleur vive, pincement, engourdissement ou sensation électrique.</p></div>`,"flexibility");
}
function saveMobilityTest(id){const def=MOBILITY_TESTS.find(x=>x.id===id),el=document.getElementById(`mob_${id}`);if(!def||!el||el.value==='')return;const value=Number(el.value);if(!Number.isFinite(value)||value<Number(def.min??-Infinity)||(def.max!=null&&value>Number(def.max)))return;const arr=getMobilityTests();arr.unshift({id:Date.now(),date:new Date().toISOString(),testId:id,value});setMobilityTests(arr.slice(0,400));render();}

function allExerciseNames(){const names=new Set(EXERCISE_LIBRARY.map(e=>e.name));Object.values(workouts).forEach(w=>w.exercises.forEach(e=>names.add(e.name)));FLEX_ROUTINES.forEach(r=>r.exercises.forEach(e=>names.add(e.name)));return [...names].sort((a,b)=>a.localeCompare(b,'fr'));}
function tutorialStats(){const names=allExerciseNames(), exact=names.filter(n=>tutorialFor(n).exact).length;return {total:names.length,exact};}
function renderTutorialManager(){const names=allExerciseNames(),saved=getTutorialOverrides(),stats=tutorialStats();return `<main class="shell"><section class="card editor-card tutorial-manager"><button class="back-btn" id="closeTutorialManager">← Retour au profil</button><div class="kicker">Bibliothèque tutoriels · V9.1</div><h1>${stats.exact}/${stats.total} vidéos directes</h1><p class="muted">Les mouvements ont maintenant une vidéo de référence intégrée. Les variantes d'une même progression peuvent partager un tutoriel complet. Tu peux toujours remplacer n'importe quelle référence par ta propre vidéo : ton choix personnel reste prioritaire.</p><div class="tutorial-progress"><div style="width:${stats.total?Math.round(stats.exact/stats.total*100):0}%"></div></div>${names.map((name,i)=>{const data=saved[name]||{},t=tutorialFor(name);return `<details class="tutorial-editor-row"><summary><span>${name}</span><span class="microbadge ${t.exact?'good':''}">${data.videoUrl||data.imageUrl?'perso':'référence'}</span></summary><div class="tutorial-editor-body">${t.source?`<p class="small muted tutorial-reference"><strong>Référence actuelle :</strong> ${esc(t.source)}${t.title?` · ${esc(t.title)}`:''}</p>`:''}<a class="btn btn-outline" href="${esc(t.url)}" target="_blank" rel="noopener noreferrer">▶ Voir la vidéo actuelle</a><label class="field-label">Remplacer par une autre URL vidéo</label><input class="url-input" id="tutorialVideo_${i}" type="url" value="${esc(data.videoUrl||'')}" placeholder="https://www.youtube.com/watch?v=..."><label class="field-label">URL image facultative</label><input class="url-input" id="tutorialImage_${i}" type="url" value="${esc(data.imageUrl||'')}" placeholder="Laisse vide pour utiliser la miniature YouTube"><div class="tutorial-editor-actions"><a class="btn btn-outline compact" href="${esc(`https://www.youtube.com/results?search_query=${encodeURIComponent(TUTORIAL_QUERIES[name]||name+' tutorial')}`)}" target="_blank" rel="noopener noreferrer">Chercher une alternative</a><button class="btn btn-secondary compact save-tutorial" data-index="${i}" data-name="${encodeURIComponent(name)}">Enregistrer</button>${data.videoUrl||data.imageUrl?`<button class="btn btn-outline compact clear-tutorial" data-name="${encodeURIComponent(name)}">Revenir à la référence</button>`:''}</div></div></details>`;}).join('')}</section></main>`;}
function saveTutorialOverride(name,index){const video=(document.getElementById(`tutorialVideo_${index}`)?.value||'').trim(),image=(document.getElementById(`tutorialImage_${index}`)?.value||'').trim();const data=getTutorialOverrides();if(video||image)data[name]={videoUrl:video,imageUrl:image};else delete data[name];setTutorialOverrides(data);render();}
function clearTutorialOverride(name){const data=getTutorialOverrides();delete data[name];setTutorialOverrides(data);render();}

function activeDurationMinutes(a){
  const paused=Number(a.pausedTotalMs||0)+(a.sessionPaused&&a.pauseStartedAt?Date.now()-a.pauseStartedAt:0);
  return Math.max(1,Math.round((((a.finishedAt||Date.now())-a.startedAt)-paused)/60000));
}
function pauseSession(){
  const a=state.active;if(!a||a.phase==='review'||a.sessionPaused)return;
  a.resumeTimerAfterPause=!!a.timerRunning;a.timerRunning=false;stopTimer();a.sessionPaused=true;a.pauseStartedAt=Date.now();render();
}
function resumeSession(){
  const a=state.active;if(!a||!a.sessionPaused)return;
  a.pausedTotalMs=Number(a.pausedTotalMs||0)+(Date.now()-Number(a.pauseStartedAt||Date.now()));a.pauseStartedAt=null;a.sessionPaused=false;
  if(a.resumeTimerAfterPause){a.timerRunning=true;startTimer();}a.resumeTimerAfterPause=false;render();
}
function undoLastGuidedSet(){
  if(!state.undoSetSnapshot)return;stopTimer();state.active=state.undoSetSnapshot;state.active.timerRunning=false;state.undoSetSnapshot=null;render();
}

function startWorkout(day=todayDay(), readiness=null) {
  const isCustom=!!readiness?.customWorkoutId;
  const w=isCustom?preparedCustomWorkout(readiness.customWorkoutId,readiness):preparedWorkout(Number(day),readiness,readiness?.sessionLength||'full');
  if (!w?.exercises?.length) return;
  state.readinessEditor=null;state.sessionModeEditor=null;
  state.active = {
    kind:isCustom?"custom":"workout", day:isCustom?"custom":Number(day), customWorkoutId:isCustom?readiness.customWorkoutId:null, trainingCycleId:isCustom?null:(w.trainingCycleId||getActiveTrainingCycleId()), sessionLength:w.sessionLength||readiness?.sessionLength||'full', workout:w, cycle:w.cycle, readiness:readiness||{energy:3,soreness:2,joints:'ok'}, startedAt:Date.now(), exerciseIndex:0, setIndex:0, phase:"work", entries:[],
    currentValue:w.exercises[0].target, currentBand:w.exercises[0].type==='reps_band'?(lastBandForExercise(w.exercises[0].name)||defaultBandForExercise(w.exercises[0].name)):'Aucune', timerRemaining:null, timerRunning:false,
    reviewRpe:6, reviewDiscomfort:false, reviewNote:"", sessionPaused:false, pauseStartedAt:null, pausedTotalMs:0, resumeTimerAfterPause:false, currentLoadKg:0
  };
  render();
}

function renderCoach() {
  if(state.substituteEditor!==null)return renderSubstituteEditor();
  const a=state.active;
  if (a.phase === "review") return renderWorkoutReview();
  if (a.sessionPaused) return `<main class="shell coach-shell"><section class="card pause-card"><div class="pause-icon">Ⅱ</div><div class="kicker">Séance en pause</div><h1>${a.workout.name}</h1><p class="muted">Ta progression, la série en cours et le chrono sont conservés.</p><button class="btn btn-primary" id="resumeWorkout">Reprendre</button><button class="btn btn-outline" id="quitWorkout">Quitter la séance</button></section></main>`;
  const e=a.workout.exercises[a.exerciseIndex], step=a.exerciseIndex+1, total=a.workout.exercises.length;
  const progress=((a.exerciseIndex+(a.setIndex/Math.max(1,e.sets)))/total)*100;

  if (a.phase === "rest" || a.phase === "transition") {
    const isTransition=a.phase === "transition";
    const next=isTransition?a.workout.exercises[a.exerciseIndex+1]:null;
    return `<main class="shell coach-shell"><div class="progress-wrap"><div class="progress-label"><span>${a.workout.name}</span><span>${step}/${total}</span></div><div class="progress-track"><div class="progress-bar" style="width:${progress}%"></div></div></div>
      <section class="card coach-card"><div><div class="kicker">${isTransition?'Exercice terminé':'Repos'}</div><h2>${e.name}</h2>
      <div class="timer"><div class="timer-time">${fmtTime(a.timerRemaining)}</div><div class="timer-sub">${isTransition?`Prochain : ${next?.name||'Fin de séance'}`:`Prochaine série : ${a.setIndex+1}/${e.sets}`}</div></div>
      ${isTransition&&next?`<div class="next-exercise-preview next-exercise-preview-rich"><div class="next-preview-media">${exerciseImage(next.name,'hero')}</div><div class="next-preview-copy"><span class="small muted">Prépare le prochain mouvement</span><strong>${next.name}</strong><small>${describe(next)}</small>${next.tip?`<p>${esc(next.tip)}</p>`:''}<div class="next-preview-actions">${tutorialLink(next.name,true)}</div></div></div>`:''}
      <div class="timer-controls"><button class="btn btn-secondary" id="minus15">−15 s</button><button class="btn btn-secondary" id="toggleTimer">${a.timerRunning?'Pause':'Reprendre'}</button><button class="btn btn-secondary" id="plus30">+30 s</button></div></div>
      <div class="stack"><button class="btn btn-primary" id="skipRest">${isTransition?'Passer au prochain exercice':'Passer le repos'}</button>${state.undoSetSnapshot?'<button class="btn btn-secondary" id="undoGuidedSet">↶ Annuler la dernière série</button>':''}<button class="btn btn-outline" id="pauseWorkout">Pause séance</button><button class="btn btn-outline" id="quitWorkout">Quitter</button></div></section></main>`;
  }

  const timed=e.type==="timer"||e.type.startsWith("hold");
  const setLabel=e.sets>1?`Série ${a.setIndex+1}/${e.sets}`:"Étape";
  let input="";
  if (timed) {
    if (a.timerRemaining==null) a.timerRemaining=e.target;
    input=`<div class="timer"><div class="timer-time">${fmtTime(a.timerRemaining)}</div><div class="timer-sub">Objectif : ${e.target>=60?fmtTime(e.target):e.target+' sec'}</div></div>
      <button class="btn btn-secondary" id="toggleWorkTimer">${a.timerRunning?'Pause':(a.timerRemaining===e.target?'Démarrer le chrono':'Reprendre')}</button>`;
  } else {
    input=`<div class="counter"><button id="decValue">−</button><input id="valueInput" inputmode="numeric" type="number" min="0" value="${a.currentValue}"><button id="incValue">+</button></div>`;
    if (e.type==="reps_band") input+=`<div class="band-select-block"><label class="small muted">Bande utilisée</label>${renderBandPicker(a.currentBand,e.name)}</div>`;
    if (usesBackpack(e.name)) input+=renderBackpackLoadInput(a.currentLoadKg||0,'workoutLoadKg');
  }
  return `<main class="shell coach-shell"><div class="progress-wrap"><div class="progress-label"><span>${a.workout.name}</span><span>${step}/${total}</span></div><div class="progress-track"><div class="progress-bar" style="width:${progress}%"></div></div></div>
    <section class="card coach-card"><div><div class="kicker">${phaseLabel(e.phase)} · ${setLabel}</div>${exerciseImage(e.name,'hero')}<div class="exercise-title">${e.name}</div><div class="target">${describe(e)}</div>${e.phase==='main'&&a.cycle?.rir!=null?`<div class="coach-rir">Effort cible · <strong>${a.cycle.rir} RIR</strong><span>${a.cycle.rir<=1?'très exigeant':a.cycle.rir===2?'soutenu':'marge volontaire'}</span></div>`:''}
      ${e.prescriptionNote?`<div class="coach-note ${e.prescriptionStatus}">${e.prescriptionNote}</div>`:''}<p class="tip">${e.tip}</p>${e.guide?.length?`<div class="guided-block"><strong>Guide étape par étape</strong>${e.guide.map(x=>`<span>• ${esc(x)}</span>`).join('')}</div>`:''}${equipmentUseNote(e.name)?`<div class="coach-equipment-tip">🧰 ${equipmentUseNote(e.name)}</div>`:''}${renderExerciseAvailabilityNotice(e,a.readiness)}${renderTechniqueCoach(e.name)}${e.name==='Cardio Zone 2'?renderStravaToday({exercises:[e]}):''}${tutorialLink(e.name)}${(a.kind==='workout'||a.kind==='custom')&&substitutionOptions(e).length?'<button class="btn btn-outline substitute-btn" id="openSubstitute">Changer cet exercice</button>':''}${input}</div>
      <div class="stack"><button class="btn btn-primary" id="completeSet">${a.setIndex===e.sets-1?'Terminer cette étape':'Série terminée'}</button>${state.undoSetSnapshot?'<button class="btn btn-secondary" id="undoGuidedSet">↶ Annuler la dernière série</button>':''}<button class="btn btn-outline" id="pauseWorkout">Pause séance</button><button class="btn btn-outline" id="quitWorkout">Quitter</button></div></section></main>`;
}

function transitionRestSeconds(current,next){
  if(!current||!next)return 0;
  // For strength/skill work, reuse the recovery prescribed after a set.
  if(Number(current.rest)>0)return Number(current.rest);
  // Single-step warm-ups/cardio/mobility previously had rest=0 because they have
  // no intra-exercise sets. Give them a short transition before the next block.
  if(/^Échauffement/i.test(current.name))return 60;
  if(/Cardio Zone 2/i.test(current.name))return 60;
  if(current.type==='timer'||current.type?.startsWith('hold'))return 45;
  return 45;
}

function completeSet() {
  const a=state.active, e=a.workout.exercises[a.exerciseIndex];
  state.undoSetSnapshot=clone({...a,timerRunning:false});
  let value=a.currentValue;
  if (e.type==="timer"||e.type.startsWith("hold")) {
    const remaining=a.timerRemaining??e.target;
    value=remaining===e.target?e.target:Math.max(0,e.target-remaining);
  } else {
    const field=document.getElementById("valueInput"); if(field) value=Number(field.value||0);
  }
  const band=e.type==="reps_band"?a.currentBand:null;
  const loadKg=usesBackpack(e.name)?Number(document.getElementById('workoutLoadKg')?.value||a.currentLoadKg||0):null;
  a.currentLoadKg=loadKg||0;a.currentBand=band||a.currentBand;
  a.entries.push({ exercise:e.name, type:e.type, set:a.setIndex+1, target:e.target, progressionTarget:e.progressionTarget||e.target, baseTarget:e.baseTarget, value, band, loadKg, substitutedFrom:e.substitutedFrom||null });
  a.timerRunning=false; stopTimer();
  if (a.setIndex<e.sets-1) {
    a.setIndex++; a.currentValue=e.target; a.timerRemaining=e.rest; a.phase=e.rest>0?"rest":"work";
    if(a.phase==="rest"){a.timerRunning=true;startTimer();} render(); return;
  }
  if (a.exerciseIndex<a.workout.exercises.length-1) {
    // Keep the completed exercise active during the transition rest. This avoids
    // showing the next movement before the athlete has recovered.
    const next=a.workout.exercises[a.exerciseIndex+1];
    const transitionRest=transitionRestSeconds(e,next);
    a.phase=transitionRest>0?"transition":"work";
    if(a.phase==="transition"){
      a.timerRemaining=transitionRest;
      a.timerRunning=true;
      startTimer();
      render();
      return;
    }
    advanceToNextExercise(a);
    render(); return;
  }
  a.phase="review"; a.finishedAt=Date.now(); render();
}

function advanceToNextExercise(a=state.active){
  if(!a || a.exerciseIndex>=a.workout.exercises.length-1)return false;
  a.exerciseIndex++;
  a.setIndex=0;
  a.phase="work";
  const next=a.workout.exercises[a.exerciseIndex];
  a.currentValue=next.target;
  a.currentBand=next.type==="reps_band"?(lastBandForExercise(next.name)||defaultBandForExercise(next.name)):"Aucune";
  a.currentLoadKg=0;
  a.timerRemaining=next.type==="timer"||next.type.startsWith("hold")?next.target:null;
  a.timerRunning=false;
  return true;
}

function renderWorkoutReview() {
  const a=state.active;
  const duration=activeDurationMinutes(a);
  const counted=a.entries.filter(x=>x.type!=="timer"), hit=counted.filter(x=>x.value>=x.target).length;
  const score=counted.length?Math.round((hit/counted.length)*100):100;
  if(a.kind==="flexibility") return `<main class="shell coach-shell"><section class="card review-card"><div class="kicker">Routine terminée</div><h1>Mobilité faite.</h1><div class="stat-grid"><div class="stat"><div class="stat-value">${duration}</div><div class="stat-label">minutes</div></div><div class="stat"><div class="stat-value">${a.workout.exercises.length}</div><div class="stat-label">étapes</div></div></div><div class="divider"></div><h2>Confort global</h2><p class="muted small">1 = très raide aujourd'hui · 5 = amplitude fluide et confortable.</p><div class="comfort-row">${[1,2,3,4,5].map(n=>`<button class="comfort-btn ${a.reviewComfort===n?'active':''}" data-comfort="${n}">${n}</button>`).join('')}</div><label class="checkline"><input id="jointDiscomfort" type="checkbox" ${a.reviewDiscomfort?'checked':''}><span><strong>Douleur ou pincement inhabituel</strong><small>À distinguer d'une tension musculaire normale.</small></span></label><label class="field-label">Note facultative</label><textarea class="textarea" id="reviewNote" placeholder="Ex. hanche droite plus raide, chevilles très libres…">${esc(a.reviewNote)}</textarea><button class="btn btn-primary" id="saveWorkout">Enregistrer la routine</button></section></main>`;
  return `<main class="shell coach-shell"><section class="card review-card"><div class="kicker">Séance terminée</div><h1>Bien joué.</h1>
    <div class="stat-grid"><div class="stat"><div class="stat-value">${duration}</div><div class="stat-label">minutes</div></div><div class="stat"><div class="stat-value">${score}%</div><div class="stat-label">objectifs atteints</div></div></div>
    <div class="meta"><span class="pill">Progression S${a.cycle?.week||'—'} · ${a.cycle?.name||'—'}</span><span class="pill">${a.kind==='custom'?'Personnelle':a.sessionLength==='short'?'Express':'Complète'}</span><span class="pill">Readiness ${readinessPlan(a.readiness).label}</span></div><div class="divider"></div><h2>Effort perçu</h2><p class="muted small">Pour une reprise, vise le plus souvent 5–7/10.</p>
    <div class="rpe-row">${[4,5,6,7,8,9].map(n=>`<button class="rpe-btn ${a.reviewRpe===n?'active':''}" data-rpe="${n}">${n}</button>`).join('')}</div>
    <label class="checkline"><input id="jointDiscomfort" type="checkbox" ${a.reviewDiscomfort?'checked':''}><span><strong>Gêne articulaire ou tendineuse</strong><small>Poignets, coudes, épaules, genoux…</small></span></label>
    <label class="field-label">Note facultative</label><textarea class="textarea" id="reviewNote" placeholder="Ex. grip fatigué, très facile, épaule raide…">${esc(a.reviewNote)}</textarea>
    <button class="btn btn-primary" id="saveWorkout">Enregistrer la séance</button></section></main>`;
}
function saveWorkoutReview() {
  const a=state.active;
  a.reviewDiscomfort=document.getElementById('jointDiscomfort')?.checked||false;
  a.reviewNote=document.getElementById('reviewNote')?.value||"";
  const durationMinutes=activeDurationMinutes(a);
  const counted=a.entries.filter(x=>x.type!=="timer"), hit=counted.filter(x=>x.value>=x.target).length;
  const score=counted.length?Math.round((hit/counted.length)*100):100;
  if(a.kind==="flexibility"){
    const logs=getFlexLogs(); logs.unshift({id:Date.now(),date:new Date().toISOString(),name:a.workout.name,durationMinutes,comfort:a.reviewComfort||3,discomfort:a.reviewDiscomfort,note:a.reviewNote,entries:a.entries}); setFlexLogs(logs.slice(0,500));
    state.active=null; state.undoSetSnapshot=null; state.view="flexibility"; render(); return;
  }
  const beforeRank=getRankState().current.id;
  const history=getHistory();
  const prs=detectPRs(a.entries,history);
  history.unshift({ id:Date.now(), date:new Date().toISOString(), day:a.day, name:a.workout.name, durationMinutes, score, rpe:a.reviewRpe, jointDiscomfort:a.reviewDiscomfort, note:a.reviewNote, sessionLength:a.sessionLength||'full', customWorkoutId:a.customWorkoutId||null, trainingCycleId:a.trainingCycleId||null, readiness:{...a.readiness,mode:readinessPlan(a.readiness).mode}, cycle:a.cycle, prs, entries:a.entries });
  setHistory(history.slice(0,1000));
  if(prs.length)state.prNotice=prs;
  const afterRank=getRankState();
  if(afterRank.current.id!==beforeRank)state.rankUpNotice=afterRank.current.name;
  state.active=null; state.undoSetSnapshot=null; state.view="progress"; render();
}

let wakeLockHandle=null;
let timerAudioContext=null;

async function unlockTimerAudio(){
  const p=getPrefs();
  if(!p.sound)return;
  try{
    if(!timerAudioContext)timerAudioContext=new(window.AudioContext||window.webkitAudioContext)();
    if(timerAudioContext.state==='suspended')await timerAudioContext.resume();
    // Very short inaudible pulse during a user gesture keeps the audio context primed on iOS.
    const o=timerAudioContext.createOscillator(),g=timerAudioContext.createGain();
    g.gain.value=0.00001;o.connect(g);g.connect(timerAudioContext.destination);o.start();o.stop(timerAudioContext.currentTime+0.01);
  }catch{}
}

async function requestTimerWakeLock(){
  const p=getPrefs();
  if(!p.keepAwake||!('wakeLock' in navigator)||document.visibilityState!=='visible')return;
  try{
    if(wakeLockHandle&&!wakeLockHandle.released)return;
    wakeLockHandle=await navigator.wakeLock.request('screen');
    wakeLockHandle.addEventListener('release',()=>{wakeLockHandle=null;});
  }catch{}
}
function releaseTimerWakeLock(){
  try{if(wakeLockHandle&&!wakeLockHandle.released)wakeLockHandle.release();}catch{}
  wakeLockHandle=null;
}

function finishRunningTimer(){
  const a=state.active;if(!a)return;
  a.timerRunning=false;stopTimer();signalTimer();
  if(a.phase==='rest'){
    a.phase='work';const e=a.workout.exercises[a.exerciseIndex];
    a.timerRemaining=e.type==='timer'||e.type.startsWith('hold')?e.target:null;render();
  }else if(a.phase==='transition'){
    advanceToNextExercise(a);render();
  }else render();
}
function timerTick(){
  const a=state.active;if(!a||!a.timerRunning)return;
  const end=Number(a.timerEndAt||0);
  if(!end){a.timerEndAt=Date.now()+Math.max(0,Number(a.timerRemaining||0))*1000;return;}
  const remaining=Math.max(0,Math.ceil((end-Date.now())/1000));
  a.timerRemaining=remaining;
  const el=document.querySelector('.timer-time');if(el)el.textContent=fmtTime(remaining);
  if(remaining<=0)finishRunningTimer();
}
function startTimer(){
  stopTimer();
  const a=state.active;if(!a||!a.timerRunning)return;
  a.timerEndAt=Date.now()+Math.max(0,Number(a.timerRemaining||0))*1000;
  unlockTimerAudio();requestTimerWakeLock();
  timerTick();
  state.timer=setInterval(timerTick,250);
}
function stopTimer(){
  if(state.timer){clearInterval(state.timer);state.timer=null;}
  if(state.active)state.active.timerEndAt=null;
  if(!state.active?.timerRunning)releaseTimerWakeLock();
}
function signalTimer(){
  const p=getPrefs();
  if(p.vibration&&navigator.vibrate)navigator.vibrate([180,90,180,90,260]);
  if(!p.sound)return;
  try{
    const ctx=timerAudioContext||(timerAudioContext=new(window.AudioContext||window.webkitAudioContext)());
    if(ctx.state==='suspended')ctx.resume().catch(()=>{});
    const now=ctx.currentTime;
    [0,0.24,0.48].forEach((delay,i)=>{
      const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);
      o.frequency.value=i===2?1046:880;g.gain.setValueAtTime(.0001,now+delay);g.gain.exponentialRampToValueAtTime(.16,now+delay+.015);g.gain.exponentialRampToValueAtTime(.0001,now+delay+.18);
      o.start(now+delay);o.stop(now+delay+.20);
    });
  }catch{}
}

function bestMetric(history,name){let best=0;history.forEach(h=>(h.entries||[]).forEach(e=>{if(e.exercise===name)best=Math.max(best,Number(e.value||0));}));return best;}
function bestMetricDetails(history,name){
  let best=0,date=null;
  history.forEach(h=>(h.entries||[]).forEach(e=>{const value=Number(e.value||0);if(e.exercise===name&&value>best){best=value;date=h.date||null;}}));
  return {value:best,date,source:best>0?'séance':null,exercise:name};
}
function latestTestValue(id){const t=getTests().filter(x=>x.testId===id).sort((a,b)=>new Date(b.date)-new Date(a.date))[0];return t?Number(t.value):0;}
function bestTestValue(id){return getTests().filter(x=>x.testId===id).reduce((m,x)=>Math.max(m,Number(x.value)||0),0);}
function bestQuickMetricDetails(names){const wanted=new Set(Array.isArray(names)?names:[names]);let best={value:0,date:null,source:null,exercise:null};for(const q of getQuickLogs()){if(wanted.has(q.exercise)&&q.type!=='timer'&&q.type!=='reps_band'&&Number(q.value||0)>best.value)best={value:Number(q.value),date:q.date,source:'série libre',exercise:q.exercise};}return best;}
function performanceDetailsForTest(id){
  const testBest=bestTestValue(id),names=TEST_GUIDED_EXERCISES[id]||[];let guided={value:0,date:null,source:null,exercise:null};
  for(const name of names){const d=bestMetricDetails(getHistory(),name);if(d.value>guided.value)guided=d;}
  const quick=bestQuickMetricDetails(names),test={value:testBest,date:null,source:testBest>0?'test':null,exercise:null};
  return [guided,quick,test].sort((a,b)=>Number(b.value||0)-Number(a.value||0))[0];
}
function performanceValueForTest(id){return performanceDetailsForTest(id).value;}
function metricDetailsForSkill(auto){
  if(auto.test)return performanceDetailsForTest(auto.test);
  if(auto.exercise)return bestMetricDetails(getHistory(),auto.exercise);
  return {value:0,date:null,source:null,exercise:null};
}
function metricValueForSkill(auto){return metricDetailsForSkill(auto).value;}

function findSkillLevel(id){
  for(const tree of SKILL_TREES){
    const level=tree.levels.find(x=>x.id===id);
    if(level)return level;
  }
  return null;
}
function skillDoneById(id){const level=findSkillLevel(id);return level?skillDone(level):false;}
/* ancien calcul de récompense retiré en v10.86. */
function mondayWeekKey(iso){
  const d=new Date(iso), copy=new Date(d.getFullYear(),d.getMonth(),d.getDate());
  const offset=(copy.getDay()+6)%7; copy.setDate(copy.getDate()-offset);
  return `${copy.getFullYear()}-${String(copy.getMonth()+1).padStart(2,'0')}-${String(copy.getDate()).padStart(2,'0')}`;
}
function plannedWeeklySessions(){
  const p=typeof getAthleteProfile==='function'?getAthleteProfile():null;
  const profile=Number(p?.weeklySessions||0);
  if(profile>0)return clamp(profile,1,7);
  try{return clamp(cycleTrainingDays(getActiveTrainingCycle()).length||4,1,7);}catch(e){return 4;}
}
function consistentWeeksCount(){
  const planned=plannedWeeklySessions(),required=Math.max(2,Math.ceil(planned*.8)),weeks=new Map();
  getHistory().forEach(s=>{
    const key=mondayWeekKey(s.date),day=localDateKey(s.date);
    if(!weeks.has(key))weeks.set(key,new Set());
    weeks.get(key).add(day);
  });
  return [...weeks.values()].filter(days=>days.size>=required).length;
}
function piecewiseScore(value,points){
  const v=Math.max(0,Number(value)||0);
  if(!points?.length)return 0;
  if(v<=points[0][0])return points[0][1];
  for(let i=1;i<points.length;i++){
    const [x2,y2]=points[i],[x1,y1]=points[i-1];
    if(v<=x2){const f=(v-x1)/Math.max(.0001,x2-x1);return y1+(y2-y1)*f;}
  }
  return points[points.length-1][1];
}
function bestExerciseValue(name){
  const a=typeof bestMetricDetails==='function'?bestMetricDetails(getHistory(),name):{value:0};
  const b=typeof bestQuickMetricDetails==='function'?bestQuickMetricDetails(name):{value:0};
  return Math.max(Number(a?.value||0),Number(b?.value||0));
}
function skillDoneSafe(id){try{return skillDoneById(id);}catch(e){return false;}}
function capabilityLevel(score,assessed=true){
  if(!assessed)return 'Non évalué';
  if(score<15)return 'Fondations';
  if(score<30)return 'Base';
  if(score<45)return 'Intermédiaire';
  if(score<60)return 'Confirmé';
  if(score<75)return 'Solide';
  if(score<90)return 'Avancé';
  if(score<100)return 'Expert';
  return 'Maîtrise';
}
function capabilityScores(){
  const pullups=Number(performanceValueForTest('pullups')||0);
  const dips=Number(performanceValueForTest('dips')||0);
  const dead=Number(performanceValueForTest('dead_hang')||0);
  const wall=Number(performanceValueForTest('wall_handstand')||0);
  const ctb=Math.max(bestExerciseValue('Chest-to-bar'),Number(typeof aiEvaluationFor==='function'?aiEvaluationFor('Chest-to-bar')?.value||0:0));
  const explosiveReps=bestExerciseValue('Tractions explosives');
  const explosiveEval=Number(typeof aiEvaluationFor==='function'?aiEvaluationFor('Tractions explosives')?.value||0:0);
  const mu=bestExerciseValue('Muscle-up strict');
  const assistedMu=bestExerciseValue('Muscle-up assisté');
  const freeHs=bestExerciseValue('Handstand libre');
  const toes=bestExerciseValue('Toes-to-bar');
  const towel=bestExerciseValue('Towel hang');
  const oneArmAssist=bestExerciseValue('One-arm assisted hang');

  // TIRAGE · les tractions seules sont plafonnées à ~50.
  const pullBase=piecewiseScore(pullups,[[0,0],[1,4],[3,9],[5,14],[8,21],[10,26],[12,31],[15,37],[20,43],[25,47],[30,50]]);
  const chestBonus=piecewiseScore(ctb,[[0,0],[1,4],[3,9],[5,14],[8,18],[12,20]]);
  const explosiveBonus=Math.max(
    piecewiseScore(explosiveReps,[[0,0],[1,4],[3,8],[5,12],[8,15]]),
    piecewiseScore(explosiveEval,[[0,0],[1,2],[2,5],[3,9],[4,13]])
  );
  const muBonus=piecewiseScore(mu,[[0,0],[1,6],[3,10],[5,13],[10,15]]);
  const pull=Math.min(100,Math.round(pullBase+chestBonus+explosiveBonus+muBonus));

  // POUSSÉE · les dips seuls sont plafonnés à ~50.
  const dipBase=piecewiseScore(dips,[[0,0],[5,8],[8,13],[10,17],[15,24],[20,31],[30,40],[40,47],[50,50]]);
  const pike=skillDoneSafe('pike-elevated')?8:0;
  const wallHspu=skillDoneSafe('hspu-wall')?17:0;
  const freeHspu=skillDoneSafe('hspu-free')?25:0;
  const push=Math.min(100,Math.round(dipBase+pike+wallHspu+freeHspu));

  // GRIP · le dead hang seul est volontairement plafonné à 65.
  // Pour dépasser le niveau solide, il faut plusieurs formes de grip.
  const deadBase=piecewiseScore(dead,[[0,0],[15,4],[30,10],[45,17],[60,23],[90,33],[120,42],[150,50],[180,56],[240,62],[300,65]]);
  const towelBonus=piecewiseScore(towel,[[0,0],[10,3],[20,7],[30,11],[45,15],[60,18],[90,20]]);
  const oneArmBonus=piecewiseScore(oneArmAssist,[[0,0],[5,4],[10,8],[15,11],[25,14],[40,15]]);
  const grip=Math.min(100,Math.round(deadBase+towelBonus+oneArmBonus));

  // CORE · un seul hold ne suffit pas aux scores experts.
  let core=0;
  const coreSteps=[['tuck-10',8],['tuck-20',16],['oneleg-lsit',30],['lsit-10',45],['lsit-20',58],['toes-bar',68]];
  coreSteps.forEach(([id,v])=>{if(skillDoneSafe(id))core=Math.max(core,v);});
  if(toes>1)core=Math.max(core,Math.round(piecewiseScore(toes,[[1,68],[5,75],[10,82],[15,86]])));
  // Le score >86 est réservé à des preuves de maîtrise futures (V-sit / compression avancée).
  core=Math.min(86,core);

  // ÉQUILIBRE · le handstand au mur plafonne à 25, le libre à 75.
  let balance=Math.round(piecewiseScore(wall,[[0,0],[20,6],[30,10],[45,15],[60,20],[90,25]]));
  if(freeHs>0)balance=Math.max(balance,Math.round(piecewiseScore(freeHs,[[1,30],[5,38],[10,46],[20,55],[30,62],[45,69],[60,75],[90,78]])));
  if(skillDoneSafe('hspu-wall'))balance=Math.max(balance,80);
  if(skillDoneSafe('hspu-free'))balance=Math.max(balance,90);
  // 100 est réservé à de futures preuves de contrôle avancé (press, variations).
  balance=Math.min(90,balance);

  // EXPLOSIVITÉ · nécessite progressivement tirage haut + MU assisté + MU strict.
  const highPull=Math.min(40,
    Math.max(piecewiseScore(ctb,[[0,0],[1,6],[3,12],[5,17],[8,20]]),0)+
    Math.max(piecewiseScore(explosiveEval,[[0,0],[1,3],[2,8],[3,15],[4,20]]),piecewiseScore(explosiveReps,[[0,0],[1,7],[3,14],[5,20]]))
  );
  const assistedBonus=piecewiseScore(assistedMu,[[0,0],[1,5],[3,10],[5,15]]);
  const strictBonus=piecewiseScore(mu,[[0,0],[1,15],[3,25],[5,32],[10,40]]);
  const explosive=Math.min(95,Math.round(highPull+assistedBonus+strictBonus));

  const rows=[
    {id:'pull',label:'Tirage',score:pull,assessed:pullups>0||ctb>0||explosiveEval>0||explosiveReps>0,detail:pullups?`${pullups} tractions · ${ctb||0} chest-to-bar`:'Tests à compléter'},
    {id:'push',label:'Poussée',score:push,assessed:dips>0||pike||wallHspu||freeHspu,detail:dips?`${dips} dips stricts`:'Tests à compléter'},
    {id:'core',label:'Core',score:core,assessed:core>0,detail:core?`${capabilityLevel(core,true)}`:'L-sit / core non évalué'},
    {id:'grip',label:'Grip',score:grip,assessed:dead>0||towel>0||oneArmAssist>0,detail:dead?`${dead} s dead hang${towel?` · ${towel} s towel`:''}${oneArmAssist?` · ${oneArmAssist} s 1 bras assisté`:''}`:'Grip non évalué'},
    {id:'balance',label:'Équilibre',score:balance,assessed:wall>0||freeHs>0,detail:freeHs?`${freeHs} s handstand libre`:wall?`${wall} s au mur`:'Handstand non évalué'},
    {id:'explosive',label:'Explosivité',score:explosive,assessed:ctb>0||explosiveEval>0||explosiveReps>0||assistedMu>0||mu>0,detail:mu?`${mu} muscle-up strict`:assistedMu?`${assistedMu} MU assisté`:explosiveEval?`tirage explosif niveau ${explosiveEval}`:ctb?`${ctb} chest-to-bar`:'Non évaluée'}
  ];
  return rows.map(x=>({...x,level:capabilityLevel(x.score,x.assessed)}));
}
function technicalSkillPoints(){
  const base={pull:1,push:1,legs:1,handstand:2,core:2,muscleup:4,lever:4,flag:4};
  let points=0;
  for(const tree of SKILL_TREES){
    const b=base[tree.id]||1;
    tree.levels.forEach((level,i)=>{if(skillDone(level))points+=b+(tree.id==='muscleup'||tree.id==='lever'||tree.id==='flag'?i*2:i);});
  }
  return points;
}
function masterySkillCount(){
  return ['hs-free-30','hspu-free','muscle-up-3','lever-full','flag-full','pistol-5','lsit-20'].filter(skillDoneSafe).length;
}
function majorMasterySkillCount(){
  return ['muscle-up-3','hspu-free','lever-full','flag-full'].filter(skillDoneSafe).length;
}
function trainingYearsEvidence(){
  const p=typeof getAthleteProfile==='function'?getAthleteProfile():{};
  const declared=Math.max(0,Number(p?.yearsTraining||0));
  const dates=getHistory().map(x=>new Date(x.date).getTime()).filter(Number.isFinite);
  const tracked=dates.length>=2?(Math.max(...dates)-Math.min(...dates))/(365.25*86400000):0;
  return Math.max(declared,tracked);
}
const KINETIK_RANK_RULES={
  // Les rangs sont des niveaux de capacité démontrée.
  // Aucune ancienneté, durée d’utilisation ou nombre de séances n’est requis.
  bronze:{
    avg:0,caps:{},skillPoints:0,mastery:0,majorMastery:0,proofs:[]
  },
  silver:{
    avg:0,
    // Argent reste volontairement transparent : 3 standards réels, sans doublon d'indice composite.
    caps:{},
    skillPoints:0,mastery:0,majorMastery:0,
    proofs:[
      {kind:'test',id:'pullups',value:5,label:'5 tractions strictes',unit:'reps'},
      {kind:'test',id:'dips',value:8,label:'8 dips stricts',unit:'reps'},
      {kind:'test',id:'dead_hang',value:45,label:'Dead hang 45 s',unit:'s'}
    ]
  },
  gold:{
    avg:0,
    // Or valide les standards + un minimum de diversité technique. Les indices composites commencent à Platine.
    caps:{},
    skillPoints:6,mastery:0,majorMastery:0,
    proofs:[
      {kind:'test',id:'pullups',value:8,label:'8 tractions strictes',unit:'reps'},
      {kind:'test',id:'dips',value:12,label:'12 dips stricts',unit:'reps'},
      {kind:'test',id:'dead_hang',value:60,label:'Dead hang 60 s',unit:'s'},
      {kind:'skill',id:'tuck-10',value:1,label:'Tuck L-sit 10 s',unit:''}
    ]
  },
  platinum:{
    avg:30,
    caps:{pull:38,push:35,grip:34,core:25,balance:20,explosive:20},
    skillPoints:18,mastery:0,majorMastery:0,
    proofs:[
      {kind:'test',id:'pullups',value:12,label:'12 tractions strictes',unit:'reps'},
      {kind:'test',id:'dips',value:15,label:'15 dips stricts',unit:'reps'},
      {kind:'test',id:'dead_hang',value:90,label:'Dead hang 90 s',unit:'s'},
      {kind:'exercise',name:'Chest-to-bar',value:3,label:'3 chest-to-bar propres',unit:'reps'},
      {kind:'test',id:'wall_handstand',value:60,label:'Handstand au mur 60 s',unit:'s'},
      {kind:'skill',id:'tuck-20',value:1,label:'Tuck L-sit 20 s',unit:''}
    ]
  },
  diamond:{
    avg:48,
    caps:{pull:52,push:50,grip:48,core:42,balance:35,explosive:42},
    skillPoints:45,mastery:1,majorMastery:0,
    proofs:[
      {kind:'test',id:'pullups',value:15,label:'15 tractions strictes',unit:'reps'},
      {kind:'test',id:'dips',value:20,label:'20 dips stricts',unit:'reps'},
      {kind:'test',id:'dead_hang',value:120,label:'Dead hang 120 s',unit:'s'},
      {kind:'exercise',name:'Towel hang',value:30,label:'Towel hang 30 s',unit:'s'},
      {kind:'exercise',name:'Chest-to-bar',value:5,label:'5 chest-to-bar propres',unit:'reps'},
      {kind:'exercise',name:'Muscle-up strict',value:1,label:'1 muscle-up strict',unit:'rep'},
      {kind:'exercise',name:'Handstand libre',value:5,label:'Handstand libre 5 s',unit:'s'},
      {kind:'skill',id:'lsit-10',value:1,label:'L-sit 10 s',unit:''}
    ]
  },
  master:{
    avg:66,
    caps:{pull:70,push:68,grip:65,core:58,balance:55,explosive:68},
    skillPoints:90,mastery:3,majorMastery:1,
    proofs:[
      {kind:'test',id:'pullups',value:20,label:'20 tractions strictes',unit:'reps'},
      {kind:'test',id:'dips',value:30,label:'30 dips stricts',unit:'reps'},
      {kind:'test',id:'dead_hang',value:180,label:'Dead hang 180 s',unit:'s'},
      {kind:'exercise',name:'Towel hang',value:45,label:'Towel hang 45 s',unit:'s'},
      {kind:'exercise',name:'One-arm assisted hang',value:15,label:'One-arm assisted hang 15 s / côté',unit:'s'},
      {kind:'exercise',name:'Muscle-up strict',value:3,label:'3 muscle-ups stricts',unit:'reps'},
      {kind:'exercise',name:'Handstand libre',value:30,label:'Handstand libre 30 s',unit:'s'},
      {kind:'skill',id:'hspu-wall',value:1,label:'Handstand push-up au mur',unit:''},
      {kind:'skill',id:'lever-oneleg',value:1,label:'One-leg front lever',unit:''},
      {kind:'skill',id:'flag-tuck',value:1,label:'Tuck human flag',unit:''},
      {kind:'skill',id:'lsit-20',value:1,label:'L-sit 20 s',unit:''}
    ]
  },
  legend:{
    avg:90,
    caps:{pull:88,push:85,grip:82,core:82,balance:82,explosive:85},
    skillPoints:160,mastery:5,majorMastery:3,
    proofs:[
      {kind:'test',id:'pullups',value:25,label:'25 tractions strictes',unit:'reps'},
      {kind:'test',id:'dips',value:40,label:'40 dips stricts',unit:'reps'},
      {kind:'test',id:'dead_hang',value:240,label:'Dead hang 240 s',unit:'s'},
      {kind:'exercise',name:'Towel hang',value:60,label:'Towel hang 60 s',unit:'s'},
      {kind:'exercise',name:'One-arm assisted hang',value:25,label:'One-arm assisted hang 25 s / côté',unit:'s'},
      {kind:'exercise',name:'Chest-to-bar',value:8,label:'8 chest-to-bar propres',unit:'reps'},
      {kind:'exercise',name:'Muscle-up strict',value:10,label:'10 muscle-ups stricts',unit:'reps'},
      {kind:'skill',id:'hspu-free',value:1,label:'Handstand push-up libre',unit:''},
      {kind:'exercise',name:'Handstand libre',value:60,label:'Handstand libre 60 s',unit:'s'},
      {kind:'exercise',name:'Front lever',value:10,label:'Front lever 10 s',unit:'s'},
      {kind:'exercise',name:'Human flag',value:10,label:'Human flag 10 s / côté',unit:'s'},
      {kind:'exercise',name:'L-sit',value:30,label:'L-sit 30 s',unit:'s'},
      {kind:'exercise',name:'Toes-to-bar',value:10,label:'10 toes-to-bar propres',unit:'reps'},
      {kind:'skill',id:'pistol-5',value:1,label:'5 pistol squats par jambe',unit:''}
    ]
  }
};
function rankProofValue(proof){
  if(!proof)return 0;
  if(proof.kind==='test')return Number(performanceValueForTest(proof.id)||0);
  if(proof.kind==='exercise')return Number(bestExerciseValue(proof.name)||0);
  if(proof.kind==='skill')return skillDoneSafe(proof.id)?1:0;
  return 0;
}
/* ancien résumé ludique retiré en v10.86. */
function rankRuleFor(rank){return KINETIK_RANK_RULES[rank?.id]||KINETIK_RANK_RULES.bronze;}
function rankGateRows(rank){
  const rule=rankRuleFor(rank),caps=capabilityScores(),capMap=Object.fromEntries(caps.map(x=>[x.id,x])),skillPoints=technicalSkillPoints(),mastery=masterySkillCount(),majorMastery=majorMasterySkillCount();
  // Non évalué = 0 pour les rangs qui exigent une moyenne globale.
  // Cela empêche de ne tester que ses points forts.
  const avg=Math.round(caps.reduce((s,x)=>s+(x.assessed?x.score:0),0)/Math.max(1,caps.length));
  const rows=[];
  if(rule.avg)rows.push({id:'avg',label:'Moyenne des 6 capacités',current:avg,target:rule.avg,unit:'/100',detail:'les capacités non évaluées comptent comme 0'});
  Object.entries(rule.caps||{}).forEach(([id,target])=>rows.push({
    id:`cap-${id}`,label:capMap[id]?.label||id,
    current:capMap[id]?.assessed?capMap[id].score:0,target,unit:'/100',
    detail:capMap[id]?.assessed?capMap[id].detail:'non évalué'
  }));
  (rule.proofs||[]).forEach((proof,i)=>{
    const current=rankProofValue(proof);
    rows.push({
      id:`proof-${i}-${proof.kind}`,label:proof.label,current,target:Number(proof.value||1),
      unit:proof.unit||'',detail:proof.kind==='skill'?'validation technique requise':'barème de performance'
    });
  });
  if(rule.skillPoints)rows.push({id:'skills',label:'Difficulté technique cumulée',current:skillPoints,target:rule.skillPoints,unit:'pts'});
  if(rule.mastery)rows.push({id:'mastery',label:'Skills de maîtrise',current:mastery,target:rule.mastery,unit:''});
  if(rule.majorMastery)rows.push({id:'major-mastery',label:'Skills majeurs de maîtrise',current:majorMastery,target:rule.majorMastery,unit:'',detail:'Muscle-up avancé · HSPU libre · Front lever · Human flag'});
  return rows.map(x=>({...x,done:Number(x.current)>=Number(x.target),progress:clamp(Number(x.current)/Math.max(1,Number(x.target)),0,1)}));
}
function evaluateRank(rank){
  const gates=rankGateRows(rank),done=gates.filter(x=>x.done).length;
  return {items:gates.map(g=>({obj:{label:g.label,unit:g.unit},current:g.current,target:g.target,done:g.done})),completed:done,required:gates.length,mandatoryDone:done,mandatoryTotal:gates.length,mandatoryMet:done===gates.length,skillCompleted:0,skillTotal:0,minSkillCount:0,skillsMet:true,categoryRules:[],categoryCompleted:0,categoryRequired:0,mandatoryCategoriesMet:true,categoriesMet:true,progressCompleted:done,progressRequired:gates.length,goalsMet:gates.every(x=>x.done),gates};
}
function rankReadinessFor(rank){
  const gates=rankGateRows(rank);
  if(!gates.length)return 1;
  const vals=gates.map(g=>g.progress),avg=vals.reduce((a,b)=>a+b,0)/vals.length,min=Math.min(...vals);
  return clamp(avg*.60+min*.40,0,1);
}
function rankDivision(readiness,nextExists=true){
  if(!nextExists)return 'I';
  if(readiness>=.66)return 'I';
  if(readiness>=.33)return 'II';
  return 'III';
}
function getRankState(){
  let index=0;
  for(let i=1;i<RANKS.length;i++){
    const ev=evaluateRank(RANKS[i]);
    if(ev.goalsMet)index=i;else break;
  }
  const current=RANKS[index],next=RANKS[index+1]||null,nextEval=next?evaluateRank(next):null;
  const readiness=next?rankReadinessFor(next):1,division=rankDivision(readiness,!!next);
  return {current,index,next,nextEval,goalProgress:readiness,readiness,division,displayName:`${current.name} ${division}`};
}
function objectiveValueText(item){
  if(item.obj.type==='skill')return item.done?'Validé':'À valider';
  const cur=Math.min(item.current,item.target),unit=item.obj.unit?` ${item.obj.unit}`:'';
  return `${Number(cur.toFixed?.(1) ?? cur)} / ${item.target}${unit}`;
}
function rankIndexById(id){const i=RANKS.findIndex(r=>r.id===id);return i<0?0:i;}
function rankStateLabel(index,currentIndex){return index<currentIndex?'Débloqué':index===currentIndex?'Rang actuel':'À venir';}
function rankProgressUnit(rank){return rank.categoryRules?.length?'catégories':'missions';}
function rankProgressText(rank,ev){return `${ev.progressCompleted}/${ev.progressRequired} ${rankProgressUnit(rank)}`;}
function rankCategoryLabel(rank,id){return rank.categoryRules?.find(r=>r.id===id)?.label||'Mission';}
function renderRankCategories(rank,ev){
  if(!ev.categoryRules?.length)return '';
  return `<div class="rank-category-grid">${ev.categoryRules.map(cat=>`<div class="rank-category-card ${cat.met?'done':''} ${cat.mandatory?'mandatory':''}"><div class="rank-category-icon">${cat.met?'✓':cat.icon||'•'}</div><div class="grow"><strong>${cat.label}</strong><small>${cat.completed}/${cat.required} objectif${cat.required>1?'s':''}${cat.mandatory?' · requis':''}</small></div><span>${cat.met?'Validé':'À faire'}</span></div>`).join('')}</div>`;
}
function renderRankObjective(item,rank=null){
  const cat=item.obj.category&&rank?rankCategoryLabel(rank,item.obj.category):null;
  const tag=item.obj.mandatory?'<span class="rank-mission-tag required">Obligatoire</span>':cat?`<span class="rank-mission-tag category">${cat}</span>`:item.obj.type==='skill'?'<span class="rank-mission-tag skill">Skill</span>':'<span class="rank-mission-tag">Mission</span>';
  return `<div class="rank-objective ${item.done?'done':''}"><div class="rank-check">${item.done?'✓':'○'}</div><div class="grow"><strong>${item.obj.label}</strong><small>${objectiveValueText(item)}</small></div>${tag}</div>`;
}
function renderRankExplorer(){
  const rs=getRankState(),selectedId=state.selectedRankId||rs.current.id,selectedIndex=rankIndexById(selectedId),rank=RANKS[selectedIndex],ev=evaluateRank(rank);
  return `<section class="rank-explorer"><div class="rank-ladder" role="list">${RANKS.map((r,i)=>`<button class="rank-ladder-card rank-${r.id} ${selectedId===r.id?'selected':''} ${i<rs.index?'done':i===rs.index?'current':'future'}" data-rank-select="${r.id}"><span class="rank-ladder-emblem">${i<rs.index?'✓':i+1}</span><strong>${r.name}</strong><small>${r.title}</small><i>${rankStateLabel(i,rs.index)}</i></button>`).join('')}</div><section class="card rank-detail rank-${rank.id}"><div class="rank-detail-head"><div class="rank-emblem rank-emblem-large">${selectedIndex===6?'★':selectedIndex+1}</div><div class="grow"><div class="kicker">Barèmes de performance</div><div class="rank-name">${rank.name}</div><h2>${rank.title}</h2><p>${rank.description}</p></div><span class="rank-status-pill">${rankStateLabel(selectedIndex,rs.index)}</span></div><div class="section-head rank-missions-head"><div><div class="kicker">Exigences</div><h2>Performances à démontrer</h2></div><span class="pill">${ev.completed}/${ev.required}</span></div><div class="rank-v2-content">${(ev.gates||[]).map(g=>`<div class="${g.done?'done':''}"><div><span>${g.done?'✓':'○'}</span><strong>${g.label}</strong>${g.detail?`<small>${esc(g.detail)}</small>`:''}</div><b>${Number(g.current).toFixed(Number(g.current)%1?1:0)} / ${g.target}${g.unit?` ${g.unit}`:''}</b></div>`).join('')}</div><p class="rank-rule-note">Le rang dépend uniquement des capacités et performances validées.</p></section></section>`;
}
function renderRankMini(){
  const r=getRankState(),next=r.next,pct=Math.round(r.readiness*100);
  return `<section class="card rank-card rank-${r.current.id} rank-mini"><div class="rank-head"><div class="rank-emblem">${r.index+1}</div><div class="grow"><div class="kicker">Rang actuel</div><div class="rank-name">${r.displayName}</div><small class="rank-title-mini">${r.current.title}</small></div></div>${next?`<div class="rank-progress-label"><span>Exigences vers ${next.name}</span><strong>${pct}%</strong></div><div class="rank-progress"><span style="width:${pct}%"></span></div><div class="rank-nextline">${r.nextEval.completed}/${r.nextEval.required} exigences validées</div>`:`<div class="rank-legend-line">Rang maximal atteint · Légende</div>`}</section>`;
}
function renderRankPanel(){
  const r=getRankState(),next=r.next,pct=Math.round(r.readiness*100);
  const notice=state.rankUpNotice?`<section class="card rank-up-banner rank-${r.current.id}"><div><div class="kicker">Promotion</div><h2>Rang ${state.rankUpNotice} validé</h2><p>Les barèmes de performance requis sont maintenant remplis.</p></div><button class="icon-btn" id="dismissRankUp">×</button></section>`:'';
  return `${notice}<section class="card rank-card rank-${r.current.id}"><div class="rank-head"><div class="rank-emblem">${r.index+1}</div><div class="grow"><div class="kicker">Rang actuel</div><div class="rank-name">${r.displayName}</div><strong class="rank-subtitle">${r.current.title}</strong><p class="muted">${next?`Prochain palier : ${next.name} · ${next.title}`:'Rang maximal atteint'}</p></div></div>${next?`<div class="rank-block"><div class="rank-progress-label"><span>Exigences vers ${next.name}</span><strong>${pct}%</strong></div><div class="rank-progress"><span style="width:${pct}%"></span></div></div><div class="rank-next-summary"><span><strong>${r.nextEval.completed}/${r.nextEval.required}</strong> exigences validées</span><button data-view="skills">Voir les barèmes →</button></div>`:''}<p class="muted small">Aucun temps d’utilisation, nombre de séances ou compteur ludique n’intervient dans la promotion.</p></section>`;
}

function exerciseProgressRows() {
  const names=["Tractions assistées","Dips","Dead hang","Handstand au mur","Tuck L-sit","Hanging knee raises"];
  return names.map(name=>{
    const sessions=exerciseSessions(name,5);
    if(!sessions.length)return '';
    const points=sessions.slice().reverse().map(s=>Math.round(s.entries.reduce((a,e)=>a+Number(e.value||0),0)/s.entries.length));
    const max=Math.max(...points,1);
    return `<div class="metric-row"><div class="metric-title"><strong>${name}</strong><span>${points[points.length-1]}${name.includes('hang')||name.includes('Handstand')||name.includes('L-sit')?' s':' reps moy.'}</span></div><div class="spark-bars">${points.map(v=>`<span style="height:${Math.max(14,(v/max)*100)}%" title="${v}"></span>`).join('')}</div></div>`;
  }).join('');
}


function progressWeekStats(){
  const h=getHistory(),seven=Date.now()-7*86400000,recent=h.filter(x=>new Date(x.date).getTime()>=seven);
  const mins=recent.reduce((a,x)=>a+Number(x.durationMinutes||0),0),avg=recent.length?Math.round(recent.reduce((a,x)=>a+Number(x.score||0),0)/recent.length):0;
  const reps7=repetitionVolume('7d'),cycle=progressionWeekSnapshot(),c=getCycleState(),due=testDueSummary(),recs=progressionRecommendations();
  return {h,recent,mins,avg,reps7,cycle,c,due,recs};
}
function renderProgressTabs(){
  const tabs=[['overview','Vue d’ensemble','Résumé'],['performance','Performance','Force & tests'],['volume','Volume','Charge & équilibre'],['history','Historique','Séances passées']];
  return `<nav class="progress-hub-tabs" aria-label="Sections Progrès">${tabs.map(([id,label,small])=>`<button class="progress-hub-tab ${state.progressTab===id?'active':''}" data-progress-tab="${id}"><strong>${label}</strong><small>${small}</small></button>`).join('')}</nav>`;
}
function renderProgressOverview(){
  const x=progressWeekStats(),rank=getRankState(),next=rank.next;
  const sessionPct=x.cycle.planned?Math.round(x.cycle.done/x.cycle.planned*100):0;
  return `<section class="progress-overview-hero"><div><div class="kicker">Cette semaine · ${esc(getActiveTrainingCycle().name)}</div><h1>${esc(x.c.name)}</h1><p>${x.c.week}/${x.c.weekCount} · ${x.c.rir} RIR · ${Math.round(x.c.setFactor*100)} % volume prévu</p></div><div class="progress-overview-week"><strong>${x.c.week}</strong><span>/ ${x.c.weekCount}</span><small>semaine</small></div></section>
    <section class="progress-overview-kpis">
      <article><span>Séances</span><strong>${x.cycle.done}/${x.cycle.planned}</strong><small>${Math.min(100,sessionPct)} % de la semaine</small></article>
      <article><span>Temps</span><strong>${x.mins}</strong><small>min · 7 jours</small></article>
      <article><span>Répétitions</span><strong>${x.reps7.reps.toLocaleString('fr-FR')}</strong><small>${x.reps7.sets} séries · 7 jours</small></article>
      <article><span>Score moyen</span><strong>${x.avg||'—'}</strong><small>${x.avg?'% qualité séance':'en attente'}</small></article>
    </section>
    <section class="card progress-watch-card"><div class="section-head"><div><div class="kicker">À surveiller</div><h2>Ce qui mérite ton attention</h2></div><span class="pill">${x.recs.length+(x.due.overdue?1:0)}</span></div><div class="progress-watch-list">
      ${x.recs.length?`<button class="progress-watch-item" data-progress-tab="performance"><span class="progress-watch-icon">↗</span><div><strong>${x.recs.length} progression${x.recs.length>1?'s':''} disponible${x.recs.length>1?'s':''}</strong><small>${x.recs.slice(0,2).map(r=>`${r.current.name} → ${r.next.name}`).join(' · ')}</small></div><b>Voir →</b></button>`:''}
      <button class="progress-watch-item" data-progress-tab="performance"><span class="progress-watch-icon">◷</span><div><strong>Tests périodiques</strong><small>${x.due.label}</small></div><b>Voir →</b></button>
      ${next?`<button class="progress-watch-item rank-${rank.current.id}" data-view="skills"><span class="progress-watch-icon">◆</span><div><strong>${rank.current.name} → ${next.name}</strong><small>${rankProgressText(next,rank.nextEval)}</small></div><b>Rangs →</b></button>`:''}
    </div></section>
    ${renderCycleMini()}
    <section class="card progress-overview-trends"><div class="section-head"><div><div class="kicker">Tendance rapide</div><h2>Dernières performances</h2></div><button class="progress-text-link" data-progress-tab="performance">Analyse complète →</button></div>${exerciseProgressRows()||'<div class="empty">Termine quelques séances pour voir les tendances.</div>'}</section>${renderMobilityProgressSummary()}`;
}
function renderProgressPerformance(){
  const tests=getTests(),due=testDueSummary();
  return `${renderProgressionRecommendations()}${renderRecordsPanel()}
    <section class="card"><div class="section-head"><div><div class="kicker">Progression intelligente</div><h2>Tendances par exercice</h2></div><span class="pill">5 dernières</span></div>${exerciseProgressRows()||'<div class="empty">Termine quelques séances pour voir les tendances.</div>'}</section>
    <section class="card"><div class="section-head"><div><div class="kicker">Tous les 42 jours</div><h2>Tests périodiques</h2></div><span class="pill ${due.overdue?'badge-warn':'badge-success'}">${due.label}</span></div>
      <p class="muted small">Les tests servent de points de référence. Pas besoin d’aller à l’échec absolu : privilégie une exécution propre et arrête si une articulation gêne.</p>
      <div class="test-grid">${TEST_DEFS.map(t=>{const best=bestTestValue(t.id),last=tests.filter(x=>x.testId===t.id).sort((a,b)=>new Date(b.date)-new Date(a.date))[0];return `<button class="test-tile edit-test" data-test="${t.id}"><span>${t.name}</span><strong>${best?best+' '+t.unit:'—'}</strong><small>${last?'Dernier '+formatShortDate(last.date):'À mesurer'}</small></button>`}).join('')}</div>
    </section>
    <section class="card progress-rank-link rank-${getRankState().current.id}"><div><div class="kicker">Gamification</div><h2>${getRankState().current.name} · ${getRankState().current.title}</h2><p>Les critères complets de rang et le Skill Tree restent regroupés dans Skills pour ne pas surcharger Progrès.</p></div><button class="btn btn-secondary compact" data-view="skills">Voir Skills & Rangs</button></section>`;
}
function renderProgressVolume(){
  return `${renderProgramAudit()}${renderRepetitionVolumePanel()}${renderQuickVolumePanel()}${renderVolumePanel()}`;
}
function renderProgressHistory(){
  const x=progressWeekStats(),h=x.h;
  return `<section class="progress-history-stats"><article><strong>${h.length}</strong><span>séances totales</span></article><article><strong>${x.recent.length}</strong><span>sur 7 jours</span></article><article><strong>${x.mins}</strong><span>minutes / 7 j</span></article><article><strong>${bestMetric(h,'Dead hang')||'—'}</strong><span>best dead hang s</span></article></section>
    <section class="card"><div class="section-head"><div><div class="kicker">Journal</div><h2>Historique des séances</h2></div><span class="pill">${h.length}</span></div>${h.length?h.slice(0,40).map(x=>`<button class="history-item history-button" data-history="${x.id}"><div class="history-top"><div><div class="history-title">${x.name}</div><div class="small muted">${formatDate(x.date)} · ${x.durationMinutes} min · effort ${x.rpe||'—'}/10</div></div><span class="pill ${x.jointDiscomfort?'badge-warn':'badge-success'}">${x.score}%</span></div>${summaryLine(x)}</button>`).join(''):'<div class="empty">Ta première séance terminée apparaîtra ici.</div>'}</section>
    ${state.selectedHistoryId?renderHistoryDetail(state.selectedHistoryId):''}`;
}
function renderProgress() {
  const content=state.progressTab==='performance'?renderProgressPerformance():state.progressTab==='volume'?renderProgressVolume():state.progressTab==='history'?renderProgressHistory():renderProgressOverview();
  return shell(`<header class="topbar progress-topbar"><div><div class="brand">Progression</div><div class="daylabel">Performances, charge, volume et évolution</div></div></header>
    ${renderProgressTabs()}
    <div class="progress-hub-content">${content}</div>`, "progress");
}

function summaryLine(x){const pull=(x.entries||[]).filter(e=>e.exercise.includes('Tractions')).map(e=>e.value).filter(v=>v!==undefined);const hang=(x.entries||[]).filter(e=>e.exercise==='Dead hang').map(e=>e.value).filter(v=>v!==undefined);const bits=[];if(pull.length)bits.push(`tractions ${pull.join('/')}`);if(hang.length)bits.push(`hang ${hang.join('/')} s`);if(x.note)bits.push(esc(x.note));return bits.length?`<div class="small muted summary">${bits.join(' · ')}</div>`:'';}
function renderHistoryDetail(id){const s=getHistory().find(x=>String(x.id)===String(id));if(!s)return'';return `<section class="card detail-card"><div class="section-head"><div><h2>Détail · ${s.name}</h2><div class="small muted">${s.cycle?' · cycle S'+s.cycle.week:''}${s.readiness?' · '+readinessPlan(s.readiness).label:''}</div></div><button class="icon-btn" id="closeHistory">×</button></div>${s.prs?.length?`<div class="history-prs">🏆 ${s.prs.map(p=>`${p.exercise} ${recordValueText(p)}`).join(' · ')}</div>`:''}${(s.entries||[]).map(e=>`<div class="detail-row"><span>${e.exercise} · S${e.set}${e.substitutedFrom?' · remplace '+e.substitutedFrom:''}</span><strong>${e.value}${e.type.startsWith('hold')?' s':' reps'}${e.band?' · '+e.band:''}${e.loadKg?' · sac '+e.loadKg+' kg':''}</strong></div>`).join('')}</section>`;}

function testDueSummary(){
  const tests=getTests(); if(!tests.length)return{overdue:true,label:"Premier bilan"};
  const latest=Math.max(...tests.map(t=>new Date(t.date).getTime()));
  const due=latest+42*86400000, days=Math.ceil((due-Date.now())/86400000);
  if(days<=0)return{overdue:true,label:"Bilan à faire"};
  return{overdue:false,label:`dans ${days} j`};
}

function skillDone(level){if(level.auto&&metricValueForSkill(level.auto)>=level.auto.value)return true;return !!getManualSkills()[level.id];}
function skillAutoLabel(level){
  if(!level.auto)return 'Validation manuelle';
  const d=metricDetailsForSkill(level.auto),def=level.auto.test?TEST_DEFS.find(x=>x.id===level.auto.test):null;
  const unit=def?.unit || ((exerciseInfo(level.auto.exercise)?.prescription?.type||'').startsWith('hold')?'sec':'reps');
  const current=Number(d.value||0),source=d.source?` · ${d.source}`:'';
  return `Auto · ${current} / ${level.auto.value} ${unit}${source}`;
}
function nextSkillMilestones(limit=4){
  const rows=[];
  for(const tree of SKILL_TREES){
    const idx=tree.levels.findIndex(l=>!skillDone(l));
    if(idx>=0)rows.push({tree,level:tree.levels[idx],index:idx});
  }
  return rows.slice(0,limit);
}
/* v10.128 cleanup: ancienne définition de skillTreeProgress supprimée ; seule la version canonique est conservée. */
function primarySkillTree(){
  const p=typeof getAthleteProfile==='function'?getAthleteProfile():{};
  const text=`${p.primaryGoal||''} ${p.secondaryGoal||''}`.toLowerCase();
  const map=[['muscle','muscleup'],['handstand','handstand'],['l-sit','core'],['lsit','core'],['front lever','lever'],['human flag','flag'],['traction','pull'],['dip','push'],['pistol','legs']];
  const found=map.find(([q])=>text.includes(q));
  return SKILL_TREES.find(t=>t.id===(found?.[1]||'muscleup'))||SKILL_TREES[0];
}
function skillTreeProgress(tree){
  const done=tree.levels.filter(skillDone).length,total=tree.levels.length,next=tree.levels.find(x=>!skillDone(x))||null;
  const weights=tree.levels.map((_,i)=>i+1),max=weights.reduce((a,b)=>a+b,0),earned=tree.levels.reduce((s,l,i)=>s+(skillDone(l)?weights[i]:0),0);
  return {done,total,pct:Math.round(earned/Math.max(1,max)*100),next};
}
function renderSkillRoadmap(tree,compact=false){
  let previous=true;
  return `<div class="cap-roadmap ${compact?'compact':''}">${tree.levels.map((level,i)=>{const done=skillDone(level),available=previous||done;previous=done;return `<div class="cap-roadmap-step ${done?'done':available?'current':'future'}"><div class="cap-roadmap-marker">${done?'✓':i+1}</div><div><strong>${esc(level.name)}</strong><span>${done?'Validé':available?'Prochaine étape':skillAutoLabel(level)}</span></div></div>`}).join('')}</div>`;
}
function skillPerformanceRows(){
  const defs=[
    {label:'Tractions strictes',test:'pullups',targets:[1,5,8,12,15,20,25,30],unit:'reps'},
    {label:'Dips stricts',test:'dips',targets:[5,8,12,15,20,30,40],unit:'reps'},
    {label:'Dead hang',test:'dead_hang',targets:[30,45,60,90,120,150,180,240],unit:'s'},
    {label:'Handstand au mur',test:'wall_handstand',targets:[20,30,45,60,90],unit:'s'}
  ];
  return defs.map(d=>{const value=Number(performanceValueForTest(d.test)||0),next=d.targets.find(x=>x>value)||d.targets[d.targets.length-1],max=d.targets[d.targets.length-1];return {...d,value,next,pct:Math.min(100,Math.round(value/Math.max(1,next)*100)),maxed:value>=max};});
}
function recentSkillAchievements(limit=5){
  const rows=[];for(const tree of SKILL_TREES)for(const level of tree.levels)if(skillDone(level))rows.push({tree,level});return rows.slice(-limit).reverse();
}
function renderRankSystemV2(){
  const rs=getRankState();
  return `<div class="rank-v2-list">${RANKS.map((r,i)=>{const ev=evaluateRank(r),gates=ev.gates||[],stateLabel=i<rs.index?'Validé':i===rs.index?'Rang actuel':'À atteindre';return `<details class="rank-v2-row" ${i===rs.index||i===rs.index+1?'open':''}><summary><div><strong>${r.name}</strong><span>${r.title}</span></div><b>${stateLabel}</b></summary><div class="rank-v2-content">${gates.length?gates.map(g=>`<div class="${g.done?'done':''}"><div><span>${g.done?'✓':'○'}</span><strong>${g.label}</strong>${g.detail?`<small>${esc(g.detail)}</small>`:''}</div><b>${Number(g.current).toFixed(Number(g.current)%1?1:0)} / ${g.target}${g.unit?` ${g.unit}`:''}</b></div>`).join(''):'<p>Point de départ du système KINETIK.</p>'}</div></details>`}).join('')}</div><p class="rank-scale-note">Les rangs sont déterminés uniquement par les capacités démontrées. Ni l’âge du compte, ni le nombre de séances, ni les années de pratique ne bloquent une promotion. Un athlète expérimenté qui rejoint KINETIK peut donc atteindre rapidement son vrai rang en validant les barèmes stricts.</p>`;
}
function renderSkills(){
  const manual=getManualSkills(),rank=getRankState(),caps=capabilityScores(),focus=primarySkillTree(),fp=skillTreeProgress(focus),performances=skillPerformanceRows(),achievements=recentSkillAchievements(),allLevels=SKILL_TREES.flatMap(t=>t.levels),doneCount=allLevels.filter(skillDone).length;
  const nextGates=rank.next?rankGateRows(rank.next):[],weak=nextGates.filter(g=>!g.done).sort((a,b)=>a.progress-b.progress)[0];
  return shell(`<header class="topbar capabilities-topbar"><div><div class="brand">Capacités</div><div class="daylabel">Rangs par barèmes réels · aucune ancienneté requise · Légende quasi inaccessible</div></div></header>

  <section class="cap-rank-intro">
    <div><div class="kicker">Niveau KINETIK</div><h1>${rank.displayName}</h1><p>${rank.current.title} · rang basé sur les performances validées</p></div>
    <div class="cap-rank-next"><span>${rank.next?`Progression vers ${rank.next.name}`:'Rang maximal'}</span><strong>${Math.round(rank.readiness*100)}%</strong></div>
  </section>
  <div class="cap-rank-ladder">${RANKS.map((r,i)=>`<div class="${i<rank.index?'done':i===rank.index?'current':'future'}"><i></i><span>${r.name}</span></div>`).join('')}</div>
  <div class="rank-performance-only"><strong>Classement instantané</strong><span>Les rangs utilisent uniquement les tests, records et skills validés. Un athlète expérimenté n'a pas besoin d'attendre des mois dans KINETIK.</span></div>
  ${weak?`<div class="rank-bottleneck"><span>Facteur limitant actuel</span><strong>${weak.label}</strong><em>${Number(weak.current).toFixed(Number(weak.current)%1?1:0)} / ${weak.target}${weak.unit?` ${weak.unit}`:''}</em></div>`:''}

  <section class="cap-profile-section">
    <div class="cap-section-heading"><div><div class="kicker">Ton profil</div><h2>Capacités fondamentales</h2></div><p>Les scores sont non linéaires et plafonnés par type de preuve. Une seule performance peut construire une base, mais ne suffit plus pour atteindre les niveaux avancés.</p></div>
    <div class="capability-bars">${caps.map(c=>`<div class="${c.assessed?'':'unassessed'}"><div class="cap-label"><span>${c.label}</span><small>${esc(c.detail)}</small></div><div><i style="width:${c.assessed?c.score:0}%"></i></div><strong>${c.assessed?c.score:'—'}<small>${c.level}</small></strong></div>`).join('')}</div>
    <div class="cap-scale"><span>0 Fondations</span><span>30 Intermédiaire</span><span>60 Solide</span><span>75 Avancé</span><span>90 Expert</span><span>100 Hors-échelle</span></div>
  </section>

  <section class="cap-next-focus">
    <div class="cap-next-head"><div><div class="kicker">Objectif technique</div><h2>${esc(focus.name)}</h2><p>${esc(focus.description)}</p></div><div class="cap-focus-score"><strong>${fp.pct}%</strong><span>progression pondérée</span></div></div>
    ${renderSkillRoadmap(focus,true)}
    ${fp.next?`<div class="cap-next-action"><div><span>Étape actuelle</span><strong>${esc(fp.next.name)}</strong><small>${skillAutoLabel(fp.next)}</small></div>${fp.next.manual?`<button class="btn btn-secondary compact skill-toggle" data-skill="${fp.next.id}">${manual[fp.next.id]?'Retirer':'Valider'}</button>`:''}</div>`:''}
  </section>

  <section class="cap-skills-section">
    <div class="cap-section-heading"><div><div class="kicker">Skills</div><h2>Parcours techniques</h2></div><p>Les étapes avancées valent davantage que les fondations : 1 traction ne pèse plus autant qu'un muscle-up ou un front lever.</p></div>
    <div class="cap-skill-list">${SKILL_TREES.map(tree=>{const p=skillTreeProgress(tree);return `<details class="cap-skill-row" ${tree.id===focus.id?'open':''}><summary><div><strong>${esc(tree.name)}</strong><span>${p.next?`Prochaine étape · ${esc(p.next.name)}`:'Parcours validé'}</span></div><div class="cap-skill-progress"><i style="width:${p.pct}%"></i></div><b>${p.pct}%</b></summary><div class="cap-skill-detail"><p>${esc(tree.description)}</p>${renderSkillRoadmap(tree)}</div></details>`}).join('')}</div>
  </section>

  <section class="cap-performance-section">
    <div class="cap-section-heading"><div><div class="kicker">Standards</div><h2>Repères de progression</h2></div><p>Les derniers paliers sont volontairement espacés : progresser de 150 à 180 s de hang vaut beaucoup plus que de 15 à 30 s.</p></div>
    <div class="cap-performance-table">${performances.map(x=>`<div><div><strong>${x.label}</strong><span>${x.maxed?'Palier de maîtrise atteint':`Prochain repère · ${x.next} ${x.unit}`}</span></div><b>${x.value||'—'} <small>${x.value?x.unit:''}</small></b><div class="cap-standard-track"><i style="width:${x.value?x.pct:0}%"></i></div></div>`).join('')}</div>
  </section>

  ${achievements.length?`<section class="cap-achievements"><div class="cap-section-heading"><div><div class="kicker">Accomplissements</div><h2>Jalons validés</h2></div><strong>${doneCount}/${allLevels.length}</strong></div><div>${achievements.map(x=>`<div><span>✓</span><div><strong>${esc(x.level.name)}</strong><small>${esc(x.tree.name)}</small></div></div>`).join('')}</div></section>`:''}

  <section class="legend-standard"><div><div class="kicker">Échelle de maîtrise</div><h2>Légende se prouve, elle ne s'attend pas</h2><p>Le temps passé dans l'application ne compte pas. Un nouvel utilisateur déjà très avancé peut monter immédiatement s'il valide les standards. En revanche, Légende exige simultanément une moyenne de 90, aucun gros point faible et plusieurs performances de niveau expert.</p></div><div class="legend-standard-values"><div><span>Moyenne requise</span><strong>90 / 100</strong></div><div><span>Capacité minimale</span><strong>82+</strong></div><div><span>Skills maîtrise</span><strong>5</strong></div><div><span>Skills majeurs</span><strong>3</strong></div></div></section>

  <details class="cap-rank-details"><summary><div><div class="kicker">Système de rang</div><strong>Voir les exigences Bronze → Légende</strong></div><span>⌄</span></summary><div>${renderRankSystemV2()}</div></details>
  `, "skills");
}

const BODY_FIELDS = [
  {key:'weight',label:'Poids',unit:'kg',group:'Essentiels',step:.1,quick:true,lowerBetter:true},
  {key:'waist',label:'Tour de taille',unit:'cm',group:'Essentiels',step:.1,quick:true,lowerBetter:true},
  {key:'neck',label:'Tour de cou',unit:'cm',group:'Essentiels',step:.1,quick:true},
  {key:'shoulders',label:'Épaules',unit:'cm',group:'Haut du corps',step:.1},
  {key:'chest',label:'Poitrine',unit:'cm',group:'Haut du corps',step:.1},
  {key:'armLeft',label:'Bras gauche',unit:'cm',group:'Haut du corps',step:.1},
  {key:'armRight',label:'Bras droit',unit:'cm',group:'Haut du corps',step:.1},
  {key:'forearmLeft',label:'Avant-bras gauche',unit:'cm',group:'Haut du corps',step:.1},
  {key:'forearmRight',label:'Avant-bras droit',unit:'cm',group:'Haut du corps',step:.1},
  {key:'hips',label:'Hanches',unit:'cm',group:'Bas du corps',step:.1},
  {key:'thighLeft',label:'Cuisse gauche',unit:'cm',group:'Bas du corps',step:.1},
  {key:'thighRight',label:'Cuisse droite',unit:'cm',group:'Bas du corps',step:.1},
  {key:'calfLeft',label:'Mollet gauche',unit:'cm',group:'Bas du corps',step:.1},
  {key:'calfRight',label:'Mollet droit',unit:'cm',group:'Bas du corps',step:.1},
  {key:'restingHr',label:'FC au repos',unit:'bpm',group:'Optionnel',step:1,lowerBetter:true},
  {key:'scaleBodyFat',label:'Masse grasse balance',unit:'%',group:'Optionnel',step:.1,lowerBetter:true},
];
const BODY_SYMMETRY = [
  ['Bras','armLeft','armRight'],['Avant-bras','forearmLeft','forearmRight'],['Cuisses','thighLeft','thighRight'],['Mollets','calfLeft','calfRight']
];
function defaultBodyConfig(){
  const tracked={};BODY_FIELDS.forEach(f=>tracked[f.key]=true);
  return {bodyFatFormula:'male',bodyFatSource:'auto',tracked,goals:{weight:null,waist:null,bodyFat:null,chest:null,armLeft:null,armRight:null,thighLeft:null,thighRight:null},frequencies:{weightDays:1,waistDays:7,completeDays:14,photoDays:28},customFields:[]};
}
function mergeBodyConfig(raw={}){
  const d=defaultBodyConfig();return {...d,...raw,tracked:{...d.tracked,...(raw.tracked||{})},goals:{...d.goals,...(raw.goals||{})},frequencies:{...d.frequencies,...(raw.frequencies||{})},customFields:Array.isArray(raw.customFields)?raw.customFields:[]};
}
function bodyFieldDef(key){return BODY_FIELDS.find(f=>f.key===key)||getBodyConfig().customFields.find(f=>f.key===key)||null;}
function bodyValue(log,key){if(!log)return null;const v=key.startsWith('custom_')?log.custom?.[key]:log[key];return Number(v)>0?Number(v):null;}
function latestBodyValue(logs,key){for(const l of logs||[]){const v=bodyValue(l,key);if(v!=null)return {value:v,log:l};}return null;}
function earliestBodyValue(logs,key){for(const l of [...(logs||[])].reverse()){const v=bodyValue(l,key);if(v!=null)return {value:v,log:l};}return null;}
function bodyPeriodBounds(period=state.bodyPeriod){
  const end=new Date();end.setHours(23,59,59,999);let start=null;
  if(period==='custom'){start=state.bodyPeriodFrom?new Date(`${state.bodyPeriodFrom}T00:00:00`):null;const customEnd=state.bodyPeriodTo?new Date(`${state.bodyPeriodTo}T23:59:59.999`):end;return {start,end:customEnd};}
  const days=({'7d':7,'30d':30,'90d':90,'180d':180,'365d':365})[period];if(days){start=new Date(end);start.setDate(start.getDate()-days+1);start.setHours(0,0,0,0);}return {start,end};
}
function bodyLogsInPeriod(period=state.bodyPeriod){const {start,end}=bodyPeriodBounds(period);return getBodyLogs().filter(l=>{const d=new Date(l.date);return (!start||d>=start)&&d<=end;});}
function bodyPeriodDelta(logs,key){const a=latestBodyValue(logs,key),b=earliestBodyValue(logs,key);if(!a||!b||a.log.id===b.log.id)return null;const d=a.value-b.value;return Math.abs(d)<.05?0:d;}
function bodyTrendText(value,unit,lowerIsBetter=false){if(value==null)return 'Pas assez de données';if(value===0)return 'Stable sur la période';const sign=value>0?'+':'−',abs=Math.abs(value).toFixed(1).replace('.0','');const good=lowerIsBetter?value<0:null;return `${sign}${abs} ${unit}${good===true?' · favorable':good===false?' · à surveiller':''}`;}
function bodyAverageDays(key,days=7){const cutoff=Date.now()-days*86400000,vals=getBodyLogs().filter(l=>new Date(l.date).getTime()>=cutoff).map(l=>bodyValue(l,key)).filter(v=>v!=null);return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;}
function bodyFatForLog(log,cfg=getBodyConfig()){
  if(!log)return null;const scale=bodyValue(log,'scaleBodyFat');if(cfg.bodyFatSource==='scale')return scale;if(cfg.bodyFatSource==='auto'&&scale)return scale;if(cfg.bodyFatFormula==='off')return null;
  return estimateBodyFatByFormula(log,cfg.bodyFatFormula);
}
function estimateBodyFatByFormula(log,formula='male'){
  const h=Number(log?.height||getCanonicalHeight()),w=Number(log?.waist),n=Number(log?.neck),hip=Number(log?.hips);if(!(h>0&&w>0&&n>0))return null;const inch=2.54;let result=null;
  if(formula==='female'){if(!(hip>0&&w+hip>n))return null;result=163.205*Math.log10((w+hip-n)/inch)-97.684*Math.log10(h/inch)-78.387;}
  else {if(!(w>n))return null;result=86.010*Math.log10((w-n)/inch)-70.041*Math.log10(h/inch)+36.76;}
  return clamp(result,2,60);
}
function bodyDerived(log){if(!log)return{};const cfg=getBodyConfig(),weight=bodyValue(log,'weight'),waist=bodyValue(log,'waist'),height=Number(log.height||getCanonicalHeight()||0),bf=bodyFatForLog(log,cfg);return {bf,bmi:weight&&height?weight/((height/100)**2):null,whtr:waist&&height?waist/height:null,lean:weight&&bf!=null?weight*(1-bf/100):null};}
function bodyGoalProgress(key,current){const cfg=getBodyConfig(),target=Number(cfg.goals?.[key]);if(!(target>0)||!(current>0))return null;let start=null;if(key==='bodyFat'){for(const l of [...getBodyLogs()].reverse()){const v=bodyFatForLog(l,cfg);if(v!=null){start=v;break;}}}else start=earliestBodyValue(getBodyLogs(),key)?.value;if(!(start>0)||Math.abs(start-target)<.01)return null;const pct=clamp(((start-current)/(start-target))*100,0,100);return {start,target,pct};}
function bodySymmetry(logs,label,leftKey,rightKey){const l=latestBodyValue(logs,leftKey)?.value,r=latestBodyValue(logs,rightKey)?.value;if(!(l>0&&r>0))return null;const diff=Math.abs(l-r),pct=diff/((l+r)/2)*100;return {label,l,r,diff,pct};}
function bodyDataQuality(){const logs=getBodyLogs(),now=Date.now(),within=d=>logs.filter(l=>new Date(l.date).getTime()>=now-d*86400000),m30=within(30);const weights=m30.filter(l=>bodyValue(l,'weight')).length,waists=m30.filter(l=>bodyValue(l,'waist')).length,complete=m30.filter(l=>BODY_FIELDS.filter(f=>!f.quick&&bodyValue(l,f.key)).length>=4).length,photos=m30.filter(l=>bodyPhotoId(l,'front')||bodyPhotoId(l,'side')||bodyPhotoId(l,'back')).length;const score=Math.round(clamp((Math.min(weights,8)/8)*35+(Math.min(waists,4)/4)*30+(Math.min(complete,2)/2)*20+(Math.min(photos,1))*15,0,100));const label=score>=80?'Très bon':score>=55?'Bon':score>=30?'À renforcer':'Insuffisant';return {score,label,weights,waists,complete,photos};}
function bodyTrackingSchedule(){const logs=getBodyLogs(),cfg=getBodyConfig(),daysSince=log=>log?Math.floor((Date.now()-new Date(log.date).getTime())/86400000):9999,lastFor=pred=>logs.find(pred),items=[['Poids',cfg.frequencies.weightDays,lastFor(l=>bodyValue(l,'weight'))],['Tour de taille',cfg.frequencies.waistDays,lastFor(l=>bodyValue(l,'waist'))],['Bilan complet',cfg.frequencies.completeDays,lastFor(l=>BODY_FIELDS.filter(f=>!f.quick&&bodyValue(l,f.key)).length>=4)],['Photos',cfg.frequencies.photoDays,lastFor(l=>bodyPhotoId(l,'front')||bodyPhotoId(l,'side')||bodyPhotoId(l,'back'))]];return items.map(([label,every,last])=>{const age=daysSince(last),remaining=Math.max(0,Number(every||1)-age);return {label,every,age,due:!last||age>=every,text:!last?'À commencer':age>=every?'À faire':remaining===1?'demain':`dans ${remaining} j`};});}
function bodyPhotoId(log,pos='front'){return log?.photoIds?.[pos]||(pos==='front'?log?.photoId:null)||null;}
function bodyPhotoLogs(pos='front'){return getBodyLogs().filter(l=>bodyPhotoId(l,pos));}
function bodyTrainingContext(){const {start,end}=bodyPeriodBounds(),sessions=getHistory().filter(h=>{const d=new Date(h.date);return (!start||d>=start)&&d<=end;}),quick=getQuickLogs().filter(q=>{const d=new Date(q.date);return (!start||d>=start)&&d<=end;});let reps=0;sessions.forEach(h=>(h.entries||[]).forEach(e=>{if(String(e.type||'').startsWith('reps'))reps+=Number(e.value||0)*(e.type==='reps_side'?2:1);}));quick.forEach(q=>{if(String(q.type||'').startsWith('reps'))reps+=Number(q.value||0)*(q.type==='reps_side'?2:1);});return {sessions:sessions.length,reps,minutes:sessions.reduce((a,h)=>a+Number(h.durationMinutes||0),0)};}
function bodyCycleSummary(logs){const counts={};for(const l of logs){const n=l.trainingCycleName||l.cycleName||trainingCycleForDate(l.date)?.name||'Cycle de base';counts[n]=(counts[n]||0)+1;}return Object.entries(counts).sort((a,b)=>b[1]-a[1]);}
function renderBodyGoalCard(key,label,current,unit){const g=bodyGoalProgress(key,current);if(!g)return'';return `<article class="body-goal"><div><strong>${label}</strong><small>${Number(current).toFixed(1).replace('.0','')} ${unit} → cible ${g.target} ${unit}</small></div><b>${Math.round(g.pct)}%</b><div class="body-goal-bar"><span style="width:${g.pct}%"></span></div></article>`;}
function renderBodyFieldValue(logs,key){const d=bodyFieldDef(key),x=latestBodyValue(logs,key);if(!d||!x)return'';return `<div class="body-current-row"><span>${d.label}</span><strong>${x.value.toFixed(d.step<1?1:0).replace('.0','')} ${d.unit}</strong></div>`;}


const BODY_CHART_METRICS=[
  ['weight','Poids','kg'],['waist','Tour de taille','cm'],['bodyFat','Masse grasse','%'],['leanMass','Masse maigre','kg']
];
function bodyMetricDefinition(key){
  if(key==='bodyFat')return {key,label:'Masse grasse',unit:'%',value:l=>bodyDerived(l).bf};
  if(key==='leanMass')return {key,label:'Masse maigre',unit:'kg',value:l=>bodyDerived(l).lean};
  const f=bodyFieldDef(key)||{label:key,unit:''};return {key,label:f.label,unit:f.unit,value:l=>bodyValue(l,key)};
}
function bodyMetricPoints(logs,key){
  const d=bodyMetricDefinition(key);
  return (logs||[]).slice().reverse().map(l=>({log:l,value:Number(d.value(l)),date:new Date(l.date)})).filter(x=>Number.isFinite(x.value)&&x.value>0);
}
function bodyMetricDelta(logs,key){
  const pts=bodyMetricPoints(logs,key);if(pts.length<2)return null;const d=pts[pts.length-1].value-pts[0].value;return Math.abs(d)<.05?0:d;
}
function bodyMovingAverage(points,window=7){
  return points.map((p,i)=>{const slice=points.slice(Math.max(0,i-window+1),i+1),avg=slice.reduce((s,x)=>s+x.value,0)/slice.length;return {...p,value:avg};});
}
function bodyTrendClass(delta,key){
  if(delta==null||delta===0)return 'neutral';
  const lower=['weight','waist','bodyFat'].includes(key);
  return lower?(delta<0?'good':'neutral'):'neutral';
}
function bodyMetricTrendText(logs,key){
  const d=bodyMetricDefinition(key),delta=bodyMetricDelta(logs,key);
  if(delta==null)return 'Pas assez de données';
  if(delta===0)return 'Stable';
  return `${delta>0?'+':'−'}${Math.abs(delta).toFixed(1).replace('.0','')} ${d.unit}`;
}
function renderBodyTrendChart(logs,key,compareKey='none'){
  const mainDef=bodyMetricDefinition(key),pts=bodyMetricPoints(logs,key),compareDef=compareKey&&compareKey!=='none'?bodyMetricDefinition(compareKey):null,comparePts=compareDef?bodyMetricPoints(logs,compareKey):[];
  if(!pts.length)return `<div class="measurement-no-data"><strong>Aucune donnée ${esc(mainDef.label.toLowerCase())}</strong><span>Ajoute une mesure pour commencer.</span></div>`;
  if(pts.length===1)return `<div class="measurement-one-point"><div class="one-point-value"><span>${esc(mainDef.label)}</span><strong>${pts[0].value.toFixed(1)} <small>${mainDef.unit}</small></strong></div><div class="one-point-message"><strong>Point de départ enregistré</strong><p>Une deuxième mesure permettra de calculer une évolution. KINETIK n'affiche pas de tendance artificielle avec un seul relevé.</p></div></div>`;
  const w=820,h=285,L=35,R=805,T=20,B=246;
  const mainVals=pts.map(x=>x.value),mn=Math.min(...mainVals),mx=Math.max(...mainVals),pad=Math.max((mx-mn)*.18,.3),lo=mn-pad,hi=mx+pad,range=Math.max(.1,hi-lo);
  const xFor=(i,n)=>L+(i/(Math.max(1,n-1)))*(R-L),yFor=v=>T+(1-(v-lo)/range)*(B-T);
  const coords=pts.map((p,i)=>[xFor(i,pts.length),yFor(p.value)]);
  const points=coords.map(x=>x.join(',')).join(' '),area=`${L},${B} ${points} ${R},${B}`;
  const trendPts=key==='weight'&&pts.length>=4?bodyMovingAverage(pts,Math.min(7,pts.length)):null;
  const trendCoords=trendPts?trendPts.map((p,i)=>[xFor(i,trendPts.length),yFor(p.value)]):[];
  let comparePath='';
  if(comparePts.length>=2){
    const cvals=comparePts.map(x=>x.value),cmin=Math.min(...cvals),cmax=Math.max(...cvals),cr=Math.max(.1,cmax-cmin);
    const cc=comparePts.map((p,i)=>[xFor(i,comparePts.length),T+(1-(p.value-cmin)/cr)*(B-T)]);
    comparePath=`<polyline points="${cc.map(x=>x.join(',')).join(' ')}" class="body-chart-compare" vector-effect="non-scaling-stroke"/>`;
  }
  const eventMarks=pts.map((p,i)=>{if(i===0)return'';const prev=pts[i-1].log.trainingCycleName||'',cur=p.log.trainingCycleName||'';if(cur&&cur!==prev){const x=xFor(i,pts.length);return `<g class="body-chart-event"><line x1="${x}" y1="${T}" x2="${x}" y2="${B}"/><text x="${Math.min(x+5,R-90)}" y="${T+12}">${esc(cur.slice(0,18))}</text></g>`;}return'';}).join('');
  const delta=bodyMetricDelta(logs,key),latest=pts[pts.length-1];
  return `<div class="body-main-chart">
    <div class="body-main-chart-summary"><div><span>${esc(mainDef.label)}</span><strong>${latest.value.toFixed(1)} <small>${mainDef.unit}</small></strong></div><div class="body-main-chart-change ${bodyTrendClass(delta,key)}"><span>Évolution période</span><strong>${bodyMetricTrendText(logs,key)}</strong></div>${trendPts?`<div><span>Tendance</span><strong>${trendPts[trendPts.length-1].value.toFixed(1)} ${mainDef.unit}</strong></div>`:''}</div>
    <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Évolution ${esc(mainDef.label)}">
      <line x1="${L}" y1="${T+(B-T)*.25}" x2="${R}" y2="${T+(B-T)*.25}" class="body-chart-grid"/>
      <line x1="${L}" y1="${T+(B-T)*.5}" x2="${R}" y2="${T+(B-T)*.5}" class="body-chart-grid"/>
      <line x1="${L}" y1="${T+(B-T)*.75}" x2="${R}" y2="${T+(B-T)*.75}" class="body-chart-grid"/>
      <polygon points="${area}" class="body-chart-area"/>
      ${comparePath}
      <polyline points="${points}" class="body-chart-line" vector-effect="non-scaling-stroke"/>
      ${trendCoords.length?`<polyline points="${trendCoords.map(x=>x.join(',')).join(' ')}" class="body-chart-trend" vector-effect="non-scaling-stroke"/>`:''}
      ${eventMarks}
      <circle cx="${coords[coords.length-1][0]}" cy="${coords[coords.length-1][1]}" r="4" class="body-chart-last"/>
    </svg>
    <div class="body-chart-axis"><span>${formatShortDate(pts[0].log.date)}</span><span>${formatShortDate(pts[Math.floor((pts.length-1)/2)].log.date)}</span><span>${formatShortDate(latest.log.date)}</span></div>
    ${compareDef&&comparePts.length>=2?`<div class="body-chart-legend"><span><i></i>${esc(mainDef.label)}</span><span class="compare"><i></i>${esc(compareDef.label)} · échelle normalisée</span></div>`:''}
  </div>`;
}
function renderBodyKinetikInsight(logs,context){
  const n=logs.length,wd=bodyMetricDelta(logs,'weight'),wa=bodyMetricDelta(logs,'waist');
  if(n<2)return `<section class="kinetik-reading"><div class="kicker">Lecture KINETIK</div><h2>Construisons d'abord une tendance</h2><p>Un seul relevé donne un point de départ, pas une progression. Ajoute une seconde mesure dans des conditions comparables pour commencer l'analyse.</p><strong>À surveiller</strong><span>Poids et tour de taille sont les deux indicateurs les plus utiles à mesurer régulièrement.</span></section>`;
  let title='Tendance en construction',text='Tes mesures commencent à former une tendance. KINETIK la met en perspective avec ton entraînement sans surinterpréter les variations isolées.',watch='Continue à mesurer dans des conditions similaires.';
  if(wd!=null&&wa!=null){
    if(Math.abs(wd)<.5&&wa<-.5){title='Recomposition possible';text=`Ton poids est globalement stable (${bodyMetricTrendText(logs,'weight')}) tandis que ton tour de taille diminue (${bodyMetricTrendText(logs,'waist')}). Avec ${context.sessions} séance${context.sessions>1?'s':''} sur la période, ce profil est compatible avec une amélioration de composition corporelle.`;watch='Confirme la tendance avec plusieurs mesures hebdomadaires avant de conclure.';}
    else if(wd<-.5&&wa<-.5){title='Tendance descendante cohérente';text=`Poids et tour de taille diminuent ensemble sur la période (${bodyMetricTrendText(logs,'weight')} · ${bodyMetricTrendText(logs,'waist')}).`;watch='Surveille aussi les performances pour vérifier que la baisse reste compatible avec tes objectifs sportifs.';}
    else if(wd>.8&&wa<.2){title='Poids en hausse, tour de taille stable';text=`Le poids augmente (${bodyMetricTrendText(logs,'weight')}) sans hausse nette du tour de taille. Le poids seul ne suffit donc pas à juger l'évolution.`;watch='Observe la tendance sur plusieurs semaines et rapproche-la des performances et du volume.';}
    else if(wd>.8&&wa>.5){title='Hausse simultanée à surveiller';text=`Poids et tour de taille augmentent sur la période. KINETIK signale simplement cette évolution mesurée, sans en déduire une cause.`;watch="Vérifie la régularité des mesures et prolonge la période d'observation.";}
  }
  return `<section class="kinetik-reading"><div class="kicker">Lecture KINETIK</div><h2>${title}</h2><p>${text}</p><strong>À surveiller</strong><span>${watch}</span></section>`;
}
function renderBodyCompositionVisual(latest){
  if(!latest)return '';
  const d=bodyDerived(latest),bf=d.bf;
  if(bf==null)return `<div class="composition-unavailable"><div class="kicker">Composition corporelle</div><h2>Estimation non disponible</h2><p>Complète les données nécessaires dans un bilan complet pour afficher cette lecture.</p></div>`;
  const fatKg=d.weight?d.weight*bf/100:null;
  return `<section class="body-composition-optimal"><div><div class="kicker">Composition corporelle</div><h2>${bf.toFixed(1)} % <small>estimé</small></h2><p>Estimation calculée à partir des données disponibles. À utiliser comme tendance, pas comme mesure clinique.</p></div><div class="composition-bar"><span style="width:${Math.max(3,Math.min(97,bf))}%"></span></div><div class="composition-values"><div><span>Masse maigre</span><strong>${d.lean!=null?d.lean.toFixed(1)+' kg':'—'}</strong></div><div><span>Masse grasse</span><strong>${fatKg!=null?fatKg.toFixed(1)+' kg':'—'}</strong></div><div><span>IMC</span><strong>${d.bmi!=null?d.bmi.toFixed(1):'—'}</strong></div><div><span>Ratio tour de taille / taille</span><strong>${d.whtr!=null?d.whtr.toFixed(2):'—'}</strong></div></div></section>`;
}
function renderBodyMeasurementGroups(all,cfg){
  const groups=['Essentiels','Haut du corps','Bas du corps','Optionnel'];
  const native=groups.map(g=>{
    const fields=BODY_FIELDS.filter(f=>f.group===g&&cfg.tracked?.[f.key]!==false&&latestBodyValue(all,f.key));
    if(!fields.length)return'';
    return `<details class="measurement-group" ${g==='Essentiels'?'open':''}><summary><strong>${g}</strong><span>${fields.length} mesures</span></summary><div class="measurement-table">${fields.map(f=>{const now=latestBodyValue(all,f.key),delta=bodyMetricDelta(all,f.key);return `<div><span>${esc(f.label)}</span><strong>${now?now.value.toFixed(1).replace('.0','')+' '+f.unit:'—'}</strong><small>${delta==null?'—':`${delta>0?'+':''}${delta.toFixed(1).replace('.0','')} ${f.unit}`}</small></div>`;}).join('')}</div></details>`;
  }).join('');
  const custom=(cfg.customFields||[]).filter(f=>f.visible!==false&&latestBodyValue(all,f.key));
  const customHtml=custom.length?`<details class="measurement-group"><summary><strong>Champs personnalisés</strong><span>${custom.length} mesure${custom.length>1?'s':''}</span></summary><div class="measurement-table">${custom.map(f=>{const now=latestBodyValue(all,f.key),delta=bodyMetricDelta(all,f.key),unit=esc(f.unit||'');return `<div><span>${esc(f.label)}</span><strong>${now?now.value.toFixed(1).replace('.0','')+(unit?' '+unit:''):'—'}</strong><small>${delta==null?'—':`${delta>0?'+':''}${delta.toFixed(1).replace('.0','')}${unit?' '+unit:''}`}</small></div>`;}).join('')}</div></details>`:'';
  return native+customHtml;
}
function renderBodyGoals(logs){
  const cfg=getBodyConfig(),cards=[];
  const defs=[['weight','Poids','kg'],['waist','Tour de taille','cm'],['chest','Poitrine','cm'],['armLeft','Bras gauche','cm'],['armRight','Bras droit','cm'],['thighLeft','Cuisse gauche','cm'],['thighRight','Cuisse droite','cm']];
  defs.forEach(([key,label,unit])=>{if(Number(cfg.goals?.[key])>0){const current=latestBodyValue(logs,key)?.value,html=renderBodyGoalCard(key,label,current,unit);if(html)cards.push(html);}});
  if(Number(cfg.goals?.bodyFat)>0){let current=null;for(const l of logs||[]){const v=bodyFatForLog(l,cfg);if(v!=null){current=v;break;}}const html=renderBodyGoalCard('bodyFat','Masse grasse',current,'%');if(html)cards.push(html);}
  return cards.length?`<section class="measurement-goals"><div class="measurement-section-title"><div><div class="kicker">Objectifs</div><h2>Cap actuel</h2></div><button class="btn btn-outline compact" id="openBodySettingsGoals">Modifier</button></div><div class="body-goals-grid">${cards.join('')}</div></section>`:'';
}
function renderMeasurements(){
  const all=getBodyLogs(),logs=bodyLogsInPeriod(),cfg=getBodyConfig(),latest=all[0],latestDerived=bodyDerived(latest),quality=bodyDataQuality(),context=bodyTrainingContext(),schedule=bodyTrackingSchedule(),sym=BODY_SYMMETRY.map(x=>bodySymmetry(all,...x)).filter(Boolean);
  const latestW=latestBodyValue(all,'weight')?.value,latestWaist=latestBodyValue(all,'waist')?.value;
  const metric=BODY_CHART_METRICS.some(x=>x[0]===state.bodyMetric)?state.bodyMetric:'weight',compare=BODY_CHART_METRICS.some(x=>x[0]===state.bodyCompareMetric)?state.bodyCompareMetric:'none';
  const allPhotoLogs=all.filter(l=>bodyPhotoId(l,'front')||bodyPhotoId(l,'side')||bodyPhotoId(l,'back')),photoLogs=bodyPhotoLogs(state.bodyPhotoComparePosition),aId=state.bodyPhotoCompareA||String(photoLogs[0]?.id||''),bId=state.bodyPhotoCompareB||String(photoLogs[photoLogs.length-1]?.id||'');
  const aLog=photoLogs.find(l=>String(l.id)===String(aId)),bLog=photoLogs.find(l=>String(l.id)===String(bId));
  return shell(`<header class="topbar measurement-optimal-top"><div><div class="brand">Mesures</div><div class="daylabel">Suis ton physique et comprends tes tendances</div></div><div class="measurement-top-actions"><button class="btn btn-outline compact" id="openBodySettings">⚙ Réglages</button><button class="btn btn-primary compact" id="addBody">＋ Nouvelle mesure</button></div></header>
  ${!latest?`<section class="measurement-start"><div class="kicker">Point de départ</div><h1>Commence ton suivi physique</h1><p>Enregistre une première mesure. KINETIK attendra suffisamment de données avant d'afficher une tendance.</p><button class="btn btn-primary" id="addBodyEmpty">Ajouter ma première mesure</button></section>`:`
  <section class="measurement-current-line">
    <div><span>Poids</span><strong>${latestW?latestW.toFixed(1):'—'} <small>kg</small></strong><em>${bodyMetricTrendText(logs,'weight')}</em></div>
    <div><span>Tour de taille</span><strong>${latestWaist?latestWaist.toFixed(1):'—'} <small>cm</small></strong><em>${bodyMetricTrendText(logs,'waist')}</em></div>
    <div><span>Masse grasse</span><strong>${latestDerived.bf!=null?latestDerived.bf.toFixed(1):'—'} <small>%</small></strong><em>estimée</em></div>
    <div><span>Masse maigre</span><strong>${latestDerived.lean!=null?latestDerived.lean.toFixed(1):'—'} <small>kg</small></strong><em>estimée</em></div>
  </section>
  <div class="measurement-last-note">Dernier relevé · ${formatDate(latest.date)} · ${all.length} mesure${all.length>1?'s':''}</div>
  ${renderBodyGoals(all)}

  <section class="measurement-progress-main">
    <div class="measurement-progress-head"><div><div class="kicker">Progression physique</div><h1>${esc(bodyMetricDefinition(metric).label)}</h1></div><div class="measurement-periods">${[['7d','7 j'],['30d','30 j'],['90d','3 mois'],['180d','6 mois'],['365d','1 an'],['all','Tout']].map(([id,l])=>`<button data-body-period="${id}" class="${state.bodyPeriod===id?'active':''}">${l}</button>`).join('')}</div></div>
    <div class="measurement-metric-switch">${BODY_CHART_METRICS.map(([id,l])=>`<button data-body-metric="${id}" class="${metric===id?'active':''}">${l}</button>`).join('')}</div>
    <div class="measurement-compare-control"><label>Comparer avec <select id="bodyCompareMetric"><option value="none">Aucune autre métrique</option>${BODY_CHART_METRICS.filter(x=>x[0]!==metric).map(([id,l])=>`<option value="${id}" ${compare===id?'selected':''}>${l}</option>`).join('')}</select></label></div>
    ${renderBodyTrendChart(logs,metric,compare)}
  </section>

  ${renderBodyKinetikInsight(logs,context)}
  ${renderBodyCompositionVisual(latest)}

  <section class="measurements-complete-section"><div class="measurement-section-title"><div><div class="kicker">Mensurations détaillées</div><h2>Le détail quand tu en as besoin</h2></div><button class="btn btn-secondary compact" id="addBodyFull">Bilan complet</button></div>${renderBodyMeasurementGroups(all,cfg)}
    ${sym.length?`<details class="measurement-group"><summary><strong>Symétrie</strong><span>${sym.length} comparaisons</span></summary><div class="symmetry-optimal">${sym.map(x=>`<div><div><strong>${x.label}</strong><span>G ${x.l.toFixed(1)} · D ${x.r.toFixed(1)} cm</span></div><div class="symmetry-bar"><i style="width:${Math.min(100,x.pct*8)}%"></i></div><b>${x.pct.toFixed(1)} %</b></div>`).join('')}</div></details>`:''}
  </section>

  ${allPhotoLogs.length?`<details class="measurement-lower-section"><summary><div><div class="kicker">Progression visuelle</div><strong>Comparer mes photos</strong></div><span>⌄</span></summary><div class="measurement-lower-content"><div class="body-photo-tabs">${[['front','Face'],['side','Profil'],['back','Dos']].map(([id,l])=>`<button class="body-photo-tab ${state.bodyPhotoComparePosition===id?'active':''}" data-photo-position="${id}">${l}</button>`).join('')}</div>${photoLogs.length?`<div class="body-photo-selects"><select id="bodyPhotoA">${photoLogs.map(l=>`<option value="${l.id}" ${String(l.id)===String(aId)?'selected':''}>${formatDate(l.date)}</option>`).join('')}</select><span>↔</span><select id="bodyPhotoB">${photoLogs.map(l=>`<option value="${l.id}" ${String(l.id)===String(bId)?'selected':''}>${formatDate(l.date)}</option>`).join('')}</select></div><div class="body-photo-compare"><figure>${aLog?`<img data-body-photo-id="${bodyPhotoId(aLog,state.bodyPhotoComparePosition)||''}" alt="Photo A">`:''}<figcaption>${aLog?formatDate(aLog.date):'—'}</figcaption></figure><figure>${bLog?`<img data-body-photo-id="${bodyPhotoId(bLog,state.bodyPhotoComparePosition)||''}" alt="Photo B">`:''}<figcaption>${bLog?formatDate(bLog.date):'—'}</figcaption></figure></div>`:''}</div></details>`:''}

  <details class="measurement-lower-section"><summary><div><div class="kicker">Historique</div><strong>${all.length} relevé${all.length>1?'s':''}</strong></div><span>⌄</span></summary><div class="measurement-lower-content"><div class="measurement-history-table"><div class="head"><span>Date</span><span>Poids</span><span>Tour taille</span><span>MG</span></div>${all.slice(0,8).map(l=>{const d=bodyDerived(l);return `<div><span>${formatDate(l.date)}</span><strong>${bodyValue(l,'weight')!=null?Number(bodyValue(l,'weight')).toFixed(1)+' kg':'—'}</strong><span>${bodyValue(l,'waist')!=null?Number(bodyValue(l,'waist')).toFixed(1)+' cm':'—'}</span><span>${d.bf!=null?d.bf.toFixed(1)+' %':'—'}</span></div>`;}).join('')}</div></div></details>

  <section class="measurement-data-quality"><div><span>Qualité des tendances</span><strong>${quality.label}</strong></div><div class="body-quality-bar"><span style="width:${quality.score}%"></span></div><p>${quality.score}% · ${quality.weights} pesées · ${quality.waists} tours de taille · ${quality.complete} bilans complets sur 30 jours.</p></section>
  <div class="measurement-frequency-note"><strong>Fréquence recommandée</strong><span>${schedule[0]?.text||'Mesure régulièrement, dans des conditions similaires.'}</span></div>
  `}
  ${renderBodySettingsPanel()}`, 'measurements');
}
function renderBodySettingsPanel(){return `<details class="parameter-details body-settings measurement-settings" id="bodySettings" ${state.bodySettingsOpen?'open':''}><summary><div><strong>Réglages des mesures</strong><small>Fréquences · objectifs · champs suivis · composition corporelle</small></div><span>⌄</span></summary><div class="parameter-body">${state.bodySettingsMessage?`<div class="body-settings-confirm" role="status">✓ ${esc(state.bodySettingsMessage)}</div>`:''}${renderBodySettings()}</div></details>`;}
function renderBodySettings(){const cfg=getBodyConfig();const goalDefs=[['weight','Poids','kg'],['waist','Tour de taille','cm'],['bodyFat','Masse grasse','%'],['chest','Poitrine','cm'],['armLeft','Bras gauche (biceps + triceps)','cm'],['armRight','Bras droit (biceps + triceps)','cm'],['thighLeft','Cuisse G','cm'],['thighRight','Cuisse D','cm']];return `<div class="body-setting-section"><h3>Calcul de composition corporelle</h3><div class="parameter-grid"><label><span>Formule anthropométrique</span><select id="bodyFatFormula"><option value="male" ${cfg.bodyFatFormula==='male'?'selected':''}>US Navy · homme</option><option value="female" ${cfg.bodyFatFormula==='female'?'selected':''}>US Navy · femme</option><option value="off" ${cfg.bodyFatFormula==='off'?'selected':''}>Désactivée</option></select></label><label><span>Source masse grasse</span><select id="bodyFatSource"><option value="auto" ${cfg.bodyFatSource==='auto'?'selected':''}>Auto · balance puis estimation</option><option value="estimate" ${cfg.bodyFatSource==='estimate'?'selected':''}>Estimation uniquement</option><option value="scale" ${cfg.bodyFatSource==='scale'?'selected':''}>Balance uniquement</option></select></label></div><p class="muted small">L'estimation anthropométrique est indicative. Pour la formule femme, hanches + taille + cou sont nécessaires.</p></div><div class="divider"></div><div class="body-setting-section"><h3>Fréquences recommandées</h3><div class="parameter-grid threshold-grid"><label><span>Poids · tous les</span><input class="mini-input body-freq" data-freq="weightDays" type="number" min="1" value="${cfg.frequencies.weightDays}"></label><label><span>Tour de taille · tous les</span><input class="mini-input body-freq" data-freq="waistDays" type="number" min="1" value="${cfg.frequencies.waistDays}"></label><label><span>Bilan complet · tous les</span><input class="mini-input body-freq" data-freq="completeDays" type="number" min="1" value="${cfg.frequencies.completeDays}"></label><label><span>Photos · tous les</span><input class="mini-input body-freq" data-freq="photoDays" type="number" min="1" value="${cfg.frequencies.photoDays}"></label></div><small class="muted">Valeurs en jours. Elles servent de repères, pas d'obligation.</small></div><div class="divider"></div><div class="body-setting-section"><h3>Objectifs</h3><div class="target-editor-list">${goalDefs.map(([k,l,u])=>`<div class="target-editor-row"><strong>${l}</strong><label><span>Cible ${u}</span><input class="mini-input body-goal-input" data-body-goal="${k}" type="number" min="0" step="0.1" value="${cfg.goals[k]??''}" placeholder="—"></label></div>`).join('')}</div></div><div class="divider"></div><div class="body-setting-section"><div class="section-head"><div><h3>Champs suivis</h3><small class="muted">Masque ce que tu n'utilises pas.</small></div><button class="btn btn-outline compact" id="addCustomBodyField">＋ Champ perso</button></div><div class="body-track-grid">${BODY_FIELDS.map(f=>`<label class="body-track"><input class="body-track-input" data-body-track="${f.key}" type="checkbox" ${cfg.tracked[f.key]!==false?'checked':''}><span>${f.label}</span></label>`).join('')}${cfg.customFields.map(f=>`<div class="body-track custom"><label><input class="body-track-custom" data-custom-track="${f.key}" type="checkbox" ${f.visible!==false?'checked':''}><span>${esc(f.label)} (${esc(f.unit||'')})</span></label><button class="body-remove-custom" data-remove-custom="${f.key}">×</button></div>`).join('')}</div></div><div class="parameter-actions"><button class="btn btn-primary" id="saveBodyConfig">Enregistrer</button><button class="btn btn-outline" id="resetBodyConfig">Valeurs par défaut</button></div>`;}

function renderProfile(){const p=getPrefs();return shell(`<header class="topbar"><div><button class="profile-back-link" data-view="athlete">← Mon profil sportif</button><div class="brand">Réglages KINETIK</div><div class="daylabel">Application, données et préférences</div></div></header>
  <section class="card"><h2>Coach adaptatif</h2><div class="switchline"><div><strong>Progression intelligente</strong><div class="small muted">Ajuste légèrement les objectifs selon tes dernières séances, ton effort et les gênes articulaires.</div></div><input id="smartPref" type="checkbox" ${p.smartProgression!==false?'checked':''}></div></section>
  <section class="card"><h2>Alertes & écran</h2><div class="switchline"><div><strong>Son du timer</strong><div class="small muted">Triple bip à la fin d'un chrono</div></div><input id="soundPref" type="checkbox" ${p.sound?'checked':''}></div><div class="switchline"><div><strong>Garder l'écran actif</strong><div class="small muted">Recommandé sur iPhone : empêche la mise en veille pendant un chrono</div></div><input id="keepAwakePref" type="checkbox" ${p.keepAwake!==false?'checked':''}></div><div class="switchline"><div><strong>Vibration</strong><div class="small muted">Utilisée uniquement si le navigateur la prend en charge</div></div><input id="vibrationPref" type="checkbox" ${p.vibration?'checked':''}></div><p class="install-note">Si tu verrouilles volontairement l’iPhone, iOS peut suspendre une PWA. Pour une alarme garantie sur écran verrouillé, il faudra ajouter des notifications push côté serveur.</p></section>
  <section class="card"><div class="section-head"><div><h2>Tutoriels exercices</h2><p class="muted small">Remplace progressivement les recherches par les vidéos que tu as validées.</p></div><span class="pill">${tutorialStats().exact}/${tutorialStats().total}</span></div><button class="btn btn-secondary" id="manageTutorials">Gérer les tutoriels</button></section>
  <section class="card"><h2>Installer l'application</h2><p class="install-note">Android/Chrome : bouton ci-dessous si disponible. iPhone/Safari : Partager → Ajouter à l'écran d'accueil.</p><button class="btn btn-primary" id="installApp" ${state.deferredInstall?'':'disabled'}>${state.deferredInstall?'Installer':'Installation via le navigateur'}</button></section>
  <section class="card"><div class="kicker">Matériel maison</div><h2>Ton équipement</h2><div class="equipment-clean-list">${HOME_EQUIPMENT.map((x,i)=>`<div class="equipment-clean-row"><span>${esc(x)}</span>${i<HOME_EQUIPMENT.length-1?'<span class="equipment-separator">·</span>':''}</div>`).join('')}</div><p class="muted small">Les barres parallèles et poignées de pompes sont intégrées aux recommandations. Pour le moment, les séances utilisent les bandes à la place du sac à dos pour ajouter de la résistance.</p></section>
  <section class="card"><div class="section-head"><div><div class="kicker">Training Engine</div><h2>Programme & bibliothèque</h2></div><span class="pill">V10.1</span></div><button class="btn btn-secondary" id="openExerciseLibrary">Ouvrir la bibliothèque d’exercices</button><div class="divider"></div><strong>Variantes actives</strong>${Object.entries(getExerciseChoices()).length?`<div class="choice-list">${Object.entries(getExerciseChoices()).map(([base,chosen])=>`<div class="choice-row"><span>${base} → <strong>${chosen}</strong></span><button class="btn btn-outline compact reset-choice" data-base="${encodeURIComponent(base)}">Réinitialiser</button></div>`).join('')}</div>`:'<p class="muted small">Aucune progression d’exercice adoptée pour le moment.</p>'}<div class="divider"></div><div class="section-head"><div><strong>Progression du cycle actif</strong><div class="small muted">${progressionModeLabel(getCycleState().plan)} · Semaine ${getCycleState().week}/${getCycleState().weekCount} · ${getCycleState().name}</div></div><div class="profile-progression-actions"><button class="btn btn-secondary compact edit-cycle-progression" data-cycle-id="${getActiveTrainingCycleId()}">Configurer</button><button class="btn btn-outline compact" id="resetCycle">Nouveau bloc</button></div></div></section>
  <section class="card data-card"><div class="section-head"><div><div class="kicker">Sauvegarde</div><h2>Données</h2></div><span class="pill">JSON</span></div><p class="muted small">Avant de changer de téléphone, de navigateur ou de passer sur une nouvelle adresse Vercel, exporte une sauvegarde. Elle contient séances, Quick Logs, progression, réglages et photos.</p><div class="data-actions"><button class="btn btn-primary" id="exportData">Exporter mes données</button><button class="btn btn-secondary" id="importData">Importer une sauvegarde</button><input id="importDataFile" type="file" accept="application/json,.json" hidden></div><p class="install-note">Le fichier reste sur ton appareil : rien n’est envoyé vers un serveur.</p><div class="divider"></div><button class="btn btn-danger" id="clearAllData">Effacer toutes les données</button></section>`,'profile');}


function renderBodyChart(logs,key,unit){const def=bodyFieldDef(key),pts=(logs||[]).filter(x=>bodyValue(x,key)!=null).slice(0,30).reverse();if(pts.length<2)return'';const vals=pts.map(x=>bodyValue(x,key)),min=Math.min(...vals),max=Math.max(...vals),range=Math.max(.5,max-min);const coords=vals.map((v,i)=>{const x=(i/(vals.length-1))*100,y=88-((v-min)/range)*70;return `${x},${y}`}).join(' ');return `<div class="mini-chart"><div class="chart-head"><strong>${def?.label||key}</strong><span>${vals[0].toFixed(1).replace('.0','')} → ${vals[vals.length-1].toFixed(1).replace('.0','')} ${unit}</span></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Évolution ${esc(def?.label||key)}"><polyline points="${coords}" fill="none" vector-effect="non-scaling-stroke"/></svg></div>`;}
function renderBodyEditor(){const athlete=getAthleteProfile(),cfg=getBodyConfig(),mode=state.bodyEditorMode||'quick',groups=['Essentiels','Haut du corps','Bas du corps','Optionnel'];const fields=BODY_FIELDS.filter(f=>cfg.tracked[f.key]!==false&&(mode==='full'||f.quick));const custom=mode==='full'?cfg.customFields.filter(f=>f.visible!==false):[];return `<main class="shell"><section class="card editor-card body-editor-v94"><button class="back-btn" id="closeBody">← Mesures</button><div class="kicker">${mode==='full'?'Bilan complet':'Mesure rapide'}</div><h1>${mode==='full'?'Mensurations & photos':'Les essentiels'}</h1><div class="body-editor-mode"><button class="body-mode ${mode==='quick'?'active':''}" data-body-mode="quick">Rapide</button><button class="body-mode ${mode==='full'?'active':''}" data-body-mode="full">Complet</button></div>${groups.map(g=>{const list=fields.filter(f=>f.group===g);if(!list.length)return'';return `<div class="body-editor-group"><h3>${g}</h3><div class="field-grid">${list.map(f=>`<div><label class="field-label">${f.label} (${f.unit})</label><input class="big-input body-value-input" data-body-key="${f.key}" type="number" step="${f.step}" inputmode="decimal" placeholder="—"></div>`).join('')}</div></div>`;}).join('')}${custom.length?`<div class="body-editor-group"><h3>Champs personnalisés</h3><div class="field-grid">${custom.map(f=>`<div><label class="field-label">${esc(f.label)} (${esc(f.unit||'')})</label><input class="big-input body-value-input" data-body-key="${f.key}" data-custom="1" type="number" step="0.1" inputmode="decimal" placeholder="—"></div>`).join('')}</div></div>`:''}<div class="body-editor-group"><h3>Contexte</h3><div class="field-grid"><div><label class="field-label">Taille corporelle (cm) · synchronisée au profil</label><input class="big-input" id="bodyHeight" type="number" step="0.1" inputmode="decimal" value="${athlete.height||''}" placeholder="ex. 175"></div><div><label class="field-label">Date</label><input class="big-input" id="bodyDate" type="date" value="${localDateKey()}"></div></div></div>${mode==='full'?`<div class="body-editor-group"><h3>Photos de progression</h3><p class="muted small">Même distance, même lumière et posture détendue si possible.</p><div class="body-photo-inputs"><label><span>Face</span><input class="file-input" id="bodyPhotoFront" type="file" accept="image/*" capture="environment"></label><label><span>Profil</span><input class="file-input" id="bodyPhotoSide" type="file" accept="image/*" capture="environment"></label><label><span>Dos</span><input class="file-input" id="bodyPhotoBack" type="file" accept="image/*" capture="environment"></label></div></div>`:''}<label class="field-label">Note facultative</label><textarea class="textarea" id="bodyNote" placeholder="Sommeil, hydratation, contexte, sensations…"></textarea><div class="body-save-note">Cycle actif : <strong>${esc(getActiveTrainingCycle().name)}</strong></div><button class="btn btn-primary" id="saveBody">Enregistrer ${mode==='full'?'le bilan':'la mesure'}</button></section></main>`;}
async function saveBody(){const values={},custom={};document.querySelectorAll('.body-value-input').forEach(el=>{const v=Number(el.value||0);if(v>0){if(el.dataset.custom)custom[el.dataset.bodyKey]=v;else values[el.dataset.bodyKey]=v;}});const height=Number(document.getElementById('bodyHeight')?.value||0),dateVal=document.getElementById('bodyDate')?.value||localDateKey();if(!Object.keys(values).length&&!Object.keys(custom).length)return;const photoIds={};for(const [pos,id] of [['front','bodyPhotoFront'],['side','bodyPhotoSide'],['back','bodyPhotoBack']]){const file=document.getElementById(id)?.files?.[0];if(file){try{const pid=`body-${pos}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,blob=await compressPhoto(file);if(blob){await putPhoto(pid,blob);photoIds[pos]=pid;}}catch(e){console.warn('Photo non enregistrée',pos,e);}}}const cycle=getActiveTrainingCycle(),arr=getBodyLogs(),date=new Date(`${dateVal}T12:00:00`);arr.unshift({id:Date.now(),date:date.toISOString(),...values,height:height||null,custom,photoIds:Object.keys(photoIds).length?photoIds:null,photoId:photoIds.front||null,note:document.getElementById('bodyNote')?.value||'',measurementMode:state.bodyEditorMode||'quick',trainingCycleId:String(cycle.id),trainingCycleName:cycle.name});arr.sort((a,b)=>new Date(b.date)-new Date(a.date));setBodyLogs(arr.slice(0,1500));if(height>0)setCanonicalHeight(height);state.bodyEditor=false;state.view='measurements';render();}
function saveBodyConfigFromDom(){const cfg=getBodyConfig();cfg.bodyFatFormula=document.getElementById('bodyFatFormula')?.value||cfg.bodyFatFormula;cfg.bodyFatSource=document.getElementById('bodyFatSource')?.value||cfg.bodyFatSource;document.querySelectorAll('.body-freq').forEach(el=>cfg.frequencies[el.dataset.freq]=clamp(Math.round(Number(el.value||1)),1,365));document.querySelectorAll('.body-goal-input').forEach(el=>{const v=Number(el.value||0);cfg.goals[el.dataset.bodyGoal]=Number.isFinite(v)&&v>0?v:null;});document.querySelectorAll('.body-track-input').forEach(el=>cfg.tracked[el.dataset.bodyTrack]=el.checked);document.querySelectorAll('.body-track-custom').forEach(el=>{const f=cfg.customFields.find(x=>x.key===el.dataset.customTrack);if(f)f.visible=el.checked;});setBodyConfig(cfg);state.bodySettingsOpen=true;state.bodySettingsMessage='Réglages enregistrés';render();}
function addCustomBodyField(){const label=prompt('Nom du champ personnalisé (ex. Ventre bas)');if(!label?.trim())return;const unit=prompt('Unité (ex. cm, kg, %)','cm')||'';const cfg=getBodyConfig(),key=`custom_${Date.now()}`;cfg.customFields.push({key,label:label.trim().slice(0,60),unit:unit.trim().slice(0,12),visible:true});setBodyConfig(cfg);state.bodySettingsOpen=true;state.bodySettingsMessage='Champ personnalisé ajouté';render();}
function removeCustomBodyField(key){const cfg=getBodyConfig();cfg.customFields=cfg.customFields.filter(f=>f.key!==key);setBodyConfig(cfg);state.bodySettingsOpen=true;state.bodySettingsMessage='Champ masqué de la configuration';render();}
async function hydrateBodyPhotos(){const imgs=[...document.querySelectorAll('[data-body-photo-id]')];for(const img of imgs){const id=img.dataset.bodyPhotoId;if(!id)continue;try{const blob=await getPhoto(id);if(blob){const url=URL.createObjectURL(blob);img.onload=()=>URL.revokeObjectURL(url);img.src=url;}}catch(e){console.warn('Photo indisponible',e);}}}

function bindEvents(){
  document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{state.view=b.dataset.view;state.selectedHistoryId=null;render();});
  const editAthlete=document.getElementById('editAthleteProfile');if(editAthlete)editAthlete.onclick=()=>{state.athleteProfileEditor=true;render();};
  document.querySelectorAll('.athlete-training-day,.athlete-sport-check,.athlete-location-check,.athlete-equipment-check').forEach(el=>el.onchange=()=>el.closest('label')?.classList.toggle('selected',el.checked));
  const cancelAthlete=document.getElementById('cancelAthleteProfile');if(cancelAthlete)cancelAthlete.onclick=()=>{state.athleteProfileEditor=false;render();};
  const saveAthlete=document.getElementById('saveAthleteProfile');if(saveAthlete)saveAthlete.onclick=()=>{
    const old=getAthleteProfile();
    const trainingDays=[...document.querySelectorAll('.athlete-training-day:checked')].map(x=>Number(x.value));
    const restDays=[0,1,2,3,4,5,6].filter(x=>!trainingDays.includes(x));
    const sports=[...document.querySelectorAll('.athlete-sport-check:checked')].map(x=>x.value);
    const locations=[...document.querySelectorAll('.athlete-location-check:checked')].map(x=>x.value);
    const profileHeight=Number(document.getElementById('athleteHeight')?.value||0)||null;
    const profileWeight=Number(document.getElementById('athleteWeight')?.value||0)||null;
    setAthleteProfile({...old,
      name:(document.getElementById('athleteName')?.value||'').trim(),
      age:Number(document.getElementById('athleteAge')?.value||0)||null,
      height:profileHeight,
      targetWeight:Number(document.getElementById('athleteTargetWeight')?.value||0)||null,
      yearsTraining:Number(document.getElementById('athleteYears')?.value||0)||null,
      experience:document.getElementById('athleteExperience')?.value||'Intermédiaire',
      primaryGoal:(document.getElementById('athletePrimaryGoal')?.value||'').trim()||'Progression générale',
      secondaryGoal:(document.getElementById('athleteSecondaryGoal')?.value||'').trim(),
      goalHorizon:document.getElementById('athleteGoalHorizon')?.value||'',
      weeklySessions:Number(document.getElementById('athleteWeeklySessions')?.value||4),
      preferredDuration:Number(document.getElementById('athletePreferredDuration')?.value||60),
      sessionPreference:document.getElementById('athleteSessionPreference')?.value||'Complet + Express',
      coachStyle:document.getElementById('athleteCoachStyle')?.value||'Équilibré',
      trainingDays,restDays,sports:sports.length?sports:['calisthenics'],locations:locations.length?locations:['home'],
      notes:(document.getElementById('athleteNotes')?.value||'').trim()
    });
    setCanonicalHeight(profileHeight);
    if(profileWeight)recordCurrentWeight(profileWeight,'profile-editor');
    const eq=getEquipmentSetup();document.querySelectorAll('.athlete-equipment-check').forEach(x=>eq[x.dataset.equipmentId]=x.checked);setEquipmentSetup(eq);
    state.athleteProfileEditor=false;render();
  };
  const openActivity=document.getElementById('openActivityLog');if(openActivity)openActivity.onclick=()=>{state.activityEditor=true;render();};document.querySelectorAll('[data-open-activity]').forEach(b=>b.onclick=()=>{state.activityEditor=true;render();});
  const cancelActivity=document.getElementById('cancelActivity');if(cancelActivity)cancelActivity.onclick=()=>{state.activityEditor=false;render();};
  const saveActivity=document.getElementById('saveActivity');if(saveActivity)saveActivity.onclick=()=>{const duration=Number(document.getElementById('activityDuration')?.value||0);if(duration<=0)return;addActivityLog(document.getElementById('activityType')?.value||'sport',duration,Number(document.getElementById('activityDistance')?.value||0),'rpe',document.getElementById('activityNote')?.value||'',Number(document.getElementById('activityRpe')?.value||5));state.activityEditor=false;render();};
  const activityTypeEl=document.getElementById('activityType'),activityRpe=document.getElementById('activityRpe'),activityDuration=document.getElementById('activityDuration');
  const syncActivityEditor=()=>{if(!activityTypeEl)return;const type=activityType(activityTypeEl.value),wrap=document.getElementById('activityDistanceWrap'),unit=document.getElementById('activityDistanceUnit'),rpe=Number(activityRpe?.value||5),mins=Number(activityDuration?.value||0);if(wrap)wrap.style.display=type.distance?'':'none';if(unit)unit.textContent=type.metric||'km';const rv=document.getElementById('activityRpeValue');if(rv)rv.textContent=rpe;const title=document.getElementById('activityEditorTitle'),symbol=document.getElementById('activityEditorSymbol');if(title)title.textContent=type.label;if(symbol)symbol.textContent=activityUiIcon(type.id);const lp=document.getElementById('activityLoadPreview');if(lp)lp.innerHTML=`${Math.round(mins*rpe)} <small>UA</small>`;};
  if(activityTypeEl){activityTypeEl.onchange=syncActivityEditor;activityRpe.oninput=syncActivityEditor;activityDuration.oninput=syncActivityEditor;syncActivityEditor();}
  document.querySelectorAll('[data-progress-tab]').forEach(b=>b.onclick=()=>{state.progressTab=b.dataset.progressTab;state.selectedHistoryId=null;render();});
  document.querySelectorAll('[data-today-progress]').forEach(b=>b.onclick=()=>{state.view='progress';state.progressTab=b.dataset.todayProgress||'performance';state.selectedHistoryId=null;render();});
  const openAddHub=document.getElementById('openAddHub');if(openAddHub)openAddHub.onclick=()=>{state.addHubOpen=true;state.quickEditor=false;state.quickToast=null;render();};
  document.querySelectorAll('[data-open-add-hub]').forEach(b=>b.onclick=()=>{state.addHubOpen=true;state.quickEditor=false;state.quickToast=null;render();});
  const closeAddHub=document.getElementById('closeAddHub');if(closeAddHub)closeAddHub.onclick=()=>{state.addHubOpen=false;render();};
  document.querySelectorAll('[data-add-action]').forEach(b=>b.onclick=()=>{const action=b.dataset.addAction;state.addHubOpen=false;if(action==='quick'){state.quickEditor=true;state.quickToast=null;render();return;}if(action==='activity'){state.activityPresetData=null;state.activityPresetType=b.dataset.activityType||addHubPreferredActivityType();state.activityEditId=null;state.activityEditor=true;render();return;}if(action==='core'){state.coreTimerOpen=true;render();return;}if(action==='measure'){state.bodyEditor=true;state.bodyEditorMode='quick';render();return;}if(action==='plan'){state.planningEditor=true;state.planningEditId=null;state.planningEditorDate=localDateKey();state.view='week';render();return;}});
  document.querySelectorAll('[data-add-activity-type]').forEach(b=>b.onclick=()=>{state.addHubOpen=false;state.activityEditId=null;state.activityPresetData=null;state.activityPresetType=b.dataset.addActivityType||'running';state.activityEditor=true;render();});
  document.querySelectorAll('[data-add-repeat-activity]').forEach(b=>b.onclick=()=>{const a=(typeof activityById==='function'?activityById(b.dataset.addRepeatActivity):null)||getActivities().find(x=>String(x.id)===String(b.dataset.addRepeatActivity));if(!a)return;state.addHubOpen=false;state.activityEditId=null;state.activityPresetType=a.type;state.activityPresetData={type:a.type,duration:Number(a.duration||30),distance:Number(a.distance||0),rpe:Number(a.rpe||5)};state.activityEditor=true;render();});
  const addHubOverlay=document.querySelector('.add-hub-overlay');if(addHubOverlay)addHubOverlay.onclick=e=>{if(e.target===addHubOverlay){state.addHubOpen=false;render();}};
  document.querySelectorAll('[data-open-quick-log]').forEach(b=>b.onclick=()=>{state.addHubOpen=false;state.quickEditor=true;state.quickToast=null;render();});
  const closeQuick=document.getElementById('closeQuickLog');if(closeQuick)closeQuick.onclick=()=>{state.quickEditor=false;state.quickToast=null;state.quickFavoritesEditor=false;state.quickFavoriteMessage=null;render();};
  const manageQuickFavorites=document.getElementById('manageQuickFavorites')||document.getElementById('manageQuickFavoritesEmpty');if(manageQuickFavorites)manageQuickFavorites.onclick=()=>{state.quickFavoritesEditor=true;state.quickFavoriteMessage=null;state.quickFavoriteCategory='Tous';render();};
  const doneQuickFavorites=document.getElementById('doneQuickFavorites');if(doneQuickFavorites)doneQuickFavorites.onclick=()=>{state.quickFavoritesEditor=false;state.quickFavoriteMessage=null;render();};
  document.querySelectorAll('[data-quick-favorite-toggle]').forEach(b=>b.onclick=()=>{toggleQuickFavorite(decodeURIComponent(b.dataset.quickFavoriteToggle));render();});
  document.querySelectorAll('[data-quick-favorite-move]').forEach(b=>b.onclick=()=>{moveQuickFavorite(decodeURIComponent(b.dataset.quickFavoriteName),b.dataset.quickFavoriteMove);render();});
  document.querySelectorAll('[data-quick-favorite-category]').forEach(b=>b.onclick=()=>{state.quickFavoriteCategory=b.dataset.quickFavoriteCategory||'Tous';document.querySelectorAll('[data-quick-favorite-category]').forEach(x=>x.classList.toggle('active',x===b));filterQuickFavoritePicker();});
  const quickFavoriteSearch=document.getElementById('quickFavoriteSearch');if(quickFavoriteSearch)quickFavoriteSearch.oninput=filterQuickFavoritePicker;
  document.querySelectorAll('[data-quick-favorite-preset-name]').forEach(input=>input.onchange=()=>{const encoded=input.dataset.quickFavoritePresetName,name=decodeURIComponent(encoded),rows=[...document.querySelectorAll('[data-quick-favorite-preset-name]')].filter(x=>x.dataset.quickFavoritePresetName===encoded),values=rows.sort((a,b)=>Number(a.dataset.quickFavoritePresetIndex)-Number(b.dataset.quickFavoritePresetIndex)).map(x=>Number(x.value||0));setQuickFavoritePresetValues(name,values);state.quickFavoriteMessage='Valeurs rapides enregistrées.';});
  document.querySelectorAll('#syncStrava').forEach(b=>b.onclick=syncStravaActivities);
  const disconnectS=document.getElementById('disconnectStrava');if(disconnectS)disconnectS.onclick=()=>{if(confirm('Déconnecter Strava de KINETIK ?'))disconnectStrava();};
  const presetBand=(index,name)=>document.querySelector(`[data-quick-preset="${index}"] .band-choice.active`)?.dataset.bandLabel||lastBandForExercise(name)||defaultBandForExercise(name);
  document.querySelectorAll('.quick-add').forEach(b=>b.onclick=()=>{const name=decodeURIComponent(b.dataset.quickName),type=b.dataset.quickType,index=b.dataset.quickPresetIndex,band=type==='reps_band'?presetBand(index,name):null;addQuickLog(name,Number(b.dataset.quickValue),type,band);});
  document.querySelectorAll('.quick-exact-add').forEach(b=>b.onclick=()=>{const input=document.getElementById(`quickExact_${b.dataset.quickExactIndex}`),value=Number(input?.value||0),name=decodeURIComponent(b.dataset.quickName),type=b.dataset.quickType,index=b.dataset.quickPresetIndex,band=type==='reps_band'?presetBand(index,name):null;if(value>0)addQuickLog(name,value,type,band);});
  document.querySelectorAll('.quick-repeat').forEach(b=>b.onclick=()=>addQuickLog(decodeURIComponent(b.dataset.quickName),Number(b.dataset.quickValue),b.dataset.quickType,b.dataset.quickBand?decodeURIComponent(b.dataset.quickBand):null,Number(b.dataset.quickLoad||0)));
  document.querySelectorAll('.quick-exact-input').forEach(input=>input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();input.parentElement?.querySelector('.quick-exact-add')?.click();}});
  const quickExercise=document.getElementById('quickExercise');
  document.querySelectorAll('.quick-exercise-card').forEach(card=>card.onclick=()=>selectQuickExerciseCard(card));
  document.querySelectorAll('.quick-category').forEach(tab=>tab.onclick=()=>{document.querySelectorAll('.quick-category').forEach(x=>x.classList.toggle('active',x===tab));filterQuickExercisePicker();});
  const quickSearch=document.getElementById('quickExerciseSearch');if(quickSearch)quickSearch.oninput=filterQuickExercisePicker;
  const firstQuickCard=document.querySelector('.quick-exercise-card.selected');if(firstQuickCard)selectQuickExerciseCard(firstQuickCard);
  const saveQuick=document.getElementById('saveQuickCustom');if(saveQuick)saveQuick.onclick=()=>{const name=document.getElementById('quickExercise')?.value,value=Number(document.getElementById('quickValue')?.value||0),info=exerciseInfo(name),type=info?.prescription?.type||'reps';if(value>0)addQuickLog(name,value,type,type==='reps_band'?(state.quickBand||lastBandForExercise(name)||defaultBandForExercise(name)):null,usesBackpack(name)?Number(document.getElementById('quickLoadKg')?.value||0):null);};
  document.querySelectorAll('[data-delete-quick-log]').forEach(b=>b.onclick=()=>{if(confirm('Supprimer cette ligne du journal ?'))deleteQuickLog(b.dataset.deleteQuickLog);});
  document.querySelectorAll('[data-energy]').forEach(b=>b.onclick=()=>{state.readinessEditor.energy=Number(b.dataset.energy);render();});
  document.querySelectorAll('[data-soreness]').forEach(b=>b.onclick=()=>{state.readinessEditor.soreness=Number(b.dataset.soreness);render();});
  document.querySelectorAll('[data-joints]').forEach(b=>b.onclick=()=>{state.readinessEditor.joints=b.dataset.joints;render();});
  document.querySelectorAll('[data-session-length]').forEach(b=>b.onclick=()=>{const r={...state.sessionModeEditor};state.sessionModeEditor=null;state.readinessEditor={day:Number(r.day),sessionLength:b.dataset.sessionLength,energy:3,soreness:2,joints:'ok'};render();});
  const cancelMode=document.getElementById('cancelSessionMode');if(cancelMode)cancelMode.onclick=()=>{state.sessionModeEditor=null;render();};
  const confirmReadiness=document.getElementById('confirmReadiness');if(confirmReadiness)confirmReadiness.onclick=()=>{const r={...state.readinessEditor};startWorkout(r.day,r);};
  const cancelReadiness=document.getElementById('cancelReadiness');if(cancelReadiness)cancelReadiness.onclick=()=>{state.readinessEditor=null;render();};
  const openSub=document.getElementById('openSubstitute');if(openSub)openSub.onclick=()=>{state.substituteEditor=state.active.exerciseIndex;render();};
  const closeSub=document.getElementById('closeSubstitute');if(closeSub)closeSub.onclick=()=>{state.substituteEditor=null;render();};
  document.querySelectorAll('.choose-sub').forEach(b=>b.onclick=()=>chooseSubstitution(decodeURIComponent(b.dataset.sub)));
  document.querySelectorAll('.accept-progression').forEach(b=>b.onclick=()=>acceptProgression(decodeURIComponent(b.dataset.base),decodeURIComponent(b.dataset.next)));
  document.querySelectorAll('.reset-choice').forEach(b=>b.onclick=()=>resetExerciseChoice(decodeURIComponent(b.dataset.base)));
  const openLib=document.getElementById('openExerciseLibrary');if(openLib)openLib.onclick=()=>{state.exerciseLibrary=true;render();};
  const closeLib=document.getElementById('closeExerciseLibrary');if(closeLib)closeLib.onclick=()=>{state.exerciseLibrary=false;render();};
  document.querySelectorAll('[data-library-category]').forEach(b=>b.onclick=()=>{state.libraryCategory=b.dataset.libraryCategory;document.querySelectorAll('[data-library-category]').forEach(x=>x.classList.toggle('active',x.dataset.libraryCategory===state.libraryCategory));filterLibraryDom();});
  const libSearch=document.getElementById('librarySearch');if(libSearch)libSearch.oninput=filterLibraryDom;
  const newCustom=document.getElementById('newCustomSession'),newCustom2=document.getElementById('newCustomSession2');if(newCustom)newCustom.onclick=()=>openCustomSessionEditor();if(newCustom2)newCustom2.onclick=()=>openCustomSessionEditor();
  const newCycle=document.getElementById('newTrainingCycle');if(newCycle)newCycle.onclick=()=>createTrainingCycle();
  document.querySelectorAll('.activate-cycle').forEach(b=>b.onclick=()=>activateTrainingCycle(b.dataset.cycleId));
  document.querySelectorAll('.edit-cycle-progression').forEach(b=>b.onclick=()=>openCycleProgressionEditor(b.dataset.cycleId));
  document.querySelectorAll('[data-progression-mode]').forEach(b=>b.onclick=()=>progressionDraftApplyMode(b.dataset.progressionMode));
  const aiWizard=document.querySelector('.cycle-ai-wizard-v109');
  if(aiWizard){
    let aiStep=1;
    const showAiStep=n=>{
      aiStep=Math.max(1,Math.min(6,n));
      document.querySelectorAll('[data-ai-step]').forEach(x=>x.classList.toggle('active',Number(x.dataset.aiStep)===aiStep));
      document.querySelectorAll('[data-ai-dot]').forEach(x=>x.classList.toggle('active',Number(x.dataset.aiDot)<=aiStep));
      const prev=document.getElementById('cycleAiPrev'),next=document.getElementById('cycleAiNext');
      if(prev)prev.hidden=aiStep===1;if(next)next.hidden=aiStep===6;
      if(aiStep===3)aiSyncTrainingSchedule();
      if(aiStep===4)refreshAiDetected();
      if(aiStep===6)refreshAiReview();
    };
    const aiObjective=()=>document.getElementById('cycleAiObjective')?.value||'';
    const aiTarget=()=>document.getElementById('cycleAiTarget')?.value?.trim()||'';
    const refreshAiDetected=()=>{
      const box=document.getElementById('cycleAiDetectedData');if(!box)return;
      const s=cycleAiDataSnapshot(aiObjective(),aiTarget()),title=s.status==='complete'?'Données suffisantes':s.status==='partial'?'Données partielles':'Peu de données disponibles';
      box.innerHTML=`<div class="ai-detected-head"><div><strong>${title}</strong><small>${s.found}/${s.total} indicateurs utiles trouvés · ${s.sessions} séance${s.sessions!==1?'s':''} · ${s.quick} série${s.quick!==1?'s':''} libre${s.quick!==1?'s':''}</small></div><span class="ai-data-status ${s.status}">${s.status==='complete'?'OK':s.status==='partial'?'PARTIEL':'À COMPLÉTER'}</span></div><div class="ai-metric-list">${s.metrics.map(m=>`<div><span>${m.label}</span><strong>${Number(m.value||0)>0?`${m.detail||`${m.value} ${m.unit}`}`:m.source==='évaluation guidée'?'0 · évalué':'—'}</strong></div>`).join('')}</div>`;
      const evalBox=document.getElementById('cycleAiEvaluation');if(evalBox){evalBox.innerHTML=aiEvaluationUi(aiObjective(),aiTarget());document.getElementById('saveAiEvaluation')?.addEventListener('click',()=>{const chest=document.getElementById('aiEvalChest'),explosive=document.getElementById('aiEvalExplosive');if(chest&&chest.value!=='')saveAiEvaluation('Chest-to-bar',Number(chest.value),{label:'Chest-to-bar',unit:'reps'});if(explosive&&explosive.value!==''){const labels={1:'menton',2:'haut de poitrine',3:'bas de poitrine',4:'barre sous les pectoraux'};saveAiEvaluation('Tractions explosives',Number(explosive.value),{label:'Tractions explosives',unit:'niveau',detail:labels[explosive.value]||''});}refreshAiDetected();});}
    };
    const refreshAiReview=()=>{
      const box=document.getElementById('cycleAiReview');if(!box)return;
      const source=document.querySelector('input[name=cycleAiSource]:checked')?.value||'app',snap=cycleAiDataSnapshot(aiObjective(),aiTarget());
      const safety=cycleAiPreflightLabel(aiObjective(),aiTarget(),{context:document.getElementById('cycleAiContext')?.value||'',painImpact:document.getElementById('cycleAiPainImpact')?.value||'',breakDuration:document.getElementById('cycleAiBreakDuration')?.value||''});
      box.innerHTML=`<div><span>Objectif</span><strong>${esc(aiObjective())} · ${esc(aiTarget()||'à préciser')}</strong></div><div><span>Échéance</span><strong>${esc(document.getElementById('cycleAiHorizon')?.value||'Sans date')}</strong></div><div><span>Rythme</span><strong>${esc(document.getElementById('cycleAiTrainingDays')?.value||'6')} séances · repos ${esc(aiDesiredRestDays().join(', ')||'—')}</strong></div><div><span>Niveau</span><strong>${source==='app'?`${snap.found}/${snap.total} indicateurs depuis l’app`:'Saisie manuelle'}</strong></div><div><span>Contexte</span><strong>${esc(document.getElementById('cycleAiContext')?.value||'Aucun')}</strong></div><div class="ai-safety-review ${safety.tone}"><span>Sécurité</span><strong>${esc(safety.title)}</strong><small>${esc(safety.text)}</small></div>`;
    };
    document.getElementById('cycleAiNext')?.addEventListener('click',()=>{if(aiStep===1&&!aiTarget()){document.getElementById('cycleAiTarget')?.focus();return;}if(aiStep===3&&!aiSyncTrainingSchedule())return;showAiStep(aiStep+1);});
    document.getElementById('cycleAiPrev')?.addEventListener('click',()=>showAiStep(aiStep-1));
    document.querySelectorAll('#cycleAiHorizonChoices .ai-choice').forEach(b=>b.onclick=()=>{document.querySelectorAll('#cycleAiHorizonChoices .ai-choice').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.getElementById('cycleAiHorizon').value=b.dataset.value;});
    document.getElementById('cycleAiTrainingDays')?.addEventListener('change',()=>{const need=7-Number(document.getElementById('cycleAiTrainingDays')?.value||6),boxes=[...document.querySelectorAll('input[name=cycleAiRestDay]')];boxes.forEach(x=>x.checked=false);const preferred=cycleRestDayNames(trainingCycleById(state.cycleProgressionEditor));[...preferred,...['Lundi','Vendredi','Dimanche','Mercredi','Mardi','Jeudi','Samedi']].filter((x,i,a)=>a.indexOf(x)===i).slice(0,need).forEach(name=>{const b=boxes.find(x=>x.value===name);if(b)b.checked=true;});aiSyncTrainingSchedule();});
    document.querySelectorAll('input[name=cycleAiRestDay]').forEach(x=>x.addEventListener('change',aiSyncTrainingSchedule));aiSyncTrainingSchedule();
    document.querySelectorAll('input[name=cycleAiSource]').forEach(r=>r.onchange=()=>{const manual=document.querySelector('input[name=cycleAiSource]:checked')?.value==='manual',row=document.querySelector('.ai-manual-level');if(row)row.hidden=!manual;document.querySelectorAll('.ai-source-option').forEach(x=>x.classList.toggle('active',!!x.querySelector('input')?.checked));});
    const syncAiContext=()=>{const ctx=document.getElementById('cycleAiContext'),v=ctx?.value||'',b=document.getElementById('cycleAiBreakWrap'),p=document.getElementById('cycleAiPainWrap');if(b){b.hidden=v!=='Reprise après un arrêt';b.style.display=b.hidden?'none':'';}if(p){p.hidden=v!=='Gêne / douleur à prendre en compte';p.style.display=p.hidden?'none':'';}};const ctx=document.getElementById('cycleAiContext');if(ctx)ctx.onchange=syncAiContext;syncAiContext();
    document.getElementById('cycleAiObjective')?.addEventListener('change',refreshAiDetected);
    document.getElementById('cycleAiTarget')?.addEventListener('input',refreshAiDetected);
    const genAi=document.getElementById('generateCycleAiPrompt');if(genAi)genAi.onclick=()=>{const srcMode=document.querySelector('input[name=cycleAiSource]:checked')?.value||'app',preflight=cycleAiSafetyAssessment(aiObjective(),aiTarget(),{context:document.getElementById('cycleAiContext')?.value||'',painImpact:document.getElementById('cycleAiPainImpact')?.value||''});if(srcMode==='app'&&preflight.needsAssessment){showAiStep(4);refreshAiDetected();setTimeout(()=>document.getElementById('cycleAiEvaluation')?.scrollIntoView({behavior:'smooth',block:'center'}),50);return;}
      const c=trainingCycleById(state.cycleProgressionEditor),goal=(document.getElementById('cycleAiGoal')?.value||'').trim(),opts={
        objective:aiObjective(),target:aiTarget(),secondary:(document.getElementById('cycleAiSecondary')?.value||'').trim(),
        horizon:document.getElementById('cycleAiHorizon')?.value,context:document.getElementById('cycleAiContext')?.value,
        source:document.querySelector('input[name=cycleAiSource]:checked')?.value||'app',
        manualLevel:(document.getElementById('cycleAiManualLevel')?.value||'').trim(),
        trainingDays:Number(document.getElementById('cycleAiTrainingDays')?.value||cycleTrainingDays(c).length),
        restDays:aiDesiredRestDays(),
        breakDuration:(document.getElementById('cycleAiBreakDuration')?.value||'').trim(),
        painZone:document.getElementById('cycleAiContext')?.value==='Gêne / douleur à prendre en compte'?document.getElementById('cycleAiPainZone')?.value:'',
        painImpact:document.getElementById('cycleAiContext')?.value==='Gêne / douleur à prendre en compte'?document.getElementById('cycleAiPainImpact')?.value:''
      },out=document.getElementById('cycleAiOutput'),ta=document.getElementById('cycleAiPrompt');
      ta.value=cycleAiPromptText(c,goal,opts);out.hidden=false;ta.focus();
    };
    const copyAi=document.getElementById('copyCycleAiPrompt');if(copyAi)copyAi.onclick=async()=>{const ta=document.getElementById('cycleAiPrompt');try{await navigator.clipboard.writeText(ta.value);copyAi.textContent='Copié ✓';setTimeout(()=>copyAi.textContent='Copier le prompt',1600);}catch(e){ta.focus();ta.select();copyAi.textContent='Sélectionné';}};
    showAiStep(1);
  }
  
  const analyzeAiImport=document.getElementById('analyzeCycleAiImport');
  if(analyzeAiImport){
    analyzeAiImport.addEventListener('click',()=>{
      const result=document.getElementById('cycleAiImportResult');
      if(!result)return;
      result.hidden=false;
      result.innerHTML='<div class="ai-import-loading"><strong>Analyse de la proposition…</strong><p>Extraction et vérification de la configuration ChatGPT.</p></div>';
      try{
        const raw=document.getElementById('cycleAiImportText')?.value||'';
        if(!raw.trim()){
          result.innerHTML='<div class="ai-import-error"><strong>Colle d’abord la réponse de ChatGPT</strong><p>Tu peux coller la réponse complète, pas uniquement le JSON.</p></div>';
          return;
        }
        const data=extractCycleAiJson(raw);
        if(!data){
          result.innerHTML=`<div class="ai-import-error"><strong>Configuration JSON introuvable</strong><p>${raw.length.toLocaleString('fr-FR')} caractères reçus, mais aucun objet JSON valide avec schemaVersion 1 n’a été détecté.</p><p>Astuce : colle directement depuis la première accolade <b>{</b> jusqu’à la dernière <b>}</b>.</p></div>`;
          return;
        }
        const source=trainingCycleById(state.cycleProgressionEditor);
        const validation=validateCycleAiImport(data,source);
        if(!validation.ok){
          result.innerHTML=`<div class="ai-import-error"><strong>Configuration trouvée, mais import impossible</strong>${validation.errors.map(x=>`<p>• ${esc(x)}</p>`).join('')}</div>`;
          return;
        }
        state.cycleAiImport={data,sourceId:String(source.id)};
        result.innerHTML=`${previewCycleAiImport(data,validation)}<div class="ai-import-actions"><button type="button" class="btn btn-secondary" id="cancelCycleAiImport">Annuler</button><button type="button" class="btn btn-primary" id="createCycleAiImport">Créer ce cycle</button></div>`;
        document.getElementById('cancelCycleAiImport')?.addEventListener('click',()=>{state.cycleAiImport=null;result.hidden=true;result.innerHTML='';});
        document.getElementById('createCycleAiImport')?.addEventListener('click',()=>{
          try{
            const x=state.cycleAiImport;if(!x)return;
            const created=createCycleFromAiImport(x.data,trainingCycleById(x.sourceId));
            state.cycleAiImport=null;state.cycleProgressionEditor=null;state.cycleProgressionDraft=null;state.view='custom';render();
          }catch(err){
            console.error('Cycle AI create error',err);
            result.hidden=false;
            result.innerHTML=`<div class="ai-import-error"><strong>Impossible de créer le cycle</strong><p>${esc(err?.message||'Erreur inconnue')}</p></div>`;
          }
        });
      }catch(err){
        console.error('Cycle AI import analysis error',err);
        result.hidden=false;
        result.innerHTML=`<div class="ai-import-error"><strong>Erreur pendant l’analyse</strong><p>${esc(err?.message||'Erreur inconnue')}</p><p>La proposition n’a pas été appliquée.</p></div>`;
      }
    });
  }
  const closeProg=document.getElementById('closeProgressionEditor');if(closeProg)closeProg.onclick=()=>{state.cycleProgressionEditor=null;state.cycleProgressionDraft=null;render();};
  const progGoal=document.getElementById('progressionGoal');if(progGoal)progGoal.onchange=()=>{state.cycleProgressionDraft=automaticProgression(progGoal.value);render();};
  const progTemplate=document.getElementById('progressionTemplate');if(progTemplate)progTemplate.onchange=()=>{state.cycleProgressionDraft=templateProgression(progTemplate.value);render();};
  document.querySelectorAll('.progression-week-field,.progression-week-bool').forEach(el=>el.onchange=syncProgressionDraftFromDom);
  const saveProg=document.getElementById('saveCycleProgression');if(saveProg)saveProg.onclick=saveCycleProgression;
  document.querySelectorAll('.duplicate-cycle').forEach(b=>b.onclick=()=>duplicateTrainingCycle(b.dataset.cycleId));
  document.querySelectorAll('.rename-cycle').forEach(b=>b.onclick=()=>renameTrainingCycle(b.dataset.cycleId));
  document.querySelectorAll('.archive-cycle').forEach(b=>b.onclick=()=>archiveTrainingCycle(b.dataset.cycleId));
  document.querySelectorAll('.edit-cycle-day').forEach(b=>b.onclick=()=>openCycleDayEditor(b.dataset.cycleId,Number(b.dataset.day)));
  document.querySelectorAll('.rest-cycle-day').forEach(b=>b.onclick=()=>{if(confirm(`Passer ${DAY_NAMES[Number(b.dataset.day)]} en repos complet ?`))setCycleDayRest(b.dataset.cycleId,Number(b.dataset.day));});
  document.querySelectorAll('.restore-cycle-day').forEach(b=>b.onclick=()=>restoreCycleDayFromBase(b.dataset.cycleId,Number(b.dataset.day)));
  document.querySelectorAll('.clone-program-day').forEach(b=>b.onclick=()=>openCustomSessionEditor(null,Number(b.dataset.cloneDay)));
  document.querySelectorAll('.start-custom-session').forEach(b=>b.onclick=()=>requestCustomWorkoutStart(b.dataset.customId));
  document.querySelectorAll('.edit-custom-session').forEach(b=>b.onclick=()=>openCustomSessionEditor(b.dataset.customId));
  document.querySelectorAll('.duplicate-custom-session').forEach(b=>b.onclick=()=>{const w=customWorkoutById(b.dataset.customId);if(!w)return;const list=getCustomWorkouts(),copy={...clone(w),id:Date.now(),name:`${w.name} · copie`,updatedAt:new Date().toISOString()};list.unshift(copy);setCustomWorkouts(list);render();});
  document.querySelectorAll('.delete-custom-session').forEach(b=>b.onclick=()=>{if(!confirm('Supprimer cette séance personnelle ?'))return;setCustomWorkouts(getCustomWorkouts().filter(x=>String(x.id)!==String(b.dataset.customId)));render();});
  const closeCustom=document.getElementById('closeCustomEditor');if(closeCustom)closeCustom.onclick=()=>{state.customSessionEditor=null;state.customSessionDraft=null;state.cycleDayTarget=null;render();};
  const addCustom=document.getElementById('addCustomExercise');if(addCustom)addCustom.onclick=()=>{syncCustomDraftFromDom();state.customSessionDraft.exercises.push(exerciseTemplateByName('Pompes'));render();};
  document.querySelectorAll('.custom-exercise-name').forEach(el=>el.onchange=()=>{syncCustomDraftFromDom();const i=Number(el.dataset.customIndex),old=state.customSessionDraft.exercises[i],fresh=exerciseTemplateByName(el.value);state.customSessionDraft.exercises[i]={...fresh,phase:old?.phase||fresh.phase||'main',express:old?.express??fresh.express,shortSets:old?.shortSets??fresh.shortSets,shortTarget:old?.shortTarget??fresh.shortTarget};render();});
  document.querySelectorAll('.custom-ex-field').forEach(el=>el.onchange=()=>{syncCustomDraftFromDom();render();});
  document.querySelectorAll('.custom-ex-bool').forEach(el=>el.onchange=()=>syncCustomDraftFromDom());
  document.querySelectorAll('.custom-session-meta').forEach(el=>el.onchange=syncCustomDraftFromDom);
  document.querySelectorAll('.move-custom-up').forEach(b=>b.onclick=()=>{syncCustomDraftFromDom();const i=Number(b.dataset.customIndex);if(i<=0)return;const arr=state.customSessionDraft.exercises;[arr[i-1],arr[i]]=[arr[i],arr[i-1]];render();});
  document.querySelectorAll('.move-custom-down').forEach(b=>b.onclick=()=>{syncCustomDraftFromDom();const i=Number(b.dataset.customIndex),arr=state.customSessionDraft.exercises;if(i>=arr.length-1)return;[arr[i+1],arr[i]]=[arr[i],arr[i+1]];render();});
  document.querySelectorAll('.remove-custom-ex').forEach(b=>b.onclick=()=>{syncCustomDraftFromDom();state.customSessionDraft.exercises.splice(Number(b.dataset.customIndex),1);render();});
  const saveCustom=document.getElementById('saveCustomSession');if(saveCustom)saveCustom.onclick=saveCustomSession;
  const resetC=document.getElementById('resetCycle');if(resetC)resetC.onclick=()=>{if(confirm('Démarrer un nouveau bloc de progression pour le cycle actif à partir de cette semaine ?'))resetCycle();};
  const dismissPR=document.getElementById('dismissPR');if(dismissPR)dismissPR.onclick=()=>{state.prNotice=null;render();};
  document.querySelectorAll('[data-flex-toggle]').forEach(b=>b.onclick=()=>{const id=b.dataset.flexToggle;state.expandedFlexRoutine=state.expandedFlexRoutine===id?null:id;render();});
  document.querySelectorAll('.start-flex').forEach(b=>b.onclick=()=>startFlexRoutine(b.dataset.flex));
  document.querySelectorAll('.save-mobility').forEach(b=>b.onclick=()=>saveMobilityTest(b.dataset.test));
  document.querySelectorAll('[data-rep-period]').forEach(b=>b.onclick=()=>{state.repVolumePeriod=b.dataset.repPeriod;render();});
  const repFrom=document.getElementById('repVolumeFrom');if(repFrom)repFrom.onchange=()=>{state.repVolumeFrom=repFrom.value;render();};
  const repTo=document.getElementById('repVolumeTo');if(repTo)repTo.onchange=()=>{state.repVolumeTo=repTo.value;render();};
  const saveTrainCfg=document.getElementById('saveTrainingConfig');if(saveTrainCfg)saveTrainCfg.onclick=saveTrainingConfigFromDom;
  const resetTrainCfg=document.getElementById('resetTrainingConfig');if(resetTrainCfg)resetTrainCfg.onclick=()=>{if(confirm('Revenir aux cibles de volume par défaut ?')){localStorage.removeItem(STORAGE.trainingConfig);render();}};
  const saveFlexCfg=document.getElementById('saveFlexConfig');if(saveFlexCfg)saveFlexCfg.onclick=saveFlexConfigFromDom;
  const resetFlexCfg=document.getElementById('resetFlexConfig');if(resetFlexCfg)resetFlexCfg.onclick=()=>{if(confirm('Revenir aux cibles Flex par défaut ?')){localStorage.removeItem(STORAGE.flexConfig);render();}};
  document.querySelectorAll('.week-toggle').forEach(b=>b.onclick=()=>{const day=Number(b.dataset.day);state.expandedWeekDay=state.expandedWeekDay===day?null:day;render();});
  document.querySelectorAll('.start-day').forEach(b=>b.onclick=e=>{e.stopPropagation();requestWorkoutStart(b.dataset.day);});
  const start=document.getElementById('startWorkout');if(start)start.onclick=()=>requestWorkoutStart(start.dataset.day);
  const complete=document.getElementById('completeSet');if(complete)complete.onclick=completeSet;
  const quit=document.getElementById('quitWorkout');if(quit)quit.onclick=()=>{if(confirm('Quitter la séance en cours ?')){stopTimer();state.active=null;state.undoSetSnapshot=null;state.substituteEditor=null;render();}};
  const dec=document.getElementById('decValue');if(dec)dec.onclick=()=>adjustValue(-1);
  const inc=document.getElementById('incValue');if(inc)inc.onclick=()=>adjustValue(1);
  const val=document.getElementById('valueInput');if(val)val.oninput=()=>state.active.currentValue=Number(val.value||0);
  document.querySelectorAll('.band-choice').forEach(b=>b.onclick=()=>{const label=b.dataset.bandLabel,preset=b.closest('.quick-preset');if(preset){preset.querySelectorAll('.band-choice').forEach(x=>x.classList.toggle('active',x===b));}else if(b.closest('#quickBandWrap')){state.quickBand=label;document.querySelectorAll('#quickBandWrap .band-choice').forEach(x=>x.classList.toggle('active',x===b));}else if(state.active){state.active.currentBand=label;document.querySelectorAll('.band-select-block .band-choice').forEach(x=>x.classList.toggle('active',x===b));}});
  document.querySelectorAll('.load-preset').forEach(b=>b.onclick=()=>{const input=document.getElementById(b.dataset.loadTarget);if(input){input.value=b.dataset.loadValue;if(state.active&&b.dataset.loadTarget==='workoutLoadKg')state.active.currentLoadKg=Number(b.dataset.loadValue);}});
  const workLoad=document.getElementById('workoutLoadKg');if(workLoad)workLoad.oninput=()=>state.active.currentLoadKg=Number(workLoad.value||0);
  const pauseWorkout=document.getElementById('pauseWorkout');if(pauseWorkout)pauseWorkout.onclick=pauseSession;
  const resumeWorkout=document.getElementById('resumeWorkout');if(resumeWorkout)resumeWorkout.onclick=resumeSession;
  const undoGuided=document.getElementById('undoGuidedSet');if(undoGuided)undoGuided.onclick=undoLastGuidedSet;
  const toggleWork=document.getElementById('toggleWorkTimer');if(toggleWork)toggleWork.onclick=()=>{state.active.timerRunning=!state.active.timerRunning;if(state.active.timerRunning)startTimer();else stopTimer();render();};
  const toggle=document.getElementById('toggleTimer');if(toggle)toggle.onclick=()=>{state.active.timerRunning=!state.active.timerRunning;if(state.active.timerRunning)startTimer();else stopTimer();render();};
  const skip=document.getElementById('skipRest');if(skip)skip.onclick=()=>{stopTimer();const a=state.active;if(a.phase==='transition'){advanceToNextExercise(a);}else{a.phase='work';a.timerRunning=false;const e=a.workout.exercises[a.exerciseIndex];a.timerRemaining=e.type==='timer'||e.type.startsWith('hold')?e.target:null;}render();};
  const p30=document.getElementById('plus30');if(p30)p30.onclick=()=>{state.active.timerRemaining+=30;render();if(state.active.timerRunning)startTimer();};
  const m15=document.getElementById('minus15');if(m15)m15.onclick=()=>{state.active.timerRemaining=Math.max(0,state.active.timerRemaining-15);render();if(state.active.timerRunning)startTimer();};
  document.querySelectorAll('[data-rpe]').forEach(b=>b.onclick=()=>{state.active.reviewRpe=Number(b.dataset.rpe);render();});
  document.querySelectorAll('[data-comfort]').forEach(b=>b.onclick=()=>{state.active.reviewComfort=Number(b.dataset.comfort);render();});
  const saveW=document.getElementById('saveWorkout');if(saveW)saveW.onclick=saveWorkoutReview;
  document.querySelectorAll('.history-button').forEach(b=>b.onclick=()=>{state.selectedHistoryId=b.dataset.history;render();});
  const closeH=document.getElementById('closeHistory');if(closeH)closeH.onclick=()=>{state.selectedHistoryId=null;render();};
  const dismissRank=document.getElementById('dismissRankUp');if(dismissRank)dismissRank.onclick=()=>{state.rankUpNotice=null;render();};
  document.querySelectorAll('[data-rank-select]').forEach(b=>b.onclick=()=>{state.selectedRankId=b.dataset.rankSelect;render();});
  document.querySelectorAll('.skill-toggle').forEach(b=>b.onclick=()=>{const beforeRank=getRankState().current.id;const m=getManualSkills();m[b.dataset.skill]=!m[b.dataset.skill];setManualSkills(m);const afterRank=getRankState();if(afterRank.current.id!==beforeRank)state.rankUpNotice=afterRank.current.name;render();});
  const openBody=(mode='quick')=>{const cfg=getBodyConfig(),hasQuick=BODY_FIELDS.some(f=>f.quick&&cfg.tracked[f.key]!==false);state.bodyEditorMode=mode==='quick'&&!hasQuick?'full':mode;state.bodyEditor=true;render();};
  const addBody=document.getElementById('addBody');if(addBody)addBody.onclick=()=>openBody('quick');
  const addBodyEmpty=document.getElementById('addBodyEmpty');if(addBodyEmpty)addBodyEmpty.onclick=()=>openBody('quick');
  const addBodyFull=document.getElementById('addBodyFull');if(addBodyFull)addBodyFull.onclick=()=>openBody('full');
  const addBodyFullEmpty=document.getElementById('addBodyFullEmpty');if(addBodyFullEmpty)addBodyFullEmpty.onclick=()=>openBody('full');
  document.querySelectorAll('[data-body-mode]').forEach(b=>b.onclick=()=>{state.bodyEditorMode=b.dataset.bodyMode;render();});
  document.querySelectorAll('[data-body-period]').forEach(b=>b.onclick=()=>{state.bodyPeriod=b.dataset.bodyPeriod;render();});
  document.querySelectorAll('[data-body-metric]').forEach(b=>b.onclick=()=>{state.bodyMetric=b.dataset.bodyMetric;state.bodyCompareMetric='none';render();});
  document.querySelectorAll('[data-mobility-zone]').forEach(b=>b.onclick=()=>{state.mobilityChartZone=b.dataset.mobilityZone;render();});
  ['openMobilityAssessment','openMobilityAssessmentSecondary'].forEach(id=>{const b=document.getElementById(id);if(b)b.onclick=()=>{const d=document.getElementById('mobilityAssessment');if(d){d.open=true;d.scrollIntoView({behavior:'smooth',block:'start'});}};});
  const bodyCompareMetric=document.getElementById('bodyCompareMetric');if(bodyCompareMetric)bodyCompareMetric.onchange=()=>{state.bodyCompareMetric=bodyCompareMetric.value;render();};
  const bodyFrom=document.getElementById('bodyPeriodFrom');if(bodyFrom)bodyFrom.onchange=()=>{state.bodyPeriodFrom=bodyFrom.value;render();};
  const bodyTo=document.getElementById('bodyPeriodTo');if(bodyTo)bodyTo.onchange=()=>{state.bodyPeriodTo=bodyTo.value;render();};
  document.querySelectorAll('[data-photo-position]').forEach(b=>b.onclick=()=>{state.bodyPhotoComparePosition=b.dataset.photoPosition;state.bodyPhotoCompareA='';state.bodyPhotoCompareB='';render();});
  const photoA=document.getElementById('bodyPhotoA');if(photoA)photoA.onchange=()=>{state.bodyPhotoCompareA=photoA.value;render();};
  const photoB=document.getElementById('bodyPhotoB');if(photoB)photoB.onchange=()=>{state.bodyPhotoCompareB=photoB.value;render();};
  const closeBody=document.getElementById('closeBody');if(closeBody)closeBody.onclick=()=>{state.bodyEditor=false;render();};
  const saveB=document.getElementById('saveBody');if(saveB)saveB.onclick=saveBody;
  const saveBodyCfg=document.getElementById('saveBodyConfig');if(saveBodyCfg)saveBodyCfg.onclick=saveBodyConfigFromDom;
  const resetBodyCfg=document.getElementById('resetBodyConfig');if(resetBodyCfg)resetBodyCfg.onclick=()=>{if(confirm('Réinitialiser les paramètres Mesures ?')){localStorage.removeItem(STORAGE.bodyConfig);state.bodySettingsOpen=true;state.bodySettingsMessage='Valeurs par défaut restaurées';render();}};
  const addCustomField=document.getElementById('addCustomBodyField');if(addCustomField)addCustomField.onclick=addCustomBodyField;
  document.querySelectorAll('[data-remove-custom]').forEach(b=>b.onclick=()=>{if(confirm('Retirer ce champ personnalisé ? Les anciennes valeurs restent dans l’historique.'))removeCustomBodyField(b.dataset.removeCustom);});
  document.querySelectorAll('[data-delete-body]').forEach(b=>b.onclick=()=>{if(!confirm('Supprimer ce relevé ?'))return;setBodyLogs(getBodyLogs().filter(l=>String(l.id)!==String(b.dataset.deleteBody)));render();});
  const bodySettings=document.getElementById('bodySettings');if(bodySettings)bodySettings.ontoggle=()=>{state.bodySettingsOpen=bodySettings.open;if(!bodySettings.open)state.bodySettingsMessage=null;};const openBodySettings=document.getElementById('openBodySettings');if(openBodySettings)openBodySettings.onclick=()=>{state.bodySettingsOpen=true;state.bodySettingsMessage=null;const panel=document.getElementById('bodySettings');panel?.setAttribute('open','');panel?.scrollIntoView({behavior:'smooth',block:'start'});};const openBodySettingsGoals=document.getElementById('openBodySettingsGoals');if(openBodySettingsGoals)openBodySettingsGoals.onclick=()=>{state.bodySettingsOpen=true;state.bodySettingsMessage=null;const panel=document.getElementById('bodySettings');panel?.setAttribute('open','');panel?.scrollIntoView({behavior:'smooth',block:'start'});};
  const manageT=document.getElementById('manageTutorials');if(manageT)manageT.onclick=()=>{state.tutorialManager=true;render();};
  const closeTM=document.getElementById('closeTutorialManager');if(closeTM)closeTM.onclick=()=>{state.tutorialManager=false;render();};
  document.querySelectorAll('.save-tutorial').forEach(b=>b.onclick=()=>saveTutorialOverride(decodeURIComponent(b.dataset.name),b.dataset.index));
  document.querySelectorAll('.clear-tutorial').forEach(b=>b.onclick=()=>clearTutorialOverride(decodeURIComponent(b.dataset.name)));
  const sound=document.getElementById('soundPref');if(sound)sound.onchange=()=>{const p=getPrefs();p.sound=sound.checked;setPrefs(p);};
  const vib=document.getElementById('vibrationPref');if(vib)vib.onchange=()=>{const p=getPrefs();p.vibration=vib.checked;setPrefs(p);};
  const keepAwake=document.getElementById('keepAwakePref');if(keepAwake)keepAwake.onchange=()=>{const p=getPrefs();p.keepAwake=keepAwake.checked;setPrefs(p);if(!p.keepAwake)releaseTimerWakeLock();else if(state.active?.timerRunning)requestTimerWakeLock();};
  const smart=document.getElementById('smartPref');if(smart)smart.onchange=()=>{const p=getPrefs();p.smartProgression=smart.checked;setPrefs(p);};
  const install=document.getElementById('installApp');if(install&&state.deferredInstall)install.onclick=async()=>{state.deferredInstall.prompt();await state.deferredInstall.userChoice;state.deferredInstall=null;render();};
  const exportBtn=document.getElementById('exportData');if(exportBtn)exportBtn.onclick=exportBackup;
  const importBtn=document.getElementById('importData'),importFile=document.getElementById('importDataFile');if(importBtn&&importFile)importBtn.onclick=()=>importFile.click();if(importFile)importFile.onchange=async()=>{const file=importFile.files?.[0];await importBackupFile(file);importFile.value='';};
  const clear=document.getElementById('clearAllData');if(clear)clear.onclick=async()=>{if(confirm('Effacer historique, tests, skills, mesures et photos ?')){Object.values(STORAGE).forEach(k=>localStorage.removeItem(k));await clearPhotos();render();}};
  if(state.view==='measurements'&&!state.bodyEditor)hydrateBodyPhotos();
}
function adjustValue(delta){const input=document.getElementById('valueInput');if(!input)return;const v=Math.max(0,Number(input.value||0)+delta);input.value=v;state.active.currentValue=v;}



/* ========================================================================== */
