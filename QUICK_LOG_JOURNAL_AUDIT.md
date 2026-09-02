# KINETIK v10.137 — Quick Log Journal & bandes compactes

## Objectif
Améliorer l'Enregistrement rapide sans toucher au moteur de progression : rendre les bandes lisibles dans les cartes favorites et remplacer l'annulation du dernier ajout par un journal où chaque ligne peut être supprimée individuellement.

## Bandes
- Les choix de bande gardent la couleur et le nom.
- L'intervalle est compacté visuellement : `15,9–38,6 kg` devient `16–39 kg`.
- Le libellé complet reste disponible dans le `title` du bouton.
- La mise en page des 5 bandes est recentrée et contrainte pour ne plus déborder dans les cartes favorites.

## Journal Quick Log
Le bas du panneau affiche les 20 derniers enregistrements rapides avec :
- exercice ;
- date/heure ;
- valeur ;
- bande ou lest éventuel ;
- origine rapide/gainage ;
- suppression ciblée.

La suppression agit sur la ligne réelle de `cc_quick_logs`; volume, progression et récents sont donc recalculés immédiatement au prochain rendu.

L'ancien bouton « Annuler le dernier ajout » n'est plus rendu.

## QA
- 565 contrôles fonctionnels cumulés ;
- 24 contrôles dédiés à v10.137 ;
- syntaxe JS/API valide ;
- 12 fonctions Vercel physiques.
