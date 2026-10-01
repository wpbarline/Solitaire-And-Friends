# A phone game for Arline

Reviewed October 1, 2026. This release applies relevant guidance and practical checks; it is not a formal WCAG conformance certification or a usability study with Arline.

## Sources and decisions

- [NIST usability testing](https://www.nist.gov/programs-projects/usability-testing): evaluate effectiveness, efficiency, and satisfaction for the actual user and context. Our concrete tasks: start/resume a game, request and understand a hint, drag a card, correct a slip, change sound preferences, and find/share a score.
- [NIST human-centered design](https://www.nist.gov/itl/iad/human-centered-technologies/human-factors-human-centered-design): prioritize the user's needs and iterate with their feedback. Arline prefers familiar cards, dragging, helpful hints, and phone play.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/): named controls; visible keyboard focus; alternatives to dragging; spoken status text; independent audio controls; reduced motion; reflow and orientation support. Primary controls have 44px minimum height. Fan spacing exposes at least 28px of a face-up card. Highlighting is paired with a written hint, not only color. No orientation lock.
- [Brainium Solitaire](https://brainium.com/games/solitaire/) and [MobilityWare](https://www.mobilityware.com/klondikesolitaire/): useful hints, interruption-friendly saves, undo, statistics, and Draw 1/3. These are feature/flow references; their code, assets and claims of winning deals are not copied.
- Open-source mobile PWA references reviewed: [mobile-first Spider Solitaire](https://github.com/jaek-is-alive/spider-solitaire) and [games-pwa](https://github.com/stackpr/games-pwa). Use installation/offline/navigation patterns as references, retaining this project's lightweight vanilla structure. No third-party code is imported from these references.

## Current behavior

Three movement paths: tap for a legal quick move, drag to a chosen pile, or Hint followed by Play this move. Enter/Space also activate cards/stock for keyboard access without adding visible shortcut clutter. Hint prioritizes exposing hidden cards, then safe foundations and waste moves; it can cycle through choices. It does not prove a deal winnable.

Sound and music preferences persist independently. Vibration is optional, short, and gracefully ignored on unsupported browsers. Fewer animations honors a saved preference and the operating-system setting. Ordinary Undo corrects one move; three Time Reverse charges per deal retrace up to three moves each, without refunding charges. Restart resets the entire deal, not just power counters. New-deal/restart confirmation prevents accidental loss.

Portrait and landscape use the same rules and saved game. The table scrolls vertically if necessary rather than making cards too small. Settings has explicit labels, an Escape exit, and a focus loop for the custom deck dialog. Local high scores are clearly described and marked when magic shuffle was used.

## Checks and feedback still needed

Automated headless Edge checks cover phone-sized layouts, touch tap, pointer drag, guided hints, undo, saved-game identity, draw-three/recycling, Time Reverse persistence, victory/statistics, sound settings, and offline card/audio loading. Actual Android/iPhone installation, vibration hardware, screen-reader play, comfortable reach, and perceived sound quality should be checked on Arline's phone. Ask her to complete the tasks above without coaching; observe hesitation and revise labels/layout accordingly.
