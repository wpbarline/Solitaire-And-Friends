# Prompt for Sol: shared card-table runtime, Solitaire feel and Android reliability

You are working in `C:\github-projects\Solitaire-And-Friends`. Read `AGENTS.md`, `IMPLEMENTATION-PLAN.md`, `AUDIT-2026-10-15.md`, `GHOST-MODE.md`, the current Git state and applicable skills before editing. Audit baseline was `33b5c0f`; inspect later changes rather than overwriting them. Treat this as an incremental production migration for a real user's aunt.

## Product direction and order of work

Make the game table a reusable runtime. Solitaire and four-player UNO become game extensions. Future card games reuse cards, zones, dealing, input, audio, storage and tutorials while assembling a distinct experience. Preserve the single-URL, installed Android-PWA feel.

Immediate visible priority: Solitaire's expressive card effects and synchronized haptics. The aunt loves the current effects and enjoys horse-racing/gambling-style sounds. First protect renderer reliability, then enhance deals, foundation arrivals, special moves and wins. Gradually introduce TypeScript and the shared runtime. Table environments and improved ghost presentation follow that foundation. Rummy, poker and a possible card-based horse race are later stages.

Do not start a new game merely because it is more interesting than finishing compatibility, lifecycle or migration work.

## Non-negotiable constraints

1. Preserve the original intro's design, logo and falling-card/chip effect. The owner repeatedly said the intro looked great; the added small cards had defects. Do not redesign, replace or disable the intro globally as a speculative fix. Any compatibility alternative must be targeted, reversible and justified by evidence.
2. Preserve every protected file in `CARD-ART-SHA256.json` byte-for-byte. Run the protection check before and after work. Do not redraw, convert, crop, recompress, rename or replace the original card art. Rendering wrappers may change.
3. Keep this a card-games-only SPA. Home goes Home; Game Select stays accessible. No deeply nested route navigation or website-style screens. Preserve existing deep-link normalization, Android back behavior, modal dismissal and root scope.
4. Preserve names, settings, scores, active Solitaire games, history and ghost recordings. Never clear user storage to make a migration or graphics test pass. Work in isolated test profiles; back up fixtures before mutation.
5. Keep UNO at four players. Preserve currently shipped behavior while extracting it; document existing house rules rather than silently changing them to a rulebook variant.
6. Fix defects with evidence. The OnePlus black-card issue remains unresolved. Gameplay cards use images/CSS; the custom WebGL shader belongs to the intro. Do not equate successful image decoding, a desktop screenshot or a phone-sized viewport with correct physical Android rendering.
7. Keep UI/input and gameplay deterministic and independent of animation completion. Effects may be skipped, canceled or reduced without changing cards, turns, scores, RNG or saved actions.
8. Respect reduced motion, haptics preferences, sound/music controls, visibility changes and unsupported APIs. No mandatory vibration, sensor access, recurring permission prompts or endless decorative rendering.
9. Share asset references and caches rather than copying decks/sounds into each game. Lazy-load optional game content; preserve complete offline behavior for installed content.
10. Do not add networking, accounts, payments, real-money betting, a heavy 3D framework or unrelated games as part of this migration.
11. Keep patches reviewable and reversible. Commit each verified milestone. Never amend unrelated work or perform destructive Git cleanup. Explain material tradeoffs and known limitations plainly.
12. For this handoff, commit locally but do not push or deploy until the owner explicitly authorizes publishing the reviewed implementation. This release gate supersedes older blanket publishing permission for this new migration. Provide a concrete tested commit and release notes before requesting that final approval.

## Gate 0 — establish the baseline

- Inspect Git status and changes since the audit; preserve user work.
- Build the actual production bundle, run meaningful existing rules/runtime/storage/update/replay checks and verify protected art.
- Capture baseline screenshots of title, Solitaire, UNO, settings and ghost mode at narrow portrait, landscape and desktop sizes.
- Record failures as pre-existing or introduced, with evidence. Do not claim all tests pass if a script failed or was skipped. Do not silently change expected outputs to hide defects.

STOP dependent refactoring if the baseline cannot build, protected art differs, or saves cannot be loaded. Diagnose and resolve the blocker; unrelated read-only analysis may continue.

## Gate 1 — diagnose Android black cards

Create a minimal, removable diagnostic surface using the original assets. Distinguish the logo fan, particle canvas, title WebGL background, live cards and ghost cards. Compare raw image rendering, opaque static wrappers, clipping, transforms, transitions and effects independently.

Record device model, OS, browser/WebView version, installed-vs-browser mode, running app release, image URLs/status/decoded sizes, errors and screenshots. Examine relevant GPU/context diagnostics when available; do not fingerprint unrelated user data. Test the affected OnePlus and a working device. The Moto G Pure is a low-end performance target, not a substitute for reproducing the OnePlus GPU issue.

Add a reversible compatibility mode if evidence warrants it: stable opaque paper, simple rendering, minimal clipping/filter/compositing, same protected artwork. Preserve rank/suit readability when assets genuinely fail. Do not rely on one model-name sniff or assert a universal Android failure.

STOP claiming a graphics fix or enabling new GPU-heavy defaults until the real failing device passes. If that device is unavailable, explicitly mark physical verification pending and provide a short reproducible device checklist. Continue independent typed-model/storage work behind existing rendering; do not fabricate verification or stop all useful work.

## Gate 2 — Solitaire effects first

Use the game-feel skill. Attach effects to semantic events such as deal started/card landed, card revealed, foundation advanced, reverse used, shuffle used and game won. Create a bounded, cancelable presentation layer, suitable for later reuse by other games.

- Keep routine moves snappy and readable. Use larger flourishes for meaningful events and the most exuberant card celebration for a win.
- Preserve opaque card paper in every effect that uses transparent face artwork. Keep the original intro untouched.
- Reuse existing sound assets initially. Keep harp menu cues. Any new recorded audio needs exact source, author, license and hash; do not copy game-store audio.
- Provide short, event-aligned haptic patterns with rate limits. Preserve opt-out; absent/denied vibration must be harmless. Clear scheduled haptics when hidden, unmounted or disabled.
- Avoid whole-screen shaking, bright strobing, long input locks and per-card permanent GPU layers. Cap particle/card counts and render resolution. Return to rest and release timers/listeners/resources.

PASS requires before/after visual review, actual move/undo/restart/navigation during effects, reduced-motion and haptics-off checks, invariant game/replay states, and measured performance on available hardware. Describe physical haptics as unverified if no supported device was tested. Do not delay this milestone behind implementing rummy/poker or a universal engine.

## Gate 3 — TypeScript and a small extension contract

Introduce TypeScript incrementally with strict new code and temporary JavaScript interop. Keep runtime validation for storage/imported data; static types do not validate persisted JSON. Add a failing CI type-check using `tsc --noEmit` or equivalent.

IMPORTANT: current engine/audio modules are loaded via `@vite-ignore` and copied as raw files. Move migrated modules to explicit bundler-managed imports/lazy imports. Do not just rename raw browser-loaded `.js` files to `.ts`. Test the production build and offline lazy chunks, not only the dev server.

Define a minimal typed interface covering game/rules version, initial state, validation, legal actions, state transition, public view, outcome, serialization/migration, and optional tutorial/AI capabilities. Use discriminated action types; avoid pervasive `any`, giant game-ID conditionals and inheritance hierarchies.

Shared primitives should include:

- Stable card instance IDs, deck definitions, zones/piles/hands, ownership and face visibility.
- Serializable state and explicit commands; authoritative legality before presentation.
- Seeded randomness with separate streams for deals, AI and visual environments.
- Session lifecycle, pause/resume, active clock and disposal.
- Layout/input mapping, semantic presentation events, renderer and asset catalog.
- Versioned checkpoints, event journal, replay and tutorial integration.

Keep rules game-specific. Solitaire foundations, UNO wilds and poker betting are not the same operation just because cards move. AI and tutorial views must not expose hidden cards accidentally. Do not make all card types fit a standard 52-card rank/suit interface.

PASS requires Solitaire and UNO both running through the contract, deterministic fixtures, existing behavior preserved, complete instance cleanup and validated production/offline delivery. STOP adding new games until both extensions pass; do not mistake two wrappers around global singleton controllers for completed extraction.

## Gate 4 — persistence, updates and recordings

Preserve existing storage keys through explicit migrations. Give UNO a deterministic resumable checkpoint, including turn/phase, draw/discard order, hand identities, direction, current color and pending choices. Restore logical state without duplicating old timers or AI moves.

Ghost recording already exists. Keep its initial deal, active timestamps and moves; validate legacy runs. Improve storage using bounded transactional writes, preferably IndexedDB, with visible failure handling. Do not rewrite a growing archive synchronously on every animation frame or silently discard playable saves. Define retention and storage-full behavior. Test migration failure and rollback.

Same-deck ghost race is the default. Offer different-deck play only as a clearly labeled casual mode with separate comparison results. Preserve deal/rule version, assistance markers, completion status, opponent identity and timing across updates. Tutorial progress must not pollute normal records.

Use an expandable lower ghost region, potentially approaching half the usable phone screen where live cards remain tappable. Tuck the bottom controls away but provide an obvious Controls action. Never squeeze the live board into unreadable cards to enforce a rigid 50/50 split. Do not silently replace an active game without explaining that consequence.

Keep Check for updates accessible in Settings → App. Display the running release and explicit checking/downloading/ready/failed states. Save before activation; defer safely during gestures, special moves and decisions. Use revision-consistent code/chunks and cache manifests. Test interrupted installs, old/new tabs, offline startup, cache refresh, unchanged-worker cache repopulation, and UNO/Solitaire/ghost resume.

PASS requires migrated save fixtures, exact checkpoints after actual worker replacement, no mixed-release missing modules, clear quota failures, and offline recovery. STOP deployment if any existing saved game or recording is lost/corrupted, or an update restarts an active round unexpectedly.

## Gate 5 — table environments and slight gyroscopic depth

Implement green felt, blue felt and glass/acrylic over wood flooring as environment presets. Show the table edge and floor beyond it. For glass, show the floor through the surface plus restrained reflections, tint, edge thickness and shadows. Prefer layered 2D/2.5D first; full 3D requires a separate measured proposal.

Randomly select from enabled presets once at session/deal creation and persist the choice. Provide a fixed favorite. Never reroll on render, resize, undo, settings changes or resume. Keep environment RNG independent from the deal.

Tilt is optional and calibrated to the user's comfortable holding angle. Target 2–6 CSS pixels of layer displacement and no more than roughly 1 degree apparent tilt. Smooth readings, handle screen rotation and sensor permission, stop in background, respect reduced motion, and provide a static fallback. Start by moving the floor/highlight layers while keeping card input geometry stable. If card geometry moves, prove inverse-coordinate hit testing.

PASS requires stable drag/drop and legibility in portrait/landscape, readable surfaces, no texture seams, bounded rendering cost and correct unavailable/denied-sensor behavior. STOP using any preset as a default if it recreates the black-card issue or harms the low-end phone's playability.

## Gate 6 — tutorials and later games

Build a tutorial runner on real game actions and semantic card/zone targets. A lesson supplies a known scenario, a short explanation, a spotlight, an expected legal action and completion criteria. Let her practice, replay, skip and advance at her own pace. Keep tutorial state isolated from normal games and race records. Provide calm optional audio and dismissible hints rather than screens full of text.

Prove lessons with Solitaire and UNO before adding rummy or poker. Each future extension selects shared assets and presentation presets to create a separate experience. A card-based horse race may later use starting bells, crowd swells and payout-style effects.

STOP at a product decision before implementing rummy or poker: ask which explicit variant to support and whether that game should be the next milestone. Prepare a concise comparison and recommendation first. Do not invent rules, implement all variants, add real-money features or let future games delay the existing-game work.

## Verification, reporting and release gate

Keep a short evidence ledger per milestone: files/commit, tests and device matrix, visual captures, performance measurements, migrations, known issues and rollback. Report measured values only. Desktop viewport emulation is not Android GPU/sensor/haptic verification.

Prioritize tests that protect actual risks: card conservation and uniqueness, legal transitions, deterministic replay, turn restoration, cancellation, no stale controllers, update consistency, saved-data migration, offline chunks, touch geometry, and reduced-motion behavior. Make scripts portable; do not hardcode one user's Playwright path into new CI tests.

When a gate fails, identify the exact failure and its scope, repair within the current milestone and rerun relevant checks. Do not repeatedly ask permission for routine reversible engineering choices. Stop only dependent work; continue independent authorized tasks. Ask the owner only for a necessary product choice, missing physical-device evidence or final publication approval. Never interpret silence as approval.

Commit verified milestones locally. At the end, provide a concise release candidate summary with screenshots, exact commits, what passed, what remains unverified and a rollback plan. Request explicit permission to push/deploy that concrete candidate. Do not publish an untested rewrite or describe pending phone verification as a fixed OnePlus bug.
