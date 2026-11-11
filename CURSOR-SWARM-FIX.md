# Cursor swarm and scene-controller repair

## Findings in the uploaded source

- The supplied `src/components/vfx/CursorSwarm.jsx` used a 6.5-second autonomous mode timer (orbit/convergence/grid/dispersion). Scroll events only refreshed safe rectangles; scroll position did not control the cursor choreography.
- The canvas was mounted inside `.app-shell`, while the global stylesheet gives `.app-shell` `overflow: hidden`. This can clip a viewport-fixed canvas and place it in the wrong stacking context.
- The swarm returned early on `(pointer: fine) === false`, so touch-first devices received no swarm.
- A scan of the uploaded `src` JavaScript/JSX files found no `tw` identifier, so the reported `tw` temporal-dead-zone issue is not present in this particular archive and cannot be attributed to its source.

## Changes made

- Moved the single `CursorSwarm` canvas outside `.app-shell` in `SiteLayout`, retaining the public-site-only lifecycle.
- Replaced the autonomous 6.5-second mode timer with a scroll-driven active-scene controller.
- Collects actual DOM targets in each scene (headings, paragraphs, images, project/skill/stat cards, links and buttons).
- Splits the responsive swarm into ten colour-coded teams. Each team moves as a compact formation toward a different target in the active scene instead of scattering over the viewport or crowding one heading.
- Keeps standard arrow orientation, independent seeded motion, velocity/inertia, restrained trails, pointer attraction/repulsion and click ripples.
- Supports touch layouts, respects `prefers-reduced-motion` and the existing Motion ON/OFF preference, pauses while the tab is hidden, and cleans up listeners, observer and RAF on unmount.
- Content remains semantic HTML; cursors are visual only and never click or submit anything.

## Verification status

- Source inspection: completed.
- `tw` TDZ scan in the uploaded source: no `tw` references found.
- Production build: not verified in this environment because `npm ci --no-audit --no-fund` did not complete before timeout. Run `npm install` and `npm run build` locally.
- Browser scroll-up/down, fast-scroll and mobile tests: not performed here. Do not treat this package as browser-verified.
