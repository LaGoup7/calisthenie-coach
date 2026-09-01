# KINETIK · Audit étape 5 — Mobilité & Récupération

## Objectif

Faire de la mobilité et de la récupération de vraies sources du `Daily Tasks Engine`, sans doublons et sans afficher une routine tous les jours sans raison.

## Architecture ajoutée

### `mobility-assessment`

- Observe les 12 tests de mobilité existants, regroupés par zones KINETIK.
- Un bilan partiel est considéré comme dû tant que la zone n'est pas complète.
- Une zone complète devient périmée lorsque sa mesure la plus ancienne atteint 28 jours.
- À J-14 ou moins, le provider expose une tâche `upcoming`; le réglage global `due-and-soon` décide si elle est affichée.
- Une seule zone est proposée à la fois. La priorité issue de `mobilityPriority()` gagne lorsqu'elle est elle-même incomplète / ancienne.

### `mobility-coaching`

- Réutilise `recommendedFlexRoutine()`, `mobilityPriority()`, `weeklyFlexBalance()` et `getFlexConfig()`.
- Ne crée pas de tâche si une mobilité a déjà été planifiée manuellement aujourd'hui.
- Considère la routine terminée si une routine Flex KINETIK ou une activité multisport `mobility` a été enregistrée aujourd'hui.
- N'impose plus une routine quand les objectifs hebdomadaires de minutes et de séances sont déjà atteints.
- Cadence : routine due en cas de pression de fin de semaine, après environ 2 jours sans mobilité, ou après environ 1 jour sur un vrai jour de récupération.
- Le type est `recovery` pour un jour sans séance KINETIK et sans sport externe planifié ; sinon il reste `mobility`.

## Correction transversale

`weeklyFlexBalance()` compte désormais les activités multisport de type `mobility` dans `dedicatedMinutes` et `dedicatedSessions`. Elles ne sont volontairement pas attribuées à une zone anatomique précise car elles ne contiennent pas la liste d'exercices.

## Non-objectifs

- Pas encore de CTA démarrant directement une routine : étape 7.
- Pas encore de carte Daily Tasks premium sur Aujourd'hui : étape 6.
- Pas de Web Push : P2.
- La périodicité de 28 jours est actuellement une règle KINETIK fixe ; elle pourra être rendue configurable plus tard si cela apporte une vraie valeur UX.

## Validation

`test-step5-runtime.js` couvre 22 scénarios : providers, baseline manquante, recovery day, métadonnées de routine, absence de doublon planifié, activité mobilité manuelle, classification sport externe, fraîcheur 28 jours, upcoming J-2, horizon de rappel, filtre recovery, objectifs hebdomadaires atteints et texte Réglages.

Les suites précédentes restent vertes :
- étape 3 : 17/17
- étape 4 : 26/26

