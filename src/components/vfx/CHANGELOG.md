# Cursor Swarm v2 (advanced)

Drop-in replacement: same file names, same exports, same imports. Replace the 4 files in your cursor folder.

## cursorEngine.js
- Sprite cache: arrows pre-rendered once per colour (plain + glow); drawImage replaces per-agent fill/stroke/shadowBlur (biggest perf win)
- Velocity tilt (cursors lean into their direction of travel)
- Adaptive quality governor: scales density down AND back up (15 s cool-down); fx (glow/trails/neural lines) auto-off on weak devices
- Click shockwave, hover/keyboard-focus orbit around interactive elements (engine.setHover(el))
- New formations: helix (dsa), constellation (achievements) + neural lines on achievements
- Pending-formation queue (formation no longer gets stuck if scrolling stops inside the cool-down)
- Scroll-velocity decay (parallax no longer stays offset after scrolling stops)
- Anchor cached once per frame (was one getBoundingClientRect per agent per frame)
- No per-frame closure allocation in separation; pause()/resume() API
- Fixes: follower history started at (0,0); history index wrap with large slots; pointerleave on document never fired; roundRect fallback; touch pointer stuck "active"

## storyController.js
- Declarative API: data-story="wipe|lines|mask|ring" data-story-agents="6", data-story-skip to opt out
- MutationObserver wait for Home (old version gave up after ~3 s), ignores its own DOM writes
- Debounced ScrollTrigger refresh on late images / fonts / load
- Scene detection cached, re-run on refresh (correct when landing mid-page), stable anchor fns
- Safety net: any failure/destroy clears every inline clip-path touched; reduced-motion guard

## CursorStage.jsx
- Hover + keyboard-focus (focus-visible) awareness wired to the engine
- Magnetic buttons: rAF-throttled, clamped offsets, mouse/pen only
- Non-home routes switch to the ambient scene; real pointerleave on <html>; debug handle cleaned up

## cursor-swarm.css
- print / forced-colors hide, press feedback on magnetic buttons, reduced-motion reset, clip-path safety nets
