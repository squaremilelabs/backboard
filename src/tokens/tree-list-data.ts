import { RecurringTask } from "@/database/models/recurring-task"
import { Scope } from "@/database/models/scope"
import { Task } from "@/database/models/task"
import { SMUIDataTreeListItem } from "~/smui/components/data-tree-list"

// # for useRootListData

export type ScopeItemData = Scope & { parent_scope: { id: string } | null }
export type TaskItemData = Task & {
  scope: { id: string } | null
  recurring_task: { id: string } | null
}
export type RtaskItemData = RecurringTask & { scope: { id: string } | null }

export type UseRootListDataResult = {
  data: {
    scopes: ScopeItemData[]
    tasks: TaskItemData[]
    rtasks: RtaskItemData[]
  }
  maps: {
    scopeById: Map<string, ScopeItemData>
    taskById: Map<string, TaskItemData>
    rtaskById: Map<string, RtaskItemData>
    scopesByScopeId: Map<string | null, ScopeItemData[]>
    tasksByScopeId: Map<string | null, TaskItemData[]>
    rtasksByScopeId: Map<string | null, RtaskItemData[]>
  }
  isLoading: boolean
  errors: { entity: "scopes" | "tasks" | "recurring_tasks"; error: string }[] | null
}

// # for useRootTreeData

export type RootTreeScope = {
  scopeId: string | null // null for synthetic root; otherwise scope.id
  scope: ScopeItemData | null // null for synthetic root
  parentScopeId: string | null // null if synthetic root or top-level scope
  children: {
    scopes: RootTreeScope[]
    tasks: {
      current: TaskItemData[]
      snoozed: TaskItemData[]
      done: TaskItemData[]
    }
    rtasks: RtaskItemData[]
  }
  // Fully-recursive aggregate counts including all descendant scopes.
  counts: {
    tasks: {
      current: number
      snoozed: number
      done: number
      total: number
    }
    rtasks: number
  }
}

export type UseRootTreeDataResult = {
  getTreeDataByScopeId: (scopeId: string | null) => RootTreeScope | null
  // Returns ancestor chain excluding the scope itself; empty array when scopeId null or top-level.
  getScopePathByScopeId: (scopeId: string | null) => ScopeItemData[]
}

export type ViewTreeItemKind = "scope" | "task" | "rtask"
export type ViewTreeItemData = ScopeItemData | TaskItemData | RtaskItemData
type _ViewTreeItem<K extends ViewTreeItemKind> = SMUIDataTreeListItem<
  K extends "scope" ? ScopeItemData : K extends "task" ? TaskItemData : RtaskItemData,
  K
>
export type ViewTreeItem<K extends ViewTreeItemKind = ViewTreeItemKind> = _ViewTreeItem<K>
export type AnyViewTreeItem = ViewTreeItem<ViewTreeItemKind>

export type UseViewTreeDataResult = {
  rootScope: ScopeItemData | null
  rootScopePath: ScopeItemData[] // empty if root
  items: ViewTreeItem[]
  itemById: Map<string, ViewTreeItem>
}
