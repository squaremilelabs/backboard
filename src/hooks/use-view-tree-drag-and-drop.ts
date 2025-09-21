import { useDragAndDrop, Key, isTextDropItem } from "react-aria-components"
import { AnyViewTreeItem, useViewTreeData, ViewTreeItemWithParent } from "./use-view-tree-data"
import { useViewParams } from "./use-view-params"
import { useAuth } from "./use-auth"
import { db } from "@/database/db-client"
import { parseAccountUpdateInput } from "@/database/models/account"
import { parseScopeUpdateInput } from "@/database/models/scope"
import { reorderIds } from "@/_deprecating/common/utils/list-utils"

function accountListUpdateTxn(accountId: string, list: "scopes" | "tasks", newOrder: string[]) {
  const { data } = parseAccountUpdateInput({ list_orders: { [list]: newOrder } })
  return db.tx.accounts[accountId].merge(data)
}

function scopeListUpdateTxn(scopeId: string, list: "scopes" | "tasks", newOrder: string[]) {
  const { data } = parseScopeUpdateInput({ list_orders: { [list]: newOrder } })
  return db.tx.scopes[scopeId].merge(data)
}

// Example usage: db.transact(scopeListUpdateTxn("scopeId", "tasks", ["id1", "id2", "id3"]))

type DragScopePayload = { "db/scope": string }
type DragTaskPayload = { "db/task": string }
type DragPayload = DragScopePayload | DragTaskPayload

function serializeDragItem(node: ViewTreeItemWithParent): DragPayload | null {
  if (node.kind === "scope") return { "db/scope": JSON.stringify({ id: node.id }) }
  if (node.kind === "task") return { "db/task": JSON.stringify({ id: node.id }) }
  return null
}

// Extract ids from keys for scopes/tasks only
function extractDragIds(
  keys: Set<Key>,
  getNode: (id: string) => ViewTreeItemWithParent | undefined
) {
  const ids: string[] = []
  keys.forEach((k) => {
    const id = String(k)
    const node = getNode(id)
    if (node && (node.kind === "scope" || node.kind === "task")) ids.push(id)
  })
  return ids
}

export function useViewTreeDragAndDrop() {
  const { account } = useAuth()
  const { viewParams } = useViewParams()
  const { itemById } = useViewTreeData()

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

  // Helper: gather ordered children of a parent (scopes/tasks separated)
  const getOrderedChildIds = (parentId: string | null, kind: "scope" | "task") => {
    // Use current rendered order from items (depth-first) respecting type and parent
    const ids: string[] = []
    itemById.forEach((node) => {
      if (node.parentId === parentId && node.kind === kind) ids.push(node.id)
    })
    return ids
  }

  const buildNewOrderAfterReorder = ({
    parentId,
    kind,
    droppedIds,
    targetId,
    dropPosition,
  }: {
    parentId: string | null
    kind: "scopes" | "tasks"
    droppedIds: string[]
    targetId: string
    dropPosition: "before" | "after" | "on"
  }) => {
    const prevOrder = getOrderedChildIds(parentId, kind === "scopes" ? "scope" : "task")
    return reorderIds({ prevOrder, droppedIds, targetId, dropPosition })
  }

  const buildOrderTxn = ({
    parentId,
    kind,
    newOrder,
  }: {
    parentId: string | null
    kind: "scopes" | "tasks"
    newOrder: string[]
  }) => {
    if (!account) return null
    if (parentId === null) return accountListUpdateTxn(account.id, kind, newOrder)
    return scopeListUpdateTxn(parentId, kind, newOrder)
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
    acceptedDragTypes: ["db/scope", "db/task"],
    getDropOperation: () => "move",
    // Decide if a particular drop target (item + position) should be accepted.
    shouldAcceptItemDrop: (target) => {
      const targetNode = itemById.get(String(target.key))
      if (!targetNode) return false
      // Allow dropping:
      // - on a scope (to become its child) for scopes or tasks
      // - before/after: only between items of same kind (scope<->scope or task<->task)
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

      // Extract moved ids (scopes/tasks only)
      const movedIds = extractDragIds(e.keys, (id) => itemById.get(id))
      if (!movedIds.length) return

      const firstNode = itemById.get(movedIds[0])!
      // All must share kind
      if (!movedIds.every((id) => itemById.get(id)?.kind === firstNode.kind)) return
      if (firstNode.kind !== "scope" && firstNode.kind !== "task") return
      const isScopeMove = firstNode.kind === "scope"
      const kindList: "scopes" | "tasks" = isScopeMove ? "scopes" : "tasks"
      if (!isScopeMove && viewParams.list !== "current") {
        // Only allow task reordering/moves in current view for ordering persistence
        return
      }

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

      // Helper: get ordered list of children for a parent of this kind
      // Normalize movedIds ordering to their appearance in the original parent's order for stable insertion
      const referenceOrder = getOrderedChildIds(originalParentId, isScopeMove ? "scope" : "task")
      const movedIdsOrdered = [...movedIds].sort(
        (a, b) => referenceOrder.indexOf(a) - referenceOrder.indexOf(b)
      )
      const orderTxns: unknown[] = []
      const linkTxns: unknown[] = []

      if (sameParent) {
        // Pure reorder within same parent
        const newOrder = buildNewOrderAfterReorder({
          parentId: originalParentId,
          kind: kindList,
          droppedIds: movedIdsOrdered,
          targetId,
          dropPosition: e.target.dropPosition as "before" | "after" | "on",
        })
        const orderTxn = buildOrderTxn({ parentId: originalParentId, kind: kindList, newOrder })
        if (orderTxn) db.transact(orderTxn)
        return
      }

      // Move between parents
      // 1. Update old parent's ordering (remove moved ids) – always for scopes, tasks only if current view
      if (isScopeMove || viewParams.list === "current") {
        const oldOrder = getOrderedChildIds(originalParentId, isScopeMove ? "scope" : "task")
        const without = oldOrder.filter((id) => !movedIdsOrdered.includes(id))
        const oldOrderTxn = buildOrderTxn({
          parentId: originalParentId,
          kind: kindList,
          newOrder: without,
        })
        if (oldOrderTxn) orderTxns.push(oldOrderTxn)
      }

      // 2. Build new parent's order after insertion
      const targetOrder = getOrderedChildIds(newParentId, isScopeMove ? "scope" : "task").filter(
        (id) => !movedIdsOrdered.includes(id)
      )
      let insertionIndex: number
      if (e.target.dropPosition === "on") {
        insertionIndex = targetOrder.length // append as children
      } else {
        const targetIndex = targetOrder.indexOf(targetId)
        if (targetIndex === -1) insertionIndex = targetOrder.length
        else insertionIndex = e.target.dropPosition === "before" ? targetIndex : targetIndex + 1
      }
      const newParentOrder = [
        ...targetOrder.slice(0, insertionIndex),
        ...movedIdsOrdered,
        ...targetOrder.slice(insertionIndex),
      ]
      if (isScopeMove || viewParams.list === "current") {
        const newOrderTxn = buildOrderTxn({
          parentId: newParentId,
          kind: kindList,
          newOrder: newParentOrder,
        })
        if (newOrderTxn) orderTxns.push(newOrderTxn)
      }

      // 3. Link updates
      if (isScopeMove) {
        if (newParentId === null) {
          // Unlink from old parent scope to move to root
          movedIdsOrdered.forEach((sid) => {
            linkTxns.push(db.tx.scopes[sid].unlink({ parent_scope: originalParentId! }))
          })
          // Root order update already prepared above (newParentId === null)
        } else {
          movedIdsOrdered.forEach((sid) => {
            linkTxns.push(db.tx.scopes[sid].link({ parent_scope: newParentId }))
          })
        }
      } else {
        movedIdsOrdered.forEach((tid) => {
          if (newParentId === null) {
            // Move task to root: unlink from original scope
            if (originalParentId)
              linkTxns.push(db.tx.tasks[tid].unlink({ scope: originalParentId }))
          } else {
            linkTxns.push(db.tx.tasks[tid].link({ scope: newParentId }))
          }
        })
      }

      if (orderTxns.length || linkTxns.length) {
        const all = [...orderTxns, ...linkTxns] as Parameters<typeof db.transact>[0]
        db.transact(all)
      }
    },
    // Drop onto empty space / collection root.
    async onRootDrop(e) {
      if (!account) return
      // Only meaningful for scopes and tasks we serialize
      const moved: { scopeIds: string[]; taskIds: string[] } = { scopeIds: [], taskIds: [] }
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
            }
          })
      )
      if (!moved.scopeIds.length && !moved.taskIds.length) return

      const orderTxns: unknown[] = []
      const linkTxns: unknown[] = []

      // Move scopes to root
      if (moved.scopeIds.length) {
        // Update old parent orders + root order
        // Collect by original parent to minimize recalcs
        const byParent = new Map<string | null, string[]>()
        moved.scopeIds.forEach((sid) => {
          const node = itemById.get(sid)
          if (node && node.kind === "scope") {
            const key = node.parentId ?? null
            if (!byParent.has(key)) byParent.set(key, [])
            byParent.get(key)!.push(sid)
          }
        })
        // Update each old parent's order (excluding null/root since we're removing from there only if they were already root)
        byParent.forEach((ids, parentId) => {
          if (parentId !== null) {
            const prev = getOrderedChildIds(parentId, "scope")
            const without = prev.filter((id) => !ids.includes(id))
            const txn = buildOrderTxn({ parentId, kind: "scopes", newOrder: without })
            if (txn) orderTxns.push(txn)
          }
        })
        // Root order append (maintain existing + add unique new ones)
        const rootPrev = getOrderedChildIds(null, "scope")
        const rootNew = [...rootPrev, ...moved.scopeIds.filter((id) => !rootPrev.includes(id))]
        const rootOrderTxn = buildOrderTxn({ parentId: null, kind: "scopes", newOrder: rootNew })
        if (rootOrderTxn) orderTxns.push(rootOrderTxn)
        // Unlink all scopes from their parents (if they had one)
        moved.scopeIds.forEach((sid) => {
          const node = itemById.get(sid)
          if (node?.kind === "scope" && node.parentId) {
            linkTxns.push(db.tx.scopes[sid].unlink({ parent_scope: node.parentId }))
          }
        })
      }

      // Move tasks to root (current view ordering only matters for account-level tasks order)
      if (moved.taskIds.length && viewParams.list === "current") {
        const byScope = new Map<string | null, string[]>()
        moved.taskIds.forEach((tid) => {
          const node = itemById.get(tid)
          if (node?.kind === "task") {
            const key = node.parentId ?? null
            if (!byScope.has(key)) byScope.set(key, [])
            byScope.get(key)!.push(tid)
          }
        })
        // Update each old scope order
        byScope.forEach((ids, parentId) => {
          if (parentId !== null) {
            const prev = getOrderedChildIds(parentId, "task")
            const without = prev.filter((id) => !ids.includes(id))
            const txn = buildOrderTxn({ parentId, kind: "tasks", newOrder: without })
            if (txn) orderTxns.push(txn)
          }
        })
        // Root tasks order
        const rootPrevTasks = getOrderedChildIds(null, "task")
        const rootNewTasks = [
          ...rootPrevTasks,
          ...moved.taskIds.filter((id) => !rootPrevTasks.includes(id)),
        ]
        const rootTasksOrderTxn = buildOrderTxn({
          parentId: null,
          kind: "tasks",
          newOrder: rootNewTasks,
        })
        if (rootTasksOrderTxn) orderTxns.push(rootTasksOrderTxn)
        // Unlink tasks
        moved.taskIds.forEach((tid) => {
          const node = itemById.get(tid)
          if (node?.kind === "task" && node.parentId) {
            linkTxns.push(db.tx.tasks[tid].unlink({ scope: node.parentId }))
          }
        })
      }

      if (orderTxns.length || linkTxns.length) {
        const all = [...orderTxns, ...linkTxns] as Parameters<typeof db.transact>[0]
        db.transact(all)
      }
    },
  })

  return { dragAndDropHooks }
}
