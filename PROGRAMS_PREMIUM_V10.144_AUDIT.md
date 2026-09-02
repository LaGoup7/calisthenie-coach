# KINETIK v10.144 · Programmes premium management

## Objectif
Faire de `Planning > Programmes` un outil de programmation, sans dupliquer Calendrier ou Progression.

## Structure finale
1. Programme actif : nom, phase, semaine, objectif, rythme, formats.
2. Semaine type : aperçu compact des 7 jours.
3. Séances : contenu du cycle et impact de chaque journée.
4. Réglages du cycle : progression, fréquence, cardio intégré.
5. Autres programmes : liste secondaire repliable.
6. Séances libres : entraînements indépendants du cycle.
7. Actions du programme : duplication, nouveau bloc, nouveau programme, archivage si applicable.

## Éditeur de séance
- Les contrôles ↑ / ↓ de réordre sont explicités.
- L'aperçu avant sauvegarde affiche : durée estimée, nombre d'étapes, zones sollicitées et matériel.
- Les contrôles existants de modification, suppression et Express sont conservés.

## Principes de non-redondance
- Pas de heatmap dans Programmes.
- Pas d'historique de progression.
- Pas de rang, PR ou mensurations.
- Calendrier reste la vue temporelle ; Programmes reste la vue structurelle.

## Validation
- `PROGRAMS_PREMIUM_OK 20 checks`
- Suite fonctionnelle complète : 670 contrôles.
- Contrôles statiques historiques : 15.
- Syntaxe JS et fonctions Vercel contrôlées avant packaging.
