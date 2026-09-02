# KINETIK v10.145 — Mobilité finalisée

## Objectif
Réduire la densité de la page Mobilité sans retirer le moteur de recommandation, les mesures ou l'historique.

## Structure finale
1. **Aujourd'hui** — zone à travailler, raison, format et lancement de routine.
2. **Ton bilan mobilité** — 6 zones, score lisible, niveau, fraîcheur et mesures intégrées.
3. **Progression** — état vide, première référence ou vraie évolution selon le nombre de dates de mesure.
4. **Second niveau** — historique, méthodologie, réglages et sécurité.

## Changements UX
- Fusion de l'ancien profil et du bloc Évaluation en un seul **Bilan mobilité**.
- Chaque zone est directement ouvrable et contient ses tests.
- Vocabulaire : `Recovery` → `Récupération`, `Priorité` → `Zone à travailler`.
- Score accompagné d'un niveau : À travailler / À améliorer / Correcte / Bonne / Excellente.
- Fraîcheur visible : À jour / Bilan partiel / À actualiser.
- La règle de fraîcheur est alignée sur Daily Tasks : **28 jours**.
- Une seule date de mesure n'affiche plus de graphique trompeur.
- À partir de deux dates, affichage du graphique et du delta depuis la première référence.
- Une routine réalisée aujourd'hui est explicitement signalée avec durée et confort.
- Historique, compréhension, réglages et sécurité sont relégués au second niveau.

## Non-régression
- Moteur de priorité mobilité inchangé.
- Routines existantes inchangées.
- Stockage des mesures inchangé.
- Daily Tasks continue d'ouvrir `#mobilityAssessment` et le test ciblé.
- Les boutons `.save-mobility`, `.start-flex` et `[data-mobility-zone]` restent compatibles.

## Validation
- `MOBILITY_FINAL_OK 16 checks`
- Suite complète : **686 contrôles fonctionnels + 15 contrôles statiques**.
- Syntaxe JS et compte Vercel contrôlés avant packaging.
