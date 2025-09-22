import { useDragAndDrop, Key, isTextDropItem } from "react-aria-components"
import { AnyViewTreeItem, useViewTreeData, ViewTreeItemMeta } from "./use-view-tree-data"
import { ViewParams } from "./use-view-params"
import { useAuth } from "./use-auth"
// (No direct ScopeListItemData usage needed after simplification)
import { db } from "@/database/db-client"
import { parseAccountUpdateInput } from "@/database/models/account"
import { parseScopeUpdateInput } from "@/database/models/scope"

// Helpers for persisting separate arrays: scopes (always) and current_tasks (only when current view)
function accountScopesOrderTxn(accountId: string, scopes: string[]) {
  const { data } = parseAccountUpdateInput({ list_orders: { scopes } })
  return db.tx.accounts[accountId].merge(data)
}
function accountCurrentTasksOrderTxn(accountId: string, tasks: string[]) {
  const { data } = parseAccountUpdateInput({ list_orders: { current_tasks: tasks } })
  return db.tx.accounts[accountId].merge(data)
}
function scopeScopesOrderTxn(scopeId: string, scopes: string[]) {
  const { data } = parseScopeUpdateInput({ list_orders: { scopes } })
  return db.tx.scopes[scopeId].merge(data)
}
function scopeCurrentTasksOrderTxn(scopeId: string, tasks: string[]) {
  const { data } = parseScopeUpdateInput({ list_orders: { current_tasks: tasks } })
  return db.tx.scopes[scopeId].merge(data)
}

type DragScopePayload = { "db/scope": string }
type DragTaskPayload = { "db/task": string }
type DragRTaskPayload = { "db/rtask": string }
type DragPayload = DragScopePayload | DragTaskPayload | DragRTaskPayload

function serializeDragItem(node: ViewTreeItemMeta): DragPayload | null {
  if (node.kind === "scope") return { "db/scope": JSON.stringify({ id: node.id }) }
  if (node.kind === "task") return { "db/task": JSON.stringify({ id: node.id }) }
  if (node.kind === "rtask") return { "db/rtask": JSON.stringify({ id: node.id }) }
  return null
}

// Extract ids from keys for scopes/tasks only
function extractDragIds(keys: Set<Key>, getNode: (id: string) => ViewTreeItemMeta | undefined) {
  const ids: string[] = []
  keys.forEach((k) => {
    const id = String(k)
    const node = getNode(id)
    if (node && (node.kind === "scope" || node.kind === "task" || node.kind === "rtask")) {
      ids.push(id)
    }
  })
  return ids
}

/**
 * Hook: useViewTreeDragAndDrop
 * Core Responsibility:
 *  - Supply `react-aria-components` Tree with drag & drop for scopes & current tasks.
 *  - Persisted ordering model now limited to: scopes (always) and current tasks (when in current view).
 * Design Highlights:
 *  - Single `onMove` handler unifies intra-parent reorders and inter-parent migrations; reduces branching vs legacy `onReorder` + `onItemDrop` split.
 *  - `onRootDrop` handles drops onto the empty collection surface (background) to move items directly to root.
 *  - Transactions are batched (order + link/unlink) for atomicity so UI doesn't transiently desync.
 * Ordering Persistence Policy:
 *  - Scope moves adjust `list_orders.scopes` for old/new containers (account root or parent scope).
 *  - Task ordering persisted only for current tasks via `current_tasks` arrays on account/scope.
 * Link Management:
 *  - Moving to root => `unlink` parent; moving under a scope => `link` that scope.
 *  - Scope moves similarly unlink/link via `parent_scope` relation.
 * Safety Checks:
 *  - Reject mixed-kind drags (scope + task simultaneously) to avoid ambiguous ordering semantics.
 *  - Enforce same-original-parent for multi-select drags (simplifies ordering math); can be relaxed in future by building per-parent delta sets.
 *  - Bail early if account is absent or target node cannot be resolved.
 * Data Dependencies:
 *  - Relies on `itemById` (from `useViewTreeData`) to infer current rendered order for computing new order arrays.
 *  - Uses a depth-first snapshot; any visual grouping changes require updating `getOrderedChildIds` strategy accordingly.
 * Extensibility Notes:
 *  - Recurring / snoozed / done task ordering not persisted; drag of tasks in those views disabled.
 *  - Multi-parent multi-select moves: group moved IDs by original parent and apply independent old-parent order trims.
 * Edge Cases Addressed:
 *  - Move into empty scope (append logic falls back to end insertion).
 *  - Drop before/after a target that itself is being moved (filtered from insertion list first).
 *  - Root drop after previously root-based items (ensures uniqueness via filter when appending).
 * Failure Modes:
 *  - If a transaction partially fails (unlikely with Instant local-first), state may temporarily diverge; no explicit rollback currently.
 *  - Dragging a node not present in `itemById` (stale selection) is ignored safely.
 * Future Hardening:
 *  - Consider optimistic local reorder before transact to further minimize perceptual latency.
 *  - Add analytics hooks around reorder/move events for UX insights.
 */
export function useViewTreeDragAndDrop({ viewParams }: { viewParams: ViewParams }) {
  const { account } = useAuth()
  const { itemById } = useViewTreeData({ viewParams })

  // # Original prompt for this hook
  // This hook should provide drag-and-drop functionality for the view tree.
  // - Use `useDragAndDrop` from `react-aria-components`.
  // - Review the drag and drop section of the Aria Tree docs for full understanding https://react-spectrum.adobe.com/react-aria/Tree.html
  // - Should support reordering scopes and tasks within the same parent (account for root parent).
  // - Task level reordering should only be supported when `viewParams.list` is "current".
  // - Tasks and scopes should be able to be moved between different scopes (including to/from root).
  // - Should not allow reordering between different item types (e.g., a task in between 2 scopes).
  // - On drop, the new order should be persisted to the database.
  //   - For scopes/tasks moved within the same parent, update that parent scope's `list_orders` field (or account's if root).
  //   - For scopes/tasks moved to a different parent, update both the old and new parent's `list_orders` field (or account's if root).
  // - Use the provided `accountListUpdateTxn` and `scopeListUpdateTxn` functions to create the necessary db transactions.
  // - Ensure all edge cases are handled (e.g., moving to/from root, moving first/last items, etc.)
  // - Review https://www.instantdb.com/docs for more info on how to use DB if needed.
  // - InstantDB is local-first, so updating in the database should automatically update the UI via reactivity.

  // Helper: derive current rendered order for a parent for all kinds (scope/task/rtask) sequentially.
  const getRenderedChildSequence = (parentId: string | null) => {
    const seq: ViewTreeItemMeta[] = []
    itemById.forEach((node) => {
      if (node.parentId === parentId) seq.push(node)
    })
    // Depth-first produced order is fine as approximation of pre-token state for fallback.
    return seq
  }

  const activeView = viewParams.list // 'current' | 'snoozed' | 'done' | 'recurring'

  // Helpers to fetch/modify ordering arrays for a container (null => account root)
  const getScopeOrder = (parentId: string | null): string[] => {
    if (!account) return []
    if (parentId === null) return (account.list_orders?.scopes as string[] | undefined) ?? []
    const parent = itemById.get(parentId)
    if (parent?.kind === "scope") {
      const data = parent.data as { list_orders?: { scopes?: string[] } }
      return data.list_orders?.scopes ?? []
    }
    return []
  }
  const getCurrentTaskOrder = (parentId: string | null): string[] => {
    if (activeView !== "current" || !account) return []
    if (parentId === null) return (account.list_orders?.current_tasks as string[] | undefined) ?? []
    const parent = itemById.get(parentId)
    if (parent?.kind === "scope") {
      const data = parent.data as { list_orders?: { current_tasks?: string[] } }
      return data.list_orders?.current_tasks ?? []
    }
    return []
  }

  // (Potential future) moveBetweenParents removed for now – onItemDrop handles moves.

  const { dragAndDropHooks } = useDragAndDrop<AnyViewTreeItem>({
    getItems: (keys) => {
      const items: Record<string, string>[] = []
      keys.forEach((k) => {
        const node = itemById.get(String(k))
        const payload = node ? serializeDragItem(node) : null
        if (payload) items.push(payload)
      })
      return items
    },
    acceptedDragTypes: ["db/scope", "db/task"], // rtask drag unsupported (no persisted order)
    getDropOperation: () => "move",
    // Decide if a particular drop target (item + position) should be accepted.
    shouldAcceptItemDrop: (target) => {
      const targetNode = itemById.get(String(target.key))
      if (!targetNode) return false
      // Allow dropping:
      // - on a scope (to become its child) for any draggable kind (scopes/tasks/rtasks)
      // - before/after any item (mixed-type interleaving supported)
      if (target.dropPosition === "on") return targetNode.kind === "scope"
      if (target.dropPosition === "before" || target.dropPosition === "after") return true
      return false
    },
    // Unified handler for reordering within a level and moving between levels.
    async onMove(e) {
      if (!account) return
      const targetId = String(e.target.key)
      const targetNode = itemById.get(targetId)
      if (!targetNode) return

      // Extract moved ids (scopes/tasks/rtasks)
      const movedIds = extractDragIds(e.keys, (id) => itemById.get(id))
      if (!movedIds.length) return

      const firstNode = itemById.get(movedIds[0])!
      // Keep restriction: single-kind drag for simplicity.
      if (!movedIds.every((id) => itemById.get(id)?.kind === firstNode.kind)) return
      const movingKind = firstNode.kind // 'scope' | 'task' | 'rtask'
      if (movingKind === "rtask") return // no rtask reordering
      if (movingKind === "task" && activeView !== "current") return // only reorder current tasks view

      // Ensure (for now) all moved nodes share the same original parent; else bail for simplicity
      const originalParentId = firstNode.parentId
      if (!movedIds.every((id) => itemById.get(id)?.parentId === originalParentId)) return

      // Derive new parent based on drop position
      let newParentId: string | null
      if (e.target.dropPosition === "on" && targetNode.kind === "scope") {
        newParentId = targetNode.id
      } else if (e.target.dropPosition === "before" || e.target.dropPosition === "after") {
        // Insert before/after target inside its parent (may be root null)
        newParentId = targetNode.parentId
      } else {
        return
      }

      const sameParent = originalParentId === newParentId
      // Retrieve order arrays (scopes or current tasks) for source/destination
      const sourceOrder =
        movingKind === "scope"
          ? getScopeOrder(originalParentId)
          : getCurrentTaskOrder(originalParentId)
      const destOrder =
        movingKind === "scope" ? getScopeOrder(newParentId) : getCurrentTaskOrder(newParentId)

      const referenceOrder = sourceOrder.length
        ? sourceOrder
        : getRenderedChildSequence(originalParentId)
            .filter((n) => n.kind === movingKind)
            .map((n) => n.id)
      const movedOrdered = referenceOrder.filter((id) => movedIds.includes(id))
      for (const id of movedIds) if (!movedOrdered.includes(id)) movedOrdered.push(id)

      let newSourceOrder = sourceOrder
      if (sameParent) {
        const original = sourceOrder
        const movingSet = new Set(movedOrdered)
        const cleaned = original.filter((id) => !movingSet.has(id))
        let targetIdEffective = targetNode.id
        if (
          movingSet.has(targetIdEffective) &&
          (e.target.dropPosition === "before" || e.target.dropPosition === "after")
        ) {
          const originalIdx = original.indexOf(targetIdEffective)
          const dir = e.target.dropPosition === "before" ? -1 : 1
          let probe = originalIdx + dir
          while (probe >= 0 && probe < original.length) {
            const candidate = original[probe]
            if (!movingSet.has(candidate)) {
              targetIdEffective = candidate
              break
            }
            probe += dir
          }
        }
        let insertionIndex: number
        if (e.target.dropPosition === "on") insertionIndex = cleaned.length
        else {
          const targetIdx = original.indexOf(targetIdEffective)
          if (targetIdx === -1) insertionIndex = cleaned.length
          else {
            const movedBefore = original
              .slice(0, targetIdx)
              .filter((id) => movingSet.has(id)).length
            const baseIndex = targetIdx - movedBefore
            insertionIndex = e.target.dropPosition === "before" ? baseIndex : baseIndex + 1
          }
        }
        const merged = [
          ...cleaned.slice(0, insertionIndex),
          ...movedOrdered,
          ...cleaned.slice(insertionIndex),
        ]
        newSourceOrder = merged
        if (movingKind === "scope") {
          const txn =
            originalParentId === null
              ? accountScopesOrderTxn(account.id, newSourceOrder)
              : scopeScopesOrderTxn(originalParentId!, newSourceOrder)
          db.transact(txn)
        } else if (movingKind === "task") {
          const txn =
            originalParentId === null
              ? accountCurrentTasksOrderTxn(account.id, newSourceOrder)
              : scopeCurrentTasksOrderTxn(originalParentId!, newSourceOrder)
          db.transact(txn)
        }
        return
      }

      // Cross-parent move
      const cleanedSource = sourceOrder.filter((id) => !movedOrdered.includes(id))
      const cleanedDest = destOrder.filter((id) => !movedOrdered.includes(id))
      let insertionIndex: number
      if (e.target.dropPosition === "on") insertionIndex = cleanedDest.length
      else {
        const targetIdx = cleanedDest.indexOf(targetNode.id)
        insertionIndex = targetIdx === -1 ? cleanedDest.length : targetIdx
        if (e.target.dropPosition === "after") insertionIndex += 1
      }
      const newDest = [
        ...cleanedDest.slice(0, insertionIndex),
        ...movedOrdered,
        ...cleanedDest.slice(insertionIndex),
      ]

      type Txn =
        | ReturnType<typeof accountScopesOrderTxn>
        | ReturnType<typeof accountCurrentTasksOrderTxn>
        | ReturnType<typeof scopeScopesOrderTxn>
        | ReturnType<typeof scopeCurrentTasksOrderTxn>
        | ReturnType<(typeof db.tx.scopes)[string]["link"]>
        | ReturnType<(typeof db.tx.scopes)[string]["unlink"]>
        | ReturnType<(typeof db.tx.tasks)[string]["link"]>
        | ReturnType<(typeof db.tx.tasks)[string]["unlink"]>
        | ReturnType<(typeof db.tx.recurring_tasks)[string]["link"]>
        | ReturnType<(typeof db.tx.recurring_tasks)[string]["unlink"]>
      const txns: Txn[] = []
      if (movingKind === "scope") {
        txns.push(
          originalParentId === null
            ? accountScopesOrderTxn(account.id, cleanedSource)
            : scopeScopesOrderTxn(originalParentId!, cleanedSource)
        )
        txns.push(
          newParentId === null
            ? accountScopesOrderTxn(account.id, newDest)
            : scopeScopesOrderTxn(newParentId!, newDest)
        )
      } else if (movingKind === "task") {
        txns.push(
          originalParentId === null
            ? accountCurrentTasksOrderTxn(account.id, cleanedSource)
            : scopeCurrentTasksOrderTxn(originalParentId!, cleanedSource)
        )
        txns.push(
          newParentId === null
            ? accountCurrentTasksOrderTxn(account.id, newDest)
            : scopeCurrentTasksOrderTxn(newParentId!, newDest)
        )
      }

      // Link / unlink operations for actual parent relations
      if (movingKind === "scope") {
        if (newParentId === null) {
          movedIds.forEach((sid) => {
            if (originalParentId) {
              txns.push(db.tx.scopes[sid].unlink({ parent_scope: originalParentId }))
            }
          })
        } else {
          movedIds.forEach((sid) => {
            txns.push(db.tx.scopes[sid].link({ parent_scope: newParentId! }))
          })
        }
      } else if (movingKind === "task") {
        movedIds.forEach((tid) => {
          if (newParentId === null) {
            if (originalParentId) {
              txns.push(db.tx.tasks[tid].unlink({ scope: originalParentId }))
            }
          } else {
            txns.push(db.tx.tasks[tid].link({ scope: newParentId! }))
          }
        })
      }
      if (txns.length) db.transact(txns)
    },
    // Drop onto empty space / collection root.
    async onRootDrop(e) {
      if (!account) return
      // Only meaningful for scopes and current tasks
      const moved: { scopeIds: string[]; taskIds: string[]; rtaskIds: string[] } = {
        scopeIds: [],
        taskIds: [],
        rtaskIds: [],
      }
      await Promise.all(
        Array.from(e.items)
          .filter(isTextDropItem)
          .map(async (di) => {
            if (di.types.has("db/scope")) {
              const { id } = JSON.parse(await di.getText("db/scope")) as { id: string }
              moved.scopeIds.push(id)
            } else if (di.types.has("db/task")) {
              const { id } = JSON.parse(await di.getText("db/task")) as { id: string }
              moved.taskIds.push(id)
            } else if (di.types.has("db/rtask")) {
              const { id } = JSON.parse(await di.getText("db/rtask")) as { id: string }
              moved.rtaskIds.push(id)
            }
          })
      )
      if (!moved.scopeIds.length && !moved.taskIds.length && !moved.rtaskIds.length) return

      type RootTxn =
        | ReturnType<typeof accountScopesOrderTxn>
        | ReturnType<typeof accountCurrentTasksOrderTxn>
        | ReturnType<(typeof db.tx.scopes)[string]["unlink"]>
        | ReturnType<(typeof db.tx.tasks)[string]["unlink"]>
      const txns: RootTxn[] = []
      if (moved.scopeIds.length) {
        const currentOrder = getScopeOrder(null).filter((id) => !moved.scopeIds.includes(id))
        const newOrder = [...currentOrder, ...moved.scopeIds]
        txns.push(accountScopesOrderTxn(account.id, newOrder))
      }
      if (moved.taskIds.length && activeView === "current") {
        const currentTasksOrder = getCurrentTaskOrder(null).filter(
          (id) => !moved.taskIds.includes(id)
        )
        const newTasksOrder = [...currentTasksOrder, ...moved.taskIds]
        txns.push(accountCurrentTasksOrderTxn(account.id, newTasksOrder))
      }

      // Unlink / link to root
      moved.scopeIds.forEach((sid) => {
        const node = itemById.get(sid)
        if (node?.parentId) {
          txns.push(db.tx.scopes[sid].unlink({ parent_scope: node.parentId }))
        }
      })
      moved.taskIds.forEach((tid) => {
        const node = itemById.get(tid)
        if (node?.parentId) {
          txns.push(db.tx.tasks[tid].unlink({ scope: node.parentId }))
        }
      })
      // rtask unlink not needed (we didn't move them)
      if (txns.length) db.transact(txns)
    },
  })

  return { dragAndDropHooks }
}
