# KINETIK v10.121 · Audit étape 7 — Actions directes

## Objectif

Éliminer les navigations intermédiaires depuis **À faire aujourd'hui**. Une tâche active doit lancer le flux exact dont l'utilisateur a besoin.

## Contrat d'action v1.4

Le Daily Tasks Engine conserve `type`, `view`, `id`, `label` et `payload`. Les actions actives utilisées en v10.121 sont :

- `workout-start`
- `planned-event`
- `measurement-entry`
- `assessment-start`
- `mobility-routine`
- `mobility-assessment`
- `view` (fallback / compatibilité)

## Routage implémenté

| Tâche | CTA | Exécution |
|---|---|---|
| Séance | Commencer | ouvre le sélecteur Complète / Express du jour |
| Activité planifiée | Enregistrer | ouvre l'éditeur prévu vs réalisé lié au plan |
| Poids | Saisir | ouvre Mesure rapide et cible `weight` |
| Tour de taille | Saisir | ouvre Mesure rapide et cible `waist` |
| Bilan complet | Faire le bilan | ouvre l'éditeur complet |
| Photos | Ajouter les photos | ouvre l'éditeur complet et cible la photo Face |
| Test performance | Faire le test | ouvre le protocole d'évaluation recommandé |
| Routine mobilité | Commencer | appelle directement `startFlexRoutine(routineId)` |
| Recovery | Démarrer | appelle directement la routine recovery sélectionnée |
| Évaluation mobilité | Évaluer / Re-tester | ouvre la bonne zone et cible un test pertinent |

## Mobilité : choix du champ direct

Pour une zone incomplète, le premier test manquant est ciblé. Pour une zone complète mais devenue ancienne, le moteur conserve désormais `oldestTestId` afin de cibler la mesure la plus ancienne au lieu d'ouvrir uniquement la page Mobilité.

## UX

- Les CTA de la liste active portent `data-daily-task-action` et ne dépendent plus de `data-view`.
- Les tâches terminées et les tâches « bientôt » n'affichent pas de CTA actif dans cette surface.
- Le champ directement demandé reçoit un focus et une mise en évidence courte lorsque le DOM le permet.
- `prefers-reduced-motion` désactive l'animation de ciblage.

## Qualité

Suites exécutées :

- `test-step3-runtime.js` : 17/17
- `test-step4-runtime.js` : 26/26
- `test-step5-runtime.js` : 22/22
- `test-step6-runtime.js` : 25/25
- `test-step7-runtime.js` : 19/19

Total : **109 contrôles fonctionnels cumulés**.

Vérifications complémentaires : syntaxe JS, cohérence de version `10.121`, cache PWA, structure du ZIP et service HTTP des assets principaux.

## Limite volontaire

L'étape 7 n'ajoute aucun état persistant « reporté » ou « ignoré ». Ces décisions appartiennent à l'étape 8 afin de ne pas mélanger exécution directe et gestion d'état utilisateur.
