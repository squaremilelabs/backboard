import { DragAndDropHooks, useDragAndDrop } from "react-aria-components"
import { useRootScopeTree } from "./use-root-scope-tree"
import { ScopeTreeListItem } from "./use-scope-tree-list-items"
import { useAuth } from "@/hooks/use-auth"
import { db } from "@/database/db-client"
import { parseAccountUpdateInput } from "@/database/models/account"
import { parseScopeUpdateInput } from "@/database/models/scope"

export function useScopeTreeListDragAndDrop(): DragAndDropHooks<ScopeTreeListItem> {
  const { account } = useAuth()
  const { rootNode, nodeById } = useRootScopeTree()

  // Helper function to be utilized inside of drag and drop handlers
  const rootScopeOrderUpdateTxn = (newOrder: string[]) => {
    const { data } = parseAccountUpdateInput({ list_orders: { scopes: newOrder } })
    return db.tx.accounts[account!.id].merge(data)
  }

  const scopeScopeOrderUpdateTxn = (scopeId: string, newOrder: string[]) => {
    const { data } = parseScopeUpdateInput({ list_orders: { scopes: newOrder } })
    return db.tx.scopes[scopeId].merge(data)
  }

  const scopeLinkParentScopeTxn = (scopeId: string, parentIdToLink: string) => {
    return db.tx.scopes[scopeId].link({ parent_scope: parentIdToLink })
  }

  const scopeUnlinkParentScopeTxn = (scopeId: string, parentIdToUnlink: string) => {
    return db.tx.scopes[scopeId].unlink({ parent_scope: parentIdToUnlink })
  }

  type DatabaseTxn =
    | ReturnType<typeof rootScopeOrderUpdateTxn>
    | ReturnType<typeof scopeScopeOrderUpdateTxn>
    | ReturnType<typeof scopeLinkParentScopeTxn>
    | ReturnType<typeof scopeUnlinkParentScopeTxn>

  const { dragAndDropHooks } = useDragAndDrop<ScopeTreeListItem>({
    getItems: (keys) => {
      return [...keys]
        .map((key) => {
          const node = nodeById.get(key as string)
          if (!node) return null
          const scope = node.scope
          return {
            "text/plain": scope.title,
            "db/scope": JSON.stringify(scope),
          }
        })
        .filter((item) => item !== null)
    },
    onMove({ keys, target }) {
      /**
       * # LLM Objective
       * - Implement the reordering & reparenting logic for scope drag and drop by writing database
       *
       * ## Prerequisistes
       * - Read the RAC documentation in full https://react-spectrum.adobe.com/react-aria/Tree.html#drag-and-drop-
       * - Make sure to specifically read the "Drag and drop: Moving between levels" section of the documentation
       *
       * ## Concepts
       * - We rely on InstantDB's transactions being local-first and instantly updating the UI.
       * - We do not need to manually update React state - just need to run db.transact() and the UI will update accordingly.
       * - Any necessary helper functions have been written above.
       * - See below for anticipated usage of helper functions.
       * - Each movement typically has 2 transactional parts (which can result in up to 3 transactions):
       *   1. Ordering Persistence (using `rootScopeOrderUpdateTxn` and/or `scopeScopeOrderUpdateTxn`)
       *     - The root level scopes are ordered by `account.list_orders.scopes` (already created variable `rootScopeOrder` above)
       *     - Child scopes are ordered by `scope.list_orders.scopes` of that parent scope
       *     - Because this move event is only providing keys (scope IDs), you'll need to utilize the `nodeById` map to find the relevant scope nodes.
       *     - Remember, when passing `newOrder` you should be passing the full new order
       *     - You should derive the `newOrder` based on the displayed order in the UI, not on the previous list_orders.scopes value
       *     - The displayed order is indeed the order of which the scopes appear within the `rootNode` tree structure (presorted)
       *     - Reason being: the list_orders value may become stale at times. (e.g., when adding a new scope, the list_orders doesn't automatically update - but it does get appended properly to the tree structure)
       *   2. Parent/Child Relationship Persistence (using `scopeLinkParentScopeTxn`, `scopeUnlinkParentScopeTxn`, `scopeLinkChildScopesTxn`, and/or `scopeUnlinkChildScopesTxn`)
       * - I say 3 transactions because...
       *   - In the case of ordering persistence, you may need to update both the source and target scope orders (if moving between levels)
       *   - But in the case of parent/child relationships... you should be able to utilize just one of these functions
       *     - Note that because the DB schema is setup so that every scope can have only one parent, if you were to link a scope to a new parent, it automatically unlinks from the previous parent.
       *     - So you only need to call `scopeLinkParentScopeTxn` to update the parent scope of a moved scope.
       *     - That said, the unlinking utilities are still important for moving to the root level.
       *     - I've pre-emptively created utility functions for both the parent and children directional cases
       *     - But perhaps only one direction is needed. Please evaluate and decide. If one goes unsed, I will delete it after.
       *     - I assume the children case is most helpful because it can handle multiple at once.
       *     - But it's also possible that all 4 would be utilized and needed for different cases. Use your best judgement.
       * - When working with `dropPosition === "on"`, remember that the target scope is the one being dropped "on"
       * - Otherwise, you should be finding the target scope's parent to determine where the moved scope should go
       * - If dropping `on` - assume that the moved scope is going to the end of the list.
       * - Theoretically, you don't have to still update the `on` scope's list_orders.scopes because any new child scope should automatically appear at the end of the list.
       * - But for consistency, let's do it anyway.
       */

      // Extracted variables for readability

      // ? Note: RAC allows for multiple selected keys, but we only move the first item for now
      const movedScopeId = ([...keys] as string[])[0]
      const targetScopeId = target.key as string
      const dropPosition = target.dropPosition
      const targetScopeParentId = nodeById.get(targetScopeId)?.path.slice(-1)[0] || null // null if target is root

      // push database transactions into this array using the helper functions defined above
      // e.g., `txns.push(rootScopeOrderUpdateTxn(newOrder))`
      const txns: DatabaseTxn[] = []

      // # LLM Implemented Code
      // Derive source and destination parents from current tree
      const movedNode = nodeById.get(movedScopeId)
      if (!movedNode) return
      const sourceParentId = movedNode.path.slice(-1)[0] || null

      const isDropOn = dropPosition === "on"
      const destParentId = isDropOn ? targetScopeId : targetScopeParentId

      // No-ops and invalid cases
      if (movedScopeId === targetScopeId) return
      // Prevent moving into its own descendant (cycle protection)
      if (destParentId) {
        if (destParentId === movedScopeId) return
        const destParentNode = nodeById.get(destParentId)
        if (destParentNode && destParentNode.path.includes(movedScopeId)) return
      }

      // Helpers to read current displayed children order from the sorted tree
      const getChildrenIds = (parentId: string | null): string[] => {
        if (parentId === null) return rootNode.children.map((c) => c.id)
        const parentNode = nodeById.get(parentId)
        return parentNode ? parentNode.children.map((c) => c.id) : []
      }

      // Build starting arrays based on UI order
      const sourceChildren = getChildrenIds(sourceParentId)
      const targetChildren =
        destParentId === sourceParentId ? sourceChildren.slice() : getChildrenIds(destParentId)

      // If the item isn't actually present in source list (shouldn't happen), bail
      const sourceIndex = sourceChildren.indexOf(movedScopeId)
      if (sourceIndex === -1) return

      // Remove from source list representation
      const sourceAfter = sourceChildren.slice()
      sourceAfter.splice(sourceIndex, 1)

      // Compute insertion index in target list representation
      let insertIndex: number
      if (isDropOn) {
        insertIndex = targetChildren.length // append at end when dropping ON
      } else {
        const targetIndexInTargetList = (
          destParentId === sourceParentId ? sourceAfter : targetChildren
        ).indexOf(targetScopeId)
        if (targetIndexInTargetList === -1) return
        insertIndex =
          dropPosition === "before" ? targetIndexInTargetList : targetIndexInTargetList + 1
      }

      // Build new target list after insertion
      const targetAfter = destParentId === sourceParentId ? sourceAfter : targetChildren.slice()
      // If moving within same parent and removing item before target, the target index is already computed on sourceAfter above
      targetAfter.splice(insertIndex, 0, movedScopeId)

      // If moving within the same parent and order didn't change, bail
      if (destParentId === sourceParentId) {
        const unchanged =
          targetAfter.length === sourceChildren.length &&
          targetAfter.every((id, i) => id === sourceChildren[i])
        if (unchanged) return
      }

      // Persist ordering: update source and/or destination order arrays
      const persistOrderForParent = (parentId: string | null, newOrder: string[]) => {
        if (parentId === null) {
          txns.push(rootScopeOrderUpdateTxn(newOrder))
        } else {
          txns.push(scopeScopeOrderUpdateTxn(parentId, newOrder))
        }
      }

      if (destParentId === sourceParentId) {
        // Same parent reordering
        persistOrderForParent(sourceParentId, targetAfter)
      } else {
        // Cross-parent move: update both source and destination orders
        persistOrderForParent(sourceParentId, sourceAfter)
        persistOrderForParent(destParentId, targetAfter)
      }

      // Persist parent/child relationship
      if (destParentId === sourceParentId) {
        // Only a reorder, no parent change
      } else if (destParentId === null) {
        // Move to root: unlink previous parent
        if (sourceParentId) txns.push(scopeUnlinkParentScopeTxn(movedScopeId, sourceParentId))
      } else {
        // Move under a new parent scope
        txns.push(scopeLinkParentScopeTxn(movedScopeId, destParentId))
      }

      // Final batch commit of transactions
      db.transact(txns)
    },
  })

  return dragAndDropHooks
}
