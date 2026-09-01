# KINETIK v10.124 · Audit étape 10 — Notifications locales intelligentes

## Objectif

Activer la phase P1 du parcours de rappels sans prétendre offrir une garantie impossible côté navigateur : KINETIK peut déclencher des notifications système à l'heure préférée tant que la PWA / le navigateur conserve son runtime actif. La livraison fiable lorsque l'application est fermée reste réservée à P2 (Web Push + planification serveur).

## Architecture ajoutée

Nouveau module isolé : `local-reminders.js`.

Le module ne recrée aucune logique métier de tâche. Il consomme uniquement :

- `getReminderPrefs()` pour les préférences ;
- `KinetikDailyTasks.getAgendaTasks()` pour les tâches réellement dues ;
- le Service Worker pour afficher la notification système.

Chaîne :

```text
Daily Tasks Engine
        ↓
Tâches pending / blocked
        ↓
Local Reminder Coordinator
        ↓
Heure préférée / snooze / relance
        ↓
Service Worker showNotification()
```

## Schéma de préférences v3

Les préférences `cc_smart_reminders_v1` restent rétrocompatibles et passent au schéma `version: 3` avec :

- `localNotifications` — désactivé par défaut ;
- `notificationDetail` — `discreet` par défaut, `detailed` optionnel ;
- `snoozeMinutes` — 15 / 30 / 60 / 120 min ;
- `workoutFollowup` — activé par défaut ;
- `workoutFollowupDelay` — 60 / 120 / 180 / 240 min.

Les anciennes préférences P0 restent inchangées : catégories, visibilité, horizon, moment et heure préférés.

## Permission

La permission Notification n'est jamais demandée automatiquement au chargement.

Elle est demandée uniquement après action explicite sur **Activer les notifications**.

États UI :

- À activer ;
- Autorisées ;
- Refusées ;
- Indisponible ;
- À installer sur l'écran d'accueil pour iPhone/iPad hors PWA standalone.

Une permission refusée n'est pas redemandée en boucle : l'interface explique qu'elle doit être réactivée depuis les réglages du navigateur / appareil.

## Rappel principal

Le rappel principal utilise `preferredTime`.

Règles :

1. aucune notification si aucun Daily Task n'est `pending` / `blocked` ;
2. aucune notification si les rappels généraux sont désactivés ;
3. les catégories déjà filtrées par Daily Tasks sont respectées ;
4. une seule notification principale par jour ;
5. si l'utilisateur est déjà dans KINETIK après l'heure cible, le rappel est marqué **vu dans l'app** et aucune notification système redondante n'est affichée ;
6. si le runtime est vivant mais en arrière-plan, le Service Worker affiche la notification.

## Confidentialité écran verrouillé

Par défaut `notificationDetail = discreet`.

La notification affiche uniquement :

> KINETIK · 3 priorités  
> 3 priorités t'attendent dans ton parcours du jour.

Elle n'expose donc pas les noms de tâches corporelles / sportives sur l'écran verrouillé.

L'utilisateur peut activer volontairement **Détails sur l'écran verrouillé** pour afficher jusqu'à trois titres de tâches.

## Snooze

Le bouton / action **Plus tard** utilise la durée configurée (30 min par défaut).

Le snooze :

- est stocké localement ;
- survit à un rechargement de la page ;
- est recalculé avec les tâches encore réellement dues au moment de la relance ;
- ne crée aucune nouvelle Daily Task ;
- est consommé sans notification système si l'utilisateur est déjà dans l'app au moment prévu.

## Relance séance manquée

Si une séance KINETIK reste `pending`, une seconde relance peut être envoyée.

Règle de calcul :

```text
max(heure préférée + délai configuré, 18:00)
```

avec plafond à **21:30**.

Si la PWA se réveille pour la première fois après l'heure de relance, KINETIK n'envoie pas le rappel principal du matin puis la relance en double : il saute le rappel obsolète et envoie uniquement la relance séance.

Une séance :

- terminée ;
- reportée ;
- ignorée

n'est plus `pending`, donc ne déclenche pas cette relance.

## Mobilité et récupération

La couche Notification ne possède aucune règle spéciale supplémentaire. Elle consomme les tâches normalisées du Daily Tasks Engine.

Ainsi les réglages `mobility` / `recovery` de l'étape 4 continuent d'être la seule source de filtrage.

Cela évite un deuxième moteur concurrent.

## Interaction avec une notification

Le Service Worker gère `notificationclick`.

- **Ouvrir** : focus d'une fenêtre KINETIK existante ou ouverture de la PWA ;
- **Plus tard** : transmet l'action de snooze ;
- si une seule tâche était concernée, son `taskId` est transmis pour mettre en évidence la carte correspondante dans **À faire aujourd'hui**.

Le tap ne démarre jamais automatiquement une séance ou un test : il ouvre le parcours, ce qui évite une action métier involontaire depuis l'écran verrouillé.

## État de livraison

Clé : `cc_local_notification_state_v1`.

Elle contient seulement de l'état appareil / livraison :

- rappel principal envoyé / vu ;
- relance séance envoyée / vue ;
- snooze ;
- signature des tâches.

Rétention : 14 jours.

Cette clé est :

- enregistrée dans `STORAGE` afin que **Effacer toutes les données** la supprime ;
- volontairement exclue de l'export JSON, car une livraison déjà effectuée sur un appareil ne doit pas empêcher un rappel sur un nouvel appareil ;
- explicitement supprimée avant restauration d'une sauvegarde.

## Service Worker / PWA

Cache : `kinetik-v10-124-local-reminders`.

Nouvel asset offline :

- `local-reminders.js?v=10.124`.

Le Service Worker contient `notificationclick`, mais **aucun listener `push`** : c'est volontaire et matérialise clairement la frontière P1 / P2.

## Limite technique explicite

P1 ne garantit pas une exécution lorsque :

- la PWA est fermée ;
- iOS suspend complètement son processus ;
- Android / le navigateur tue le runtime en arrière-plan.

La garantie de livraison nécessite :

1. une subscription Web Push ;
2. un endpoint serveur ;
3. une planification serveur ;
4. la gestion des appareils / tokens ;
5. les événements `push` dans le Service Worker.

Ce sera P2.

## Qualité / tests

`test-step10-runtime.js` valide 35 comportements, notamment :

- migration préférences v3 ;
- permission jamais demandée automatiquement ;
- activation explicite ;
- notification principale ;
- confidentialité discrète ;
- déduplication ;
- snooze ;
- mode détaillé ;
- suppression de notification redondante lorsque l'app est visible ;
- relance séance tardive sans double notification ;
- désactivation de la relance ;
- catégories mobilité / récupération ;
- notification de test ;
- stockage device-local exclu des sauvegardes ;
- contrat `notificationclick` ;
- intégration de `local-reminders.js` dans la PWA.
