"use client"

import { useRootListData } from "./use-root-list-data"
import { useViewParams } from "./use-view-params"
import { useAuth } from "./use-auth"
import { SMUIDataTreeListItem } from "~/smui/components/data-tree-list"
import { RecurringTaskListItemData, ScopeListItemData, TaskListItemData } from "@/types/data"
import { sortTasks, sortScopes, sortRtasks } from "@/functions/data-sorters"

type ViewTreeItemKind = "scope" | "task" | "rtask"

type ViewTreeItem<K extends ViewTreeItemKind = ViewTreeItemKind> = SMUIDataTreeListItem<
  K extends "scope"
    ? ScopeListItemData
    : K extends "task"
      ? TaskListItemData
      : RecurringTaskListItemData,
  K
>

export function useViewTreeData() {
  const { account } = useAuth()
  const { viewParams } = useViewParams()
  const { data, maps } = useRootListData({ fetchInactiveData: viewParams.showInactive })

  // TODO: build the tree data for `SMUIDataTreeList`
  // This hook should return data suitable for `SMUIDataTreeList` based on the current view params.
  // ## Core nesting logic
  // - Scopes can have child scopes (via `scope.parent_scope.id`), tasks, and recurring_tasks (aka `rtasks`)
  // - Tasks and rtasks can belong to a single scope (`task.scope.id` or `rtask.scope.id`)
  // - Anything without a parent scope is in the "root"
  // - See `SMUIDataTreeList` docs for more details on the final resulting data structure
  // ## Filtering logic
  // - viewParams.rootScopeId is the root scope to show
  // - viewParams.list is the view to show (current, snoozed, recurring, done)
  //   - current: show tasks with status "current" or "snoozed"
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

  const items: ViewTreeItem[] = []
  return { items }
}
