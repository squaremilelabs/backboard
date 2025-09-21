/**
 * # Original prompt for this hook
 * useViewTreeSelectionState({ viewParams }: { viewParams: ViewParams })
 * returns {
 *  selectedItems: ViewTreeItem[],
 *  selectedIds: string[] | null,
 *  setSelectedIds: (ids: string[] | null) => void
 * }
 * - should store selected state in sessionStorage so it persists across reloads / soft navigations
 * - mapped by viewParams
 */
