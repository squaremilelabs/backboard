/**
 * Hook: useViewTreeDragAndDrop
 * =============================================================
 * Responsibility
 *  - Supplies React Aria drag & drop configuration for the view tree produced by `useViewTreeData`.
 *  - Implements reordering + cross-scope movement with persistence rules constrained to:
 *      * scopes (all views) and
 *      * tasks only when the active list view is `current`.
 *  - Enforces that snoozed/done/recurring views do NOT persist ordering (only structural parent moves where allowed).
 *  - Excludes recurring tasks (rtasks) from all drag operations for now.
 *
 * Persistence Model (Simplified / Legacy-Compatible)
 *  - Account + scope entities each own two arrays in `list_orders`:
 *      * `scopes`: ordering of direct child scopes
 *      * `current_tasks`: ordering of direct child current tasks
 *  - When reordering inside the same parent we rewrite only that parent's relevant array.
 *  - When moving across parents we rewrite both: remove from source, append/insert into destination.
 *  - If an ordering array is empty (e.g. new parent never had a persisted order) we derive a reference order from the currently rendered sequence so relative multi-select order is preserved for the move.
 *
 * Drag Constraints & Rules
 *  - Multi-selection must be homogeneous (all scopes OR all tasks). Mixed kinds abort.
 *  - All selected items must share the same original parent for a reorder or a cross-parent move with persistence.
 *  - Tasks in non-`current` views (snoozed/done/recurring) can be dragged only to change scope membership; reordering is ignored.
 *  - Rtasks: not draggable (omitted from acceptedDragTypes + early return guards).
 *  - Drop target semantics:
 *      * dropPosition = "on" + target kind = scope  -> append as last child of that scope.
 *      * dropPosition = before/after -> insert adjacent to target within target's parent.
 *  - Root background drop (onRootDrop) appends at end of the appropriate ordering array (if persisted).
 *
 * Algorithm Highlights
 *  - Parent/children maps are (re)built each render from view tree items (O(N)); acceptable for current scale.
 *  - Reorder within same parent: remove moving IDs, compute insertion index that accounts for selected block displacing original indices, then splice.
 *  - Cross-parent: produce cleaned source/destination arrays before constructing new destination ordering.
 *  - Target resolution when target itself is inside the moving set: walk forward/backward to find the nearest non-moving sibling (matches prior UX expectations of relative placement).
 *
 * Edge Cases Handled
 *  - Dropping selection onto itself (no-op after target displacement logic).
 *  - Empty original order arrays (fallback to rendered grouping).
 *  - Repeated multi-select drags preserving original relative order even when some items were not yet persisted.
 *  - Moving to root vs into a nested scope (null parent vs scope ID).
 *
 * Potential Future Extensions (documented here for clarity / TODO list)
 *  - Add rtask drag support (would require deciding persistence semantics or keeping them ephemeral).
 *  - Batch link/unlink optimization (currently sequential array build; could compress to single account / scope merge when backend supports patch merging multiple arrays).
 *  - Provide parent/children maps from `useRootTreeData` directly to eliminate O(N) rebuild here (premature for now).
 *  - Introduce keyboard reordering affordances (current logic would support via a thin imperative wrapper invoking same transaction builders).
 *
 * Complexity
 *  - Reorder operations are O(k + n) where k = moved items, n = siblings count.
 *  - Cross-parent moves allocate new arrays of sibling size (still O(n)).
 *  - Map reconstruction O(N) per hook invocation (memoization optional later).
 *
 * Type Safety Notes
 *  - Avoids `any`; uses narrow helper interfaces (`ScopeListOrders`, `RootDropEvent`).
 *  - External library DropItem typing is adapted through a safe cast helper `asDropItems`.
 *
 * Reliability Guarantees
 *  - If transactions array ends empty (no structural or ordering change) we early return to avoid spurious writes.
 *  - All mutation paths funnel through `db.transact` with granular ops that mirror existing persistence model.
 */

import { useDragAndDrop, Key, isTextDropItem, DropItem } from "react-aria-components"
import { useViewTreeData } from "./use-view-tree-data"
import { useAuth } from "./use-auth"
import { useViewParams } from "./use-view-params"
import { parseAccountUpdateInput } from "@/database/models/account"
import { parseScopeUpdateInput } from "@/database/models/scope"
import type { ViewTreeItem } from "@/tokens/tree-list-data"
import { db } from "@/database/db-client"

// Persistence helpers
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

/**
 * Serialize a tree node into a drag payload understood by external drop targets *or*
 * our own internal onRootDrop/onMove handlers.
 */
function serializeDragItem(node: ViewTreeItem): DragPayload | null {
  if (node.kind === "scope") return { "db/scope": JSON.stringify({ id: node.id }) }
  if (node.kind === "task") return { "db/task": JSON.stringify({ id: node.id }) }
  if (node.kind === "rtask") return { "db/rtask": JSON.stringify({ id: node.id }) }
  return null
}

/**
 * Utility: Given a Set<Key> from React Aria, return only valid draggable IDs (scope/task/rtask).
 * Filters out any unknown keys defensively.
 */
function extractDragIds(keys: Set<Key>, getNode: (id: string) => ViewTreeItem | undefined) {
  const ids: string[] = []
  keys.forEach((k: Key) => {
    const id = String(k)
    const node = getNode(id)
    if (node && (node.kind === "scope" || node.kind === "task" || node.kind === "rtask"))
      ids.push(id)
  })
  return ids
}

// Minimal shape for drag items from react-aria-components we actually use
// Minimal root drop event shape (subset of react-aria's DroppableCollectionRootDropEvent)
interface RootDropEvent {
  items: Iterable<unknown>
}

/** Narrow an unknown iterable into DropItem iterable (internal helper to keep exported surface clean). */
function asDropItems(iter: Iterable<unknown>): Iterable<DropItem> {
  return iter as Iterable<DropItem>
}

/**
 * Main exported hook providing `dragAndDropHooks` consumed by the tree list component.
 */
export function useViewTreeDragAndDrop() {
  const { account } = useAuth()
  const { viewParams } = useViewParams()
  const { itemById, items } = useViewTreeData()
  const activeView = viewParams.list

  // Build parent maps from tree shape (top-level parent = rootScopeId or null)
  const parentIdById = new Map<string, string | null>()
  const childrenByParent = new Map<string | null, ViewTreeItem[]>()
  const walk = (parentId: string | null, list: ViewTreeItem[]) => {
    childrenByParent.set(parentId, list)
    for (const child of list) {
      parentIdById.set(child.id, parentId)
      if (child.kind === "scope" && child.items?.length) {
        walk(child.id, child.items as ViewTreeItem[])
      }
    }
  }
  walk(viewParams.rootScopeId ?? null, items)

  const getRenderedChildSequence = (parentId: string | null) => childrenByParent.get(parentId) ?? []

  interface ScopeListOrders {
    list_orders?: { scopes?: string[]; current_tasks?: string[] }
  }
  const getScopeOrder = (parentId: string | null): string[] => {
    if (!account) return []
    if (parentId === null) return (account.list_orders?.scopes as string[] | undefined) ?? []
    const node = itemById.get(parentId)
    if (node?.kind === "scope") return (node.data as ScopeListOrders).list_orders?.scopes ?? []
    return []
  }
  const getCurrentTaskOrder = (parentId: string | null): string[] => {
    if (activeView !== "current" || !account) return []
    if (parentId === null) return (account.list_orders?.current_tasks as string[] | undefined) ?? []
    const node = itemById.get(parentId)
    if (node?.kind === "scope")
      return (node.data as ScopeListOrders).list_orders?.current_tasks ?? []
    return []
  }

  const { dragAndDropHooks } = useDragAndDrop<ViewTreeItem>({
    getItems: (keys: Set<Key>) => {
      const arr: Record<string, string>[] = []
      keys.forEach((k: Key) => {
        const node = itemById.get(String(k))
        const payload = node ? serializeDragItem(node as ViewTreeItem) : null
        if (payload) arr.push(payload)
      })
      return arr
    },
    acceptedDragTypes: ["db/scope", "db/task"],
    getDropOperation: () => "move",
    shouldAcceptItemDrop: (target: { key: Key; dropPosition: string }) => {
      const node = itemById.get(String(target.key))
      if (!node) return false
      if (target.dropPosition === "on") return node.kind === "scope"
      return target.dropPosition === "before" || target.dropPosition === "after"
    },
    /**
     * Core reordering / moving handler invoked by React Aria when a collection move occurs.
     * Performs:
     *  1. Validation (homogeneous kinds, shared parent, allowed view semantics)
     *  2. Parent resolution from drop target
     *  3. Branch: same-parent reorder vs cross-parent move
     *  4. Persistence mutation generation
     */
    async onMove(e: {
      target: { key: Key; dropPosition: "before" | "after" | "on" }
      keys: Set<Key>
    }) {
      if (!account) return
      const targetNode = itemById.get(String(e.target.key)) as ViewTreeItem | undefined
      if (!targetNode) return

      const movedIds = extractDragIds(e.keys, (id) => itemById.get(id) as ViewTreeItem | undefined)
      if (!movedIds.length) return
      const first = itemById.get(movedIds[0]) as ViewTreeItem
      if (
        !movedIds.every((id) => (itemById.get(id) as ViewTreeItem | undefined)?.kind === first.kind)
      )
        return
      const kind = first.kind
      if (kind === "rtask") return
      const originalParent = parentIdById.get(first.id) ?? null
      if (!movedIds.every((id) => (parentIdById.get(id) ?? null) === originalParent)) return

      let newParent: string | null
      if (e.target.dropPosition === "on" && targetNode.kind === "scope") newParent = targetNode.id
      else if (e.target.dropPosition === "before" || e.target.dropPosition === "after")
        newParent = parentIdById.get(targetNode.id) ?? null
      else return

      const sameParent = newParent === originalParent

      if (kind === "task" && activeView !== "current") {
        if (sameParent) return
        const txs: Array<
          | ReturnType<(typeof db.tx.tasks)[string]["link"]>
          | ReturnType<(typeof db.tx.tasks)[string]["unlink"]>
        > = []
        movedIds.forEach((id) => {
          if (newParent === null) {
            if (originalParent) txs.push(db.tx.tasks[id].unlink({ scope: originalParent }))
          } else txs.push(db.tx.tasks[id].link({ scope: newParent }))
        })
        if (txs.length) db.transact(txs)
        return
      }

      const sourceOrder =
        kind === "scope" ? getScopeOrder(originalParent) : getCurrentTaskOrder(originalParent)
      const destOrder = kind === "scope" ? getScopeOrder(newParent) : getCurrentTaskOrder(newParent)
      const reference = sourceOrder.length
        ? sourceOrder
        : getRenderedChildSequence(originalParent)
            .filter((n) => n.kind === kind)
            .map((n) => n.id)
      const movedOrdered = reference.filter((id) => movedIds.includes(id))
      for (const id of movedIds) if (!movedOrdered.includes(id)) movedOrdered.push(id)

      if (sameParent) {
        const moving = new Set(movedOrdered)
        const cleaned = sourceOrder.filter((id) => !moving.has(id))
        let targetIdEffective = targetNode.id
        if (
          moving.has(targetIdEffective) &&
          (e.target.dropPosition === "before" || e.target.dropPosition === "after")
        ) {
          const idx = sourceOrder.indexOf(targetIdEffective)
          const dir = e.target.dropPosition === "before" ? -1 : 1
          let probe = idx + dir
          while (probe >= 0 && probe < sourceOrder.length) {
            const cand = sourceOrder[probe]
            if (!moving.has(cand)) {
              targetIdEffective = cand
              break
            }
            probe += dir
          }
        }
        let insertion: number
        if (e.target.dropPosition === "on") insertion = cleaned.length
        else {
          const tIdx = sourceOrder.indexOf(targetIdEffective)
          if (tIdx === -1) insertion = cleaned.length
          else {
            const movedBefore = sourceOrder.slice(0, tIdx).filter((id) => moving.has(id)).length
            const base = tIdx - movedBefore
            insertion = e.target.dropPosition === "before" ? base : base + 1
          }
        }
        const newOrder = [
          ...cleaned.slice(0, insertion),
          ...movedOrdered,
          ...cleaned.slice(insertion),
        ]
        let txn:
          | ReturnType<typeof accountScopesOrderTxn>
          | ReturnType<typeof scopeScopesOrderTxn>
          | ReturnType<typeof accountCurrentTasksOrderTxn>
          | ReturnType<typeof scopeCurrentTasksOrderTxn>
        if (kind === "scope") {
          txn =
            originalParent === null
              ? accountScopesOrderTxn(account.id, newOrder)
              : scopeScopesOrderTxn(originalParent!, newOrder)
        } else {
          txn =
            originalParent === null
              ? accountCurrentTasksOrderTxn(account.id, newOrder)
              : scopeCurrentTasksOrderTxn(originalParent!, newOrder)
        }
        db.transact(txn!)
        return
      }

      const cleanedSource = sourceOrder.filter((id) => !movedOrdered.includes(id))
      const cleanedDest = destOrder.filter((id) => !movedOrdered.includes(id))
      let insertionIdx: number
      if (e.target.dropPosition === "on") insertionIdx = cleanedDest.length
      else {
        const tIdx = cleanedDest.indexOf(targetNode.id)
        insertionIdx = tIdx === -1 ? cleanedDest.length : tIdx
        if (e.target.dropPosition === "after") insertionIdx += 1
      }
      const newDest = [
        ...cleanedDest.slice(0, insertionIdx),
        ...movedOrdered,
        ...cleanedDest.slice(insertionIdx),
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
      const txns: Txn[] = []
      if (kind === "scope") {
        txns.push(
          originalParent === null
            ? accountScopesOrderTxn(account.id, cleanedSource)
            : scopeScopesOrderTxn(originalParent!, cleanedSource)
        )
        txns.push(
          newParent === null
            ? accountScopesOrderTxn(account.id, newDest)
            : scopeScopesOrderTxn(newParent!, newDest)
        )
      } else {
        txns.push(
          originalParent === null
            ? accountCurrentTasksOrderTxn(account.id, cleanedSource)
            : scopeCurrentTasksOrderTxn(originalParent!, cleanedSource)
        )
        txns.push(
          newParent === null
            ? accountCurrentTasksOrderTxn(account.id, newDest)
            : scopeCurrentTasksOrderTxn(newParent!, newDest)
        )
      }

      if (kind === "scope") {
        if (newParent === null)
          movedIds.forEach((sid) => {
            if (originalParent)
              txns.push(db.tx.scopes[sid].unlink({ parent_scope: originalParent }))
          })
        else
          movedIds.forEach((sid) => txns.push(db.tx.scopes[sid].link({ parent_scope: newParent! })))
      } else {
        movedIds.forEach((tid) => {
          if (newParent === null) {
            if (originalParent) txns.push(db.tx.tasks[tid].unlink({ scope: originalParent }))
          } else txns.push(db.tx.tasks[tid].link({ scope: newParent! }))
        })
      }
      if (txns.length) db.transact(txns)
    },
    // Root background drop (adds at end)
    /** Handle drops onto background / collection root area. */
    async onRootDrop(e: RootDropEvent) {
      if (!account) return
      const targetParent: string | null = viewParams.rootScopeId ?? null
      const moved = { scopeIds: [] as string[], taskIds: [] as string[] }
      const promises: Promise<void>[] = []
      for (const raw of asDropItems(e.items)) {
        if (!isTextDropItem(raw)) continue
        const item = raw
        if (item.types.has("db/scope")) {
          promises.push(
            item.getText("db/scope").then((txt) => {
              moved.scopeIds.push(JSON.parse(txt).id)
            })
          )
        } else if (item.types.has("db/task")) {
          promises.push(
            item.getText("db/task").then((txt) => {
              moved.taskIds.push(JSON.parse(txt).id)
            })
          )
        }
      }
      if (promises.length) await Promise.all(promises)
      if (!moved.scopeIds.length && !moved.taskIds.length) return
      type RootTxn =
        | ReturnType<typeof accountScopesOrderTxn>
        | ReturnType<typeof accountCurrentTasksOrderTxn>
        | ReturnType<typeof scopeScopesOrderTxn>
        | ReturnType<typeof scopeCurrentTasksOrderTxn>
        | ReturnType<(typeof db.tx.scopes)[string]["link"]>
        | ReturnType<(typeof db.tx.scopes)[string]["unlink"]>
        | ReturnType<(typeof db.tx.tasks)[string]["link"]>
        | ReturnType<(typeof db.tx.tasks)[string]["unlink"]>
      const txns: RootTxn[] = []
      if (moved.scopeIds.length) {
        const existing = getScopeOrder(targetParent).filter((id) => !moved.scopeIds.includes(id))
        const newOrder = [...existing, ...moved.scopeIds]
        txns.push(
          targetParent === null
            ? accountScopesOrderTxn(account.id, newOrder)
            : scopeScopesOrderTxn(targetParent, newOrder)
        )
        moved.scopeIds.forEach((sid) => {
          const curParent = parentIdById.get(sid) ?? null
          if (curParent === targetParent) return
          if (targetParent === null) {
            if (curParent) txns.push(db.tx.scopes[sid].unlink({ parent_scope: curParent }))
          } else txns.push(db.tx.scopes[sid].link({ parent_scope: targetParent }))
        })
      }
      if (moved.taskIds.length) {
        if (activeView === "current") {
          const existing = getCurrentTaskOrder(targetParent).filter(
            (id) => !moved.taskIds.includes(id)
          )
          const newOrder = [...existing, ...moved.taskIds]
          txns.push(
            targetParent === null
              ? accountCurrentTasksOrderTxn(account.id, newOrder)
              : scopeCurrentTasksOrderTxn(targetParent, newOrder)
          )
        }
        moved.taskIds.forEach((tid) => {
          const curParent = parentIdById.get(tid) ?? null
          if (curParent === targetParent) return
          if (targetParent === null) {
            if (curParent) txns.push(db.tx.tasks[tid].unlink({ scope: curParent }))
          } else txns.push(db.tx.tasks[tid].link({ scope: targetParent }))
        })
      }
      if (txns.length) db.transact(txns)
    },
  })

  return { dragAndDropHooks }
}
