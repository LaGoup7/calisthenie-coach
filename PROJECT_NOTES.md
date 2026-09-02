# KINETIK — Project Notes

Current package: **v10.148**

This file replaces the historical audit/step Markdown files that were removed from the distributable ZIP.

## Runtime architecture
- `app.js` — core runtime, storage, Quick Log, Add hub
- `app-adaptive.js` — adaptive coaching and assessment intelligence
- `app-planning.js` — Planning, programs, activities, core timer
- `app-progress.js` — Mobility and Progression UX
- `app-body.js` — body map and measurements
- `app-journey.js` — Today, daily journey, reminders UI
- `daily-tasks.js` — daily task engine
- `local-reminders.js` — local notification fallback
- `web-push-manager.js` — Web Push client/health
- `account-manager.js` — local-first multi-device identity

## Deployment constraints
- Vercel Hobby: **12 physical API functions**, currently exactly 12.
- Do not add a new physical function under `api/` without consolidating another one.
- `/api/account` uses the existing Push Status function through a rewrite; there is intentionally no `api/account.js`.

## Current product structure
- Aujourd’hui: execution cockpit, universal `+ Ajouter`, Daily Agenda.
- Planning / Calendrier: heatmap, week navigation, day states, external activities, one-off workout moves.
- Planning / Programmes: active program, week template, session editing/reordering, cycle settings.
- Mobilité: today routine, mobility assessment, progression, secondary history/settings/research.
- Progression: Overview, Performances, Skills, Body, History, Rank.
- Rank uses real performance/capability gates; no account age/session-count promotion.

## Data principles
- Local-first sports/body data.
- Account groups installations only; sports data is not cloud-synced.
- Backup schema includes body photos and application data while preserving device identity on import.
- Quick Log favorites support 3 custom preset values plus exact manual entry.

## Packaging policy
The user-facing working ZIP is intentionally lean. Historical audits and regression test files are kept out of the package and should not be reintroduced into the app ZIP. A production-only cleanup can be done again at final release if needed.

## v10.148 · Rangs clarifiés
- Argent: 3 standards réels uniquement (5 tractions, 8 dips, dead hang 45 s).
- Or: standards réels + diversité technique; pas d’indices composites redondants.
- Les indices composites de capacité commencent à Platine, où ils servent à vérifier l’équilibre global.
- La colonne de droite des rangs affiche valeur réelle / objectif ou score en points + seuil explicite.

## v10.148 · Corps 3D réintégré
- Le modèle corporel 3D n'a jamais été supprimé du runtime ; il est de nouveau visible dans `Progression → Corps`.
- Il reste interactif : rotation 360°, 3D/2D, Face/Dos, Vue d'ensemble/Force/Mobilité, zones cliquables.
- Les courbes Poids/Tour de taille/Masse grasse restent sous la carte 3D et ne sont pas fusionnées avec son scoring.
