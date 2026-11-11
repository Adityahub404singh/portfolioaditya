# Terminal diagnostics (2026-11-11)

## Findings from the uploaded project

1. `npm run build` was executed from the project root and failed with:
   `sh: 1: vite: not found`
2. The `node_modules` directory in the extracted archive was incomplete. `node_modules/vite` existed only as an empty directory and `node_modules/.bin` was absent.
3. `npm ci --offline --ignore-scripts --no-audit --no-fund` failed with `ENOTCACHED` because the required `yallist` package tarball is not in the local npm cache. An online `npm ci` attempt did not complete in the available execution window.
4. Static source audit found no unresolved relative imports under `src`.
5. Static scan of all uploaded JS/JSX/TS/TSX files found no `tw` identifier. Therefore the reported `tw` TDZ issue is not reproducible from this uploaded archive; the file containing the reported hero intro `tw` variable is not present in this version.

## Fixes retained in this project

- `SiteLayout.jsx`: persistent cursor canvas is mounted outside `.app-shell` to avoid clipping from `overflow: hidden`.
- `CursorSwarm.jsx`: removed timer-driven orbit/convergence/grid/dispersion modes and replaced them with scroll-driven scene selection and compact colour-coded delivery teams targeting real DOM elements.
- Touch screens no longer return early solely because `(pointer: fine)` is false.
- The canvas remains pointer-events-none, respects reduced motion and the existing Motion ON/OFF preference, pauses while the document is hidden, and cleans up its observer/listeners/RAF.

## Required local repair

From the project root on the user's machine:

```powershell
Remove-Item -Recurse -Force node_modules
npm cache verify
npm install
npm run build
npm run dev
```

If `npm install` fails, capture the complete terminal output. Do not copy a `node_modules` folder from another project or another machine.
