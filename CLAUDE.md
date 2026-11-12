# CLAUDE.md — Viewer Camping Cottet

**Chemin :** `L:/CORE/labs/camping-cottet-2026/apps/app-viewer/`
**Stack :** Vite 8 + React 19 + PWA + Playwright
**NSM project_id :** `p-mp9r25nqaks`

## Rôle

PWA mobile-first, **lecture seule**, pour consulter le plan du camping sur le terrain : hébergements, bornes eau/élec, liaisons. Zoom/pan SVG, panneau bas avec détails. Offline-capable.

⚠ **Pour aangee et le personnel — 4 à 5 personnes identifiées, pas pour les vacanciers**
(décision d'aangee, 2026-11-12). L'hébergement sur GitHub Pages la rend atteignable par qui
a l'URL, mais aucun public n'est visé. *Cette ligne disait « publique ».*

## Position dans la suite

Consommateur du studio admin (cf. `apps/CLAUDE.md`). Reçoit ses données via `public/data.json`, généré par le module `viewer` du studio puis poussé ici via `npm run sync:viewer` (script `app-admin/tools/sync_viewer_data.mjs`).

**Ne jamais éditer `public/data.json` à la main.**

## Structure src/

```
src/
  App.jsx                — État racine (data, selected), fetch data.json
  components/
    BottomSheet.jsx      — Panneau détails hébergement / borne sélectionnés
    InstallPrompt.jsx    — Prompt iOS « Ajouter à l'écran d'accueil »
    DataFreshnessWarning.jsx — Bandeau ambre si données > refresh_hint_days
    SchemaVersionWarning.jsx — Bandeau rouge si schema_version incompatible

Note : PlanSVG et useHighlight sont fournis par @aangee/cottet-plan-lib (C2 — 2026-05-29)
  index.css              — Design tokens (dark theme), animations pulse
```

## Format `public/data.json`

Top-level :
```json
{
  "_meta": {
    "schema_version": 2,
    "generated_at": "2026-05-22T...",
    "content_hash": "a3f9c12b...",
    "refresh_hint_days": 30
  },
  "hebergements": [{ "id", "nom", "type", "borne_eau", "borne_elec", "cx", "cy" }],
  "bornes_eau":   [{ "id": "EAU-XX", "num", "x", "y", "parcelles": [...], "note"? }],
  "bornes_elec":  [{ "id": "ELEC-XX", "num", "x", "y", "parcelles": [...], "distribue_vers": [...]?, "note"? }]
}
```

`_meta` est destructuré dans `App.jsx` avant `setData()` — les composants ne le voient pas. Si `generated_at` dépasse `refresh_hint_days` jours, `DataFreshnessWarning` affiche un bandeau ambre.
```

Coords en pixels SVG (viewBox 2560×1567, taille native plan_fond.png).

## Conventions

- **State** : `useState` local, pas de Zustand
- **Style** : CSS vanilla + custom properties
- **Tests** : Playwright smoke (`tests/smoke.spec.js`) — chargement, clic hébergement, drag
- **Pas de `.env`** — tout est public/statique

## Build & deploy

- `vite.config.js` : `base: '/camping-viewer/'` (mis à jour 2026-05-20 après renommage repo)
- GitHub Actions : `.github/workflows/deploy.yml` (node 20, `npm ci --legacy-peer-deps`, deploy Pages)

## Scripts npm

```
dev / build / preview / lint / generate-pwa-assets
```

## Pièges connus

- `BASE_URL = '/camping-viewer/'` → tout chemin public doit utiliser `import.meta.env.BASE_URL`
  *(ce piège annonçait `/camping-cottet-viewer/`, qui n'existe nulle part : `vite.config.js`
  et la section « Build & deploy » ci-dessus disent `/camping-viewer/` depuis le renommage
  du dépôt, le 2026-05-20. Corrigé le 2026-11-12.)*
- `react-zoom-pan-pinch` v4 → la transformation affine est appliquée inline dans PlanSVG (utilisée pour le culling perf)
- PWA Workbox cache `data.json` → un refresh nécessite une nouvelle visite ou un skipWaiting
