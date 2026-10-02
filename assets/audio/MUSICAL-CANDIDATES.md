# Musical audio candidates — not active in gameplay

Retrieved October 1, 2026. Saved at Scott’s development freeze.

- Magic Puzzle In-Game 1 by MintoDog: https://opengameart.org/content/magic-puzzle-in-game-1 . The source describes a loopable puzzle track with celeste, strings, violin and clarinet; CC0 1.0. Original download: https://opengameart.org/sites/default/files/magic_puzzle_in-game_1_bpm110_0.ogg . Saved unchanged as magic-puzzle.ogg, SHA-256 f94f4a6f895f22669dd5ced4061f932e1b5335e40e36d1e94fe7cfc222a4c2b8. A 20-second WAV preview is in candidates/magic-puzzle-preview.wav.
- Recorded xylophone C6, medium mallet, forte: Versilian Studios LLC’s VCSL, https://github.com/sgossner/VCSL . CC0 license preserved in VCSL-LICENSE.txt. Original: https://raw.githubusercontent.com/sgossner/VCSL/master/Idiophones/Struck%20Idiophones/Xylophone/Medium%20Mallets/Xylo_Medium_C6_ff_01_far.wav . Saved unchanged in candidates/xylophone-c6.wav, SHA-256 183d04381c44705f65c3750383f28695f4b2576311ace8fdbe567134f416ff27.

Derived short cues: menu-open.wav, menu-close.wav, hint-chime.wav, reverse-chime.wav, launch-chime.wav and tap-chime.wav. Original note arrangements, pitched from the recorded sample, trimmed, mono and faded; tools/prepare_musical_audio.py reproduces them. These are audition candidates, not an approved listening selection. They do not use Candy Crush assets. No runtime audio imports or service-worker precache entries reference them.

## Focused 2D polish activation

The six recorded xylophone phrases are now mapped to semantic interface events; launch is separate from victory. Magic Puzzle is the current locally built soundtrack, with a 0.75 production trim that preserves the saved slider. The earlier frozen tag still has them inactive.
