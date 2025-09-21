"use client"

import { useMemo } from "react"
import { useRootListData } from "./use-root-list-data"
import { useViewParams } from "./use-view-params"
import { useAuth } from "./use-auth"
import {
  RecurringTaskListItemData,
  ScopeListItemData,
  TaskListItemData,
} from "./use-root-list-data"
import { SMUIDataTreeListItem } from "~/smui/components/data-tree-list"
import { sortTasks, sortScopes, sortRtasks } from "@/utilities/data-sorters"
import { buildFallbackTokens, decodeToken, dedupeTokens } from "@/utilities/list-order-tokens"
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
    const includeTask = (t: TaskListItemData) => {
      if (listView === "recurring") return false
      return t.status === listView
    }
    const statusViewForSort: TaskStatus | null =
      listView === "recurring" ? null : (listView as TaskStatus)

    /**
     * Retrieve ordered children for a container (scopeId or null for root) based on per-view token array.
     * Fallback: scopes-first rule then view-specific items.
     */
    const buildChildrenForContainer = (containerScopeId: string | null): AnyViewTreeItem[] => {
      const containerScope = containerScopeId
        ? scopes.find((s) => s.id === containerScopeId) || null
        : null
      const listOrders = containerScope ? containerScope.list_orders : account.list_orders
      const viewTokensRaw =
        (listOrders?.[listView as keyof typeof listOrders] as string[] | undefined) ?? undefined

      const childScopes = scopesByParent.get(containerScopeId) ?? []
      const childTasks = (tasksByScope.get(containerScopeId) ?? []).filter(includeTask)
      const childRtasks =
        listView === "recurring" ? (rtasksByScope.get(containerScopeId) ?? []) : []

      const fallbackTokens = buildFallbackTokens({
        view: listView as "current" | "snoozed" | "done" | "recurring",
        scopeIds: childScopes.map((s) => s.id),
        taskIds: childTasks.map((t) => t.id),
        rtaskIds: childRtasks.map((rt) => rt.id),
      })
      const tokens = dedupeTokens(
        viewTokensRaw && viewTokensRaw.length ? viewTokensRaw : fallbackTokens
      )

      const usedScopeIds = new Set<string>()
      const usedTaskIds = new Set<string>()
      const usedRtaskIds = new Set<string>()

      const children: AnyViewTreeItem[] = []
      for (const token of tokens) {
        const decoded = decodeToken(token)
        if (!decoded) continue
        const { kind, id } = decoded
        if (kind === "scope") {
          const scope = childScopes.find((s) => s.id === id)
          if (!scope) continue
          children.push(makeScopeNode(scope))
          usedScopeIds.add(id)
          continue
        }
        if (kind === "task" && listView !== "recurring") {
          const task = childTasks.find((t) => t.id === id)
          if (!task) continue
          children.push({ id: task.id, kind: "task", label: task.title, data: task })
          usedTaskIds.add(id)
          continue
        }
        if (kind === "rtask" && listView === "recurring") {
          const rtask = childRtasks.find((rt) => rt.id === id)
          if (!rtask) continue
          children.push({ id: rtask.id, kind: "rtask", label: rtask.title, data: rtask })
          usedRtaskIds.add(id)
        }
      }

      // Append leftover entities not referenced in tokens (stable + predictable ordering)
      const leftoverScopes = childScopes.filter((s) => !usedScopeIds.has(s.id))
      const leftoverTasks = childTasks.filter((t) => !usedTaskIds.has(t.id))
      const leftoverRtasks = childRtasks.filter((rt) => !usedRtaskIds.has(rt.id))

      // Leftover ordering: we only use legacy per-kind ordering as a stable fallback
      const orderedLeftoverScopes = sortScopes({
        scopes: leftoverScopes as ScopeListItemData[],
        listOrder: containerScope?.list_orders?.scopes ?? account.list_orders?.scopes ?? [],
      })
      const orderedLeftoverTasks = statusViewForSort
        ? sortTasks({ tasks: leftoverTasks as TaskListItemData[], statusView: statusViewForSort })
        : []
      const orderedLeftoverRtasks =
        listView === "recurring"
          ? sortRtasks({ rtasks: leftoverRtasks as RecurringTaskListItemData[] })
          : []

      for (const s of orderedLeftoverScopes as ScopeListItemData[]) children.push(makeScopeNode(s))
      for (const t of orderedLeftoverTasks as TaskListItemData[])
        children.push({ id: t.id, kind: "task", label: t.title, data: t as TaskListItemData })
      for (const rt of orderedLeftoverRtasks as RecurringTaskListItemData[]) {
        children.push({
          id: rt.id,
          kind: "rtask",
          label: rt.title,
          data: rt as RecurringTaskListItemData,
        })
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
      const map = new Map<string, ViewTreeItemWithParent>()
      const register = (node: AnyViewTreeItem, parentId: string | null) => {
        map.set(node.id, { ...node, parentId })
        node.items?.forEach((c) => register(c as AnyViewTreeItem, node.id))
      }
      only.forEach((n) => register(n, null))
      return { items: only, itemById: map }
    }

    const rootItems: AnyViewTreeItem[] = buildChildrenForContainer(null)

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
