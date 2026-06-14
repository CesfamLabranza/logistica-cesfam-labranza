# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static, single-page web app for logistics/inventory at CESFAM Labranza (a Chilean public health clinic). The UI shows the building floor plan (`assets/plano-cesfam.png`) with clickable zones (boxes, offices, dependencies); clicking a zone opens a modal listing that zone's inventory. UI language is Spanish — keep all user-facing strings in Spanish.

No build step, no framework, no dependencies. Plain HTML/CSS/JS reading a JSON file via `fetch`.

## Running / developing

Must be served over HTTP (the `fetch("data/inventario.json")` call fails on `file://`). From the repo root:

```
python3 -m http.server 8000   # then open http://localhost:8000
```

Deploys to **GitHub Pages** — `.nojekyll` is present to disable Jekyll processing. Keep everything compatible with static hosting (no server-side code, relative asset paths). There is no test suite, linter, or package manager.

## Architecture

Three files do all the work, plus one data file:

- `index.html` — landing screen + app shell + the inventory modal markup.
- `style.css` — all styling, including absolute-positioned zone coordinates.
- `script.js` — the entire app logic (~110 lines, no modules).
- `data/inventario.json` — the data source. Object keyed by zone `id`; each entry has `nombre`, `responsable`, and `items[]` (`{nombre, cantidad, estado, observacion}`).

Flow: landing screen → click **"Ingresar al sistema"** → `ingresar()` hides landing, shows `#app`, `fetch`es the JSON, then builds zones → click a zone → `mostrarInventario(id)` populates and opens the modal.

## Critical gotcha: two competing zone systems

There are **two mutually exclusive ways** zones get positioned, and they currently conflict:

1. **Static (HTML + CSS):** `index.html` hardcodes `<button class="zone z-*" data-id="...">` elements, and `style.css` positions each via `.z-*` rules (percentage `left/top/width/height` relative to `.map-wrapper`).

2. **Dynamic (JS + JSON):** `crearZonasDesdeInventario()` in `script.js` **removes every `.zone` element** and recreates them from `inventario.json`, reading per-entry `x/y/w/h` (percent) fields. Entries lacking all four of `x/y/w/h` are silently skipped.

The dynamic path runs on every "Ingresar". The current `data/inventario.json` has **no `x/y/w/h` fields**, so all hardcoded zones get deleted and none are recreated → **the map renders with no clickable zones.** When changing zone layout, pick one system:

- To use the JSON-driven approach, add `x/y/w/h` to each entry in `inventario.json` (copy the values from the matching `.z-*` rule in `style.css`).
- To use the static approach, neutralize/remove the zone-removal-and-rebuild in `crearZonasDesdeInventario()` so the HTML zones survive (the HTML buttons have no click handler of their own — wiring clicks is currently the JS rebuild's job).

When adding a zone, keep the `id` consistent across all four places it can appear: `inventario.json` key, `data-id`, the `z-*` CSS class, and the button text.

## Conventions

- All dynamic HTML inserted into the modal goes through `escapeHtml()` — keep that when adding fields that render user/data content.
- Per the repo's `Desarrollo/AGENTS.md`: don't remove existing functionality, don't rename files without justification, keep the layout responsive, and update docs when adding a feature.

## Repo layout note

`Desarrollo/` is a **separate nested git repository** (its own `.git`) holding project docs (`AGENTS.md`, `README.md`, and `docs/*` templates). The root-level `AGENTS.md` and `docs/*.md` files are present but empty.
