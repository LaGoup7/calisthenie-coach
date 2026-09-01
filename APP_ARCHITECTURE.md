# KINETIK · Architecture JavaScript v10.128

## Pourquoi ce refactor

`app.js` avait grandi jusqu'à 11 044 lignes et mélangeait données, rendu, planning, progression, Body Map et parcours quotidien. Les évolutions historiques ajoutaient souvent des wrappers successifs autour des renderers et de `bindEvents`, ce qui rendait les régressions difficiles à localiser.

La v10.128 conserve le comportement mais découpe le runtime en scripts classiques chargés dans un ordre explicite.

## Ordre de chargement

1. `app.js` — noyau, stockage, données, helpers et UI fondatrice
2. `app-adaptive.js` — coaching adaptatif, readiness, évaluation et intelligence de progression
3. `app-planning.js` — planning multisport, timers et lisibilité du planning
4. `app-progress.js` — mobilité, progression et couches de coaching produit
5. `app-body.js` — Body Map, anatomie, mesures et cohérence corporelle
6. `app-journey.js` — parcours du jour, actions, décisions et UI notifications
7. `daily-tasks.js` — moteur Daily Tasks
8. `local-reminders.js` — fallback notifications locales
9. `web-push-manager.js` — Web Push P2

Les scripts restent des scripts classiques `defer` afin de préserver l'environnement global historique et l'ordre des patches existants.

## Règles à partir de v10.128

- Ne plus ajouter de nouvelle fonctionnalité produit directement en bas de `app.js`.
- Ajouter la logique dans le module propriétaire du domaine.
- `app.js` doit rester le noyau et viser une diminution progressive, pas une nouvelle croissance.
- Éviter les nouvelles redéfinitions successives de `renderX` / `bindEvents`; préférer une fonction canonique ou un helper dédié dans le module concerné.
- Toute nouvelle extraction doit conserver l'ordre de chargement et passer `test-step14-runtime.js`, qui exécute les fichiers séparément comme le navigateur.
- Toute nouvelle ressource JS obligatoire doit être ajoutée à `index.html` et au précache du Service Worker.

## Dette restante connue

Les couches historiques contiennent encore plusieurs wrappers intentionnels (`renderToday`, `renderProgressOverview`, `bindEvents`, Body Map, etc.). Ils ne sont plus concentrés dans `app.js` et sont désormais isolés par domaine. Leur consolidation peut se faire progressivement lorsque chaque domaine est retravaillé, avec les tests de non-régression existants comme filet de sécurité.
