# KINETIK v10.126 · Audit étape 12 — Santé Web Push & appareil courant

## Objectif

Rendre le P2 observable et réparable sans transformer KINETIK en plateforme cloud. Un état `enabled=true` dans `localStorage` n'est plus suffisant pour déclarer Web Push opérationnel : KINETIK vérifie maintenant l'abonnement navigateur et l'installation serveur.

## Architecture ajoutée

```text
Réglages KINETIK
  ↓
Web Push Health Manager v1.1
  ├─ PushSubscription navigateur
  ├─ clé VAPID courante
  └─ identité installation locale
          ↓ authentifié
POST /api/push/status
          ↓
Upstash Redis · appareil courant uniquement
  ├─ schedules présents
  ├─ dernière synchro client
  ├─ dernière remise acceptée
  ├─ dernier test serveur
  └─ dernière erreur / compteur d'échecs
```

## Données serveur supplémentaires

Aucune donnée de santé ou sportive n'est ajoutée. Le record Push conserve uniquement :

- `device.label` ;
- `device.platform` ;
- `device.standalone` ;
- `device.appVersion` ;
- `health.lastClientSyncAt` ;
- `health.lastDeliveryAcceptedAt` ;
- `health.lastDeliveryReason` ;
- `health.lastDeliveryDate` ;
- `health.lastTestAcceptedAt` ;
- `health.lastDeliveryErrorAt` ;
- `health.lastDeliveryError` ;
- `health.consecutiveFailures`.

## États diagnostiqués

1. `permission_denied` — notifications bloquées par l'OS / navigateur.
2. `subscription_missing` — Web Push était activé mais le `PushSubscription` n'existe plus.
3. `subscription_changed` — le Service Worker signale une rotation de l'abonnement.
4. `vapid_key_changed` — l'abonnement présent a été créé avec une autre clé VAPID lorsque le navigateur expose cette information.
5. `server_missing` — l'installation locale n'existe plus côté Redis.
6. `device_auth_failed` — le secret local ne correspond plus au record serveur.
7. `repair_failed` — la tentative de reconstruction a échoué.

Un état nécessitant réparation force `active=false`, même si l'ancien booléen `enabled` vaut encore `true`.

## Réparation

`repair()` :

- ne redemande jamais la permission si elle n'est pas déjà accordée ;
- recrée le `PushSubscription` s'il manque ;
- remplace un abonnement lié à une ancienne clé VAPID ;
- resynchronise un appareil absent du serveur ;
- en cas de secret désynchronisé, génère une nouvelle identité **et révoque l'ancien PushSubscription** avant d'en créer un nouveau.

Ce dernier point évite deux schedules utilisant le même endpoint : l'ancien record serveur obtient ensuite 404/410 et s'auto-nettoie via la logique P2 existante.

## Endpoint `/api/push/status`

- méthode : `POST` ;
- exige `installationId` + `deviceSecret` ;
- renvoie `exists:false` si l'installation n'existe plus ;
- refuse `403` si le secret ne correspond pas ;
- ne renvoie jamais le secret, le hash du secret ou l'abonnement complet ;
- ne permet aucune recherche/listing d'autres appareils.

## Santé de livraison

Une réussite de `web-push.sendNotification()` enregistre :

- date d'acceptation ;
- raison (`primary`, `workout-followup`, `snooze`) ;
- date agenda ;
- remise à zéro des erreurs consécutives.

Les erreurs sont normalisées en codes non sensibles :

- `subscription_expired` ;
- `push_auth_failed` ;
- `push_rate_limited` ;
- `push_service_unavailable` ;
- `push_timeout` ;
- `push_network_error` ;
- `delivery_failed`.

L'interface dit explicitement qu'une remise acceptée n'est pas une preuve d'ouverture par l'utilisateur.

## Appareil courant / multi-appareils

L'utilisateur peut renommer l'installation courante. Le serveur est déjà structuré par `installationId`, ce qui prépare le multi-appareils.

Aucune liste cross-device n'est implémentée sans authentification utilisateur/cloud. C'est une contrainte de sécurité volontaire : un secret d'installation ne doit jamais donner accès aux métadonnées d'autres appareils.

## Service Worker

Ajout de `pushsubscriptionchange`. Le Service Worker notifie les fenêtres ouvertes via `postMessage`. Il ne tente pas lui-même une synchronisation serveur, car l'identité/secrète appareil reste dans `localStorage`, inaccessible au contexte Service Worker.

## Compatibilité données

`cc_web_push_device_v1` reste la clé locale. Le schéma interne passe à `version:2` mais reste rétrocompatible : les nouveaux champs sont optionnels et créés au prochain refresh/sync.

L'état Web Push demeure :

- exclu de l'Export JSON ;
- purgé à l'Import ;
- supprimé après désabonnement lors de `Effacer toutes les données`.

## Contrôle qualité

`test-step12-runtime.js` couvre 53 contrôles dédiés :

- aucun prompt de permission au boot ;
- métadonnées appareil minimales ;
- endpoint santé ;
- dernière remise / schedules ;
- renommage appareil ;
- abonnement perdu + réparation ;
- appareil serveur perdu + réparation ;
- rotation VAPID + rotation du PushSubscription ;
- test serveur et timestamp santé ;
- sanitisation des métadonnées ;
- classification des erreurs ;
- persistance/reset de la santé ;
- `pushsubscriptionchange` ;
- présence UI santé/réparation ;
- versions PWA v10.126.

Les suites historiques étapes 3 à 11 sont relancées en non-régression.

## Résultat final de validation

- non-régression étapes 3–11 : **249 contrôles** ;
- étape 12 : **53 contrôles** ;
- total fonctionnel cumulé : **302 contrôles** ;
- contrôles statiques étape 12 : **24 / 24** ;
- smoke test HTTP : **16 / 16** fichiers servis.
