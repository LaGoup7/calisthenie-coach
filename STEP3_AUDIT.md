# KINETIK v10.117 — Audit Étape 3

## Objectif

Restaurer les réglages de la page **Mesures** et vérifier qu'ils pilotent réellement le suivi corporel, plutôt que de remettre uniquement une ancienne interface devenue déconnectée.

## État final

**Étape 3 : terminée.**

### 1. Point d'entrée utilisateur

La page Mesures possède maintenant :

- un bouton `⚙ Réglages` dans l'en-tête ;
- un panneau repliable `Réglages des mesures` en bas de la page ;
- le même panneau reste disponible lorsqu'aucune mesure n'a encore été enregistrée ;
- après sauvegarde, le panneau reste ouvert et affiche une confirmation.

### 2. Fréquences

Les quatre fréquences déjà prévues sont restaurées :

- poids ;
- tour de taille ;
- bilan complet ;
- photos.

Les valeurs sont validées et bornées entre **1 et 365 jours**.

Le statut `Bilan complet` a également été durci : `measurementMode = full` ne suffit plus à lui seul. Il faut au moins **quatre mensurations détaillées** réellement renseignées, ce qui évite qu’un formulaire complet presque vide repousse le rappel.

Chaîne fonctionnelle vérifiée :

`Réglages Mesures → bodyConfig.frequencies → bodyTrackingSchedule() → Daily Tasks Engine`

Il n'existe donc pas de deuxième configuration de fréquence créée pour cette étape.

### 3. Objectifs

Les objectifs configurables sont :

- poids ;
- tour de taille ;
- masse grasse ;
- poitrine ;
- bras gauche ;
- bras droit ;
- cuisse gauche ;
- cuisse droite.

Un objectif renseigné peut maintenant produire une carte de progression directement sur la page Mesures lorsque les données nécessaires existent.

### 4. Champs suivis

Les 16 champs natifs restent configurables individuellement.

Masquer un champ :

- le retire de l'éditeur de mesure ;
- le retire des groupes de mensurations détaillées ;
- ne supprime aucune ancienne donnée.

Protection ajoutée : si l'utilisateur masque tous les champs de saisie rapide, le bouton `Nouvelle mesure` ouvre automatiquement le **bilan complet** au lieu d'afficher un formulaire rapide inutilisable.

### 5. Composition corporelle

Les réglages actifs sont de nouveau accessibles :

- formule US Navy homme ;
- formule US Navy femme ;
- estimation désactivée ;
- source automatique : balance puis estimation ;
- estimation uniquement ;
- balance uniquement.

La taille utilisée par les calculs continue de respecter l'étape 2 : **taille canonique du profil**, avec snapshots historiques conservés dans les anciens relevés.

### 6. Champs personnalisés

Un champ personnalisé possède :

- une clé interne stable ;
- un libellé ;
- une unité ;
- un état visible/masqué.

Il peut être :

- créé dans Réglages ;
- saisi dans un bilan complet ;
- affiché dans `Mensurations détaillées` ;
- comparé à son ancienne valeur pour afficher une évolution.

Supprimer le champ de la configuration ne supprime pas ses anciennes valeurs brutes des relevés historiques.

## Qualité et tests

### Syntaxe

Validé avec :

- `node --check app.js`
- `node --check daily-tasks.js`
- `node --check sw.js`

### Test fonctionnel automatisé

`test-step3-runtime.js` charge l'application dans un environnement navigateur simulé et vérifie **17 points** :

1. panneau réglages présent sans historique ;
2. raccourci réglages présent ;
3. résumé du panneau présent ;
4. fréquence saisie via DOM bornée à 365 jours ;
5. formule/source masse grasse persistées ;
6. objectif persisté ;
7. visibilité d'un champ persistée ;
8. objectifs affichés lorsque configurés ;
9. cible poids reliée à l'UI ;
10. section champs personnalisés affichée ;
11. libellé personnalisé affiché ;
12. champ natif masqué absent de l'éditeur ;
13. fréquence poids consommée par `bodyTrackingSchedule()` ;
14. fréquence tour de taille consommée par `bodyTrackingSchedule()` ;
15. calcul IMC toujours relié à la taille canonique de l'étape 2 ;
16. Daily Tasks transforme bien une mesure devenue due selon la fréquence configurée en tâche `pending` avec la bonne échéance.
17. un relevé marqué `full` avec une seule mensuration détaillée ne valide pas artificiellement le rappel de bilan complet.

Résultat actuel : **`STEP3_RUNTIME_OK 17 checks`**.

## PWA

- assets : `10.117` ;
- cache : `kinetik-v10-117-body-settings` ;
- `app.js`, `styles.css` et `daily-tasks.js` utilisent le même numéro de version dans `index.html` et `sw.js`.

## Limites volontairement non traitées

Ces éléments appartiennent aux étapes suivantes :

- réglages globaux des rappels : étape 4 ;
- rappels de mobilité : étape 5 ;
- nouvelle UI complète `À faire aujourd'hui` : étape 6 ;
- actions directes depuis les tâches : étape 7 ;
- report / ignoré : étape 8 ;
- fraîcheur individuelle des protocoles de test : étape 9.
