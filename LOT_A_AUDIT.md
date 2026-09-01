# KINETIK v10.131 — LOT A · Intégrité fonctionnelle & données

## Objectif

Corriger les incohérences P0/P1 identifiées par l’audit fonctionnel global v10.130 avant d’introduire authentification et synchronisation cloud. Ce lot ne crée aucune nouvelle donnée cloud et ne modifie pas l’architecture Web Push / compte multi-appareils.

## 1. Tests standardisés : une seule porte d’entrée

- Les tuiles éditables de l’ancien module « Tests périodiques » ont été retirées de la surface Performance active.
- Performance renvoie désormais vers le **Centre d’évaluation KINETIK**.
- Une séance ou un Quick Log reste une référence de performance mais ne devient pas automatiquement une validation standardisée.
- Le renderer, l’état et les bindings de l’ancien éditeur manuel ont été retirés du runtime actif.
- Les anciennes entrées historiques sans `source` restent compatibles avec la migration de l’étape 9.

## 2. Sauvegarde des photos

L’export parcourt désormais les trois positions :

- `photoIds.front`
- `photoIds.side`
- `photoIds.back`

Le champ historique `photoId` reste pris en charge comme fallback de la photo de face.

Le format de sauvegarde passe à `schema: 2` et porte la version `10.131`.

## 3. Import réellement remplaçant

Une restauration est désormais un **replacement** de l’ensemble des données sportives/application exportables :

1. arrêt de l’état Web Push local ;
2. suppression de toutes les clés exportables existantes ;
3. restauration uniquement des clés présentes dans la sauvegarde ;
4. purge puis restauration des photos.

Une clé absente du backup ne survit plus silencieusement depuis l’installation courante.

Les identités spécifiques à l’appareil restent volontairement hors du backup :

- état de livraison local ;
- identité Web Push ;
- compte KINETIK multi-appareils.

## 4. Zones à ménager restaurées

La section **Zones à ménager** est de nouveau visible dans Réglages KINETIK. Elle utilise la source existante `cc_training_restrictions_v1` et continue d’alimenter l’adaptation des exercices.

## 5. Anciennes Priorités de skills retirées

Le moteur `cc_skill_priorities_v1` n’est plus autorisé à injecter des exercices ou séries dans une séance Skills.

Migration ponctuelle :

- si le profil n’a encore que `Progression générale`, la priorité historique la plus forte devient l’objectif principal ;
- une seconde priorité peut devenir l’objectif secondaire si celui-ci est vide ;
- la clé historique est ensuite supprimée ;
- toutes les priorités retournent `off` et `applySkillPrioritiesToBase()` est désormais neutre.

Le système canonique d’objectifs est donc exclusivement `athleteProfile.primaryGoal` + `secondaryGoal`.

## 6. Apparence restaurée

Le sélecteur **Système / Clair / Sombre** est de nouveau présent dans Réglages. Il réutilise `prefs.appTheme` et `applyAppTheme()`.

## 7. Déconnexion Strava restaurée

Quand Strava est connecté, le Profil propose à nouveau :

- Synchroniser
- Déconnecter

Le bouton réutilise l’endpoint existant `/api/strava/disconnect` ; aucune nouvelle fonction Vercel n’est ajoutée.

## 8. Tour de taille désambiguïsé

Les surfaces qui affichaient une mensuration abdominale sous le libellé générique « Taille » indiquent désormais **Tour de taille**. La vraie taille corporelle du Profil reste correctement libellée « Taille ».

## QA

- 430 contrôles historiques : OK
- 27 contrôles LOT A : OK
- total fonctionnel : 457
- syntaxe JS/API : OK
- Vercel Functions physiques : 12
- aucun `api/_lib`
- cache PWA : `kinetik-v10-131-integrity-lot-a`
- package : `10.131.0`
