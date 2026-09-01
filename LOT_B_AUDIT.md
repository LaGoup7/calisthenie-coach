# KINETIK v10.132 · LOT B — Simplification UX

## Objectif

Réduire la densité et les doublons visibles après les étapes 1–15, sans modifier les moteurs métier (Daily Tasks, Planning, progression, Web Push, compte multi-appareils).

## 1. Aujourd'hui : une intention = une action

### Avant
La page pouvait proposer simultanément :
- la séance dans l'Agenda + un lien vers la séance + le hero de séance ;
- `Ajouter` dans le cockpit + le FAB global `Ajouter` ;
- `Activité` dans le cockpit + `＋ Activité` dans Charge sportive.

### v10.132
- la tâche `workout` reste dans l'Agenda pour la progression de journée, mais n'affiche plus de CTA ;
- le hero séance est l'unique action de démarrage (`Choisir le format`) ;
- le bouton cockpit `Ajouter` est supprimé : le FAB reste la seule entrée de performance libre ;
- le bouton cockpit `Activité` est supprimé : `Charge sportive` garde l'unique CTA manuel d'activité ;
- le raccourci Rang est conservé ;
- le raccourci Gainage reste injecté après ce bloc par le module Planning.

Aucun provider Daily Tasks n'a été modifié.

## 2. Notifications : divulgation progressive

La surface principale affiche désormais uniquement les réglages quotidiens :
- master ON/OFF ;
- catégories ;
- heure principale ;
- snooze ;
- relance de séance + délai.

Deux panneaux repliés organisent le reste :

### Détails appareil
- autorisation de notifications de l'appareil ;
- fallback local P1 ;
- état Web Push P2 ;
- activation / test / synchronisation / désactivation ;
- fuseau, horizon et dernière synchronisation lorsque P2 est actif.

### Avancé & support
- dû uniquement vs dû + bientôt ;
- horizon « bientôt » ;
- confidentialité écran verrouillé ;
- test local ;
- santé Web Push ;
- réparation ;
- acceptée / reçue / ouverte ;
- backoff ;
- export diagnostic support.

Les IDs des contrôles et leurs binders historiques restent compatibles : la simplification ne change donc pas le moteur de notifications.

## 3. Historique des décisions déplacé

`Fait / Reporté / Ignoré` n'est plus présenté dans les réglages Notifications.

Il se trouve maintenant sous :

`Réglages KINETIK → Données → Journal du parcours`

La rétention de 180 jours et le stockage `cc_daily_task_decisions_v1` ne changent pas.

## 4. Profil / Réglages : routage simplifié

Routes principales conservées :
- `athlete` → Profil sportif ;
- `settings` → Réglages.

Aliases retirés du routeur actif :
- `profile` ;
- `more`.

Autres corrections :
- après import, retour vers `athlete` et non vers l'ancien alias `profile` ;
- `beforeinstallprompt` rerend `settings` lorsqu'il devient pertinent ;
- la route `settings` appelle explicitement `renderSettings()` ;
- le renderer historique `renderProfile()` reste temporairement comme implémentation interne jusqu'au LOT C, mais n'est plus une route publique.

## 5. Intégrations

La ligne inactive `Apple Santé — Plus tard` est retirée du Profil. Elle réapparaîtra uniquement lorsqu'une intégration réelle existera.

Strava reste disponible, avec :
- connexion ;
- synchronisation ;
- déconnexion.

## 6. Vercel Hobby

Le LOT B n'ajoute aucune fonction serveur.

Total physique sous `api/` : **12 fonctions**.

## 7. QA

- suites étapes 3–15 : vertes ;
- LOT A : vert ;
- `test-lot-b-runtime.js` : 22 contrôles ;
- aucune route `profile/more` dans le routeur actif ;
- aucune ligne Apple Santé dans les renderers actifs ;
- invariant 12 fonctions Vercel contrôlé.

Le navigateur Chromium disponible dans l'environnement de génération reste bloqué par son environnement DBus/zygote en mode headless ; la validation visuelle automatisée réelle n'est donc pas comptée comme réussie. Les contrats DOM sont testés par VM et un smoke HTTP est exécuté sur les assets livrés.
