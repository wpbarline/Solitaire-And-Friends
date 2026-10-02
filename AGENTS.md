# Solitaire and Friends

Baseline: `mansfieldplumbing/arlinearcade`, cloned October 1, 2026. This checkout is being rebranded for Arline. Do not change the original upstream project unless explicitly asked.

## Protected card artwork

- The card graphics were difficult to create. Preserve every file listed in `CARD-ART-SHA256.json`.
- Do not regenerate, redraw, recompress, rename, replace, crop, or delete card faces or backs, deck source artwork, or deck-generation inputs without an explicit request specifically authorizing artwork changes.
- UI wrappers, controls, and animations may change while referencing the same assets. Keep deck preference names and stored choices compatible.
- Run `tools/protect_card_art.py` before and after substantive work. The rebrand affects only visible text, metadata, and the separate title logo.
- Preserve `assets/arlinearcade-logo.png` as the original. The new title-card asset is `assets/solitaire-and-friends-logo.png`.

## Scope and approach

- Scott subsequently authorized implementing the Solitaire improvements and publishing the game on GitHub.io. Preserve the cards; finish Solitaire before implementing match-3. Use the owned wpbarline/Solitaire-And-Friends repository, not the original upstream.
- Follow `IMPLEMENTATION-PLAN.md`. Audit the real game engine and existing simulations before changing rules. Do not treat a heuristic hint as proof that a deal is winnable.
- Keep the vanilla HTML/CSS/JavaScript structure unless there is a concrete need for a change. Keep mobile and this slow Windows laptop usable.
- License every recorded sound individually. Prefer CC0/public-domain card recordings; store exact source, author, license, retrieval date, and hash. Do not copy audio or graphics from Google Play competitors.
- Save history in Git. Changes to the upstream site require separate authorization; review changes locally before publishing a game release.

## Development freeze — October 1, 2026

Scott requested committing and freezing this version. Do not change or deploy the game further until he explicitly resumes development. Published gameplay is release b90ed18; later freeze commits preserve tests, documentation and inactive audio candidates. See FREEZE.md for the handoff.
