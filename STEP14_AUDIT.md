# KINETIK v10.128 · Audit maintenance — nettoyage app.js

## Objectif

Réduire le risque créé par le fichier monolithique `app.js` sans changer les fonctionnalités utilisateur.

## Résultat

- `app.js` avant : 11 044 lignes.
- `app.js` après : environ 4 276 lignes.
- 5 modules de domaine extraits en plus du noyau : adaptive, planning, progress, body, journey.
- 2 anciennes déclarations de fonctions réellement mortes supprimées du noyau (`renderFlexResearch`, `skillTreeProgress`).
- aucune déclaration de fonction dupliquée à l'intérieur d'un même module.
- ordre de chargement explicite dans `index.html`.
- tous les modules ajoutés au cache offline PWA.
- helper de tests `test-app-source.js` pour les suites historiques.
- nouveau `test-step14-runtime.js` : exécution de chaque script séparément dans l'ordre réel du navigateur.

## Compatibilité

Les couches historiques qui fonctionnent comme décorateurs successifs restent volontairement dans leur module de domaine. Elles n'ont pas été fusionnées à l'aveugle, car certaines capturent explicitement la version précédente d'un renderer ou de `bindEvents`.

## Qualité

La validation v10.128 exige :

- syntaxe JS valide pour chaque module séparé ;
- suites étapes 3 à 13 vertes ;
- suite étape 14 verte ;
- présence et ordre des modules dans `index.html` ;
- présence des modules dans le précache du Service Worker ;
- `app.js` sous 5 000 lignes ;
- aucune déclaration de fonction dupliquée à l'intérieur d'un module.
