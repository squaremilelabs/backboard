import { ClassValue } from "tailwind-variants"
import { GripVerticalIcon } from "lucide-react"
import { useState } from "react"
import { TaskPanel } from "../task-panel"
import { getTaskStateInfo } from "../task-state"
import { TaskActionBar } from "../task-action-bar"
import { Task } from "@/database/models/task"
import { GridListItem } from "~/smui/grid-list/components"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"
import { Modal, ModalTrigger } from "~/smui/modal/components"
import { label } from "@/common/components/class-names"
import { cn } from "~/smui/utils"

export function TaskListItem({ task, className }: { task: Task; className: ClassValue }) {
  const [panelOpen, setPanelOpen] = useState(false)

  const stateInfo = getTaskStateInfo(task)
  return (
    <GridListItem
      id={task.id}
      textValue={task.title}
      className={[className, "rounded-sm"]}
      onAction={() => setPanelOpen(true)}
    >
      {({ allowsDragging, isHovered }) => {
        return (
          <>
            {allowsDragging && (
              <Button slot="drag" excludeFromTabOrder>
                <Icon
                  icon={<GripVerticalIcon />}
                  className="text-neutral-muted-text !w-fit !min-w-fit"
                />
              </Button>
            )}
            <ModalTrigger isOpen={panelOpen} onOpenChange={setPanelOpen}>
              <Button className="truncate p-2" variants={{ hover: "underline" }}>
                {task.title || "-"}
              </Button>
              <Modal isDismissable>
                <TaskPanel task={task} />
              </Modal>
            </ModalTrigger>
            <div className="grow" />
            <div className={cn(isHovered ? "visible" : "hidden")}>
              <TaskActionBar
                inboxState={task.inbox_state}
                selectedTaskIds={[task.id]}
                display="icons"
              />
            </div>
            <span className={label({ class: isHovered ? "hidden" : "visible" })}>
              {stateInfo.text}
            </span>
          </>
        )
      }}
    </GridListItem>
  )
}
