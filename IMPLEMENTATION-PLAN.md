# Solitaire and Friends — implementation plan

Prepared October 1, 2026. Baseline: `mansfieldplumbing/arlinearcade`. This pass makes the requested rebrand and title card; gameplay improvements below are staged for later implementation.

## What exists today

- Vanilla HTML/CSS/JavaScript PWA with standalone game pages and shared green-felt/gold styling.
- Klondike in `games/solitaire/solitaire.js`: draw-one stock, tap-to-move and pointer drag, automatic source-card flips, foundation moves, auto-finish, win screen, move counter.
- `games/solitaire/abilities.js`: snapshot/restore helpers, three limited rewinds, and one magic shuffle of hidden cards. History retains up to 200 snapshots. These are existing arcade powers, not unlimited classic undo.
- No dedicated hint control, draw-three mode, saved in-progress Klondike game, timer/statistics, or daily challenge found in the reviewed implementation. Deck appearance preferences already persist in localStorage.
- `assets/js/sfx.js`: procedural chiptune sounds for deal, flip, placement, shuffle, foundation, invalid action, and win. These are synthesized tones/noise rather than recordings of physical cards.
- The existing Klondike simulation primarily validates snapshot/restore and magic-shuffle invariants. It does not establish full rule correctness or a solver capable of proving a deal winnable.
- Multiple existing deck variants and card backs. The protected manifest covers 97 artwork and deck-source files. The original title card is retained; the new branding uses a sibling image.

Reference for expected mobile features: [MobilityWare’s Google Play Solitaire listing](https://play.google.com/store/apps/details?id=com.mobilityware.solitaire) and [developer feature page](https://www.mobilityware.com/klondikesolitaire/). Use these as feature comparisons; do not reproduce their assets, branding, code, or audio.

## Phase 1 — preserve and establish a reliable baseline

1. Commit the cloned baseline/rebrand and verify all protected hashes. Record the upstream commit, repository remotes, and current deploy target. Work in the author’s project rather than pushing to upstream by default.
2. Exercise new game, stock cycling, moving multi-card runs, flipping exposed cards, foundation moves, both powers, auto-finish, and victory. Verify 52 unique cards at all times.
3. Identify and extract the current rule/state transitions into a small pure engine module; the DOM layer continues to render the same artwork and animations. Do this incrementally, preserving tap and drag behavior.
4. Add meaningful rule/state checks for illegal moves, card conservation, stock order across recycling, face-up boundaries, undo identity, and safe foundation completion. Keep existing power tests.

Acceptance: original artwork hashes pass; saved deck preferences work; no behavior regressions in existing basic play. A UI rebrand alone does not require running every unrelated arcade simulation.

## Phase 2 — real card sounds

Candidate physical recordings:

- [Shuffle cards — Breviceps](https://freesound.org/people/Breviceps/sounds/447918/): creator states public domain/CC0.
- [playing_cards.aif — KevinHilt](https://freesound.org/people/KevinHilt/sounds/196541/): creator states public domain; includes shuffling, dealing, and cutting.
- Downloaded CC0 candidates and exact provenance are in `assets/audio/candidates/README.md`. The physical-card files are public MP3 previews; original lossless Freesound downloads require login. Kenney's original interface pack and TinyWorlds' original music download are included. Audition and edit before production use.

Implementation:

1. Download only verified, suitable recordings; retain their license/source records in `assets/audio/LICENSES.md`. Audition first and choose a natural riffle, a soft single-card deal, a flip, and a card placed on felt.
2. Derive several short dealing/placement variations from the licensed recordings. Trim silence, remove clicks at edit boundaries, and normalize gently. Keep the original downloaded source in an archival location and document edits. Target a small total audio payload.
3. Extend the existing `sfx` API with cached decoded buffers and a shared gain node. Keep current game call sites. Initialize/resume audio only on a user gesture; persist mute and volume. Do not auto-play at page load.
4. Match sounds to real actions: shuffle on a new deal or stock recycle, one deal tick per actual deal/stock draw, flip when a hidden card turns, and soft placement on a successful move. Rate-limit rapid animations and avoid overlapping 28 full-volume sounds during an opening deal.
5. Respect slow CPUs, offline caching, headphones, and iOS audio unlocking. Reuse decoded buffers and cap overlapping voices; retain graceful silent behavior if audio decoding fails.

Acceptance: physical card sounds, reliable first-tap playback, mute/volume remembered, no audio clipping or distracting machine-gun deal sequence, verified licenses bundled. No card art modifications.

## Phase 3 — hints and everyday play assistance

1. Add a visible **Hint** button with a source-card outline and destination outline; offer a short explanation in a live region. Use overlays/CSS on the existing card elements, never edit their artwork.
2. Enumerate legal moves from visible information. Prioritize revealing a face-down card, useful tableau moves, and safe foundation moves. Avoid immediately reversing the last move or cycling the same suggestion endlessly. Offer stock draw/recycle when appropriate.
3. Separate “no immediate legal move found” from “this deal is unwinnable.” Do not promise solver hints or guaranteed wins from a heuristic. If a real bounded solver is added later, run it in a worker with a time/state budget and cancellation.
4. Add ordinary unlimited **Undo** as a classic-play feature. Capture all state required to restore stock, waste, tableau, foundations, exposed-card flags, moves, scoring, and timer consistently. Keep any magic-shuffle power optional and clearly distinct from standard rules.
5. Add restart of the same seeded deal and a separate new deal. Confirm abandoning a game only where it would lose meaningful progress.

Acceptance: every suggested move is legal; hints leave the game state unchanged; repeated hints do not loop; undo restores exact prior state; limited rewind powers are not confused with unlimited classic undo.

## Phase 4 — mobile parity and persistence

1. Add Draw 1 / Draw 3 and rule-correct stock/waste handling with tests. Changing mode starts a new deal rather than silently changing the current rules.
2. Save in-progress game state and history after each move, with a versioned schema and corruption checks. Restore after browser/app closure. Do not lose a game when the service worker updates.
3. Add optional timer, win/loss statistics, move counts, and clearly defined scoring. Pause the timer while the app is backgrounded. Keep settings large, readable, and easy to undo.
4. Improve auto-finish: allow only safe completion, block duplicate completion timers, permit interruption, and preserve undo semantics.
5. Add left/right-handed stock placement, portrait/landscape checks, pointer/keyboard access, reduced-motion support, and ≥44px controls. Preserve the current deck assets and preferences.
6. Add a daily seeded deal only after rule correctness and persistence are stable. If it is advertised as guaranteed winnable, use verified deals or an actual solver; a date seed alone does not prove solvability.

Acceptance: reliable phone play, recovered in-progress game, no inaccessible controls, Draw 3 correct, settings remembered, no misleading “winnable” claim.

## Release order

1. Rebrand/title card and artwork protection (current pass).
2. Physical audio with settings and licensing.
3. Engine/rule checks, hints, and unlimited undo.
4. Saved games, Draw 3, timer/statistics, and mobile refinements.
5. Verified daily challenges and optional advanced solver.

Validate each release on this Windows laptop in Edge and on a real phone. Keep a local preview and a reviewable Git change before updating any live game site. Exact effort estimates should follow the Phase 1 audit; avoid promising full Play Store parity from a quick reskin.

## October 1 update — playful presentation and optional music

Keep the approved gold title card and every existing card face/back. Give surrounding controls a cheerful puzzle-game feel through rounded buttons, warm colors, gentle sparkles, and brief reward animations. Keep card rank/suit readability and touch targets central. Add a reduced-motion preference and cap concurrent effects so this laptop stays responsive. The reference is the mood of Candy Crush, with original presentation and licensed audio.

Music already exists as a procedural piano loop, default off, controlled on the home screen. Move access into a shared Settings panel without disturbing protected deck controls. Provide independently remembered Music and Sound effects switches and volume sliders, a preview button, and a choice between the existing gentle piano and an auditioned licensed loop. Start audio after a user gesture; suspend it when hidden; avoid restarting a loop on every move. Use decoded buffers for short effects, streaming for longer music, optional music ducking during wins, and overlap limits for rapid dealing. Check loop seams, phone mute behavior, settings persistence, offline loading, and playback on the slow laptop.

Downloaded candidates: Kenney Interface Sounds (100 CC0 cues), TinyWorlds Happy Adventure (CC0 chiptune loop), and KevinHilt/Breviceps CC0 physical card preview recordings. The music is an audition option rather than a settled soundtrack. Select several soft deal variations, one restrained shuffle, light taps, a positive foundation cue, and a short victory flourish; normalize perceived loudness and retain masters/license records. Do not commit a sound to the live UI until it has been listened to.

## Google Play comparison and priorities

This is a review of public listings and developer descriptions, not installed-app play testing or a claim to rank every Solitaire app.

| Reference | Relevant advertised pattern | Our priority |
| --- | --- | --- |
| [MobilityWare Solitaire](https://play.google.com/store/apps/details?id=com.mobilityware.solitaire) | Hints, unlimited undo, daily challenges, classic play choices | Clear Hint and Undo controls; draw-one/draw-three; restart same deal |
| [Microsoft Solitaire Collection](https://play.google.com/store/apps/details?id=com.microsoft.microsoftsolitairecollection) | Multiple games, challenges, difficulty choices, progress | A coherent game library; simple statistics and optional daily goals |
| [Solitaire Grand Harvest](https://play.google.com/store/apps/details?id=net.supertreat.solitaire) | Themed progression and rewarding presentation around TriPeaks | Short celebrations and optional personal milestones; retain our Klondike rules |

For Arline, the strongest engagement improvements are reliable resume, useful hints explaining a legal move, unlimited classic undo, comfortable controls, and satisfying feedback. Add personal bests and an optional daily deal after the game is dependable. Keep progress on-device initially. A daily deal must use a documented stable seed; do not label it winnable without solver verification.

## Reusable primitives for Uno, Rummy, and future games

Extract one primitive at a time while improving Solitaire; avoid a large rewrite.

- Card identity, ordered piles, seeded randomization, deterministic shuffle, and card-conservation checks. Keep deck definitions configurable: standard cards, Uno-style colors/actions, and possible multiple decks for Rummy.
- Commands/state transitions with game-owned validation, undo snapshots, and versioned saved-state envelopes. Each game retains its own legal moves, turn rules, scoring, and hidden information.
- Shared rendering helpers that reference the existing artwork, pointer/tap input, focus handling, accessible announcements, and animation timing. Do not regenerate the graphics.
- Shared Settings, audio events such as card.dealt/card.shuffled/game.won, volume preferences, save/resume, and optional personal achievement display. Consumers subscribe to events; rules do not call audio or the DOM.
- Migrate the existing Uno page only after the common primitives are exercised by Solitaire. For Rummy, choose the exact variant with Arline before implementing melds, discard rules, or scoring.

Validation: deterministic replay, unique card IDs, complete card conservation, save migration, undo correctness, and game-specific legality. Test Uno action/turn effects separately from Solitaire rules.

## Match-3 — only after the Solitaire release

Entry gate: Solitaire hints/undo, audio settings, save/resume, phone interaction, and protected-art checks pass, and Arline has tried that release. Then create an original cozy match-3 game with a separate grid engine and new tile artwork. Reuse settings/audio/save/animation/accessibility primitives; do not force a card rules engine onto a grid.

First playable version: an 8-by-8 board, adjacent swaps, invalid-swap reversal, runs of three or more, simultaneous match clearing, gravity/refill/cascades, deterministic seeds, and dead-board detection with a fair reshuffle. Initial boards must have a legal move and no accidental starting matches. Add clear move-limited goals, simple levels, saved progress, and celebratory sounds. Test intersecting matches, cascade termination, input locking during resolution, and resume determinism. Introduce special tiles only after the basic loop is stable.

Release sequence: approved rebrand and asset preservation → sound/music settings → Solitaire engine checks and hints/undo → save/resume and draw-three → optional daily goals → shared primitives adopted by Uno/Rummy → match-3. Full gameplay implementation is deferred to the next work phase.
