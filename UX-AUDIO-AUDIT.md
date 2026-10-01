# Phone game audit — October 1, 2026
- First requested recording could be discarded before decoding completed; queue the requested cue through loading and gesture unlock.
- A global 45 ms throttle let flipSource() suppress the placement/foundation cue in the same move; use separate voices and a bounded pool.
- New Deal performed no shuffle sound. Add one at the actual new-deal action.
- Guided Play used the same rules as tapping, but inherited both audio failures. Verify the actual button's output signal.
- Saved effects=false made the whole game silent with no direct indication. Add a visible sound control and explicit start-with-sound action.
- Fresh deal and restart used browser confirm(). Replace with game dialogs.
- Shuffle was buried in the menu. Make it a primary game action, distinct from the limited hidden-card shuffle.
- Rebuild title/menu/control surfaces in React with Vite. Preserve engine rules, artwork and checkpoint keys.
Validation: cold first-tap audio; guided move and shuffle signal; pointer dragging; layout and card bounds in portrait/landscape; exact resume after closure; offline production build and safe update lifecycle.
