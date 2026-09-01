# Étape 2 — Source unique poids / taille · v10.116

## Contrat de données

- **Taille courante** : `kinetik_athlete_profile_v1.height`
- **Poids courant** : dernier élément de `cc_body` possédant `weight`
- **Taille dans un body log** : snapshot historique uniquement, jamais source courante prioritaire
- **Poids cible** : reste dans le profil (`targetWeight`), car il s'agit d'un objectif et non d'une mesure

## Migration automatique

Au chargement :

1. Taille : `athleteProfile.height` > ancien `prefs.heightCm` > dernier snapshot de taille disponible.
2. La valeur retenue est écrite dans le Profil.
3. `prefs.heightCm` est supprimé.
4. `athleteProfile.weight` est supprimé.
5. Si ce poids legacy est la seule valeur disponible, il est converti en relevé `bodyLogs`.
6. Si un historique de poids existe déjà, aucune mesure legacy n'est créée.

## Écritures après migration

- Modifier la taille depuis Profil ou Mesures écrit dans le Profil.
- Modifier le poids depuis Profil écrit/complète le relevé de Mesures du jour.
- Enregistrer une mesure corporelle continue d'écrire le poids dans `bodyLogs`.

## Tests exécutés

- `node --check app.js`
- `node --check daily-tasks.js`
- migration d'un profil legacy sans historique : PASS
- profil legacy + poids déjà mesuré : PASS
- fusion d'un nouveau poids dans un relevé du même jour : PASS
- setter/getter de taille canonique : PASS
