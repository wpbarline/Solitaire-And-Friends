# Local release candidate — October 15, 2026

Production release after owner follow-up: `solitaire-friends-react-d73539c37d3f`, 121 offline files. Local preview: http://127.0.0.1:8773/Solitaire-And-Friends/. Owner explicitly authorized pushing; publication status is recorded separately after verification.

## Delivered

| Commit | Change |
| --- | --- |
| `c285fe6` | Baseline evidence, deep-link update-resume repair, opt-in image/compositor diagnostic |
| `e5b44d1` | Remove synchronized small-card title overlay; retain original large slow shader, logo and fan |
| `63c318a` | Varied quiet menu sounds, no immediate repeats; harp reserved for Play entrance |
| `97b8637` | Mouse/pen grab scrolling, click/tap parity, hidden scrollbars, UNO hand scroll retention |
| `a396b6d` | Bounded semantic Solitaire effects, optional haptic patterns, deterministic hidden shuffle, canceled stale controller/audio work |
| `e8d046c` | Visible landscape UNO hand/turn controls and actual pointer play/draw checks |
| `dc44624` | Report the executing release separately from fetched server metadata |
| `05b5f18` | Portable production checks and artwork integrity gate before Pages |

The final documentation commit contains this report and candidate captures; use the final HEAD as the review candidate.

## Verification

- Production build passed; all 97 protected artwork hashes unchanged before/after.
- All 13 production checks passed locally on desktop Edge / Playwright 1.62.1. Relevant checks rerun after final edits; actual worker replacement and offline reload preserved exact Solitaire checkpoints.
- Rules/seed validation, ghost initial deal and timed snapshots, normal/reduced-motion state and action-journal equivalence, hidden cancellation, haptics-off requests, no stale controller commands, real foundation/win/undo, four-player UNO, menu audio/mute, actual mouse/touch tap/drag all exercised.
- Captures of title, Solitaire, UNO, Settings and ghost at 390×844, 844×390, 1366×768: [candidate captures](evidence/candidate/). Controlled [foundation arrival](evidence/effects/foundation-arrival-390.png), [before](evidence/effects/foundation-before-390.png), [win](evidence/effects/win-390.png).
- Desktop win sample: 89 frame intervals, 16.6 ms median / 16.7 ms p95 / 33.3 ms max. This is a headless desktop sample, not a phone frame-rate guarantee.
- Initial stale offline/audio test fixtures were corrected for the existing name prompt. Offline test then found a real pre-existing deep-link active-screen defect; the product fix is included. Failed attempts and repairs are recorded in [evidence ledger](MIGRATION-EVIDENCE.md).

## Limitations and next gate

OnePlus 11 / Android 16 black cards remain unresolved. The owner supplied Moto Edge 2022 as comparison; neither physical device was available here. Browser/WebView version, installed-vs-browser observations and screenshots still needed. The opt-in Settings → App diagnostic is ready for that comparison; follow the short physical checklist in the evidence ledger. Physical haptics, scrcpy/touchpad and Moto G Pure performance remain unverified. No new GPU-heavy default was enabled.

TypeScript/shared-extension extraction and Gates 3–6 are incomplete. Package-registry DNS failed installing a compiler; no type-check pass is claimed. Singleton controllers/raw module delivery, resumable UNO, IndexedDB recording migration, update atomicity/status work, expanded ghost presentation, environments/tilt and tutorials remain. CI changes have not been exercised on Linux/remote Actions. No later game was started.

Reverse now resolves its logical steps immediately and presents one short movement/accent instead of timing gameplay through three delayed steps. Deal-derived hidden mixing is reproducible despite audio/visual RNG; existing stored snapshots and spent ability counters are preserved. These are the main behavioral tradeoffs for review.

## Rollback / publishing

Before publication, rollback is simply reverting the relevant local milestone commit; no user storage changes are necessary. The prior release remains live. If a published candidate needs rollback, rebuild/redeploy the previously approved commit while retaining storage keys/checkpoints/recordings. Do not erase storage or reset Git destructively.

Owner explicitly authorized pushing this limited candidate. It is not a completed runtime migration or a confirmed OnePlus fix.

## Owner follow-up before publication

The owner rejected the entrance harp and identified translucent K/A/Q/A cards above the logo. Replaced the 2.592-second entrance harp with the existing 0.701-second launch chime at gain .28 and a 1.5-second duplicate-request guard. All four fan images now retain opacity 1 throughout their position/rotation entrance, over the original cream paper. Original images and shader unchanged. These later decisions supersede the earlier entrance-harp note above.

PASS: per-card opacity/paper sampled at 0/450/900 ms, original shader frames, actual first-tap audio with exactly one short entrance cue and no harp, concurrent launch requests produce one extra cue, varied/muted menus, and all 97 protected-art hashes. Updated captures: `evidence/followup/`.

Native Git fetch/push failed because github.com could not resolve. The connected GitHub transport can publish an identical tree as a fast-forward snapshot based on the observed remote head. If used, preserve all local milestone commits; do not reset or rewrite either history. Verify the returned tree SHA equals the tested local HEAD tree before advancing the remote ref, with an expected-head lease and no force. A later normal fetch/merge can reconcile the two histories once network DNS is restored.
