# Swarm Rebuild — native portfolio integration

This project bundle replaces the earlier approximate cursor-swarm mount with the original `swarm.js` engine supplied by the user from the Swarm Rebuild browser extension.

## Run

```bash
npm install
npm run dev
```

Open the Vite URL. Swarm Rebuild starts automatically on public pages; no launch click is required. The original engine creates its own Shadow-DOM overlay and HUD. Its built-in controls include Tour, speed, sound, Go live, Replay and close.

## What changed

- `src/App.jsx`: removed the old `CursorStage` mount and mounted `SwarmRebuildLauncher` once at the app root.
- `src/components/vfx/SwarmRebuildLauncher.jsx`: automatic local script loader; no extension API required. Visual animation starts without a click. Browser autoplay policy may still defer synthesized audio until the first user interaction.
- `src/components/vfx/swarm-rebuild-launcher.css`: small launch control.
- `public/swarm-rebuild.js`: original engine source supplied in the extension ZIP.

The previous custom CursorEngine files remain in the project but are no longer mounted by `App.jsx`.

## Important limitations

- This uses the original engine's DOM capture/reconstruction and synthesized Web Audio sound. The speaker control is sound effects/music, not spoken voice narration.
- The extension's `background.js` screenshot step is not included. Canvas/video/iframe content that cannot be reconstructed from the DOM may use the engine's built-in placeholders rather than a captured screenshot.
- The source bundle does not demonstrate WebSocket or multiplayer synchronization; its visible agents are locally simulated. The original UI says “multiplayer cursors,” but no live multiplayer backend was present in the supplied files.
- The original extension metadata identifies Swarm Rebuild v1.1.0. Attribution retained: Swarm Rebuild by DhvanilPatel, a tribute to Swarm by Joel Califa.

## Verification

`node --check public/swarm-rebuild.js` and source syntax checks are run during packaging. A full Vite build and browser interaction test must still be run on the user's Windows machine because this package environment cannot launch the user's local Edge/localhost browser.
