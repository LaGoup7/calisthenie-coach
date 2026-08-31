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
