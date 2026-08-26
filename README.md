
## V8.2 — Quick Log / volume journalier

- bouton flottant **+ Log** accessible depuis les écrans principaux ;
- saisie ultra-rapide des tractions, pompes, squats, dips et dead hangs ;
- valeurs prédéfinies en un clic (+1/+5, +5/+10, +10/+20, etc.) ;
- saisie personnalisée pour les autres exercices de la bibliothèque ;
- suivi séparé du **volume libre** et du volume des séances guidées ;
- carte **Aujourd'hui** avec volume total par mouvement ;
- bilan du volume libre sur 7 jours dans Progression ;
- possibilité d'annuler immédiatement le dernier ajout ;
- les micro-séries libres ne donnent ni XP, ni PR, ni promotion automatique afin de ne pas encourager le volume inutile ou biaiser le coach.

# Calisthénie Coach — V8.1 Reprise intermédiaire

PWA locale pour suivre un programme de reprise 6 jours sur 7 avec calisthénie, cardio, mobilité, flexibilité, gamification et adaptation progressive.

## Ajustement V8.1 — Programme Reprise intermédiaire

Le programme par défaut a été rééquilibré après audit complet :

- tractions strictes + back-off assisté pour conserver un vrai niveau intermédiaire sans travailler à l’échec ;
- squat tempo à la place du squat simple ;
- ajout du hamstring curl pour entraîner les ischios en flexion de genou ;
- ajout du Pallof press et du side plank pour anti-rotation et gainage latéral ;
- deuxième rappel mollets le samedi ;
- cardio structuré réparti sur 4 jours (125 min de Zone 2 de base, progressif dans le cycle) ;
- volume direct de core réduit pour préserver la récupération ;
- dead hang volontairement limité car le grip est déjà chargé par les tractions et les exercices suspendus ;
- correction du conflit `Mollets` : les étirements sont maintenant séparés des calf raises dans le suivi de volume et les tutoriels.

Répartition : lundi repos, mardi Push + Handstand, mercredi Pull + Grip, jeudi Jambes + Cardio, vendredi Skills + Mobilité + cardio facile, samedi Full Body, dimanche Cardio + Mobilité.

## Training Engine V8

### 1. Bibliothèque structurée d'exercices

La V8 ajoute une bibliothèque de plus de 70 mouvements couvrant :

- Push
- Pull
- Grip
- Core
- Jambes
- Skills
- Mobilité

Chaque fiche contient : niveau, matériel, muscles sollicités, prescription indicative, régression, progression, substitutions possibles et tutoriel.

La bibliothèque est accessible depuis **Progression → Exercices** ou **Profil → Programme & bibliothèque**.

### 2. Progressions et régressions persistantes

Le moteur suit désormais les objectifs de manière cumulative. Exemple :

`6 reps → 7 → 8 → 9...`

Une hausse n'est proposée qu'après deux séances solides au même palier, avec un effort raisonnable et sans gêne articulaire.

Quand un exercice atteint son seuil de maîtrise, l'app peut proposer le niveau suivant, par exemple :

`Pompes → Pompes pieds surélevés`

`Dips → Dips tempo`

`Hanging knee raises → Hanging leg raises`

`Tuck L-sit → One-leg L-sit`

La progression adoptée est mémorisée. Elle peut être réinitialisée depuis le Profil.

### 3. Cycles automatiques de 8 semaines

Le programme suit maintenant un cycle :

- Semaines 1–3 : construction
- Semaine 4 : consolidation
- Semaines 5–7 : construction
- Semaine 8 : deload + tests

Pendant la consolidation et le deload, l'app bloque volontairement les hausses de difficulté. Le deload réduit aussi le volume afin de protéger la récupération.

Le cycle peut être relancé depuis **Profil → Training Engine**.

### 4. Readiness avant chaque séance

Avant de lancer une séance, l'app demande trois informations :

- énergie 1–5 ;
- courbatures 1–5 ;
- articulations/tendons : OK, sensibles ou gênés.

Elle choisit ensuite :

- séance normale ;
- séance allégée ;
- version très légère / récupération active.

Le résultat est enregistré avec la séance et n'altère pas artificiellement la progression permanente.

### 5. Échauffement ciblé

L'écran de readiness affiche automatiquement une activation adaptée au type de séance : push/handstand, pull, jambes ou full body.

### 6. Substitutions pendant l'entraînement

Depuis l'écran d'un exercice, **Changer cet exercice** permet de choisir une variante plus facile, alternative ou plus difficile pour la séance en cours uniquement.

Cela permet de s'adapter au matériel disponible ou à la forme du jour sans modifier le programme permanent.

### 7. Volume musculaire hebdomadaire

L'écran Progression affiche le volume réalisé par rapport au volume planifié pour :

- pectoraux ;
- dos ;
- épaules ;
- biceps ;
- triceps ;
- core ;
- quadriceps ;
- ischios ;
- fessiers ;
- mollets ;
- grip.

Les exercices polyarticulaires comptent partiellement pour les muscles secondaires. Ce panneau est un outil de comparaison interne, pas une prescription médicale ou un objectif absolu de volume.

### 8. Records personnels automatiques

Après avoir créé une première référence, l'app détecte automatiquement les nouveaux records de reps ou de temps de maintien. Pour les exercices avec bandes, les records sont séparés selon la bande utilisée.

Les records récents sont visibles dans l'écran Progression et sont aussi enregistrés dans le détail de la séance.

## Fonctions héritées V1–V7

- programme 6 jours sur 7 avec lundi de repos ;
- séance guidée étape par étape ;
- timers de travail et de repos ;
- son et vibration ;
- détail complet des séances dans Semaine ;
- historique local ;
- RPE et gêne articulaire ;
- tests périodiques ;
- skill tree ;
- journal physique + graphiques + photos locales ;
- rangs Bronze → Légende ;
- XP et missions de promotion ;
- onglet Flex avec routines guidées ;
- tests de mobilité ;
- bibliothèque personnalisable de tutoriels vidéo/image ;
- installation PWA et fonctionnement hors ligne.

## Compatibilité V7

Les clés existantes de stockage sont conservées : historique, tests, skills, journal physique, flexibilité, mobilité et tutoriels. La V8 ajoute uniquement une clé pour les variantes d'exercices adoptées et de nouveaux champs optionnels dans les nouvelles séances (readiness, cycle, records).

Les anciennes séances restent lisibles.

## Lancer localement

```bash
python -m http.server 8080
```

Puis ouvrir :

```text
http://localhost:8080
```

## Données

Les données structurées restent dans `localStorage`. Les photos de progression restent dans IndexedDB. Aucun compte ni serveur n'est requis.


## V8.3 UI Refresh
- Refonte visuelle de l'interface : cartes, hero, navigation, boutons, modales, progress bars, Quick Log et rendu mobile.
- Pas de changement de logique d'entraînement : cette version améliore uniquement l'UI/UX visuelle.


## V8.4 · Quick Log exact + bandes personnelles
- Saisie d'un nombre exact directement sur chaque raccourci Quick Log.
- Inventaire des 5 bandes : jaune 5–15 lb (2,3–6,8 kg), rouge 15–35 lb (6,8–15,9 kg), noire 25–65 lb (11,3–29,5 kg), violette 35–85 lb (15,9–38,6 kg), verte 50–125 lb (22,7–56,7 kg).
- Sélecteur visuel par couleur pendant les exercices avec bande.
- La dernière bande utilisée pour un exercice est proposée la fois suivante.
- Quick Log personnalisé peut aussi enregistrer la bande utilisée pour les exercices assistés.

> Les valeurs en kg sont des conversions des plages indiquées par le fabricant. La force d'assistance réelle dépend de l'allongement de la bande.


## V8.5 · Quick Log assisté
- Ajout de Tractions assistées dans les micro-séries rapides.
- Ajout de Dips assistés dans les micro-séries rapides.
- Sélection directe de la bande (jaune, rouge, noire, violette, verte) avec plage en kg.
- Les boutons rapides et la saisie exacte enregistrent la bande choisie.


## V8.6 · Sauvegarde & Vercel
- Export complet JSON depuis Profil > Données.
- Import/restauration complète sur un autre navigateur ou domaine.
- Les photos IndexedDB sont incluses dans la sauvegarde en data URL.
- Ajout de `vercel.json` pour un déploiement statique PWA avec service worker correctement revalidé.
- Recommandation : exporter avant le premier passage de localhost vers Vercel.


## V8.7 Simplify
- Navigation principale ramenée à 4 onglets : Aujourd’hui, Semaine, Progrès, Plus.
- Écran Aujourd’hui simplifié en cockpit.
- Quick Log : répétition en 1 tap des derniers logs, saisie exacte, bandes par couleur en un tap.
- Pause de séance complète et annulation de la dernière série guidée.
- Sac à dos ajouté comme charge en kg pour les variantes lestées.
- Matériel maison documenté : Power Tower, bandes, tapis, sac à dos.
- Alertes discrètes lorsque le volume de micro-séries devient élevé.


## V8.8 · Flex simplifié
- Page Flex réduite à trois choix : Rapide, Ciblée et Complète.
- Routine ciblée choisie automatiquement selon le jour.
- Tests de mobilité et historique repliés dans Suivi mobilité.
- Prévisualisation des exercices facultative, démarrage en un tap.


## V8.8.1 Hotfix
- Corrige les boutons `+ Ajouter` de l'accueil : plusieurs boutons peuvent maintenant ouvrir le même Quick Log.
- Corrige le toggle legacy `Routines > Choisis ton focus` (`data-flex-toggle`).
- Service Worker en network-first sur les fichiers principaux pour recevoir plus fiablement les mises à jour Vercel/PWA.
- La version `V8.8.1` est visible dans l'écran Plus pour vérifier le déploiement.


## V8.8.2 — iPhone UI audit
- Correction du conflit de grille des cartes Semaine sur mobile.
- Menus Flex dépliés sur toute la largeur de la carte.
- Safe areas iPhone (encoche / Home Indicator) appliquées à la coque, navigation et bottom sheets.
- Quick Log réorganisé pour 390/430 px, bandes sur 3 colonnes et champs à 16 px pour éviter le zoom Safari.
- Menus déroulants, Skills, Progression, Profil et bibliothèque renforcés contre les débordements horizontaux.
- Le moteur d'entraînement et les données restent inchangés.


## V8.8.3 — Advanced iPhone UI audit
- Audit automatisé aux largeurs 320 / 375 / 393 / 430 px + paysage.
- Correction majeure des cartes Flex dont la description pouvait tomber dans la colonne de l’icône.
- Cartes Semaine réorganisées sur une seule colonne mobile pour donner toute la largeur au résumé.
- Quick Log : séparation propre du nom et de l’unité.
- Cibles tactiles agrandies (retour, fermeture, tutoriels, menus de mesure).
- Cases à cocher rendues plus visibles.
