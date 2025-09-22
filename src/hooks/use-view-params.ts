/**
 * Hook: useViewParams
 * Purpose:
 *  - Centralize persisted UI state that defines the *semantic view* of the tree (list selection, root scope, feature toggles, etc.).
 *  - Provide ergonomic setters that update only parts of the `ViewParams` object while keeping other keys stable.
 * Persistence Model:
 *  - Uses `sessionStorage` (via `useSessionStorageUtility`) so state survives soft navigations / reloads within a browsing session but resets between sessions.
 * Design Notes:
 *  - `DEFAULT_VIEW_PARAMS` supplies a schema-aligned baseline; always spread previous state to avoid accidental key drops.
 *  - Setters are intentionally shallow: they do not validate combinations (caller responsible for invariants like mutually-exclusive list modes).
 * Invariants:
 *  - Returned `viewParams` object is always complete (never partial / undefined).
 *  - Setter functions are stable across renders (utility hook assumed to memoize).
 * Extension Guidance:
 *  - Add new view fields to `ViewParams`, update defaults, then safely consume here—no additional hook changes required unless introducing cross-field constraints.
 *  - For derived / computed view state, build a separate selector hook rather than embedding logic here to keep concerns clear.
 */
import { useSessionStorageUtility } from "@/hooks/use-storage-utility"
import { DEFAULT_VIEW_PARAMS, ViewParams } from "@/tokens/view-params"

export function useViewParams() {
  const [viewParams, setViewParams] = useSessionStorageUtility("view-params", DEFAULT_VIEW_PARAMS)
  const setViewParam = (param: keyof ViewParams, value: ViewParams[keyof ViewParams]) => {
    setViewParams((vp) => ({ ...vp, [param]: value }))
  }
  return { viewParams, setViewParam, setViewParams }
}
