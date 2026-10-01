# Solitaire and Friends: blunt product audit
Reviewed October 1, 2026. Baseline: deployed 9f79575 and the local source before React migration.

## Verdict
The app has a credible rules engine and valuable original card art, wrapped in an unfinished product. It has feature checkboxes without the feedback and presentation that make those features feel trustworthy. A button that performs a move silently is mechanically correct and experientially broken. A bright logo over a static catalog is not a produced game intro. Installing a website does not fix its hierarchy.

The prior engineering checks proved legal moves, card conservation and local recovery. They did not establish that the player could hear every action, discover a shuffle, understand scoring or feel rewarded. Those are separate acceptance criteria, and the release missed them.

## Evidence limits
The inventory below uses publisher-authored Google Play listings and their displayed lifetime download bands, not a live global top-ten chart. Equal download bands do not establish an exact order. Ten large-install benchmarks are shown; Playmint is an extra, user-selected design reference. Descriptions are advertised features, not independently played Android tests. Sound/menu timing attributed to Playmint below comes from Scott's firsthand description; the listing alone does not verify those behaviors.

## Ten large-install benchmarks, grouped by download band
| Benchmark / primary listing | Download band | Advertised features relevant to Arline | Gap here |
|---|---:|---|---|
| [MobilityWare Solitaire](https://play.google.com/store/apps/details?id=com.mobilityware.solitaire&hl=en_US) | 100M+ | Tap/drag, hints, unlimited undo, winning deals, daily crowns/trophies, weekly badges, statistics, standard/Vegas score, handedness, portrait/landscape, customization, offline | No curated winning mode or progression; no live score; weak victory experience |
| [Lemon / Solitaire Card Games Ltd](https://play.google.com/store/apps/details?id=com.lemongame.klondike.solitaire&hl=en_US) | 50M+ | Readable cards, short animations/subtle sound, smart hints, random/winning games, achievements, handedness, statistics, offline | Sounds unreliable; random daily seed is not a proven solution; achievements absent |
| [Tripledot Solitaire.com](https://play.google.com/store/apps/details?id=com.tripledot.solitaire&hl=en_US) | 50M+ | Random and winnable decks, daily challenge, standard/Vegas score, customized cards/table, animations, offline | No difficulty/deal-quality choice; title/table lack a cohesive presentation |
| [Grand Harvest — Google Play editorial](https://play.google.com/store/apps/editorial?id=mc_games_editorialmd_solitairegrandharvest_x_smurfs_liveops_fcp&hl=en_US) | 50M+ | Progression, collection events, albums, visual rewards and boosters | No long-term reward loop; use as a presentation reference, not a Klondike rules template |
| [Brainium / PLAYSTUDIOS](https://play.google.com/store/apps/details?id=com.brainium.solitairefree&hl=en_US) | 10M+ | Hints/undo, auto-complete, achievements, daily trophies, stats, themes/photo customization, left-hand mode, offline | Bare records table; no journey, achievements or visible personal-best moment |
| [nerByte](https://play.google.com/store/apps/details?id=at.ner.SolitaireKlondike&hl=en_US) | 10M+ | Joker aid when stuck, backgrounds/card customization and animation | No rescue/surprise card; hidden-card shuffle alone is a different mechanic |
| [Easybrain Klondike](https://play.google.com/store/apps/details?id=com.easybrain.solitaire.klondike.free&hl=en_US) | 10M+ | Joker aid, large cards, tap/drag, hints/undo, auto-save/complete, daily trophies and collectible seasonal postcards | No rescue aid, collection or effective stuck-state explanation |
| [Microsoft Solitaire Collection](https://play.google.com/store/apps/details?id=com.microsoft.microsoftsolitairecollection&hl=en_US) | 10M+ | Multiple variants, difficulty, daily challenges, weekly rewards, XP/trophies, achievements, account-based cross-device progress | No difficulty, progression or cross-device saves; our local save must not be described as cloud sync |
| [KARMAN](https://play.google.com/store/apps/details?id=com.karmangames.solitaire&hl=en_US) | 10M+ | Standard/Vegas score, auto-turn/complete, speed control, detailed stats, orientation, Play Games cloud saves | No animation-speed setting or cloud save; local records lack detail |
| [IGC Mobile](https://play.google.com/store/apps/details?id=com.softick.android.solitaire.klondike&hl=en_US) | 10M+ | Large card sets, forgiving drags, interactive training, preset difficulty and many step-by-step preset solutions, stats/customization | No guided first-run lesson; no solved presets; dense stacks need usability checks |

## Playmint: the menu and presentation reference
[Solitaire Pocket: Quick Play](https://play.google.com/store/apps/details?id=com.playmint.purely.solitaire&hl=en_US), 50K+ displayed downloads: smart placement, drag/tap, suggestion prompts, polished animation, Draw 1/3, daily/event modes, standard/Vegas/cumulative scores, stats/streaks, unlimited undo/hints, offline, collectible trophies/crowns/badges.
Scott reports glyph-driven controls, auto-hiding menus and xylophone-style cues. Adopt the interaction principles with original visuals/audio. Do not invent an observation of its runtime or clone its assets.
Our hamburger exposes a static utility list. It organizes developer features rather than serving a player's immediate intentions. Replace it with direct labeled glyph actions, animated settings/game sheets and context-sensitive guidance. Sheets dismiss on completion, outside tap and Back/Escape; they must not disappear while she is adjusting a value. Secondary controls may tuck away during card movement, but Hint, Undo and Shuffle remain discoverable.

## Scathing findings and acceptance gates
| Severity | Failure | Why it fails her | Required acceptance |
|---|---|---|---|
| P0 | Requested recording discarded before decode | First tap can be silent, exactly when feedback must establish confidence | Cold first gesture produces the requested cue after decode/unlock |
| P0 | Global 45ms audio throttle | Flip can suppress place/reward in the same move | Guided move, tap and drag each emit card sound; flip and placement coexist |
| P0 | New Deal has no shuffle hook | Shuffling the deck looks and sounds dead | Visible Shuffle action plays the recorded riffle and animates the actual deal |
| P0 | Browser confirm for new/restart | Breaks game illusion and confuses a phone player | In-game replace/restart dialog; no native confirm/alert |
| P0 | Quiet saved setting has no direct indication | She hears nothing and reasonably concludes the app is broken | Always-discoverable Sound glyph; explicit play-with-sound start |
| P1 | Intro is a static web hero/catalog | Strong art is presented weakly; no anticipation or welcome | Original logo reveal, original-card motion, light particle scene, audible first-tap welcome, immediate Play |
| P1 | Shuffle buried in menu | A core repeat action requires exploration | Shuffle on main controls; distinguish fresh deck from one-use hidden-card shuffle |
| P1 | Undo/reverse silent | These are signature powers but have no identity | Card-return cue on undo; reversed card audio per reverse step; short magical mallet tail |
| P1 | Score only exists after victory | No progress/reward feedback and no target to beat | Current score and compatible best score visible at top; explain scoring |
| P1 | Win is basic overlay/confetti | Functional completion is not an earned celebration | Ta-da, short burst, score reveal, personal-best badge, Next deal/share |
| P1 | Daily deal is only a date seed | Calling it a challenge does not make it solvable or rewarding | Label random daily deal honestly until a verified challenge set exists |
| P1 | Hints rank local moves, not plans | Legal suggestions can repeat/loop or lead to a dead end | Explain move, show destination, guided action; track repeated state; never promise a win |
| P1 | No rescue/surprise card | Player can stall with no delightful help | Explicit optional rescue preserving 52 original cards; record assisted status and spent charge |
| P1 | No onboarding | Three input methods are not obvious from a sentence | Brief first-run guided demonstration, dismissible and replayable |
| P1 | Stats page is another document | Reward history lives outside the game scene | App-native score panel, pagination, draw/mode filtering, personal-best display |
| P1 | Menu sounds missing | Buttons feel like links rather than objects | Distinct restrained mallet open/close/accept cues; no beep flood |
| P1 | Every game appears equally finished | Weak side games dilute the strong artwork and Solitaire | Curate the picker; remove Painter; mark remaining games as later polish candidates |
| P2 | Fan compression only proves bounds | Tiny exposed strips can still be hard to grab | Real phone review of long stacks; forgiving legal drop zones, selected-stack lift |
| P2 | Animation speed not tunable | Fast movement can hide the outcome | Normal/slower motion without removing delight; honor OS reduced motion |
| P2 | Current score formula isn't standard Solitaire | Comparing it with competitor scores would mislead | Explicit house scoring, or implement standard mode; keep old records compatible |
| P2 | No achievements/streaks | Nothing to bring her back besides another random deal | Gentle local achievements/daily completion calendar; no punishment for missed days |
| P2 | Local persistence is not cloud backup | Device loss/data clearing would lose her records | Export/import later; describe local recovery correctly |
| P2 | Cache/build deploy isn't versioned as an app release | Asset changes can leave stale combinations | Build output cache, per-release version, safe reload between actions preserving checkpoint |
| P2 | Architecture repeats imperative menus across pages | Patches fight each other and regress | React components for shell/menus/HUD, isolated proven board engine, Vite build |
| P2 | Audio signal tests aren't human listening | They prove output, not a pleasing mix | Automated action-signal checks plus Scott/Arline audition on their phone |
| P2 | Accessiblity checked mechanically | Size bounds don't prove understandable or comfortable interaction | Clear labels, adequate touch targets, contrast, focus/back behavior, color-independent hints |

## Surprise-card recommendation
The strongest verified matches are Easybrain's Joker and nerByte's Joker; LQG separately advertises a magic wand that reveals cards. These are not the same as a cosmetic daily gift. Scott has not yet identified the exact app/mechanic.
Proposed original version: one optional Surprise rescue per deal, returning a useful buried stock card to the top without duplicating/deleting any original card. Show the result, add a sparkle/mallet reveal, persist the spent charge outside undo history, and label the result assisted. This preserves the protected deck and avoids adding a 53rd wild card to an engine that validates exactly 52.
A true joker that substitutes arbitrary ranks would require a deliberate rules/scoring/save-format extension. Do not sneak it into classic scoring.

## What stays
Keep the original card images byte-for-byte. Keep legal rules, tap/drag/guided action, seeded deal infrastructure, immediate checkpoints, the right-hand deck preference, offline play, undo history and safe updates. Preserve localStorage keys so a visual rebuild doesn't erase her progress. No ads, energy gates, purchases, pressure timers or copied branded assets are needed to obtain the good parts of these exemplars.

## Entire arcade: next-pass inventory
- Painter: a basic finger canvas, not a compelling companion game. Remove from the visible picker now; retain its source in Git.
- Bowling: source explicitly uses Canvas2D pseudo-3D with a custom simulation, not Three.js rigid-body rendering. Later rebuild with Three.js plus a real physics system, proper ball roll/spin, pin contacts/toppling, lane friction, camera and recorded sound. Keep existing scoring tests.
- FreeCell: preserve deck art, then port the common shell, sound, saves and selection/drop behavior after Solitaire is approved.
- Uno: preserve existing game rules, then apply shared dealing, card pickup, turn cues, menu/settings, checkpoint and win primitives.
- Minesweeper: later audit first-click fairness, touch flagging, restart and loss clarity; no need to call a button grid production polish.
- Craps/Roulette: later audit touch targets, rules explanations, animation/sound timing and local bankroll. Decorative motion is not a substitute for clear outcomes.
- Basketball/Ping Pong: later audit input calibration, real phone performance, audio identity and restart flow. Do not ship generic card noises as their permanent sports soundtrack.
- Match-3: only after Solitaire is accepted. Original art/rules, not a Candy Crush clone; reuse settings, particles, audio buses, modal transitions, haptics, save/checkpoint helpers and share.

## Implementation order
1. Fix audible action pipeline and add actual guided-action signal tests.
2. Rebuild the app shell/title/menus in JavaScript/React/Vite, with direct glyph actions and animated dismissing sheets.
3. Expose Shuffle; replace browser dialogs; add undo/reverse cues, score/best HUD and stronger win presentation.
4. Preserve checkpoints/offline/update behavior and validate production build at phone portrait/landscape, laptop and deep links.
5. Add optional Surprise rescue with assisted labeling and conservation/undo/closure tests.
6. Add verified winning presets, progression, training and animation speed only after the core phone flow is solid.
7. Start deferred side-game work; bowling is the Three.js/physics priority. Painter stays out.
