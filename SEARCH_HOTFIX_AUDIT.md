# KINETIK v10.139 — Correctif recherche Quick Log

## Symptôme
Le champ de recherche recevait bien la saisie et le moteur calculait correctement les correspondances, mais certaines cartes restaient visibles.

## Cause
Le filtrage reposait uniquement sur l’attribut HTML `hidden`. Les cartes Quick Log utilisent un `display:grid` explicite dans la feuille de style ; ce style pouvait neutraliser visuellement le masquage dans le navigateur/PWA.

## Correction
- helper commun `setQuickSearchVisibility()` ;
- `hidden` conservé pour la sémantique ;
- classe `quick-search-hidden` avec `display:none!important` ;
- `style.display` explicite en garde supplémentaire ;
- même correction appliquée au gestionnaire de favoris et à `Autre exercice` ;
- recherche insensible aux accents ;
- une requête texte repasse automatiquement sur `Tous`.

## Validation
`test-search-hotfix-runtime.js` vérifie le rendu visuel du filtre (`style.display`) et non seulement l’état `hidden`.
