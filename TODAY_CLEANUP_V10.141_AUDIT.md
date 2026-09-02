# KINETIK v10.141 — Today cleanup audit

## Scope
UX-only simplification of the Today page.

## Changes
- Removed the standalone **Gainage** shortcut from Today.
- Removed the standalone **Ajouter une session** shortcut from Today.
- Both actions remain available through the global **+ Ajouter** hub.
- Removed the isolated Rank/Bronze shortcut card.
- Merged current rank status into the final **À surveiller** card.
- Rank strip keeps the active rank palette (`rank-bronze`, etc.), progress toward the next rank, and direct access to Skills/Ranks.

## Integrity
No Daily Tasks, activity, core timer, Quick Log, rank calculation, planning, Web Push or account logic was changed.

## QA
- 631 functional checks passed.
- JS/API syntax passed.
- Vercel Hobby invariant: 12 API functions.
- PWA cache: `kinetik-v10-141-today-cleanup`.
