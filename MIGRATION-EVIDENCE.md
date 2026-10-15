# Incremental migration evidence — October 15, 2026

Starting HEAD: `e94b3f6`; audited gameplay: `33b5c0f`. Clean working tree at entry. The intervening commit only adds audit/handoff documentation. No storage from a user's browser was accessed. Browser tests create disposable contexts.

## Gate 0: baseline and resume repair

- Original production build: Vite 7.3.6, 35 modules, 119 offline files, release `solitaire-friends-react-17ff838e6c70`.
- All 97 protected SHA-256 hashes matched before editing.
- PASS: `verify-rules.mjs`, `verify-runtime.cjs` (390×844, 1366×768), `verify-ghost.cjs` (390×844, 844×390), `verify-intro-rendering.cjs`, `verify-storage.cjs`, `verify-update.cjs`. Actual worker replacement preserved the exact Solitaire checkpoint.
- Captured all five scenes at 390×844, 844×390 and 1366×768 under `evidence/baseline/`. Title was captured during its opening effect. Settings captures may include entry animation. These are desktop Edge captures, not Android GPU evidence.
- Initial Python/npm commands failed because neither executable was on PATH. Reran protection with bundled Python and build with local Vite + `tools/build-pwa.mjs`; both passed.
- Extra `verify-react-offline.cjs` initially failed its tap assertion: stale test setup omitted the now-required player name. Added the fixture name without changing the assertion.
- That test then exposed a pre-existing product defect: deep-link startup did not write the active game to sessionStorage; update reload fell back Home. Fixed by persisting the actual screen on initial mount as well as navigation. Kept existing refresh/restart versus automatic-update/resume distinction; test now explicitly marks the checkpoint-preserving update reload.
- PASS corrected offline test: actual touch tap and drag, exact checkpoint after offline reload, original images, title/game navigation. Aborted audio requests during navigation were observed; no page errors.

## Gate 1: opt-in renderer investigation

Settings → App → Card rendering diagnostic. A lazy Vite chunk, included in offline packaging. No automatic compatibility mode or device sniffing. Original intro and gameplay rendering unchanged by this probe.

- Separates raw face/back, opaque paper, clipping, transforms, transitions, filter/shadow and SVG ghost presentation. Live board and title remain available after closing.
- Report includes supplied device details, browser UA, standalone/browser mode, release metadata (or explicit unavailable), exact original image URLs/status/decoded size, wrapper styles, errors while open, WebGL version/context error/texture limit. No unrelated data or debug renderer fingerprint.
- PASS `verify-diagnostics.cjs`: open previously unused lazy chunk offline, original face/back status and dimensions, all independent switches, exact state unchanged, close and draw again.
- Report collection does not prove GPU pixels. Physical verification PENDING. Owner supplied affected **OnePlus 11, Android 16** and comparison **Moto Edge 2022**. Browser/WebView version, installed/browser reproduction and screenshots still needed. Moto G Pure performance remains unmeasured.

### Physical checklist

1. On OnePlus 11 and Moto Edge 2022, record Android version, Chrome version (and WebView if applicable), installed vs browser, and running release. Keep saved games; do not erase storage/cache.
2. Screenshot title during opening: distinguish the logo fan and large slow shader cards/chips. The small synchronized 2D falling images were removed at the owner's subsequent request. Screenshot live Solitaire and a ghost race independently.
3. In the diagnostic, enter details and compare raw face/back versus opaque paper. Toggle **only one** of clip/transform/transition/effects; transition needs transform switched to see motion. Record exactly which sample turns black and whether it changes on rotation/background/return.
4. Collect/save report with each relevant setting; pair with screenshots. Repeat in browser and installed mode if available. Compare on the working phone.
5. Do not mark fixed or enable GPU-heavy defaults until the affected physical phone passes. Physical vibration and sensor checks are separate from image checks.

## Title noise correction (explicit owner request)

Removed only Title's additional 2D `Particles` mount, which dropped 16 small faces in a synchronized row over the original shader. The owner's “52 cards” description matches this visible row; actual layer count was 16. Original `src/intro-shader.js`, logo, static logo fan, slow large shader cards/chips and win particle celebration retained. New regression assertion requires no small-card canvas in Title while the original shader renders opaque frames without GL errors. PASS at 390×844 and 1366×768. After captures in `evidence/intro-cleanup/` at all three sizes.

## Menu audio variety (explicit owner request)

Opening/closing now select from existing `menu-open.wav`, `menu-close.wav`, `tap-chime.wav`, sharing the previous sample to prevent immediate repeats across both actions. Quiet per-event trims and ±3% pitch variation; a new menu action cancels stale pending/playing menu audio. Hidden/muted cancels menu cues. Harp remains the main Play entrance. No new recordings or license changes: bundled original xylophone arrangements from VCSL, documented in `assets/audio/CREDITS.html` and existing source inventory. Existing settings/volumes stay intact.

PASS `verify-menu-audio.cjs`: eight actual open/close actions, audio-source events, no immediate repeats, no repeated menu harp, muted menus silent. Updated personalization expectations deliberately reflect the owner's changed menu-sound requirement. Speaker/headphone listening and subjective mix remain owner review; source events alone do not prove physical output.

## Pointer/touch parity (explicit owner request)

`src/drag-scroll.js` adds owned, disposable mouse/pen grab-scrolling to existing overflow containers. Touch retains native panning. An 8px threshold distinguishes a click/tap from a drag; the resulting click is consumed only after a scroll drag. Input/select/range/editable controls and the Solitaire board keep their own handling. Cancellation, pointer capture loss and window blur release the gesture. All scrollbars hidden through CSS while wheel/keyboard scrolling remain. UNO keeps hand scroll position during rerenders; four-player rules unchanged.

PASS `verify-pointer.cjs` at 390×844, 844×390, 1366×768: actual mouse stock tap, exact undo, legal Solitaire drag via visible-rule hints, grab UNO overflow without playing/opening wild decision, hidden bars, draggable overflowing settings and native checkbox. Physical scrcpy/touchpad and Android touch pending; desktop pointer automation is not that device verification.

Tooling limitation: package-registry DNS failed (`ENOTFOUND registry.npmjs.org`) installing TypeScript/portable Playwright dependencies. No dependency/lockfile changes resulted. Existing bundled Playwright is used through NODE_PATH for new portable scripts. No TypeScript pass is claimed. Visual review also found the pre-existing landscape UNO hand below the viewport; compact landscape card/opponent sizing now keeps the hand and turn control visible, with card tap targets at least 48px wide. Pointer checks now assert hand/control bounds and an actual single-card play/draw by mouse.

## Gate 2: bounded Solitaire presentation and lifecycle

New `src/presentation.js` is Vite-managed and injected into the legacy controller. It owns at most 40 pending callbacks and 8 painted outline animations (280–520 ms); no card geometry, filters, permanent GPU layers, new canvas or gameplay authority. Deal landing cues are rate-limited to roughly one per 100 ms. Foundation arrivals, reveals, Reverse, hidden shuffle and wins emit semantic events. Existing most-expressive win card celebration remains; no new GPU-heavy default was added with the OnePlus still pending.

Haptics default remains off. Short event patterns have a 90 ms rate limit with meaningful-event priority; hidden/disabled/disposed cancels native vibration. Missing/denied vibration is harmless. Tests stub vibration requests; **physical haptics remain unverified**.

Reverse resolves all (up to three) logical steps immediately and retains their ordered snapshots in the recording. The board slides once and a short accent replaces the previous timed, full-screen wash. This is a deliberate tradeoff: input/navigation cannot leave a partial power or resume a delayed mutation in another game. Charges/rules remain. Undo/restart cancel presentation. Disposal invalidates deck callbacks, stops table sounds (including pending decodes), removes the global handle and guards retained command references. This hardens the existing singleton; it is **not** a completed instance/extension extraction.

Fresh Solitaire deal entropy and its one-use hidden shuffle no longer consume cosmetic Math.random calls. Hidden mixing uses a deal-derived seeded stream; existing saved mixed snapshots remain untouched. Distribution, card conservation and spent-power behavior remain; future shuffles of the same restarted seed now reproduce the same hidden mix.

PASS `verify-effects.cjs`: identical logical states and action/snapshot journals with normal/reduced motion and different cosmetic RNG consumption; input during deal, Reverse, hidden shuffle, undo, restart, retired commands, settings-off vibration requests, hidden cancellation; a real final-foundation move, win and undo with all 52 cards. Fixtures backed up before browser mutation in `evidence/effects/`. Before/arrival/win captures visually reviewed. Desktop Edge headless frame sample: 89 intervals, 16.6 ms median, 16.7 ms p95, 33.3 ms maximum; exact measured values in `desktop-frame-sample.json`. This is not low-end Android performance evidence.

## Production checks and unfinished gates

`node tools/verify-production.cjs` ran all 13 checks successfully on desktop Edge with bundled Playwright 1.62.1. After final hardening, relevant effect/audio/diagnostic/offline/worker checks were rerun. Protected artwork still matches all 97 hashes. Latest production packaging includes 121 offline files. Candidate five-scene/three-size captures under `evidence/candidate/`; the capture script now waits for Settings entry animation to finish.

Selected production tests now resolve `playwright` normally, honor BROWSER_CHANNEL, and use repository-relative paths. CI installs pinned Playwright 1.62.1 and runs protection plus this suite before Pages deployment. Linux CI has not been run locally/remotely; no push occurred. To run locally, install Playwright in the usual development environment or set NODE_PATH to an available installation, build, serve production on port 8773, then run the suite. Run the worker test sequentially; it temporarily edits dist/sw.js and restores it in finally.

Diagnostic reports now distinguish the executing HTML's embedded running release from separately fetched server release metadata; reporting works offline. The report also includes the computed color scheme without claiming it explains the OnePlus defect.

**Gates 1/2 physical checks remain pending. Gates 3–6 are not complete.** TypeScript/compiler installation is blocked by registry DNS in this environment; no rename-only migration or unverifiable type-check has been added. The controllers still load raw; revision-consistent module migration, real extension instances, resumable UNO, transactional recording storage, richer update states, environments/tilt and tutorials remain future gated work. Existing synchronous archive writes and mixed-release raw-module risk are still known limitations. No new games started.

## Rollback and release gate

### Owner-authorized follow-up

Owner explicitly authorized pushing, then reported translucent K/A/Q/A logo-fan cards. Individual image animation (not just the fan parent) ended at opacity .8; changed its entire motion-only animation to opacity 1 over the existing opaque cream paper. Original artwork, logo, positions and shader unchanged. Regression samples each of all four cards at 0/450/900 ms.

Owner also rejected the entrance harp. Replaced it with the existing 0.701-second `launch-chime.wav` at gain .28 and a 1.5-second duplicate-request guard. No audio files edited/new licenses needed. Updated audio assertions explicitly reject entrance harp and exercise concurrent launch requests. This supersedes the earlier decision to retain harp on Play.

First follow-up browser checks failed because the previous preview process was no longer listening on IPv4. Restarted production preview explicitly on 127.0.0.1:8773 and reran successfully; no test assertions relaxed. Native Git fetch/push failed DNS resolution for github.com; connected GitHub fallback is being checked before any remote ref change.

The owner-authorized snapshot was pushed as `f451cf4` through the GitHub connector; its tree exactly matches tested local `0edb991`. All local milestone commits remain. The first Linux CI run correctly stopped deployment: 20 protected text/source files had LF checkout bytes while the existing manifest records CRLF. No protected Git blobs changed. Added explicit `.gitattributes` checkout rules for only those 20 files, after proving Git-blob LF→CRLF yields each unchanged expected SHA-256. The other 77 already match their Git bytes. No protected file or expected hash is edited, and no check is bypassed. Artwork checking now precedes building. `verify-checkout-art.py` verifies this independently without writing assets. The first failed run's browser checks were skipped, not passed.

Revert the relevant milestone commit to undo code. No storage schema/key changes in these milestones; existing saves and recordings remain compatible. Do not restore code by deleting user data. This candidate does not claim an Android black-card fix or completion of the entire runtime migration.
