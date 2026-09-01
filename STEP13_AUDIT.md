# KINETIK v10.127 · Audit étape 13

## Objectif

Rendre P2 observable et résilient sans accroître l’exposition des données personnelles : différencier remise, réception et ouverture ; ralentir automatiquement les tentatives en erreur ; fournir un diagnostic support sans secrets.

## Changements

### 1. Reçus de notification signés
- `api/_lib/push-core.js` crée et vérifie des reçus HMAC à durée limitée via `PUSH_DELIVERY_SECRET`.
- `api/push/deliver.js` et `api/push/test.js` placent un reçu dans `notification.data`.
- `sw.js` envoie `received` après `showNotification()` et `opened` lors de `notificationclick`.
- `api/push/receipt.js` vérifie le reçu, déduplique l’événement Redis puis met à jour la santé de l’installation.
- Aucun `deviceSecret` n’est accessible au Service Worker.

### 2. Santé enrichie
`healthSnapshot()` expose désormais :
- `lastDeliveryAcceptedAt` ;
- `lastReceivedAt` / `lastReceivedReason` ;
- `lastOpenedAt` / `lastOpenedReason` ;
- `lastOpenDelayMs` ;
- `backoffUntil` / `backoffReason` ;
- erreurs et compteur existants.

### 3. Backoff adaptatif
- timeout / réseau / service indisponible : 15 min, 1 h, 4 h, 16 h puis plafond 24 h ;
- rate limit : 1 h, 2 h, 4 h… plafond 24 h ;
- auth Push : 12 h, 24 h, 48 h… plafond 72 h ;
- échec générique : 1 h puis exponentiel, plafond 24 h.

`/api/push/deliver` retourne `skipped: backoff_active` tant que la pause est active. Un test manuel n’est pas bloqué. Un succès ou un nouvel endpoint Push efface l’état d’erreur/backoff.

### 4. Diagnostic support
`KinetikWebPush.supportDiagnostic()` construit un snapshot JSON sans données métier ni secrets. `downloadSupportDiagnostic()` le télécharge côté navigateur. L’UI précise les exclusions.

### 5. Durcissements
- `/api/push/deliver` retourne `503 push_backend_not_configured` si `PUSH_DELIVERY_SECRET` manque.
- `verifyReceiptToken()` refuse tout reçu si le secret serveur n’est pas configuré.
- `lastOpenDelayMs=null` reste réellement `null` et n’est plus converti implicitement en `0`.

## Contrôles automatisés
- non-régression étapes 3 à 12 ;
- backoff 1er / 2e échec et expiration ;
- reset du backoff après succès ;
- création / vérification / altération d’un reçu HMAC ;
- endpoint receipt réel avec Redis REST simulé ;
- détection `received` / `opened` dans le Service Worker ;
- délai d’ouverture ;
- export support et absence de fuite endpoint / secret / installationId complet ;
- intégration API/PWA/version/cache.

Suite dédiée : `test-step13-runtime.js` — **40 contrôles**.
