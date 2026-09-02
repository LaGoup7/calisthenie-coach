# KINETIK v10.140 — Fusion activité Aujourd’hui

## Objectif

Réduire la redondance de la page Aujourd’hui en fusionnant les anciennes surfaces `Charge sportive · 7 jours` et `Volume journalier`, tout en utilisant un vocabulaire immédiatement compréhensible.

## Nouvelle surface

`Activité du jour` présente :

- répétitions ajoutées aujourd’hui ;
- séries rapides aujourd’hui ;
- séances sur 7 jours ;
- minutes de récupération sur 7 jours ;
- temps total d’entraînement récent ;
- un détail repliable pour la répartition par discipline et le volume du jour.

Le score `UA` reste utilisable par les moteurs internes mais n’est plus affiché dans cette surface.

## Action Ajouter

Le CTA `+ Ajouter` ouvre le hub universel déjà utilisé par le FAB. Il ne crée pas une nouvelle logique de saisie.

## Rang

Le renderer final de la page Aujourd’hui applique à nouveau `rank-${current.id}` au raccourci Rang. Les variables `--rank`, `--rank-soft` et `--rank-deep` sont donc correctement résolues. Une règle finale renforce la lisibilité de la palette sur ce raccourci.

## QA

- nouvelle suite `test-today-activity-merge-runtime.js` : 18 contrôles ;
- toutes les suites historiques passent ;
- invariant Vercel Hobby inchangé : 12 fonctions API.
