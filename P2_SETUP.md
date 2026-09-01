# KINETIK · P2 Web Push — configuration serveur

La v10.125 contient tout le code P2, mais aucun secret n'est inclus dans le ZIP. Le backend reste volontairement **inactif** tant que les variables ci-dessous ne sont pas configurées sur le projet Vercel.

## 1. Installer les dépendances

Vercel exécute automatiquement `npm install` lors du déploiement grâce au `package.json` fourni.

Pour générer les secrets localement :

```bash
npm install
npm run push:secrets
```

Le script affiche :

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `PUSH_DELIVERY_SECRET`
- un exemple `VAPID_SUBJECT`

Les clés VAPID doivent être générées **une seule fois** puis conservées. Changer de paire invaliderait les abonnements Push existants.

## 2. Créer le stockage Upstash Redis

Dans Vercel Marketplace, ajouter **Upstash Redis** au projet. Les deux variables suivantes doivent être disponibles en Production :

```text
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

KINETIK y stocke uniquement :

- identifiant technique d'installation ;
- hash du secret appareil ;
- `PushSubscription` chiffrée par le protocole Web Push ;
- fuseau horaire ;
- préférences de notification nécessaires ;
- manifeste de rappels à venir.

Aucune photo, mensuration, note de séance ou performance n'est envoyée au serveur.

## 3. Créer / connecter QStash

Ajouter dans Vercel :

```text
QSTASH_TOKEN
```

QStash déclenche deux schedules récurrents maximum par appareil :

1. rappel principal à l'heure préférée ;
2. éventuelle relance séance.

Les expressions utilisent `CRON_TZ=<fuseau IANA>`, ce qui permet de suivre automatiquement l'heure locale et les changements heure d'été / hiver.

Le snooze utilise un message QStash ponctuel.

## 4. Ajouter les variables Vercel

Variables Production nécessaires :

```text
PUBLIC_APP_URL=https://ton-domaine-production
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:ton-email
PUSH_DELIVERY_SECRET=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
QSTASH_TOKEN=...
```

`PUBLIC_APP_URL` doit être l'URL HTTPS canonique de KINETIK. Il est utilisé comme destination QStash (`/api/push/deliver`).

Ne jamais exposer dans le navigateur :

- `VAPID_PRIVATE_KEY`
- `PUSH_DELIVERY_SECRET`
- `UPSTASH_REDIS_REST_TOKEN`
- `QSTASH_TOKEN`

Seule `VAPID_PUBLIC_KEY` est publiquement retournée par `/api/push/public-key`.

## 5. Déployer puis activer sur l'appareil

Dans KINETIK :

```text
Réglages
→ Rappels & priorités
→ Notifications fiables
→ Activer Web Push
```

Sur iPhone/iPad, KINETIK doit être ajoutée à l'écran d'accueil. L'autorisation Push doit être déclenchée par le bouton utilisateur.

Après activation, le panneau doit afficher :

```text
Actif
P2 Web Push
60 jours synchronisés
```

Puis utiliser **Tester depuis le serveur**.

## 6. Vérification app fermée

1. Activer Web Push.
2. Cliquer sur `Tester depuis le serveur`.
3. Fermer complètement KINETIK.
4. Vérifier qu'une notification serveur apparaît.
5. Pour le test horaire réel, définir une heure préférée quelques minutes dans le futur puis cliquer sur `Synchroniser`.

## Architecture

```text
PWA KINETIK
  ↓ PushManager.subscribe(VAPID public)
/api/push/sync
  ↓
Upstash Redis ─── manifeste minimal 60 jours
  ↓
QStash (CRON_TZ)
  ↓
/api/push/deliver
  ↓ web-push + VAPID private
Push service Apple / Google / Mozilla
  ↓
Service Worker KINETIK
  ↓
Notification système
```

## Sécurité / nettoyage

- Un secret appareil aléatoire est créé localement ; le serveur ne stocke que son SHA-256.
- Une installation existante ne peut être modifiée sans ce secret.
- Les nouvelles inscriptions sont limitées par IP.
- Un endpoint Push expiré (`404/410`) supprime automatiquement l'appareil et ses schedules.
- Un appareil expiré du stockage fait supprimer ses schedules au prochain passage QStash.
- `Effacer toutes les données` et l'import d'une sauvegarde désabonnent d'abord le serveur.
- L'état appareil P2 n'entre jamais dans les exports JSON.

## Limite volontaire

Le navigateur calcule et synchronise un manifeste de **60 jours**. Si KINETIK n'est jamais ouverte pendant plus de 60 jours, le serveur finit par ne plus avoir de tâche future à envoyer. La prochaine ouverture régénère automatiquement le manifeste.


## 7. Diagnostic v10.126

Après activation, le panneau **Santé des notifications** permet de vérifier :

- abonnement navigateur présent ;
- installation présente dans Redis ;
- schedules rappel / relance ;
- dernière synchronisation ;
- dernière remise acceptée par Apple/Google/Mozilla Push ;
- dernier test serveur ;
- dernière erreur normalisée.

Le bouton **Vérifier** appelle `POST /api/push/status` avec l'identifiant et le secret de l'installation courante. Le serveur ne permet pas de lister d'autres appareils.

Le bouton **Réparer Web Push** peut recréer un abonnement perdu ou renouvelé, puis appelle `/api/push/sync` pour reconstruire l'état serveur et les schedules. Aucune nouvelle variable d'environnement n'est nécessaire pour v10.126.

### Signification de « Dernière remise Push »

Cette date indique que le fournisseur Web Push a accepté la notification envoyée par le backend. Elle ne prouve pas que l'utilisateur a vu ou ouvert la notification. Un accusé d'ouverture pourra être ajouté dans une étape ultérieure, séparément et de façon transparente.

### Multi-appareils

Chaque installation possède déjà son propre `installationId`, secret, abonnement et état de santé. KINETIK n'essaie pas de relier ou d'afficher plusieurs appareils sans authentification utilisateur : cela évite qu'un identifiant local permette de découvrir les appareils d'une autre personne.


## 8. Observabilité et backoff v10.127

Aucune nouvelle variable d’environnement n’est nécessaire. `PUSH_DELIVERY_SECRET` sert maintenant aussi à signer des reçus HMAC à durée limitée inclus dans chaque notification.

Le cycle observé est :

```text
/api/push/deliver
→ fournisseur Web Push accepte
→ Service Worker reçoit le push
→ POST /api/push/receipt { event: received }
→ utilisateur clique
→ POST /api/push/receipt { event: opened }
```

Le reçu ne contient pas le `deviceSecret`. Le Service Worker ne peut donc toujours pas modifier l’installation ou son manifeste. Les événements de reçu sont dédupliqués dans Redis et le jeton expire après quelques jours.

### Backoff

Après un échec temporaire, le serveur enregistre `backoffUntil` et ignore les livraisons planifiées jusqu’à cette date. Les pauses augmentent avec les échecs consécutifs et sont plafonnées. Un test manuel ou une réparation explicite peut toujours vérifier le service immédiatement. Une nouvelle souscription navigateur efface le backoff précédent.

### Diagnostic support

Dans **Réglages → Rappels & priorités → Santé des notifications**, `Exporter diagnostic support` produit un JSON partageable qui exclut volontairement :

- `deviceSecret` ;
- `installationId` complet ;
- endpoint Push complet ;
- clés d’abonnement ;
- manifeste / noms de tâches ;
- mensurations, photos, performances et notes.

Le fichier contient seulement versions, plateforme, état permission/abonnement, booléens de schedules, dates de santé, codes d’erreur et paramètres de rappel nécessaires au diagnostic.


## Compte KINETIK multi-appareils — v10.130

Aucune nouvelle variable d’environnement n’est nécessaire. Le compte KINETIK réutilise `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` et `PUSH_DELIVERY_SECRET` déjà configurés pour P2.

Le endpoint public `/api/account` est un rewrite défini dans `vercel.json` vers la fonction physique `/api/push/status?scope=account`. Cela permet de rester à 12 Vercel Functions sur Hobby.

Le compte stocke uniquement l’identité pseudonyme du compte, les hashes des secrets appareil, les métadonnées minimales d’appareil, le lien éventuel vers une installation Push et le flag de suspension des notifications. Aucune séance, mesure, photo, performance ou note n’est envoyée au compte.
