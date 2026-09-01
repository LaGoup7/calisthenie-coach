# KINETIK · v10.23 — Progress & Guided Preview

Refonte UI globale basée sur V10.1, sans changement du moteur d’entraînement ni des données.

## Principales évolutions
- Design system commun clair/sombre : couleurs, surfaces, espacements, rayons, typographie, boutons et formulaires.
- Thème sombre entièrement harmonisé, sans cartes claires résiduelles.
- Navigation principale redessinée avec icônes vectorielles cohérentes et état actif plus discret.
- Accueil plus éditorial : hero simplifié, métadonnées sans badges lourds, cockpit plus calme.
- Plus : grille d’outils plus premium et icônes homogènes.
- Semaine, Progrès, Skills, Flexibilité, Mesures, Setup, bibliothèque et coach guidé alignés sur le même langage visuel.
- Bottom nav et bouton Ajouter revus pour iPhone.
- Responsive desktop élargi sans étirer excessivement les contenus.
- Animations courtes et respect de prefers-reduced-motion.
- Cache PWA : `calisthenie-coach-v10-3-progress-preview`.

Le ZIP root peut être envoyé directement à la racine GitHub/Vercel.


## V10.95
- Refonte de Progression > Vue d’ensemble avec un corps humain interactif.
- Lecture simplifiée par zones, avec modes Vue d’ensemble / Force / Mobilité et switch Face / Dos.
- Réduction du texte au profit d’un résumé visuel et de raccourcis clairs.


## V10.96
- Correctif : le corps humain de Progression > Vue d’ensemble est maintenant le renderer final et ne peut plus être écrasé par un ancien override.
- Cache PWA incrémenté pour forcer le chargement de la nouvelle interface.


## V10.97
- Suppression du bloc explicatif « Comment KINETIK mesure ton niveau » dans Progression > Vue d’ensemble.
- Le corps humain reste le repère visuel principal.


## V10.98
- Correctif critique de déploiement : index.html, app.js, styles.css et vercel.json sont de nouveau à la racine du ZIP.
- Le ZIP v10.96/v10.97 contenait par erreur un dossier parent supplémentaire, pouvant produire une page blanche sur Vercel.
- Cache PWA incrémenté pour forcer le rechargement des bons fichiers.


## V10.100
- Corps humain V2 : silhouette plus anatomique et zones mieux séparées.
- Correction importante : absence de données ≠ 0/100.
- Ajout de la confiance par zone : aucune / faible / moyenne / élevée.
- Panneau zone enrichi avec les données qui alimentent le score.
- Nouveau statut « Données limitées » pour éviter de classer trop vite une zone comme faible.


## V10.102
- Body Map V3 : silhouette plus naturelle et continue.
- Zones musculaires mieux intégrées à la silhouette, face et dos.
- Sélection conservée avec halo violet, score et confiance inchangés.
- Cache PWA et versions des assets passés à 10.102.


## V10.103 — Body Map V5
- Silhouette humaine neutre et continue, séparée de la heatmap de données.
- Les zones peu fiables restent gris-bleu au lieu de simuler une faiblesse anatomique précise.
- Confiance basée sur couverture des données + niveau de preuve (déclaré / séance / test).
- Panneau de droite : niveau provisoire, données disponibles, données manquantes et CTA pour compléter la zone.
- Corps agrandi et simplification des contours pour supprimer l’effet mannequin articulé.


## V10.104
- Body Map V6 : silhouette humaine anatomique stylisée, plus proche d’un vrai corps.
- Base corporelle neutre continue et overlays de données séparés.
- Proportions, torse, bras, mains, bassin, cuisses, mollets et pieds redessinés.
- Conservation de la logique V5 : faible confiance = couleur neutre/bleutée, pas de faux diagnostic visuel.


## V10.105
- Body Map Premium V7 : silhouette athlétique entièrement redessinée.
- Base corporelle neutre distincte des overlays de données.
- Proportions plus humaines : tête, cou, cage thoracique, bassin, bras, mains, cuisses, mollets et pieds.
- Anatomie discrète face/dos et overlays mieux ajustés aux volumes du corps.
- Données limitées rendues par hachure indigo subtile au lieu d'une fausse couleur de niveau.
- Zone sélectionnée renforcée et zones secondaires atténuées.


## V10.106
- Correction ciblée du Body Map Premium : overlays bras/avant-bras/poignets réalignés sur la silhouette.
- Les biceps/triceps suivent maintenant le contour du bras jusqu’au coude.
- Les avant-bras démarrent au coude anatomique et suivent le shell jusqu’au poignet.
- Les mains/poignets sont recentrés sur la silhouette réelle.
- Deltoïdes légèrement resserrés pour supprimer l’effet de zones flottantes.


## V10.107 — Body Map 3D Beta
- Nouveau mode 3D avec rotation libre à 360° souris/tactile.
- Modèle athlétique 3D procédural construit avec Three.js.
- Zones KINETIK cliquables : épaules, poitrine, dos, bras, avant-bras, poignets, core, hanches, quadriceps, ischios, mollets et chevilles.
- Les mêmes scores/confiances/états que la Body Map 2D pilotent les couleurs 3D.
- Face/Dos recentrent le modèle ; molette = zoom léger.
- Toggle 2D / 3D. La Body Map SVG V7 reste le fallback si Three.js/WebGL n’est pas disponible.
- Three.js 0.160.1 chargé depuis cdnjs dans index.html.


## V10.108
- Correctif critique : la page Progression utilisait encore le renderer Body Map V7 2D.
- Le renderer V10.107 3D est maintenant réellement autoritaire.
- Le sélecteur 2D / 3D doit désormais être visible.
- Le mode 3D reste le mode par défaut, avec fallback 2D si Three.js/WebGL est indisponible.


## V10.109
- Remplacement de la zone générique « Bras » par deux zones dédiées : Biceps et Triceps.
- Ajout d’une zone Trapèzes distincte dans la vue d’ensemble du corps.
- Le body map 2D premium et le body map 3D utilisent maintenant ces nouvelles zones.
- Les cartes de détail, priorités et points forts utilisent les mêmes nouvelles zones.


## V10.110 — Référentiel corporel unifié
- Audit complet des grandes zones anatomiques utilisées par KINETIK.
- Trapèzes ajoutés au moteur de volume musculaire et à la bibliothèque d’exercices concernés.
- Fessiers ajoutés comme zone corporelle distincte sur la vue dos 2D/3D.
- Grip conservé comme métrique fonctionnelle, avec libellé anatomique Avant-bras / Grip dans les vues de volume.
- Hanches ajoutées aux zones à ménager / readiness et au mapping de stress des exercices.
- Mesures de bras clarifiées comme circonférence biceps + triceps.
- Fléchisseurs de hanche et adducteurs restent des sous-zones mobilité dédiées, déjà suivies dans Mobilité.
- Audit développeur disponible via window.__KINETIK_BODY_AUDIT__.


## V10.111 — Body System Consistency
- Dernier nettoyage transversal du référentiel corporel.
- Pectoraux ajoutés au référentiel canonique Mobilité (le moteur les suivait déjà).
- Objectifs de mensurations Bras G/D renommés en Bras gauche/droit (biceps + triceps).
- Volume utilisateur : Core devient Core / Abdos / Lombaires, Dos devient Dos / Dorsaux, Grip devient Avant-bras / Grip.
- Les cartes du Body Map indiquent maintenant explicitement si le score est une estimation dérivée, une mesure de mobilité ou une lecture combinée.
- Pas de faux score séparé épaule gauche/droite en force sans données unilatérales.
- Audit transversal développeur exposé dans window.__KINETIK_BODY_SYSTEM_AUDIT__.


## V10.112 — Body 3D dezoom
- Vue 3D légèrement dézoomée pour mieux voir l’ensemble du corps.
- Caméra reculée et légèrement recentrée verticalement.
- Limites de zoom molette ajustées pour conserver plus de recul par défaut.
- Petit ajustement de framing sur mobile.


## V10.113 — Body 3D encore plus dézoomé
- Recul supplémentaire de la caméra sur la vue 3D.
- Recentrage vertical léger pour garder la silhouette entière plus lisible.
- Molette de zoom ajustée pour rester cohérente avec le nouveau cadrage.


## V10.114 — Body 3D framing
- Correctif sur le renderer 3D réellement autoritaire.
- Modèle réellement plus dézoomé par défaut (caméra Z 9.85).
- Recentrage vertical léger pour afficher tête et pieds avec davantage de marge.
- Limites de zoom molette recalibrées autour du nouveau cadrage.

## V10.115 — Daily Tasks Engine
- Nouveau moteur central `daily-tasks.js` pour répondre à « Que dois-je faire aujourd'hui ? ».
- Contrat de tâche normalisé : id, type, statut, priorité, échéance, action et source.
- Providers initiaux : séance du jour, activités planifiées, mesures dues et tests périodiques.
- Les tâches terminées sont déduites des données existantes ; aucun stockage parallèle n'est créé à ce stade.
- Pont de compatibilité : les anciens rappels locaux consomment désormais le moteur central.
- API développeur : `window.KinetikDailyTasks`, `getDailyTasks()` et `getDailyTaskSummary()`.
- Plan complet du chantier disponible dans `IMPLEMENTATION_PLAN.md`.


## v10.116 · Étape 2 — anthropométrie canonique

- La taille courante est stockée uniquement dans le profil athlète (`athleteProfile.height`).
- Le poids courant provient uniquement du dernier relevé `bodyLogs` contenant un poids.
- L'ancien `athleteProfile.weight` est migré vers un relevé si aucun historique de poids n'existe.
- L'ancien `prefs.heightCm` est migré vers le profil puis supprimé.
- Les tailles présentes dans les anciens relevés restent des snapshots historiques pour reproduire les anciens calculs IMC / masse grasse.
- Modifier le poids depuis Profil écrit désormais un relevé de Mesures au lieu d'une deuxième valeur indépendante.


## v10.117 · Étape 3 — réglages Mesures restaurés

- Le panneau **Réglages des mesures** est de nouveau accessible directement depuis la page Mesures, y compris avant le premier relevé.
- Les fréquences poids / tour de taille / bilan complet / photos sont modifiables et continuent d'alimenter `bodyTrackingSchedule()` puis le Daily Tasks Engine.
- Les objectifs corporels configurés sont de nouveau visibles sur la page Mesures avec une progression calculée à partir de l'historique.
- Les champs suivis peuvent être masqués dans l'éditeur ; si aucun champ rapide ne reste actif, KINETIK ouvre automatiquement le bilan complet.
- Les réglages de composition corporelle (US Navy homme/femme/off + source balance/estimation/auto) sont restaurés et persistés.
- Les champs personnalisés sont configurables, saisissables et désormais affichés dans les mensurations détaillées avec leur évolution.
- Les fréquences sont bornées entre 1 et 365 jours et le panneau reste ouvert avec confirmation après sauvegarde.
- Le rappel « bilan complet » n’est plus considéré comme réalisé simplement parce que le formulaire complet a été ouvert : il faut au moins 4 mensurations détaillées renseignées.
- Cache PWA et assets incrémentés en `10.117`.
- Contrôle automatique : `test-step3-runtime.js` couvre 17 points fonctionnels. Voir `STEP3_AUDIT.md`.

## V10.118 · Étape 4 — Réglages Rappels
- Restauration des rappels dans le renderer final **Réglages KINETIK** (la refonte V10.88 écrasait l'ancien panneau).
- Nouveau schéma de préférences de rappels v2, compatible avec les données existantes.
- Interrupteur général et catégories séparées : séance, activités, mesures, tests, mobilité, récupération.
- Nouveau filtre d'affichage : uniquement les échéances dues, ou échéances dues + éléments bientôt à refaire.
- Horizon « bientôt » configurable de 1 à 14 jours.
- Moment préféré (matin / après-midi / soir / personnalisé) et heure préférée sauvegardés pour les futures notifications.
- Le Daily Tasks Engine passe en **v1.1.0** et applique désormais toutes les catégories de rappel ainsi que l'horizon des tâches à venir.
- Les fréquences de poids / tour de taille / bilan / photos restent centralisées dans **Mesures > Réglages** : aucun second réglage concurrent n'est créé.
- Limite volontaire : l'heure préférée ne programme pas encore de notification quand l'app est fermée ; elle prépare P1/P2 et n'empêche jamais une tâche due d'apparaître dans l'app.
- Cache PWA : `kinetik-v10-118-reminder-settings`.
- Tests : `test-step4-runtime.js` (26 contrôles) + suite étape 3 (17 contrôles).


## V10.119 · Étape 5 — Mobilité & Récupération dans Daily Tasks
- Le Daily Tasks Engine passe en **v1.2.0** avec deux nouveaux providers : `mobility-assessment` et `mobility-coaching`.
- Les tests de mobilité sont suivis par zone ; un bilan incomplet est proposé à compléter et une zone devient à réévaluer après **28 jours**.
- Entre J-14 et l'échéance, la réévaluation peut apparaître en « bientôt » si cette option est activée dans les réglages de rappels.
- Une seule zone de mobilité est proposée à réévaluer à la fois, en donnant la priorité à la zone la plus utile pour l'objectif / la séance du jour.
- Les routines automatiques respectent les objectifs `weeklyMinutesTarget` et `sessionsTarget`, l'espacement depuis la dernière routine et la pression de fin de semaine.
- Les jours sans séance KINETIK deviennent des tâches **Récupération** ; un sport externe planifié empêche de classer à tort la journée comme repos pur.
- Une mobilité planifiée manuellement conserve la priorité et supprime la recommandation automatique du même jour.
- Une activité `mobility` enregistrée depuis le journal multisport compte désormais dans le volume et le nombre de séances mobilité de la semaine, et valide le rappel automatique du jour.
- Les tâches exposent déjà `routineId`, `zoneId`, durée et mode Progression/Recovery pour les actions directes de l'étape 7.
- Cache PWA : `kinetik-v10-119-mobility-recovery`.
- Tests : `test-step5-runtime.js` (22 contrôles), plus non-régression étape 3 (17) et étape 4 (26).


## V10.120 · Étape 6 — « À faire aujourd’hui »
- Le Daily Tasks Engine passe en **v1.3.0** et expose `getAgendaTasks()` + `agendaSummary()` pour alimenter une seule surface de parcours quotidien.
- La page **Aujourd’hui** possède maintenant un bloc central **À faire aujourd’hui** avec nombre de tâches restantes, pourcentage terminé et hiérarchie de priorité.
- Le pourcentage ne compte que les tâches réellement dues ; les éléments **Bientôt** sont affichés séparément et ne peuvent pas dégrader la progression du jour.
- Une tâche réellement terminée disparaît de la liste active et alimente le résumé repliable **terminées aujourd’hui**.
- Les mesures corporelles savent désormais reconnaître une saisie faite le jour même : poids, tour de taille, bilan complet (≥4 mensurations détaillées) et photos.
- Un test mobilité saisi aujourd’hui crée un état terminé et empêche KINETIK d’enchaîner immédiatement avec une deuxième zone à réévaluer le même jour.
- Le vieux prompt mobilité, le bloc séparé d’activités planifiées et la ligne Tests périodiques de « Prochaines actions utiles » sont supprimés de l’accueil afin d’éviter les doublons avec Daily Tasks.
- États UX ajoutés : **À faire aujourd’hui**, **Journée validée**, **Agenda libre** et **Priorités masquées**.
- Les actions restent volontairement des navigations vers les écrans existants ; les CTA directs Commencer / Mesurer / Tester / Réaliser seront traités à l’étape 7.
- Cache PWA : `kinetik-v10-120-today-agenda`.
- Tests : `test-step6-runtime.js` (25 contrôles), plus non-régression étapes 3 (17), 4 (26) et 5 (22).


## V10.121 · Étape 7 — Actions directes depuis « À faire aujourd’hui »
- Le Daily Tasks Engine passe en **v1.4.0** et les tâches exposent désormais des actions exécutables, pas seulement des destinations de navigation.
- **Séance** : `Commencer` ouvre directement le choix Complète / Express de la séance du jour.
- **Activité planifiée** : `Enregistrer` ouvre directement l'éditeur « prévu vs réalisé » du planning concerné grâce à son `plannedEventId`.
- **Poids / tour de taille** : `Saisir` ouvre la mesure rapide et cible le champ demandé.
- **Bilan complet** : `Faire le bilan` ouvre directement l'éditeur complet.
- **Photos** : `Ajouter les photos` ouvre le bilan complet et cible la première entrée photo.
- **Tests performance** : `Faire le test` ouvre directement le protocole KINETIK actuellement recommandé par le Centre d'évaluation.
- **Mobilité / récupération** : le CTA démarre immédiatement la routine exacte fournie par `routineId`, sans passage par la bibliothèque Mobilité.
- **Évaluation mobilité** : KINETIK ouvre la zone concernée et cible en priorité le test manquant ; pour une réévaluation complète, il cible le test le plus ancien de la zone.
- Les tâches `done` et `upcoming` n'affichent pas de CTA direct dans la liste active ; le fallback de navigation générique reste disponible pour la compatibilité interne.
- API développeur : `window.executeTodayAgendaTask(task)` et `window.executeTodayAgendaTaskById(id)`.
- Cache PWA : `kinetik-v10-121-direct-actions`.
- Tests : `test-step7-runtime.js` (19 contrôles), plus non-régression étapes 3 (17), 4 (26), 5 (22) et 6 (25).
