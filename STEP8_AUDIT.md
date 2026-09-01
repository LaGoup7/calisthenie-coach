# STEP 8 AUDIT · v10.122

## Objectif
Ajouter des décisions explicites sur une occurrence Daily Tasks sans falsifier les historiques métier.

## Architecture
- Stockage séparé : `cc_daily_task_decisions_v1`.
- États : `done`, `postponed`, `ignored`.
- Rétention : 180 jours.
- Le moteur applique les décisions après les providers métier.
- Les données réelles (historique de séance, bodyLogs, tests, activités, mobilité) restent les seules sources de performance.

## Règles
### Marquer fait
- Passe l’occurrence de l’agenda à `done`.
- Ajoute `metadata.manualCompletion=true`.
- N’écrit rien dans bodyLogs / historique / tests / activités.

### Reporter
- Date minimale : lendemain.
- Report à demain ou date personnalisée.
- La décision conserve un snapshot de la tâche et son action.
- À la date cible, une tâche métier naturellement équivalente est enrichie avec `deferredFrom` au lieu d’être dupliquée.
- Si aucune tâche naturelle équivalente n’existe, une occurrence reportée synthétique est créée.

### Ignorer
- Masque uniquement l’occurrence courante.
- Ne modifie ni fréquence, ni préférences de catégorie.

## UX Aujourd’hui
- Menu contextuel sur chaque tâche active : Marquer fait / Reporter demain / date personnalisée / Ignorer.
- Section repliable `ajustées aujourd’hui`.
- Annulation possible.
- Les tâches reportées / ignorées sont exclues du dénominateur de progression.
- Une validation manuelle est explicitement marquée `manuel`.

## Historique & sauvegarde
- Historique visible dans Réglages > Rappels.
- `STORAGE.dailyTaskDecisions` ajouté au registre global pour Export / Import / Effacer toutes les données.

## Qualité
- `test-step8-runtime.js` : 30 contrôles.
- Non-régression : étapes 3–7.
- Syntaxe `app.js`, `daily-tasks.js`, `sw.js`.
- Contrôles statiques, HTTP et structure ZIP à effectuer avant packaging final.
