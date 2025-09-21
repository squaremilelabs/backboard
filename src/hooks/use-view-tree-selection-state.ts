/**
 * # Original prompt for this hook
 * `useViewTreeSelectionState({ viewParams }: { viewParams: ViewParams })`
 * returns
 * {
 *  selectedItems: ViewTreeItem[],
 *  setSelectedItems: (ids: string[]) => void
 *  selectItemsInScope: (scopeId: string | null, kindFilter?: ViewTreeItemKind) => void
 * }
 * - should store selected state in sessionStorage so it persists across reloads / soft navigations
 * - be sure to use `useSessionStorageUtility`
 * - should store `{ id: string; kind: ViewTreeItemKind }[]` as selected items in storage (to not bloat storage)
 * - but should return the full `selectedItems` objects
 * - states should be stored per `viewParams` (so switching root scope or list clears selection)
 * - `onSelectionChange` should update the stored state
 * - `selectItemsInScope` should select all items currently in the view tree under the given scopeId (or root if null)
 *   - if `kindFilter` is provided, only select items of that kind (e.g. only tasks)
 *   - should update the stored state
 */

"use client"

import { useCallback, useMemo } from "react"
import { useViewParams } from "./use-view-params"
import { useViewTreeData, AnyViewTreeItem, ViewTreeItemKind } from "./use-view-tree-data"
import { useSessionStorageUtility } from "@/hooks/use-storage-utility"

// Stored (compact) representation to keep sessionStorage light.
type StoredSelectionItem = { id: string; kind: ViewTreeItemKind }

export type UseViewTreeSelectionStateResult = {
  selectedItems: AnyViewTreeItem[]
  setSelectedItems: (ids: string[]) => void
  onSelectionChange: (ids: string[]) => void
  selectItemsInScope: (scopeId: string | null, kindFilter?: ViewTreeItemKind) => void
  isSelected: (id: string) => boolean
}

// Build a stable storage key partitioned by current view parameters so switching view resets selection context.
function makeStorageKey(viewParams: { list: string; rootScopeId: string | null }) {
  return `view-tree-selection:${viewParams.list}:${viewParams.rootScopeId ?? "root"}`
}

export function useViewTreeSelectionState(): UseViewTreeSelectionStateResult {
  const { viewParams } = useViewParams()
  const { itemById } = useViewTreeData({ viewParams })

  const storageKey = useMemo(
    () => makeStorageKey({ list: viewParams.list, rootScopeId: viewParams.rootScopeId }),
    [viewParams.list, viewParams.rootScopeId]
  )

  const [storedSelection, setStoredSelection] = useSessionStorageUtility<StoredSelectionItem[]>(
    storageKey,
    []
  )

  // Expand stored selection ids to full items; stale ids are dropped automatically.
  const selectedItems = useMemo<AnyViewTreeItem[]>(() => {
    const out: AnyViewTreeItem[] = []
    for (const s of storedSelection) {
      const node = itemById.get(s.id)
      if (node && node.kind === s.kind) out.push(node)
    }
    return out
  }, [storedSelection, itemById])

  const isSelected = useCallback(
    (id: string) => storedSelection.some((s) => s.id === id),
    [storedSelection]
  )

  const setSelectedItems = useCallback(
    (ids: string[]) => {
      const next: StoredSelectionItem[] = []
      ids.forEach((id) => {
        const node = itemById.get(id)
        if (node && node.kind) next.push({ id: node.id, kind: node.kind as ViewTreeItemKind })
      })
      setStoredSelection(next)
    },
    [itemById, setStoredSelection]
  )

  // Alias that matches original prompt naming (could be used by tree onSelectionChange)
  const onSelectionChange = setSelectedItems

  // Collect all descendants for a scope (or root) currently visible in the tree.
  const collectDescendantIds = useCallback(
    (scopeId: string | null, kindFilter?: ViewTreeItemKind): string[] => {
      const result: string[] = []
      const visit = (id: string | null) => {
        itemById.forEach((node) => {
          if (node.parentId === id) {
            if (!kindFilter || node.kind === kindFilter) result.push(node.id)
            if (node.kind === "scope") visit(node.id)
          }
        })
      }
      visit(scopeId)
      return result
    },
    [itemById]
  )

  const selectItemsInScope = useCallback(
    (scopeId: string | null, kindFilter?: ViewTreeItemKind) => {
      const ids = collectDescendantIds(scopeId, kindFilter)
      setSelectedItems(ids)
    },
    [collectDescendantIds, setSelectedItems]
  )

  return {
    selectedItems,
    setSelectedItems,
    onSelectionChange,
    selectItemsInScope,
    isSelected,
  }
}
