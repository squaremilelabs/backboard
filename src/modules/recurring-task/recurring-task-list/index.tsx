import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { RecurringTaskModal } from "../recurring-task-modal"
import { RecurringTaskListItem } from "./list-item"
import { RecurringTask, useRecurringTaskQuery } from "@/database/models/recurring-task"
import { useCurrentInboxView } from "@/modules/inbox/inbox-views"
import { Button } from "~/smui/button/components"
import { GridList } from "~/smui/grid-list/components"
import { Icon } from "~/smui/icon/components"
import { cn } from "~/smui/utils"

export function RecurringTaskList() {
  const { id: inboxId } = useCurrentInboxView()

  const taskQuery = useRecurringTaskQuery(
    inboxId
      ? {
          $: { where: { "inbox.id": inboxId, "is_archived": false } },
        }
      : null
  )

  const tasks = sortRecurringTasks(taskQuery.data || [])

  const [panelOpen, setPanelOpen] = useState(false)

  return (
    <div className="bg-neutral-muted-bg flex h-full flex-col gap-2 rounded-sm border p-2">
      <div className={cn("flex h-36 items-stretch")}>
        <RecurringTaskModal isOpen={panelOpen} onOpenChange={setPanelOpen}>
          <Button
            className={["flex items-center gap-8", "bg-base-bg/50 hover:bg-base-bg w-full", "px-8"]}
          >
            <Icon icon={<PlusIcon />} />
            <span className={"opacity-50"}>Add</span>
          </Button>
        </RecurringTaskModal>
      </div>
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
