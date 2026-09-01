# KINETIK v10.120 — Audit étape 6

## Objectif

Faire de **Aujourd’hui** la surface centrale du parcours utilisateur sans dupliquer la logique métier déjà présente dans `daily-tasks.js`.

## Architecture retenue

`daily-tasks.js` passe en **v1.3.0** et ajoute deux API dédiées à l’interface :

- `getAgendaTasks({ includeDone })` : applique les préférences de rappels, l’horizon « bientôt » et les catégories actives tout en conservant le contrat complet des tâches.
- `agendaSummary(tasks)` : calcule `pending`, `done`, `upcoming`, `percent`, `complete` et `empty`.

Les tâches `upcoming` sont volontairement exclues du dénominateur de progression quotidienne.

## Rendu Aujourd’hui

Nouveau composant `renderTodayAgenda()` :

- compteur `fait / total` ;
- barre de progression ;
- liste active triée par le moteur ;
- badge Prioritaire pour les tâches ≥80 ;
- tâches terminées regroupées dans un `details` compact ;
- aperçu « Bientôt » limité à trois éléments ;
- état Journée validée ;
- état Agenda libre ;
- état Priorités masquées lorsque l’interrupteur général des rappels est OFF.

Le composant est injecté par le renderer final v10.120, après toutes les anciennes surcharges de `renderToday()`.

## Déduplication

Les anciennes surfaces suivantes sont neutralisées sur Aujourd’hui :

- `renderTodayMobilityPrompt()` ;
- `renderTodayPlannedEvents()` ;
- la ligne Tests périodiques de `renderTodayUsefulActions()`.

Les informations continuent d’exister via Daily Tasks ; seule leur duplication visuelle est supprimée.

## Validation des tâches terminées

### Mesures corporelles

Le provider Mesures détecte maintenant une réalisation du jour pour :

- poids ;
- tour de taille ;
- bilan complet (au moins 4 mensurations détaillées) ;
- photos (au moins une photo enregistrée).

Une réalisation du jour retourne `status: done`, même si la nouvelle saisie a naturellement repoussé la prochaine échéance.

### Mobilité

Si au moins un test mobilité est enregistré aujourd’hui :

- une tâche `done` est créée pour la zone concernée ;
- aucune nouvelle zone de réévaluation n’est proposée pendant cette même journée.

Cela évite une chaîne infinie de tâches de tests après chaque saisie.

### Tests performance

La batterie historique globale ne passe en `done` que si les cinq repères cœur (hors cardio 12 min optionnel) sont tous enregistrés aujourd’hui. L’étape 9 remplacera cette logique transitoire par des échéances individuelles par protocole.

## Limites volontaires

- Les boutons du bloc ne lancent pas encore directement les éditeurs ou routines : étape 7.
- Aucun stockage `fait / reporté / ignoré` n’est ajouté : étape 8.
- Les tests performance restent encore basés sur l’ancien rappel global : étape 9.

## Contrôle qualité

- `node --check app.js` : OK
- `node --check daily-tasks.js` : OK
- `node --check sw.js` : OK
- étape 3 : 17/17
- étape 4 : 26/26
- étape 5 : 22/22 (attente de version mise à jour vers v1.3.0)
- étape 6 : 25/25

Le test étape 6 couvre notamment : progression à 0 %, validation à 100 %, disparition de la liste active, résumé des tâches terminées, tâches bientôt hors progression, mobilité terminée, rappel général OFF et présence unique du bloc dans le renderer final.
