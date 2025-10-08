"use client"

import {
  GripVerticalIcon,
  ListChecksIcon,
  ListTodoIcon,
  StarIcon,
  StarOffIcon,
  TextIcon,
} from "lucide-react"
import { useState } from "react"
import { ClassValue } from "tailwind-variants"
import { typography } from "@/_deprecating/common/components/class-names"
import { Button } from "@/_deprecating/common/primitives/button/components"
import { Checkbox } from "@/_deprecating/common/primitives/checkbox/components"
import { GridListItem } from "@/_deprecating/common/primitives/grid-list/components"
import { Icon } from "@/_deprecating/common/primitives/icon/components"
import { Modal, ModalTrigger } from "@/_deprecating/common/primitives/modal/components"
import { cn } from "@/_deprecating/common/utils/ui-utils"
import { db } from "@/database/db-client"
import { parseTaskUpdateInput, Task, TaskLinks } from "@/database/models/task"
import { useAuth } from "@/hooks/use-auth"
import { TaskActionBar } from "../task-actions"
import { TaskPanel } from "../task-panel"
import { getTaskStatusInfo } from "../task-status"

export function TaskListItem({
  task,
  className,
  disableActionBar,
  isUnordered,
}: {
  task: Task & Partial<TaskLinks>
  className: ClassValue
  disableActionBar?: boolean
  isUnordered?: boolean
}) {
  const [panelOpen, setPanelOpen] = useState(false)
  const { account } = useAuth()

  const statusInfo = getTaskStatusInfo(task, account?.custom_work_hours, {
    verbose: false,
  })

  const handleStarToggle = () => {
    const { data } = parseTaskUpdateInput({ is_starred: !task.is_starred })
    db.transact(db.tx.tasks[task.id].update(data))
  }

  return (
    <GridListItem
      id={task.id}
      textValue={task.title}
      className={className}
      onAction={() => setPanelOpen(true)}
    >
      {({ allowsDragging, selectionMode, isHovered }) => {
        return (
          <>
            <div className="flex grow items-start gap-8 truncate">
              {allowsDragging && (
                <Button slot="drag" className="text-neutral-muted-text flex h-20 items-center">
                  <Icon
                    icon={<GripVerticalIcon />}
                    className={[
                      "!w-fit !min-w-fit",
                      isUnordered ? "text-primary-text/70" : "text-neutral-muted-text",
                    ]}
                    variants={{ size: "sm" }}
                  />
                </Button>
              )}
              {selectionMode !== "none" && (
                <Checkbox
                  slot="selection"
                  excludeFromTabOrder
                  classNames={{
                    base: [
                      "hidden md:flex",
                      "text-neutral-muted-text hover:opacity-70 data-selected:text-primary-text",
                      isHovered && "text-primary-text",
                    ],
                  }}
                />
              )}
              {task.is_starred && (
                <Button onPress={handleStarToggle}>
                  {({ isHovered }) => (
                    <Icon
                      icon={isHovered ? <StarOffIcon /> : <StarIcon strokeWidth={0} />}
                      className={isHovered ? "text-primary-text" : "[&_svg]:fill-primary-text"}
                    />
                  )}
                </Button>
              )}
              <ModalTrigger isOpen={panelOpen} onOpenChange={setPanelOpen}>
                <Button
                  className="flex items-center justify-start gap-4 truncate text-left"
                  variants={{ hover: "underline" }}
                >
                  <span className="truncate">{task.title || "-"}</span>
                  <ContentIndicator task={task} />
                </Button>
                <Modal isDismissable>
                  <TaskPanel task={task} />
                </Modal>
              </ModalTrigger>
            </div>
            <div className="flex min-h-20 min-w-fit items-center justify-end gap-8">
              <div
                className={cn(
                  "flex items-center gap-8",
                  isHovered && !disableActionBar ? "visible" : "hidden"
                )}
              >
                {!task.is_starred && (
                  <Button
                    variants={{ variant: "action-button-icon" }}
                    className="text-primary-text"
                    onPress={handleStarToggle}
                  >
                    <Icon icon={<StarIcon />} />
                  </Button>
                )}
                <TaskActionBar
                  currentStatus={task.status}
                  selectedTaskIds={[task.id]}
                  display="icons"
                />
              </div>
              <span
                className={typography({
                  type: "label",
                  className: ["flex items-center gap-2"],
                })}
              >
                {statusInfo.text}
                <Icon
                  icon={<statusInfo.Icon strokeWidth={2.5} absoluteStrokeWidth />}
                  variants={{ size: "sm" }}
                  className={[]}
                />
              </span>
            </div>
          </>
        )
      }}
    </GridListItem>
  )
}

function ContentIndicator({ task }: { task: Task & Partial<TaskLinks> }) {
  if (!task.content) return null

  const taskItemRegex = new RegExp(`"type":"taskItem"`, "g")
  const checkedTaskItemRegex = new RegExp(`"type":"taskItem","attrs":{"checked":true}`, "g")
  const taskItemCount = task.content.match(taskItemRegex)?.length || 0
  const checkedTaskItemCount = task.content.match(checkedTaskItemRegex)?.length || 0

  if (taskItemCount) {
    const isAllChecked = taskItemCount === checkedTaskItemCount
    return (
      <span
        className={cn(
          "flex items-center",
          "text-neutral-muted-text shrink-0 text-sm",
          "!no-underline"
        )}
      >
        <Icon
          icon={isAllChecked ? <ListChecksIcon /> : <ListTodoIcon />}
          variants={{ size: "md" }}
        />
        {checkedTaskItemCount}/{taskItemCount}
      </span>
    )
  }

  return (
    <Icon
      icon={<TextIcon />}
      variants={{ size: "sm" }}
      className="text-neutral-muted-text shrink-0"
    />
  )
}
