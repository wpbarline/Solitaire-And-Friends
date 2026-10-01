# Phone-first Solitaire release — October 1, 2026

The original card graphics remain byte-for-byte intact. Solitaire and Friends now has a quieter home screen, prominent Play button, and named phone controls.

- Hints explain and highlight legal moves. Tap Hint again to cycle through choices; Play this move performs the suggested move. Tap and drag remain available.
- Unlimited one-move Undo, plus three Time Reverse charges per deal. Each charge retraces up to three recent moves; charges and magic shuffle remain spent when moves are reversed.
- Draw 1 / Draw 3, deterministic restart, local-date daily deals, and automatic save/resume. Daily deals are not advertised as guaranteed winnable.
- Local statistics and top 20 winning scores, fastest/fewest-move wins, filtering by draw mode, export, and sharing. A friendly custom score is explicitly described; this is not Standard/Vegas scoring or a global leaderboard.
- Licensed physical card effects, a short victory jingle, optional background music, separately saved volume/mute controls, reduced motion, and optional device vibration.
- Android-style installable PWA, portrait/landscape reflow, scoped offline Solitaire caching, touch-sized controls, accessible names/status/focus, and three movement paths.
- Shared settings, sound, seeded shuffle, sharing, and haptic primitives for future Uno/Rummy improvements. Match-3 remains the next phase after Arline's Solitaire feedback.

Validation: headless Edge on portrait/landscape and touch-enabled phone dimensions; guided hints/undo, stock recycling, exact save/resume, charge persistence, victory/scoring duplicate prevention, actual pointer drag, 52-card conservation, offline reload/images/audio decoding. All 97 protected art hashes match. Actual phone installation, hardware vibration, and a complete human accessibility evaluation still need on-device review.

Sources, criteria, and limitations: ACCESSIBILITY-AND-UX.md. Audio provenance: assets/audio/CREDITS.html and candidates/README.md. Production clips are reproducible using tools/prepare_audio.py.
