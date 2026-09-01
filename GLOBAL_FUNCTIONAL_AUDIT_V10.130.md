# KINETIK v10.130 — Audit fonctionnel global

Date : 1 septembre 2026  
Périmètre : v10.130 `KINETIK-v10.130-multidevice-account.zip`  
Nature de l'audit : fonctionnel, données, navigation, réglages, architecture runtime, PWA/API.  
Aucune modification fonctionnelle n'a été appliquée pendant cet audit.

## Résumé exécutif

La v10.130 est stable sur les comportements couverts par les tests : les 430 contrôles fonctionnels existants passent. Le socle Daily Tasks / Planning / Progression / Mesures / Web Push / Compte est cohérent et exploitable.

En revanche, l'audit transversal révèle plusieurs problèmes que les tests historiques ne couvrent pas. Ils proviennent surtout de la coexistence de couches historiques et de redéfinitions de renderers après la modularisation.

**Verdict : ne pas démarrer la synchronisation cloud avant le lot de stabilisation ci-dessous.**

Priorités trouvées :

- **P0 : 6 sujets** à corriger avant Auth/Cloud.
- **P1 : 7 sujets** de cohérence UX/architecture à traiter ensuite.
- **P2 : 4 sujets** de nettoyage et industrialisation.

---

# P0 — À corriger avant Auth / Cloud

## P0.1 — L'ancien éditeur “Test périodique” peut fausser la fraîcheur individuelle

### Constat

Progression > Performance affiche encore une grille `.edit-test` qui ouvre l'ancien `renderTestEditor()`.

`saveTest()` enregistre un test sans `source`. Or `protocolLastValidated()` considère encore les anciennes entrées dont `source` est vide comme des références validées de niveau 3.

Conséquence : saisir manuellement une valeur depuis cet ancien éditeur peut repousser l'échéance d'un protocole alors que l'étape 9 avait justement introduit la règle inverse : seule une validation KINETIK standardisée doit remettre l'horloge à zéro.

### Risque

**Intégrité des données / recommandations incorrectes.**

### Correction recommandée

- supprimer l'ancien `testEditor` du parcours visible ;
- faire pointer tous les boutons de test vers le Centre d'évaluation et le protocole exact ;
- ou, à défaut, enregistrer ces valeurs en `source: 'declared'`, jamais comme référence de fraîcheur ;
- ajouter un test de non-régression : “une saisie libre ne rafraîchit jamais un protocole”.

---

## P0.2 — La sauvegarde n'exporte pas toutes les photos corporelles

### Constat

Les nouveaux bilans stockent :

- `photoIds.front`
- `photoIds.side`
- `photoIds.back`

avec `photoId` conservé seulement comme alias historique de la photo de face.

Mais `exportBackup()` parcourt uniquement `row.photoId`.

### Risque

Une sauvegarde peut restaurer les mensurations et la photo de face tout en **perdant les photos de profil et de dos**.

### Correction recommandée

Exporter tous les IDs retournés par `bodyPhotoId(log, 'front'|'side'|'back')`, avec déduplication.

Ajouter un test export → reset → import vérifiant les trois photos.

---

## P0.3 — L'import “remplace” les données mais laisse les clés absentes intactes

### Constat

L'UI annonce : “Les données actuelles de ce navigateur seront remplacées.”

Pourtant `importBackupFile()` ne supprime pas d'abord toutes les clés exportables. Elle ne modifie que les propriétés présentes dans `backup.data`.

### Exemple

Une ancienne sauvegarde ne contient pas `skillPriorities`, `restrictions` ou `plannedEvents`. Si le navigateur courant possède ces valeurs, elles restent après import.

### Risque

**Mélange silencieux de deux profils / états.** C'est particulièrement problématique avec les préférences cachées décrites ci-dessous.

### Correction recommandée

- avant restauration, supprimer toutes les clés `STORAGE` exportables ;
- restaurer ensuite uniquement le contenu de la sauvegarde ;
- conserver hors import seulement les états explicitement device-only (Push/local notification/account, selon la politique retenue) ;
- faire évoluer `schema` proprement.

Note : le backup annonce encore `version: '10.1'` alors que l'application est en v10.130. Cette version doit devenir une vraie version de format/app et non une constante historique.

---

## P0.4 — “Zones à ménager” est invisible mais continue de modifier les séances

### Constat

`cc_training_restrictions_v1` est toujours utilisé par :

- `activeRestrictionIds()` ;
- `exerciseRestrictionStatus()` ;
- les substitutions ;
- l'adaptation des exercices.

Mais le seul renderer `renderRestrictionSettings()` était injecté par une ancienne version de `renderProfile()`. Le renderer final de `app-progress.js`, chargé après, remplace cette surface : le réglage n'est plus visible.

### Risque

Un utilisateur ayant activé autrefois “épaule”, “poignet”, “genou”… peut continuer à recevoir des substitutions sans disposer d'un moyen visible de comprendre ou désactiver cette préférence permanente.

### Correction recommandée

Restaurer explicitement **Zones à ménager** dans Profil > Modifier ou Réglages > Entraînement, et afficher un indicateur dans Profil lorsqu'au moins une restriction permanente est active.

Ne pas confondre cette préférence permanente avec le readiness ponctuel d'une séance.

---

## P0.5 — Les anciennes “Priorités de skills” sont invisibles mais peuvent encore injecter du volume

### Constat

`cc_skill_priorities_v1` est toujours lu par le moteur. Une priorité `medium/high` peut :

- ajouter un exercice technique ;
- ajouter une série à un exercice existant ;
- influencer le mode Express.

Mais `renderSkillPriorityPanel()` est écrasé par les renderers Skills ultérieurs et n'est plus visible dans la sortie finale.

### Risque

**Deux systèmes d'objectif concurrents :**

1. `athleteProfile.primaryGoal / secondaryGoal` — système moderne ;
2. `skillPriorities` — système historique caché qui modifie encore les séances.

### Correction recommandée

Ne pas simplement remettre l'ancien panneau.

Préférer :

- migrer les priorités pertinentes vers `primaryGoal / secondaryGoal` ;
- supprimer ensuite l'influence de `skillPriorities` sur la prescription ;
- supprimer/migrer `cc_skill_priorities_v1`.

Il doit rester **une seule source de vérité pour les objectifs sportifs**.

---

## P0.6 — Vercel Hobby est déjà à 12/12 fonctions

### Constat

La v10.130 contient exactement :

- Push : 7 fonctions ;
- Strava : 5 fonctions ;
- total : **12 fonctions physiques**.

Le compte KINETIK a dû être ajouté par rewrite vers une fonction existante pour ne pas dépasser le quota.

### Risque

L'étape Auth/Recovery/Cloud n'a actuellement **aucune marge d'API**. Continuer à accrocher de nouvelles responsabilités sur `/api/push/status` rendrait l'architecture difficile à maintenir.

### Correction recommandée avant Auth

Créer un lot “API consolidation” :

- une fonction `/api/push` avec actions `config/status/sync/test/unsubscribe/receipt` ;
- garder éventuellement `/api/push/deliver` séparée pour QStash ;
- consolider Strava en 2–3 fonctions ;
- viser **5 à 7 fonctions physiques maximum** avant d'ajouter l'authentification.

Alternative : passer sur une architecture/framework ou un plan où la limite ne constitue plus le design driver.

---

# P1 — Cohérence produit / UX

## P1.1 — Le réglage de thème existe mais n'est plus accessible

`appTheme` et `applyAppTheme()` fonctionnent encore, mais `renderAppearanceSettings()` est perdu dans la même chaîne de renderers que les restrictions.

Décision recommandée : restaurer Clair / Sombre / Système dans Réglages > Apparence.

---

## P1.2 — Déconnexion Strava inaccessible dans l'UI finale

`disconnectStrava()` et `/api/strava/disconnect` existent encore. L'ancien `renderStravaProfile()` affichait “Déconnecter”, mais ce renderer n'est plus utilisé.

Le Profil final permet seulement de synchroniser Strava.

Recommandation : ajouter “Gérer / Déconnecter” dans Profil > Connexions ou Réglages > Connexions.

---

## P1.3 — Aujourd'hui contient plusieurs CTA qui font la même chose

La page peut cumuler :

- tâche séance dans “À faire aujourd'hui” + hero de séance ;
- bouton “Ajouter” dans le cockpit + FAB global “Ajouter” ;
- bouton “Activité” dans le cockpit + bouton “＋ Activité” dans Activity Hub.

Le moteur Daily Tasks est devenu le cockpit principal, mais l'ancienne couche d'actions est restée en dessous.

Recommandation :

- garder l'Agenda comme statut/action principale ;
- conserver le hero séance pour le contenu détaillé ;
- supprimer un des deux accès “Ajouter” ;
- supprimer un des deux accès “Activité”.

---

## P1.4 — Réglages notifications trop techniques pour la surface principale

La même section contient maintenant :

- catégories ;
- horizon ;
- heure ;
- P1 local ;
- snooze ;
- relance ;
- P2 Web Push ;
- santé Push ;
- acceptée/reçue/ouverte ;
- backoff ;
- export diagnostic ;
- historique des décisions.

Fonctionnellement puissant, mais trop dense.

Recommandation :

**Surface normale** : Notifications ON/OFF, catégories, heure, snooze/relance.  
**Détails appareil** : Web Push + santé.  
**Avancé / Support** : observabilité, backoff, diagnostic export.  
**Historique des décisions** : mieux placé dans “À faire aujourd'hui” ou Données/Journal, pas dans les réglages de notification.

---

## P1.5 — Routage interne devenu confus

Aujourd'hui :

- `athlete`, `profile` et `more` rendent tous le Profil ;
- `settings` appelle une fonction nommée `renderProfile()` ;
- `profile` peut aussi servir de nom d'onglet dans `shell()`.

Cela fonctionne mais a déjà contribué aux écrasements de renderers.

Recommandation : ne conserver que :

- `profile` → Profil sportif ;
- `settings` → Réglages ;
- supprimer les alias historiques `athlete` / `more` après migration des liens.

Renommer `renderProfile()` (réglages) en `renderSettings()`.

---

## P1.6 — Vocabulaire “Taille” ambigu dans Mesures

Plusieurs endroits utilisent “Taille” pour `waist`, alors que le profil utilise “Taille” pour la hauteur corporelle.

Exemples : historique des mesures et fréquence `waistDays`.

Recommandation : toujours écrire **Tour de taille** pour `waist`, et **Taille corporelle** pour `height`.

---

## P1.7 — Apple Santé est affiché comme ligne désactivée sans action

La ligne “Apple Santé — Plus tard” occupe une place permanente dans Profil alors qu'elle ne fait rien.

Recommandation : la retirer de la surface principale jusqu'à ce qu'une intégration réelle existe, ou créer une vraie rubrique “Intégrations à venir” repliée.

---

# P2 — Dette technique / industrialisation

## P2.1 — Chaînes de renderers et d'événements encore trop profondes

Après modularisation, il reste :

- `bindEvents` : **21 couches** ;
- `renderProgressOverview` : 7 définitions/couches ;
- `renderToday` : 6 ;
- `renderWeek` : 6 ;
- `renderSkills` : 6 ;
- `renderProfile` : 4 ;
- etc.

Ce système explique directement la disparition des Restrictions / Apparence / Priorités de skills.

Recommandation : chaque domaine doit finir avec **un renderer final et un binder final**, composés à partir de sous-composants explicites, sans monkey-patching inter-modules.

---

## P2.2 — Code mort notable

Exemples confirmés :

- `renderStravaHomeStatus()` non utilisé ;
- `renderStravaProfile()` non utilisé ;
- `renderEquipmentSetupCard()` utilisé uniquement par une chaîne de renderer désormais écrasée ;
- `renderAthleteTimeline()` non utilisé ;
- plusieurs anciennes implémentations de renderers restent uniquement comme couches historiques.

Recommandation : supprimer après consolidation, puis retirer le CSS associé.

---

## P2.3 — Tests actuels valident surtout les moteurs, pas la disponibilité réelle des fonctions dans l'UI

Les 430 tests passent alors que plusieurs contrôles actifs sont invisibles.

Ajouter une suite “surface contract” qui vérifie le HTML final après **chargement réel de tous les modules dans l'ordre** :

- réglages permanents actifs visibles ;
- toutes les fonctions qui modifient une prescription ont un contrôle utilisateur visible ;
- Strava connecté possède une action de déconnexion ;
- aucune saisie libre ne rafraîchit un Test KINETIK ;
- export/import round-trip complet ;
- aucune route principale aliasée inutilement.

---

## P2.4 — Processus de mise à jour GitHub à sécuriser

Le hotfix Vercel a montré qu'un upload de ZIP par-dessus le dépôt **n'efface pas les anciens fichiers**.

Recommandation :

- utiliser un vrai `git pull / replace / commit` ; ou
- fournir à chaque release un manifeste des fichiers à supprimer ;
- idéalement automatiser un check CI qui compte les fonctions Vercel et détecte les fichiers obsolètes.

---

# Ce qui est sain et à conserver

L'audit confirme que les blocs suivants sont globalement cohérents :

- Daily Tasks comme source centrale du parcours quotidien ;
- statut Fait / Reporté / Ignoré séparé des performances ;
- providers Mesures / Mobilité / Recovery / Planning ;
- tests protocolaires individuels dans le Daily Tasks Engine ;
- séparation Progression → Évaluation → Capacités → Rang ;
- Planning multisport avec prévu vs réalisé ;
- source canonique poids / taille corporelle ;
- Web Push P1/P2 avec fallback et déduplication ;
- santé Push / backoff / reçue-ouverte ;
- séparation compte appareil vs données sportives ;
- révocation et suspension par appareil ;
- modularisation de `app.js` comme première étape de nettoyage.

---

# Ordre de correction recommandé

## Lot A — Intégrité fonctionnelle et données (à faire maintenant)

1. supprimer/rerouter l'ancien éditeur de tests ;
2. corriger export des 3 photos ;
3. rendre l'import réellement remplaçant ;
4. restaurer Zones à ménager ;
5. supprimer/migrer le système caché `skillPriorities` ;
6. restaurer Apparence ;
7. restaurer Déconnecter Strava ;
8. corriger le vocabulaire Tour de taille.

## Lot B — Simplification du parcours

1. dédupliquer les CTA Aujourd'hui ;
2. simplifier Notifications et déplacer les diagnostics en Avancé ;
3. simplifier les routes Profil / Réglages ;
4. retirer Apple Santé tant qu'il n'est pas actif.

## Lot C — Consolidation technique pré-cloud

1. remplacer les 21 wrappers `bindEvents` par des binders de domaine ;
2. consolider les renderers principaux ;
3. supprimer le code mort ;
4. consolider les fonctions Vercel pour revenir largement sous 12 ;
5. ajouter la suite “surface contract” et le round-trip backup.

**Seulement ensuite : Auth / récupération du compte / Cloud Sync.**

---

# Conclusion

La v10.130 n'a pas besoin d'un nouveau grand module fonctionnel immédiatement. Elle a besoin d'un **lot de stabilisation pré-cloud**.

Le problème principal n'est plus le manque de fonctionnalités : c'est que quelques anciens mécanismes continuent d'exister derrière les nouvelles surfaces. Le meilleur prochain chantier est donc de transformer la v10.130 en une base v10.13x où :

- une préférence active est toujours visible ;
- une notion possède une seule source de vérité ;
- un renderer n'est défini qu'une fois ;
- les sauvegardes sont fiables ;
- les API ont de la marge ;
- les tests vérifient également ce que l'utilisateur peut réellement atteindre.
