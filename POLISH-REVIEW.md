# 2D polish release — October 1, 2026

## Findings and behavior

Card faces were injected lazily and destroyed when turned down; preloading ran after mounting, errors had no visible fallback, and all cards carried permanent compositor hints. Stable image nodes now load/decode before the board becomes playable, with readable rank/suit fallback on failure. This removes identified lifecycle risks; the intermittent Android compositor glitch has not been reproduced on physical hardware. All 97 protected artwork files remain byte-identical.

The title omitted the existing falling-card mode and reused victory audio for entry. A bounded 16-card opening now runs behind the logo, including cold launches with a saved deal, without altering the deal or blocking Play. Home navigation does not repeat it. Hidden-page and reduced-motion behavior are covered.

Phone dialogs now use bottom sheets in portrait; important controls retain labels and 48px targets, including landscape. Touch no longer inherits mouse hover styling. The visible extra-games catalog is removed while its source remains preserved.

Nine supplied originals are archived intact locally. Three individually verified Pixabay recordings supply physical shuffle/contact and a rare Surprise bonus; six recordings with unverified provenance remain inactive and excluded from distribution. Recorded launch/menu/hint/reverse cues replace routine synthesized phrases. Music uses the licensed Magic Puzzle loop with a 0.75 output trim and reward ducking, preserving saved slider values. Title entry has its own cue.

An explicit accessible name fixes the deck-side selector: its inferred label previously included option text and broke the persistence locator. Rules, scoring formula, checkpoint schema and existing preference keys remain compatible.

## Files

Core changes: games/solitaire/card-visuals.js, solitaire.js, solitaire.css; src/main.jsx and scene.css; assets/js/sfx.js and music.js; sw.js and tools/build-pwa.mjs. Audio provenance, credits, hashes, preparation script and browser regressions accompany the implementation. Candidate masters are ignored by Git and excluded from builds.

## Verification

Production build and artwork guard passed. Required browser/rules checks: verify-react, verify-react-audio, verify-react-offline, verify-react-state, verify-phone, verify-ui, verify-update, verify-deal, verify-persistence, verify-audio and verify-rules. New verify-polish coverage checks 52 resources/stable nodes, network/decode fallback, loading gate, absence of permanent card compositor hints, bounded saved-safe intro, hidden-page/reduced-motion behavior, 48px targets, sheet Back/focus restoration and landscape fit. Signal tests verify audio output, not subjective listening quality.

## Manual Android review

Audition music/card/contact/Surprise/reverse balance on the phone speaker and headphones. Confirm browser gesture unlock, optional haptics, portrait/landscape readability with long columns, and artwork stability across repeated resume/update cycles on Arline's actual phone. Existing installations should safely update from a saved checkpoint; audio starts after interaction.

## Deferred work

3D/WebGL runtime, Three.js bowling physics, match-3, and redesigns of other games remain separate later projects. No protected artwork redesign or game-rule rewrite was included.
