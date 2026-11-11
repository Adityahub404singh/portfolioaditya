# Cursor Swarm Visual Fix

## What the supplied browser screenshot exposed
- The old off-screen-target fallback sent teams to a distributed line near the top of the viewport.
- Orbit radius was a small fixed value around an element's center, so particles appeared over large text and images.
- A 52% interpolation toward team-wide idle x positions kept teams spread across the viewport instead of following their assigned DOM targets.

## Changes
- Teams now select only targets whose DOM elements intersect the viewport.
- Off-screen targets no longer create a top-edge holding row; their agents are not drawn until their assigned team has a visible target.
- Orbit coordinates are calculated from the target element's actual width and height plus an outside padding, keeping particles around the perimeter rather than over the content.
- Agents move directly toward their assigned target rather than blending with a viewport-wide idle position.
- Overall swarm opacity is reduced to 0.42 (0.30 on narrow screens).

## Verification status
- This is a source-level visual correction based on the screenshot and the actual CursorSwarm implementation.
- The user's local `npm run build` had succeeded before this patch. The current container does not have a complete `node_modules` installation, so this patched archive still needs `npm install` and `npm run build` on the user's machine.
- A real browser screenshot after this patch is still required to verify the final visual behaviour.
