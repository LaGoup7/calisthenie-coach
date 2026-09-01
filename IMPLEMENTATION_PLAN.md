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

4. **Restaurer les réglages Rappels**
   - activation générale
   - catégories
   - préférences de fréquence / moment

5. **Ajouter Mobilité au moteur**
   - routines recommandées
   - tests de mobilité devenus anciens
   - récupération / jour de repos

6. **Intégration complète sur Aujourd'hui**
   - bloc À faire aujourd'hui
   - hiérarchie de priorité
   - progression de journée

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
