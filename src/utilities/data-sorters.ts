import { RecurringTask } from "@/database/models/recurring-task"
import { Scope } from "@/database/models/scope"
import { Task, TaskStatus } from "@/database/models/task"

// Persistent ordering only applies to scopes (across all views) and current tasks.
// Snoozed / done / recurring lists use intrinsic temporal or custom logic.

export function sortCurrentTasks<T extends Task>(tasks: T[], listOrder: string[]): T[] {
  // Respect persisted order; append any new tasks by ascending status_time (nulls last) then created_at.
  const idSet = new Set(listOrder)
  const ordered: T[] = []
  for (const id of listOrder) {
    const t = tasks.find((x) => x.id === id && x.status === "current")
    if (t) ordered.push(t)
  }
  const missing = tasks.filter((t) => t.status === "current" && !idSet.has(t.id))
  missing.sort(
    (a, b) =>
      (a.status_time ?? Infinity) - (b.status_time ?? Infinity) || a.created_at - b.created_at
  )
  return [...ordered, ...missing]
}

export function sortSnoozedTasks<T extends Task>(tasks: T[]): T[] {
  // Ascending by status_time; nulls last; tie-breaker created_at ascending.
  return [...tasks]
    .filter((t) => t.status === "snoozed")
    .sort((a, b) => {
      if (a.status_time == null && b.status_time == null) return a.created_at - b.created_at
      if (a.status_time == null) return 1
      if (b.status_time == null) return -1
      if (a.status_time === b.status_time) return a.created_at - b.created_at
      return a.status_time - b.status_time
    })
}

export function sortDoneTasks<T extends Task>(tasks: T[]): T[] {
  // Descending by status_time (pre-validated non-null); tie-breaker created_at ascending
  return [...tasks]
    .filter((t) => t.status === "done")
    .sort((a, b) => {
      if (a.status_time === b.status_time) return a.created_at - b.created_at
      return (b.status_time ?? 0) - (a.status_time ?? 0)
    })
}

export function sortScopesPersistent<T extends Scope>(scopes: T[], listOrder: string[]): T[] {
  const idSet = new Set(listOrder)
  const ordered: T[] = []
  for (const id of listOrder) {
    const s = scopes.find((x) => x.id === id)
    if (s) ordered.push(s)
  }
  const missing = scopes.filter((s) => !idSet.has(s.id))
  missing.sort((a, b) => (a.created_at ?? 0) - (b.created_at ?? 0))
  return [...ordered, ...missing]
}

// Placeholder: future custom logic for recurring tasks (currently stable insertion order)
export function sortRecurringTasks<T extends RecurringTask>(rtasks: T[]): T[] {
  return [...rtasks]
}

// Convenience unified dispatcher if needed by legacy code.
export function sortTasksByView<T extends Task>(
  tasks: T[],
  view: TaskStatus,
  listOrder: string[]
): T[] {
  if (view === "current") return sortCurrentTasks(tasks, listOrder)
  if (view === "snoozed") return sortSnoozedTasks(tasks)
  if (view === "done") return sortDoneTasks(tasks)
  return tasks
}
