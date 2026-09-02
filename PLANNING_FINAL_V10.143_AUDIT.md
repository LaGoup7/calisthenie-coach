# KINETIK v10.143 — Planning finalisation

## Objectif
Finaliser Planning sans ajouter de redondances : montrer quand faire quoi, permettre une adaptation ponctuelle de la semaine et conserver le programme permanent comme source de vérité.

## Changements
- Navigation semaine précédente / suivante + retour « Cette semaine » conservés.
- Heatmap 16 semaines en haut de Calendrier.
- Résumé compact de la semaine : séances réalisées/prévues, minutes d'entraînement et mobilité.
- États visuels des journées et séances : prévue, à faire, faite, Express, partielle, manquée, repos, activité externe.
- Activités externes planifiées/réalisées affichées dans le jour correspondant.
- Menu `•••` sur une séance non réalisée pour la déplacer dans un jour libre de la même semaine.
- Déplacement stocké dans `kinetik_workout_moves_v1`; le cycle permanent n'est jamais modifié.
- Un déplacement est date-aware dans Planning, Aujourd'hui, Daily Tasks, Recovery et la heatmap.
- Une séance déplacée peut être remise à son jour d'origine via « Revenir au programme ».
- L'interface principale du calendrier n'affiche plus l'unité technique `UA`; l'analyse repliée parle d'indice interne.

## Non-objectifs
- Pas d'échange automatique entre deux jours déjà occupés par une séance KINETIK.
- Pas de modification permanente du cycle depuis Calendrier : cela reste dans Programmes.
- Pas de nouvelle Vercel Function.

## QA
- `test-planning-final-runtime.js` : 23 contrôles dédiés.
- Toutes les suites historiques restent exécutées avant packaging.
