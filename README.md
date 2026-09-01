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
