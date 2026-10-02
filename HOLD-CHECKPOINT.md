# Local polish checkpoint — October 1, 2026

Historical pause record: Scott has resumed and authorized publication. See POLISH-REVIEW.md for the completed pass; the outstanding persistence locator and update/offline checks below have since been resolved.

Branch: `polish/2d-production`. Changes remain local and uncommitted. Nothing from this pass has been deployed.

Nine supplied audio originals are preserved in ignored `assets/audio/candidates/scott/`. Verified Pixabay-derived shuffle, card-contact and surprise clips are integrated; six unverified harp/boing recordings remain archive-only. Sources and inventory are in `assets/audio/SCOTT-AUDIO-SOURCES.md` and `SCOTT-AUDIO-INVENTORY.json`.

Implemented stable card image nodes with decode readiness and readable failure fallback, bounded opening card cascade, mobile sheets and 48px targets, semantic recorded cues, music output trim, offline asset updates, and removal of the visible extra-games launcher. Protected card artwork remains unchanged; all 97 protected hashes passed.

Build and rules checks passed. React, React audio, offline, state, phone, UI, deal, audio and new polish regression checks passed during this pass. The latest polish run also verified animation stops drawing while hidden.

Outstanding before release: investigate `verify-persistence.cjs` timing out on exact label `Draw deck`; run update verification alone; rerun the expanded phone offline-audio check and final relevant checks; inspect final visual layouts and diff; write release review. Do not claim the pass complete or deploy automatically. Android listening and device-level rendering still need manual review.

Local preview when running: http://127.0.0.1:8771/Solitaire-And-Friends/
