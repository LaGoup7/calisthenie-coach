# KINETIK v10.125 · Audit étape 11 — Web Push P2

## Objectif

Rendre les rappels fiables lorsque la PWA est complètement fermée, sans déplacer le profil sportif de KINETIK vers le cloud.

## Architecture retenue

```text
Daily Tasks (local)
  ↓ manifeste 60 jours
web-push-manager.js
  ↓ PushSubscription + planning minimal
/api/push/sync
  ↓
Upstash Redis REST
  ↓
QStash schedules (CRON_TZ)
  ↓
/api/push/deliver
  ↓ web-push / VAPID
Push service navigateur
  ↓
Service Worker `push`
  ↓
Notification système
```

### Pourquoi QStash plutôt qu'un Cron Vercel unique

Le projet doit fonctionner même sur un plan Vercel où les Cron Jobs ne peuvent pas être exécutés toutes les minutes. QStash permet une planification horaire indépendante avec timezone IANA et évite de faire tourner un poller serveur permanent.

## Données envoyées au serveur

Toujours :

- identifiant technique de l'installation ;
- hash du secret appareil ;
- `PushSubscription` ;
- fuseau horaire ;
- heure préférée et paramètres nécessaires aux notifications ;
- jours où un rappel existe et nombre de priorités.

Mode discret (défaut) :

- aucun nom de tâche ;
- aucun `taskId` exact ;
- corps générique.

Mode détaillé (opt-in) :

- titres nécessaires à l'affichage détaillé ;
- `taskId` uniquement lorsqu'il permet d'ouvrir directement une tâche unique.

Jamais synchronisés par P2 : poids, mensurations, photos, notes, séries/reps, performances, restrictions ou historique complet.

## Sécurité

- secret appareil généré avec `crypto.getRandomValues` ;
- seul son SHA-256 est persistant côté serveur ;
- mutation/désabonnement d'un appareil existant impossible sans le secret ;
- URL Push obligatoirement HTTPS ;
- endpoint `/api/push/deliver` protégé par `PUSH_DELIVERY_SECRET` transmis par QStash ;
- nouvelles inscriptions limitées à 20 / jour / IP hashée ;
- taille JSON limitée ;
- manifeste nettoyé et borné côté serveur ;
- VAPID privée et tokens Upstash/QStash jamais exposés au client.

## Fiabilité

- rappel principal récurrent à l'heure préférée ;
- timezone IANA via `CRON_TZ`, donc changement heure été/hiver pris en charge ;
- relance séance indépendante ;
- snooze P2 ponctuel ;
- Redis déduplique une livraison pendant 72 h ;
- QStash dispose également de retries ;
- réponse Push 404/410 : appareil + schedules supprimés ;
- appareil expiré de Redis : schedules déterministes supprimés au prochain callback ;
- client resynchronisé sur ouverture/focus et après mutations KINETIK via un debounce ;
- fingerprint local évite les synchronisations serveur inutiles si le manifeste n'a pas changé ;
- fallback local P1 automatiquement supprimé lorsque P2 est actif.

## Rétention / limite

Le client synchronise 60 jours de planning. Cela évite de transférer tout le modèle métier au serveur. Si l'application n'est jamais ouverte pendant plus de 60 jours, les schedules continuent de s'exécuter mais ne trouvent plus de rappel dans le manifeste. Une ouverture régénère le planning.

## Cycle des données appareil

- `cc_web_push_device_v1` reste propre à l'appareil ;
- exclu des sauvegardes utilisateur ;
- Import : désabonnement serveur avant restauration ;
- Reset : désabonnement serveur avant suppression locale ;
- désactivation P2 : suppression des schedules, de l'entrée serveur et de la `PushSubscription` navigateur.

## Fichiers ajoutés

- `web-push-manager.js`
- `api/_lib/push-core.js`
- `api/_lib/web-push-sender.js`
- `api/push/public-key.js`
- `api/push/sync.js`
- `api/push/deliver.js`
- `api/push/test.js`
- `api/push/unsubscribe.js`
- `scripts/generate-push-secrets.js`
- `package.json`
- `.env.example`
- `P2_SETUP.md`
- `test-step11-runtime.js`

## Vérifications fonctionnelles étape 11

`test-step11-runtime.js` couvre notamment :

1. aucune permission demandée automatiquement ;
2. lecture configuration VAPID publique ;
3. manifeste Daily Tasks ;
4. confidentialité mode discret ;
5. contenu détaillé opt-in ;
6. `PushManager.subscribe()` uniquement pendant activation explicite ;
7. synchronisation fuseau / abonnement / manifeste ;
8. secret appareil présent ;
9. passage au statut P2 actif ;
10. suppression du rappel local P1 quand P2 est actif ;
11. test Push serveur ;
12. désabonnement serveur + navigateur ;
13. calcul heure de relance serveur ;
14. cron timezone-aware ;
15. validation timezone ;
16. IDs de schedule déterministes ;
17. validation stricte des endpoints HTTPS ;
18. sanitation du manifeste ;
19. handler Service Worker `push` ;
20. asset PWA v10.125 ;
21. état appareil exclu des sauvegardes ;
22. import qui désabonne l'ancien appareil.

Résultat au moment du packaging : **44/44** contrôles dédiés, plus toutes les suites historiques étapes 3–10.

## Limites restantes

- Les secrets/stockages externes doivent être configurés sur Vercel avant activation P2 réelle.
- Les tests automatisés locaux ne peuvent pas reproduire le réseau Apple/Google/Mozilla ni une vraie notification iPhone écran verrouillé.
- Le projet ne possède pas encore d'identité cloud utilisateur ; il n'y a donc pas de liste cross-device permettant de supprimer à distance un ancien téléphone. Chaque installation est néanmoins isolée et authentifiée par son secret local.

## Résultat qualité final

Suites fonctionnelles :

```text
Étape 3      17 / 17
Étape 4      26 / 26
Étape 5      22 / 22
Étape 6      25 / 25
Étape 7      19 / 19
Étape 8      30 / 30
Étape 9      31 / 31
Étape 10     35 / 35
Étape 11     44 / 44
```

Total : **249 contrôles fonctionnels**.

Contrôles supplémentaires étape 11 :

- syntaxe JS client / Service Worker / Functions : OK ;
- contrôle statique P2 : **28 / 28** ;
- contrats API sans secrets : **5 / 5** ;
- smoke test HTTP des assets et sources API : **15 / 15**.
