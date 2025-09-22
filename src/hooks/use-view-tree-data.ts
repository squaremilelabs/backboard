"use client"

import { useMemo } from "react"
import { useRootListData } from "./use-root-list-data"
import { ViewParams } from "./use-view-params"
import { useAuth } from "./use-auth"
import {
  RecurringTaskListItemData,
  ScopeListItemData,
  TaskListItemData,
} from "./use-root-list-data"
import { SMUIDataTreeListItem } from "~/smui/components/data-tree-list"
import {
  sortScopesPersistent,
  sortCurrentTasks,
  sortSnoozedTasks,
  sortDoneTasks,
  sortRecurringTasks,
} from "@/utilities/data-sorters"

export type ViewTreeItemKind = "scope" | "task" | "rtask"
export type ViewTreeItemData = ScopeListItemData | TaskListItemData | RecurringTaskListItemData
type _ViewTreeItem<K extends ViewTreeItemKind> = SMUIDataTreeListItem<
  K extends "scope"
    ? ScopeListItemData
    : K extends "task"
      ? TaskListItemData
      : RecurringTaskListItemData,
  K
>
export type ViewTreeItem<K extends ViewTreeItemKind = ViewTreeItemKind> = _ViewTreeItem<K>
export type AnyViewTreeItem = ViewTreeItem<ViewTreeItemKind>
export type ViewTreeItemCounts = {
  scope: number
  task: number
  rtask: number
  total: number
}
// Extended metadata wrapper for each node (parent linkage + aggregate descendant counts)
export type ViewTreeItemMeta = AnyViewTreeItem & {
  parentId: string | null
  itemCounts: ViewTreeItemCounts
}
export type UseViewTreeDataResult = {
  items: AnyViewTreeItem[]
  itemById: Map<string, ViewTreeItemMeta>
}

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
export function useViewTreeData({ viewParams }: { viewParams: ViewParams }): UseViewTreeDataResult {
  const { account } = useAuth()
  const { data } = useRootListData({ fetchInactiveData: viewParams.showInactive })

  // # Original prompt for this hook
  // This hook should return data suitable for `SMUIDataTreeList` based on the current view params.
  // ## Core nesting logic
  // - Scopes can have child scopes (via `scope.parent_scope.id`), tasks, and recurring_tasks (aka `rtasks`)
  // - Tasks and rtasks can belong to a single scope (`task.scope.id` or `rtask.scope.id`)
  // - Anything without a parent scope is in the "root"
  // - See `SMUIDataTreeList` docs for more details on the final resulting data structure
  // ## Filtering logic
  // - viewParams.rootScopeId is the root scope to show
  // - viewParams.list is the view to show (current, snoozed, recurring, done)
  //   - current: show tasks with status "current"
  //   - snoozed: show tasks with status "snoozed"
  //   - recurring: show recurring tasks
  //   - done: show tasks with status "done"
  // - Note that `useRootListData` already filters out inactive scopes/tasks/rtasks, so no need to filter again here
  // - Use the data from `useRootListData` which includes all unfiltered scopes, tasks, and recurring tasks.
  // - Utility `maps` have also been generated with `useRootListData` for easier lookup.
  // ## Ordering logic
  // - Every level of the tree should be properly ordered.
  // - A `list_order` field is utilized for ordering child scopes across all views, and for ordering **current** tasks in a view.
  // - For root items, use `account.list_orders.scopes` for scopes, and `account.list_orders.tasks` for current tasks.
  // - Utility functions `sortScopes`, `sortTasks`, and `sortRtasks` are available for sorting at each level.

  const { items, itemById } = useMemo<UseViewTreeDataResult>(() => {
    if (!account) {
      return { items: [], itemById: new Map() }
    }

    const { scopes = [], tasks = [], rtasks = [] } = data
    const rootScopeId = viewParams.rootScopeId
    const listView = viewParams.list

    // Grouping maps (multi-maps) for structural relationships.
    const scopesByParent = new Map<string | null, ScopeListItemData[]>()
    const tasksByScope = new Map<string | null, TaskListItemData[]>()
    const rtasksByScope = new Map<string | null, RecurringTaskListItemData[]>()
    for (const s of scopes) {
      const key = s.parent_scope?.id ?? null
      if (!scopesByParent.has(key)) scopesByParent.set(key, [])
      scopesByParent.get(key)!.push(s)
    }
    for (const t of tasks) {
      const key = t.scope?.id ?? null
      if (!tasksByScope.has(key)) tasksByScope.set(key, [])
      tasksByScope.get(key)!.push(t)
    }
    for (const rt of rtasks) {
      const key = rt.scope?.id ?? null
      if (!rtasksByScope.has(key)) rtasksByScope.set(key, [])
      rtasksByScope.get(key)!.push(rt)
    }

    // Decide which task statuses to include based on list view.
    // Task inclusion handled per-view in ordering branch; helper removed in simplified model.
    /**
     * Build ordered children for a container (scopeId | null root) with simplified ordering rules.
     * Scopes always first (persisted order), then tasks for current view (persisted current tasks order),
     * then other view tasks sorted by intrinsic logic, and recurring tasks (recurring view only) by placeholder sorter.
     */
    const buildChildrenForContainer = (containerScopeId: string | null): AnyViewTreeItem[] => {
      const containerScope = containerScopeId
        ? scopes.find((s) => s.id === containerScopeId) || null
        : null
      const scopeOrder = (containerScope?.list_orders?.scopes ||
        account.list_orders?.scopes ||
        []) as string[]
      const currentTaskOrder = (containerScope?.list_orders?.current_tasks ||
        account.list_orders?.current_tasks ||
        []) as string[]

      const childScopesRaw: ScopeListItemData[] = scopesByParent.get(containerScopeId) ?? []
      const orderedScopes = sortScopesPersistent<ScopeListItemData>(childScopesRaw, scopeOrder)

      const allTasks: TaskListItemData[] = tasksByScope.get(containerScopeId) ?? []
      const currentTasks: TaskListItemData[] = allTasks.filter((t) => t.status === "current")
      const snoozedTasks: TaskListItemData[] = allTasks.filter((t) => t.status === "snoozed")
      const doneTasks: TaskListItemData[] = allTasks.filter((t) => t.status === "done")
      const childRtasks: RecurringTaskListItemData[] =
        listView === "recurring" ? (rtasksByScope.get(containerScopeId) ?? []) : []

      let orderedTasks: TaskListItemData[] = []
      if (listView === "current")
        orderedTasks = sortCurrentTasks<TaskListItemData>(currentTasks, currentTaskOrder)
      else if (listView === "snoozed")
        orderedTasks = sortSnoozedTasks<TaskListItemData>(snoozedTasks)
      else if (listView === "done") orderedTasks = sortDoneTasks<TaskListItemData>(doneTasks)

      const orderedRtasks: RecurringTaskListItemData[] =
        listView === "recurring" ? sortRecurringTasks<RecurringTaskListItemData>(childRtasks) : []

      const children: AnyViewTreeItem[] = []
      for (const s of orderedScopes) children.push(makeScopeNode(s))
      if (listView !== "recurring") {
        for (const t of orderedTasks)
          children.push({ id: t.id, kind: "task", label: t.title, data: t })
      } else {
        for (const rt of orderedRtasks)
          children.push({ id: rt.id, kind: "rtask", label: rt.title, data: rt })
      }
      return children
    }

    const makeScopeNode = (scope: ScopeListItemData): ViewTreeItem<"scope"> => {
      const children = buildChildrenForContainer(scope.id)
      return {
        id: scope.id,
        kind: "scope",
        label: scope.title,
        data: scope,
        items: children as unknown as SMUIDataTreeListItem<ScopeListItemData, "scope">[],
      }
    }

    // Root level builder (either a specific root scope or the overall root)
    if (rootScopeId) {
      const scope = scopes.find((s) => s.id === rootScopeId)
      if (!scope) return { items: [], itemById: new Map() } // invalid id => empty
      const only: AnyViewTreeItem[] = [makeScopeNode(scope)]
      const map = new Map<string, ViewTreeItemMeta>()

      // Post-order traversal to compute descendant counts efficiently.
      const computeCounts = (node: AnyViewTreeItem): ViewTreeItemCounts => {
        if (!node.items || node.items.length === 0) {
          return { scope: 0, task: 0, rtask: 0, total: 0 }
        }
        let scope = 0,
          task = 0,
          rtask = 0,
          total = 0
        for (const child of node.items as AnyViewTreeItem[]) {
          // Recurse first
          const childCounts = computeCounts(child)
          // Add child itself
          if (child.kind === "scope") scope += 1
          else if (child.kind === "task") task += 1
          else if (child.kind === "rtask") rtask += 1
          // Add child's descendants
          scope += childCounts.scope
          task += childCounts.task
          rtask += childCounts.rtask
          total += 1 + childCounts.total
        }
        return { scope, task, rtask, total }
      }

      const register = (node: AnyViewTreeItem, parentId: string | null) => {
        // children already built; compute counts lazily (will recurse down tree)
        const counts = computeCounts(node)
        map.set(node.id, { ...node, parentId, itemCounts: counts })
        node.items?.forEach((c) => register(c as AnyViewTreeItem, node.id))
      }
      only.forEach((n) => register(n, null))
      return { items: only, itemById: map }
    }

    const rootItems: AnyViewTreeItem[] = buildChildrenForContainer(null)

    // Build the itemById map with parent links
    const itemById = new Map<string, ViewTreeItemMeta>()

    const computeCounts = (node: AnyViewTreeItem): ViewTreeItemCounts => {
      if (!node.items || node.items.length === 0) {
        return { scope: 0, task: 0, rtask: 0, total: 0 }
      }
      let scope = 0,
        task = 0,
        rtask = 0,
        total = 0
      for (const child of node.items as AnyViewTreeItem[]) {
        const childCounts = computeCounts(child)
        if (child.kind === "scope") scope += 1
        else if (child.kind === "task") task += 1
        else if (child.kind === "rtask") rtask += 1
        scope += childCounts.scope
        task += childCounts.task
        rtask += childCounts.rtask
        total += 1 + childCounts.total
      }
      return { scope, task, rtask, total }
    }

    const register = (node: AnyViewTreeItem, parentId: string | null) => {
      const counts = computeCounts(node)
      itemById.set(node.id, { ...node, parentId, itemCounts: counts })
      node.items?.forEach((c) => register(c as AnyViewTreeItem, node.id))
    }
    rootItems.forEach((n) => register(n, null))

    return { items: rootItems, itemById }
  }, [account, data, viewParams.rootScopeId, viewParams.list])

  return { items, itemById }
}
