# Solitaire and Friends

Live: https://wpbarline.github.io/Solitaire-And-Friends/

The October 1 2D polish adds stable decoded card faces with failure fallback, a bounded opening cascade, phone bottom sheets, recorded event cues and a quieter music mix. The visible shell focuses on Solitaire. See POLISH-REVIEW.md for verification and manual Android review.

A React/Vite game shell with an animated title, original protected card artwork, tap/drag/guided hints, opening and fresh-deal cascades, local scores, physical card sounds, mallet interface cues, music, Undo and three Time Reverse charges. One Surprise rescue per deal can bring a useful buried stock card to the waste; assisted wins are marked.

Install from Android Chrome/Edge’s Install app/Add to Home screen menu. Game state and move history checkpoint after every move and restore after closure. Offline assets install automatically; updates save the game and reload between interactions. Scores and saves stay on each device. Music starts after a user gesture; separate sound/music settings are saved.

## Development

Use Node 22 or newer: npm ci, npm run dev. Production: npm run build; npm run preview. GitHub Actions publishes dist to Pages. React owns the shell and controls; the JavaScript controller owns card transforms and rules. Original card files and saved preference keys remain compatible. Other games retain their existing engines while Solitaire is improved. Painter is removed from the picker; its source remains preserved.

## Verification

Run tools/protect_card_art.py and tools/verify-rules.mjs. Against the production preview, run tools/verify-react.cjs, verify-react-state.cjs, verify-react-audio.cjs, verify-react-offline.cjs, verify-deal.cjs and verify-update.cjs with Node. These browser checks use this laptop’s bundled Playwright and headless Edge; GAME_URL can select the deployed site except for the local service-worker update test. Earlier non-React browser checks document the previous implementation and are superseded by this suite.

See COMPETITIVE-AUDIT.md, PLAYMINT-IMPLEMENTATION-NOTES.md and UX-AUDIO-AUDIT.md for research and priorities. Bowling’s 3D physics, match-3, and the other games’ redesigns remain later work. Audio sources and licensing are in assets/audio/CREDITS.html. All 97 protected artwork hashes must match.
