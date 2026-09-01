# KINETIK · Parcours utilisateur & rappels

## P0 — parcours quotidien

1. **Moteur central Daily Tasks** — TERMINÉ / v10.115
   - contrat de tâche unique
   - registre de providers
   - séance du jour
   - activités planifiées
   - mesures dues
   - tests périodiques
   - statut inféré depuis les données existantes
   - pont de compatibilité avec les rappels actuels

2. **Unifier poids / taille** — TERMINÉ / v10.116
   - taille = donnée de profil unique
   - poids actuel = dernière mesure corporelle
   - migration automatique des anciennes valeurs
   - suppression de `prefs.heightCm` et `athleteProfile.weight` comme sources concurrentes

3. **Restaurer les réglages Mesures** — TERMINÉ / v10.117
   - panneau Réglages accessible depuis Mesures, même sans historique
   - fréquences poids / tour de taille / bilan complet / photos reconnectées à `bodyTrackingSchedule()` et Daily Tasks
   - objectifs reconnectés à la page Mesures avec progression visible
   - champs suivis réellement appliqués à l'éditeur et aux détails
   - formule US Navy homme / femme / désactivée + source balance / estimation / auto
   - champs personnalisés configurables, saisissables et visibles dans les mensurations détaillées
   - validation des fréquences (1–365 jours) et retour visuel après sauvegarde
   - fallback automatique vers le bilan complet si tous les champs de saisie rapide sont masqués
   - un simple passage en mode « complet » ne valide plus le rappel : au moins 4 champs détaillés doivent être renseignés
   - contrôle qualité automatisé : 17 vérifications (`test-step3-runtime.js`)

4. **Restaurer les réglages Rappels** — TERMINÉ / v10.118
   - panneau reconnecté au renderer final V10.88 des Réglages KINETIK
   - activation générale des rappels intelligents
   - catégories distinctes : séance, activités, mesures, tests, mobilité, récupération
   - migration transparente des anciennes préférences `cc_smart_reminders_v1` vers le schéma v2
   - choix d'affichage : uniquement dû / dû + bientôt à refaire
   - horizon « bientôt » configurable de 1 à 14 jours
   - moment et heure préférés enregistrés pour la future couche de notifications
   - préférences réellement consommées par le Daily Tasks Engine v1.1
   - les fréquences propres aux mensurations restent dans Réglages Mesures afin d'éviter un doublon de configuration
   - contrôle qualité automatisé : 26 vérifications (`test-step4-runtime.js`) + non-régression étape 3 (17 vérifications)

5. **Ajouter Mobilité au moteur** — TERMINÉ / v10.119
   - provider `mobility-assessment` : bilan incomplet, réévaluation après 28 jours, échéance « bientôt » compatible avec l'horizon des rappels
   - provider `mobility-coaching` : routine recommandée selon priorité de zone et progression hebdomadaire
   - distinction automatique `mobility` / `recovery` selon séance KINETIK, jour de repos et sport externe planifié
   - cadence intelligente : objectifs hebdomadaires, espacement depuis la dernière routine et pression de fin de semaine
   - une mobilité planifiée manuellement reste la tâche canonique et bloque le doublon automatique
   - une activité mobilité enregistrée manuellement valide la tâche et compte dans le volume / nombre de séances hebdomadaires
   - métadonnées prêtes pour l'étape 7 : `routineId`, `zoneId`, mode Progression/Recovery, durée et état hebdomadaire
   - contrôle qualité automatisé : 22 vérifications (`test-step5-runtime.js`) + non-régression étapes 3–4

6. **Intégration complète sur Aujourd'hui** — TERMINÉ / v10.120
   - bloc central « À faire aujourd’hui » alimenté exclusivement par le Daily Tasks Engine v1.3
   - hiérarchie automatique par priorité et catégorie
   - progression de journée calculée uniquement sur les tâches dues (les tâches « bientôt » n’entrent pas dans le pourcentage)
   - les tâches terminées quittent automatiquement la liste active et restent accessibles dans un résumé compact « terminées aujourd’hui »
   - états dédiés : agenda libre, journée validée et priorités masquées si les rappels sont désactivés
   - poids / tour de taille / bilan complet / photos savent maintenant déclarer une réalisation effectuée aujourd’hui
   - une évaluation mobilité faite aujourd’hui est validée sans proposer immédiatement une seconde zone le même jour
   - consolidation des anciennes surfaces Aujourd’hui : suppression des doublons mobilité, activités planifiées et tests périodiques
   - contrôle qualité automatisé : 25 vérifications (`test-step6-runtime.js`) + non-régression étapes 3–5

7. **Actions directes**
   - Commencer
   - Mesurer
   - Tester
   - Réaliser

8. **États explicites**
   - fait
   - reporté
   - ignoré
   - historique des décisions

9. **Échéances individuelles des tests**
   - chaque protocole possède sa propre fraîcheur
   - ne plus repousser tous les tests lorsqu'un seul est réalisé

## P1 — notifications locales intelligentes

- heure préférée
- snooze
- relance d'une séance manquée
- rappels de récupération / mobilité

## P2 — notifications système fiables

- Web Push
- planification serveur
- gestion permission et appareils
