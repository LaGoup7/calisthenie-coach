# KINETIK v10.133 · Hotfix page Aujourd’hui

## Symptôme

Après le LOT B, le bloc **À faire aujourd’hui** apparaissait avant le hero **Aujourd’hui · jour / séance**, et le raccourci **Gainage** n’était plus injecté.

## Cause

Le cockpit de la v10.132 est rendu avec `today-cockpit today-primary-actions today-primary-shortcuts`. Plusieurs wrappers historiques cherchaient encore exactement `<section class="today-cockpit today-primary-actions">`. Le marqueur n’était donc plus trouvé.

- `app-journey.js` utilisait son fallback et insérait l’Agenda avant le hero ;
- `app-planning.js` ne trouvait plus le cockpit et n’insérait plus `renderTodayCoreTimer()` ;
- les injections adaptative/planning autour du même marqueur pouvaient également être manquées.

## Correction

Les quatre recherches utilisent maintenant le préfixe stable `<section class="today-cockpit today-primary-actions` au lieu de dépendre de la liste exacte des classes.

Ordre vérifié :

1. hero séance ;
2. À faire aujourd’hui ;
3. raccourcis primaires ;
4. Gainage ;
5. suite du contenu Aujourd’hui.

Le système Gainage lui-même n’a pas été réécrit : chronomètre, routines personnalisées et Quick Logs restent inchangés.

## QA

- 494 contrôles fonctionnels cumulés ;
- test dédié `test-today-hotfix-runtime.js` : 14 contrôles ;
- syntaxe JS validée ;
- 12 fonctions Vercel conservées.
