# Playmint production-value implementation notes
October 1, 2026. Inspected four actual screenshot elements from the publisher's [Google Play listing](https://play.google.com/store/apps/details?id=com.playmint.purely.solitaire&hl=en_US), rendered in headless Edge. Also inspected screenshots from [MobilityWare](https://play.google.com/store/apps/details?id=com.mobilityware.solitaire&hl=en_US) and [Microsoft](https://play.google.com/store/apps/details?id=com.microsoft.microsoftsolitairecollection&hl=en_US). Reference captures are local review material, excluded from deployment. Do not reuse competitor artwork.

## What the Playmint images actually show
1. “Enjoy Classic Solitaire!”: table dominates the entire screen; compact Score/Time/Steps pill at top; stock on the right; bottom glyphs labeled Settings, Daily, Play, Hint and Undo. The promotional purple headline sits outside the in-game layout: do not mistake it for an app toolbar.
2. “Fun Animations!”: overlapping real-card copies form a dramatic diagonal cascade across the table. This is a strong visual reference for a victory card waterfall. A still image cannot establish animation timing, triggers or frame rate.
3. “Score Big!”: a focused victory panel with a crown/banner, score/time/move breakdown, confetti and trumpets, and a prominent New Game action. It shows a “beat 90%” claim: do not copy that claim without actual comparative player data.
4. “Daily Challenges!”: trophy framing and a calendar with completed/present dates and a large Play action. This is actual progression presentation, unlike our date seed with no completion calendar.
Scott separately reports auto-hiding menus and xylophone-style cues. Those runtime properties are requirements based on his observation, not independently proven by these still screenshots.

## Apply to our title screen
- One composed stage, not logo + marketing copy + document catalog.
- Existing original logo reveals with eased scale/settle; original card images fan behind it; restrained gold/pink particles establish depth.
- A single large Play/Continue button, glyph Sound and Settings, secondary Games/Scores.
- First real tap explicitly starts the audible welcome and optional music. A silent screenshot/page load is not a valid audio-start test.
- First-use sound action must be honest and observable; show Sound off when saved mute is active.
- Use motion phases controlled by JS: boot → ready → entering → playing. Cap particles and stop rendering on hidden/unmounted pages.
- On a slow laptop, use Canvas2D and DOM transforms for the title scene; do not require WebGL solely to animate a logo.

## Apply to the table
- Full-viewport game surface; no page scrolling in either orientation.
- Top HUD: current score and best score, compact time/move counters. No redundant Solitaire title.
- Right stock by default, saved left/right switch in Settings.
- Glyph controls with short visible labels: Hint, Undo, Reverse, Shuffle, Settings. No hamburger, no mystery unlabeled icons.
- Hint reveals a destination and a contextual Play move action. That action must use exactly the same placement/flip sound hooks as tap/drag.
- Keep core actions discoverable. Only secondary tray/hint text may auto-tuck during play; never hide the only route to a frequent action.
- Glass/tactile surfaces with a consistent palette, lighting direction, border, depth and pressed state; replace layered historical CSS overrides with one component system.

## Motion and sound recipes
| Event | Visual | Sound | Constraints |
|---|---|---|---|
| Enter title | Logo settle, small fan, brief particles | Mallet welcome on first tap | No pretend autoplay, no blocking cinematic |
| Open/close settings | Short eased sheet slide/pop, backdrop | Two distinct soft mallet cues | Dismiss on outside tap/Done/Back; not while editing |
| New deal | Cards travel from stock into their seven columns | Real recorded riffle then card contacts | Finish with exact legal deal; checkpoint before/after committed action |
| Card pickup/drop | Lift and shadow, settle on destination | Physical pickup/place, slight sample variation | Never delay the actual move for “juice” |
| Foundation placement | Small sparkle/pop, score increment | Card contact plus restrained ascending mallet reward | Both cues coexist; no global throttle discarding one |
| Undo | Return to saved positions | Reversed physical card slide | One snapshot only; no fake negative-time scoring |
| Reverse | Retrace three snapshots, soft purple wash | Reversed card cue per step + short mallet tail | Spend charge outside history, save every step |
| Win | Original-card cascade, compact confetti, trophy panel | Existing licensed ta-da, duck music | Bound lifetime/particles; honor reduced motion; keep Next Deal tappable |
| New best | Score count-up and best badge | Extra brief bright mallet accent | Real local record comparison only |
| Surprise rescue | Card reveal/lift, short sparkle | Gentle rising mallet phrase | Explicit limited aid, assisted score, 52-card conservation |

## Scoring and rewards
Use a clearly defined local house score if preserving the existing score formula; keep current score consistent with the value recorded at victory. Avoid comparing Draw 1 and Draw 3 records as though they have identical difficulty. Do not claim an arbitrary global percentile.
Calendar/streaks, verified winning deals and collectible rewards are separate later features. A random seed is not a verified winning puzzle.

## Shared primitives to carry forward
React Sheet/Dialog, IconButton, HUD counters, controlled Sound settings, voice pool/mixer, canvas burst/cascade, eased card transforms, haptic feedback, versioned offline cache, saved checkpoints, native Share.
After Solitaire: apply the shell to FreeCell and Uno; Three.js + rigid-body physics for Bowling; original match-3 later. Painter is removed from the visible lineup.

## Release gates
- A user-clicked cold Play, Shuffle, Hint→Play, Undo and Reverse each produce a nonzero output signal when Sound is on.
- Menus close by completion/outside tap/Back and preserve focus. No native confirm()/alert() for game actions.
- Phone portrait/landscape fit every card and action. Resizing does not erase the board.
- Existing checkpoint keys migrate unchanged; whole browser closure, offline reopening and actual service-worker upgrade restore the same cards/history.
- Protected artwork hashes remain unchanged.
- Scott/Arline audition the mix on their phone: automated audio meters cannot judge whether the sound is enjoyable.
