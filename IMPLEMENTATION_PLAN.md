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

## P2 — notifications système fiables — TERMINÉ / v10.127

11. **Web Push + planification serveur** — TERMINÉ / v10.125
   - abonnement Push API standard lié au Service Worker et à une paire VAPID
   - permission toujours demandée après action explicite ; compatibilité Home Screen iOS/iPadOS
   - nouveau module isolé `web-push-manager.js`
   - manifeste minimal de rappels calculé depuis Daily Tasks sur 60 jours
   - confidentialité : contenu générique et aucun `taskId` exact en mode discret
   - Upstash Redis REST pour l'abonnement/appareil et le manifeste, sans synchroniser les données sportives
   - QStash pour deux schedules timezone-aware maximum : rappel principal + relance séance
   - snooze P2 via message QStash ponctuel
   - endpoint de livraison protégé par `PUSH_DELIVERY_SECRET`
   - identifiant + secret par installation ; seul le hash du secret est stocké côté serveur
   - limitation des nouvelles inscriptions par IP
   - déduplication serveur des livraisons et suppression automatique des abonnements expirés 404/410
   - nettoyage des schedules si un appareil n'existe plus côté Redis
   - le fallback P1 se met automatiquement en veille lorsque P2 est actif
   - import / reset désabonnent le serveur avant de supprimer l'état local ; état appareil exclu des exports
   - nouveau `push` handler dans le Service Worker
   - configuration documentée dans `P2_SETUP.md`
   - contrôle qualité : 44 vérifications (`test-step11-runtime.js`) + toutes les non-régressions P0/P1

12. **Santé des notifications & appareils** — TERMINÉ / v10.126
   - diagnostic local + serveur par installation : permission, PushSubscription, présence serveur, schedules et dernière synchronisation
   - dernière remise acceptée par le service Push, dernier test serveur, dernière erreur et compteur d’échecs consécutifs
   - endpoint authentifié `/api/push/status` : aucune possibilité de consulter un autre appareil sans son secret local
   - détection explicite des abonnements perdus, changements de clé VAPID, appareil serveur absent et identité désynchronisée
   - bouton `Réparer Web Push` : recrée uniquement l’abonnement / l’identité nécessaires puis resynchronise le manifeste
   - en cas d’identité désynchronisée, rotation aussi du PushSubscription afin que l’ancien endpoint s’auto-nettoie en 404/410 et ne crée pas de doublon
   - signal `pushsubscriptionchange` du Service Worker vers les fenêtres KINETIK ouvertes
   - nom d’appareil éditable + métadonnées minimales (plateforme, mode PWA, version), sans synchroniser de données sportives
   - modèle serveur déjà séparé par installation pour préparer le multi-appareils ; aucune liste cross-device sans authentification utilisateur/cloud
   - santé opérationnelle stockée dans l’état appareil, exclue des exports comme le reste de l’état Push
   - contrôle qualité automatisé : 53 vérifications (`test-step12-runtime.js`) + toutes les non-régressions étapes 3–11

13. **Résilience & observabilité P2** — TERMINÉ / v10.127
   - chaîne de livraison observable : acceptée par le service Push → reçue par le Service Worker → ouverte par l’utilisateur
   - reçu signé HMAC par notification ; aucun `deviceSecret` nécessaire dans le Service Worker
   - endpoint `/api/push/receipt` limité aux événements `received` / `opened`, avec anti-rejeu Redis et jeton expirant
   - délai entre émission serveur et ouverture enregistré pour la dernière notification ouverte
   - backoff exponentiel après erreurs temporaires ; plafond selon la classe d’erreur et contournement possible par un test manuel / une réparation
   - une rotation réelle du PushSubscription efface le backoff obsolète
   - endpoint `/api/push/deliver` refuse explicitement de fonctionner si `PUSH_DELIVERY_SECRET` est absent
   - export diagnostic support JSON volontairement expurgé : aucun secret, installationId complet, endpoint Push, manifeste, mesure, photo ou performance
   - UI de santé enrichie avec parcours de la dernière notification et protection/backoff active
   - `web-push-manager.js` v1.2.0
   - contrôle qualité automatisé : 40 vérifications (`test-step13-runtime.js`) + toutes les non-régressions étapes 3–12

## Maintenance architecture — TERMINÉ / v10.128

14. **Nettoyage et modularisation de `app.js`** — TERMINÉ / v10.128
   - réduction du noyau `app.js` de ~11 044 à ~4 276 lignes
   - extraction par domaine : `app-adaptive.js`, `app-planning.js`, `app-progress.js`, `app-body.js`, `app-journey.js`
   - suppression des déclarations mortes réellement dupliquées dans le noyau
   - ordre de chargement explicite et précache PWA de tous les modules
   - suites historiques adaptées via `test-app-source.js`
   - nouveau test d'exécution séparée des scripts, identique au mode de chargement navigateur
   - architecture et règles de contribution documentées dans `APP_ARCHITECTURE.md`

## Suite recommandée

15. **Identité utilisateur & multi-appareils** — TERMINÉ / v10.130
   - compte KINETIK local-first sans email : identité pseudonyme contrôlée par les appareils liés
   - code d’association aléatoire à usage unique, valable 10 minutes, avec rate-limit serveur
   - rattachement jusqu’à 8 installations à un même compte
   - chaque appareil conserve son propre secret ; seul son hash SHA-256 est stocké côté serveur
   - liste cross-device authentifiée : nom, plateforme, PWA/navigateur, dernière présence et état Push minimal
   - révocation d’un appareil perdu depuis un autre appareil ; suppression immédiate de son record Push et de ses schedules
   - marqueur serveur empêchant un appareil révoqué de recréer automatiquement son ancien Web Push
   - suspension / réactivation des rappels par appareil, appliquée côté livraison sans modifier les données sportives
   - association Push au compte vérifiée avec le secret du device Push ; impossible de rattacher arbitrairement un endpoint deviné
   - aucune nouvelle Vercel Function : `/api/account` est un rewrite vers `/api/push/status?scope=account`, donc le total Hobby reste à 12
   - aucun historique sportif, mesure, photo, performance ou note synchronisé
   - identité compte exclue des exports sportifs ; `Effacer toutes les données` dissocie proprement l’appareil avant nettoyage
   - limite explicite de cette première identité : sans email/passkey, perdre tous les appareils liés signifie perdre l’accès au compte


## Hotfix déploiement — v10.129

- **Hotfix Vercel Hobby** — TERMINÉ / v10.129
  - réduction de 13 à 12 fonctions publiques ;
  - fusion diagnostic Strava dans `/api/strava/status?diagnostic=1` ;
  - Node.js épinglé à `24.x`.


## V10.130 · Étape 15 — Compte KINETIK & multi-appareils

Le compte KINETIK regroupe uniquement les installations et leurs préférences de notifications. Il ne synchronise aucune donnée sportive. L’association d’un nouvel appareil utilise un code à usage unique valable 10 minutes. La couche serveur réutilise Upstash Redis et la fonction `/api/push/status` via rewrite afin de respecter la limite de 12 fonctions Vercel Hobby.


## V10.131 · Lot A — intégrité fonctionnelle & données

- ancien éditeur de tests retiré des surfaces actives ; les validations standardisées passent par le Centre d’évaluation ;
- export/import renforcé : trois positions photo sauvegardées et restauration réellement remplaçante ;
- Zones à ménager et Apparence restaurées dans Réglages ;
- ancien moteur Priorités de skills migré vers les objectifs du profil puis neutralisé ;
- Déconnecter Strava restauré dans le profil ;
- libellés de tour de taille désambiguïsés.

## Stabilisation pré-cloud — LOT A · TERMINÉ / v10.131

- intégrité des tests standardisés ;
- sauvegarde 3 photos + import replacement ;
- retour Zones à ménager et Apparence ;
- migration puis neutralisation des Priorités de skills historiques ;
- retour Déconnecter Strava ;
- désambiguïsation Tour de taille ;
- 457 contrôles fonctionnels cumulés.

LOT A terminé en v10.131. Le LOT B est désormais également terminé en v10.132 ; la prochaine étape est le LOT C — consolidation architecture pré-cloud.

## Stabilisation pré-cloud — LOT B · TERMINÉ / v10.132

- déduplication des CTA de la page Aujourd'hui ;
- notifications restructurées en surface principale + Détails appareil + Avancé & support ;
- historique des décisions déplacé vers Données → Journal du parcours ;
- routes Profil/Réglages simplifiées : `athlete` + `settings`, aliases `profile/more` retirés du routeur actif ;
- `renderSettings()` devient l'entrée explicite des Réglages ;
- Apple Santé retiré des connexions tant que l'intégration n'est pas réelle ;
- invariant Vercel Hobby maintenu à 12 fonctions ;
- contrôle UX dédié via `test-lot-b-runtime.js`.

Étape suivante recommandée : **LOT C — consolidation technique pré-cloud** (binders/renderers, code mort, consolidation des fonctions Vercel, surface-contract tests et round-trip backup complet).


## Hotfix UX — v10.133

- correction de l’ordre de la page Aujourd’hui : hero séance avant l’Agenda ;
- restauration de l’accès Gainage (chronomètre + routines) ;
- sélecteurs d’injection du cockpit rendus robustes aux classes additionnelles ;
- aucune modification des règles Daily Tasks / Planning / Progression.


### V10.135 — Hub Ajouter premium
- Hub Ajouter hiérarchisé autour de 4 intentions.
- Sports fréquents remontés automatiquement.
- Reprise de la dernière activité avec préremplissage.
- Accès secondaire à toutes les disciplines.
- Planification accessible depuis le même hub.

### V10.136 — Favoris Enregistrement rapide ✅
- jusqu'à 8 exercices rapides configurables ;
- gestion intégrée (recherche, catégories, étoile, ordre) ;
- suggestions triées selon l'usage sur 90 jours ;
- dernière valeur + valeurs rapides + saisie exacte ;
- bandes conservées pour les mouvements assistés ;
- stockage `cc_quick_favorites_v1` inclus dans backup/import.

### V10.137 — Journal Quick Log & lisibilité bandes ✅
- Bandes favorites compactées et adaptées aux cartes étroites.
- Journal des derniers Quick Logs avec suppression ciblée par ligne.
- Ancien undo-last retiré de l'interface.
- Aucun changement du moteur de progression ou de la limite Vercel.


## V10.138 — Favoris Quick Log paramétrables — TERMINÉ
- 3 valeurs rapides personnalisables par exercice favori.
- Valeur exacte conservée.
- Recherche exercice/favoris réparée et normalisée.
- Préférences incluses dans la sauvegarde locale.
