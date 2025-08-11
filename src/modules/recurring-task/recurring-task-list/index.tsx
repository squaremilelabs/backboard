"use client"

// TODO: Refactor

import { getRecurringTaskInfo, RecurringTaskFrequencyType } from "../recurring-task-info"
import { RecurringTaskListItem } from "./list-item"
import { RecurringTaskListCreateBox } from "./create-box"
import { useCurrentScopeView } from "@/modules/scope/use-scope-views"
import { GridList } from "~/smui/grid-list/components"
import { cn } from "~/smui/utils"
import { useDBQuery } from "@/database/db-client"
import { RecurringTask } from "@/database/models/recurring-task"

export function RecurringTaskList() {
  const { id: scopeId } = useCurrentScopeView()

  const taskQuery = useDBQuery("recurring_tasks", {
    $: { where: { "scope.id": scopeId, "is_inactive": false } },
  })

  const tasks = sortRecurringTasks(taskQuery.recurring_tasks || [])

  return (
    <div
      className={cn(
        "bg-neutral-muted-bg flex h-full max-h-full flex-col gap-2 rounded-sm border p-2",
        "overflow-auto"
      )}
    >
      <RecurringTaskListCreateBox />
      <GridList
        aria-label="Recurring Task List"
        variants={{ variant: "task-list" }}
        items={tasks}
        renderEmptyState={() => <div className="h-36" />}
      >
        {(task, classNames) => <RecurringTaskListItem task={task} className={classNames.item} />}
      </GridList>
    </div>
  )
}

const sortRecurringTasks = (tasks: RecurringTask[]) => {
  return [...tasks].sort((left, right) => {
    const leftInfo = getRecurringTaskInfo(left)
    const rightInfo = getRecurringTaskInfo(right)
    const leftFrequency = leftInfo.frequency
    const rightFrequency = rightInfo.frequency
    const leftFirstDay = leftInfo.days[0]
    const rightFirstDay = rightInfo.days[0]

    const frequencyOrder: Record<RecurringTaskFrequencyType, number> = {
      "daily": 1,
      "weekdays": 2,
      "weekly": 3,
      "n-weekly": 4,
      "monthly": 5,
      "n-monthly": 6,
    }

    // sort by position in frequency order... for tie breakers sort by firstDay ascending
    if (frequencyOrder[leftFrequency] !== frequencyOrder[rightFrequency]) {
      return frequencyOrder[leftFrequency] - frequencyOrder[rightFrequency]
    }
    // Tie breaker: sort by firstDay ascending
    if (leftFirstDay !== rightFirstDay) {
      return (leftFirstDay ?? 0) - (rightFirstDay ?? 0)
    }
    return 0
  })
}
