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
  stravaActivities: "cc_strava_activities",
  stravaMeta: "cc_strava_meta",
  customWorkouts: "cc_custom_workouts",
  trainingConfig: "cc_training_config_v1",
  flexConfig: "cc_flex_config_v1",
  trainingCycles: "cc_training_cycles_v1",
  cycleActivationHistory: "cc_cycle_activation_history_v1",
  cycleProgressions: "cc_cycle_progressions_v1",
  cycleProgressionStates: "cc_cycle_progression_states_v1",
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
function renderPresetBandPicker(current,name,index){
  const selected=current||lastBandForExercise(name)||defaultBandForExercise(name);
  const items=BAND_INVENTORY.filter(b=>!['none','custom'].includes(b.id));
  return `<div class="band-picker compact-band-picker quick-band-taps" data-quick-band-index="${index}">${items.map(b=>`<button type="button" class="band-choice ${b.label===selected?'active':''}" data-band-label="${esc(b.label)}" title="${esc(`${b.short} · ${b.kg} (${b.lbs})`)}"><i class="band-swatch" style="--band-color:${b.color}"></i><span><strong>${b.short}</strong><small>${b.kg}</small></span></button>`).join('')}</div>`;
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
  if(!st.connected)return `<section class="card strava-status-card"><div class="strava-status-line"><span class="strava-dot off"></span><div class="grow"><strong>Strava non connecté</strong><small>${state.stravaMessage?esc(state.stravaMessage):'Connecte ton compte pour synchroniser automatiquement tes courses.'}</small></div><span class="strava-wordmark">STRAVA</span></div><div class="strava-actions"><a class="btn btn-primary strava-home-connect" href="/api/strava/auth">Connecter Strava</a><a class="btn btn-outline" href="/api/strava/health" target="_blank" rel="noopener">Diagnostic</a></div></section>`;
  const athlete=stravaAthleteName();
  const syncLabel=meta.lastSync?`Dernière synchro : ${formatDate(meta.lastSync)}`:'Connexion confirmée · première synchro à faire';
  const latestText=latest?`${esc(latest.name||'Course')} · ${stravaDistanceKm(latest).toFixed(2)} km · ${stravaMinutes(latest)} min`:'Aucune course importée pour le moment';
  return `<section class="card strava-status-card connected"><div class="strava-status-line"><span class="strava-dot on"></span><div class="grow"><strong>Strava connecté${athlete?` · ${esc(athlete)}`:''} ✓</strong><small>${syncLabel}</small></div><span class="strava-wordmark">STRAVA</span></div><div class="strava-home-latest">${latestText}</div><div class="strava-actions"><a class="btn btn-outline" href="https://www.strava.com/" target="_blank" rel="noopener noreferrer">Ouvrir Strava</a><button class="btn btn-secondary" id="syncStrava" ${state.stravaSyncing?'disabled':''}>${state.stravaSyncing?'Synchronisation…':'Synchroniser'}</button></div></section>`;
}
function renderStravaToday(w){
  const target=cardioTargetSeconds(w);if(!target)return '';
  const st=state.stravaStatus,runs=todayStravaRuns(),done=runs.reduce((n,a)=>n+Number(a.moving_time||a.elapsed_time||0),0),pct=Math.min(100,Math.round(done/target*100));
  if(!st.checked)return `<section class="card strava-card"><div class="kicker">Course</div><h2>Strava</h2><p class="muted small">Vérification de la connexion…</p></section>`;
  if(!st.connected)return `<section class="card strava-card"><div class="strava-head"><div><div class="kicker">Course prévue</div><h2>≈ ${Math.round(target/60)} min de cardio</h2></div><span class="strava-wordmark">STRAVA</span></div><p class="muted">Connecte ton compte pour récupérer automatiquement la durée, la distance et l’allure de tes courses.</p><div class="strava-actions"><a class="btn btn-primary" href="/api/strava/auth">Connecter avec Strava</a><a class="btn btn-outline" href="/api/strava/health" target="_blank" rel="noopener">Diagnostic</a></div></section>`;
  return `<section class="card strava-card"><div class="strava-head"><div><div class="kicker">Cardio · Compatible avec Strava</div><h2>${runs.length?(pct>=100?'Durée validée ✓':`${Math.round(done/60)} / ${Math.round(target/60)} min`):`Objectif : ${Math.round(target/60)} min`}</h2></div><span class="strava-wordmark">STRAVA</span></div>${runs.length?`<div class="strava-progress"><span style="width:${pct}%"></span></div>${renderStravaRunRows(runs)}`:'<p class="muted small">Aucune course synchronisée aujourd’hui.</p>'}<div class="strava-actions"><a class="btn btn-primary" href="https://www.strava.com/" target="_blank" rel="noopener noreferrer">Ouvrir Strava</a><button class="btn btn-secondary" id="syncStrava">Synchroniser</button></div><p class="install-note">La durée peut être validée automatiquement. La Zone 2 reste à confirmer selon ta fréquence cardiaque ou ton ressenti.</p></section>`;
}
function renderStravaProfile(){
  const st=state.stravaStatus,meta=getStravaMeta(),acts=getStravaActivities().filter(isRunActivity).slice(0,5);
  if(!st.checked)return `<section class="card strava-card"><h2>Strava</h2><p class="muted">Vérification…</p></section>`;
  if(!st.connected)return `<section class="card strava-card"><div class="strava-head"><div><div class="kicker">Course</div><h2>Connexion Strava</h2></div><span class="strava-wordmark">STRAVA</span></div><p class="muted small">Synchronise tes courses pour valider le cardio prévu par Calisthénie Coach. Les identifiants Strava restent côté serveur Vercel.</p>${state.stravaMessage?`<div class="coach-note recover">${esc(state.stravaMessage)}</div>`:''}<div class="strava-actions"><a class="btn btn-primary" href="/api/strava/auth">Connecter avec Strava</a><a class="btn btn-outline" href="/api/strava/health" target="_blank" rel="noopener">Diagnostic</a></div></section>`;
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
  {id:"ankle_left", name:"Knee-to-wall gauche", unit:"cm", note:"Distance gros orteil → mur, talon au sol. Plus haut = mieux.", min:0, step:.1},
  {id:"ankle_right", name:"Knee-to-wall droite", unit:"cm", note:"Même protocole à droite. Compare surtout la symétrie.", min:0, step:.1},
  {id:"forward_fold", name:"Flexion avant", unit:"cm", note:"0 = doigts aux orteils. Positif = au-delà, négatif = avant les orteils.", min:-50, step:.5},
  {id:"deep_squat", name:"Deep squat confortable", unit:"sec", note:"Temps confortable, talons au sol si possible, sans douleur.", min:0, step:1}
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
  testTargets:{ankle_left:10,ankle_right:10,forward_fold:0,deep_squat:60},
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
  {id:"bronze",name:"Bronze",title:"Fondations",xpMin:0,requireCount:0,minSkillCount:0,description:"Apprendre les mouvements de base, construire la régularité et enregistrer ses premières références.",objectives:[]},
  {id:"silver",name:"Argent",title:"Contrôle",xpMin:1200,requireCount:4,minSkillCount:0,description:"Un socle fiable : régularité, tirage, poussée et contrôle du poids du corps.",objectives:[
    {type:"sessions",value:12,label:"12 séances terminées",mandatory:true},
    {type:"test",id:"pullups",value:5,label:"5 tractions strictes",unit:"reps"},
    {type:"test",id:"dips",value:8,label:"8 dips stricts",unit:"reps"},
    {type:"test",id:"dead_hang",value:45,label:"Dead hang 45 sec",unit:"sec"},
    {type:"test",id:"wall_handstand",value:45,label:"Handstand au mur 45 sec",unit:"sec"},
    {type:"recovery",value:2,label:"2 jours de repos planifiés respectés",unit:"j"}
  ]},
  {id:"gold",name:"Or",title:"Force de base",xpMin:3500,requireCount:5,minSkillCount:0,description:"La force de base devient solide et permet d'aborder les premières progressions techniques.",objectives:[
    {type:"sessions",value:30,label:"30 séances terminées",mandatory:true},
    {type:"weeks",value:3,label:"3 semaines régulières (5+ jours)",unit:"sem"},
    {type:"test",id:"pullups",value:8,label:"8 tractions strictes",unit:"reps"},
    {type:"test",id:"dips",value:12,label:"12 dips stricts",unit:"reps"},
    {type:"test",id:"dead_hang",value:60,label:"Dead hang 60 sec",unit:"sec"},
    {type:"skill",id:"tuck-20",label:"Tuck L-sit 20 sec"},
    {type:"test",id:"cardio12",value:1900,label:"1 900 m en 12 min",unit:"m"}
  ]},
  {id:"platinum",name:"Platine",title:"Intermédiaire confirmé",xpMin:7000,description:"Le niveau intermédiaire est confirmé dans plusieurs dimensions : expérience, force, skill et capacité à gérer l'entraînement.",requiredCategoryCount:4,categoryRules:[
    {id:"experience",label:"Expérience",icon:"◷",required:2,mandatory:true},
    {id:"force",label:"Force",icon:"↗",required:2,mandatory:true},
    {id:"skills",label:"Skills",icon:"◆",required:1,mandatory:true},
    {id:"condition",label:"Condition",icon:"⌁",required:1,mandatory:false},
    {id:"recovery",label:"Récupération",icon:"☾",required:1,mandatory:false}
  ],objectives:[
    {type:"sessions",value:60,label:"60 séances terminées",category:"experience"},
    {type:"weeks",value:6,label:"6 semaines régulières",unit:"sem",category:"experience"},
    {type:"test",id:"pullups",value:12,label:"12 tractions strictes",unit:"reps",category:"force"},
    {type:"test",id:"dips",value:15,label:"15 dips stricts",unit:"reps",category:"force"},
    {type:"test",id:"dead_hang",value:75,label:"Dead hang 75 sec",unit:"sec",category:"force"},
    {type:"skill",id:"hs-free-5",label:"Handstand libre 5 sec",category:"skills"},
    {type:"skill",id:"lsit-10",label:"L-sit 10 sec",category:"skills"},
    {type:"skill",id:"pull-chest",label:"Chest-to-bar propre",category:"skills"},
    {type:"skill",id:"pistol-assisted",label:"Pistol squat assisté propre",category:"skills"},
    {type:"test",id:"cardio12",value:2100,label:"2 100 m en 12 min",unit:"m",category:"condition"},
    {type:"recovery",value:8,label:"8 repos planifiés respectés",unit:"j",category:"recovery"}
  ]},
  {id:"diamond",name:"Diamant",title:"Athlète complet",xpMin:12000,description:"Le rang complet : les cinq dimensions doivent être présentes, avec un vrai choix de spécialisation dans les skills.",requiredCategoryCount:5,categoryRules:[
    {id:"experience",label:"Expérience",icon:"◷",required:2,mandatory:true},
    {id:"force",label:"Force",icon:"↗",required:2,mandatory:true},
    {id:"skills",label:"Skills",icon:"◆",required:2,mandatory:true},
    {id:"condition",label:"Condition",icon:"⌁",required:1,mandatory:true},
    {id:"recovery",label:"Récupération",icon:"☾",required:1,mandatory:true}
  ],objectives:[
    {type:"sessions",value:100,label:"100 séances terminées",category:"experience"},
    {type:"weeks",value:10,label:"10 semaines régulières",unit:"sem",category:"experience"},
    {type:"test",id:"pullups",value:15,label:"15 tractions strictes",unit:"reps",category:"force"},
    {type:"test",id:"dips",value:20,label:"20 dips stricts",unit:"reps",category:"force"},
    {type:"test",id:"dead_hang",value:90,label:"Dead hang 90 sec",unit:"sec",category:"force"},
    {type:"skill",id:"hs-free-20",label:"Handstand libre 20 sec",category:"skills"},
    {type:"skill",id:"lsit-20",label:"L-sit 20 sec",category:"skills"},
    {type:"skill",id:"muscle-up",label:"1 muscle-up strict",category:"skills"},
    {type:"skill",id:"lever-adv",label:"Advanced tuck front lever 10 sec",category:"skills"},
    {type:"skill",id:"pistol",label:"Pistol squat par jambe",category:"skills"},
    {type:"test",id:"cardio12",value:2300,label:"2 300 m en 12 min",unit:"m",category:"condition"},
    {type:"recovery",value:14,label:"14 repos planifiés respectés",unit:"j",category:"recovery"}
  ]},
  {id:"master",name:"Maître",title:"Skills avancés",xpMin:19000,description:"Une base athlétique solide et au moins deux compétences avancées, sans imposer le même profil à tout le monde.",requiredCategoryCount:5,categoryRules:[
    {id:"experience",label:"Expérience",icon:"◷",required:2,mandatory:true},
    {id:"force",label:"Force",icon:"↗",required:2,mandatory:true},
    {id:"skills",label:"Skills",icon:"◆",required:2,mandatory:true},
    {id:"condition",label:"Condition",icon:"⌁",required:1,mandatory:true},
    {id:"recovery",label:"Récupération",icon:"☾",required:1,mandatory:true}
  ],objectives:[
    {type:"sessions",value:160,label:"160 séances terminées",category:"experience"},
    {type:"weeks",value:16,label:"16 semaines régulières",unit:"sem",category:"experience"},
    {type:"test",id:"pullups",value:18,label:"18 tractions strictes",unit:"reps",category:"force"},
    {type:"test",id:"dips",value:25,label:"25 dips stricts",unit:"reps",category:"force"},
    {type:"skill",id:"muscle-up-3",label:"3 muscle-ups stricts",category:"skills"},
    {type:"skill",id:"hspu-wall",label:"Handstand push-up au mur",category:"skills"},
    {type:"skill",id:"lever-oneleg",label:"One-leg front lever 5 sec",category:"skills"},
    {type:"skill",id:"flag-tuck",label:"Tuck human flag 5 sec",category:"skills"},
    {type:"skill",id:"pistol",label:"Pistol squat par jambe",category:"skills"},
    {type:"test",id:"cardio12",value:2500,label:"2 500 m en 12 min",unit:"m",category:"condition"},
    {type:"recovery",value:20,label:"20 repos planifiés respectés",unit:"j",category:"recovery"}
  ]},
  {id:"legend",name:"Légende",title:"Maîtrise",xpMin:28000,description:"Un rang de long terme : expérience, force, condition, récupération et maîtrise de plusieurs familles de skills.",requiredCategoryCount:5,categoryRules:[
    {id:"experience",label:"Expérience",icon:"◷",required:2,mandatory:true},
    {id:"force",label:"Force",icon:"↗",required:2,mandatory:true},
    {id:"skills",label:"Skills",icon:"★",required:3,mandatory:true},
    {id:"condition",label:"Condition",icon:"⌁",required:1,mandatory:true},
    {id:"recovery",label:"Récupération",icon:"☾",required:1,mandatory:true}
  ],objectives:[
    {type:"sessions",value:250,label:"250 séances terminées",category:"experience"},
    {type:"weeks",value:25,label:"25 semaines régulières",unit:"sem",category:"experience"},
    {type:"test",id:"pullups",value:20,label:"20 tractions strictes",unit:"reps",category:"force"},
    {type:"test",id:"dips",value:30,label:"30 dips stricts",unit:"reps",category:"force"},
    {type:"test",id:"dead_hang",value:120,label:"Dead hang 120 sec",unit:"sec",category:"force"},
    {type:"skill",id:"hs-free-30",label:"Handstand libre 30 sec",category:"skills"},
    {type:"skill",id:"hspu-free",label:"Handstand push-up libre",category:"skills"},
    {type:"skill",id:"muscle-up-3",label:"3 muscle-ups stricts",category:"skills"},
    {type:"skill",id:"lever-full",label:"Front lever 5 sec",category:"skills"},
    {type:"skill",id:"flag-full",label:"Human flag 5 sec",category:"skills"},
    {type:"skill",id:"pistol-5",label:"5 pistol squats par jambe",category:"skills"},
    {type:"test",id:"cardio12",value:2700,label:"2 700 m en 12 min",unit:"m",category:"condition"},
    {type:"recovery",value:30,label:"30 repos planifiés respectés",unit:"j",category:"recovery"}
  ]}
];

const state = {
  view: "today",
  active: null,
  timer: null,
  deferredInstall: null,
  testEditor: null,
  bodyEditor: false,
  bodyEditorMode: "quick",
  bodyPeriod: "30d",
  bodyPeriodFrom: "",
  bodyPeriodTo: "",
  bodyPhotoComparePosition: "front",
  bodyPhotoCompareA: "",
  bodyPhotoCompareB: "",
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
function getTests() { return parse(STORAGE.tests, []); }
function setTests(v) { save(STORAGE.tests, v); }
function getManualSkills() { return parse(STORAGE.skills, {}); }
function setManualSkills(v) { save(STORAGE.skills, v); }
function getBodyLogs() { return parse(STORAGE.body, []); }
function setBodyLogs(v) { save(STORAGE.body, v); }
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
    if(key===today)return {key,status:(sessions.length||quick.length||runs.length)?'rest-broken':'rest-planned',cycle,w};
    return {key,status:(sessions.length||quick.length||runs.length)?'rest-broken':'rest-ok',cycle,w};
  }
  const plannedSessions=sessions.filter(h=>h.trainingCycleId?String(h.trainingCycleId)===String(cycle.id)&&Number(h.day)===d.getDay():!h.customWorkoutId&&Number(h.day)===d.getDay());
  if(plannedSessions.length)return {key,status:'done',cycle,w,session:plannedSessions[0]};
  return {key,status:key===today?'planned':'missed',cycle,w};
}
function respectedRestDays(){
  const p=getPrefs();if(!p.recoveryXPStart){p.recoveryXPStart=localDateKey();setPrefs(p);}const start=new Date(p.recoveryXPStart+'T12:00:00'),end=new Date();end.setHours(0,0,0,0);let n=0;
  for(let d=new Date(start);d<end;d.setDate(d.getDate()+1)){if(dailyCycleStatus(d).status==='rest-ok')n++;if(n>5000)break;}return n;
}
function renderCycleHeatmap(weeks=16){
  const today=new Date(),end=mondayDate(today);end.setDate(end.getDate()+6);const start=new Date(end);start.setDate(start.getDate()-(weeks*7-1));
  const cells=[];const counts={done:0,'rest-ok':0,missed:0,'rest-broken':0};
  for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)){const st=dailyCycleStatus(new Date(d));if(counts[st.status]!=null)counts[st.status]++;const title=`${st.key} · ${st.cycle.name} · ${st.status==='done'?'séance terminée':st.status==='rest-ok'?'repos respecté':st.status==='rest-planned'?'repos prévu':st.status==='rest-broken'?'repos interrompu':st.status==='missed'?'séance manquée':st.status==='planned'?'séance prévue':st.status==='untracked'?'avant suivi':'à venir'}`;cells.push(`<i class="cycle-heat-cell ${st.status}" title="${esc(title)}" aria-label="${esc(title)}"></i>`);}
  return `<section class="card cycle-heat-card"><div class="section-head"><div><div class="kicker">Régularité · ${weeks} semaines</div><h2>Historique du cycle</h2></div><span class="pill">+10 XP / repos respecté</span></div><div class="cycle-heat-summary"><span><strong>${counts.done}</strong> séances terminées</span><span><strong>${counts['rest-ok']}</strong> repos respectés</span><span><strong>${counts.missed}</strong> jours manqués</span></div><div class="cycle-heat-wrap"><div class="cycle-heat-days"><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span></div><div class="cycle-heat-grid">${cells.join('')}</div></div><div class="cycle-heat-legend"><span><i class="done"></i>Séance terminée</span><span><i class="rest-ok"></i>Repos respecté</span><span><i class="missed"></i>Manqué</span><span><i class="rest-broken"></i>Repos interrompu</span></div><p class="muted small">Un repos est validé le lendemain s'il appartenait au cycle actif et qu'aucune séance, micro-série de renforcement ou course Strava de 15 min+ n'a été enregistrée. Mobilité douce et marche non enregistrée restent compatibles.</p></section>`;
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
function undoLastQuickLog(){
  const logs=getQuickLogs(); if(!logs.length)return;
  logs.shift(); setQuickLogs(logs); state.quickToast='Dernier ajout annulé'; render();
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
async function exportBackup(){
  const data={};
  Object.entries(STORAGE).forEach(([name,key])=>{data[name]=parse(key,null);});
  const photos={};
  for(const row of getBodyLogs()){
    if(!row.photoId||photos[row.photoId])continue;
    try{const blob=await getPhoto(row.photoId);if(blob)photos[row.photoId]=await blobToDataURL(blob);}catch(e){console.warn('Photo non exportée',row.photoId,e);}
  }
  const backup={app:'Calisthenie Coach',schema:1,version:'10.1',exportedAt:new Date().toISOString(),data,photos};
  const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=`calisthenie-coach-backup-${localDateKey()}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function importBackupFile(file){
  if(!file)return;
  let backup;
  try{backup=JSON.parse(await file.text());}catch{alert('Ce fichier n’est pas un JSON valide.');return;}
  if(!backup||backup.app!=='Calisthenie Coach'||!backup.data||typeof backup.data!=='object'){alert('Ce fichier ne semble pas être une sauvegarde Calisthénie Coach valide.');return;}
  if(!confirm('Restaurer cette sauvegarde ? Les données actuelles de ce navigateur seront remplacées.'))return;
  try{
    Object.entries(STORAGE).forEach(([name,key])=>{if(Object.prototype.hasOwnProperty.call(backup.data,name)){const value=backup.data[name];if(value===null||value===undefined)localStorage.removeItem(key);else save(key,value);}});
    await clearPhotos();
    if(backup.photos&&typeof backup.photos==='object'){
      for(const [id,dataURL] of Object.entries(backup.photos)){const blob=dataURLToBlob(dataURL);if(blob)await putPhoto(id,blob);}
    }
    state.active=null;state.quickEditor=false;state.bodyEditor=false;state.selectedHistoryId=null;state.view='profile';render();alert('Sauvegarde restaurée avec succès.');
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
  w.exercises=(w.exercises||[]).map(e=>{
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
  // Les micro-séries Quick Log font partie de la charge réelle, même si elles restent hors XP / PR / progression automatique.
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
    <div class="volume-list param-volume-list">${groups.map(g=>{const a=actual[g]||0,p=planned[g]||0,t=cfg.volumeTargets[g]||{min:0,max:99},st=volumeStatus(a,t),pct=clamp(a/Math.max(1,t.max),0,1.25)*100,b=actualBreakdown[g]||{primary:0,secondary:0,technical:0},pb=plannedBreakdown[g]||{};return `<div class="param-volume-row"><div class="param-volume-head"><div><strong>${g}</strong><span>${a.toFixed(1)} réel · ${p.toFixed(1)} planifié · cible ${t.min}–${t.max}</span></div><span class="target-state ${st.cls}">${st.label}</span></div><div class="volume-track target-track"><i style="width:${Math.min(100,pct)}%"></i><em style="left:${Math.min(100,t.min/Math.max(1,t.max)*100)}%"></em></div><div class="volume-breakdown"><span>P <b>${b.primary.toFixed(1)}</b></span><span>S <b>${b.secondary.toFixed(1)}</b></span><span>T <b>${b.technical.toFixed(1)}</b></span><small>plan P/S/T ${Number(pb.primary||0).toFixed(1)} / ${Number(pb.secondary||0).toFixed(1)} / ${Number(pb.technical||0).toFixed(1)}</small></div></div>`}).join('')}</div>
    <details class="parameter-details"><summary><div><strong>Comment c'est calculé ?</strong><small>${quickCount} Quick Log${quickCount>1?'s':''} inclus cette semaine</small></div><span>⌄</span></summary><div class="parameter-body"><p>Une série applique les coefficients de l'exercice à tous les muscles concernés. Exemple : une série de pompes peut compter 1,00 pectoraux + 0,60 triceps + 0,35 épaules. Les seuils ci-dessous classent ensuite chaque contribution en travail principal, secondaire ou technique.</p><p>Ce compteur sert au pilotage de la charge. Il ne signifie pas qu'une série technique fatigue autant qu'une série lourde.</p></div></details>
    <details class="parameter-details"><summary><div><strong>Pourquoi ces valeurs ?</strong><small>Base scientifique + choix de coaching</small></div><span>⌄</span></summary><div class="parameter-body"><p>L'ACSM 2026 recommande surtout la régularité, le travail de tous les grands groupes au moins 2 jours/semaine et l'individualisation. Pour l'hypertrophie, ~10 séries hebdomadaires par groupe est un repère général, pas une obligation.</p><p>Les fourchettes de cette app partent de ce socle puis donnent davantage de marge au dos, au core et au grip car ils soutiennent directement les tractions, L-sit, handstand et futurs skills. Bandes et poids du corps sont considérés comme des outils valides de renforcement.</p><div class="source-links"><a href="https://acsm.org/resistance-training-guidelines-update-2026/" target="_blank" rel="noopener">ACSM 2026</a><a href="https://www.who.int/europe/news-room/fact-sheets/item/everyday-actions-for-better-health-who-recommendations" target="_blank" rel="noopener">OMS · activité physique</a></div></div></details>
    <details class="parameter-details"><summary><div><strong>Modifier mes cibles</strong><small>Tout est enregistré localement</small></div><span>⌄</span></summary><div class="parameter-body"><div class="parameter-grid threshold-grid"><label><span>Seuil principal</span><input class="mini-input" id="primaryThreshold" type="number" min="0" max="1" step="0.05" value="${cfg.primaryThreshold}"></label><label><span>Seuil secondaire</span><input class="mini-input" id="secondaryThreshold" type="number" min="0" max="1" step="0.05" value="${cfg.secondaryThreshold}"></label><label><span>Cardio min / semaine</span><input class="mini-input" id="cardioMinTarget" type="number" min="0" step="5" value="${cfg.cardioMin}"></label><label><span>Cardio max / semaine</span><input class="mini-input" id="cardioMaxTarget" type="number" min="0" step="5" value="${cfg.cardioMax}"></label></div><div class="target-editor-list">${groups.map(g=>{const t=cfg.volumeTargets[g];return `<div class="target-editor-row"><strong>${g}</strong><label><span>Min</span><input class="mini-input volume-target-input" data-group="${g}" data-bound="min" type="number" min="0" step="0.5" value="${t.min}"></label><label><span>Max</span><input class="mini-input volume-target-input" data-group="${g}" data-bound="max" type="number" min="0" step="0.5" value="${t.max}"></label></div>`}).join('')}</div><div class="parameter-actions"><button class="btn btn-primary" id="saveTrainingConfig">Enregistrer les cibles</button><button class="btn btn-outline" id="resetTrainingConfig">Valeurs par défaut</button></div></div></details>
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
    <p class="muted small quick-policy">Le volume libre est suivi pour ta charge réelle, mais ne donne pas d’XP et ne déclenche pas automatiquement une progression de niveau.</p>
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
    <p class="muted small">Ces micro-séries restent séparées des séries programmées : elles comptent dans ton activité réelle, mais pas dans les PR, l’XP ou les promotions.</p></section>`;
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
  const quick=getQuickLogs(),last=quick[0],recent=recentQuickActions();
  const options=visibleExerciseLibrary()
    .filter(x=>x.prescription&&(x.prescription.type.startsWith('reps')||x.prescription.type.startsWith('hold')))
    .sort((a,b)=>quickCategoryOrder(a.category)-quickCategoryOrder(b.category)||a.name.localeCompare(b.name,'fr'));
  const categories=[...new Set(options.map(x=>x.category))].sort((a,b)=>quickCategoryOrder(a)-quickCategoryOrder(b)||a.localeCompare(b,'fr'));
  const selected=options[0]||null;
  return `<div class="quick-overlay"><section class="quick-sheet"><div class="quick-sheet-head"><div><div class="kicker">Quick Log</div><h2>Ajouter une micro-série</h2></div><button class="icon-btn" id="closeQuickLog">×</button></div>
    ${state.quickToast?`<div class="quick-toast">✓ ${esc(state.quickToast)}</div>`:''}
    ${recent.length?`<div class="quick-recent"><div class="quick-recent-title">Répéter en 1 tap</div><div class="quick-recent-grid">${recent.map((x,i)=>`<button class="quick-repeat" data-repeat-index="${i}" data-quick-name="${encodeURIComponent(x.exercise)}" data-quick-type="${x.type}" data-quick-value="${x.value}" data-quick-band="${x.band?encodeURIComponent(x.band):''}" data-quick-load="${Number(x.loadKg||0)}"><strong>${quickFamily(x.exercise)}</strong><span>+${x.value} ${quickUnit(x.type)}${x.band?' · '+bandByLabel(x.band).short:''}${x.loadKg?' · '+x.loadKg+' kg':''}</span></button>`).join('')}</div></div>`:''}
    <p class="muted small">Tape ton nombre exact ou utilise un raccourci. Pour les mouvements assistés, choisis ta bande d’un seul tap.</p>
    <div class="quick-presets">${QUICK_PRESETS.map((p,i)=>{const isBand=p.type==='reps_band',preferred=isBand?(lastBandForExercise(p.name)||defaultBandForExercise(p.name)):null;return `<div class="quick-preset quick-preset-rich" data-quick-preset="${i}"><div class="quick-preset-head"><div><strong>${p.label}</strong><small>${p.type==='hold'?'secondes':isBand?'répétitions · assistance':'répétitions'}</small></div><div class="quick-preset-actions">${p.adds.map(v=>`<button class="quick-add" data-quick-preset-index="${i}" data-quick-name="${encodeURIComponent(p.name)}" data-quick-type="${p.type}" data-quick-value="${v}">+${v}${p.type==='hold'?'s':''}</button>`).join('')}</div></div>${isBand?`<div class="quick-preset-bandrow"><label>Bande</label>${renderPresetBandPicker(preferred,p.name,i)}</div>`:''}<div class="quick-exact"><input class="quick-exact-input" id="quickExact_${i}" type="number" inputmode="numeric" min="1" step="1" placeholder="Nombre exact"><button class="quick-exact-add" data-quick-exact-index="${i}" data-quick-preset-index="${i}" data-quick-name="${encodeURIComponent(p.name)}" data-quick-type="${p.type}">Ajouter</button></div></div>`;}).join('')}</div>
    <details class="quick-custom"><summary>Autre exercice <span class="quick-custom-hint">Recherche visuelle</span></summary>
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
    ${last?`<button class="btn btn-outline" id="undoQuickLog">↶ Annuler le dernier ajout · ${quickFamily(last.exercise)} +${last.value} ${quickUnit(last.type)}${last.band?' · '+bandByLabel(last.band).short:''}${last.loadKg?' · '+last.loadKg+' kg':''}</button>`:''}
  </section></div>`;
}
function filterQuickExercisePicker(){
  const q=(document.getElementById('quickExerciseSearch')?.value||'').trim().toLowerCase();
  const active=document.querySelector('.quick-category.active')?.dataset.quickCategory||'Tous';
  let visible=0;
  document.querySelectorAll('.quick-exercise-card').forEach(card=>{
    const okCategory=active==='Tous'||card.dataset.quickExerciseCategory===active;
    const okSearch=!q||(card.dataset.quickExerciseSearch||'').includes(q);
    const show=okCategory&&okSearch;card.hidden=!show;if(show)visible++;
  });
  const empty=document.getElementById('quickExerciseEmpty');if(empty)empty.hidden=visible!==0;
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
function cycleAiMetricValue(m){
  if(m.kind==='test')return performanceDetailsForTest(m.id);
  const a=bestMetricDetails(getHistory(),m.id),b=bestQuickMetricDetails(m.id);
  return Number(b.value||0)>Number(a.value||0)?b:a;
}
function cycleAiDataSnapshot(objective='',target=''){
  const metrics=cycleAiMetricCatalog(objective,target).map(m=>({...m,...cycleAiMetricValue(m)}));
  const found=metrics.filter(m=>Number(m.value||0)>0).length;
  const sessions=getHistory().length,quick=getQuickLogs().length;
  return {metrics,found,total:metrics.length,sessions,quick,status:found===metrics.length?'complete':found?'partial':'empty'};
}
function cycleAiDataText(objective='',target=''){
  const s=cycleAiDataSnapshot(objective,target);
  return s.metrics.map(m=>`- ${m.label}: ${Number(m.value||0)>0?`${m.value} ${m.unit}${m.source?` · ${m.source}`:''}`:'aucune donnée'}`).join('\n');
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
function aiWeeklyPrescriptionFor(e,week){
  const rows=Array.isArray(e?.aiProgression)?e.aiProgression:[];
  const row=rows.find(r=>Number(r.week)===Number(week));
  if(!row)return null;
  return {sets:Number(row.sets||e.sets||1),target:Number(row.target||e.target||1),type:row.type||e.type,assistance:row.assistance||'',note:row.note||''};
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
Source: ${opts.source==='manual'?'saisie manuelle':'données Calisthenie Coach'}
${recText}

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

6. Ajoute ensuite PROGRESSION DES EXERCICES PRIORITAIRES: décris la progression concrète semaine par semaine des mouvements directement liés à l'objectif. Pour chaque exercice prioritaire modifié/ajouté, fournis une prescription explicite pour chaque semaine concernée (séries, reps/secondes et assistance éventuelle), afin que l'application ne garde pas une prescription statique pendant 8 semaines.
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
    {"day":4,"action":"replace","exercise":"Nom exact actuel","newExercise":"Nom exact bibliothèque","sets":3,"target":2,"type":"reps","weeks":[1,2,3],"reason":"Raison courte","progression":[{"week":1,"sets":3,"target":2,"type":"reps","assistance":"bande moyenne"},{"week":2,"sets":3,"target":3,"type":"reps","assistance":"bande moyenne"}]}
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
- les prescriptions de progression sont des cibles finales: l'application les appliquera telles quelles pour l'exercice prioritaire, sans leur appliquer une seconde fois le facteur global de reps/volume;
- n'ajoute aucune clé non prévue sauf si elle est indispensable.
Si tu dois d'abord poser des questions parce qu'une donnée indispensable manque, NE FOURNIS PAS ce JSON avant d'avoir reçu les réponses.`;
}


function extractCycleAiJson(text){
  const blocks=[...String(text||'').matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)].map(m=>m[1].trim());
  for(const b of blocks){try{const o=JSON.parse(b);if(o?.schemaVersion&&o?.cycle)return o;}catch(e){}}
  const start=String(text||'').lastIndexOf('{"schemaVersion"');
  if(start>=0){let depth=0,inStr=false,escp=false;for(let i=start;i<text.length;i++){const ch=text[i];if(inStr){if(escp)escp=false;else if(ch==='\\')escp=true;else if(ch==='"')inStr=false;}else{if(ch==='"')inStr=true;else if(ch==='{')depth++;else if(ch==='}'&&--depth===0){try{return JSON.parse(text.slice(start,i+1));}catch(e){break;}}}}}
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
    if(Array.isArray(ch.progression)){const seen=new Set();ch.progression.forEach(p=>{const wk=Number(p.week);if(wk<1||wk>8||seen.has(wk))errors.push(`Adaptation ${n}: progression hebdomadaire invalide.`);seen.add(wk);if(Number(p.sets)<=0||Number(p.target)<=0)errors.push(`Adaptation ${n}: séries/cible invalides en S${wk}.`);});}
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
  return `<main class="shell progression-builder-shell"><section class="card progression-builder-head"><button class="back-btn" id="closeProgressionEditor">← Mes séances</button><div class="kicker">${esc(c.name)} · Progression</div><h1>Comment ce cycle doit-il progresser ?</h1><p class="muted">Choisis le niveau de contrôle qui te convient. Le planning des exercices reste dans le cycle ; cette page décide comment sa difficulté évolue.</p><section class="cycle-ai-wizard-v109">
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
<div id="cycleAiDetectedData" class="ai-detected-data"></div>
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
</section><section class="cycle-ai-importer"><div class="cycle-ai-copy"><div class="cycle-ai-icon">↧</div><div><strong>Importer la réponse ChatGPT</strong><p>Colle la réponse complète. L’app extrait la configuration, la vérifie et crée toujours un nouveau cycle.</p></div></div><textarea id="cycleAiImportText" rows="7" placeholder="Colle ici toute la réponse de ChatGPT…"></textarea><div class="cycle-ai-actions"><button class="btn btn-secondary" id="analyzeCycleAiImport">Analyser la proposition</button><span class="small muted">Ton cycle actuel ne sera jamais modifié.</span></div><div id="cycleAiImportResult" hidden></div></section><div class="progression-manual-divider"><span>ou configure manuellement</span></div><div class="progression-mode-grid"><button class="progression-mode ${d.mode==='auto'?'active':''}" data-progression-mode="auto"><span>🤖</span><strong>Automatique</strong><small>Recommandé · l'app gère les 8 semaines</small></button><button class="progression-mode ${d.mode==='template'?'active':''}" data-progression-mode="template"><span>▤</span><strong>Modèle</strong><small>Force, volume, reprise, skills…</small></button><button class="progression-mode ${d.mode==='custom'?'active':''}" data-progression-mode="custom"><span>⚙</span><strong>Personnalisé</strong><small>Tu règles chaque semaine</small></button></div></section>
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
  return shell(`<header class="topbar"><div><div class="brand">Mes séances</div><div class="daylabel">Cycles hebdomadaires et séances libres</div></div><div class="topbar-actions"><button class="btn btn-secondary compact" id="newCustomSession">＋ Séance</button><button class="btn btn-primary compact" id="newTrainingCycle">＋ Cycle</button></div></header>
    <section class="cycle-page-intro"><div><div class="kicker">Cycle actif</div><h1>${esc(active.name)}</h1><p class="muted">La page Semaine et la séance du jour utilisent automatiquement ce cycle.</p></div></section>
    <section class="training-cycle-list">${cycles.map(renderTrainingCycleCard).join('')}</section>
    ${renderCycleHeatmap(16)}
    <section class="custom-free-head"><div><div class="kicker">Hors cycle</div><h2>Séances libres</h2><p class="muted small">Pour un entraînement ponctuel qui ne remplace pas ton planning hebdomadaire.</p></div><button class="btn btn-secondary compact" id="newCustomSession2">＋ Nouvelle séance</button></section>
    <section class="card clone-card"><div class="kicker">Créer plus vite</div><h2>Partir d'une journée du cycle actif</h2><p class="muted small">La copie devient indépendante : tu peux la modifier sans toucher au cycle.</p><div class="clone-day-grid">${[1,2,3,4,5,6,0].map(day=>{const w=workoutTemplateForDay(day);return (w.exercises||[]).length?`<button class="btn btn-outline clone-program-day" data-clone-day="${day}">${DAY_NAMES[day]} · ${esc(w.name)}</button>`:''}).join('')}</div></section>
    ${list.length?`<section class="custom-session-list">${list.map(w=>{const cov=customSessionCoverage(w);return `<article class="card custom-session-card"><div class="section-head"><div><div class="kicker">Séance libre</div><h2>${esc(w.name)}</h2><p class="muted">${esc(w.subtitle||'')}</p></div><span class="pill">≈ ${w.duration||estimateWorkoutMinutes(w)} min</span></div><div class="meta"><span class="pill">${(w.exercises||[]).length} étapes</span><span class="pill">${cov.groups.length} zones</span><span class="pill">${cov.equipment.length} équipements</span></div><div class="custom-session-actions"><button class="btn btn-primary start-custom-session" data-custom-id="${w.id}">Lancer</button><button class="btn btn-secondary edit-custom-session" data-custom-id="${w.id}">Modifier</button><button class="btn btn-outline duplicate-custom-session" data-custom-id="${w.id}">Dupliquer</button><button class="btn btn-outline danger delete-custom-session" data-custom-id="${w.id}">Supprimer</button></div></article>`}).join('')}</section>`:`<section class="card empty-custom"><h2>Aucune séance libre</h2><p class="muted">Tes cycles suffisent pour le quotidien. Crée une séance libre uniquement pour un entraînement ponctuel.</p></section>`}`,'more');
}
function renderCustomSessionEditor(){
  const w=state.customSessionDraft||defaultCustomWorkout(),names=customExerciseNames(),quality=customSessionQuality(w),ct=state.cycleDayTarget,cycle=ct?trainingCycleById(ct.cycleId):null;
  return `<main class="shell custom-editor-shell"><section class="card editor-card"><button class="back-btn" id="closeCustomEditor">← Mes séances</button><div class="kicker">${ct?`${esc(cycle.name)} · ${DAY_NAMES[ct.day]}`:'Éditeur de séance'}</div><h1>${ct?'Modifier la journée':w.id?'Modifier une séance':'Créer une séance'}</h1><p class="muted">Ajoute, remplace, supprime et réordonne librement les exercices. Le contrôle ci-dessous te signale si tu oublies une phase essentielle.</p><label class="field-label">Nom</label><input class="big-input custom-session-meta" data-custom-meta="name" value="${esc(w.name||'')}"><label class="field-label">Description</label><input class="url-input custom-session-meta" data-custom-meta="subtitle" value="${esc(w.subtitle||'')}"><div class="custom-quality"><span class="${quality.warmup?'ok':'warn'}">${quality.warmup?'✓':'!'} Échauffement</span><span class="${quality.cardio?'ok':'warn'}">${quality.cardio?'✓':'!'} Cardio</span><span class="${quality.cooldown?'ok':'warn'}">${quality.cooldown?'✓':'!'} Étirements</span><span>${quality.groups} zones</span><span>${quality.equipment} équipements</span></div><div class="custom-builder-head"><strong>Exercices</strong><button class="btn btn-secondary compact" id="addCustomExercise">＋ Ajouter</button></div><div class="custom-builder-list">${(w.exercises||[]).map((e,i)=>`<article class="custom-builder-row" data-custom-index="${i}"><div class="custom-builder-number">${i+1}</div><div class="custom-builder-main"><select class="select custom-exercise-name" data-custom-index="${i}">${names.map(n=>`<option value="${esc(n)}" ${n===e.name?'selected':''}>${n}</option>`).join('')}</select><div class="custom-builder-grid"><label><span>Phase</span><select class="select custom-ex-field" data-custom-index="${i}" data-key="phase">${['warmup','main','cardio','cooldown'].map(ph=>`<option value="${ph}" ${ph===(e.phase||'main')?'selected':''}>${phaseLabel(ph)}</option>`).join('')}</select></label>${ct?`<label class="cycle-express-toggle"><span>Express</span><input class="custom-ex-bool" data-custom-index="${i}" data-key="express" type="checkbox" ${e.express?'checked':''}><small>Inclure dans la séance courte</small></label>`:''}<label><span>Séries</span><input class="mini-input custom-ex-field" data-custom-index="${i}" data-key="sets" type="number" min="1" max="10" value="${Number(e.sets||1)}"></label><label><span>${e.type==='timer'||e.type?.startsWith('hold')?'Secondes':'Répétitions'}</span><input class="mini-input custom-ex-field" data-custom-index="${i}" data-key="target" type="number" min="1" value="${Number(e.target||1)}"></label><label><span>Repos (s)</span><input class="mini-input custom-ex-field" data-custom-index="${i}" data-key="rest" type="number" min="0" value="${Number(e.rest||0)}"></label></div><div class="custom-row-info"><span>${esc(equipmentForExercise(e.name).join(' · ')||exerciseInfo(e.name)?.equipment||'Sans matériel')}</span><span>${esc((exerciseInfo(e.name)?.muscles||[]).join(' · '))}</span></div>${(()=>{const a=exerciseAdaptation(e.name);return !a.equipment.available?`<div class="custom-setup-warning"><strong>⚠ Matériel manquant</strong><span>${esc(missingEquipmentLabels(a.equipment).join(', '))}</span>${a.suggestion?`<small>Variante proposée : ${esc(a.suggestion)}</small>`:''}</div>`:a.restriction.restricted?`<div class="custom-setup-warning"><strong>⚠ Zone à ménager</strong>${a.suggestion?`<small>Variante proposée : ${esc(a.suggestion)}</small>`:''}</div>`:''})()}</div><div class="custom-row-actions"><button class="icon-btn move-custom-up" data-custom-index="${i}" aria-label="Monter">↑</button><button class="icon-btn move-custom-down" data-custom-index="${i}" aria-label="Descendre">↓</button><button class="icon-btn remove-custom-ex" data-custom-index="${i}" aria-label="Supprimer">×</button></div></article>`).join('')}</div><div class="custom-editor-summary"><span>≈ ${estimateWorkoutMinutes(w)} min</span><span>${(w.exercises||[]).length} étapes</span></div><button class="btn btn-primary" id="saveCustomSession">Enregistrer la séance</button></section></main>`;
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
  return `<section class="card program-audit"><div class="section-head"><div><div class="kicker">Audit automatique · ${esc(getActiveTrainingCycle().name)}</div><h2>Couverture hebdomadaire</h2></div><span class="pill ${a.covered===VOLUME_GROUPS.length?'badge-success':'badge-warn'}">${a.covered}/${VOLUME_GROUPS.length} zones dans tes cibles</span></div><div class="audit-hero"><div><strong>${a.days.length}/7</strong><span>jours actifs</span></div><div><strong>${a.cardioMinutes}</strong><span>min cardio · cible ${a.cfg.cardioMin}–${a.cfg.cardioMax}</span></div><div><strong>${a.warmups}/${a.days.length}</strong><span>échauffements</span></div><div><strong>${a.cooldowns}/${a.days.length}</strong><span>retours au calme</span></div></div><div class="audit-section"><strong>Muscles / fonctions · programme complet</strong><div class="audit-chip-grid">${VOLUME_GROUPS.map(g=>{const n=a.muscles[g]||0,t=a.cfg.volumeTargets[g],ok=n>=t.min&&n<=t.max;return `<span class="audit-chip ${ok?'ok':'warn'}">${g} <b>${n.toFixed(1)}</b> <small>${t.min}–${t.max}</small></span>`}).join('')}</div></div><div class="audit-section"><strong>Matériel utilisé dans la semaine</strong><div class="equipment-audit">${HOME_EQUIPMENT.map(eq=>`<div><span>${eq}</span><strong>${a.equipment[eq]?.size||0} j</strong></div>`).join('')}</div></div><div class="audit-note ${cardioOK?'audit-ok':''}"><strong>Mode Express</strong><span>${a.expressCardioMinutes} min de cardio si tu faisais toutes les séances actives en Express. Les cibles cardio et musculaires sont maintenant les tiennes : modifie-les dans Volume musculaire selon ton objectif et ta récupération.</span></div><p class="muted small">L'audit compare désormais le programme complet à tes propres fourchettes paramétriques, au lieu d'un seuil fixe.</p></section>`;
}

function render() {
  const app = document.getElementById("app");
  if (state.active) app.innerHTML = renderCoach();
  else if (state.sessionModeEditor) app.innerHTML = renderSessionModePicker();
  else if (state.readinessEditor) app.innerHTML = renderReadiness();
  else if (state.exerciseLibrary) app.innerHTML = renderExerciseLibrary();
  else if (state.testEditor) app.innerHTML = renderTestEditor();
  else if (state.bodyEditor) app.innerHTML = renderBodyEditor();
  else if (state.tutorialManager) app.innerHTML = renderTutorialManager();
  else if (state.view === "week") app.innerHTML = renderWeek();
  else if (state.view === "flexibility") app.innerHTML = renderFlexibility();
  else if (state.view === "progress") app.innerHTML = renderProgress();
  else if (state.view === "skills") app.innerHTML = renderSkills();
  else if (state.view === "measurements") app.innerHTML = renderMeasurements();
  else if (state.view === "profile") app.innerHTML = renderProfile();
  else if (state.view === "custom") app.innerHTML = renderCustomSessions();
  else if (state.view === "more") app.innerHTML = renderMore();
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
    spark:'<path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M18.5 15.5l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1z"/>'
  };
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.spark}</svg>`;
}

function shell(content, activeTab=state.view) {
  const navTab=['today','week','progress'].includes(activeTab)?activeTab:'more';
  return `<main class="shell">${content}</main>
  <button class="quick-fab quick-fab-add" id="openQuickLog" aria-label="Ajouter une série rapide"><span class="quick-fab-plus">＋</span><span>Ajouter</span></button>
  ${renderQuickLogModal()}
  <nav class="bottom-nav bottom-nav-simple" aria-label="Navigation principale">
    <button class="nav-btn ${navTab==='today'?'active':''}" data-view="today"><span>${uiIcon('today')}</span>Aujourd'hui</button>
    <button class="nav-btn ${navTab==='week'?'active':''}" data-view="week"><span>${uiIcon('week')}</span>Semaine</button>
    <button class="nav-btn ${navTab==='progress'?'active':''}" data-view="progress"><span>${uiIcon('progress')}</span>Progrès</button>
    <button class="nav-btn ${navTab==='more'?'active':''}" data-view="more"><span>${uiIcon('more')}</span>Plus</button>
  </nav>`;
}

function renderMore(){
  const logs=getBodyLogs(),latest=logs[0];
  return shell(`<header class="topbar"><div><div class="brand">Plus</div><div class="daylabel">Outils & réglages · V10.4</div></div></header>
    <section class="more-grid more-grid-six">
      <button class="card more-tile" data-view="flexibility"><span class="more-icon">${uiIcon('flex')}</span><div><strong>Flexibilité</strong><small>Routines guidées & mobilité</small></div></button>
      <button class="card more-tile" data-view="skills"><span class="more-icon">${uiIcon('skills')}</span><div><strong>Skills</strong><small>Handstand, L-sit, lever…</small></div></button>
      <button class="card more-tile" id="openExerciseLibrary"><span class="more-icon">${uiIcon('exercises')}</span><div><strong>Exercices</strong><small>${visibleExerciseLibrary().length} mouvements & progressions</small></div></button>
      <button class="card more-tile" data-view="custom"><span class="more-icon">${uiIcon('sessions')}</span><div><strong>Mes séances</strong><small>Cycles & entraînements personnalisés</small></div></button>
      <button class="card more-tile" data-view="measurements"><span class="more-icon">${uiIcon('measurements')}</span><div><strong>Mesures</strong><small>${latest?(latest.weight?latest.weight+' kg · ':'')+(latest.waist?latest.waist+' cm taille':'Dernier relevé enregistré'):'Poids, mensurations & évolution'}</small></div></button>
      <button class="card more-tile" data-view="profile"><span class="more-icon">${uiIcon('profile')}</span><div><strong>Profil</strong><small>Réglages, sauvegarde & préférences</small></div></button>
    </section>
    <details class="today-details"><summary><div><div class="kicker">Détails</div><strong>Progression, rang & coach adaptatif</strong></div><span>⌄</span></summary><div class="details-stack">${renderCycleMini()}${renderRankMini()}${renderProgressionRecommendations()}</div></details>
    ${state.stravaMessage?`<div class="quick-toast">${esc(state.stravaMessage)}</div>`:''}${renderStravaProfile()}
    <section class="card home-equipment"><div class="kicker">Matériel maison</div><h2>Ton setup</h2><div class="equipment-chips">${HOME_EQUIPMENT.map(x=>`<span>${x}</span>`).join('')}</div><p class="muted small">Les dips et L-sit utilisent en priorité les barres parallèles. Les pompes peuvent se faire sur poignées. Pour les jambes, la résistance vient actuellement des bandes : aucun sac à dos n’est utilisé dans le programme.</p></section>`, 'more');
}
function renderTodayUsefulActions(){
  const x=progressWeekStats(),rank=getRankState(),next=rank.next;
  const count=(x.recs?.length||0)+(x.due?.overdue?1:0)+(next?1:0);
  return `<section class="card today-actions-card"><div class="section-head"><div><div class="kicker">À surveiller</div><h2>Prochaines actions utiles</h2></div><span class="pill">${count}</span></div><div class="progress-watch-list">${x.recs?.length?`<button class="progress-watch-item today-progress-link" data-today-progress="performance"><span class="progress-watch-icon">↗</span><div><strong>${x.recs.length} progression${x.recs.length>1?'s':''} disponible${x.recs.length>1?'s':''}</strong><small>${x.recs.slice(0,2).map(r=>`${r.current.name} → ${r.next.name}`).join(' · ')}</small></div><b>Voir →</b></button>`:''}<button class="progress-watch-item today-progress-link" data-today-progress="performance"><span class="progress-watch-icon">◷</span><div><strong>Tests périodiques</strong><small>${x.due.label}</small></div><b>Ouvrir →</b></button>${next?`<button class="progress-watch-item rank-${rank.current.id}" data-view="skills"><span class="progress-watch-icon">◆</span><div><strong>${rank.current.name} → ${next.name}</strong><small>${rankProgressText(next,rank.nextEval)} · ${rank.xp.total.toLocaleString('fr-FR')} XP</small></div><b>Rangs →</b></button>`:''}</div></section>`;
}
function renderToday() {
  const day=todayDay(),w=preparedWorkout(day),history=getHistory(),seven=Date.now()-7*86400000;
  const recent=history.filter(h=>new Date(h.date).getTime()>=seven),weeklyMinutes=recent.reduce((a,h)=>a+(h.durationMinutes||0),0);
  const rank=getRankState(),warning=dailyQuickLoadWarning(),todayEquipment=[...new Set((w.exercises||[]).flatMap(e=>equipmentForExercise(e.name)))];
  const baseToday=workoutTemplateForDay(day),activeCycle=getActiveTrainingCycle();
  const hero=!w.exercises.length?`<section class="card hero rest-banner"><div class="kicker">Aujourd'hui · ${DAY_NAMES[day]} · ${esc(activeCycle.name)}</div><h1>Repos planifié</h1><p class="muted">Récupération complète. Marche tranquille ou mobilité douce si tu en as envie.</p><div class="rest-reward-note"><strong>+10 XP récupération</strong><span>Le bonus sera validé demain si aucune séance, micro-série de renforcement ou course de 15 min+ n'est enregistrée aujourd'hui.</span></div></section>`:`<section class="card hero"><div class="kicker">Aujourd'hui · ${DAY_NAMES[day]}</div><h1>${w.name}</h1><p class="muted">${w.subtitle}</p><div class="meta"><span class="pill">Complète ≈ ${w.duration} min</span><span class="pill">Express ≈ ${baseToday.shortDuration||Math.max(20,Math.round((baseToday.duration||45)*.48))} min</span><span class="pill">Cardio ${Math.round(cardioTargetSeconds(w)/60)} min</span></div>${todayEquipment.length?`<div class="today-equipment"><strong>Matériel prévu</strong><div>${todayEquipment.map(x=>`<span class="pill">${x}</span>`).join('')}</div></div>`:''}<button class="btn btn-primary" id="startWorkout" data-day="${day}">Choisir le format</button></section>`;
  const program=w.exercises.length?`<details class="card today-details"><summary><div><div class="kicker">Séance complète</div><strong>Voir les ${w.exercises.length} étapes</strong></div><span>⌄</span></summary><div class="exercise-list">${w.exercises.map((e,i)=>`<div class="exercise-row exercise-row-visual">${exerciseImage(e.name,'mini')}<div class="num">${i+1}</div><div class="grow"><div class="exercise-name">${e.name}</div><div class="exercise-detail">${describe(e)} · ${phaseLabel(e.phase)}</div></div></div>`).join('')}</div></details>`:'';
  return shell(`<header class="topbar"><div><div class="brand">Calisthénie Coach</div><div class="daylabel">✓ Sauvegarde locale active</div></div></header>${renderPRNotice()}${hero}
    <section class="today-cockpit"><button class="cockpit-card" data-open-quick-log="true"><span>${uiIcon('add')}</span><strong>Ajouter</strong><small>Noter une série libre</small></button><div class="cockpit-card rank-cockpit rank-${rank.current.id}"><strong>${rank.current.name}</strong><small>${rank.next?`${rankProgressText(rank.next,rank.nextEval)} vers ${rank.next.name}`:`${rank.xp.total.toLocaleString('fr-FR')} XP · rang maximal`}</small></div><div class="cockpit-card"><span>${uiIcon('clock')}</span><strong>${weeklyMinutes} min</strong><small>${recent.length} séances / 7 j</small></div></section>
    ${renderDailyVolumeCard()}${renderTodayUsefulActions()}${program}`, 'today');
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

function renderWeek() {
  const order = [1,2,3,4,5,6,0];
  const dayNow = todayDay();
  const audit=programAudit();
  const activeCycle=getActiveTrainingCycle();
  return shell(`<header class="topbar"><div><div class="brand">Semaine</div><div class="daylabel">${esc(activeCycle.name)} · ${audit.cardioMinutes} min cardio · Complet / Express</div></div><button class="btn btn-outline compact" data-view="custom">Changer de cycle</button></header>
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
            <div class="week-inline-meta">${w.exercises.length?`<span>${w.duration} min</span><span>Express ${workoutTemplateForDay(day).shortDuration||Math.max(20,Math.round((workoutTemplateForDay(day).duration||45)*.48))}</span>${cardioMin?`<span>Cardio ${cardioMin}</span>`:''}`:`<span>Repos complet</span>`}</div>
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
function renderFlexResearch(){
  return `<details class="card flex-research"><summary><div><div class="kicker">Base scientifique</div><strong>Comment la page Flex est pilotée</strong><small>Dose, timing, intensité et transfert vers la calisthénie</small></div><span>⌄</span></summary><div class="flex-research-body"><div class="research-rule"><b>1</b><p><strong>Pour gagner de l'amplitude :</strong> l'étirement statique répété fonctionne. Une méta-analyse de 189 études observe un plateau des gains autour de 4 min cumulées par séance et 10 min/semaine, sans avantage clair à multiplier la fréquence si le volume total est comparable.</p></div><div class="research-rule"><b>2</b><p><strong>Avant une séance de force :</strong> privilégie mobilité/dynamique. Les longs étirements statiques sont mieux placés après la séance ou dans une routine dédiée lorsqu'on veut éviter une baisse aiguë de performance.</p></div><div class="research-rule"><b>3</b><p><strong>La force compte aussi :</strong> le renforcement réalisé avec une grande amplitude peut améliorer le ROM. L'app ne sépare donc pas artificiellement « mobilité » et contrôle actif.</p></div><div class="research-rule"><b>4</b><p><strong>Intensité :</strong> recherche une tension tolérable, pas la douleur. La valeur ${getFlexConfig().intensityMin}–${getFlexConfig().intensityMax}/10 est ta zone de coaching actuelle et reste modifiable.</p></div><div class="source-links"><a href="https://pubmed.ncbi.nlm.nih.gov/39614059/" target="_blank" rel="noopener">Méta-analyse dose stretching</a><a href="https://pubmed.ncbi.nlm.nih.gov/39787531/" target="_blank" rel="noopener">Force & flexibilité</a><a href="https://pubmed.ncbi.nlm.nih.gov/42539555/" target="_blank" rel="noopener">Timing chez sportifs</a></div></div></details>`;
}
function renderFlexSettings(){
  const cfg=getFlexConfig();return `<details class="card parameter-details flex-settings"><summary><div><div class="kicker">Réglages</div><strong>Mes cibles de flexibilité</strong><small>Minutes, fréquence, intensité et tests</small></div><span>⌄</span></summary><div class="parameter-body"><div class="parameter-grid"><label><span>Flex dédiée / semaine (min)</span><input class="mini-input" id="flexWeeklyMinutes" type="number" min="0" step="5" value="${cfg.weeklyMinutesTarget}"></label><label><span>Routines / semaine</span><input class="mini-input" id="flexSessionsTarget" type="number" min="0" max="7" value="${cfg.sessionsTarget}"></label><label><span>Tension min /10</span><input class="mini-input" id="flexIntensityMin" type="number" min="0" max="10" value="${cfg.intensityMin}"></label><label><span>Tension max /10</span><input class="mini-input" id="flexIntensityMax" type="number" min="0" max="10" value="${cfg.intensityMax}"></label></div><h3>Cibles par zone</h3><div class="target-editor-list">${FLEX_ZONES.map(z=>{const t=cfg.zoneTargets[z];return `<div class="target-editor-row flex-target-row"><strong>${z}</strong><label><span>Min</span><input class="mini-input flex-zone-input" data-zone="${z}" data-bound="min" type="number" min="0" step="0.5" value="${t.min}"></label><label><span>Max</span><input class="mini-input flex-zone-input" data-zone="${z}" data-bound="max" type="number" min="0" step="0.5" value="${t.max}"></label><label><span>Séances</span><input class="mini-input flex-zone-input" data-zone="${z}" data-bound="sessions" type="number" min="0" max="7" value="${t.sessions}"></label></div>`}).join('')}</div><h3>Objectifs de tests</h3><div class="parameter-grid">${MOBILITY_TESTS.map(t=>`<label><span>${t.name}</span><input class="mini-input flex-test-target" data-test-target="${t.id}" type="number" step="${t.step}" value="${cfg.testTargets[t.id]}"></label>`).join('')}<label><span>Écart cheville max (cm)</span><input class="mini-input" id="ankleSymmetryMax" type="number" min="0" step="0.1" value="${cfg.ankleSymmetryMax}"></label></div><div class="parameter-actions"><button class="btn btn-primary" id="saveFlexConfig">Enregistrer</button><button class="btn btn-outline" id="resetFlexConfig">Valeurs par défaut</button></div></div></details>`;
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
function targetedFlexRoutine(day=todayDay()){
  if([2,3,5].includes(day)) return flexRoutineById("upper-15");
  if([4].includes(day)) return flexRoutineById("lower-18");
  if(day===6) return flexRoutineById("reset-10");
  if(day===0) return flexRoutineById("full-25");
  return flexRoutineById("reset-10");
}
function flexPriority(){
  const cfg=getFlexConfig(),b=weeklyFlexBalance(),lower=["Chevilles","Hanches","Fléchisseurs hanche","Adducteurs","Ischios"],upper=["Épaules","Pectoraux","Thorax","Poignets"];
  const deficit=z=>{const r=b.zones[z],t=cfg.zoneTargets[z];return Math.max(0,(t.min-r.minutes)/Math.max(1,t.min))+Math.max(0,(t.sessions-r.sessions.size)/Math.max(1,t.sessions));};
  let lowerScore=lower.reduce((n,z)=>n+deficit(z),0),upperScore=upper.reduce((n,z)=>n+deficit(z),0);
  // Les tests personnels renforcent la priorité de la zone réellement limitée.
  const al=latestMobilityValue('ankle_left'),ar=latestMobilityValue('ankle_right'),ff=latestMobilityValue('forward_fold'),ds=latestMobilityValue('deep_squat');
  if(al!=null&&al<cfg.testTargets.ankle_left)lowerScore+=1;if(ar!=null&&ar<cfg.testTargets.ankle_right)lowerScore+=1;if(ff!=null&&ff<cfg.testTargets.forward_fold)lowerScore+=1;if(ds!=null&&ds<cfg.testTargets.deep_squat)lowerScore+=.75;
  return {lowerScore,upperScore,label:lowerScore>upperScore*1.15?'Bas du corps':upperScore>lowerScore*1.15?'Haut du corps':'Équilibrée'};
}
function recommendedFlexRoutine(day=todayDay()){
  if(day===0) return flexRoutineById("full-25");
  const p=flexPriority();if(p.label==='Bas du corps')return flexRoutineById("lower-18");if(p.label==='Haut du corps')return flexRoutineById("upper-15");
  if(day===4) return flexRoutineById("lower-18");if([2,3].includes(day)) return flexRoutineById("upper-15");return flexRoutineById("reset-10");
}
function flexChoiceCard(label, icon, routine, description){
  return `<article class="flex-choice-card">
    <div class="flex-choice-icon" aria-hidden="true">${icon}</div>
    <div class="flex-choice-main"><div class="flex-choice-top"><div><span>${label}</span><strong>${routine.name}</strong></div><b>≈ ${routine.duration} min</b></div><p>${description}</p>
    <div class="flex-choice-actions"><button class="btn btn-primary start-flex" data-flex="${routine.id}">Commencer</button><details class="flex-preview"><summary>Voir les exercices</summary><div class="week-exercise-list">${routine.exercises.map(renderFlexExercise).join('')}</div></details></div></div>
  </article>`;
}
function renderFlexibility(){
  const logs=getFlexLogs(), weekAgo=Date.now()-7*86400000, recent=logs.filter(x=>new Date(x.date).getTime()>=weekAgo);
  const recommended=recommendedFlexRoutine(), targeted=targetedFlexRoutine(),last=logs[0],cfg=getFlexConfig(),priority=flexPriority();
  const left=latestMobilityValue('ankle_left'),right=latestMobilityValue('ankle_right'),sym=(left!=null&&right!=null)?Math.abs(left-right):null;
  return shell(`<header class="topbar"><div><div class="brand">Flex</div><div class="daylabel">Mobilité mesurée · objectifs paramétriques</div></div></header>
    <section class="card flex-simple-hero"><div class="flex-hero-copy"><div class="kicker">Conseillé aujourd’hui · priorité ${priority.label.toLowerCase()}</div><h1>${recommended.name}</h1><p>${recommended.subtitle}</p><div class="meta"><span class="pill">≈ ${recommended.duration} min</span><span class="pill">${recommended.focus}</span><span class="pill">tension ${cfg.intensityMin}–${cfg.intensityMax}/10</span></div></div><button class="btn btn-primary start-flex flex-hero-start" data-flex="${recommended.id}">Commencer</button></section>
    ${renderFlexBalance()}
    <section class="flex-simple-section"><div class="section-head"><div><div class="kicker">Choix rapide</div><h2>De combien de temps disposes-tu ?</h2></div></div><div class="flex-choice-list">
      ${flexChoiceCard('Rapide','⚡',flexRoutineById('reset-10'),'Récupération douce et mobilité générale. Idéale presque tous les jours.')}
      ${flexChoiceCard('Ciblée','◎',targeted, targeted.id==='lower-18'?'Accent sur chevilles, hanches, adducteurs et ischios.':'Accent sur poignets, épaules, pectoraux, dorsaux et thorax.')}
      ${flexChoiceCard('Complète','◇',flexRoutineById('full-25'),'Travail global quand tu veux consacrer une vraie séance à la souplesse.')}
    </div></section>
    ${renderFlexResearch()}
    <details class="card flex-tracking" open><summary><div><div class="kicker">Mesures</div><strong>Tests de mobilité</strong><small>${recent.length} routine${recent.length>1?'s':''} cette semaine${last?` · dernière : ${formatDate(last.date)}`:''}${sym!=null?` · écart chevilles ${sym.toFixed(1)} cm`:''}</small></div><span>⌄</span></summary><div class="flex-tracking-body">
      <p class="muted small">Refais les tests environ toutes les 4 semaines avec le même protocole. Les objectifs sont personnels et modifiables.</p><div class="mobility-grid">${MOBILITY_TESTS.map(t=>{const latest=latestMobilityValue(t.id),best=bestMobilityValue(t.id),goal=mobilityGoalState(t,latest,cfg);return `<div class="mobility-test"><div class="mobility-test-head"><strong>${t.name}</strong><span class="target-state ${goal.cls}">${goal.label}</span></div><div class="mobility-values"><span>Dernier <b>${latest==null?'—':latest+' '+t.unit}</b></span><span>Meilleur <b>${best==null?'—':best+' '+t.unit}</b></span></div><details><summary class="mobility-measure-toggle">Mesurer</summary><small>${t.note}</small><div class="mobility-entry"><input id="mob_${t.id}" type="number" inputmode="decimal" min="${t.min}" step="${t.step}" placeholder="${t.unit}"><button class="btn btn-secondary save-mobility" data-test="${t.id}">OK</button></div></details></div>`;}).join('')}</div>${sym!=null?`<div class="flex-symmetry ${sym<=cfg.ankleSymmetryMax?'good':'warn'}"><strong>Symétrie chevilles</strong><span>${sym.toFixed(1)} cm d'écart · cible ≤ ${cfg.ankleSymmetryMax} cm</span></div>`:''}
      <div class="divider"></div><h3>Historique récent</h3>${logs.length?logs.slice(0,4).map(l=>`<div class="history-item"><div class="history-top"><div><div class="history-title">${l.name}</div><div class="small muted">${formatDate(l.date)} · ${l.durationMinutes} min</div></div><span class="pill">${l.comfort||'—'}/5</span></div></div>`).join(''):'<div class="empty">Ta première routine apparaîtra ici.</div>'}
    </div></details>
    ${renderFlexSettings()}
    <div class="flex-safety-line"><span>✓</span><p><strong>Règle actuelle :</strong> tension ${cfg.intensityMin}–${cfg.intensityMax}/10. Pas de douleur vive, pincement, engourdissement ou sensation électrique.</p></div>`,"flexibility");
}
function saveMobilityTest(id){const def=MOBILITY_TESTS.find(x=>x.id===id),el=document.getElementById(`mob_${id}`);if(!def||!el||el.value==='')return;const value=Number(el.value);if(!Number.isFinite(value))return;const arr=getMobilityTests();arr.unshift({id:Date.now(),date:new Date().toISOString(),testId:id,value});setMobilityTests(arr.slice(0,400));render();}

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
function sessionXP(session){
  const score=clamp(Number(session?.score ?? 80),0,100);
  let xp=70+Math.round(score*.30);
  const rpe=Number(session?.rpe||0);
  if(rpe>=5&&rpe<=7&&!session?.jointDiscomfort)xp+=10;
  return clamp(xp,50,110);
}
function mondayWeekKey(iso){
  const d=new Date(iso), copy=new Date(d.getFullYear(),d.getMonth(),d.getDate());
  const offset=(copy.getDay()+6)%7; copy.setDate(copy.getDate()-offset);
  return `${copy.getFullYear()}-${String(copy.getMonth()+1).padStart(2,'0')}-${String(copy.getDate()).padStart(2,'0')}`;
}
function consistentWeeksCount(){
  const weeks=new Map();
  getHistory().forEach(s=>{const key=mondayWeekKey(s.date),day=new Date(s.date).toDateString();if(!weeks.has(key))weeks.set(key,new Set());weeks.get(key).add(day);});
  return [...weeks.values()].filter(days=>days.size>=5).length;
}
function xpSummary(){
  const history=getHistory(), training=history.reduce((sum,s)=>sum+sessionXP(s),0);
  const consistentWeeks=consistentWeeksCount(),consistency=consistentWeeks*100;
  const completedSkills=SKILL_TREES.flatMap(t=>t.levels).filter(skillDone).length;
  const skills=completedSkills*60;
  const uniqueTests=new Set(getTests().map(t=>t.testId)).size;
  const tests=uniqueTests*30;
  const recoveryDays=respectedRestDays(),recovery=recoveryDays*10;
  return {total:training+consistency+skills+tests+recovery,training,consistency,skills,tests,recovery,recoveryDays,consistentWeeks,completedSkills,uniqueTests};
}
function objectiveProgress(obj){
  let current=0;
  if(obj.type==='sessions')current=getHistory().length;
  else if(obj.type==='weeks')current=consistentWeeksCount();
  else if(obj.type==='recovery')current=respectedRestDays();
  else if(obj.type==='test')current=performanceValueForTest(obj.id);
  else if(obj.type==='exercise')current=bestMetric(getHistory(),obj.name);
  else if(obj.type==='skill')current=skillDoneById(obj.id)?1:0;
  const target=obj.type==='skill'?1:Number(obj.value||1);
  return {current,target,done:current>=target};
}
function evaluateRank(rank){
  const items=(rank.objectives||[]).map(obj=>({obj,...objectiveProgress(obj)}));
  const completed=items.filter(x=>x.done).length;
  const mandatory=items.filter(x=>x.obj.mandatory),mandatoryDone=mandatory.filter(x=>x.done).length;
  const skillItems=items.filter(x=>x.obj.type==='skill'),skillCompleted=skillItems.filter(x=>x.done).length;
  const mandatoryMet=mandatoryDone===mandatory.length,skillsMet=skillCompleted>=(rank.minSkillCount||0);
  const categoryRules=(rank.categoryRules||[]).map(rule=>{
    const categoryItems=items.filter(x=>x.obj.category===rule.id);
    const categoryDone=categoryItems.filter(x=>x.done).length;
    return {...rule,items:categoryItems,completed:categoryDone,total:categoryItems.length,met:categoryDone>=rule.required};
  });
  const categoryCompleted=categoryRules.filter(x=>x.met).length;
  const categoryRequired=rank.requiredCategoryCount||categoryRules.length;
  const mandatoryCategoriesMet=categoryRules.filter(x=>x.mandatory).every(x=>x.met);
  const categoriesMet=!categoryRules.length||(mandatoryCategoriesMet&&categoryCompleted>=categoryRequired);
  const legacyGoalsMet=mandatoryMet&&skillsMet&&completed>=(rank.requireCount||0);
  const goalsMet=categoryRules.length?mandatoryMet&&categoriesMet:legacyGoalsMet;
  const progressCompleted=categoryRules.length?categoryCompleted:completed;
  const progressRequired=categoryRules.length?categoryRequired:(rank.requireCount||0);
  return {items,completed,required:rank.requireCount||0,mandatoryDone,mandatoryTotal:mandatory.length,mandatoryMet,skillCompleted,skillTotal:skillItems.length,minSkillCount:rank.minSkillCount||0,skillsMet,categoryRules,categoryCompleted,categoryRequired,mandatoryCategoriesMet,categoriesMet,progressCompleted,progressRequired,goalsMet};
}
function getRankState(){
  const xp=xpSummary(); let index=0;
  for(let i=1;i<RANKS.length;i++){
    const ev=evaluateRank(RANKS[i]);
    if(xp.total>=RANKS[i].xpMin&&ev.goalsMet)index=i;else break;
  }
  const current=RANKS[index],next=RANKS[index+1]||null,nextEval=next?evaluateRank(next):null;
  const xpProgress=next?clamp((xp.total-current.xpMin)/Math.max(1,next.xpMin-current.xpMin),0,1):1;
  const goalProgress=next&&nextEval.progressRequired?clamp(nextEval.progressCompleted/nextEval.progressRequired,0,1):1;
  return {xp,current,index,next,nextEval,xpProgress,goalProgress};
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
  const rs=getRankState(),selectedId=state.selectedRankId||rs.current.id,selectedIndex=rankIndexById(selectedId),rank=RANKS[selectedIndex],ev=evaluateRank(rank),unlocked=selectedIndex<=rs.index;
  const xpPct=rank.xpMin===0?100:clamp(rs.xp.total/rank.xpMin,0,1)*100;
  const advanced=!!ev.categoryRules.length;
  return `<section class="rank-explorer">
    <div class="rank-ladder" role="list">${RANKS.map((r,i)=>{const status=rankStateLabel(i,rs.index);return `<button class="rank-ladder-card rank-${r.id} ${selectedId===r.id?'selected':''} ${i<rs.index?'done':i===rs.index?'current':'future'}" data-rank-select="${r.id}"><span class="rank-ladder-emblem">${i<rs.index?'✓':i+1}</span><strong>${r.name}</strong><small>${r.title}</small><i>${status}</i></button>`}).join('')}</div>
    <section class="card rank-detail rank-${rank.id}"><div class="rank-detail-head"><div class="rank-emblem rank-emblem-large">${selectedIndex===6?'★':selectedIndex+1}</div><div class="grow"><div class="kicker">${unlocked?'Progression personnelle':'Objectifs visibles à l’avance'}</div><div class="rank-name">${rank.name}</div><h2>${rank.title}</h2><p>${rank.description}</p></div><span class="rank-status-pill">${rankStateLabel(selectedIndex,rs.index)}</span></div>
      ${selectedIndex===0?`<div class="rank-foundation-note"><strong>Point de départ</strong><span>Bronze est le rang d'entrée. Les premières séances construisent l'XP et les références nécessaires pour Argent.</span></div>`:`<div class="rank-requirement-grid"><div><span>XP requis</span><strong>${rs.xp.total.toLocaleString('fr-FR')} / ${rank.xpMin.toLocaleString('fr-FR')}</strong><div class="rank-progress"><span style="width:${xpPct}%"></span></div></div>${advanced?`<div><span>Catégories</span><strong>${ev.categoryCompleted} / ${ev.categoryRequired} requises</strong><small>${ev.categoryRules.filter(x=>x.mandatory).length} catégories obligatoires</small></div><div><span>Objectifs</span><strong>${ev.completed} / ${ev.items.length} validés</strong><small>choix à l'intérieur des catégories</small></div>`:`<div><span>Missions</span><strong>${ev.completed} / ${ev.required} requises</strong><small>${ev.items.length} disponibles</small></div>${rank.minSkillCount?`<div><span>Skills minimum</span><strong>${ev.skillCompleted} / ${rank.minSkillCount}</strong><small>parmi ${ev.skillTotal} missions skill</small></div>`:''}`}</div>`}
      ${advanced?`<div class="section-head rank-categories-head"><div><div class="kicker">Portes de progression</div><h2>Catégories du rang</h2></div><span class="pill">${ev.categoryCompleted}/${ev.categoryRequired}</span></div>${renderRankCategories(rank,ev)}`:''}
      <div class="section-head rank-missions-head"><div><div class="kicker">Critères du rang</div><h2>${selectedIndex<rs.index?'Objectifs validés':selectedIndex===rs.index?'Ce que tu consolides':'Tu peux déjà préparer ce rang'}</h2></div><span class="pill">${ev.completed}/${ev.items.length}</span></div>
      ${ev.items.length?`<div class="rank-objectives rank-objectives-detailed">${ev.items.map(item=>renderRankObjective(item,rank)).join('')}</div>`:''}
      ${advanced?`<p class="rank-rule-note"><strong>Règle à partir de Platine :</strong> les catégories marquées requises doivent être validées. Platine laisse encore un choix entre Condition et Récupération ; à partir de Diamant, les cinq dimensions deviennent obligatoires. À l'intérieur de Force et Skills, plusieurs chemins restent possibles.</p>`:rank.minSkillCount?`<p class="rank-rule-note"><strong>Règle de spécialisation :</strong> ${rank.name} demande au moins ${rank.minSkillCount} mission${rank.minSkillCount>1?'s':''} de type skill. Tu n'es pas obligé de maîtriser toutes les branches.</p>`:''}
    </section>
  </section>`;
}
function renderRankMini(){
  const r=getRankState(),next=r.next;
  return `<section class="card rank-card rank-${r.current.id} rank-mini"><div class="rank-head"><div class="rank-emblem">${r.index+1}</div><div class="grow"><div class="kicker">Rang actuel</div><div class="rank-name">${r.current.name}</div><small class="rank-title-mini">${r.current.title}</small></div><div class="rank-xp"><strong>${r.xp.total.toLocaleString('fr-FR')}</strong><span>XP</span></div></div>${next?`<div class="rank-progress-label"><span>Vers ${next.name}</span><strong>${Math.round(r.xpProgress*100)}% XP</strong></div><div class="rank-progress"><span style="width:${r.xpProgress*100}%"></span></div><div class="rank-nextline">${rankProgressText(next,r.nextEval)} validées</div>`:`<div class="rank-legend-line">Rang maximal atteint · Légende</div>`}</section>`;
}
function renderRankPanel(){
  const r=getRankState(),next=r.next;
  const notice=state.rankUpNotice?`<section class="card rank-up-banner rank-${r.current.id}"><div><div class="kicker">Promotion</div><h2>Rang ${state.rankUpNotice} débloqué !</h2><p>XP, régularité et missions de progression ont validé ce palier.</p></div><button class="icon-btn" id="dismissRankUp">×</button></section>`:'';
  if(!next)return `${notice}<section class="card rank-card rank-legend"><div class="rank-head"><div class="rank-emblem">★</div><div class="grow"><div class="kicker">Rang maximal</div><div class="rank-name">Légende</div><strong class="rank-subtitle">${r.current.title}</strong><p class="muted">${r.current.description}</p></div><div class="rank-xp"><strong>${r.xp.total.toLocaleString('fr-FR')}</strong><span>XP</span></div></div></section>`;
  return `${notice}<section class="card rank-card rank-${r.current.id}"><div class="rank-head"><div class="rank-emblem">${r.index+1}</div><div class="grow"><div class="kicker">Rang actuel</div><div class="rank-name">${r.current.name}</div><strong class="rank-subtitle">${r.current.title}</strong><p class="muted">Prochain palier : <strong>${next.name} · ${next.title}</strong></p></div><div class="rank-xp"><strong>${r.xp.total.toLocaleString('fr-FR')}</strong><span>XP</span></div></div>
    <div class="rank-block"><div class="rank-progress-label"><span>XP vers ${next.name}</span><strong>${r.xp.total.toLocaleString('fr-FR')} / ${next.xpMin.toLocaleString('fr-FR')}</strong></div><div class="rank-progress"><span style="width:${r.xpProgress*100}%"></span></div></div>
    <div class="rank-next-summary"><span><strong>${r.nextEval.progressCompleted}/${r.nextEval.progressRequired}</strong> ${rankProgressUnit(next)}</span>${next.minSkillCount?`<span><strong>${r.nextEval.skillCompleted}/${next.minSkillCount}</strong> skills min.</span>`:''}<button data-view="skills">Voir tous les rangs →</button></div>
    <div class="xp-breakdown"><span>Entraînement <strong>${r.xp.training}</strong></span><span>Régularité <strong>${r.xp.consistency}</strong></span><span>Skills <strong>${r.xp.skills}</strong></span><span>Tests <strong>${r.xp.tests}</strong></span><span>Récupération <strong>${r.xp.recovery||0}</strong></span></div>
    <p class="muted small">L'XP récompense l'expérience. Bronze → Or utilise des missions ; à partir de Platine, la promotion exige des catégories physiques cohérentes et laisse du choix à l'intérieur de chaque catégorie.</p></section>`;
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
      ${next?`<button class="progress-watch-item rank-${rank.current.id}" data-view="skills"><span class="progress-watch-icon">◆</span><div><strong>${rank.current.name} → ${next.name}</strong><small>${rankProgressText(next,rank.nextEval)} · ${rank.xp.total.toLocaleString('fr-FR')} XP</small></div><b>Rangs →</b></button>`:''}
    </div></section>
    ${renderCycleMini()}
    <section class="card progress-overview-trends"><div class="section-head"><div><div class="kicker">Tendance rapide</div><h2>Dernières performances</h2></div><button class="progress-text-link" data-progress-tab="performance">Analyse complète →</button></div>${exerciseProgressRows()||'<div class="empty">Termine quelques séances pour voir les tendances.</div>'}</section>`;
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
    <section class="card"><div class="section-head"><div><div class="kicker">Journal</div><h2>Historique des séances</h2></div><span class="pill">${h.length}</span></div>${h.length?h.slice(0,40).map(x=>`<button class="history-item history-button" data-history="${x.id}"><div class="history-top"><div><div class="history-title">${x.name}</div><div class="small muted">${formatDate(x.date)} · ${x.durationMinutes} min · effort ${x.rpe||'—'}/10 · +${sessionXP(x)} XP</div></div><span class="pill ${x.jointDiscomfort?'badge-warn':'badge-success'}">${x.score}%</span></div>${summaryLine(x)}</button>`).join(''):'<div class="empty">Ta première séance terminée apparaîtra ici.</div>'}</section>
    ${state.selectedHistoryId?renderHistoryDetail(state.selectedHistoryId):''}`;
}
function renderProgress() {
  const content=state.progressTab==='performance'?renderProgressPerformance():state.progressTab==='volume'?renderProgressVolume():state.progressTab==='history'?renderProgressHistory():renderProgressOverview();
  return shell(`<header class="topbar progress-topbar"><div><div class="brand">Progrès</div><div class="daylabel">Comprendre ce qui avance, puis explorer le détail si nécessaire</div></div></header>
    ${renderProgressTabs()}
    <div class="progress-hub-content">${content}</div>`, "progress");
}

function summaryLine(x){const pull=(x.entries||[]).filter(e=>e.exercise.includes('Tractions')).map(e=>e.value).filter(v=>v!==undefined);const hang=(x.entries||[]).filter(e=>e.exercise==='Dead hang').map(e=>e.value).filter(v=>v!==undefined);const bits=[];if(pull.length)bits.push(`tractions ${pull.join('/')}`);if(hang.length)bits.push(`hang ${hang.join('/')} s`);if(x.note)bits.push(esc(x.note));return bits.length?`<div class="small muted summary">${bits.join(' · ')}</div>`:'';}
function renderHistoryDetail(id){const s=getHistory().find(x=>String(x.id)===String(id));if(!s)return'';return `<section class="card detail-card"><div class="section-head"><div><h2>Détail · ${s.name}</h2><div class="small muted">+${sessionXP(s)} XP gagné${s.cycle?' · cycle S'+s.cycle.week:''}${s.readiness?' · '+readinessPlan(s.readiness).label:''}</div></div><button class="icon-btn" id="closeHistory">×</button></div>${s.prs?.length?`<div class="history-prs">🏆 ${s.prs.map(p=>`${p.exercise} ${recordValueText(p)}`).join(' · ')}</div>`:''}${(s.entries||[]).map(e=>`<div class="detail-row"><span>${e.exercise} · S${e.set}${e.substitutedFrom?' · remplace '+e.substitutedFrom:''}</span><strong>${e.value}${e.type.startsWith('hold')?' s':' reps'}${e.band?' · '+e.band:''}${e.loadKg?' · sac '+e.loadKg+' kg':''}</strong></div>`).join('')}</section>`;}

function testDueSummary(){
  const tests=getTests(); if(!tests.length)return{overdue:true,label:"Premier bilan"};
  const latest=Math.max(...tests.map(t=>new Date(t.date).getTime()));
  const due=latest+42*86400000, days=Math.ceil((due-Date.now())/86400000);
  if(days<=0)return{overdue:true,label:"Bilan à faire"};
  return{overdue:false,label:`dans ${days} j`};
}
function renderTestEditor(){const t=TEST_DEFS.find(x=>x.id===state.testEditor);const latest=latestTestValue(t.id);return `<main class="shell"><section class="card editor-card"><button class="back-btn" id="closeTest">← Retour</button><div class="kicker">Test périodique</div><h1>${t.name}</h1><p class="muted">${t.tip}</p><label class="field-label">Résultat (${t.unit})</label><input class="big-input" id="testValue" type="number" inputmode="decimal" min="0" step="0.1" value="${latest||''}" placeholder="0"><label class="field-label">Note</label><textarea class="textarea" id="testNote" placeholder="Variante, sensations, bande éventuelle…"></textarea><button class="btn btn-primary" id="saveTest">Enregistrer le test</button></section></main>`;}
function saveTest(){const t=TEST_DEFS.find(x=>x.id===state.testEditor),v=Number(document.getElementById('testValue')?.value||0);if(v<=0)return;const beforeRank=getRankState().current.id;const arr=getTests();arr.unshift({id:Date.now(),date:new Date().toISOString(),testId:t.id,value:v,note:document.getElementById('testNote')?.value||''});setTests(arr.slice(0,240));const afterRank=getRankState();if(afterRank.current.id!==beforeRank)state.rankUpNotice=afterRank.current.name;state.testEditor=null;state.view='progress';render();}

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
function renderSkills(){
  const manual=getManualSkills(),rank=getRankState(),allLevels=SKILL_TREES.flatMap(t=>t.levels),doneCount=allLevels.filter(skillDone).length,nextMilestones=nextSkillMilestones(5);
  return shell(`<header class="topbar skills-topbar"><div><div class="brand">Skills & Rangs</div><div class="daylabel">Progression technique · objectifs visibles à tous les niveaux</div></div></header>
    <section class="skills-rank-hero rank-${rank.current.id}"><div class="skills-rank-icon">${rank.index===6?'★':rank.index+1}</div><div class="grow"><div class="kicker">Rang actuel</div><h1>${rank.current.name}</h1><strong>${rank.current.title}</strong><p>${rank.current.description}</p></div><div class="skills-rank-xp"><strong>${rank.xp.total.toLocaleString('fr-FR')}</strong><span>XP</span></div></section>
    <section class="skill-summary-grid"><div class="skill-summary"><span>Jalons validés</span><strong>${doneCount}/${allLevels.length}</strong><small>${Math.round(doneCount/Math.max(1,allLevels.length)*100)} % du Skill Tree</small></div><div class="skill-summary"><span>Branches commencées</span><strong>${SKILL_TREES.filter(t=>t.levels.some(skillDone)).length}/${SKILL_TREES.length}</strong><small>force + skills</small></div><div class="skill-summary"><span>Prochain rang</span><strong>${rank.next?rank.next.name:'Légende'}</strong><small>${rank.next?`${rankProgressText(rank.next,rank.nextEval)}`:'rang maximal'}</small></div></section>
    <section class="skills-section-head"><div><div class="kicker">Rangs</div><h2>Ta progression globale</h2><p>Chaque rang mélange expérience, régularité et capacités physiques. Tous les objectifs restent visibles : touche un rang pour voir ce qu'il demandera.</p></div></section>
    ${renderRankExplorer()}
    ${nextMilestones.length?`<section class="card next-skills-card"><div class="section-head"><div><div class="kicker">Prochains jalons</div><h2>Priorités accessibles</h2></div><span class="pill">${nextMilestones.length}</span></div><div class="next-skill-grid">${nextMilestones.map(x=>`<div class="next-skill-item"><span>${x.tree.icon||'◆'}</span><div><small>${x.tree.name}</small><strong>${x.level.name}</strong><em>${skillAutoLabel(x.level)}</em></div></div>`).join('')}</div></section>`:''}
    <section class="skills-section-head skill-tree-heading"><div><div class="kicker">Skill Tree</div><h2>Branches techniques</h2><p>Les performances mesurables se valident automatiquement avec une séance guidée ou un test. Les validations manuelles servent aux mouvements techniques difficiles à détecter automatiquement.</p></div></section>
    <div class="skill-tree-grid">${SKILL_TREES.map(tree=>{let previous=true;const completed=tree.levels.filter(skillDone).length;return `<section class="card skill-card skill-card-pro"><div class="skill-card-head"><div class="skill-tree-icon">${tree.icon||'◆'}</div><div class="grow"><h2>${tree.name}</h2><p>${tree.description||''}</p></div><span class="skill-tree-count">${completed}/${tree.levels.length}</span></div><div class="skill-tree-progress"><i style="width:${completed/tree.levels.length*100}%"></i></div><div class="skill-path">${tree.levels.map((level,i)=>{const done=skillDone(level),unlocked=previous||done;previous=done;return `<div class="skill-node ${done?'done':unlocked?'available':'locked'}"><div class="skill-dot">${done?'✓':i+1}</div><div class="grow"><strong>${level.name}</strong><small>${skillAutoLabel(level)}</small>${!done&&!unlocked?`<em>Après : ${tree.levels[i-1]?.name||'jalon précédent'}</em>`:''}</div>${level.manual&&unlocked?`<button class="skill-toggle" data-skill="${level.id}">${manual[level.id]?'Retirer':'Valider'}</button>`:''}</div>`}).join('')}</div></section>`}).join('')}</div>
    <section class="card skill-method-note"><strong>Comment les rangs sont pensés</strong><p>Bronze → Or construit les fondations. À partir de Platine, la promotion passe par des catégories : Expérience, Force, Skills, Condition et Récupération. Les catégories empêchent de contourner une qualité entière, mais les objectifs internes laissent une vraie spécialisation.</p></section>`, "skills");
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
  const h=Number(log?.height||getPrefs().heightCm),w=Number(log?.waist),n=Number(log?.neck),hip=Number(log?.hips);if(!(h>0&&w>0&&n>0))return null;const inch=2.54;let result=null;
  if(formula==='female'){if(!(hip>0&&w+hip>n))return null;result=163.205*Math.log10((w+hip-n)/inch)-97.684*Math.log10(h/inch)-78.387;}
  else {if(!(w>n))return null;result=86.010*Math.log10((w-n)/inch)-70.041*Math.log10(h/inch)+36.76;}
  return clamp(result,2,60);
}
function bodyDerived(log){if(!log)return{};const cfg=getBodyConfig(),weight=bodyValue(log,'weight'),waist=bodyValue(log,'waist'),height=Number(log.height||getPrefs().heightCm||0),bf=bodyFatForLog(log,cfg);return {bf,bmi:weight&&height?weight/((height/100)**2):null,whtr:waist&&height?waist/height:null,lean:weight&&bf!=null?weight*(1-bf/100):null};}
function bodyGoalProgress(key,current){const cfg=getBodyConfig(),target=Number(cfg.goals?.[key]);if(!(target>0)||!(current>0))return null;let start=null;if(key==='bodyFat'){for(const l of [...getBodyLogs()].reverse()){const v=bodyFatForLog(l,cfg);if(v!=null){start=v;break;}}}else start=earliestBodyValue(getBodyLogs(),key)?.value;if(!(start>0)||Math.abs(start-target)<.01)return null;const pct=clamp(((start-current)/(start-target))*100,0,100);return {start,target,pct};}
function bodySymmetry(logs,label,leftKey,rightKey){const l=latestBodyValue(logs,leftKey)?.value,r=latestBodyValue(logs,rightKey)?.value;if(!(l>0&&r>0))return null;const diff=Math.abs(l-r),pct=diff/((l+r)/2)*100;return {label,l,r,diff,pct};}
function bodyDataQuality(){const logs=getBodyLogs(),now=Date.now(),within=d=>logs.filter(l=>new Date(l.date).getTime()>=now-d*86400000),m30=within(30);const weights=m30.filter(l=>bodyValue(l,'weight')).length,waists=m30.filter(l=>bodyValue(l,'waist')).length,complete=m30.filter(l=>BODY_FIELDS.filter(f=>!f.quick&&bodyValue(l,f.key)).length>=4).length,photos=m30.filter(l=>bodyPhotoId(l,'front')||bodyPhotoId(l,'side')||bodyPhotoId(l,'back')).length;const score=Math.round(clamp((Math.min(weights,8)/8)*35+(Math.min(waists,4)/4)*30+(Math.min(complete,2)/2)*20+(Math.min(photos,1))*15,0,100));const label=score>=80?'Très bon':score>=55?'Bon':score>=30?'À renforcer':'Insuffisant';return {score,label,weights,waists,complete,photos};}
function bodyTrackingSchedule(){const logs=getBodyLogs(),cfg=getBodyConfig(),daysSince=log=>log?Math.floor((Date.now()-new Date(log.date).getTime())/86400000):9999,lastFor=pred=>logs.find(pred),items=[['Poids',cfg.frequencies.weightDays,lastFor(l=>bodyValue(l,'weight'))],['Tour de taille',cfg.frequencies.waistDays,lastFor(l=>bodyValue(l,'waist'))],['Bilan complet',cfg.frequencies.completeDays,lastFor(l=>l.measurementMode==='full'||BODY_FIELDS.filter(f=>!f.quick&&bodyValue(l,f.key)).length>=4)],['Photos',cfg.frequencies.photoDays,lastFor(l=>bodyPhotoId(l,'front')||bodyPhotoId(l,'side')||bodyPhotoId(l,'back'))]];return items.map(([label,every,last])=>{const age=daysSince(last),remaining=Math.max(0,Number(every||1)-age);return {label,every,age,due:!last||age>=every,text:!last?'À commencer':age>=every?'À faire':remaining===1?'demain':`dans ${remaining} j`};});}
function bodyPhotoId(log,pos='front'){return log?.photoIds?.[pos]||(pos==='front'?log?.photoId:null)||null;}
function bodyPhotoLogs(pos='front'){return getBodyLogs().filter(l=>bodyPhotoId(l,pos));}
function bodyTrainingContext(){const {start,end}=bodyPeriodBounds(),sessions=getHistory().filter(h=>{const d=new Date(h.date);return (!start||d>=start)&&d<=end;}),quick=getQuickLogs().filter(q=>{const d=new Date(q.date);return (!start||d>=start)&&d<=end;});let reps=0;sessions.forEach(h=>(h.entries||[]).forEach(e=>{if(String(e.type||'').startsWith('reps'))reps+=Number(e.value||0)*(e.type==='reps_side'?2:1);}));quick.forEach(q=>{if(String(q.type||'').startsWith('reps'))reps+=Number(q.value||0)*(q.type==='reps_side'?2:1);});return {sessions:sessions.length,reps,minutes:sessions.reduce((a,h)=>a+Number(h.durationMinutes||0),0)};}
function bodyCycleSummary(logs){const counts={};for(const l of logs){const n=l.trainingCycleName||l.cycleName||trainingCycleForDate(l.date)?.name||'Cycle de base';counts[n]=(counts[n]||0)+1;}return Object.entries(counts).sort((a,b)=>b[1]-a[1]);}
function renderBodyGoalCard(key,label,current,unit){const g=bodyGoalProgress(key,current);if(!g)return'';return `<article class="body-goal"><div><strong>${label}</strong><small>${Number(current).toFixed(1).replace('.0','')} ${unit} → cible ${g.target} ${unit}</small></div><b>${Math.round(g.pct)}%</b><div class="body-goal-bar"><span style="width:${g.pct}%"></span></div></article>`;}
function renderBodyFieldValue(logs,key){const d=bodyFieldDef(key),x=latestBodyValue(logs,key);if(!d||!x)return'';return `<div class="body-current-row"><span>${d.label}</span><strong>${x.value.toFixed(d.step<1?1:0).replace('.0','')} ${d.unit}</strong></div>`;}


function renderMeasurements(){
  const all=getBodyLogs(),logs=bodyLogsInPeriod(),cfg=getBodyConfig(),latest=all[0],latestDerived=bodyDerived(latest),quality=bodyDataQuality(),context=bodyTrainingContext(),cycles=bodyCycleSummary(logs),schedule=bodyTrackingSchedule();
  const latestW=latestBodyValue(all,'weight')?.value,latestWaist=latestBodyValue(all,'waist')?.value,avg7=bodyAverageDays('weight',7),wDelta=bodyPeriodDelta(logs,'weight'),waistDelta=bodyPeriodDelta(logs,'waist');
  const periodButtons=[['7d','7 j'],['30d','30 j'],['90d','90 j'],['180d','6 mois'],['365d','1 an'],['all','Tout'],['custom','Dates']];
  const sym=BODY_SYMMETRY.map(x=>bodySymmetry(all,...x)).filter(Boolean),allPhotoLogs=all.filter(l=>bodyPhotoId(l,'front')||bodyPhotoId(l,'side')||bodyPhotoId(l,'back')),photoLogs=bodyPhotoLogs(state.bodyPhotoComparePosition),aId=state.bodyPhotoCompareA||String(photoLogs[0]?.id||''),bId=state.bodyPhotoCompareB||String(photoLogs[photoLogs.length-1]?.id||'');
  const aLog=photoLogs.find(l=>String(l.id)===String(aId)),bLog=photoLogs.find(l=>String(l.id)===String(bId));
  const goalCards=[renderBodyGoalCard('weight','Poids',latestW,'kg'),renderBodyGoalCard('waist','Tour de taille',latestWaist,'cm'),renderBodyGoalCard('bodyFat','Masse grasse',latestDerived.bf,'%'),renderBodyGoalCard('chest','Poitrine',latestBodyValue(all,'chest')?.value,'cm')].filter(Boolean).join('');
  const tracked=BODY_FIELDS.filter(f=>cfg.tracked?.[f.key]!==false&&latestBodyValue(all,f.key));
  return shell(`<header class="topbar"><div><div class="brand">Mesures</div><div class="daylabel">Suivi physique · ${all.length} relevé${all.length>1?'s':''}</div></div><button class="btn btn-primary compact" id="addBody">＋ Mesurer</button></header>
    <section class="card measurement-hero-v94"><div><div class="kicker">Vue d'ensemble</div><h1>${latest?formatDate(latest.date):'Commence ton suivi'}</h1><p class="muted">Tendances, mensurations, objectifs et progression visuelle dans un seul endroit.</p></div>${latest?`<div class="measurement-hero-value"><strong>${latestW?latestW.toFixed(1).replace('.0','')+' kg':'—'}</strong><span>${avg7?`moyenne 7 j · ${avg7.toFixed(1)} kg`:'moyenne 7 j en attente'}</span><em>${getActiveTrainingCycle().name}</em></div>`:''}</section>
    <section class="body-schedule-strip">${schedule.map(x=>`<div class="body-schedule-item ${x.due?'due':''}"><span>${x.label}</span><strong>${x.text}</strong></div>`).join('')}</section>
    <section class="card body-period-card"><div class="section-head"><div><div class="kicker">Période analysée</div><h2>Comparer les tendances</h2></div></div><div class="body-period-tabs">${periodButtons.map(([id,label])=>`<button class="body-period ${state.bodyPeriod===id?'active':''}" data-body-period="${id}">${label}</button>`).join('')}</div>${state.bodyPeriod==='custom'?`<div class="rep-custom-range"><label><span>Du</span><input id="bodyPeriodFrom" type="date" value="${esc(state.bodyPeriodFrom)}"></label><label><span>Au</span><input id="bodyPeriodTo" type="date" value="${esc(state.bodyPeriodTo)}"></label></div>`:''}</section>
    ${all.length?`<section class="measurement-kpis measurement-kpis-v94">
      <article class="card measurement-kpi"><span>Poids</span><strong>${latestW?latestW.toFixed(1)+' kg':'—'}</strong><small>${bodyTrendText(wDelta,'kg',true)}</small></article>
      <article class="card measurement-kpi"><span>Tour de taille</span><strong>${latestWaist?latestWaist.toFixed(1)+' cm':'—'}</strong><small>${bodyTrendText(waistDelta,'cm',true)}</small></article>
      <article class="card measurement-kpi"><span>Masse grasse</span><strong>${latestDerived.bf!=null?latestDerived.bf.toFixed(1)+' %':'—'}</strong><small>${cfg.bodyFatSource==='scale'?'Balance':cfg.bodyFatSource==='auto'&&bodyValue(latest,'scaleBodyFat')?'Balance · auto':'Estimation anthropométrique'}</small></article>
      <article class="card measurement-kpi"><span>Masse maigre estimée</span><strong>${latestDerived.lean!=null?latestDerived.lean.toFixed(1)+' kg':'—'}</strong><small>${latestDerived.bmi!=null?`IMC ${latestDerived.bmi.toFixed(1)} · `:''}${latestDerived.whtr!=null?`ratio taille/taille ${latestDerived.whtr.toFixed(2)}`:''}</small></article>
    </section>
    <section class="card body-insight-card"><div class="section-head"><div><div class="kicker">Lecture de la période</div><h2>Corps + entraînement</h2></div><span class="pill">${logs.length} mesure${logs.length>1?'s':''}</span></div><div class="body-insight-grid"><div><span>Poids</span><strong>${bodyTrendText(wDelta,'kg',true)}</strong></div><div><span>Taille</span><strong>${bodyTrendText(waistDelta,'cm',true)}</strong></div><div><span>Entraînement</span><strong>${context.sessions} séances · ${context.minutes} min</strong></div><div><span>Volume</span><strong>${context.reps.toLocaleString('fr-FR')} reps</strong></div></div>${cycles.length?`<p class="muted small">Cycles sur la période : ${cycles.map(([n,c])=>`${esc(n)} (${c})`).join(' · ')}</p>`:''}</section>
    ${goalCards?`<section class="card"><div class="section-head"><div><div class="kicker">Objectifs</div><h2>Vers tes cibles</h2></div><button class="btn btn-outline compact" id="openBodySettings">Paramétrer</button></div><div class="body-goals">${goalCards}</div></section>`:''}
    <section class="card measurement-charts"><div class="section-head"><div><div class="kicker">Tendances</div><h2>Évolution</h2></div><span class="pill">${state.bodyPeriod==='all'?'historique':state.bodyPeriod}</span></div>${renderBodyChart(logs,'weight','kg')}${renderBodyChart(logs,'waist','cm')}${renderBodyChart(logs,'chest','cm')}</section>
    <section class="card body-current"><div class="section-head"><div><div class="kicker">Corps</div><h2>Dernières mensurations</h2></div><button class="btn btn-outline compact" id="addBodyFull">Bilan complet</button></div><div class="body-current-grid">${tracked.map(f=>renderBodyFieldValue(all,f.key)).join('')}${cfg.customFields.filter(f=>latestBodyValue(all,f.key)).map(f=>renderBodyFieldValue(all,f.key)).join('')}</div>${sym.length?`<div class="divider"></div><div class="kicker">Symétrie gauche / droite</div><div class="body-sym-grid">${sym.map(x=>`<div class="body-sym ${x.pct<=3?'good':x.pct<=6?'warn':'high'}"><strong>${x.label}</strong><span>G ${x.l.toFixed(1)} · D ${x.r.toFixed(1)} cm</span><b>${x.pct.toFixed(1)} % d'écart</b></div>`).join('')}</div>`:''}</section>
    ${allPhotoLogs.length?`<section class="card body-photo-system"><div class="section-head"><div><div class="kicker">Progression visuelle</div><h2>Comparer deux dates</h2></div><span class="pill">Photos locales</span></div><div class="body-photo-tabs">${[['front','Face'],['side','Profil'],['back','Dos']].map(([id,l])=>`<button class="body-photo-tab ${state.bodyPhotoComparePosition===id?'active':''}" data-photo-position="${id}">${l}</button>`).join('')}</div>${photoLogs.length?`<div class="body-photo-selects"><select id="bodyPhotoA">${photoLogs.map(l=>`<option value="${l.id}" ${String(l.id)===String(aId)?'selected':''}>${formatDate(l.date)}</option>`).join('')}</select><span>↔</span><select id="bodyPhotoB">${photoLogs.map(l=>`<option value="${l.id}" ${String(l.id)===String(bId)?'selected':''}>${formatDate(l.date)}</option>`).join('')}</select></div><div class="body-photo-compare"><figure>${aLog?`<img data-body-photo-id="${bodyPhotoId(aLog,state.bodyPhotoComparePosition)||''}" alt="Photo A">`:''}<figcaption>${aLog?formatDate(aLog.date):'—'}</figcaption></figure><figure>${bLog?`<img data-body-photo-id="${bodyPhotoId(bLog,state.bodyPhotoComparePosition)||''}" alt="Photo B">`:''}<figcaption>${bLog?formatDate(bLog.date):'—'}</figcaption></figure></div>`:`<div class="body-photo-empty muted">Aucune photo ${state.bodyPhotoComparePosition==='front'?'de face':state.bodyPhotoComparePosition==='side'?'de profil':'de dos'} pour le moment.</div>`}<p class="muted small">Les photos restent stockées dans IndexedDB sur cet appareil et sont incluses dans l'export de sauvegarde.</p></section>`:''}
    <section class="card body-quality"><div class="section-head"><div><div class="kicker">Qualité des données</div><h2>${quality.label}</h2></div><strong>${quality.score}%</strong></div><div class="body-quality-bar"><span style="width:${quality.score}%"></span></div><div class="body-quality-grid"><span>${quality.weights} pesées / 30 j</span><span>${quality.waists} tailles / 30 j</span><span>${quality.complete} bilans complets</span><span>${quality.photos} série photo</span></div><p class="muted small">Plus les mesures sont régulières et réalisées dans des conditions similaires, plus les tendances sont utiles.</p></section>
    <section class="card measurement-history"><div class="section-head"><div><div class="kicker">Historique</div><h2>Mes relevés</h2></div><span class="pill">${all.length}</span></div><div class="body-history">${all.slice(0,30).map((l,i)=>{const d=bodyDerived(l),count=BODY_FIELDS.filter(f=>bodyValue(l,f.key)).length+(Object.keys(l.custom||{}).length);return `<div class="measurement-history-row"><div><strong>${formatDate(l.date)}</strong><small>${esc(l.trainingCycleName||l.cycleName||'')} ${l.note?'· '+esc(l.note):''}</small></div><span>${bodyValue(l,'weight')?bodyValue(l,'weight')+' kg':''}${bodyValue(l,'waist')?' · '+bodyValue(l,'waist')+' cm':''}${d.bf!=null?' · '+d.bf.toFixed(1)+' %':''} · ${count} champ${count>1?'s':''}</span><button class="body-delete" data-delete-body="${l.id}" aria-label="Supprimer">×</button></div>`}).join('')}</div></section>
    <details class="card parameter-details body-settings" id="bodySettings"><summary><div><div class="kicker">Paramétrique</div><strong>Cibles & configuration</strong><small>Formule, fréquence, champs et objectifs</small></div><span>⌄</span></summary><div class="parameter-body">${renderBodySettings()}</div></details>`:
    `<section class="card measurement-empty"><div class="measurement-empty-icon">◉</div><h2>Commence ton suivi</h2><p class="muted">Une mesure rapide prend quelques secondes. Un bilan complet ajoute les mensurations et les photos.</p><div class="measurement-empty-actions"><button class="btn btn-primary" id="addBodyEmpty">Mesure rapide</button><button class="btn btn-secondary" id="addBodyFullEmpty">Bilan complet</button></div></section>`}
  `,'more');
}
function renderBodySettings(){const cfg=getBodyConfig();const goalDefs=[['weight','Poids','kg'],['waist','Tour de taille','cm'],['bodyFat','Masse grasse','%'],['chest','Poitrine','cm'],['armLeft','Bras G','cm'],['armRight','Bras D','cm'],['thighLeft','Cuisse G','cm'],['thighRight','Cuisse D','cm']];return `<div class="body-setting-section"><h3>Calcul de composition corporelle</h3><div class="parameter-grid"><label><span>Formule anthropométrique</span><select id="bodyFatFormula"><option value="male" ${cfg.bodyFatFormula==='male'?'selected':''}>US Navy · homme</option><option value="female" ${cfg.bodyFatFormula==='female'?'selected':''}>US Navy · femme</option><option value="off" ${cfg.bodyFatFormula==='off'?'selected':''}>Désactivée</option></select></label><label><span>Source masse grasse</span><select id="bodyFatSource"><option value="auto" ${cfg.bodyFatSource==='auto'?'selected':''}>Auto · balance puis estimation</option><option value="estimate" ${cfg.bodyFatSource==='estimate'?'selected':''}>Estimation uniquement</option><option value="scale" ${cfg.bodyFatSource==='scale'?'selected':''}>Balance uniquement</option></select></label></div><p class="muted small">L'estimation anthropométrique est indicative. Pour la formule femme, hanches + taille + cou sont nécessaires.</p></div><div class="divider"></div><div class="body-setting-section"><h3>Fréquences recommandées</h3><div class="parameter-grid threshold-grid"><label><span>Poids · tous les</span><input class="mini-input body-freq" data-freq="weightDays" type="number" min="1" value="${cfg.frequencies.weightDays}"></label><label><span>Taille · tous les</span><input class="mini-input body-freq" data-freq="waistDays" type="number" min="1" value="${cfg.frequencies.waistDays}"></label><label><span>Bilan complet · tous les</span><input class="mini-input body-freq" data-freq="completeDays" type="number" min="1" value="${cfg.frequencies.completeDays}"></label><label><span>Photos · tous les</span><input class="mini-input body-freq" data-freq="photoDays" type="number" min="1" value="${cfg.frequencies.photoDays}"></label></div><small class="muted">Valeurs en jours. Elles servent de repères, pas d'obligation.</small></div><div class="divider"></div><div class="body-setting-section"><h3>Objectifs</h3><div class="target-editor-list">${goalDefs.map(([k,l,u])=>`<div class="target-editor-row"><strong>${l}</strong><label><span>Cible ${u}</span><input class="mini-input body-goal-input" data-body-goal="${k}" type="number" min="0" step="0.1" value="${cfg.goals[k]??''}" placeholder="—"></label></div>`).join('')}</div></div><div class="divider"></div><div class="body-setting-section"><div class="section-head"><div><h3>Champs suivis</h3><small class="muted">Masque ce que tu n'utilises pas.</small></div><button class="btn btn-outline compact" id="addCustomBodyField">＋ Champ perso</button></div><div class="body-track-grid">${BODY_FIELDS.map(f=>`<label class="body-track"><input class="body-track-input" data-body-track="${f.key}" type="checkbox" ${cfg.tracked[f.key]!==false?'checked':''}><span>${f.label}</span></label>`).join('')}${cfg.customFields.map(f=>`<div class="body-track custom"><label><input class="body-track-custom" data-custom-track="${f.key}" type="checkbox" ${f.visible!==false?'checked':''}><span>${esc(f.label)} (${esc(f.unit||'')})</span></label><button class="body-remove-custom" data-remove-custom="${f.key}">×</button></div>`).join('')}</div></div><div class="parameter-actions"><button class="btn btn-primary" id="saveBodyConfig">Enregistrer</button><button class="btn btn-outline" id="resetBodyConfig">Valeurs par défaut</button></div>`;}

function renderProfile(){const p=getPrefs();return shell(`<header class="topbar"><div><div class="brand">Profil</div><div class="daylabel">Réglages, sauvegarde & préférences</div></div></header>
  <section class="card"><h2>Coach adaptatif</h2><div class="switchline"><div><strong>Progression intelligente</strong><div class="small muted">Ajuste légèrement les objectifs selon tes dernières séances, ton effort et les gênes articulaires.</div></div><input id="smartPref" type="checkbox" ${p.smartProgression!==false?'checked':''}></div></section>
  <section class="card"><h2>Alertes & écran</h2><div class="switchline"><div><strong>Son du timer</strong><div class="small muted">Triple bip à la fin d'un chrono</div></div><input id="soundPref" type="checkbox" ${p.sound?'checked':''}></div><div class="switchline"><div><strong>Garder l'écran actif</strong><div class="small muted">Recommandé sur iPhone : empêche la mise en veille pendant un chrono</div></div><input id="keepAwakePref" type="checkbox" ${p.keepAwake!==false?'checked':''}></div><div class="switchline"><div><strong>Vibration</strong><div class="small muted">Utilisée uniquement si le navigateur la prend en charge</div></div><input id="vibrationPref" type="checkbox" ${p.vibration?'checked':''}></div><p class="install-note">Si tu verrouilles volontairement l’iPhone, iOS peut suspendre une PWA. Pour une alarme garantie sur écran verrouillé, il faudra ajouter des notifications push côté serveur.</p></section>
  <section class="card"><div class="section-head"><div><h2>Tutoriels exercices</h2><p class="muted small">Remplace progressivement les recherches par les vidéos que tu as validées.</p></div><span class="pill">${tutorialStats().exact}/${tutorialStats().total}</span></div><button class="btn btn-secondary" id="manageTutorials">Gérer les tutoriels</button></section>
  <section class="card"><h2>Installer l'application</h2><p class="install-note">Android/Chrome : bouton ci-dessous si disponible. iPhone/Safari : Partager → Ajouter à l'écran d'accueil.</p><button class="btn btn-primary" id="installApp" ${state.deferredInstall?'':'disabled'}>${state.deferredInstall?'Installer':'Installation via le navigateur'}</button></section>
  <section class="card"><div class="kicker">Matériel maison</div><h2>Power Tower + barres parallèles + poignées + bandes + tapis</h2><div class="equipment-chips">${HOME_EQUIPMENT.map(x=>`<span>${x}</span>`).join('')}</div><p class="muted small">Les barres parallèles et poignées de pompes sont intégrées aux recommandations. Pour le moment, les séances utilisent les bandes à la place du sac à dos pour ajouter de la résistance.</p></section>
  <section class="card"><div class="section-head"><div><div class="kicker">Training Engine</div><h2>Programme & bibliothèque</h2></div><span class="pill">V10.1</span></div><button class="btn btn-secondary" id="openExerciseLibrary">Ouvrir la bibliothèque d’exercices</button><div class="divider"></div><strong>Variantes actives</strong>${Object.entries(getExerciseChoices()).length?`<div class="choice-list">${Object.entries(getExerciseChoices()).map(([base,chosen])=>`<div class="choice-row"><span>${base} → <strong>${chosen}</strong></span><button class="btn btn-outline compact reset-choice" data-base="${encodeURIComponent(base)}">Réinitialiser</button></div>`).join('')}</div>`:'<p class="muted small">Aucune progression d’exercice adoptée pour le moment.</p>'}<div class="divider"></div><div class="section-head"><div><strong>Progression du cycle actif</strong><div class="small muted">${progressionModeLabel(getCycleState().plan)} · Semaine ${getCycleState().week}/${getCycleState().weekCount} · ${getCycleState().name}</div></div><div class="profile-progression-actions"><button class="btn btn-secondary compact edit-cycle-progression" data-cycle-id="${getActiveTrainingCycleId()}">Configurer</button><button class="btn btn-outline compact" id="resetCycle">Nouveau bloc</button></div></div></section>
  <section class="card data-card"><div class="section-head"><div><div class="kicker">Sauvegarde</div><h2>Données</h2></div><span class="pill">JSON</span></div><p class="muted small">Avant de changer de téléphone, de navigateur ou de passer sur une nouvelle adresse Vercel, exporte une sauvegarde. Elle contient séances, Quick Logs, progression, réglages et photos.</p><div class="data-actions"><button class="btn btn-primary" id="exportData">Exporter mes données</button><button class="btn btn-secondary" id="importData">Importer une sauvegarde</button><input id="importDataFile" type="file" accept="application/json,.json" hidden></div><p class="install-note">Le fichier reste sur ton appareil : rien n’est envoyé vers un serveur.</p><div class="divider"></div><button class="btn btn-danger" id="clearAllData">Effacer toutes les données</button></section>`,'profile');}


function renderBodyChart(logs,key,unit){const def=bodyFieldDef(key),pts=(logs||[]).filter(x=>bodyValue(x,key)!=null).slice(0,30).reverse();if(pts.length<2)return'';const vals=pts.map(x=>bodyValue(x,key)),min=Math.min(...vals),max=Math.max(...vals),range=Math.max(.5,max-min);const coords=vals.map((v,i)=>{const x=(i/(vals.length-1))*100,y=88-((v-min)/range)*70;return `${x},${y}`}).join(' ');return `<div class="mini-chart"><div class="chart-head"><strong>${def?.label||key}</strong><span>${vals[0].toFixed(1).replace('.0','')} → ${vals[vals.length-1].toFixed(1).replace('.0','')} ${unit}</span></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Évolution ${esc(def?.label||key)}"><polyline points="${coords}" fill="none" vector-effect="non-scaling-stroke"/></svg></div>`;}
function renderBodyEditor(){const p=getPrefs(),cfg=getBodyConfig(),mode=state.bodyEditorMode||'quick',groups=['Essentiels','Haut du corps','Bas du corps','Optionnel'];const fields=BODY_FIELDS.filter(f=>cfg.tracked[f.key]!==false&&(mode==='full'||f.quick));const custom=mode==='full'?cfg.customFields.filter(f=>f.visible!==false):[];return `<main class="shell"><section class="card editor-card body-editor-v94"><button class="back-btn" id="closeBody">← Mesures</button><div class="kicker">${mode==='full'?'Bilan complet':'Mesure rapide'}</div><h1>${mode==='full'?'Mensurations & photos':'Les essentiels'}</h1><div class="body-editor-mode"><button class="body-mode ${mode==='quick'?'active':''}" data-body-mode="quick">Rapide</button><button class="body-mode ${mode==='full'?'active':''}" data-body-mode="full">Complet</button></div>${groups.map(g=>{const list=fields.filter(f=>f.group===g);if(!list.length)return'';return `<div class="body-editor-group"><h3>${g}</h3><div class="field-grid">${list.map(f=>`<div><label class="field-label">${f.label} (${f.unit})</label><input class="big-input body-value-input" data-body-key="${f.key}" type="number" step="${f.step}" inputmode="decimal" placeholder="—"></div>`).join('')}</div></div>`;}).join('')}${custom.length?`<div class="body-editor-group"><h3>Champs personnalisés</h3><div class="field-grid">${custom.map(f=>`<div><label class="field-label">${esc(f.label)} (${esc(f.unit||'')})</label><input class="big-input body-value-input" data-body-key="${f.key}" data-custom="1" type="number" step="0.1" inputmode="decimal" placeholder="—"></div>`).join('')}</div></div>`:''}<div class="body-editor-group"><h3>Contexte</h3><div class="field-grid"><div><label class="field-label">Taille corporelle (cm)</label><input class="big-input" id="bodyHeight" type="number" step="0.1" inputmode="decimal" value="${p.heightCm||''}" placeholder="ex. 175"></div><div><label class="field-label">Date</label><input class="big-input" id="bodyDate" type="date" value="${localDateKey()}"></div></div></div>${mode==='full'?`<div class="body-editor-group"><h3>Photos de progression</h3><p class="muted small">Même distance, même lumière et posture détendue si possible.</p><div class="body-photo-inputs"><label><span>Face</span><input class="file-input" id="bodyPhotoFront" type="file" accept="image/*" capture="environment"></label><label><span>Profil</span><input class="file-input" id="bodyPhotoSide" type="file" accept="image/*" capture="environment"></label><label><span>Dos</span><input class="file-input" id="bodyPhotoBack" type="file" accept="image/*" capture="environment"></label></div></div>`:''}<label class="field-label">Note facultative</label><textarea class="textarea" id="bodyNote" placeholder="Sommeil, hydratation, contexte, sensations…"></textarea><div class="body-save-note">Cycle actif : <strong>${esc(getActiveTrainingCycle().name)}</strong></div><button class="btn btn-primary" id="saveBody">Enregistrer ${mode==='full'?'le bilan':'la mesure'}</button></section></main>`;}
async function saveBody(){const values={},custom={};document.querySelectorAll('.body-value-input').forEach(el=>{const v=Number(el.value||0);if(v>0){if(el.dataset.custom)custom[el.dataset.bodyKey]=v;else values[el.dataset.bodyKey]=v;}});const height=Number(document.getElementById('bodyHeight')?.value||0),dateVal=document.getElementById('bodyDate')?.value||localDateKey();if(!Object.keys(values).length&&!Object.keys(custom).length)return;const photoIds={};for(const [pos,id] of [['front','bodyPhotoFront'],['side','bodyPhotoSide'],['back','bodyPhotoBack']]){const file=document.getElementById(id)?.files?.[0];if(file){try{const pid=`body-${pos}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,blob=await compressPhoto(file);if(blob){await putPhoto(pid,blob);photoIds[pos]=pid;}}catch(e){console.warn('Photo non enregistrée',pos,e);}}}const cycle=getActiveTrainingCycle(),arr=getBodyLogs(),date=new Date(`${dateVal}T12:00:00`);arr.unshift({id:Date.now(),date:date.toISOString(),...values,height:height||null,custom,photoIds:Object.keys(photoIds).length?photoIds:null,photoId:photoIds.front||null,note:document.getElementById('bodyNote')?.value||'',measurementMode:state.bodyEditorMode||'quick',trainingCycleId:String(cycle.id),trainingCycleName:cycle.name});arr.sort((a,b)=>new Date(b.date)-new Date(a.date));setBodyLogs(arr.slice(0,1500));if(height>0){const p=getPrefs();p.heightCm=height;setPrefs(p);}state.bodyEditor=false;state.view='measurements';render();}
function saveBodyConfigFromDom(){const cfg=getBodyConfig();cfg.bodyFatFormula=document.getElementById('bodyFatFormula')?.value||cfg.bodyFatFormula;cfg.bodyFatSource=document.getElementById('bodyFatSource')?.value||cfg.bodyFatSource;document.querySelectorAll('.body-freq').forEach(el=>cfg.frequencies[el.dataset.freq]=Math.max(1,Number(el.value||1)));document.querySelectorAll('.body-goal-input').forEach(el=>{const v=Number(el.value||0);cfg.goals[el.dataset.bodyGoal]=v>0?v:null;});document.querySelectorAll('.body-track-input').forEach(el=>cfg.tracked[el.dataset.bodyTrack]=el.checked);document.querySelectorAll('.body-track-custom').forEach(el=>{const f=cfg.customFields.find(x=>x.key===el.dataset.customTrack);if(f)f.visible=el.checked;});setBodyConfig(cfg);render();}
function addCustomBodyField(){const label=prompt('Nom du champ personnalisé (ex. Ventre bas)');if(!label?.trim())return;const unit=prompt('Unité (ex. cm, kg, %)','cm')||'';const cfg=getBodyConfig(),key=`custom_${Date.now()}`;cfg.customFields.push({key,label:label.trim(),unit:unit.trim(),visible:true});setBodyConfig(cfg);render();}
function removeCustomBodyField(key){const cfg=getBodyConfig();cfg.customFields=cfg.customFields.filter(f=>f.key!==key);setBodyConfig(cfg);render();}
async function hydrateBodyPhotos(){const imgs=[...document.querySelectorAll('[data-body-photo-id]')];for(const img of imgs){const id=img.dataset.bodyPhotoId;if(!id)continue;try{const blob=await getPhoto(id);if(blob){const url=URL.createObjectURL(blob);img.onload=()=>URL.revokeObjectURL(url);img.src=url;}}catch(e){console.warn('Photo indisponible',e);}}}

function bindEvents(){
  document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{state.view=b.dataset.view;state.selectedHistoryId=null;render();});
  document.querySelectorAll('[data-progress-tab]').forEach(b=>b.onclick=()=>{state.progressTab=b.dataset.progressTab;state.selectedHistoryId=null;render();});
  document.querySelectorAll('[data-today-progress]').forEach(b=>b.onclick=()=>{state.view='progress';state.progressTab=b.dataset.todayProgress||'performance';state.selectedHistoryId=null;render();});
  const openQuick=document.getElementById('openQuickLog');if(openQuick)openQuick.onclick=()=>{state.quickEditor=true;state.quickToast=null;render();};
  document.querySelectorAll('[data-open-quick-log]').forEach(b=>b.onclick=()=>{state.quickEditor=true;state.quickToast=null;render();});
  const closeQuick=document.getElementById('closeQuickLog');if(closeQuick)closeQuick.onclick=()=>{state.quickEditor=false;state.quickToast=null;render();};
  document.querySelectorAll('#syncStrava').forEach(b=>b.onclick=syncStravaActivities);
  const disconnectS=document.getElementById('disconnectStrava');if(disconnectS)disconnectS.onclick=()=>{if(confirm('Déconnecter Strava de Calisthénie Coach ?'))disconnectStrava();};
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
  const undoQuick=document.getElementById('undoQuickLog');if(undoQuick)undoQuick.onclick=undoLastQuickLog;
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
      aiStep=Math.max(1,Math.min(5,n));
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
      box.innerHTML=`<div class="ai-detected-head"><div><strong>${title}</strong><small>${s.found}/${s.total} indicateurs utiles trouvés · ${s.sessions} séance${s.sessions!==1?'s':''} · ${s.quick} série${s.quick!==1?'s':''} libre${s.quick!==1?'s':''}</small></div><span class="ai-data-status ${s.status}">${s.status==='complete'?'OK':s.status==='partial'?'PARTIEL':'À COMPLÉTER'}</span></div><div class="ai-metric-list">${s.metrics.map(m=>`<div><span>${m.label}</span><strong>${Number(m.value||0)>0?`${m.value} ${m.unit}`:'—'}</strong></div>`).join('')}</div>`;
    };
    const refreshAiReview=()=>{
      const box=document.getElementById('cycleAiReview');if(!box)return;
      const source=document.querySelector('input[name=cycleAiSource]:checked')?.value||'app',snap=cycleAiDataSnapshot(aiObjective(),aiTarget());
      box.innerHTML=`<div><span>Objectif</span><strong>${esc(aiObjective())} · ${esc(aiTarget()||'à préciser')}</strong></div><div><span>Échéance</span><strong>${esc(document.getElementById('cycleAiHorizon')?.value||'Sans date')}</strong></div><div><span>Rythme</span><strong>${esc(document.getElementById('cycleAiTrainingDays')?.value||'6')} séances · repos ${esc(aiDesiredRestDays().join(', ')||'—')}</strong></div><div><span>Niveau</span><strong>${source==='app'?`${snap.found}/${snap.total} indicateurs depuis l’app`:'Saisie manuelle'}</strong></div><div><span>Contexte</span><strong>${esc(document.getElementById('cycleAiContext')?.value||'Aucun')}</strong></div>`;
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
    const genAi=document.getElementById('generateCycleAiPrompt');if(genAi)genAi.onclick=()=>{
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
  
  const analyzeAiImport=document.getElementById('analyzeCycleAiImport');if(analyzeAiImport)analyzeAiImport.onclick=()=>{const raw=document.getElementById('cycleAiImportText')?.value||'',result=document.getElementById('cycleAiImportResult'),data=extractCycleAiJson(raw),source=trainingCycleById(state.cycleProgressionEditor);result.hidden=false;if(!data){result.innerHTML='<div class="ai-import-error"><strong>Configuration JSON introuvable</strong><p>Vérifie que ChatGPT a terminé son analyse et fourni le bloc JSON demandé par Calisthenie Coach.</p></div>';return;}const validation=validateCycleAiImport(data,source);if(!validation.ok){result.innerHTML=`<div class="ai-import-error"><strong>Import impossible</strong>${validation.errors.map(x=>`<p>• ${esc(x)}</p>`).join('')}</div>`;return;}state.cycleAiImport={data,sourceId:String(source.id)};result.innerHTML=`${previewCycleAiImport(data,validation)}<div class="ai-import-actions"><button class="btn btn-secondary" id="cancelCycleAiImport">Annuler</button><button class="btn btn-primary" id="createCycleAiImport">Créer ce cycle</button></div>`;document.getElementById('cancelCycleAiImport').onclick=()=>{state.cycleAiImport=null;result.hidden=true;result.innerHTML='';};document.getElementById('createCycleAiImport').onclick=()=>{const x=state.cycleAiImport;if(!x)return;const created=createCycleFromAiImport(x.data,trainingCycleById(x.sourceId));state.cycleAiImport=null;state.cycleProgressionEditor=created.id;state.cycleProgressionDraft=progressionPlanForCycle(created);render();};};
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
  document.querySelectorAll('.edit-test').forEach(b=>b.onclick=()=>{state.testEditor=b.dataset.test;render();});
  const closeTest=document.getElementById('closeTest');if(closeTest)closeTest.onclick=()=>{state.testEditor=null;render();};
  const saveT=document.getElementById('saveTest');if(saveT)saveT.onclick=saveTest;
  document.querySelectorAll('.history-button').forEach(b=>b.onclick=()=>{state.selectedHistoryId=b.dataset.history;render();});
  const closeH=document.getElementById('closeHistory');if(closeH)closeH.onclick=()=>{state.selectedHistoryId=null;render();};
  const dismissRank=document.getElementById('dismissRankUp');if(dismissRank)dismissRank.onclick=()=>{state.rankUpNotice=null;render();};
  document.querySelectorAll('[data-rank-select]').forEach(b=>b.onclick=()=>{state.selectedRankId=b.dataset.rankSelect;render();});
  document.querySelectorAll('.skill-toggle').forEach(b=>b.onclick=()=>{const beforeRank=getRankState().current.id;const m=getManualSkills();m[b.dataset.skill]=!m[b.dataset.skill];setManualSkills(m);const afterRank=getRankState();if(afterRank.current.id!==beforeRank)state.rankUpNotice=afterRank.current.name;render();});
  const openBody=(mode='quick')=>{state.bodyEditorMode=mode;state.bodyEditor=true;render();};
  const addBody=document.getElementById('addBody');if(addBody)addBody.onclick=()=>openBody('quick');
  const addBodyEmpty=document.getElementById('addBodyEmpty');if(addBodyEmpty)addBodyEmpty.onclick=()=>openBody('quick');
  const addBodyFull=document.getElementById('addBodyFull');if(addBodyFull)addBodyFull.onclick=()=>openBody('full');
  const addBodyFullEmpty=document.getElementById('addBodyFullEmpty');if(addBodyFullEmpty)addBodyFullEmpty.onclick=()=>openBody('full');
  document.querySelectorAll('[data-body-mode]').forEach(b=>b.onclick=()=>{state.bodyEditorMode=b.dataset.bodyMode;render();});
  document.querySelectorAll('[data-body-period]').forEach(b=>b.onclick=()=>{state.bodyPeriod=b.dataset.bodyPeriod;render();});
  const bodyFrom=document.getElementById('bodyPeriodFrom');if(bodyFrom)bodyFrom.onchange=()=>{state.bodyPeriodFrom=bodyFrom.value;render();};
  const bodyTo=document.getElementById('bodyPeriodTo');if(bodyTo)bodyTo.onchange=()=>{state.bodyPeriodTo=bodyTo.value;render();};
  document.querySelectorAll('[data-photo-position]').forEach(b=>b.onclick=()=>{state.bodyPhotoComparePosition=b.dataset.photoPosition;state.bodyPhotoCompareA='';state.bodyPhotoCompareB='';render();});
  const photoA=document.getElementById('bodyPhotoA');if(photoA)photoA.onchange=()=>{state.bodyPhotoCompareA=photoA.value;render();};
  const photoB=document.getElementById('bodyPhotoB');if(photoB)photoB.onchange=()=>{state.bodyPhotoCompareB=photoB.value;render();};
  const closeBody=document.getElementById('closeBody');if(closeBody)closeBody.onclick=()=>{state.bodyEditor=false;render();};
  const saveB=document.getElementById('saveBody');if(saveB)saveB.onclick=saveBody;
  const saveBodyCfg=document.getElementById('saveBodyConfig');if(saveBodyCfg)saveBodyCfg.onclick=saveBodyConfigFromDom;
  const resetBodyCfg=document.getElementById('resetBodyConfig');if(resetBodyCfg)resetBodyCfg.onclick=()=>{if(confirm('Réinitialiser les paramètres Mesures ?')){localStorage.removeItem(STORAGE.bodyConfig);render();}};
  const addCustomField=document.getElementById('addCustomBodyField');if(addCustomField)addCustomField.onclick=addCustomBodyField;
  document.querySelectorAll('[data-remove-custom]').forEach(b=>b.onclick=()=>{if(confirm('Retirer ce champ personnalisé ? Les anciennes valeurs restent dans l’historique.'))removeCustomBodyField(b.dataset.removeCustom);});
  document.querySelectorAll('[data-delete-body]').forEach(b=>b.onclick=()=>{if(!confirm('Supprimer ce relevé ?'))return;setBodyLogs(getBodyLogs().filter(l=>String(l.id)!==String(b.dataset.deleteBody)));render();});
  const openBodySettings=document.getElementById('openBodySettings');if(openBodySettings)openBodySettings.onclick=()=>{document.getElementById('bodySettings')?.setAttribute('open','');document.getElementById('bodySettings')?.scrollIntoView({behavior:'smooth',block:'start'});};
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

function getSkillPriorities(){const raw=parse(STORAGE.skillPriorities,{});return Object.fromEntries(SKILL_TREES.map(t=>[t.id,['high','medium','off'].includes(raw[t.id])?raw[t.id]:'off']));}
function setSkillPriorities(v){save(STORAGE.skillPriorities,v);}
function nextSkillLevelForTree(treeId){const t=SKILL_TREES.find(x=>x.id===treeId);return t?.levels.find(x=>!skillDone(x))||t?.levels[t.levels.length-1]||null;}
function skillFocusExercise(treeId){
  const t=SKILL_TREES.find(x=>x.id===treeId),level=nextSkillLevelForTree(treeId);if(!t||!level)return null;
  if(level.auto?.exercise)return level.auto.exercise;
  if(level.auto?.test){const names=TEST_GUIDED_EXERCISES[level.auto.test]||[];if(names.length)return names[0];}
  return null;
}
function applySkillPrioritiesToBase(base){
  const w=clone(base);if(!/Skills/i.test(w.name||''))return w;
  const priorities=getSkillPriorities(),chosen=SKILL_TREES.map(t=>({tree:t,priority:priorities[t.id],name:skillFocusExercise(t.id)})).filter(x=>x.priority!=='off'&&x.name).sort((a,b)=>(b.priority==='high')-(a.priority==='high')).slice(0,w.sessionLength==='short'?1:2);
  if(!chosen.length)return w;
  for(const item of chosen){
    const existing=(w.exercises||[]).find(e=>e.name===item.name&&e.phase==='main');
    if(existing){existing.sets=Math.min(5,Number(existing.sets||1)+(item.priority==='high'?1:0));existing.skillPriority=item.tree.name;continue;}
    const availability=equipmentAvailability(item.name),restriction=exerciseRestrictionStatus(item.name);if(!availability.available||restriction.restricted)continue;
    const fresh=exerciseTemplateByName(item.name);fresh.phase='main';fresh.express=item.priority==='high';fresh.sets=item.priority==='high'?2:1;fresh.shortSets=1;fresh.skillPriority=item.tree.name;
    const wi=(w.exercises||[]).findIndex(e=>e.phase!=='warmup');w.exercises.splice(Math.max(0,wi),0,fresh);
  }
  return w;
}
const _prepareWorkoutObjectV97=prepareWorkoutObject;
prepareWorkoutObject=function(base,readiness=null){
  const prioritized=applySkillPrioritiesToBase(base),w=_prepareWorkoutObjectV97(prioritized,readiness);
  w.exercises=(w.exercises||[]).map(e=>{const a=exerciseAdaptation(e.name,readiness);return {...e,equipmentMissing:a.equipment.missing,restrictionZones:a.restriction.zones,adaptationSuggestion:a.suggestion};});
  return w;
};

function renderSkillPriorityPanel(){const p=getSkillPriorities();return `<section class="card skill-priority-card"><div class="section-head"><div><div class="kicker">Objectifs personnels</div><h2>Priorités de skills</h2></div><span class="pill">adaptatif</span></div><p class="muted small">Une priorité haute ajoute un petit bloc technique à la séance Skills quand le matériel et les restrictions le permettent. Le volume reste volontairement limité.</p><div class="skill-priority-list">${SKILL_TREES.map(t=>`<div class="skill-priority-row"><div><strong>${t.icon} ${esc(t.name)}</strong><small>Prochain : ${esc(nextSkillLevelForTree(t.id)?.name||'branche terminée')}</small></div><div class="priority-choice">${[['off','—'],['medium','Moy.'],['high','Haute']].map(([id,l])=>`<button class="skill-priority-btn ${p[t.id]===id?'active':''}" data-skill-priority="${t.id}" data-priority-value="${id}">${l}</button>`).join('')}</div></div>`).join('')}</div></section>`;}
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

function getReminderPrefs(){const raw=parse(STORAGE.reminders,{});return {enabled:raw.enabled!==false,workout:raw.workout!==false,measurements:raw.measurements!==false,tests:raw.tests!==false};}
function setReminderPrefs(v){save(STORAGE.reminders,v);}
function smartReminderItems(){
  const p=getReminderPrefs();if(!p.enabled)return [];
  const out=[],day=todayDay(),todayW=workoutTemplateForDay(day),done=getHistory().some(s=>localDateKey(s.date)===localDateKey()&&String(s.trainingCycleId||getActiveTrainingCycleId())===String(getActiveTrainingCycleId()));
  if(p.workout&&(todayW.exercises||[]).length&&!done)out.push({type:'workout',label:`Séance ${todayW.name} à faire`,detail:`Complète ${todayW.duration} min · Express ${todayW.shortDuration||'—'} min`});
  if(p.measurements){const due=bodyTrackingSchedule().filter(x=>x.due);if(due.length)out.push({type:'measure',label:`${due.length} suivi${due.length>1?'s':''} mesure à jour`,detail:due.map(x=>x.label).join(' · ')});}
  if(p.tests){const d=testDueSummary();if(d.overdue)out.push({type:'tests',label:'Tests périodiques disponibles',detail:d.label});}
  return out;
}
function renderReminderSettings(){const p=getReminderPrefs();return `<section class="card reminder-settings"><div class="section-head"><div><div class="kicker">Rappels locaux</div><h2>À faire dans l’app</h2></div><span class="pill">sans cloud</span></div><p class="muted small">Ces rappels apparaissent quand tu ouvres l’app. Une notification garantie quand l’iPhone est verrouillé nécessiterait un service push côté serveur.</p><div class="switchline"><div><strong>Rappels intelligents</strong></div><input id="remindersEnabled" type="checkbox" ${p.enabled?'checked':''}></div><div class="switchline"><div><strong>Séance du jour</strong></div><input class="reminder-toggle" data-reminder="workout" type="checkbox" ${p.workout?'checked':''}></div><div class="switchline"><div><strong>Mesures à faire</strong></div><input class="reminder-toggle" data-reminder="measurements" type="checkbox" ${p.measurements?'checked':''}></div><div class="switchline"><div><strong>Tests périodiques</strong></div><input class="reminder-toggle" data-reminder="tests" type="checkbox" ${p.tests?'checked':''}></div></section>`;}
function renderAppearanceSettings(){const p=getPrefs(),theme=p.appTheme||'system';return `<section class="card"><div class="kicker">Interface</div><h2>Apparence & accessibilité</h2><label class="field-label">Thème</label><select class="select" id="appTheme"><option value="system" ${theme==='system'?'selected':''}>Système</option><option value="light" ${theme==='light'?'selected':''}>Clair</option><option value="dark" ${theme==='dark'?'selected':''}>Sombre</option></select><p class="muted small">Les animations respectent automatiquement “Réduire les animations” du système et les éléments interactifs gardent une zone tactile adaptée au mobile.</p></section>`;}
function applyAppTheme(){const p=getPrefs(),wanted=p.appTheme||'system',dark=wanted==='dark'||(wanted==='system'&&window.matchMedia?.('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=dark?'dark':'light';const meta=document.querySelector('meta[name=\"theme-color\"]');if(meta)meta.setAttribute('content',dark?'#090d14':'#f7f8fa');}

const _renderProfileV97=renderProfile;
renderProfile=function(){
  let html=_renderProfileV97();
  const oldSetup=/<section class="card"><div class="kicker">Matériel maison<\/div><h2>Power Tower \+ barres parallèles \+ poignées \+ bandes \+ tapis<\/h2>[\s\S]*?<\/section>/;
  html=html.replace(oldSetup,'');
  const alertMarker='<section class="card"><h2>Alertes & écran</h2>';
  if(html.includes(alertMarker))html=html.replace(alertMarker,renderEquipmentSetupCard(false)+renderRestrictionSettings()+renderReminderSettings()+renderAppearanceSettings()+alertMarker);
  return html;
};
renderMore=function(){
  const logs=getBodyLogs(),latest=logs[0],setup=getEquipmentSetup(),available=EQUIPMENT_CATALOG.filter(x=>setup[x.id]).length;
  return shell(`<header class="topbar"><div><div class="brand">Plus</div><div class="daylabel">Outils & réglages · V10.4</div></div></header>
    <section class="more-grid more-grid-six">
      <button class="card more-tile" data-view="flexibility"><span class="more-icon">${uiIcon('flex')}</span><div><strong>Flexibilité</strong><small>Routines guidées & mobilité</small></div></button>
      <button class="card more-tile" data-view="skills"><span class="more-icon">${uiIcon('skills')}</span><div><strong>Skills</strong><small>Rangs, priorités & Skill Tree</small></div></button>
      <button class="card more-tile" id="openExerciseLibrary"><span class="more-icon">${uiIcon('exercises')}</span><div><strong>Exercices</strong><small>${visibleExerciseLibrary().length} mouvements & variantes</small></div></button>
      <button class="card more-tile" data-view="custom"><span class="more-icon">＋</span><div><strong>Mes séances</strong><small>Cycles & entraînements personnalisés</small></div></button>
      <button class="card more-tile" data-view="measurements"><span class="more-icon">${uiIcon('measurements')}</span><div><strong>Mesures</strong><small>${latest?(latest.weight?latest.weight+' kg · ':'')+(latest.waist?latest.waist+' cm taille':'Dernier relevé enregistré'):'Corps, photos & tendances'}</small></div></button>
      <button class="card more-tile" data-view="profile"><span class="more-icon">${uiIcon('profile')}</span><div><strong>Profil</strong><small>${available}/${EQUIPMENT_CATALOG.length} équipements · adaptations & réglages</small></div></button>
    </section>
    <details class="today-details"><summary><div><div class="kicker">Détails</div><strong>Progression, rang & coach adaptatif</strong></div><span>⌄</span></summary><div class="details-stack">${renderCycleMini()}${renderRankMini()}${renderProgressionRecommendations()}</div></details>
    ${state.stravaMessage?`<div class="quick-toast">${esc(state.stravaMessage)}</div>`:''}${renderStravaProfile()}`, 'more');
};

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
function renderAdaptiveReport(){const days=state.reportPeriod==='90d'?90:30,r=reportSummary(days);return `<section class="card adaptive-report ${r.tone}"><div class="section-head"><div><div class="kicker">Bilan automatique</div><h2>${days} derniers jours</h2></div><div class="report-tabs"><button data-report-period="30d" class="${days===30?'active':''}">30 j</button><button data-report-period="90d" class="${days===90?'active':''}">90 j</button></div></div><div class="report-kpis"><div><span>Régularité</span><strong>${r.adherence}%</strong><small>${r.cur.length} séances</small></div><div><span>Volume</span><strong>${r.reps.reps.toLocaleString('fr-FR')}</strong><small>reps · ${r.reps.sets} séries</small></div><div><span>Tractions</span><strong>${r.pull||'—'}</strong><small>${r.prevPull?`avant ${r.prevPull}`:'meilleure série'}</small></div><div><span>Dips</span><strong>${r.dips||'—'}</strong><small>${r.prevDips?`avant ${r.prevDips}`:'meilleure série'}</small></div><div><span>Poids</span><strong>${deltaText(r.weight,'kg')}</strong><small>variation période</small></div><div><span>Taille</span><strong>${deltaText(r.waist,'cm')}</strong><small>variation période</small></div></div><div class="report-decision"><span>Décision coach</span><strong>${r.decision}</strong></div><p class="muted small">Bilan descriptif basé sur tes données enregistrées. Il ne remplace pas une évaluation médicale ou un suivi clinique.</p></section>`;}
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
      <div class="progress-command-copy"><div class="kicker">Ton niveau maintenant</div><h1>${rank.current.name}</h1><p>${rank.current.title} · ${rank.xp.total.toLocaleString('fr-FR')} XP</p></div>
      <div class="progress-command-rank"><span>${next?`Vers ${next.name}`:'Rang maximal'}</span><strong>${next?Math.round(rank.xpProgress*100):100}%</strong><div class="progress-command-track"><i style="width:${next?rank.xpProgress*100:100}%"></i></div><small>${next?rankProgressText(next,rank.nextEval)+' validées':'Légende atteinte'}</small></div>
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
  <section class="card progress-watch-card"><div class="section-head"><div><div class="kicker">À surveiller</div><h2>Prochaines actions utiles</h2></div><span class="pill">${x.recs.length+(x.due.overdue?1:0)}</span></div><div class="progress-watch-list">${x.recs.length?`<button class="progress-watch-item" data-progress-tab="performance"><span class="progress-watch-icon">↗</span><div><strong>${x.recs.length} progression${x.recs.length>1?'s':''} disponible${x.recs.length>1?'s':''}</strong><small>${x.recs.slice(0,2).map(r=>`${r.current.name} → ${r.next.name}`).join(' · ')}</small></div><b>Voir →</b></button>`:''}<button class="progress-watch-item" data-progress-tab="performance"><span class="progress-watch-icon">◷</span><div><strong>Tests périodiques</strong><small>${x.due.label}</small></div><b>Voir →</b></button>${next?`<button class="progress-watch-item rank-${rank.current.id}" data-view="skills"><span class="progress-watch-icon">◆</span><div><strong>${rank.current.name} → ${next.name}</strong><small>${rankProgressText(next,rank.nextEval)} · ${rank.xp.total.toLocaleString('fr-FR')} XP</small></div><b>Rangs →</b></button>`:''}</div></section>
  ${renderCycleMini()}`;
};
renderProgressPerformance=function(){const tests=getTests(),due=testDueSummary();return `${renderProgressionRecommendations()}${renderRecordsPanel()}${renderExerciseTracker()}<section class="card"><div class="section-head"><div><div class="kicker">Progression intelligente</div><h2>Tendances par exercice</h2></div><span class="pill">5 dernières</span></div>${exerciseProgressRows()||'<div class="empty">Termine quelques séances pour voir les tendances.</div>'}</section><section class="card standardized-tests"><div class="section-head"><div><div class="kicker">Batterie standardisée · fin de bloc</div><h2>Tests périodiques</h2></div><span class="pill ${due.overdue?'badge-warn':'badge-success'}">${due.label}</span></div><p class="muted small">Refais les mêmes tests dans des conditions comparables, idéalement pendant la semaine Deload + tests. La qualité prime sur l’échec absolu.</p><div class="test-grid">${TEST_DEFS.map(t=>{const best=bestTestValue(t.id),last=tests.filter(x=>x.testId===t.id).sort((a,b)=>new Date(b.date)-new Date(a.date))[0];return `<button class="test-tile edit-test" data-test="${t.id}"><span>${t.name}</span><strong>${best?best+' '+t.unit:'—'}</strong><small>${last?'Dernier '+formatShortDate(last.date):'À mesurer'}</small></button>`}).join('')}</div></section><section class="card progress-rank-link rank-${getRankState().current.id}"><div><div class="kicker">Gamification</div><h2>${getRankState().current.name} · ${getRankState().current.title}</h2><p>Rangs et Skill Tree restent regroupés dans Skills.</p></div><button class="btn btn-secondary compact" data-view="skills">Voir Skills & Rangs</button></section>${state.exerciseDetailName?renderExerciseProgressDetail(state.exerciseDetailName):''}`;};

function renderProgramAudit(){
  const a=programAudit(),cardioOK=a.cardioMinutes>=a.cfg.cardioMin&&a.cardioMinutes<=a.cfg.cardioMax,missing=[];for(const day of a.days){const w=preparedWorkout(day,null,'full');for(const e of w.exercises){const ad=exerciseAdaptation(e.name);if(!ad.equipment.available&&exerciseInfo(e.name))missing.push({day,name:e.name,suggestion:ad.suggestion});}}
  return `<section class="card program-audit"><div class="section-head"><div><div class="kicker">Audit automatique · ${esc(getActiveTrainingCycle().name)}</div><h2>Couverture hebdomadaire</h2></div><span class="pill ${a.covered===VOLUME_GROUPS.length&&!missing.length?'badge-success':'badge-warn'}">${a.covered}/${VOLUME_GROUPS.length} zones · ${missing.length} adaptations</span></div><div class="audit-hero"><div><strong>${a.days.length}/7</strong><span>jours actifs</span></div><div><strong>${a.cardioMinutes}</strong><span>min cardio · cible ${a.cfg.cardioMin}–${a.cfg.cardioMax}</span></div><div><strong>${a.warmups}/${a.days.length}</strong><span>échauffements</span></div><div><strong>${a.cooldowns}/${a.days.length}</strong><span>retours au calme</span></div></div>${missing.length?`<div class="audit-equipment-warnings"><strong>Setup à adapter</strong>${missing.slice(0,8).map(x=>`<span>${DAY_NAMES[x.day]} · ${x.name}${x.suggestion?' → '+x.suggestion:''}</span>`).join('')}</div>`:''}<div class="audit-section"><strong>Muscles / fonctions · programme complet</strong><div class="audit-chip-grid">${VOLUME_GROUPS.map(g=>{const n=a.muscles[g]||0,t=a.cfg.volumeTargets[g],ok=n>=t.min&&n<=t.max;return `<span class="audit-chip ${ok?'ok':'warn'}">${g} <b>${n.toFixed(1)}</b> <small>${t.min}–${t.max}</small></span>`}).join('')}</div></div><div class="audit-note ${cardioOK?'audit-ok':''}"><strong>Mode Express</strong><span>${a.expressCardioMinutes} min de cardio si toutes les séances actives étaient faites en Express.</span></div></section>`;
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
  const remEnabled=document.getElementById('remindersEnabled');if(remEnabled)remEnabled.onchange=()=>{const p=getReminderPrefs();p.enabled=remEnabled.checked;setReminderPrefs(p);render();};
  document.querySelectorAll('.reminder-toggle').forEach(el=>el.onchange=()=>{const p=getReminderPrefs();p[el.dataset.reminder]=el.checked;setReminderPrefs(p);render();});
  const theme=document.getElementById('appTheme');if(theme)theme.onchange=()=>{const p=getPrefs();p.appTheme=theme.value;setPrefs(p);applyAppTheme();render();};
};

applyAppTheme();

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();state.deferredInstall=e;if(state.view==='profile'&&!state.active)render();});
window.addEventListener('appinstalled',()=>{state.deferredInstall=null;});
// Prime Web Audio from a genuine user gesture. This matters on iOS.
document.addEventListener('pointerdown',()=>unlockTimerAudio(),{passive:true});
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible'&&state.active?.timerRunning){
    const end=Number(state.active.timerEndAt||0);
    if(end&&Date.now()>=end)finishRunningTimer();
    else requestTimerWakeLock();
  }
});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
const _stravaQs=new URLSearchParams(location.search),stravaParam=_stravaQs.get('strava'),stravaReason=_stravaQs.get('reason');if(stravaParam){const reasonLabel=({missing_config:'configuration Vercel incomplète',token_exchange:'échange du code refusé par Strava',missing_scope:'permission activité non accordée',session_error:'session sécurisée impossible',callback_domain:'domaine de callback invalide',access_denied:'autorisation refusée'})[stravaReason]||stravaReason;state.stravaMessage=stravaParam==='connected'?'Strava connecté ✓':stravaParam==='error'?`Erreur de connexion Strava${reasonLabel?' · '+reasonLabel:''}`:'Connexion Strava non terminée';sessionStorage.setItem('cc_strava_return',stravaParam);history.replaceState({},'',location.pathname);}
render();
setTimeout(async()=>{await loadStravaStatus();const returned=sessionStorage.getItem('cc_strava_return');if(returned==='connected'&&state.stravaStatus.connected){sessionStorage.removeItem('cc_strava_return');if(!getStravaMeta().lastSync)syncStravaActivities();}},80);
