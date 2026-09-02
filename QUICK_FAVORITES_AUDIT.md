# KINETIK v10.136 — Favoris Enregistrement rapide

## Objectif
Transformer **Enregistrement rapide → Enregistrer une performance** en surface personnalisable : l'utilisateur choisit les exercices qu'il pratique le plus et les retrouve immédiatement lors de chaque Quick Log.

## Comportement
- jusqu'à **8 exercices favoris** ;
- configuration dans le Quick Log via **Gérer** ;
- recherche dans la bibliothèque complète ;
- filtres par catégorie ;
- ajout/retrait par étoile ;
- réordonnancement manuel ↑ / ↓ ;
- suggestions classées selon l'utilisation des 90 derniers jours (Quick Logs pondérés + exercices vus en séance) ;
- ancienne liste fixe utilisée uniquement comme configuration initiale ;
- favoris sauvegardés dans `cc_quick_favorites_v1` et inclus dans les sauvegardes JSON.

## Saisie favorite
Chaque favori affiche :
- la dernière valeur Quick Log si disponible ;
- deux valeurs rapides adaptées aux reps/holds ;
- une saisie exacte ;
- le sélecteur de bande pour les mouvements assistés.

Les favoris n'altèrent ni le programme, ni les objectifs, ni les règles de progression : ils accélèrent uniquement l'enregistrement.

## UX
L'écran principal reste volontairement court :
1. Mes favoris ;
2. Récents ;
3. Autre exercice / bibliothèque complète.

Le gestionnaire des favoris est un mode distinct de la feuille Quick Log pour éviter d'encombrer la saisie quotidienne.

## QA
- toutes les suites historiques v10.136 : vertes ;
- `QUICK_FAVORITES_OK 27 checks` ;
- stockage, maximum 8, ordre, recherche, catégories, suggestions d'usage, valeurs rapides et backup vérifiés.
