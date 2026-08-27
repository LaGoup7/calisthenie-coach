# Calisthénie Coach · V9.1.1

## Changements
- Programme par défaut sans sac à dos.
- Squat principal remplacé par **Squat avec bande**.
- Bulgarian split squat et fentes en poids du corps pour le moment.
- Setup actif : Power Tower, barres parallèles, poignées de pompes, bandes et tapis.
- Les anciens exercices au sac restent compatibles avec l’historique mais sont masqués des choix courants.

## Strava
- Callback OAuth fixé sur l’URL de production Vercel lorsque disponible.
- Validation explicite des 3 variables Vercel.
- Endpoint OAuth moderne `https://www.strava.com/oauth/token` avec fallback de compatibilité.
- API activités sur le nouveau domaine `https://api-v3.strava.com` avec fallback.
- Diagnostic sans secret : `/api/strava/health`.
- Messages d’erreur plus précis après retour OAuth.

### Variables Vercel
- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`
- `STRAVA_SESSION_SECRET`

Le callback attendu dans Strava reste `calisthenie-coach.vercel.app`.
