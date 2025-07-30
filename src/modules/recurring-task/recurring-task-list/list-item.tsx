import { RefreshCwIcon } from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"
import { RecurringTaskModal } from "../recurring-task-modal"
import { RecurringTask } from "@/database/models/recurring-task"
import { GridListItem } from "~/smui/grid-list/components"
import { Icon } from "~/smui/icon/components"
import { ClassValue } from "~/smui/utils"
import { Button } from "~/smui/button/components"
import { label } from "@/common/components/class-names"

export function RecurringTaskListItem({
  task,
  className,
}: {
  task: RecurringTask
  className: ClassValue
}) {
  const [panelOpen, setPanelOpen] = useState(false)
  return (
    <GridListItem
      id={task.id}
      textValue={task.title}
      className={[className, "rounded-sm"]}
      onAction={() => setPanelOpen(true)}
    >
      {() => {
        return (
          <>
            <Icon
              icon={<RefreshCwIcon />}
              variants={{ size: "sm" }}
              className="text-neutral-muted-text"
            />
            <RecurringTaskModal existingTask={task} isOpen={panelOpen} onOpenChange={setPanelOpen}>
              <Button variants={{ hover: "underline" }} className="grow text-left">
                {task.title || "-"}
              </Button>
            </RecurringTaskModal>
            <span className={label()}>{getDisplayedFrequency(task) || "-"}</span>
          </>
        )
      }}
    </GridListItem>
  )
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
