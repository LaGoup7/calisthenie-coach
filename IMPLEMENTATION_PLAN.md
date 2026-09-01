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

7. **Actions directes** — TERMINÉ / v10.121
   - contrat d'action enrichi dans Daily Tasks Engine v1.4
   - séance : ouvre directement le sélecteur Complète / Express
   - activité planifiée : ouvre directement le formulaire prévu vs réalisé lié à l'événement
   - poids / tour de taille : ouvre la saisie rapide et cible le champ demandé
   - bilan complet / photos : ouvre directement le bon mode de saisie
   - tests performance : ouvre directement le protocole KINETIK recommandé
   - mobilité / récupération : démarre la routine exacte via `routineId`
   - évaluation mobilité : ouvre la zone concernée et cible le test manquant / le plus ancien
   - fallback `view` conservé pour les tâches terminées et la compatibilité
   - contrôles qualité : 19 vérifications dédiées (`test-step7-runtime.js`) + non-régression étapes 3–6

8. **États explicites** — TERMINÉ / v10.122
   - `Marquer fait` valide l’agenda sans créer de fausse donnée sportive
   - `Reporter` : demain ou date personnalisée, avec report réel de l’occurrence
   - fusion automatique avec une tâche naturelle équivalente à la date de report pour éviter les doublons
   - `Ignorer aujourd’hui` masque uniquement l’occurrence courante
   - toutes les décisions restent annulables depuis Aujourd’hui
   - historique séparé des performances, conservé 180 jours dans Réglages > Rappels
   - journal inclus dans Export / Import / Effacer toutes les données
   - Daily Tasks Engine v1.5.0
   - contrôle qualité automatisé : 30 vérifications (`test-step8-runtime.js`) + non-régression étapes 3–7

9. **Échéances individuelles des tests** — TERMINÉ / v10.123
   - les 15 protocoles performance possèdent une fraîcheur indépendante (42 ou 56 jours selon le protocole)
   - une validation KINETIK ne repousse que le protocole réellement effectué
   - migration des anciens tests périodiques vers la fraîcheur du protocole correspondant
   - une donnée seulement déclarée ne rafraîchit pas un protocole standardisé
   - Daily Tasks propose au maximum un test performance actif par jour pour éviter une batterie de tests successifs
   - priorité selon objectif, ancienneté et qualité de preuve
   - tâches individualisées : id, titre, échéance, CTA et décisions Fait / Reporté / Ignoré propres au protocole
   - un report garde la priorité à la date choisie sans créer de doublon avec un autre test dû
   - si le protocole reporté est finalement validé avant la date cible, il ne revient pas comme tâche en attente
   - le Centre d’évaluation affiche l’état de fraîcheur propre à chaque protocole
   - Daily Tasks Engine v1.6.0
   - contrôle qualité automatisé : 31 vérifications (`test-step9-runtime.js`) + non-régression étapes 3–8

## P1 — notifications locales intelligentes — TERMINÉ / v10.124

10. **Coordinateur de notifications locales** — TERMINÉ / v10.124
   - nouveau module isolé `local-reminders.js`
   - schéma de préférences Rappels v3, rétrocompatible avec P0
   - permission Notification demandée uniquement après action explicite
   - rappel principal à `preferredTime` tant que le runtime PWA reste actif
   - aucune notification système redondante si KINETIK est déjà visible après l'heure cible
   - snooze configurable : 15 / 30 / 60 / 120 min
   - relance d'une séance toujours à faire : au plus tôt 18:00, plafond 21:30
   - réveil tardif : une seule relance pertinente au lieu de deux notifications successives
   - mobilité / récupération héritées directement du Daily Tasks Engine et de ses catégories
   - confidentialité écran verrouillé : contenu discret par défaut, détail opt-in
   - clic notification → ouverture / focus de l'agenda, sans démarrer automatiquement une action métier
   - état de livraison local conservé 14 jours, supprimé par Reset mais exclu des sauvegardes
   - `notificationclick` ajouté au Service Worker
   - frontière P1 explicite : aucune promesse de livraison si la PWA est suspendue ou fermée
   - contrôle qualité automatisé : 35 vérifications (`test-step10-runtime.js`) + non-régression étapes 3–9

## P2 — notifications système fiables

- Web Push
- planification serveur
- gestion permission et appareils
