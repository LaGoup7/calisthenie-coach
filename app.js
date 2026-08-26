const DAY_NAMES = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const STORAGE = {
  history: "cc_history",
  prefs: "cc_prefs",
  tests: "cc_tests",
  skills: "cc_skills",
  body: "cc_body",
  flexibility: "cc_flexibility",
  mobilityTests: "cc_mobility_tests",
  tutorials: "cc_tutorials",
  exerciseChoices: "cc_exercise_choices",
  quickLogs: "cc_quick_logs",
};

function ex(name, type, sets, target, rest, tip) {
  return { name, type, sets, target, rest, tip, baseTarget: target };
}

const workouts = {
  1: { name: "Repos", subtitle: "Récupération complète", duration: 0, intensity: "Repos", exercises: [] },
  2: {
    name: "Push + Handstand", subtitle: "Reprise intermédiaire · poussée, épaules, contrôle", duration: 65, intensity: "Intermédiaire · modérée",
    exercises: [
      ex("Échauffement épaules & poignets", "timer", 1, 480, 0, "Rotations, band pull-aparts, scapular push-ups et quelques pompes faciles."),
      ex("Handstand au mur", "hold", 3, 25, 60, "Reste propre et loin de l’échec. Stoppe si les poignets fatiguent trop."),
      ex("Dips", "reps", 3, 6, 120, "Garde 2 à 3 répétitions en réserve."),
      ex("Pompes", "reps", 3, 10, 90, "Corps gainé, amplitude confortable."),
      ex("Pike push-ups", "reps", 2, 7, 90, "Mouvement lent et contrôlé."),
      ex("Hollow hold", "hold", 2, 20, 60, "Bas du dos collé au tapis."),
      ex("Cardio Zone 2", "timer", 1, 900, 0, "15 min très faciles : marche rapide ou footing doux. Garde une respiration confortable."),
      ex("Mobilité épaules / pectoraux / poignets", "timer", 1, 600, 0, "Étirements doux, sans chercher la douleur.")
    ]
  },
  3: {
    name: "Pull + Grip", subtitle: "Reprise intermédiaire · force + volume de tirage", duration: 65, intensity: "Intermédiaire · modérée",
    exercises: [
      ex("Échauffement tirage", "timer", 1, 420, 0, "Dead hang léger, scapular pull-ups et face pulls."),
      ex("Tractions strictes", "reps", 3, 4, 120, "Top sets propres : vise environ 2 répétitions en réserve. Si la forme baisse, utilise une bande."),
      ex("Tractions assistées", "reps_band", 2, 6, 105, "Back-off technique : assistance suffisante pour garder 2 à 3 répétitions en réserve."),
      ex("Row avec bande", "reps_band", 3, 12, 75, "Pince les omoplates en fin de mouvement."),
      ex("Face pulls", "reps_band", 2, 15, 60, "Coudes hauts, mouvement contrôlé."),
      ex("Curl biceps avec bande", "reps_band", 2, 12, 60, "Pas d’élan."),
      ex("Dead hang", "hold", 2, 30, 90, "Le grip est déjà très sollicité par les tractions : reste loin de l’échec."),
      ex("Hanging knee raises", "reps", 2, 8, 75, "Pas de balancement."),
      ex("Mobilité dos / avant-bras / épaules", "timer", 1, 600, 0, "Récupération active et douce.")
    ]
  },
  4: {
    name: "Jambes + Cardio", subtitle: "Reprise intermédiaire · jambes complètes et endurance", duration: 70, intensity: "Intermédiaire · modérée",
    exercises: [
      ex("Échauffement jambes", "timer", 1, 420, 0, "Squats faciles, chevilles, hanches et fentes dynamiques."),
      ex("Squat tempo", "reps", 3, 10, 90, "3 secondes de descente, contrôle en bas, remontée dynamique. Garde 2 à 3 reps en réserve."),
      ex("Fentes arrière", "reps_side", 3, 8, 75, "8 répétitions par jambe."),
      ex("Romanian deadlift avec bande", "reps_band", 3, 12, 75, "Hanches vers l’arrière, dos neutre."),
      ex("Hamstring curl avec bande", "reps_band", 2, 12, 60, "Complète le hip hinge par une flexion de genou : contrôle surtout le retour."),
      ex("Mollets", "reps", 3, 18, 60, "Pause en haut et descente contrôlée."),
      ex("Cardio Zone 2", "timer", 1, 1800, 0, "Marche rapide ou footing très léger. Tu dois pouvoir parler."),
      ex("Mobilité jambes", "timer", 1, 720, 0, "Chevilles, ischios, quadriceps et hanches.")
    ]
  },
  5: {
    name: "Skills + Mobilité", subtitle: "Technique, core latéral, mobilité et cardio facile", duration: 65, intensity: "Légère",
    exercises: [
      ex("Échauffement général", "timer", 1, 360, 0, "Bouge tranquillement toutes les articulations."),
      ex("Handstand au mur", "hold", 3, 25, 60, "Privilégie la ligne et le contrôle. Cette séance reste technique, jamais maximale."),
      ex("Tuck L-sit", "hold", 3, 10, 60, "Pousse fort sur les bras et monte les genoux."),
      ex("Scapular pull-ups", "reps", 2, 8, 60, "Petit mouvement, bras tendus."),
      ex("Scapular push-ups", "reps", 2, 10, 60, "Garde les coudes verrouillés."),
      ex("Pallof press avec bande", "reps_side", 2, 10, 45, "Résiste à la rotation : bassin et cage thoracique restent face devant."),
      ex("Rotation externe avec bande", "reps_band", 2, 15, 45, "Bande légère."),
      ex("Side plank", "hold_side", 2, 30, 45, "Travail latéral du tronc utile pour la stabilité générale et les futures progressions human flag."),
      ex("Cardio Zone 2", "timer", 1, 1200, 0, "20 min faciles. Tu dois pouvoir parler en phrases complètes."),
      ex("Mobilité complète", "timer", 1, 900, 0, "15 min : épaules, thorax, hanches et chevilles.")
    ]
  },
  6: {
    name: "Full Body", subtitle: "Reprise intermédiaire · rappel de force générale", duration: 65, intensity: "Intermédiaire · modérée",
    exercises: [
      ex("Échauffement général", "timer", 1, 420, 0, "Mobilité, mouvements faciles et montée progressive en température."),
      ex("Tractions assistées", "reps_band", 3, 6, 120, "Choisis une assistance adaptée. Laisse 2 répétitions en réserve."),
      ex("Dips", "reps", 3, 6, 120, "Amplitude propre, épaules stables."),
      ex("Pompes", "reps", 2, 10, 90, "Ne cherche pas le maximum."),
      ex("Bulgarian split squat", "reps_side", 3, 8, 90, "8 par jambe."),
      ex("Romanian deadlift avec bande", "reps_band", 3, 12, 75, "Contrôle les ischios."),
      ex("Hanging knee raises", "reps", 2, 8, 75, "Reste gainé."),
      ex("Dead hang", "hold", 2, 30, 90, "Prise ferme, épaules confortables. Ne cherche pas le record après les tractions."),
      ex("Mollets", "reps", 2, 15, 60, "Deuxième rappel léger de la semaine, amplitude complète."),
      ex("Retour au calme", "timer", 1, 480, 0, "Respiration et mobilité légère.")
    ]
  },
  0: {
    name: "Cardio + Mobilité", subtitle: "Endurance fondamentale et souplesse", duration: 85, intensity: "Légère",
    exercises: [
      ex("Cardio Zone 2", "timer", 1, 3600, 0, "60 min faciles. Marche rapide, randonnée tranquille ou footing très confortable."),
      ex("Deep squat hold", "hold", 2, 45, 30, "Respire et garde les talons au sol si possible."),
      ex("90/90 hanches", "hold_side", 2, 45, 30, "45 secondes de chaque côté."),
      ex("Frog stretch", "hold", 2, 45, 30, "Progressif, aucune douleur vive."),
      ex("Étirement ischios", "hold_side", 2, 45, 30, "Respiration lente."),
      ex("Fléchisseurs de hanche", "hold_side", 2, 45, 30, "Bassin légèrement rétroversé."),
      ex("Étirement mollets", "hold_side", 2, 45, 30, "Garde le talon au sol."),
      ex("Rotation thoracique", "reps_side", 2, 8, 30, "Amplitude confortable."),
      ex("Épaules / grand dorsal / pectoraux", "timer", 1, 480, 0, "Finis tranquillement.")
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

const HOME_EQUIPMENT = ["Power Tower", "Bandes", "Tapis", "Sac à dos"];
function usesBackpack(name){
  const info=exerciseInfo(name);
  return /sac à dos|sac a dos/i.test(name)||/sac à dos|sac a dos/i.test(info?.equipment||'');
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
  // Ajoute ici les vidéos validées que tu veux livrer par défaut à tous les appareils.
  // Exemple : "Dips": { videoUrl:"https://www.youtube.com/watch?v=...", imageUrl:"" }
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
  const query=TUTORIAL_QUERIES[name]||exerciseInfo(name)?.query||`${name} exercice tutoriel`;
  const fallback=`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  const ytId=youtubeVideoId(videoUrl);
  return {
    url: videoUrl || explicitImage || fallback,
    videoUrl,
    imageUrl: explicitImage || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : ""),
    exact: Boolean(videoUrl || explicitImage),
    mediaType: videoUrl ? "video" : (explicitImage ? "image" : "search"),
    label: videoUrl ? "Voir la vidéo" : (explicitImage ? "Voir l'image" : "Trouver une vidéo")
  };
}
function tutorialLink(name, compact=false) {
  const t=tutorialFor(name);
  if(compact) return `<a class="tutorial-link tutorial-link-compact ${t.exact?'exact':''}" href="${esc(t.url)}" target="_blank" rel="noopener noreferrer" aria-label="Tutoriel vidéo pour ${esc(name)}"><span aria-hidden="true">▶</span>${t.label}</a>`;
  return `<a class="tutorial-link tutorial-link-full ${t.exact?'exact':''}" href="${esc(t.url)}" target="_blank" rel="noopener noreferrer" aria-label="Tutoriel vidéo pour ${esc(name)}">
    ${t.imageUrl?`<img class="tutorial-thumb" src="${esc(t.imageUrl)}" alt="" loading="lazy">`:''}
    <span class="tutorial-copy"><strong><span aria-hidden="true">▶</span> ${t.label}</strong><small>${t.mediaType==='video'?'Vidéo sélectionnée pour cet exercice':t.mediaType==='image'?'Image de référence sélectionnée':'Recherche de secours · tu peux choisir une vidéo précise dans Profil'}</small></span>
  </a>`;
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
      ex("Mollets","hold_side",1,45,0,"Talons lourds au sol, genou aligné.")
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
    id:"full-25", name:"Full Body souplesse", subtitle:"Routine complète pour construire de l'amplitude durable", duration:25, intensity:"Modérée", focus:"Tout le corps",
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
  lib("Pompes","Push","Débutant","Sol",["Pectoraux","Triceps","Épaules"],{regression:"Pompes inclinées",progression:"Pompes pieds surélevés",substitutes:["Band chest press","Pompes serrées"],prescription:{type:"reps",target:10,rest:90},advanceAt:15,volume:{Pectoraux:1,Triceps:.6,Épaules:.35},query:"push up perfect form tutorial"}),
  lib("Pompes pieds surélevés","Push","Intermédiaire","Support",["Pectoraux","Épaules","Triceps"],{regression:"Pompes",progression:"Pompes archer",substitutes:["Pseudo-planche push-ups"],prescription:{type:"reps",target:6,rest:90},advanceAt:12,volume:{Pectoraux:1,Épaules:.55,Triceps:.5},query:"decline push up proper form tutorial"}),
  lib("Pompes archer","Push","Intermédiaire","Sol",["Pectoraux","Triceps","Core"],{regression:"Pompes pieds surélevés",progression:"Pseudo-planche push-ups",substitutes:["Pompes"],prescription:{type:"reps_side",target:5,rest:105},advanceAt:8,volume:{Pectoraux:1,Triceps:.55,Core:.25},query:"archer push up tutorial calisthenics"}),
  lib("Pompes serrées","Push","Débutant","Sol",["Triceps","Pectoraux"],{regression:"Pompes inclinées",progression:"Dips assistés",substitutes:["Extension triceps avec bande"],prescription:{type:"reps",target:8,rest:75},advanceAt:15,volume:{Triceps:1,Pectoraux:.55},query:"diamond close grip push up proper form"}),
  lib("Pseudo-planche push-ups","Push","Avancé","Sol",["Épaules","Pectoraux","Triceps","Core"],{regression:"Pompes pieds surélevés",progression:"Planche lean",substitutes:["Pike push-ups"],prescription:{type:"reps",target:5,rest:120},advanceAt:10,volume:{Épaules:1,Pectoraux:.7,Triceps:.45,Core:.3},query:"pseudo planche push up tutorial"}),
  lib("Band chest press","Push","Débutant","Bande",["Pectoraux","Triceps"],{progression:"Pompes",substitutes:["Pompes inclinées"],prescription:{type:"reps_band",target:12,rest:60},advanceAt:18,volume:{Pectoraux:1,Triceps:.45},query:"resistance band chest press tutorial"}),
  lib("Dips assistés","Push","Débutant","Barres + bande",["Pectoraux","Triceps","Épaules"],{progression:"Dips",substitutes:["Pompes serrées"],prescription:{type:"reps_band",target:6,rest:120},advanceAt:10,volume:{Pectoraux:.8,Triceps:1,Épaules:.45},query:"band assisted dips proper form"}),
  lib("Dips","Push","Intermédiaire","Barres parallèles",["Pectoraux","Triceps","Épaules"],{regression:"Dips assistés",progression:"Dips tempo",substitutes:["Pompes serrées","Band chest press"],prescription:{type:"reps",target:6,rest:120},advanceAt:10,volume:{Pectoraux:.8,Triceps:1,Épaules:.45},query:"parallel bar dips proper form tutorial"}),
  lib("Dips tempo","Push","Intermédiaire","Barres parallèles",["Pectoraux","Triceps","Épaules"],{regression:"Dips",progression:"Dips lestés",substitutes:["Dips"],prescription:{type:"reps",target:5,rest:135},advanceAt:8,volume:{Pectoraux:.8,Triceps:1,Épaules:.45},query:"slow tempo dips tutorial"}),
  lib("Dips lestés","Push","Avancé","Barres + charge",["Pectoraux","Triceps","Épaules"],{regression:"Dips tempo",substitutes:["Dips"],prescription:{type:"reps",target:5,rest:150},advanceAt:8,volume:{Pectoraux:.85,Triceps:1,Épaules:.45},query:"weighted dips proper form tutorial"}),
  lib("Pike push-ups","Push","Débutant","Sol",["Épaules","Triceps"],{progression:"Pike push-ups pieds surélevés",substitutes:["Pompes"],prescription:{type:"reps",target:7,rest:90},advanceAt:10,volume:{Épaules:1,Triceps:.55},query:"pike push up tutorial handstand push up"}),
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
  lib("Tuck L-sit","Core","Débutant","Barres de dips / sol",["Core","Triceps","Épaules"],{progression:"One-leg L-sit",substitutes:["Hollow hold"],prescription:{type:"hold",target:10,rest:60},advanceAt:20,volume:{Core:1,Triceps:.25,Épaules:.2},query:"tuck l sit tutorial beginner calisthenics"}),
  lib("One-leg L-sit","Core","Intermédiaire","Barres de dips / sol",["Core","Triceps","Épaules"],{regression:"Tuck L-sit",progression:"L-sit",prescription:{type:"hold_side",target:10,rest:75},advanceAt:20,volume:{Core:1,Triceps:.25,Épaules:.2},query:"one leg l sit progression tutorial"}),
  lib("L-sit","Core","Avancé","Barres de dips / sol",["Core","Triceps","Épaules"],{regression:"One-leg L-sit",progression:"V-sit compression",prescription:{type:"hold",target:10,rest:90},advanceAt:20,volume:{Core:1,Triceps:.25,Épaules:.2},query:"l sit proper form tutorial calisthenics"}),
  lib("V-sit compression","Core","Expert","Sol / barres de dips",["Core","Hanches"],{regression:"L-sit",prescription:{type:"reps",target:6,rest:90},advanceAt:12,volume:{Core:1},query:"v sit compression drill tutorial"}),
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
  lib("Squat lesté (sac à dos)","Jambes","Intermédiaire","Sac à dos",["Quadriceps","Fessiers","Core"],{regression:"Squat tempo",progression:"Bulgarian split squat lesté (sac à dos)",substitutes:["Bulgarian split squat"],prescription:{type:"reps",target:10,rest:90},advanceAt:15,volume:{Quadriceps:1,Fessiers:.7,Core:.15},query:"backpack weighted squat proper form"}),
  lib("Fentes arrière lestées (sac à dos)","Jambes","Intermédiaire","Sac à dos + tapis",["Quadriceps","Fessiers","Core"],{regression:"Fentes arrière",progression:"Bulgarian split squat lesté (sac à dos)",substitutes:["Squat lesté (sac à dos)"],prescription:{type:"reps_side",target:8,rest:90},advanceAt:12,volume:{Quadriceps:1,Fessiers:.8,Core:.15},query:"backpack reverse lunge proper form"}),
  lib("Bulgarian split squat lesté (sac à dos)","Jambes","Intermédiaire","Power Tower + sac à dos",["Quadriceps","Fessiers","Core"],{regression:"Bulgarian split squat",progression:"Pistol squat assisté",substitutes:["Fentes arrière lestées (sac à dos)"],prescription:{type:"reps_side",target:8,rest:105},advanceAt:12,volume:{Quadriceps:1,Fessiers:.85,Core:.2},query:"backpack bulgarian split squat proper form"})
];

const EXERCISE_BY_NAME = new Map(EXERCISE_LIBRARY.map(x=>[x.name,x]));
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


const TEST_DEFS = [
  { id: "pullups", name: "Tractions strictes", unit: "reps", input: "number", tip: "Répétitions propres, sans kipping. Arrête avant que la forme se dégrade fortement." },
  { id: "dips", name: "Dips stricts", unit: "reps", input: "number", tip: "Amplitude confortable et épaules stables." },
  { id: "dead_hang", name: "Dead hang", unit: "sec", input: "number", tip: "Chronomètre une seule tentative propre, sans douleur." },
  { id: "wall_handstand", name: "Handstand au mur", unit: "sec", input: "number", tip: "Ligne propre. Pas besoin de chercher l’échec." },
  { id: "l_sit", name: "L-sit / tuck L-sit", unit: "sec", input: "number", tip: "Note ton meilleur maintien propre et précise la variante dans les notes." },
  { id: "cardio12", name: "Cardio 12 min", unit: "m", input: "number", tip: "Distance en 12 minutes. Facultatif au début : garde une intensité contrôlée." }
];

const SKILL_TREES = [
  { id: "pull", name: "Tirage", levels: [
    { id:"pull-1", name:"1 traction stricte", auto:{ test:"pullups", value:1 } },
    { id:"pull-5", name:"5 tractions strictes", auto:{ test:"pullups", value:5 } },
    { id:"pull-10", name:"10 tractions strictes", auto:{ test:"pullups", value:10 } },
    { id:"pull-chest", name:"Chest-to-bar", manual:true },
    { id:"pull-explosive", name:"Traction explosive poitrine", manual:true },
    { id:"muscle-up", name:"Muscle-up strict", manual:true }
  ]},
  { id: "handstand", name: "Handstand", levels: [
    { id:"hs-wall-30", name:"Mur 30 sec", auto:{ test:"wall_handstand", value:30 } },
    { id:"hs-wall-60", name:"Mur 60 sec", auto:{ test:"wall_handstand", value:60 } },
    { id:"hs-free-5", name:"Libre 5 sec", manual:true },
    { id:"hs-free-20", name:"Libre 20 sec", manual:true },
    { id:"hspu-wall", name:"Handstand push-up au mur", manual:true },
    { id:"hspu-free", name:"Handstand push-up libre", manual:true }
  ]},
  { id: "core", name: "Core / L-sit", levels: [
    { id:"tuck-10", name:"Tuck L-sit 10 sec", auto:{ exercise:"Tuck L-sit", value:10 } },
    { id:"tuck-20", name:"Tuck L-sit 20 sec", auto:{ exercise:"Tuck L-sit", value:20 } },
    { id:"lsit-10", name:"L-sit 10 sec", manual:true },
    { id:"lsit-20", name:"L-sit 20 sec", manual:true },
    { id:"toes-bar", name:"Toes-to-bar propre", manual:true }
  ]},
  { id: "lever", name: "Front lever", levels: [
    { id:"lever-tuck", name:"Tuck front lever 10 sec", manual:true },
    { id:"lever-adv", name:"Advanced tuck 10 sec", manual:true },
    { id:"lever-oneleg", name:"One-leg front lever", manual:true },
    { id:"lever-straddle", name:"Straddle front lever", manual:true },
    { id:"lever-full", name:"Front lever", manual:true }
  ]},
  { id: "flag", name: "Human flag", levels: [
    { id:"flag-support", name:"Side support solide", manual:true },
    { id:"flag-tuck", name:"Tuck flag", manual:true },
    { id:"flag-oneleg", name:"One-leg flag", manual:true },
    { id:"flag-straddle", name:"Straddle flag", manual:true },
    { id:"flag-full", name:"Human flag", manual:true }
  ]}
];

const RANKS = [
  { id:"bronze", name:"Bronze", xpMin:0, requireCount:0, objectives:[] },
  { id:"silver", name:"Argent", xpMin:1500, requireCount:4, objectives:[
    { type:"sessions", value:12, label:"12 séances terminées" },
    { type:"test", id:"pullups", value:5, label:"5 tractions strictes", unit:"reps" },
    { type:"test", id:"dips", value:8, label:"8 dips stricts", unit:"reps" },
    { type:"test", id:"dead_hang", value:45, label:"Dead hang 45 sec", unit:"sec" },
    { type:"test", id:"wall_handstand", value:45, label:"Handstand au mur 45 sec", unit:"sec" }
  ]},
  { id:"gold", name:"Or", xpMin:4000, requireCount:4, objectives:[
    { type:"sessions", value:30, label:"30 séances terminées" },
    { type:"test", id:"pullups", value:8, label:"8 tractions strictes", unit:"reps" },
    { type:"test", id:"dips", value:12, label:"12 dips stricts", unit:"reps" },
    { type:"test", id:"dead_hang", value:60, label:"Dead hang 60 sec", unit:"sec" },
    { type:"exercise", name:"Tuck L-sit", value:20, label:"Tuck L-sit 20 sec", unit:"sec" }
  ]},
  { id:"platinum", name:"Platine", xpMin:8000, requireCount:4, objectives:[
    { type:"sessions", value:60, label:"60 séances terminées" },
    { type:"test", id:"pullups", value:12, label:"12 tractions strictes", unit:"reps" },
    { type:"test", id:"dips", value:15, label:"15 dips stricts", unit:"reps" },
    { type:"test", id:"dead_hang", value:75, label:"Dead hang 75 sec", unit:"sec" },
    { type:"skill", id:"hs-free-5", label:"Handstand libre 5 sec" },
    { type:"skill", id:"lsit-10", label:"L-sit 10 sec" }
  ]},
  { id:"diamond", name:"Diamant", xpMin:14000, requireCount:5, objectives:[
    { type:"sessions", value:100, label:"100 séances terminées" },
    { type:"test", id:"pullups", value:15, label:"15 tractions strictes", unit:"reps" },
    { type:"test", id:"dips", value:20, label:"20 dips stricts", unit:"reps" },
    { type:"test", id:"dead_hang", value:90, label:"Dead hang 90 sec", unit:"sec" },
    { type:"skill", id:"hs-free-20", label:"Handstand libre 20 sec" },
    { type:"skill", id:"pull-chest", label:"Chest-to-bar propre" },
    { type:"skill", id:"lsit-20", label:"L-sit 20 sec" }
  ]},
  { id:"master", name:"Maître", xpMin:22000, requireCount:5, objectives:[
    { type:"sessions", value:160, label:"160 séances terminées" },
    { type:"test", id:"pullups", value:18, label:"18 tractions strictes", unit:"reps" },
    { type:"test", id:"dips", value:25, label:"25 dips stricts", unit:"reps" },
    { type:"skill", id:"muscle-up", label:"Muscle-up strict" },
    { type:"skill", id:"hspu-wall", label:"Handstand push-up au mur" },
    { type:"skill", id:"lever-adv", label:"Advanced tuck front lever 10 sec" },
    { type:"skill", id:"flag-tuck", label:"Tuck human flag" }
  ]},
  { id:"legend", name:"Légende", xpMin:32000, requireCount:5, objectives:[
    { type:"sessions", value:250, label:"250 séances terminées" },
    { type:"test", id:"pullups", value:20, label:"20 tractions strictes", unit:"reps" },
    { type:"test", id:"dips", value:30, label:"30 dips stricts", unit:"reps" },
    { type:"test", id:"cardio12", value:2400, label:"2 400 m en 12 min", unit:"m" },
    { type:"skill", id:"muscle-up", label:"Muscle-up strict" },
    { type:"skill", id:"hspu-free", label:"Handstand push-up libre" },
    { type:"skill", id:"lever-full", label:"Front lever complet" },
    { type:"skill", id:"flag-full", label:"Human flag complète" }
  ]}
];

const state = {
  view: "today",
  active: null,
  timer: null,
  deferredInstall: null,
  testEditor: null,
  bodyEditor: false,
  selectedHistoryId: null,
  rankUpNotice: null,
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
};

function parse(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function getHistory() { return parse(STORAGE.history, []); }
function setHistory(v) { save(STORAGE.history, v); }
function getPrefs() { return parse(STORAGE.prefs, { sound:true, vibration:true, smartProgression:true }); }
function setPrefs(v) { save(STORAGE.prefs, v); }
function getTests() { return parse(STORAGE.tests, []); }
function setTests(v) { save(STORAGE.tests, v); }
function getManualSkills() { return parse(STORAGE.skills, {}); }
function setManualSkills(v) { save(STORAGE.skills, v); }
function getBodyLogs() { return parse(STORAGE.body, []); }
function setBodyLogs(v) { save(STORAGE.body, v); }
function getFlexLogs() { return parse(STORAGE.flexibility, []); }
function setFlexLogs(v) { save(STORAGE.flexibility, v); }
function getMobilityTests() { return parse(STORAGE.mobilityTests, []); }
function setMobilityTests(v) { save(STORAGE.mobilityTests, v); }
function getTutorialOverrides() { return parse(STORAGE.tutorials, {}); }
function setTutorialOverrides(v) { save(STORAGE.tutorials, v); }
function getQuickLogs() { return parse(STORAGE.quickLogs, []); }
function setQuickLogs(v) { save(STORAGE.quickLogs, v); }

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
  const backup={app:'Calisthenie Coach',schema:1,version:'8.7',exportedAt:new Date().toISOString(),data,photos};
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
function getCycleState(date=new Date()){
  const prefs=getPrefs();
  if(!prefs.cycleStart){prefs.cycleStart=mondayDate(date).toISOString();setPrefs(prefs);}
  const start=mondayDate(new Date(prefs.cycleStart));
  const current=mondayDate(date);
  let weeks=Math.floor((current-start)/604800000);
  if(weeks<0)weeks=0;
  const cycleNumber=Math.floor(weeks/8)+1, week=(weeks%8)+1;
  let name="Construction", setFactor=1, targetFactor=1, allowProgress=true, note="Progression graduelle, sans échec.";
  if(week===4){name="Consolidation";setFactor=.85;allowProgress=false;note="Volume légèrement réduit pour consolider les adaptations.";}
  if(week===8){name="Deload + tests";setFactor=.65;targetFactor=.9;allowProgress=false;note="Volume réduit d’environ un tiers. Aucun test maximal si tu ne récupères pas bien.";}
  return {start:start.toISOString(),cycleNumber,week,name,setFactor,targetFactor,allowProgress,note};
}
function resetCycle(){const p=getPrefs();p.cycleStart=mondayDate(new Date()).toISOString();setPrefs(p);render();}

function applyExerciseChoice(e){
  const baseName=e.sourceExercise||e.name;
  const chosen=currentExerciseName(baseName);
  if(chosen===e.name)return {...e,sourceExercise:baseName};
  const changed=exerciseFromLibrary(chosen,e);
  return {...changed,sourceExercise:baseName};
}
function scaleSets(sets,factor){
  if(factor>=1)return sets;
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
    if(/Cardio/i.test(e.name)){
      if(cycle.week===4) out.target=Math.round(e.target*.9);
      if(cycle.week>=5 && cycle.week<=7) out.target=Math.round(e.target*1.1);
      if(cycle.week===8) out.target=Math.round(e.target*.75);
    }
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
function preparedWorkout(day, readiness=null) {
  const w = clone(workouts[day]);
  const cycle=getCycleState();
  w.cycle=cycle;
  w.readiness=readiness;
  w.exercises = w.exercises.map(e => {
    let chosen=applyExerciseChoice(e);
    const p = prescriptionFor(chosen,cycle.allowProgress);
    chosen={ ...chosen, target:p.target, progressionTarget:p.target, prescriptionStatus:p.status, prescriptionNote:p.note };
    chosen=applyCycleToExercise(chosen,cycle);
    chosen=applyReadinessToExercise(chosen,readiness);
    return chosen;
  });
  return w;
}


function warmupForWorkout(w){
  const name=w?.name||"";
  if(/Push|Handstand/i.test(name))return ["1–2 min poignets","Cercles d’épaules","Scapular push-ups","2 séries faciles du premier push"];
  if(/Pull/i.test(name))return ["Dead hang très léger","Scapular pull-ups","Face pulls bande légère","2 séries assistées faciles"];
  if(/Jambes/i.test(name))return ["Chevilles knee-to-wall","Ouverture de hanches","Squats faciles","Fentes dynamiques"];
  if(/Full Body/i.test(name))return ["Poignets + épaules","Hanches + chevilles","Scapulas","1 série facile de chaque pattern"];
  return ["Mobilité articulaire douce","Montée progressive en température","Première série facile"];
}
function renderCycleMini(){
  const c=getCycleState();
  return `<section class="card cycle-mini"><div class="section-head"><div><div class="kicker">Cycle ${c.cycleNumber} · semaine ${c.week}/8</div><h2>${c.name}</h2></div><span class="pill">${c.week===8?'−35 % volume':c.week===4?'consolider':'progresser'}</span></div><div class="cycle-track">${Array.from({length:8},(_,i)=>`<span class="${i+1<c.week?'done':i+1===c.week?'current':''}">${i+1}</span>`).join('')}</div><p class="muted small">${c.note}</p></section>`;
}
function renderReadiness(){
  const r=state.readinessEditor,day=Number(r.day),base=preparedWorkout(day),plan=readinessPlan(r),c=getCycleState();
  return `<main class="shell readiness-shell"><section class="card"><button class="back-btn" id="cancelReadiness">← Retour</button><div class="kicker">Avant la séance · ${DAY_NAMES[day]}</div><h1>Comment tu récupères ?</h1><p class="muted">Trois réponses suffisent pour adapter le volume du jour. Ce n’est pas un diagnostic médical : une douleur vive ou inhabituelle reste un motif pour arrêter le mouvement concerné.</p>
    <div class="readiness-group"><strong>Énergie</strong><span class="muted small">1 = à plat · 5 = très en forme</span><div class="readiness-scale">${[1,2,3,4,5].map(n=>`<button data-energy="${n}" class="${Number(r.energy)===n?'active':''}">${n}</button>`).join('')}</div></div>
    <div class="readiness-group"><strong>Courbatures</strong><span class="muted small">1 = aucune · 5 = très fortes</span><div class="readiness-scale">${[1,2,3,4,5].map(n=>`<button data-soreness="${n}" class="${Number(r.soreness)===n?'active':''}">${n}</button>`).join('')}</div></div>
    <div class="readiness-group"><strong>Articulations / tendons</strong><div class="joint-choice"><button data-joints="ok" class="${r.joints==='ok'?'active':''}">OK</button><button data-joints="sensitive" class="${r.joints==='sensitive'?'active':''}">Sensibles</button><button data-joints="pain" class="${r.joints==='pain'?'active':''}">Gênées</button></div></div>
    <div class="readiness-result mode-${plan.mode}"><div><div class="kicker">Plan du jour</div><strong>${plan.label}</strong></div><p>${plan.note}</p><div class="meta"><span class="pill">Cycle S${c.week}</span><span class="pill">${base.name}</span><span class="pill">${Math.round(plan.setFactor*100)} % volume readiness</span></div></div>
    <div class="warmup-box"><strong>Activation ciblée</strong>${warmupForWorkout(base).map(x=>`<span>• ${x}</span>`).join('')}</div>
    <button class="btn btn-primary" id="confirmReadiness">${plan.mode==='recovery'?'Lancer très léger':'Lancer la séance'}</button></section></main>`;
}
function requestWorkoutStart(day=todayDay()){
  const w=workouts[Number(day)]; if(!w?.exercises?.length)return;
  state.readinessEditor={day:Number(day),energy:3,soreness:2,joints:'ok'}; render();
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
  Object.values(workouts).forEach(w=>w.exercises.forEach(e=>{
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
function volumeForWorkout(w){const total={};(w.exercises||[]).forEach(e=>{const info=exerciseInfo(e.name);if(info&&e.type!=='timer')volumeAdd(total,info.volume,e.sets||1);});return total;}
function weeklyVolume(){
  const start=mondayDate(new Date()).getTime(),actual={};
  getHistory().filter(s=>new Date(s.date).getTime()>=start).forEach(s=>(s.entries||[]).forEach(entry=>{if(entry.type==='timer')return;const info=exerciseInfo(entry.exercise);if(info)volumeAdd(actual,info.volume,1);}));
  const planned={};[2,3,4,5,6,0].forEach(day=>{const v=volumeForWorkout(preparedWorkout(day));Object.entries(v).forEach(([g,n])=>planned[g]=(planned[g]||0)+n);});
  return {actual,planned};
}
function renderVolumePanel(){
  const {actual,planned}=weeklyVolume();
  const groups=VOLUME_GROUPS.filter(g=>(planned[g]||actual[g]||0)>0);
  return `<section class="card"><div class="section-head"><div><div class="kicker">Équilibre hebdomadaire</div><h2>Volume musculaire</h2></div><span class="pill">séries pondérées</span></div><p class="muted small">Repère interne : les exercices polyarticulaires comptent aussi partiellement pour leurs muscles secondaires. Le but est de voir les déséquilibres, pas de poursuivre un chiffre à tout prix.</p><div class="volume-list">${groups.map(g=>{const a=actual[g]||0,p=Math.max(.1,planned[g]||0),pct=clamp(a/p,0,1.25)*100;return `<div class="volume-row"><div><strong>${g}</strong><span>${a.toFixed(1)} / ${p.toFixed(1)}</span></div><div class="volume-track"><i style="width:${Math.min(100,pct)}%"></i></div></div>`}).join('')}</div></section>`;
}

function recordKey(entry){return `${entry.exercise}::${entry.type==='reps_band'?(entry.band||'bande'):''}::${entry.loadKg?'load'+entry.loadKg:''}`;}
function recordValueText(entry){return `${entry.value}${entry.type?.startsWith('hold')?' s':' reps'}${entry.type==='reps_band'&&entry.band?' · '+entry.band:''}${entry.loadKg?' · sac '+entry.loadKg+' kg':''}`;}
function bestBefore(history,key){let best=0;history.forEach(s=>(s.entries||[]).forEach(e=>{if(recordKey(e)===key)best=Math.max(best,Number(e.value||0));}));return best;}
function detectPRs(entries,history){
  const byKey=new Map();entries.filter(e=>e.type!=='timer').forEach(e=>{const k=recordKey(e),cur=byKey.get(k);if(!cur||Number(e.value)>Number(cur.value))byKey.set(k,e);});
  const out=[];for(const [k,e] of byKey){const old=bestBefore(history,k);if(old>0&&Number(e.value)>old)out.push({...e,previous:old});}return out.sort((a,b)=>Number(b.value)-Number(a.value));
}
function currentRecords(){
  const map=new Map();getHistory().slice().reverse().forEach(s=>(s.entries||[]).forEach(e=>{if(e.type==='timer')return;const k=recordKey(e),old=map.get(k);if(!old||Number(e.value)>Number(old.value))map.set(k,{...e,date:s.date});}));
  return [...map.values()].sort((a,b)=>new Date(b.date)-new Date(a.date));
}
function renderPRNotice(){if(!state.prNotice?.length)return'';return `<section class="card pr-banner"><button class="icon-btn" id="dismissPR">×</button><div class="kicker">Nouveau record</div><h2>🏆 ${state.prNotice[0].exercise} · ${recordValueText(state.prNotice[0])}</h2>${state.prNotice.length>1?`<p class="muted">+ ${state.prNotice.length-1} autre${state.prNotice.length>2?'s':''} record${state.prNotice.length>2?'s':''} sur cette séance.</p>`:''}</section>`;}
function renderRecordsPanel(){const records=currentRecords().slice(0,10);return `<section class="card"><div class="section-head"><div><div class="kicker">Personal records</div><h2>Records actuels</h2></div><span class="pill">${records.length}</span></div>${records.length?`<div class="records-grid">${records.map(r=>`<div class="record-tile"><span>${r.exercise}</span><strong>${recordValueText(r)}</strong><small>${formatShortDate(r.date)}</small></div>`).join('')}</div>`:'<div class="empty">Les premiers résultats servent de référence. Les records apparaîtront ensuite.</div>'}</section>`;}

function renderProgressionRecommendations(){
  const recs=progressionRecommendations(); if(!recs.length)return'';
  return `<section class="card"><div class="section-head"><div><div class="kicker">Niveaux débloqués</div><h2>Progressions disponibles</h2></div><span class="pill badge-success">${recs.length}</span></div>${recs.map(r=>`<div class="progression-card"><div><strong>${r.current.name} → ${r.next.name}</strong><small>Deux séances propres au palier ${r.gate}${r.current.prescription?.type?.startsWith('hold')?' sec':' reps'}.</small></div><button class="btn btn-secondary compact accept-progression" data-base="${encodeURIComponent(r.baseName)}" data-next="${encodeURIComponent(r.next.name)}">Adopter</button></div>`).join('')}</section>`;
}

function renderDailyVolumeCard(){
  const rows=dailyVolumeRows(),quickToday=getQuickLogs().filter(x=>localDateKey(x.date)===localDateKey()),quickReps=quickToday.reduce((n,x)=>n+repsEquivalent(x.type,x.value),0);
  const relevant=rows.filter(r=>r.quick>0||r.guided>0),warning=dailyQuickLoadWarning();
  return `<section class="card daily-volume-card"><div class="section-head"><div><div class="kicker">Volume journalier</div><h2>Aujourd'hui</h2></div><button class="btn btn-secondary compact" data-open-quick-log="true">＋ Ajouter</button></div>
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
function renderQuickLogModal(){
  if(!state.quickEditor)return '';
  const quick=getQuickLogs(),last=quick[0],recent=recentQuickActions();
  const options=EXERCISE_LIBRARY.filter(x=>x.prescription&&(x.prescription.type.startsWith('reps')||x.prescription.type.startsWith('hold'))).sort((a,b)=>a.name.localeCompare(b.name,'fr'));
  return `<div class="quick-overlay"><section class="quick-sheet"><div class="quick-sheet-head"><div><div class="kicker">Quick Log</div><h2>Ajouter une micro-série</h2></div><button class="icon-btn" id="closeQuickLog">×</button></div>
    ${state.quickToast?`<div class="quick-toast">✓ ${esc(state.quickToast)}</div>`:''}
    ${recent.length?`<div class="quick-recent"><div class="quick-recent-title">Répéter en 1 tap</div><div class="quick-recent-grid">${recent.map((x,i)=>`<button class="quick-repeat" data-repeat-index="${i}" data-quick-name="${encodeURIComponent(x.exercise)}" data-quick-type="${x.type}" data-quick-value="${x.value}" data-quick-band="${x.band?encodeURIComponent(x.band):''}" data-quick-load="${Number(x.loadKg||0)}"><strong>${quickFamily(x.exercise)}</strong><span>+${x.value} ${quickUnit(x.type)}${x.band?' · '+bandByLabel(x.band).short:''}${x.loadKg?' · '+x.loadKg+' kg':''}</span></button>`).join('')}</div></div>`:''}
    <p class="muted small">Tape ton nombre exact ou utilise un raccourci. Pour les mouvements assistés, choisis ta bande d’un seul tap.</p>
    <div class="quick-presets">${QUICK_PRESETS.map((p,i)=>{const isBand=p.type==='reps_band',preferred=isBand?(lastBandForExercise(p.name)||defaultBandForExercise(p.name)):null;return `<div class="quick-preset quick-preset-rich" data-quick-preset="${i}"><div class="quick-preset-head"><div><strong>${p.label}</strong><small>${p.type==='hold'?'secondes':isBand?'répétitions · assistance':'répétitions'}</small></div><div class="quick-preset-actions">${p.adds.map(v=>`<button class="quick-add" data-quick-preset-index="${i}" data-quick-name="${encodeURIComponent(p.name)}" data-quick-type="${p.type}" data-quick-value="${v}">+${v}${p.type==='hold'?'s':''}</button>`).join('')}</div></div>${isBand?`<div class="quick-preset-bandrow"><label>Bande</label>${renderPresetBandPicker(preferred,p.name,i)}</div>`:''}<div class="quick-exact"><input class="quick-exact-input" id="quickExact_${i}" type="number" inputmode="numeric" min="1" step="1" placeholder="Nombre exact"><button class="quick-exact-add" data-quick-exact-index="${i}" data-quick-preset-index="${i}" data-quick-name="${encodeURIComponent(p.name)}" data-quick-type="${p.type}">Ajouter</button></div></div>`;}).join('')}</div>
    <details class="quick-custom"><summary>Autre exercice / sac à dos</summary><label class="field-label">Exercice</label><select class="select" id="quickExercise">${options.map(x=>`<option value="${esc(x.name)}" data-type="${esc(x.prescription.type)}">${x.name}</option>`).join('')}</select><label class="field-label">Répétitions ou secondes</label><input class="big-input" id="quickValue" type="number" inputmode="numeric" min="1" step="1" placeholder="ex. 8"><div id="quickBandWrap" hidden><label class="field-label">Bande utilisée</label>${renderBandPicker(defaultBandForExercise(options[0]?.name||''),options[0]?.name||'',true)}</div><div id="quickLoadWrap" hidden>${renderBackpackLoadInput(0,'quickLoadKg')}</div><button class="btn btn-primary" id="saveQuickCustom">Ajouter</button></details>
    ${last?`<button class="btn btn-outline" id="undoQuickLog">↶ Annuler le dernier ajout · ${quickFamily(last.exercise)} +${last.value} ${quickUnit(last.type)}${last.band?' · '+bandByLabel(last.band).short:''}${last.loadKg?' · '+last.loadKg+' kg':''}</button>`:''}
  </section></div>`;
}
function renderExerciseLibrary(){
  const cats=['Tous',...new Set(EXERCISE_LIBRARY.map(x=>x.category))];
  return `<main class="shell"><section class="card library-head"><button class="back-btn" id="closeExerciseLibrary">← Retour</button><div class="kicker">V8.1 · bibliothèque structurée</div><h1>${EXERCISE_LIBRARY.length} exercices</h1><p class="muted">Chaque fiche indique le niveau, le matériel, les muscles, la régression, la progression et les substitutions possibles.</p><input class="library-search" id="librarySearch" type="search" placeholder="Rechercher un exercice, muscle, matériel…"><div class="library-filters">${cats.map(c=>`<button class="library-filter ${state.libraryCategory===c?'active':''}" data-library-category="${c}">${c}</button>`).join('')}</div></section><section class="library-list" id="libraryList">${EXERCISE_LIBRARY.map(item=>`<details class="card library-item" data-lib-category="${item.category}" data-lib-text="${esc((item.name+' '+item.category+' '+item.level+' '+item.equipment+' '+item.muscles.join(' ')).toLowerCase())}"><summary><div><strong>${item.name}</strong><span>${item.category} · ${item.level}</span></div><b>⌄</b></summary><div class="library-body"><div class="meta"><span class="pill">${item.equipment}</span>${item.muscles.map(m=>`<span class="pill">${m}</span>`).join('')}</div>${item.prescription?`<div class="library-prescription"><strong>Repère</strong><span>${item.prescription.type.startsWith('hold')?item.prescription.target+' sec':item.prescription.target+' reps'} · repos ${fmtTime(item.prescription.rest||0)}</span></div>`:''}<div class="library-path"><span>↓ Régression <strong>${item.regression||'—'}</strong></span><span>↑ Progression <strong>${item.progression||'—'}</strong></span></div>${item.substitutes.length?`<p class="small muted">Substitutions : ${item.substitutes.join(' · ')}</p>`:''}${tutorialLink(item.name)}</div></details>`).join('')}</section></main>`;
}
function filterLibraryDom(){const q=(document.getElementById('librarySearch')?.value||'').trim().toLowerCase(),cat=state.libraryCategory;document.querySelectorAll('.library-item').forEach(el=>{const okCat=cat==='Tous'||el.dataset.libCategory===cat,okQ=!q||(el.dataset.libText||'').includes(q);el.style.display=okCat&&okQ?'':'none';});}

function render() {
  const app = document.getElementById("app");
  if (state.active) app.innerHTML = renderCoach();
  else if (state.readinessEditor) app.innerHTML = renderReadiness();
  else if (state.exerciseLibrary) app.innerHTML = renderExerciseLibrary();
  else if (state.testEditor) app.innerHTML = renderTestEditor();
  else if (state.bodyEditor) app.innerHTML = renderBodyEditor();
  else if (state.tutorialManager) app.innerHTML = renderTutorialManager();
  else if (state.view === "week") app.innerHTML = renderWeek();
  else if (state.view === "flexibility") app.innerHTML = renderFlexibility();
  else if (state.view === "progress") app.innerHTML = renderProgress();
  else if (state.view === "skills") app.innerHTML = renderSkills();
  else if (state.view === "profile") app.innerHTML = renderProfile();
  else if (state.view === "more") app.innerHTML = renderMore();
  else app.innerHTML = renderToday();
  bindEvents();
}

function shell(content, activeTab=state.view) {
  const navTab=['today','week','progress'].includes(activeTab)?activeTab:'more';
  return `<main class="shell">${content}</main>
  <button class="quick-fab" id="openQuickLog" aria-label="Ajouter une série rapide">＋<span>Log</span></button>
  ${renderQuickLogModal()}
  <nav class="bottom-nav bottom-nav-simple">
    <button class="nav-btn ${navTab==='today'?'active':''}" data-view="today"><span>●</span>Aujourd'hui</button>
    <button class="nav-btn ${navTab==='week'?'active':''}" data-view="week"><span>▦</span>Semaine</button>
    <button class="nav-btn ${navTab==='progress'?'active':''}" data-view="progress"><span>↗</span>Progrès</button>
    <button class="nav-btn ${navTab==='more'?'active':''}" data-view="more"><span>•••</span>Plus</button>
  </nav>`;
}

function renderMore(){
  return shell(`<header class="topbar"><div><div class="brand">Plus</div><div class="daylabel">Outils & réglages · V8.8.3</div></div></header>
    <section class="more-grid">
      <button class="card more-tile" data-view="flexibility"><span class="more-icon">⌁</span><div><strong>Flexibilité</strong><small>Routines guidées & mobilité</small></div></button>
      <button class="card more-tile" data-view="skills"><span class="more-icon">◆</span><div><strong>Skills</strong><small>Handstand, L-sit, lever…</small></div></button>
      <button class="card more-tile" id="openExerciseLibrary"><span class="more-icon">▤</span><div><strong>Exercices</strong><small>${EXERCISE_LIBRARY.length} mouvements & progressions</small></div></button>
      <button class="card more-tile" data-view="profile"><span class="more-icon">○</span><div><strong>Profil</strong><small>Mesures, sauvegarde & réglages</small></div></button>
    </section>
    <section class="card home-equipment"><div class="kicker">Matériel maison</div><h2>Ton setup</h2><div class="equipment-chips">${HOME_EQUIPMENT.map(x=>`<span>${x}</span>`).join('')}</div><p class="muted small">Les variantes lestées utilisent le sac à dos en kg. Les bandes restent suivies par couleur et plage d’assistance.</p></section>`, 'more');
}
function renderToday() {
  const day=todayDay(),w=preparedWorkout(day),history=getHistory(),seven=Date.now()-7*86400000;
  const recent=history.filter(h=>new Date(h.date).getTime()>=seven),weeklyMinutes=recent.reduce((a,h)=>a+(h.durationMinutes||0),0);
  const rank=getRankState(),warning=dailyQuickLoadWarning();
  const hero=!w.exercises.length?`<section class="card hero rest-banner"><div class="kicker">Aujourd'hui · ${DAY_NAMES[day]}</div><h1>Repos</h1><p class="muted">Récupération complète. Marche tranquille ou mobilité douce si tu en as envie.</p></section>`:`<section class="card hero"><div class="kicker">Aujourd'hui · ${DAY_NAMES[day]}</div><h1>${w.name}</h1><p class="muted">${w.subtitle}</p><div class="meta"><span class="pill">≈ ${w.duration} min</span><span class="pill">${w.intensity}</span></div><button class="btn btn-primary" id="startWorkout" data-day="${day}">Commencer la séance</button></section>`;
  const program=w.exercises.length?`<details class="card today-details"><summary><div><div class="kicker">Séance</div><strong>Voir les ${w.exercises.length} étapes</strong></div><span>⌄</span></summary><div class="exercise-list">${w.exercises.map((e,i)=>`<div class="exercise-row"><div class="num">${i+1}</div><div class="grow"><div class="exercise-name">${e.name}</div><div class="exercise-detail">${describe(e)}</div></div></div>`).join('')}</div></details>`:'';
  return shell(`<header class="topbar"><div><div class="brand">Calisthénie Coach</div><div class="daylabel">✓ Sauvegarde locale active</div></div></header>${renderPRNotice()}${hero}
    <section class="today-cockpit"><button class="cockpit-card" data-open-quick-log="true"><span>＋</span><strong>Quick Log</strong><small>Ajouter une micro-série</small></button><div class="cockpit-card"><span>↗</span><strong>${rank.current.name}</strong><small>${rank.xp.total.toLocaleString('fr-FR')} XP</small></div><div class="cockpit-card"><span>◷</span><strong>${weeklyMinutes} min</strong><small>${recent.length} séances / 7 j</small></div></section>
    ${renderDailyVolumeCard()}${program}
    <details class="today-details"><summary><div><div class="kicker">Détails</div><strong>Cycle, rang & coach adaptatif</strong></div><span>⌄</span></summary><div class="details-stack">${renderCycleMini()}${renderRankMini()}${renderProgressionRecommendations()}</div></details>`, 'today');
}
function renderWeekExercise(e, i) {
  const rest = e.rest > 0 ? ` · repos ${fmtTime(e.rest)}` : '';
  const status = e.prescriptionStatus === 'progress'
    ? '<span class="microbadge good">progression</span>'
    : e.prescriptionStatus === 'recover'
      ? '<span class="microbadge warn">allégé</span>'
      : '';
  return `<div class="week-exercise-row">
    <div class="num">${i+1}</div>
    <div class="grow">
      <div class="exercise-name">${e.name}</div>
      <div class="exercise-detail">${describe(e)}${rest}</div>
      ${e.tip ? `<div class="week-exercise-tip">${e.tip}</div>` : ''}
      <div class="exercise-tools">${status}${tutorialLink(e.name,true)}</div>
    </div>
  </div>`;
}

function renderWeek() {
  const order = [1,2,3,4,5,6,0];
  const dayNow = todayDay();
  return shell(`<header class="topbar"><div><div class="brand">Semaine</div><div class="daylabel">Clique sur une séance pour voir son contenu complet</div></div></header>
    <section class="week-list">${order.map(day=>{
      const w=preparedWorkout(day), isToday=day===dayNow, expanded=state.expandedWeekDay===day;
      const details = w.exercises.length
        ? `<div class="week-details ${expanded?'open':''}" ${expanded?'':'hidden'}>
            <div class="week-details-head"><strong>${w.exercises.length} étapes</strong><span class="muted small">Objectifs adaptés à ta progression actuelle</span></div>
            <div class="week-exercise-list">${w.exercises.map(renderWeekExercise).join('')}</div>
            <button class="btn btn-primary start-day week-start" data-day="${day}">Commencer cette séance</button>
          </div>`
        : `<div class="week-details ${expanded?'open':''}" ${expanded?'':'hidden'}><p class="muted week-rest-copy">Repos complet. Marche tranquille ou mobilité douce uniquement si tu en as envie.</p></div>`;
      return `<article class="card week-card ${isToday?'today-card':''} ${expanded?'expanded':''}" data-week-day="${day}">
        <button class="week-summary week-toggle" data-day="${day}" aria-expanded="${expanded}">
          <div class="week-main"><div class="kicker">${DAY_NAMES[day]} ${isToday?'· aujourd’hui':''}</div><h2>${w.name}</h2><p class="muted">${w.subtitle}</p><div class="meta">${w.exercises.length?`<span class="pill">${w.duration} min</span><span class="pill">${w.intensity}</span><span class="pill">${w.exercises.length} étapes</span>`:`<span class="pill">Repos complet</span>`}</div></div>
          <span class="week-chevron" aria-hidden="true">⌄</span>
        </button>
        ${w.exercises.length?`<div class="week-card-actions"><button class="btn btn-secondary compact start-day" data-day="${day}">Lancer</button></div>`:''}
        ${details}
      </article>`;
    }).join('')}</section>`, "week");
}

function flexRoutineById(id){return FLEX_ROUTINES.find(r=>r.id===id);}
function startFlexRoutine(id){
  const routine=clone(flexRoutineById(id)); if(!routine)return;
  state.active={kind:"flexibility",day:"flex",workout:routine,startedAt:Date.now(),exerciseIndex:0,setIndex:0,phase:"work",entries:[],currentValue:routine.exercises[0].target,currentBand:"Aucune",timerRemaining:null,timerRunning:false,reviewComfort:3,reviewDiscomfort:false,reviewNote:""};
  render();
}
function latestMobilityValue(id){const arr=getMobilityTests().filter(x=>x.testId===id).sort((a,b)=>new Date(b.date)-new Date(a.date));return arr[0]?Number(arr[0].value):null;}
function bestMobilityValue(id){const vals=getMobilityTests().filter(x=>x.testId===id).map(x=>Number(x.value)).filter(Number.isFinite);return vals.length?Math.max(...vals):null;}
function renderFlexExercise(e,i){return `<div class="week-exercise-row"><div class="num">${i+1}</div><div class="grow"><div class="exercise-name">${e.name}</div><div class="exercise-detail">${describe(e)}${e.rest?` · repos ${fmtTime(e.rest)}`:''}</div><div class="exercise-tools">${tutorialLink(e.name,true)}</div></div></div>`;}
function targetedFlexRoutine(day=todayDay()){
  if([2,3,5].includes(day)) return flexRoutineById("upper-15");
  if([4].includes(day)) return flexRoutineById("lower-18");
  if(day===6) return flexRoutineById("reset-10");
  if(day===0) return flexRoutineById("full-25");
  return flexRoutineById("reset-10");
}
function recommendedFlexRoutine(day=todayDay()){
  if(day===0) return flexRoutineById("full-25");
  if(day===4) return flexRoutineById("lower-18");
  if([2,3].includes(day)) return flexRoutineById("upper-15");
  return flexRoutineById("reset-10");
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
  const recommended=recommendedFlexRoutine(), targeted=targetedFlexRoutine();
  const last=logs[0];
  return shell(`<header class="topbar"><div><div class="brand">Flex</div><div class="daylabel">Choisis, lance, respire.</div></div></header>
    <section class="card flex-simple-hero"><div class="flex-hero-copy"><div class="kicker">Conseillé aujourd’hui</div><h1>${recommended.name}</h1><p>${recommended.subtitle}</p><div class="meta"><span class="pill">≈ ${recommended.duration} min</span><span class="pill">${recommended.focus}</span></div></div><button class="btn btn-primary start-flex flex-hero-start" data-flex="${recommended.id}">Commencer</button></section>

    <section class="flex-simple-section"><div class="section-head"><div><div class="kicker">Choix rapide</div><h2>De combien de temps disposes-tu ?</h2></div></div><div class="flex-choice-list">
      ${flexChoiceCard('Rapide','⚡',flexRoutineById('reset-10'),'Récupération douce et mobilité générale. Idéale presque tous les jours.')}
      ${flexChoiceCard('Ciblée','◎',targeted, targeted.id==='lower-18'?'Accent sur chevilles, hanches, adducteurs et ischios.':'Accent sur poignets, épaules, pectoraux, dorsaux et thorax.')}
      ${flexChoiceCard('Complète','◇',flexRoutineById('full-25'),'Travail global quand tu veux consacrer une vraie séance à la souplesse.')}
    </div></section>

    <details class="card flex-tracking"><summary><div><div class="kicker">Optionnel</div><strong>Suivi mobilité</strong><small>${recent.length} routine${recent.length>1?'s':''} cette semaine${last?` · dernière : ${formatDate(last.date)}`:''}</small></div><span>⌄</span></summary><div class="flex-tracking-body">
      <h3>Tests</h3><p class="muted small">À refaire environ toutes les 4 semaines, pas à chaque séance.</p><div class="mobility-grid">${MOBILITY_TESTS.map(t=>{const latest=latestMobilityValue(t.id),best=bestMobilityValue(t.id);return `<div class="mobility-test"><strong>${t.name}</strong><div class="mobility-values"><span>Dernier <b>${latest==null?'—':latest+' '+t.unit}</b></span><span>Meilleur <b>${best==null?'—':best+' '+t.unit}</b></span></div><details><summary class="mobility-measure-toggle">Mesurer</summary><small>${t.note}</small><div class="mobility-entry"><input id="mob_${t.id}" type="number" inputmode="decimal" min="${t.min}" step="${t.step}" placeholder="${t.unit}"><button class="btn btn-secondary save-mobility" data-test="${t.id}">OK</button></div></details></div>`;}).join('')}</div>
      <div class="divider"></div><h3>Historique récent</h3>${logs.length?logs.slice(0,4).map(l=>`<div class="history-item"><div class="history-top"><div><div class="history-title">${l.name}</div><div class="small muted">${formatDate(l.date)} · ${l.durationMinutes} min</div></div><span class="pill">${l.comfort||'—'}/5</span></div></div>`).join(''):'<div class="empty">Ta première routine apparaîtra ici.</div>'}
    </div></details>

    <div class="flex-safety-line"><span>✓</span><p><strong>Règle simple :</strong> tension confortable 3–6/10. Pas de douleur vive, pincement, engourdissement ou sensation électrique.</p></div>`,"flexibility");
}
function saveMobilityTest(id){const def=MOBILITY_TESTS.find(x=>x.id===id),el=document.getElementById(`mob_${id}`);if(!def||!el||el.value==='')return;const value=Number(el.value);if(!Number.isFinite(value))return;const arr=getMobilityTests();arr.unshift({id:Date.now(),date:new Date().toISOString(),testId:id,value});setMobilityTests(arr.slice(0,400));render();}

function allExerciseNames(){const names=new Set(EXERCISE_LIBRARY.map(e=>e.name));Object.values(workouts).forEach(w=>w.exercises.forEach(e=>names.add(e.name)));FLEX_ROUTINES.forEach(r=>r.exercises.forEach(e=>names.add(e.name)));return [...names].sort((a,b)=>a.localeCompare(b,'fr'));}
function tutorialStats(){const names=allExerciseNames(), exact=names.filter(n=>tutorialFor(n).exact).length;return {total:names.length,exact};}
function renderTutorialManager(){const names=allExerciseNames(),saved=getTutorialOverrides(),stats=tutorialStats();return `<main class="shell"><section class="card editor-card tutorial-manager"><button class="back-btn" id="closeTutorialManager">← Retour au profil</button><div class="kicker">Bibliothèque tutoriels</div><h1>${stats.exact}/${stats.total} tutoriels fixés</h1><p class="muted">Chaque exercice garde sa recherche YouTube de secours. Quand tu trouves un tutoriel que tu veux conserver, colle son URL ici : l'application utilisera ensuite cette vidéo partout. Une miniature YouTube est générée automatiquement.</p><div class="tutorial-progress"><div style="width:${stats.total?Math.round(stats.exact/stats.total*100):0}%"></div></div>${names.map((name,i)=>{const data=saved[name]||{},t=tutorialFor(name);return `<details class="tutorial-editor-row"><summary><span>${name}</span><span class="microbadge ${t.exact?'good':''}">${t.exact?'fixé':'recherche'}</span></summary><div class="tutorial-editor-body"><label class="field-label">URL vidéo</label><input class="url-input" id="tutorialVideo_${i}" type="url" value="${esc(data.videoUrl||'')}" placeholder="https://www.youtube.com/watch?v=..."><label class="field-label">URL image facultative</label><input class="url-input" id="tutorialImage_${i}" type="url" value="${esc(data.imageUrl||'')}" placeholder="Laisse vide pour utiliser la miniature YouTube"><div class="tutorial-editor-actions"><a class="btn btn-outline compact" href="${esc(`https://www.youtube.com/results?search_query=${encodeURIComponent(TUTORIAL_QUERIES[name]||name+' tutorial')}`)}" target="_blank" rel="noopener noreferrer">Rechercher</a><button class="btn btn-secondary compact save-tutorial" data-index="${i}" data-name="${encodeURIComponent(name)}">Enregistrer</button>${data.videoUrl||data.imageUrl?`<button class="btn btn-outline compact clear-tutorial" data-name="${encodeURIComponent(name)}">Réinitialiser</button>`:''}</div></div></details>`;}).join('')}</section></main>`;}
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
  const w = preparedWorkout(Number(day),readiness);
  if (!w.exercises.length) return;
  state.readinessEditor=null;
  state.active = {
    kind:"workout", day:Number(day), workout:w, cycle:w.cycle, readiness:readiness||{energy:3,soreness:2,joints:'ok'}, startedAt:Date.now(), exerciseIndex:0, setIndex:0, phase:"work", entries:[],
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

  if (a.phase === "rest") {
    return `<main class="shell coach-shell"><div class="progress-wrap"><div class="progress-label"><span>${a.workout.name}</span><span>${step}/${total}</span></div><div class="progress-track"><div class="progress-bar" style="width:${progress}%"></div></div></div>
      <section class="card coach-card"><div><div class="kicker">Repos</div><h2>${e.name}</h2>
      <div class="timer"><div class="timer-time">${fmtTime(a.timerRemaining)}</div><div class="timer-sub">Prochaine série : ${a.setIndex+1}/${e.sets}</div></div>
      <div class="timer-controls"><button class="btn btn-secondary" id="minus15">−15 s</button><button class="btn btn-secondary" id="toggleTimer">${a.timerRunning?'Pause':'Reprendre'}</button><button class="btn btn-secondary" id="plus30">+30 s</button></div></div>
      <div class="stack"><button class="btn btn-primary" id="skipRest">Passer le repos</button>${state.undoSetSnapshot?'<button class="btn btn-secondary" id="undoGuidedSet">↶ Annuler la dernière série</button>':''}<button class="btn btn-outline" id="pauseWorkout">Pause séance</button><button class="btn btn-outline" id="quitWorkout">Quitter</button></div></section></main>`;
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
    <section class="card coach-card"><div><div class="kicker">${setLabel}</div><div class="exercise-title">${e.name}</div><div class="target">${describe(e)}</div>
      ${e.prescriptionNote?`<div class="coach-note ${e.prescriptionStatus}">${e.prescriptionNote}</div>`:''}<p class="tip">${e.tip}</p>${tutorialLink(e.name)}${a.kind==='workout'&&substitutionOptions(e).length?'<button class="btn btn-outline substitute-btn" id="openSubstitute">Changer cet exercice</button>':''}${input}</div>
      <div class="stack"><button class="btn btn-primary" id="completeSet">${a.setIndex===e.sets-1?'Terminer cette étape':'Série terminée'}</button>${state.undoSetSnapshot?'<button class="btn btn-secondary" id="undoGuidedSet">↶ Annuler la dernière série</button>':''}<button class="btn btn-outline" id="pauseWorkout">Pause séance</button><button class="btn btn-outline" id="quitWorkout">Quitter</button></div></section></main>`;
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
    a.exerciseIndex++; a.setIndex=0; a.phase="work"; const next=a.workout.exercises[a.exerciseIndex]; a.currentValue=next.target;
    a.currentBand=next.type==="reps_band"?(lastBandForExercise(next.name)||defaultBandForExercise(next.name)):"Aucune";a.currentLoadKg=0;
    a.timerRemaining=next.type==="timer"||next.type.startsWith("hold")?next.target:null; render(); return;
  }
  a.phase="review"; a.finishedAt=Date.now(); render();
}

function renderWorkoutReview() {
  const a=state.active;
  const duration=activeDurationMinutes(a);
  const counted=a.entries.filter(x=>x.type!=="timer"), hit=counted.filter(x=>x.value>=x.target).length;
  const score=counted.length?Math.round((hit/counted.length)*100):100;
  if(a.kind==="flexibility") return `<main class="shell coach-shell"><section class="card review-card"><div class="kicker">Routine terminée</div><h1>Mobilité faite.</h1><div class="stat-grid"><div class="stat"><div class="stat-value">${duration}</div><div class="stat-label">minutes</div></div><div class="stat"><div class="stat-value">${a.workout.exercises.length}</div><div class="stat-label">étapes</div></div></div><div class="divider"></div><h2>Confort global</h2><p class="muted small">1 = très raide aujourd'hui · 5 = amplitude fluide et confortable.</p><div class="comfort-row">${[1,2,3,4,5].map(n=>`<button class="comfort-btn ${a.reviewComfort===n?'active':''}" data-comfort="${n}">${n}</button>`).join('')}</div><label class="checkline"><input id="jointDiscomfort" type="checkbox" ${a.reviewDiscomfort?'checked':''}><span><strong>Douleur ou pincement inhabituel</strong><small>À distinguer d'une tension musculaire normale.</small></span></label><label class="field-label">Note facultative</label><textarea class="textarea" id="reviewNote" placeholder="Ex. hanche droite plus raide, chevilles très libres…">${esc(a.reviewNote)}</textarea><button class="btn btn-primary" id="saveWorkout">Enregistrer la routine</button></section></main>`;
  return `<main class="shell coach-shell"><section class="card review-card"><div class="kicker">Séance terminée</div><h1>Bien joué.</h1>
    <div class="stat-grid"><div class="stat"><div class="stat-value">${duration}</div><div class="stat-label">minutes</div></div><div class="stat"><div class="stat-value">${score}%</div><div class="stat-label">objectifs atteints</div></div></div>
    <div class="meta"><span class="pill">Cycle S${a.cycle?.week||'—'} · ${a.cycle?.name||'—'}</span><span class="pill">Readiness ${readinessPlan(a.readiness).label}</span></div><div class="divider"></div><h2>Effort perçu</h2><p class="muted small">Pour une reprise, vise le plus souvent 5–7/10.</p>
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
  history.unshift({ id:Date.now(), date:new Date().toISOString(), day:a.day, name:a.workout.name, durationMinutes, score, rpe:a.reviewRpe, jointDiscomfort:a.reviewDiscomfort, note:a.reviewNote, readiness:{...a.readiness,mode:readinessPlan(a.readiness).mode}, cycle:a.cycle, prs, entries:a.entries });
  setHistory(history.slice(0,1000));
  if(prs.length)state.prNotice=prs;
  const afterRank=getRankState();
  if(afterRank.current.id!==beforeRank)state.rankUpNotice=afterRank.current.name;
  state.active=null; state.undoSetSnapshot=null; state.view="progress"; render();
}

function startTimer() {
  stopTimer();
  state.timer=setInterval(()=>{
    if(!state.active||!state.active.timerRunning)return;
    state.active.timerRemaining=Math.max(0,(state.active.timerRemaining??0)-1);
    const el=document.querySelector('.timer-time'); if(el) el.textContent=fmtTime(state.active.timerRemaining);
    if(state.active.timerRemaining<=0){
      state.active.timerRunning=false; stopTimer(); signalTimer();
      if(state.active.phase==="rest"){
        state.active.phase="work"; const e=state.active.workout.exercises[state.active.exerciseIndex];
        state.active.timerRemaining=e.type==="timer"||e.type.startsWith("hold")?e.target:null; render();
      } else render();
    }
  },1000);
}
function stopTimer(){if(state.timer){clearInterval(state.timer);state.timer=null;}}
function signalTimer(){const p=getPrefs();if(p.vibration&&navigator.vibrate)navigator.vibrate([120,80,120]);if(p.sound){try{const ctx=new(window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=880;g.gain.value=.08;o.start();o.stop(ctx.currentTime+.18);}catch{}}}

function bestMetric(history,name){let best=0;history.forEach(h=>(h.entries||[]).forEach(e=>{if(e.exercise===name)best=Math.max(best,Number(e.value||0));}));return best;}
function latestTestValue(id){const t=getTests().filter(x=>x.testId===id).sort((a,b)=>new Date(b.date)-new Date(a.date))[0];return t?Number(t.value):0;}
function bestTestValue(id){return getTests().filter(x=>x.testId===id).reduce((m,x)=>Math.max(m,Number(x.value)||0),0);}
function metricValueForSkill(auto){
  if(auto.test) return bestTestValue(auto.test);
  if(auto.exercise) return bestMetric(getHistory(),auto.exercise);
  return 0;
}

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
function xpSummary(){
  const history=getHistory(), training=history.reduce((sum,s)=>sum+sessionXP(s),0);
  const weeks=new Map();
  history.forEach(s=>{const key=mondayWeekKey(s.date),day=new Date(s.date).toDateString();if(!weeks.has(key))weeks.set(key,new Set());weeks.get(key).add(day);});
  const consistentWeeks=[...weeks.values()].filter(days=>days.size>=5).length;
  const consistency=consistentWeeks*100;
  const completedSkills=SKILL_TREES.flatMap(t=>t.levels).filter(skillDone).length;
  const skills=completedSkills*60;
  const uniqueTests=new Set(getTests().map(t=>t.testId)).size;
  const tests=uniqueTests*30;
  return {total:training+consistency+skills+tests,training,consistency,skills,tests,consistentWeeks,completedSkills,uniqueTests};
}
function objectiveProgress(obj){
  let current=0;
  if(obj.type==='sessions')current=getHistory().length;
  else if(obj.type==='test')current=bestTestValue(obj.id);
  else if(obj.type==='exercise')current=bestMetric(getHistory(),obj.name);
  else if(obj.type==='skill')current=skillDoneById(obj.id)?1:0;
  const target=obj.type==='skill'?1:Number(obj.value||1);
  return {current,target,done:current>=target};
}
function evaluateRank(rank){
  const items=(rank.objectives||[]).map(obj=>({obj,...objectiveProgress(obj)}));
  const completed=items.filter(x=>x.done).length;
  return {items,completed,required:rank.requireCount||0,goalsMet:completed>=(rank.requireCount||0)};
}
function getRankState(){
  const xp=xpSummary(); let index=0;
  for(let i=1;i<RANKS.length;i++){
    const ev=evaluateRank(RANKS[i]);
    if(xp.total>=RANKS[i].xpMin&&ev.goalsMet)index=i;else break;
  }
  const current=RANKS[index],next=RANKS[index+1]||null,nextEval=next?evaluateRank(next):null;
  const xpProgress=next?clamp((xp.total-current.xpMin)/Math.max(1,next.xpMin-current.xpMin),0,1):1;
  const goalProgress=next&&nextEval.required?clamp(nextEval.completed/nextEval.required,0,1):1;
  return {xp,current,index,next,nextEval,xpProgress,goalProgress};
}
function objectiveValueText(item){
  if(item.obj.type==='skill')return item.done?'Validé':'À valider';
  const cur=Math.min(item.current,item.target),unit=item.obj.unit?` ${item.obj.unit}`:'';
  return `${Number(cur.toFixed?.(1) ?? cur)} / ${item.target}${unit}`;
}
function renderRankMini(){
  const r=getRankState(),next=r.next;
  return `<section class="card rank-card rank-${r.current.id} rank-mini"><div class="rank-head"><div class="rank-emblem">${r.index+1}</div><div class="grow"><div class="kicker">Rang actuel</div><div class="rank-name">${r.current.name}</div></div><div class="rank-xp"><strong>${r.xp.total.toLocaleString('fr-FR')}</strong><span>XP</span></div></div>${next?`<div class="rank-progress-label"><span>Vers ${next.name}</span><strong>${Math.round(r.xpProgress*100)}% XP</strong></div><div class="rank-progress"><span style="width:${r.xpProgress*100}%"></span></div><div class="rank-nextline">${r.nextEval.completed}/${r.nextEval.required} objectifs de promotion validés</div>`:`<div class="rank-legend-line">Rang maximal atteint · Légende</div>`}</section>`;
}
function renderRankPanel(){
  const r=getRankState(),next=r.next;
  const notice=state.rankUpNotice?`<section class="card rank-up-banner"><div><div class="kicker">Promotion</div><h2>Rang ${state.rankUpNotice} débloqué !</h2><p>Ta régularité et tes performances ont validé ce palier.</p></div><button class="icon-btn" id="dismissRankUp">×</button></section>`:'';
  const roadmap=`<div class="rank-roadmap">${RANKS.map((rank,i)=>`<div class="rank-roadmap-node ${i<r.index?'done':i===r.index?'current':'locked'} rank-${rank.id}"><span>${i<r.index?'✓':i+1}</span><small>${rank.name}</small></div>`).join('')}</div>`;
  if(!next)return `${notice}<section class="card rank-card rank-legend"><div class="rank-head"><div class="rank-emblem">★</div><div class="grow"><div class="kicker">Rang maximal</div><div class="rank-name">Légende</div><p class="muted">Tu as atteint le dernier rang. L’objectif devient de consolider les skills avancés et tes records.</p></div><div class="rank-xp"><strong>${r.xp.total.toLocaleString('fr-FR')}</strong><span>XP</span></div></div>${roadmap}</section>`;
  return `${notice}<section class="card rank-card rank-${r.current.id}"><div class="rank-head"><div class="rank-emblem">${r.index+1}</div><div class="grow"><div class="kicker">Rang actuel</div><div class="rank-name">${r.current.name}</div><p class="muted">Promotion visée : <strong>${next.name}</strong></p></div><div class="rank-xp"><strong>${r.xp.total.toLocaleString('fr-FR')}</strong><span>XP</span></div></div>
    <div class="rank-block"><div class="rank-progress-label"><span>XP vers ${next.name}</span><strong>${r.xp.total.toLocaleString('fr-FR')} / ${next.xpMin.toLocaleString('fr-FR')}</strong></div><div class="rank-progress"><span style="width:${r.xpProgress*100}%"></span></div></div>
    <div class="rank-block"><div class="section-head"><div><div class="kicker">Missions de promotion</div><h2>${r.nextEval.completed}/${r.nextEval.required} requises</h2></div><span class="pill">${r.nextEval.items.filter(x=>x.done).length}/${r.nextEval.items.length} réalisées</span></div><div class="rank-objectives">${r.nextEval.items.map(item=>`<div class="rank-objective ${item.done?'done':''}"><div class="rank-check">${item.done?'✓':'○'}</div><div class="grow"><strong>${item.obj.label}</strong><small>${objectiveValueText(item)}</small></div></div>`).join('')}</div></div>
    <div class="xp-breakdown"><span>Entraînement <strong>${r.xp.training}</strong></span><span>Régularité <strong>${r.xp.consistency}</strong></span><span>Skills <strong>${r.xp.skills}</strong></span><span>Tests <strong>${r.xp.tests}</strong></span></div>
    <p class="muted small">XP : environ 50–110 par séance selon la qualité, +100 pour une semaine avec au moins 5 jours entraînés, +60 par skill validé et +30 par type de test enregistré. Aucun bonus n’incite à supprimer le lundi de repos.</p>${roadmap}</section>`;
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

function renderProgress() {
  const h=getHistory(), seven=Date.now()-7*86400000, recent=h.filter(x=>new Date(x.date).getTime()>=seven);
  const mins=recent.reduce((a,x)=>a+(x.durationMinutes||0),0), avg=recent.length?Math.round(recent.reduce((a,x)=>a+x.score,0)/recent.length):0;
  const tests=getTests(), due=testDueSummary();
  return shell(`<header class="topbar"><div><div class="brand">Progression</div><div class="daylabel">Performances, cycles, volume et adaptation</div></div><button class="btn btn-secondary compact" id="openExerciseLibrary">Exercices</button></header>
    ${renderCycleMini()}
    ${renderRankPanel()}
    ${renderProgressionRecommendations()}
    ${renderQuickVolumePanel()}
    ${renderVolumePanel()}
    ${renderRecordsPanel()}
    <section class="stat-grid"><div class="stat"><div class="stat-value">${recent.length}</div><div class="stat-label">séances / 7 j</div></div><div class="stat"><div class="stat-value">${mins}</div><div class="stat-label">minutes / 7 j</div></div><div class="stat"><div class="stat-value">${avg||'—'}</div><div class="stat-label">score moyen %</div></div><div class="stat"><div class="stat-value">${bestMetric(h,'Dead hang')||'—'}</div><div class="stat-label">best dead hang s</div></div></section>
    <section class="card"><div class="section-head"><div><div class="kicker">Progression intelligente</div><h2>Tendances</h2></div><span class="pill">5 dernières</span></div>${exerciseProgressRows()||'<div class="empty">Termine quelques séances pour voir les tendances.</div>'}</section>
    <section class="card"><div class="section-head"><div><div class="kicker">Tous les 42 jours</div><h2>Tests périodiques</h2></div><span class="pill ${due.overdue?'badge-warn':'badge-success'}">${due.label}</span></div>
      <p class="muted small">Pas besoin d’aller à l’échec absolu : privilégie une exécution propre et arrête si une articulation gêne.</p>
      <div class="test-grid">${TEST_DEFS.map(t=>{const best=bestTestValue(t.id),last=tests.filter(x=>x.testId===t.id).sort((a,b)=>new Date(b.date)-new Date(a.date))[0];return `<button class="test-tile edit-test" data-test="${t.id}"><span>${t.name}</span><strong>${best?best+' '+t.unit:'—'}</strong><small>${last?'Dernier '+formatShortDate(last.date):'À mesurer'}</small></button>`}).join('')}</div>
    </section>
    <section class="card"><h2>Historique</h2>${h.length?h.slice(0,20).map(x=>`<button class="history-item history-button" data-history="${x.id}"><div class="history-top"><div><div class="history-title">${x.name}</div><div class="small muted">${formatDate(x.date)} · ${x.durationMinutes} min · effort ${x.rpe||'—'}/10 · +${sessionXP(x)} XP</div></div><span class="pill ${x.jointDiscomfort?'badge-warn':'badge-success'}">${x.score}%</span></div>${summaryLine(x)}</button>`).join(''):'<div class="empty">Ta première séance terminée apparaîtra ici.</div>'}</section>
    ${state.selectedHistoryId?renderHistoryDetail(state.selectedHistoryId):''}`, "progress");
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
function renderSkills(){const manual=getManualSkills();return shell(`<header class="topbar"><div><div class="brand">Skill tree</div><div class="daylabel">De la base aux mouvements avancés</div></div></header>
  <section class="card"><p class="muted">Les jalons mesurables se valident automatiquement. Les skills techniques avancés peuvent être cochés manuellement quand tu les maîtrises proprement.</p></section>
  ${SKILL_TREES.map(tree=>{let previous=true;return `<section class="card skill-card"><div class="section-head"><h2>${tree.name}</h2><span class="pill">${tree.levels.filter(skillDone).length}/${tree.levels.length}</span></div><div class="skill-path">${tree.levels.map((level,i)=>{const done=skillDone(level),unlocked=previous||done;previous=done;return `<div class="skill-node ${done?'done':unlocked?'available':'locked'}"><div class="skill-dot">${done?'✓':i+1}</div><div class="grow"><strong>${level.name}</strong><small>${level.auto?`Auto · objectif ${level.auto.value}`:'Validation manuelle'}</small></div>${level.manual&&unlocked?`<button class="skill-toggle" data-skill="${level.id}">${manual[level.id]?'Retirer':'Valider'}</button>`:''}</div>`}).join('')}</div></section>`}).join('')}`, "skills");}

function renderProfile(){const logs=getBodyLogs(),p=getPrefs();const latest=logs[0];const latestBf=latest?estimateBodyFat(latest.height,latest.waist,latest.neck):null;return shell(`<header class="topbar"><div><div class="brand">Profil</div><div class="daylabel">Journal physique & réglages</div></div></header>
  <section class="card"><div class="section-head"><div><div class="kicker">Journal physique</div><h2>Mesures</h2></div><button class="btn btn-secondary compact" id="addBody">+ Ajouter</button></div>
    ${logs.length?`<div class="body-summary"><div><span>Poids</span><strong>${latest.weight?latest.weight+' kg':'—'}</strong></div><div><span>Tour de taille</span><strong>${latest.waist?latest.waist+' cm':'—'}</strong></div><div><span>Masse grasse estimée</span><strong>${latestBf?latestBf.toFixed(1)+' %':'—'}</strong></div><div><span>Cou</span><strong>${latest.neck?latest.neck+' cm':'—'}</strong></div></div>${latest.photoId?`<div class="photo-card"><img id="latestBodyPhoto" alt="Photo de progression"><small>Photo enregistrée uniquement sur cet appareil.</small></div>`:''}${renderBodyChart(logs,'weight','kg')}${renderBodyChart(logs,'waist','cm')}<div class="body-history">${logs.slice(0,10).map(l=>{const bf=estimateBodyFat(l.height,l.waist,l.neck);return `<div class="detail-row"><span>${formatDate(l.date)}</span><strong>${l.weight?l.weight+' kg':''}${l.weight&&l.waist?' · ':''}${l.waist?l.waist+' cm':''}${bf?' · '+bf.toFixed(1)+' %':''}${l.photoId?' · 📷':''}</strong></div>`}).join('')}</div>`:'<div class="empty">Ajoute une mesure pour suivre ton évolution.</div>'}
  </section>
  <section class="card"><h2>Coach adaptatif</h2><div class="switchline"><div><strong>Progression intelligente</strong><div class="small muted">Ajuste légèrement les objectifs selon tes dernières séances, ton effort et les gênes articulaires.</div></div><input id="smartPref" type="checkbox" ${p.smartProgression!==false?'checked':''}></div></section>
  <section class="card"><h2>Alertes</h2><div class="switchline"><div><strong>Son du timer</strong><div class="small muted">Bip à la fin d'un chrono</div></div><input id="soundPref" type="checkbox" ${p.sound?'checked':''}></div><div class="switchline"><div><strong>Vibration</strong><div class="small muted">Si le téléphone le permet</div></div><input id="vibrationPref" type="checkbox" ${p.vibration?'checked':''}></div></section>
  <section class="card"><div class="section-head"><div><h2>Tutoriels exercices</h2><p class="muted small">Remplace progressivement les recherches par les vidéos que tu as validées.</p></div><span class="pill">${tutorialStats().exact}/${tutorialStats().total}</span></div><button class="btn btn-secondary" id="manageTutorials">Gérer les tutoriels</button></section>
  <section class="card"><h2>Installer l'application</h2><p class="install-note">Android/Chrome : bouton ci-dessous si disponible. iPhone/Safari : Partager → Ajouter à l'écran d'accueil.</p><button class="btn btn-primary" id="installApp" ${state.deferredInstall?'':'disabled'}>${state.deferredInstall?'Installer':'Installation via le navigateur'}</button></section>
  <section class="card"><div class="kicker">Matériel maison</div><h2>Power Tower + bandes + tapis + sac à dos</h2><div class="equipment-chips">${HOME_EQUIPMENT.map(x=>`<span>${x}</span>`).join('')}</div><p class="muted small">Pas de parallettes ni de gilet lesté. Les exercices lestés utilisent le sac à dos et enregistrent sa charge en kg.</p></section>
  <section class="card"><div class="section-head"><div><div class="kicker">Training Engine</div><h2>Programme & bibliothèque</h2></div><span class="pill">V8.8.3</span></div><button class="btn btn-secondary" id="openExerciseLibrary">Ouvrir la bibliothèque d’exercices</button><div class="divider"></div><strong>Variantes actives</strong>${Object.entries(getExerciseChoices()).length?`<div class="choice-list">${Object.entries(getExerciseChoices()).map(([base,chosen])=>`<div class="choice-row"><span>${base} → <strong>${chosen}</strong></span><button class="btn btn-outline compact reset-choice" data-base="${encodeURIComponent(base)}">Réinitialiser</button></div>`).join('')}</div>`:'<p class="muted small">Aucune progression d’exercice adoptée pour le moment.</p>'}<div class="divider"></div><div class="section-head"><div><strong>Cycle 8 semaines</strong><div class="small muted">Semaine ${getCycleState().week}/8 · ${getCycleState().name}</div></div><button class="btn btn-outline compact" id="resetCycle">Recommencer</button></div></section>
  <section class="card data-card"><div class="section-head"><div><div class="kicker">Sauvegarde</div><h2>Données</h2></div><span class="pill">JSON</span></div><p class="muted small">Avant de changer de téléphone, de navigateur ou de passer sur une nouvelle adresse Vercel, exporte une sauvegarde. Elle contient séances, Quick Logs, progression, réglages et photos.</p><div class="data-actions"><button class="btn btn-primary" id="exportData">Exporter mes données</button><button class="btn btn-secondary" id="importData">Importer une sauvegarde</button><input id="importDataFile" type="file" accept="application/json,.json" hidden></div><p class="install-note">Le fichier reste sur ton appareil : rien n’est envoyé vers un serveur.</p><div class="divider"></div><button class="btn btn-danger" id="clearAllData">Effacer toutes les données</button></section>`, "profile");}

function renderBodyChart(logs,key,unit){const pts=logs.filter(x=>Number(x[key])>0).slice(0,12).reverse();if(pts.length<2)return'';const vals=pts.map(x=>Number(x[key])),min=Math.min(...vals),max=Math.max(...vals),range=Math.max(.5,max-min);const coords=vals.map((v,i)=>{const x=(i/(vals.length-1))*100,y=88-((v-min)/range)*70;return `${x},${y}`}).join(' ');return `<div class="mini-chart"><div class="chart-head"><strong>${key==='weight'?'Poids':'Tour de taille'}</strong><span>${vals[0]} → ${vals[vals.length-1]} ${unit}</span></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Évolution ${key}"><polyline points="${coords}" fill="none" vector-effect="non-scaling-stroke"/></svg></div>`;}
function renderBodyEditor(){const p=getPrefs();return `<main class="shell"><section class="card editor-card"><button class="back-btn" id="closeBody">← Retour</button><div class="kicker">Journal physique</div><h1>Nouvelle mesure</h1><div class="field-grid"><div><label class="field-label">Poids (kg)</label><input class="big-input" id="bodyWeight" type="number" step="0.1" inputmode="decimal" placeholder="ex. 89.5"></div><div><label class="field-label">Tour de taille (cm)</label><input class="big-input" id="bodyWaist" type="number" step="0.1" inputmode="decimal" placeholder="ex. 99"></div><div><label class="field-label">Tour de cou (cm)</label><input class="big-input" id="bodyNeck" type="number" step="0.1" inputmode="decimal" placeholder="ex. 42"></div><div><label class="field-label">Taille (cm)</label><input class="big-input" id="bodyHeight" type="number" step="0.1" inputmode="decimal" value="${p.heightCm||''}" placeholder="ex. 175"></div></div><p class="muted small">Cou + taille + tour de taille permettent une estimation indicative de la masse grasse. Ce n’est pas une mesure médicale.</p><label class="field-label">Photo de progression (facultatif)</label><input class="file-input" id="bodyPhoto" type="file" accept="image/*" capture="environment"><label class="field-label">Note facultative</label><textarea class="textarea" id="bodyNote" placeholder="Sommeil, sensations, contexte…"></textarea><button class="btn btn-primary" id="saveBody">Enregistrer</button></section></main>`;}
async function saveBody(){const weight=Number(document.getElementById('bodyWeight')?.value||0),waist=Number(document.getElementById('bodyWaist')?.value||0),neck=Number(document.getElementById('bodyNeck')?.value||0),height=Number(document.getElementById('bodyHeight')?.value||0);if(weight<=0&&waist<=0&&neck<=0)return;let photoId=null;const file=document.getElementById('bodyPhoto')?.files?.[0];if(file){try{photoId='body-'+Date.now();const blob=await compressPhoto(file);if(blob)await putPhoto(photoId,blob);}catch(e){console.warn('Photo non enregistrée',e);photoId=null;}}const arr=getBodyLogs();arr.unshift({id:Date.now(),date:new Date().toISOString(),weight:weight||null,waist:waist||null,neck:neck||null,height:height||null,photoId,note:document.getElementById('bodyNote')?.value||''});setBodyLogs(arr.slice(0,365));if(height>0){const p=getPrefs();p.heightCm=height;setPrefs(p);}state.bodyEditor=false;state.view='profile';render();}
async function hydrateBodyPhoto(){const img=document.getElementById('latestBodyPhoto');if(!img)return;const latest=getBodyLogs().find(x=>x.photoId);if(!latest)return;try{const blob=await getPhoto(latest.photoId);if(blob){const url=URL.createObjectURL(blob);img.onload=()=>URL.revokeObjectURL(url);img.src=url;}}catch(e){console.warn('Photo indisponible',e);}}

function bindEvents(){
  document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{state.view=b.dataset.view;state.selectedHistoryId=null;render();});
  const openQuick=document.getElementById('openQuickLog');if(openQuick)openQuick.onclick=()=>{state.quickEditor=true;state.quickToast=null;render();};
  document.querySelectorAll('[data-open-quick-log]').forEach(b=>b.onclick=()=>{state.quickEditor=true;state.quickToast=null;render();});
  const closeQuick=document.getElementById('closeQuickLog');if(closeQuick)closeQuick.onclick=()=>{state.quickEditor=false;state.quickToast=null;render();};
  const presetBand=(index,name)=>document.querySelector(`[data-quick-preset="${index}"] .band-choice.active`)?.dataset.bandLabel||lastBandForExercise(name)||defaultBandForExercise(name);
  document.querySelectorAll('.quick-add').forEach(b=>b.onclick=()=>{const name=decodeURIComponent(b.dataset.quickName),type=b.dataset.quickType,index=b.dataset.quickPresetIndex,band=type==='reps_band'?presetBand(index,name):null;addQuickLog(name,Number(b.dataset.quickValue),type,band);});
  document.querySelectorAll('.quick-exact-add').forEach(b=>b.onclick=()=>{const input=document.getElementById(`quickExact_${b.dataset.quickExactIndex}`),value=Number(input?.value||0),name=decodeURIComponent(b.dataset.quickName),type=b.dataset.quickType,index=b.dataset.quickPresetIndex,band=type==='reps_band'?presetBand(index,name):null;if(value>0)addQuickLog(name,value,type,band);});
  document.querySelectorAll('.quick-repeat').forEach(b=>b.onclick=()=>addQuickLog(decodeURIComponent(b.dataset.quickName),Number(b.dataset.quickValue),b.dataset.quickType,b.dataset.quickBand?decodeURIComponent(b.dataset.quickBand):null,Number(b.dataset.quickLoad||0)));
  document.querySelectorAll('.quick-exact-input').forEach(input=>input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();input.parentElement?.querySelector('.quick-exact-add')?.click();}});
  const quickExercise=document.getElementById('quickExercise');
  const updateQuickBand=()=>{if(!quickExercise)return;const type=quickExercise.selectedOptions?.[0]?.dataset.type||exerciseInfo(quickExercise.value)?.prescription?.type||'reps',wrap=document.getElementById('quickBandWrap'),loadWrap=document.getElementById('quickLoadWrap');if(wrap)wrap.hidden=type!=='reps_band';if(loadWrap)loadWrap.hidden=!usesBackpack(quickExercise.value);if(type==='reps_band'){const preferred=lastBandForExercise(quickExercise.value)||defaultBandForExercise(quickExercise.value);state.quickBand=preferred;document.querySelectorAll('#quickBandWrap .band-choice').forEach(x=>x.classList.toggle('active',x.dataset.bandLabel===preferred));}};
  if(quickExercise){quickExercise.onchange=updateQuickBand;updateQuickBand();}
  const saveQuick=document.getElementById('saveQuickCustom');if(saveQuick)saveQuick.onclick=()=>{const name=document.getElementById('quickExercise')?.value,value=Number(document.getElementById('quickValue')?.value||0),info=exerciseInfo(name),type=info?.prescription?.type||'reps';if(value>0)addQuickLog(name,value,type,type==='reps_band'?(state.quickBand||lastBandForExercise(name)||defaultBandForExercise(name)):null,usesBackpack(name)?Number(document.getElementById('quickLoadKg')?.value||0):null);};
  const undoQuick=document.getElementById('undoQuickLog');if(undoQuick)undoQuick.onclick=undoLastQuickLog;
  document.querySelectorAll('[data-energy]').forEach(b=>b.onclick=()=>{state.readinessEditor.energy=Number(b.dataset.energy);render();});
  document.querySelectorAll('[data-soreness]').forEach(b=>b.onclick=()=>{state.readinessEditor.soreness=Number(b.dataset.soreness);render();});
  document.querySelectorAll('[data-joints]').forEach(b=>b.onclick=()=>{state.readinessEditor.joints=b.dataset.joints;render();});
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
  const resetC=document.getElementById('resetCycle');if(resetC)resetC.onclick=()=>{if(confirm('Recommencer un cycle de 8 semaines à partir de cette semaine ?'))resetCycle();};
  const dismissPR=document.getElementById('dismissPR');if(dismissPR)dismissPR.onclick=()=>{state.prNotice=null;render();};
  document.querySelectorAll('[data-flex-toggle]').forEach(b=>b.onclick=()=>{const id=b.dataset.flexToggle;state.expandedFlexRoutine=state.expandedFlexRoutine===id?null:id;render();});
  document.querySelectorAll('.start-flex').forEach(b=>b.onclick=()=>startFlexRoutine(b.dataset.flex));
  document.querySelectorAll('.save-mobility').forEach(b=>b.onclick=()=>saveMobilityTest(b.dataset.test));
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
  const skip=document.getElementById('skipRest');if(skip)skip.onclick=()=>{stopTimer();state.active.phase='work';state.active.timerRunning=false;const e=state.active.workout.exercises[state.active.exerciseIndex];state.active.timerRemaining=e.type==='timer'||e.type.startsWith('hold')?e.target:null;render();};
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
  document.querySelectorAll('.skill-toggle').forEach(b=>b.onclick=()=>{const beforeRank=getRankState().current.id;const m=getManualSkills();m[b.dataset.skill]=!m[b.dataset.skill];setManualSkills(m);const afterRank=getRankState();if(afterRank.current.id!==beforeRank)state.rankUpNotice=afterRank.current.name;render();});
  const addBody=document.getElementById('addBody');if(addBody)addBody.onclick=()=>{state.bodyEditor=true;render();};
  const closeBody=document.getElementById('closeBody');if(closeBody)closeBody.onclick=()=>{state.bodyEditor=false;render();};
  const saveB=document.getElementById('saveBody');if(saveB)saveB.onclick=saveBody;
  const manageT=document.getElementById('manageTutorials');if(manageT)manageT.onclick=()=>{state.tutorialManager=true;render();};
  const closeTM=document.getElementById('closeTutorialManager');if(closeTM)closeTM.onclick=()=>{state.tutorialManager=false;render();};
  document.querySelectorAll('.save-tutorial').forEach(b=>b.onclick=()=>saveTutorialOverride(decodeURIComponent(b.dataset.name),b.dataset.index));
  document.querySelectorAll('.clear-tutorial').forEach(b=>b.onclick=()=>clearTutorialOverride(decodeURIComponent(b.dataset.name)));
  const sound=document.getElementById('soundPref');if(sound)sound.onchange=()=>{const p=getPrefs();p.sound=sound.checked;setPrefs(p);};
  const vib=document.getElementById('vibrationPref');if(vib)vib.onchange=()=>{const p=getPrefs();p.vibration=vib.checked;setPrefs(p);};
  const smart=document.getElementById('smartPref');if(smart)smart.onchange=()=>{const p=getPrefs();p.smartProgression=smart.checked;setPrefs(p);};
  const install=document.getElementById('installApp');if(install&&state.deferredInstall)install.onclick=async()=>{state.deferredInstall.prompt();await state.deferredInstall.userChoice;state.deferredInstall=null;render();};
  const exportBtn=document.getElementById('exportData');if(exportBtn)exportBtn.onclick=exportBackup;
  const importBtn=document.getElementById('importData'),importFile=document.getElementById('importDataFile');if(importBtn&&importFile)importBtn.onclick=()=>importFile.click();if(importFile)importFile.onchange=async()=>{const file=importFile.files?.[0];await importBackupFile(file);importFile.value='';};
  const clear=document.getElementById('clearAllData');if(clear)clear.onclick=async()=>{if(confirm('Effacer historique, tests, skills, mesures et photos ?')){Object.values(STORAGE).forEach(k=>localStorage.removeItem(k));await clearPhotos();render();}};
  if(state.view==='profile'&&!state.bodyEditor)hydrateBodyPhoto();
}
function adjustValue(delta){const input=document.getElementById('valueInput');if(!input)return;const v=Math.max(0,Number(input.value||0)+delta);input.value=v;state.active.currentValue=v;}

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();state.deferredInstall=e;if(state.view==='profile'&&!state.active)render();});
window.addEventListener('appinstalled',()=>{state.deferredInstall=null;});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();
