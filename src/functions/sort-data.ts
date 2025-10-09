import type { RecurringTask } from "@/database/models/recurring-task"
import type { Scope } from "@/database/models/scope"
import type { Task } from "@/database/models/task"

// Persistent ordering only applies to scopes (across all views) and current tasks.
// Snoozed / done / recurring lists use intrinsic temporal or custom logic.

export function sortCurrentTasks<T extends Task>(tasks: T[], idOrder: string[]): T[] {
  // Respect persisted order; append any new tasks by ascending status_time (nulls last) then created_at.
  return sortItemsByIdOrder({
    items: tasks,
    idOrder,
    missingIdsPosition: "end",
    sortMissingIds: (a, b) =>
      (a.status_time ?? Infinity) - (b.status_time ?? Infinity) || a.created_at - b.created_at,
  })
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

export function sortScopes<T extends Scope>(scopes: T[], idOrder: string[]): T[] {
  return sortItemsByIdOrder({
    items: scopes,
    idOrder,
    missingIdsPosition: "end",
    sortMissingIds: (a, b) => (a.created_at ?? 0) - (b.created_at ?? 0),
  })
}

// Placeholder: future custom logic for recurring tasks (currently stable insertion order)
export function sortRecurringTasks<T extends RecurringTask>(rtasks: T[]): T[] {
  return [...rtasks]
}

export function sortItemsByIdOrder<T extends object & { id: string }>({
  items,
  idOrder,
  missingIdsPosition,
  sortMissingIds,
}: {
  items: T[]
  idOrder: string[]
  missingIdsPosition?: "start" | "end"
  sortMissingIds: (left: T, right: T) => number
}): T[] {
  const idSet = new Set(idOrder)
  const sortedItems = items
    .filter((item) => idSet.has(item.id))
    .sort((a, b) => {
      return idOrder.indexOf(a.id) - idOrder.indexOf(b.id)
    })

  const missingItems = items.filter((item) => !idSet.has(item.id))
  if (missingItems.length === 0) return sortedItems

  if (missingIdsPosition === "start") {
    return [...missingItems.sort(sortMissingIds), ...sortedItems]
  } else if (missingIdsPosition === "end") {
    return [...sortedItems, ...missingItems.sort(sortMissingIds)]
  }

  return sortedItems
}
