"use client"
import { useMemo } from "react"
import { useAuth } from "./use-auth"
import { useRootTreeData } from "./use-root-tree-data"
import { useViewParams } from "./use-view-params"
import type {
  UseViewTreeDataResult,
  ViewTreeItem,
  AnyViewTreeItem,
  ScopeItemData,
  TaskItemData,
  RtaskItemData,
  RootTreeScope,
} from "@/tokens/tree-list-data"
import { SMUIDataTreeListItem } from "~/smui/components/data-tree-list"
import {
  sortScopesPersistent,
  sortCurrentTasks,
  sortSnoozedTasks,
  sortDoneTasks,
  sortRecurringTasks,
} from "@/utilities/data-sorters"

/**
 * Hook: useViewTreeData
 * High-Level Responsibility:
 *  - Transform the flat entity arrays (scopes, tasks, recurring tasks) from `useRootListData` into a fully nested, typed tree structure
 *    consumable by `SMUIDataTreeList`, while applying view-level filters and ordering semantics.
 * Key Outputs:
 *  - `items`: top-level heterogeneous list of root nodes (scopes / tasks / recurring tasks depending on view).
 *  - `itemById`: Map of every node (including descendants) -> node payload + `parentId` for O(1) lookup & drag-and-drop operations.
 * Filtering Strategy:
 *  - Delegates coarse dataset filtering (inactive entities, recency window for done tasks) to `useRootListData`.
 *  - Applies fine-grained list-mode filtering (`current | snoozed | done | recurring`) here, ensuring consistent visibility rules.
 * Ordering Rules (Simplified Model):
 *  - Scopes: ordered at each level using parent scope's (or account root) `list_orders.scopes` array of scope IDs.
 *  - Current tasks: ordered via `list_orders.current_tasks` for that container (account or scope) + append new by temporal default.
 *  - Snoozed, done, recurring tasks: NO persisted order; sorted by intrinsic temporal/default logic.
 * Root Scope vs Global Root:
 *  - When `viewParams.rootScopeId` is set, the hook returns a single synthetic tree consisting solely of that scope subtree.
 *  - Otherwise, builds a forest from all root-level scopes plus any orphan tasks / recurring tasks.
 * Complexity Notes:
 *  - Tree construction cost is O(N) with additional O(K log K) per sibling group for sort operations (acceptable for typical list sizes).
 *  - Avoids recursion for non-scope children (tasks, recurring tasks) to keep stack shallow; only scopes recurse.
 * Drag-and-Drop Support Rationale:
 *  - `itemById` provides `parentId` enabling upstream DnD logic to compute reorders & cross-parent moves without tree re-walks.
 *  - Children arrays inside each scope node are intentionally heterogeneous; casting maintains flexibility while collocating display data.
 * Extension Guidance:
 *  - Adding a new item type: extend `ViewTreeItemKind`, update discriminated unions, integrate into scope + root assembly order.
 *  - Introducing ordering for additional task views would require extending schema and integrating into sorting branch logic.
 * Caution:
 *  - Because ordering for non-current task views is not persisted, a task moved while viewing another list may not reflect stable ordering on return.
 *  - Ensure `account` presence is validated early; returning deterministic empties avoids null checking cascades upstream.
 */
export function useViewTreeData(): UseViewTreeDataResult {
  const { viewParams } = useViewParams()
  const { account } = useAuth()
  const { getTreeDataByScopeId, getScopePathByScopeId } = useRootTreeData({
    fetchInactiveData: viewParams.showInactive,
  })

  /**
   * Transform a RootTreeScope children set into ordered view items recursively, applying:
   *  - persisted ordering for child scopes & current tasks
   *  - intrinsic sorters for snoozed/done/recurring
   * Tasks/rtasks filtered by current list view.
   */
  const result = useMemo<UseViewTreeDataResult>(() => {
    if (!account) {
      return { rootScope: null, rootScopePath: [], items: [], itemById: new Map() }
    }

    const treeNode = getTreeDataByScopeId(viewParams.rootScopeId ?? null)
    if (!treeNode) {
      return { rootScope: null, rootScopePath: [], items: [], itemById: new Map() }
    }

    const rootScopePath = getScopePathByScopeId(viewParams.rootScopeId ?? null)
    const listView = viewParams.list

    // Build a scope's children (scopes recurse first then tasks/rtasks leaves).
    const buildScopeChildren = (container: RootTreeScope): AnyViewTreeItem[] => {
      const scopeEntity: ScopeItemData | null = container.scope
      const scopeOrder = (scopeEntity?.list_orders?.scopes ||
        account.list_orders?.scopes ||
        []) as string[]
      const currentTaskOrder = (scopeEntity?.list_orders?.current_tasks ||
        account.list_orders?.current_tasks ||
        []) as string[]

      // Order child scopes
      // Convert child scope nodes to their `scope` entities (filter out synthetic just in case) for ordering,
      // then map back to nodes.
      const scopeEntities: ScopeItemData[] = []
      const scopeNodeById = new Map<string, RootTreeScope>()
      for (const sn of container.children.scopes) {
        if (!sn.scope) continue
        scopeEntities.push(sn.scope)
        scopeNodeById.set(sn.scope.id, sn)
      }
      const orderedEntities = sortScopesPersistent<ScopeItemData>(scopeEntities, scopeOrder)
      const orderedScopeNodes: RootTreeScope[] = orderedEntities.map(
        (e) => scopeNodeById.get(e.id)!
      )

      const items: AnyViewTreeItem[] = []
      for (const sNode of orderedScopeNodes) {
        if (!sNode.scope) continue // safety for root synthetic node
        const scopeItem: ViewTreeItem<"scope"> = {
          id: sNode.scope.id,
          kind: "scope",
          label: sNode.scope.title,
          data: sNode.scope,
          items: buildScopeChildren(sNode) as unknown as SMUIDataTreeListItem<
            ScopeItemData,
            "scope"
          >[],
        }
        items.push(scopeItem)
      }

      // Tasks / rtasks filtering per list
      if (listView === "current") {
        const ordered = sortCurrentTasks<TaskItemData>(
          container.children.tasks.current,
          currentTaskOrder
        )
        for (const t of ordered) items.push({ id: t.id, kind: "task", label: t.title, data: t })
      } else if (listView === "snoozed") {
        const ordered = sortSnoozedTasks<TaskItemData>(container.children.tasks.snoozed)
        for (const t of ordered) items.push({ id: t.id, kind: "task", label: t.title, data: t })
      } else if (listView === "done") {
        const ordered = sortDoneTasks<TaskItemData>(container.children.tasks.done)
        for (const t of ordered) items.push({ id: t.id, kind: "task", label: t.title, data: t })
      } else if (listView === "recurring") {
        const ordered = sortRecurringTasks<RtaskItemData>(container.children.rtasks)
        for (const rt of ordered)
          items.push({ id: rt.id, kind: "rtask", label: rt.title, data: rt })
      }

      return items
    }

    // When scoping to a particular root scope, we flatten its children to top-level items
    const topLevelItems = buildScopeChildren(treeNode)

    // Build itemById (flat map) for O(1) lookup (descendant counts now available via root tree if needed by consumer)
    const itemById = new Map<string, ViewTreeItem>()
    const register = (node: AnyViewTreeItem) => {
      itemById.set(node.id, node as ViewTreeItem)
      node.items?.forEach((c) => register(c as AnyViewTreeItem))
    }
    topLevelItems.forEach(register)

    return {
      rootScope: treeNode.scope, // null if global synthetic root
      rootScopePath,
      items: topLevelItems,
      itemById,
    }
  }, [
    account,
    getTreeDataByScopeId,
    getScopePathByScopeId,
    viewParams.rootScopeId,
    viewParams.list,
  ])

  return result
}
