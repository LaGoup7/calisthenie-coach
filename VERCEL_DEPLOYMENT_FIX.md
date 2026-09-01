# KINETIK v10.129 · Vercel Hobby deployment hotfix

## Cause

Vercel Hobby limite à 12 le nombre de Vercel Functions lorsqu'on utilise directement des fichiers sous `api/` sans framework de bundling. La v10.128 exposait 13 fonctions publiques : 7 Push et 6 Strava.

Le build pouvait donc se terminer correctement puis échouer pendant `Deploying outputs...`.

## Correction

- fusion de `api/strava/health.js` dans `api/strava/status.js` ;
- diagnostic accessible via `/api/strava/status?diagnostic=1` ;
- suppression de `api/strava/health.js` ;
- total public : 12 Vercel Functions ;
- helpers Push déplacés de `api/_lib/` vers `lib/` afin qu'ils ne puissent jamais être interprétés comme des fonctions ;
- Node.js épinglé à `24.x` au lieu de `>=20` pour éviter les upgrades majeurs automatiques et les warnings de build ;
- cache PWA et assets passés en v10.129.

## Invariant

Seuls les 12 fichiers `api/push/*.js` et `api/strava/*.js` sont des entrypoints Vercel. Les helpers partagés vivent désormais hors de `api/`, dans `lib/`.


## Invariant v10.130

L’étape multi-appareils n’ajoute aucune fonction physique. `/api/account` utilise un rewrite vers `api/push/status.js`, donc le total reste à 12. `lib/account-core.js` vit hors de `api/`.
