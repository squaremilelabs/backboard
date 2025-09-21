import { Scope } from "@/database/models/scope"
import { Task } from "@/database/models/task"
import { RecurringTask } from "@/database/models/recurring-task"

export type ScopeListItemData = Scope & { parent_scope: { id: string } | null }
export type TaskListItemData = Task & {
  scope: { id: string } | null
  recurring_task: { id: string } | null
}
export type RecurringTaskListItemData = RecurringTask & { scope: { id: string } | null }
