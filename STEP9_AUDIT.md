# STEP 9 AUDIT · v10.123

## Objectif
Remplacer le rappel global « Tests périodiques » par des échéances indépendantes pour chaque protocole du Centre d’évaluation.

## Protocoles suivis
15 protocoles performance :
- Force : Tractions strictes, Dips stricts.
- Grip : Dead hang, Towel hang, One-arm assisted hang.
- Skills : Chest-to-bar, Muscle-up strict, Handstand libre, L-sit, Front lever, Human flag, HSPU libre, Toes-to-bar.
- Cardio : Test 12 minutes, 5 km.

La mobilité conserve son moteur dédié de l’étape 5.

## Fraîcheur
Chaque protocole a une cadence explicite :
- 42 jours : pullups, dips, dead hang, chest-to-bar, handstand libre, L-sit, toes-to-bar.
- 56 jours : towel hang, one-arm assisted hang, muscle-up, front lever, human flag, HSPU, Cooper 12 min, 5 km.

`protocolFreshness(protocol, now)` expose :
- `state` ;
- `due` ;
- `validatedToday` ;
- `freshnessDays` ;
- `lastDate` ;
- `dueDate` ;
- `daysUntil` ;
- `overdueDays`.

## Source de vérité
Une fraîcheur est remise à zéro uniquement par :
- une évaluation `evidenceLevel >= 3` pour le protocole exact ;
- ou un ancien test périodique `getTests()` correspondant, afin de migrer l’historique existant.

Une donnée simplement déclarée / quick log ne rafraîchit pas un protocole KINETIK.

## Daily Tasks
- Suppression de la tâche globale `tests:periodic:*`.
- Nouvelle tâche : `test:<protocolId>:<date>`.
- CTA `assessment-start` avec le `protocolId` exact.
- Au maximum **un test performance actif par jour**.
- Une validation effectuée aujourd’hui produit une tâche `done` et bloque la proposition d’un second test maximal le même jour.
- Le lendemain, le moteur peut sélectionner le protocole dû suivant.
- Les tâches « bientôt » respectent l’horizon 1–14 jours des réglages de rappels.

## Priorité
Le choix du test actif tient compte de :
- la relation avec l’objectif principal / secondaire ;
- la qualité de preuve actuelle ;
- l’absence de validation ;
- l’ancienneté / retard de l’échéance.

## Report / décisions
Les décisions de l’étape 8 restent protocolaires grâce à la clé sémantique `test:<protocolId>`.
- Reporter Dips n’affecte pas Tractions.
- À la date cible, un test reporté a priorité sur un autre test naturellement dû afin d’éviter deux tests maximaux le même jour.
- Si le protocole reporté est validé avant la date cible, il n’est plus présenté comme tâche pending.

## UX Centre d’évaluation
Chaque ligne affiche désormais sa fraîcheur :
- À confirmer · cadence X j ;
- À re-tester · +N j ;
- Validé aujourd’hui ;
- À jour · re-test dans X j.

## Compatibilité
`testDueSummary()` est conservé pour les anciennes surfaces mais renvoie maintenant le protocole individuel le plus pertinent au lieu d’une échéance globale basée sur le dernier test quelconque.

## Qualité
- `test-step9-runtime.js` : 31 contrôles.
- Non-régression : étapes 3–8.
- Syntaxe : `app.js`, `daily-tasks.js`, `sw.js`.
- Vérifications statiques, HTTP, PWA et ZIP avant livraison.
