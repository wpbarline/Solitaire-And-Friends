# Race your past self

Game Select → Ghost race offers locally recorded Solitaire games. Each recording stores the exact starting card arrangement, draw mode, board after every action, action type, and elapsed active time. A race deals those same cards to the live board and replays the past board below it. In short landscape windows the boards sit side by side.

The usual bottom controls slide away during a race; Controls brings them back. End race keeps the current cards and returns to normal Solitaire. A new deal ends the race. Completed recordings provide a finish-time opponent; unfinished practice recordings stop at their last recorded point and let the player continue.

The timer pauses while the deck is loading/dealing, the app is hidden, or a popup is open. Automatic updates resume both the live checkpoint and the selected opponent. Browser refresh restarts the same race, consistent with ordinary Solitaire's refresh behavior.

Recordings start with this release. Earlier games cannot be reconstructed from aggregate scores. Old in-progress checkpoints begin recording from their resumed board. Recordings remain on this device and are removed by the existing saved-data erase option. The archive keeps at most twelve runs, discarding older runs when the archive exceeds approximately 1.5 million serialized characters; a single newest run may exceed that budget. Each run is limited to 2,000 recorded actions.

Validation: `node tools/verify-ghost.cjs` checks identical starting deals, draw and undo snapshots, chronological playback boundaries, invalid-data rejection, portrait/landscape controls, race exit, and checkpoint restoration through an automatic-update reload. The existing runtime, rules, storage, intro-rendering, service-worker upgrade, and protected-art checks also pass.
