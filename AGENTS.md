# Solitaire and Friends

Baseline: `mansfieldplumbing/arlinearcade`, cloned October 1, 2026. This checkout is being rebranded for Arline. Do not change the original upstream project unless explicitly asked.

## Protected card artwork

- The card graphics were difficult to create. Preserve every file listed in `CARD-ART-SHA256.json`.
- Do not regenerate, redraw, recompress, rename, replace, crop, or delete card faces or backs, deck source artwork, or deck-generation inputs without an explicit request specifically authorizing artwork changes.
- UI wrappers, controls, and animations may change while referencing the same assets. Keep deck preference names and stored choices compatible.
- Run `tools/protect_card_art.py` before and after substantive work. The rebrand affects only visible text, metadata, and the separate title logo.
- Preserve `assets/arlinearcade-logo.png` as the original. The new title-card asset is `assets/solitaire-and-friends-logo.png`.

## Scope and approach

- Scott requested the rebrand/title card and an implementation plan. Hints, unlimited undo, real card sounds, and feature parity are planned, not authorized as a rushed rewrite in the current pass.
- Follow `IMPLEMENTATION-PLAN.md`. Audit the real game engine and existing simulations before changing rules. Do not treat a heuristic hint as proof that a deal is winnable.
- Keep the vanilla HTML/CSS/JavaScript structure unless there is a concrete need for a change. Keep mobile and this slow Windows laptop usable.
- License every recorded sound individually. Prefer CC0/public-domain card recordings; store exact source, author, license, retrieval date, and hash. Do not copy audio or graphics from Google Play competitors.
- Save history in Git. Changes to the upstream site require separate authorization; review changes locally before publishing a game release.
