# Single-page card table — October 2, 2026

The app runs at `/Solitaire-And-Friends/`. Switching between Solitaire and UNO
changes React state rather than navigating to a game directory. Scores,
settings, and deal controls stay in modal sheets. The welcome artwork and intro
renderer are unchanged.

Solitaire keeps its existing saved-game controller. UNO now exposes a scoped
mount function with cleanup for computer-turn timers and always seats the human
with three computer opponents. Switching away from UNO ends that round; returning
starts another. Solitaire retains its checkpoint when switching games.

An active board requests the browser's standard unload confirmation. Browsers
control the wording and do not consistently provide this on phones. A browser
reload reopens the active game in this tab and restarts it: Solitaire restarts
the same deal; UNO deals a fresh round. Closing and later opening the app still
preserves Solitaire's normal checkpoint behavior. No custom confirmation text
is promised.

The production build has one Vite HTML entry point and includes only the two
game directories. Legacy card-game URLs have compatibility entry documents;
the app replaces those URLs with the root URL. Original unrelated game source
files remain in Git but are excluded from the release build.

Validation: production build, `tools/verify-runtime.cjs` at phone and desktop
sizes, `tools/verify-rules.mjs`, and all 97 protected artwork hashes.

## Next visual pass

Investigate black/transparent intro cards on the actual phone before changing
the existing visual treatment. Prototype a distant rotating table behind the
title, then a fixed play camera. Keep controls/logo at native resolution and
cap only the 3D drawing buffer. Green felt, blue felt, and acrylic over wood
can share geometry and change materials. Benchmark fill rate, transparency,
frame pacing, and battery before moving gameplay card rendering to WebGL.

A 3D background does not inherently require a paid service or game server.
Its costs are implementation, texture downloads, GPU/battery use, and testing.
Any dollar or development-time quote needs a defined quality target and actual
device measurements. The refactor does not add a 3D dependency or renderer.
