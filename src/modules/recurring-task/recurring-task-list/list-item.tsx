import { RefreshCwIcon } from "lucide-react"
import { useState } from "react"
import { getRecurringTaskInfo } from "../recurring-task-info"
import { GridListItem } from "~/smui/grid-list/components"
import { Icon } from "~/smui/icon/components"
import { ClassValue } from "~/smui/utils"
import { Button } from "~/smui/button/components"
import { typography } from "@/common/components/class-names"
import { RecurringTask } from "@/database/models/recurring-task"

export function RecurringTaskListItem({
  task,
  className,
}: {
  task: RecurringTask
  className: ClassValue
}) {
  const [_, setPanelOpen] = useState(false)
  const { label } = getRecurringTaskInfo(task)
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
            <Button variants={{ hover: "underline" }} className="grow text-left">
              {task.title || "-"}
            </Button>
            <span className={typography({ type: "label" })}>{label}</span>
          </>
        )
      }}
    </GridListItem>
  )
}
