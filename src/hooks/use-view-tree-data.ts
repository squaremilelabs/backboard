"use client"

import { useMemo } from "react"
import { useRootListData } from "./use-root-list-data"
import { useViewParams } from "./use-view-params"
import { useAuth } from "./use-auth"
import { SMUIDataTreeListItem } from "~/smui/components/data-tree-list"
import { RecurringTaskListItemData, ScopeListItemData, TaskListItemData } from "@/types/data"
import { sortTasks, sortScopes, sortRtasks } from "@/functions/data-sorters"
import { TaskStatus } from "@/database/models/task"

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
export type ViewTreeItemWithParent = AnyViewTreeItem & { parentId: string | null }
export type UseViewTreeDataResult = {
  items: AnyViewTreeItem[]
  itemById: Map<string, ViewTreeItemWithParent>
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
 * Ordering Rules (Important Invariants):
 *  - Scopes: ordered at each level using the parent scope's `list_orders.scopes` (or account-level for root).
 *  - Tasks: only the "current" status set is order-persisted (`list_orders.tasks`). Other status sets fall back to sorter logic without persisted order.
 *  - Recurring tasks: sorted via `sortRtasks` (no persisted order yet).
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
 *  - Introducing ordering for non-current tasks or recurring tasks would require passing appropriate `listOrder` arrays into their sorters.
 * Caution:
 *  - Because ordering for non-current task views is not persisted, a task moved while viewing another list may not reflect stable ordering on return.
 *  - Ensure `account` presence is validated early; returning deterministic empties avoids null checking cascades upstream.
 */
export function useViewTreeData(): UseViewTreeDataResult {
  const { account } = useAuth()
  const { viewParams } = useViewParams()
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

    // Build grouping maps (multi-maps) for children lookups.
    const scopesByParent = new Map<string | null, ScopeListItemData[]>()
    for (const s of scopes) {
      const key = s.parent_scope?.id ?? null
      if (!scopesByParent.has(key)) scopesByParent.set(key, [])
      scopesByParent.get(key)!.push(s)
    }

    const tasksByScope = new Map<string | null, TaskListItemData[]>()
    for (const t of tasks) {
      const key = t.scope?.id ?? null
      if (!tasksByScope.has(key)) tasksByScope.set(key, [])
      tasksByScope.get(key)!.push(t)
    }

    const rtasksByScope = new Map<string | null, RecurringTaskListItemData[]>()
    for (const rt of rtasks) {
      const key = rt.scope?.id ?? null
      if (!rtasksByScope.has(key)) rtasksByScope.set(key, [])
      rtasksByScope.get(key)!.push(rt)
    }

    // Decide which task statuses to include based on list view.
    const includeTask = (t: TaskListItemData) => {
      if (listView === "current") return t.status === "current"
      if (listView === "snoozed") return t.status === "snoozed"
      if (listView === "done") return t.status === "done"
      return false // recurring view => no tasks
    }

    const statusViewForSort: TaskStatus | null =
      listView === "recurring" ? null : listView === "current" ? "current" : listView

    const makeScopeNode = (scope: ScopeListItemData): ViewTreeItem<"scope"> => {
      // NOTE: Scope recursion builds its children eagerly so downstream renderers & DnD logic have a stable snapshot.
      // Be mindful: large/deep hierarchies could motivate on-demand expansion in the future.
      // Child scopes
      const rawChildScopes = scopesByParent.get(scope.id) ?? []
      const childScopes = sortScopes({
        scopes: rawChildScopes,
        listOrder: scope.list_orders?.scopes ?? [],
      })

      // Tasks (filtered & sorted) unless recurring-only view.
      const rawTasks = (tasksByScope.get(scope.id) ?? []).filter(includeTask)
      const sortedTasks = statusViewForSort
        ? sortTasks({
            tasks: rawTasks,
            statusView: statusViewForSort,
            listOrder:
              statusViewForSort === "current" ? (scope.list_orders?.tasks ?? []) : undefined,
          })
        : []

      // Recurring tasks only for recurring view.
      const rawRtasks = listView === "recurring" ? (rtasksByScope.get(scope.id) ?? []) : []
      const sortedRtasks = listView === "recurring" ? sortRtasks({ rtasks: rawRtasks }) : []

      const children: AnyViewTreeItem[] = []
      // Order: scopes, tasks, recurring tasks (could adjust later if different UX needed)
      for (const cs of childScopes as ScopeListItemData[]) children.push(makeScopeNode(cs))
      for (const task of sortedTasks) {
        children.push({
          id: task.id,
          kind: "task",
          label: task.title,
          data: task as TaskListItemData,
        })
      }
      for (const rt of sortedRtasks) {
        children.push({
          id: rt.id,
          kind: "rtask",
          label: rt.title,
          data: rt as RecurringTaskListItemData,
        })
      }

      return {
        id: scope.id,
        kind: "scope",
        label: scope.title,
        data: scope,
        // Cast because a scope node's children can be heterogeneous (scopes, tasks, rtasks)
        items: children as unknown as SMUIDataTreeListItem<ScopeListItemData, "scope">[],
      }
    }

    // Root level builder (either a specific root scope or the overall root)
    if (rootScopeId) {
      const scope = scopes.find((s) => s.id === rootScopeId)
      if (!scope) return { items: [], itemById: new Map() } // invalid id => empty
      const only: AnyViewTreeItem[] = [makeScopeNode(scope)]
      const map = new Map<string, ViewTreeItemWithParent>()
      const register = (node: AnyViewTreeItem, parentId: string | null) => {
        map.set(node.id, { ...node, parentId })
        node.items?.forEach((c) => register(c as AnyViewTreeItem, node.id))
      }
      only.forEach((n) => register(n, null))
      return { items: only, itemById: map }
    }

    // Root scopes
    const rootScopes = sortScopes({
      scopes: scopesByParent.get(null) ?? [],
      listOrder: account.list_orders?.scopes ?? [],
    })

    // Root-level tasks/rtasks (rare, but handle if they exist)
    const rootTasksRaw = (tasksByScope.get(null) ?? []).filter(includeTask)
    const rootTasksSorted = statusViewForSort
      ? sortTasks({
          tasks: rootTasksRaw,
          statusView: statusViewForSort,
          listOrder:
            statusViewForSort === "current" ? (account.list_orders?.tasks ?? []) : undefined,
        })
      : []

    const rootRtasksRaw = listView === "recurring" ? (rtasksByScope.get(null) ?? []) : []
    const rootRtasksSorted = listView === "recurring" ? sortRtasks({ rtasks: rootRtasksRaw }) : []

    const rootItems: AnyViewTreeItem[] = []
    for (const rs of rootScopes as ScopeListItemData[]) rootItems.push(makeScopeNode(rs))
    for (const t of rootTasksSorted) {
      rootItems.push({ id: t.id, kind: "task", label: t.title, data: t as TaskListItemData })
    }
    for (const rt of rootRtasksSorted) {
      rootItems.push({
        id: rt.id,
        kind: "rtask",
        label: rt.title,
        data: rt as RecurringTaskListItemData,
      })
    }

    // Build the itemById map with parent links
    const itemById = new Map<string, ViewTreeItemWithParent>()
    const register = (node: AnyViewTreeItem, parentId: string | null) => {
      itemById.set(node.id, { ...node, parentId })
      node.items?.forEach((c) => register(c as AnyViewTreeItem, node.id))
    }
    rootItems.forEach((n) => register(n, null))

    return { items: rootItems, itemById }
  }, [account, data, viewParams.rootScopeId, viewParams.list])

  return { items, itemById }
}
