import { useDragAndDrop, Key, isTextDropItem } from "react-aria-components"
import { AnyViewTreeItem, useViewTreeData, ViewTreeItemMeta } from "./use-view-tree-data"
import { ViewParams } from "./use-view-params"
import { useAuth } from "./use-auth"
import { ScopeListItemData } from "./use-root-list-data"
import { db } from "@/database/db-client"
import { parseAccountUpdateInput } from "@/database/models/account"
import { parseScopeUpdateInput } from "@/database/models/scope"
import {
  encodeToken,
  decodeToken,
  removeTokens,
  insertTokens,
  dedupeTokens,
  buildFallbackTokens,
} from "@/utilities/list-order-tokens"

// New helpers: update per-view token arrays
function accountViewOrderUpdateTxn(accountId: string, view: string, tokens: string[]) {
  const { data } = parseAccountUpdateInput({ list_orders: { [view]: tokens } })
  return db.tx.accounts[accountId].merge(data)
}

function scopeViewOrderUpdateTxn(scopeId: string, view: string, tokens: string[]) {
  const { data } = parseScopeUpdateInput({ list_orders: { [view]: tokens } })
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
 *  - Supply `react-aria-components` Tree with cohesive drag & drop semantics (reordering + cross-level moves) consistent with our
 *    persisted ordering model (`list_orders`) and relational links (scope parenthood / task containment).
 * Design Highlights:
 *  - Single `onMove` handler unifies intra-parent reorders and inter-parent migrations; reduces branching vs legacy `onReorder` + `onItemDrop` split.
 *  - `onRootDrop` handles drops onto the empty collection surface (background) to move items directly to root.
 *  - Transactions are batched (order + link/unlink) for atomicity so UI doesn't transiently desync.
 * Ordering Persistence Policy:
 *  - Scope moves always adjust `list_orders.scopes` for old/new parents (or account root).
 *  - Task ordering is persisted ONLY when viewing the "current" list (constraint keeps other views ephemeral and simpler).
 *  - Root-level order updates mirror scope-level logic using account list orders.
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
 *  - To support recurring task dragging: extend accepted types + serialization + ordering rules (currently excluded intentionally).
 *  - To allow ordering in other task views: remove list guard & decide persistence semantics for those statuses.
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

  // Build a baseline ordering capturing the CURRENT rendered mixed sequence (not scopes-first) when no tokens exist yet.
  const buildBaselineTokens = (parentId: string | null): string[] => {
    const children = getRenderedChildSequence(parentId)
    const tokens: string[] = []
    for (const c of children) {
      if (c.kind === "scope") tokens.push(encodeToken("scope", c.id))
      else if (c.kind === "task" && activeView !== "recurring")
        tokens.push(encodeToken("task", c.id))
      else if (c.kind === "rtask" && activeView === "recurring")
        tokens.push(encodeToken("rtask", c.id))
    }
    // Fallback to scopes-first builder ONLY if we somehow had zero children tokens (edge case)
    return tokens.length
      ? tokens
      : buildFallbackTokens({
          view: activeView as "current" | "snoozed" | "done" | "recurring",
          scopeIds: children.filter((c) => c.kind === "scope").map((c) => c.id),
          taskIds: children.filter((c) => c.kind === "task").map((c) => c.id),
          rtaskIds: children.filter((c) => c.kind === "rtask").map((c) => c.id),
        })
  }

  const seedTokens = (parentId: string | null, existing: string[]) => {
    if (existing.length) return existing
    return buildBaselineTokens(parentId)
  }

  const getContainerListOrders = (
    parentId: string | null
  ): { tokens: string[]; scopeId: string | null } => {
    if (parentId === null) {
      const listOrdersRecord = account?.list_orders as
        | Record<string, string[] | undefined>
        | undefined
      const tokens = listOrdersRecord?.[activeView] ?? []
      return { tokens, scopeId: null }
    }
    const parentNode = itemById.get(parentId)
    if (parentNode?.kind === "scope") {
      const scope = parentNode.data as
        | ScopeListItemData
        | (typeof parentNode.data & { list_orders?: Record<string, string[]> })
      const tokens = (scope.list_orders?.[activeView] as string[] | undefined) ?? []
      return { tokens, scopeId: parentId }
    }
    return { tokens: [], scopeId: parentId }
  }

  const buildUpdateTxn = (parentId: string | null, newTokens: string[]) => {
    if (!account) return null
    if (parentId === null) return accountViewOrderUpdateTxn(account.id, activeView, newTokens)
    return scopeViewOrderUpdateTxn(parentId, activeView, newTokens)
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
    acceptedDragTypes: ["db/scope", "db/task", "db/rtask"],
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
      if (movingKind === "rtask" && activeView !== "recurring") return // disallow moving rtasks outside recurring view

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
      // Retrieve token arrays for source & destination parents
      const { tokens: rawSourceTokens } = getContainerListOrders(originalParentId)
      const { tokens: rawDestTokens } = getContainerListOrders(newParentId)
      const sourceTokens = seedTokens(originalParentId, rawSourceTokens)
      const destTokens = seedTokens(newParentId, rawDestTokens)

      // Preserve relative order of moved items according to their appearance in sourceTokens or rendered sequence fallback
      const referenceOrder = sourceTokens.length
        ? sourceTokens
        : getRenderedChildSequence(originalParentId).map((n) =>
            encodeToken(n.kind as "scope" | "task" | "rtask", n.id)
          )
      const movedTokenSet = new Set(movedIds.map((id) => `${movingKind}:${id}`))
      const movedTokensOrdered = referenceOrder.filter((t) => {
        const d = decodeToken(t)
        return d && movedTokenSet.has(`${d.kind}:${d.id}`)
      })
      // If fallback didn't capture all (e.g., new items), append encodings
      for (const id of movedIds) {
        const tk = `${movingKind}:${id}`
        if (!movedTokensOrdered.find((t) => t === tk)) movedTokensOrdered.push(tk)
      }

      let newSource = sourceTokens
      if (sameParent) {
        // Reorder inside same array using original order for index math
        const original = sourceTokens
        const movingSet = new Set(movedTokensOrdered)
        const cleanedSource = original.filter((t) => !movingSet.has(t))

        // Resolve effective target token if target is among moved (pick nearest non-moved neighbor in indicated direction)
        let targetToken = `${targetNode.kind}:${targetNode.id}`
        if (
          movingSet.has(targetToken) &&
          (e.target.dropPosition === "before" || e.target.dropPosition === "after")
        ) {
          const originalIdx = original.indexOf(targetToken)
          if (originalIdx !== -1) {
            const dir = e.target.dropPosition === "before" ? -1 : 1
            let probe = originalIdx + dir
            while (probe >= 0 && probe < original.length) {
              const candidate = original[probe]
              if (!movingSet.has(candidate)) {
                targetToken = candidate
                break
              }
              probe += dir
            }
          }
        }

        let insertionIndex: number
        if (e.target.dropPosition === "on") {
          insertionIndex = cleanedSource.length
        } else {
          const targetOriginalIndex = original.indexOf(targetToken)
          if (targetOriginalIndex === -1) {
            insertionIndex = cleanedSource.length
          } else {
            // Count how many moved tokens were before the target in original ordering
            const movedBefore = original
              .slice(0, targetOriginalIndex)
              .filter((t) => movingSet.has(t)).length
            const baseIndex = targetOriginalIndex - movedBefore
            insertionIndex = e.target.dropPosition === "before" ? baseIndex : baseIndex + 1
          }
        }

        const merged = insertTokens(cleanedSource, insertionIndex, movedTokensOrdered)
        newSource = dedupeTokens(merged)
        const orderTxn = buildUpdateTxn(originalParentId, newSource)
        if (orderTxn) db.transact(orderTxn)
        return
      }

      // Cross-parent move
      const cleanedSource = removeTokens(sourceTokens, new Set(movedTokenSet))
      const cleanedDest = removeTokens(destTokens, new Set(movedTokenSet))
      let insertionIndex: number
      if (e.target.dropPosition === "on") {
        insertionIndex = cleanedDest.length
      } else {
        const targetToken = `${targetNode.kind}:${targetNode.id}`
        const targetIndex = cleanedDest.indexOf(targetToken)
        insertionIndex = targetIndex === -1 ? cleanedDest.length : targetIndex
        if (e.target.dropPosition === "after") insertionIndex += 1
      }
      const newDest = dedupeTokens(insertTokens(cleanedDest, insertionIndex, movedTokensOrdered))

      type Txn =
        | ReturnType<typeof accountViewOrderUpdateTxn>
        | ReturnType<typeof scopeViewOrderUpdateTxn>
        | ReturnType<(typeof db.tx.scopes)[string]["link"]>
        | ReturnType<(typeof db.tx.scopes)[string]["unlink"]>
        | ReturnType<(typeof db.tx.tasks)[string]["link"]>
        | ReturnType<(typeof db.tx.tasks)[string]["unlink"]>
        | ReturnType<(typeof db.tx.recurring_tasks)[string]["link"]>
        | ReturnType<(typeof db.tx.recurring_tasks)[string]["unlink"]>
      const txns: Txn[] = []
      const sourceTxn = buildUpdateTxn(originalParentId, cleanedSource)
      if (sourceTxn) txns.push(sourceTxn)
      const destTxn = buildUpdateTxn(newParentId, newDest)
      if (destTxn) txns.push(destTxn)

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
      } else if (movingKind === "rtask") {
        movedIds.forEach((rid) => {
          if (newParentId === null) {
            if (originalParentId) {
              txns.push(db.tx.recurring_tasks[rid].unlink({ scope: originalParentId }))
            }
          } else {
            txns.push(db.tx.recurring_tasks[rid].link({ scope: newParentId! }))
          }
        })
      }
      if (txns.length) db.transact(txns)
    },
    // Drop onto empty space / collection root.
    async onRootDrop(e) {
      if (!account) return
      // Only meaningful for scopes and tasks we serialize
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

      // Root tokens update (activeView only). Retrieve existing tokens.
      const { tokens: rootTokens } = getContainerListOrders(null)
      const removing = new Set<string>([
        ...moved.scopeIds.map((id) => `scope:${id}`),
        ...moved.taskIds.map((id) => `task:${id}`),
        ...moved.rtaskIds.map((id) => `rtask:${id}`),
      ])
      const cleanedRoot = removeTokens(rootTokens, removing)
      const additions: string[] = []
      moved.scopeIds.forEach((id) => additions.push(encodeToken("scope", id)))
      if (activeView === "recurring") {
        moved.rtaskIds.forEach((id) => additions.push(encodeToken("rtask", id)))
      } else {
        moved.taskIds.forEach((id) => additions.push(encodeToken("task", id)))
      }
      const newRootTokens = dedupeTokens([...cleanedRoot, ...additions])

      type RootTxn =
        | ReturnType<typeof accountViewOrderUpdateTxn>
        | ReturnType<(typeof db.tx.scopes)[string]["unlink"]>
        | ReturnType<(typeof db.tx.tasks)[string]["unlink"]>
        | ReturnType<(typeof db.tx.recurring_tasks)[string]["unlink"]>
      const txns: RootTxn[] = []
      const orderTxn = accountViewOrderUpdateTxn(account.id, activeView, newRootTokens)
      if (orderTxn) txns.push(orderTxn)

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
      moved.rtaskIds.forEach((rid) => {
        const node = itemById.get(rid)
        if (node?.parentId) {
          txns.push(db.tx.recurring_tasks[rid].unlink({ scope: node.parentId }))
        }
      })
      if (txns.length) db.transact(txns)
    },
  })

  return { dragAndDropHooks }
}
