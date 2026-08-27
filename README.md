# Calisthénie Coach V9.1 — Training System

V9.1 transforme le programme en système d'entraînement intermédiaire complet sur 6 jours, avec lundi de repos.

## Programme hebdomadaire

- Mardi : Push + Handstand
- Mercredi : Pull + Grip + Core
- Jeudi : Jambes + Cardio
- Vendredi : Skills + Mobilité
- Samedi : Full Body
- Dimanche : Endurance + Mobilité
- Lundi : récupération complète

Chaque journée active contient un échauffement, un bloc principal, du cardio et un retour au calme / mobilité.

Le programme complet prévoit environ 160 minutes de cardio Zone 2 par semaine. La version Express conserve du cardio mais sert surtout aux journées où le temps manque ; plusieurs Express dans la même semaine peuvent être complétées par une course ou une marche synchronisée avec Strava.

## Deux formats

Avant chaque séance du programme, l'utilisateur choisit :
- Séance complète : volume prévu complet ;
- Séance Express : mouvements essentiels, moins de séries/accessoires, mais échauffement + cardio + retour au calme conservés.

La readiness quotidienne, le cycle de 8 semaines, les substitutions, les progressions et les temps de repos restent ensuite appliqués.

## Guidage

Les échauffements et retours au calme disposent d'un guide étape par étape visible dans le coach. Les phases sont étiquetées : échauffement, renforcement/skill, cardio, étirements/retour au calme.

## Audit automatique

L'écran Progression contrôle :
- la couverture de 11 zones/fonctions (pectoraux, dos, épaules, biceps, triceps, core, quadriceps, ischios, fessiers, mollets, grip) ;
- le cardio hebdomadaire ;
- les 6 échauffements et 6 retours au calme ;
- l'utilisation du matériel : Power Tower, barres parallèles, poignées de pompes, bandes, tapis et sac à dos.

Les volumes affichés sont des séries pondérées internes, utiles comme indicateur d'équilibre et non comme prescription absolue.

## Mes séances

Dans Plus → Mes séances, l'utilisateur peut :
- créer une séance personnelle ;
- copier n'importe quelle journée du programme ;
- ajouter, remplacer, supprimer et réordonner les exercices ;
- modifier phase, séries, répétitions/secondes et repos ;
- lancer, dupliquer ou supprimer une séance ;
- vérifier si échauffement, cardio et étirements sont présents.

Les séances personnelles sont sauvegardées localement et incluses dans l'export/import JSON.

## Déploiement

Le contenu de ce dossier est prévu pour être placé directement à la racine du dépôt GitHub connecté à Vercel. Les routes Strava et les variables d'environnement existantes sont conservées.
