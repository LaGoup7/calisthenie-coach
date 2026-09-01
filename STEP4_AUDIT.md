# KINETIK v10.118 · Audit Étape 4 — Réglages Rappels

## Objectif
Restaurer les préférences de rappels dans l'interface finale et les faire consommer par le moteur central Daily Tasks, sans créer une deuxième source de vérité pour les fréquences de suivi.

## Cause du défaut initial
Un ancien patch injectait `renderReminderSettings()` dans `renderProfile()`, mais la refonte V10.88 redéfinissait ensuite `renderProfile()` plus bas dans `app.js`. Le panneau existait donc encore dans le code mais n'était plus présent dans le renderer réellement utilisé.

## Implémentation v10.118

### Schéma de préférences v2
La clé historique `cc_smart_reminders_v1` est conservée afin de ne pas perdre les données existantes. `getReminderPrefs()` normalise désormais vers :

- `enabled`
- `workout`
- `activities`
- `measurements`
- `tests`
- `mobility`
- `recovery`
- `visibility` (`due-only` / `due-and-soon`)
- `upcomingDays` (1–14)
- `preferredMoment` (`morning` / `afternoon` / `evening` / `custom`)
- `preferredTime` (`HH:MM`)

Les anciennes préférences `workout`, `measurements`, `tests` sont conservées. Les nouvelles catégories prennent des valeurs par défaut sûres.

### Interface
Le panneau est maintenant directement inclus dans le renderer final V10.88 de **Réglages KINETIK** et propose :

1. activation générale ;
2. catégories de rappels ;
3. visibilité des échéances ;
4. horizon « bientôt » ;
5. moment et heure préférés.

L'interface explique explicitement que l'heure enregistrée n'est pas encore une notification système garantie lorsque l'application est fermée.

### Connexion Daily Tasks
Le moteur passe de v1.0.0 à v1.1.0.

Le pont de rappels applique désormais :

- `workout` → séances ;
- `activities` → activités planifiées ;
- `measurements` → mesures ;
- `tests` → tests ;
- `mobility` → mobilité ;
- `recovery` → récupération.

En mode `due-and-soon`, les mesures et tests `upcoming` sont inclus uniquement s'ils se trouvent dans l'horizon configuré.

### Pas de duplication des fréquences
Les fréquences propres aux mesures (poids, tour de taille, bilan complet, photos) restent exclusivement dans `bodyConfig.frequencies`, réglables depuis la page Mesures. Le panneau Rappels décide seulement **quels types d'éléments peuvent attirer l'attention et à quel horizon**, pas leur cadence métier.

## Contrôles effectués

### Syntaxe
- `app.js` : OK
- `daily-tasks.js` : OK
- `sw.js` : OK

### Non-régression étape 3
`test-step3-runtime.js` : **17/17 OK**.

### Tests étape 4
`test-step4-runtime.js` : **26/26 OK**.

La suite vérifie notamment :
- valeurs par défaut v2 ;
- migration des préférences historiques ;
- validation horizon 1–14 jours ;
- normalisation de l'heure ;
- présence du panneau dans le renderer final V10.88 ;
- présence des six catégories ;
- filtre activité ;
- filtre `due-only` ;
- inclusion `due-and-soon` ;
- respect de l'horizon ;
- interrupteur général.

## Limites assumées
- Pas encore de snooze / report / ignoré : étape 8 et P1.
- Pas encore de routine de récupération intelligente : étape 5.
- Pas encore de notification Web Push lorsque l'app est fermée : P2.
- `preferredTime` est déjà persisté pour éviter une future migration de préférence, mais ne filtre pas les tâches dues visibles dans l'app.

## Validation du HTML réellement rendu
Une prévisualisation statique a été générée depuis `renderProfile()` dans le même runtime de test, puis analysée : **4/4 contrôles OK** (contrôles présents, six libellés, message de limite push, règle responsive mobile).

L'outil `agent-browser` n'est pas installé dans cet environnement et Chromium headless local ne termine pas correctement ses captures (problème d'environnement DBus/zygote). Cette tentative n'est donc pas comptée comme une validation visuelle réussie. La validation fonctionnelle/DOM/CSS est complète, mais un dernier regard visuel sur un vrai navigateur/iPhone reste recommandé après déploiement.
