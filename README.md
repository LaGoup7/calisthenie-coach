# Calisthénie Coach · V9.3 — Cycles d’entraînement

## Nouveautés V9.3
- **Cycle de base** conservé comme programme de référence protégé.
- Création de plusieurs cycles hebdomadaires personnalisés par duplication.
- Un cycle peut être **activé** : Aujourd’hui et Semaine utilisent alors automatiquement ce planning.
- Chaque journée d’un cycle personnalisé peut être modifiée ou transformée en repos.
- Un cycle doit conserver **au moins un jour de repos** avant activation.
- Les cycles archivés restent disponibles pour reconstruire l’historique.
- Calendrier de régularité type GitHub sur 16 semaines : séance terminée, repos respecté, séance manquée, repos interrompu.
- Les jours de repos planifiés et respectés donnent **+10 XP récupération**, validés le lendemain.
- Une séance libre ne valide pas artificiellement une journée du cycle : le calendrier vérifie le cycle réellement suivi.
- Le terme « Cycle 8 semaines » du moteur adaptatif est renommé **Phase de progression 8 semaines** pour éviter la confusion avec les cycles hebdomadaires.

## Règle de récupération
Un repos est considéré comme respecté si le jour était planifié comme repos dans le cycle actif et qu’aucune séance guidée, micro-série de renforcement ou course Strava de 15 minutes ou plus n’a été enregistrée. La mobilité douce reste compatible avec le repos.

## Compatibilité
- Historique, Quick Logs, Skill Tree, volumes, Flex, tutoriels, Strava et paramètres existants conservés.
- Les nouveaux cycles et leur historique d’activation utilisent de nouvelles clés localStorage et sont inclus dans les sauvegardes JSON.

## Volume musculaire paramétrique
- Charge réelle = séances complètes, Express, personnelles + Quick Logs.
- Plan officiel affiché séparément.
- Décomposition Principal / Secondaire / Technique selon seuils modifiables.
- Cibles min/max par groupe musculaire modifiables.
- Cible cardio hebdomadaire modifiable.
- L’audit hebdomadaire utilise désormais ces paramètres au lieu d’un seuil fixe.

## Flexibilité paramétrique
- 9 zones suivies : chevilles, hanches, fléchisseurs de hanche, adducteurs, ischios, épaules, pectoraux, thorax, poignets.
- Dose hebdomadaire estimée + nombre de séances par zone.
- Retours au calme des séances de force inclus dans le suivi Flex.
- Cibles par zone, fréquence, minutes dédiées et tension modifiables.
- Objectifs des tests de mobilité modifiables + symétrie des chevilles.
- Base scientifique intégrée à la page Flex avec liens PubMed.
- Routines Rapide / Ciblée / Complète conservées.

## Conservé
- Programme 6 j/7, formats Complet / Express, éditeur Mes séances.
- Bandes à la place du sac à dos.
- Tutoriels vidéo + images.
- Timer iPhone renforcé.
- Strava dans Plus.
- Données existantes compatibles : nouveaux paramètres utilisent de nouvelles clés localStorage.


## V9.2.2
- Le bloc « Détails · Cycle, rang & coach adaptatif » a été retiré de la page Aujourd’hui.
- Le même bloc est désormais disponible dans Plus.
- Aucune donnée ou logique d’entraînement n’a été modifiée.


### Quick Log visuel
- sélecteur par catégories
- recherche instantanée
- miniatures issues des vidéos de référence
- ordre logique par famille de mouvements
- exercice sélectionné clairement affiché avant validation


## V9.2.3
- Refonte visuelle de la page Semaine, sans modifier le moteur d’entraînement.
- Cartes plus plates, contraste réduit et hiérarchie typographique plus claire.
- Suppression des trois gros pills Complet / Express / Cardio au profit d’une ligne de métadonnées discrète.
- Aujourd’hui indiqué par un accent latéral et un petit label, sans contour sombre agressif.
- Action Démarrer transformée en action légère.
- Détails ouverts sur fond très légèrement teinté et exercices moins séparés visuellement.
- Optimisation mobile iPhone et desktop.


## V9.2.4 · Skill Tree sync
- Les paliers mesurables utilisent le meilleur résultat entre tests périodiques et séries de séances guidées.
- Tractions strictes, dips, dead hang et handstand au mur synchronisent automatiquement les jalons correspondants.
- Les missions de rang utilisent la même logique.
- Les Quick Logs restent exclus des promotions/Skill Tree.
- Le Skill Tree affiche désormais la valeur courante et sa source (`séance` ou `test`).


## V9.3 · Volume cumulé
- Nouveau panneau Progrès → Répétitions.
- Total historique + périodes 7/30/90 jours, 1 an, tout et dates personnalisées.
- Séances guidées, Express, personnelles et Quick Logs inclus.
- Détail par exercice et par source.
- Holds séparés en secondes/minutes.
- Les répétitions par côté sont comptées pour les deux côtés.
