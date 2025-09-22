import { RecurringTask } from "@/database/models/recurring-task"
import { Scope } from "@/database/models/scope"
import { Task, TaskStatus } from "@/database/models/task"

export function sortTasks({
  tasks,
  listOrder,
  statusView,
}: {
  tasks: Task[]
  statusView: TaskStatus
  listOrder?: string[]
}): Task[] {
  let result = [...tasks]
  if (statusView === "current") {
    result = sortByListOrder({
      items: result,
      listOrder: listOrder ?? [],
      missingIdsPosition: "end",
      sortMissingIds: (left, right) => {
        return (left.status_time ?? 0) - (right.status_time ?? 0)
      },
    })
  }

  if (statusView === "snoozed") {
    result = sortByListOrder({
      items: result,
      listOrder: listOrder ?? [],
      missingIdsPosition: "end",
      sortMissingIds: (left, right) => {
        if (left.status_time === right.status_time) {
          return left.created_at - right.created_at
        }
        if (left.status_time == null) return 1
        if (right.status_time == null) return -1
        return left.status_time - right.status_time
      },
    })
  }

  if (statusView === "done") {
    result = sortByListOrder({
      items: result,
      listOrder: listOrder ?? [],
      missingIdsPosition: "end",
      sortMissingIds: (left, right) => {
        if (left.status_time === right.status_time) {
          return left.created_at - right.created_at
        }
        if (left.status_time == null) return 1
        if (right.status_time == null) return -1
        return right.status_time - left.status_time
      },
    })
  }

  return result
}

export function sortScopes({ scopes, listOrder }: { scopes: Scope[]; listOrder: string[] }) {
  return sortByListOrder({
    items: scopes,
    listOrder,
    missingIdsPosition: "end",
    sortMissingIds: (left, right) => {
      return (left.created_at ?? 0) - (right.created_at ?? 0)
    },
  })
}

// placeholder
export function sortRtasks({ rtasks }: { rtasks: RecurringTask[] }) {
  return [...rtasks]
}

export function sortByListOrder<T extends object & { id: string }>({
  items,
  listOrder,
  missingIdsPosition,
  sortMissingIds,
}: {
  items: T[]
  listOrder: string[]
  missingIdsPosition?: "start" | "end"
  sortMissingIds: (left: T, right: T) => number
}): T[] {
  const idSet = new Set(listOrder)
  const sortedItems = items
    .filter((item) => idSet.has(item.id))
    .sort((a, b) => {
      return listOrder.indexOf(a.id) - listOrder.indexOf(b.id)
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
