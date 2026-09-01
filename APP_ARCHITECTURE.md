# KINETIK · Architecture JavaScript v10.132

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
10. `account-manager.js` — identité local-first, association et état multi-appareils

Les scripts restent des scripts classiques `defer` afin de préserver l'environnement global historique et l'ordre des patches existants.

## Règles à partir de v10.128

- Ne plus ajouter de nouvelle fonctionnalité produit directement en bas de `app.js`.
- Ajouter la logique dans le module propriétaire du domaine.
- `app.js` doit rester le noyau et viser une diminution progressive, pas une nouvelle croissance.
- Éviter les nouvelles redéfinitions successives de `renderX` / `bindEvents`; préférer une fonction canonique ou un helper dédié dans le module concerné.
- Toute nouvelle extraction doit conserver l'ordre de chargement et passer `test-step14-runtime.js`, qui exécute les fichiers séparément comme le navigateur.
- Toute nouvelle ressource JS obligatoire doit être ajoutée à `index.html` et au précache du Service Worker.
- Les fonctions Vercel physiques sous `api/` doivent rester à **12 maximum** sur le plan Hobby actuel. Préférer les rewrites vers une fonction existante ou consolider des routes avant d’ajouter un nouvel entrypoint.
- Les données de compte/appareils ne doivent jamais être mélangées au stockage sportif local (`STORAGE`) sans décision explicite de migration cloud.

## Dette restante connue

Les couches historiques contiennent encore plusieurs wrappers intentionnels (`renderToday`, `renderProgressOverview`, `bindEvents`, Body Map, etc.). Ils ne sont plus concentrés dans `app.js` et sont désormais isolés par domaine. Leur consolidation peut se faire progressivement lorsque chaque domaine est retravaillé, avec les tests de non-régression existants comme filet de sécurité.


## Couche identité v10.130

`account-manager.js` reste séparé de `web-push-manager.js`. Le compte possède une identité appareil propre et ne dépend pas de l’activation des notifications. Lorsqu’un Web Push existe, son installation est seulement **liée** au membre après authentification de son secret Push.

Côté serveur, `lib/account-core.js` partage Redis avec P2 mais ne lit ni n’écrit aucune donnée sportive. `/api/account` est un rewrite Vercel vers la fonction physique `api/push/status.js` avec `scope=account`, ce qui évite une 13e fonction serverless.


## V10.131 · Lot A — intégrité fonctionnelle & données

- ancien éditeur de tests retiré des surfaces actives ; les validations standardisées passent par le Centre d’évaluation ;
- export/import renforcé : trois positions photo sauvegardées et restauration réellement remplaçante ;
- Zones à ménager et Apparence restaurées dans Réglages ;
- ancien moteur Priorités de skills migré vers les objectifs du profil puis neutralisé ;
- Déconnecter Strava restauré dans le profil ;
- libellés de tour de taille désambiguïsés.


## V10.132 · Lot B — simplification des routes et surfaces

- Le routeur principal expose désormais `athlete` pour le Profil et `settings` pour les Réglages. Les aliases historiques `profile` et `more` ne sont plus routés.
- `renderSettings()` est l'entrée publique des Réglages. `renderProfile()` subsiste temporairement comme implémentation interne héritée ; sa consolidation est réservée au LOT C.
- Le renderer Notifications final est possédé par `app-journey.js` et applique une divulgation progressive : contrôles usuels, détails appareil, puis support avancé.
- Le cockpit Aujourd'hui ne doit plus ajouter un second CTA lorsqu'une action canonique existe déjà ailleurs sur la page.
