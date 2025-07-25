import { format } from "date-fns"
import { useCurrentInboxView } from "../inbox/inbox-views"
import { RecurringTaskModal } from "./recurring-task-info"
import { db } from "@/database/db"
import { RecurringTask } from "@/database/models/recurring-task"
import { Button } from "~/smui/button/components"
import { GridList, GridListItem } from "~/smui/grid-list/components"
import { cn } from "~/smui/utils"

export function RecurringTaskList() {
  const { id: inboxId } = useCurrentInboxView()

  const recurringTaskQuery = db.useQuery({
    recurring_tasks: {
      $: {
        where: {
          "inbox.id": inboxId,
          "is_archived": false,
        },
        order: { created_at: "desc" },
      },
    },
  })

  const recurringTasks = (recurringTaskQuery.data?.recurring_tasks || []) as RecurringTask[]
  const sortedRecurringTasks = sortRecurringTasks(recurringTasks)

  return (
    <GridList
      aria-label="Recurring Task List"
      items={sortedRecurringTasks}
      classNames={{
        base: "flex flex-col divide-y divide-canvas-1 not-data-empty:border-b",
        item: [
          "flex items-start",
          "gap-8 px-16 py-8 !outline-0",
          "bg-canvas-0 data-selected:bg-canvas-0",
          "focus-visible:border-l-4 focus-visible:border-l-canvas-3",
          "data-selected:border-l-4 data-selected:border-l-primary-3",
        ],
      }}
    >
      {(task, classNames) => {
        return (
          <GridListItem id={task.id} textValue={task.title} className={classNames.item}>
            <RecurringTaskModal existingTask={task}>
              <Button className="grow cursor-pointer text-left hover:underline">
                {task.title}
              </Button>
            </RecurringTaskModal>
            <p
              className={cn(
                "text-canvas-3 min-w-fit text-sm uppercase",
                "leading-20 font-semibold tracking-wide"
              )}
            >
              {getDisplayedFrequency(task)}
            </p>
          </GridListItem>
        )
      }}
    </GridList>
  )
}

const sortRecurringTasks = (tasks: RecurringTask[]) => {
  return [...tasks].sort((left, right) => {
    const frequencyOrder = {
      daily: 0,
      weekly: 1,
      monthly: 2,
    }
    // Sort by frequency type
    const freqDiff = frequencyOrder[left.frequency?.type] - frequencyOrder[right.frequency?.type]
    if (freqDiff !== 0) return freqDiff

    // If weekly, sort by weekday
    if (left.frequency?.type === "weekly" && right.frequency?.type === "weekly") {
      const leftDay = left.frequency.weekday
      const rightDay = right.frequency.weekday
      if (leftDay !== rightDay) return leftDay - rightDay
    }

    // If monthly, sort by day of month
    if (left.frequency?.type === "monthly" && right.frequency?.type === "monthly") {
      const leftDay = left.frequency.day
      const rightDay = right.frequency.day
      if (leftDay !== rightDay) return leftDay - rightDay
    }

    // If daily, put skip_weekends=false before skip_weekends=true
    if (left.frequency?.type === "daily" && right.frequency?.type === "daily") {
      const leftSkip = left.frequency.skip_weekends ? 1 : 0
      const rightSkip = right.frequency.skip_weekends ? 1 : 0
      if (leftSkip !== rightSkip) return leftSkip - rightSkip
    }

    // Tie breaker: created_at ascending
    return new Date(left.created_at).getTime() - new Date(right.created_at).getTime()
  })
}

function getDisplayedFrequency(task: RecurringTask): string {
  if (task.frequency?.type === "weekly") {
    const weekdays = [
      "Sundays",
      "Mondays",
      "Tuesdays",
      "Wednesdays",
      "Thursdays",
      "Fridays",
      "Saturdays",
    ]
    return `${weekdays[task.frequency.weekday]}`
  }

  if (task.frequency?.type === "monthly") {
    const dayOfMonth = format(new Date(2020, 1, task.frequency.day), "do")
    return `Monthly (${dayOfMonth} day)`
  }

  if (task.frequency?.type === "daily" && task.frequency.skip_weekends) {
    return "Weekdays"
  }

  return "Daily"
}
