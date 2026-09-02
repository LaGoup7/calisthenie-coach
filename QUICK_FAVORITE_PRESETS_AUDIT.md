# KINETIK v10.138 — Favoris Quick Log paramétrables

## Objectif
Permettre à chaque favori de définir trois valeurs rapides propres, tout en conservant la saisie libre.

## Exemple
Pour **Pompes**, l'utilisateur peut configurer `10 / 20 / 25`. Ces trois valeurs deviennent les boutons immédiats de la carte favorite. Le champ **Valeur exacte** reste toujours disponible.

## Stockage
Nouvelle clé locale : `cc_quick_favorite_presets_v1`.
Elle est incluse dans le système de sauvegarde KINETIK via `STORAGE`.

## Gestion
Dans **Gérer mes favoris**, chaque favori expose trois champs numérotés `1 / 2 / 3`. Les valeurs sont normalisées en nombres entiers positifs et complétées avec des valeurs cohérentes si nécessaire.

## Recherche réparée
La recherche :
- ignore les accents/casse ;
- recherche dans toutes les catégories dès qu'un texte est saisi ;
- sélectionne le premier résultat visible lorsque nécessaire ;
- conserve les filtres de catégorie lorsque le champ de recherche est vide.

## Non-impact
Aucune modification de la logique de programme, progression, volume ou rang. Les favoris restent une couche de saisie rapide.
