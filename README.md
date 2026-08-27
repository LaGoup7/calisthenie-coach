# Calisthénie Coach V9.0.2 — Strava connection fix

Fixes an issue where the PWA service worker cached `/api/strava/status` and could keep showing “not connected” after a successful OAuth authorization.

Changes:
- `/api/*` is never cached by the service worker.
- Strava status/activity fetches use `cache: no-store`.
- OAuth callback validates the scope returned by Strava's redirect, with token response as fallback.
- PWA cache bumped to V9.0.2 so old API cache entries are purged on activation.

After deployment, fully close/reopen the PWA once. If the old service worker is still active, open the production URL in Safari first, wait a few seconds, then reopen the Home Screen app.
