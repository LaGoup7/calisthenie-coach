# KINETIK v10.130 · Audit étape 15 — Identité & multi-appareils

## Objectif

Ajouter une identité utilisateur minimale et un vrai regroupement multi-appareils sans synchroniser les données sportives et sans dépasser la limite de 12 Vercel Functions du plan Hobby.

## Architecture

- `account-manager.js` : identité locale de l’appareil, création/rejoint du compte, pairing, liste, mute, révocation et dissociation.
- `lib/account-core.js` : logique serveur Redis du compte.
- `/api/account` : rewrite Vercel vers `/api/push/status?scope=account`; aucun 13e entrypoint.
- `api/push/deliver.js` : vérifie le mute cross-device avant remise.
- `api/push/sync.js` : bloque une ancienne installation Push révoquée.

## Sécurité

- secret différent pour chaque appareil ; seul le hash est stocké ; comparaison timing-safe ;
- code d’association 8 caractères (~40 bits), à usage unique via Redis `GETDEL`, TTL 10 minutes ;
- rate-limit création/join par IP ;
- maximum 8 appareils ;
- lien vers une installation Push accepté uniquement si le `deviceSecret` Push authentifie réellement le record serveur ;
- révocation distante supprime abonnement + schedules puis marque le Push ID révoqué pour empêcher sa résurrection ;
- aucune découverte cross-device sans authentification d’un membre du compte.

## Confidentialité

Le backend compte ne référence aucune donnée de séance, mesure, photo, performance, mobilité ou note. L’export sportif ne contient pas l’identité compte.

## UX

Dans Réglages KINETIK :
- créer un compte ;
- rejoindre par code ;
- nommer l’appareil ;
- voir les installations liées ;
- générer/copier un code d’association ;
- suspendre les rappels d’un appareil ;
- révoquer un autre appareil ;
- dissocier l’appareil courant.

## Limite connue

Cette première identité n’utilise ni email ni passkey. Si tous les appareils liés sont perdus, il n’existe pas encore de récupération de compte.

## Validation

`test-step15-runtime.js` couvre 43 contrôles dédiés : client, serveur, pairing à usage unique, multi-device, mute, révocation, anti-résurrection Push, confidentialité, PWA et invariant 12 fonctions. Toutes les suites étapes 3–14 passent également.
