import { ClassValue } from "tailwind-variants"
import { GripVerticalIcon, TextIcon } from "lucide-react"
import { useState } from "react"
import { Emoji, EmojiStyle } from "emoji-picker-react"
import { TaskPanel } from "../task-panel"
import { getTaskStatusInfo } from "../task-status"
import { TaskActionBar } from "../task-actions"
import { GridListItem } from "~/smui/grid-list/components"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"
import { Modal, ModalTrigger } from "~/smui/modal/components"
import { cn } from "~/smui/utils"
import { typography } from "@/common/components/class-names"
import { Checkbox } from "~/smui/checkbox/components"
import { Task } from "@/database/models/task"
import { RecurringTask } from "@/database/models/recurring-task"
import { Scope } from "@/database/models/scope"

export function TaskListItem({
  task,
  className,
  disableActionBar,
  showScopeIcon,
}: {
  task: Task & { recurring_task?: RecurringTask; scope?: Scope }
  className: ClassValue
  disableActionBar?: boolean
  showScopeIcon?: boolean
}) {
  const [panelOpen, setPanelOpen] = useState(false)

  const statusInfo = getTaskStatusInfo(task)
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
              <Button slot="drag" className="hidden md:flex">
                <Icon
                  icon={<GripVerticalIcon />}
                  className="text-neutral-muted-text !w-fit !min-w-fit"
                  variants={{ size: "sm" }}
                />
              </Button>
            )}
            <Checkbox
              slot="selection"
              excludeFromTabOrder
              classNames={{
                base: [
                  "text-neutral-muted-text hover:opacity-70 data-selected:text-primary-text",
                  isHovered && "text-primary-text",
                ],
              }}
            />
            {showScopeIcon && task.scope?.icon?.type === "emoji" && (
              <Icon
                icon={<Emoji unified={task.scope.icon.unified} emojiStyle={EmojiStyle.APPLE} />}
                variants={{ size: "sm" }}
              />
            )}
            <ModalTrigger isOpen={panelOpen} onOpenChange={setPanelOpen}>
              <Button
                className="flex items-center gap-4 truncate"
                variants={{ hover: "underline" }}
              >
                <span className="truncate">{task.title || "-"}</span>
                {task.content ? (
                  <Icon
                    icon={<TextIcon />}
                    variants={{ size: "sm" }}
                    className="text-neutral-muted-text"
                  />
                ) : null}
              </Button>
              <Modal isDismissable>
                <TaskPanel task={task} />
              </Modal>
            </ModalTrigger>
            <div className="grow" />
            <div className={cn(isHovered && !disableActionBar ? "visible" : "hidden")}>
              <TaskActionBar
                currentStatus={task.status}
                selectedTaskIds={[task.id]}
                display="icons"
              />
            </div>
            <span className={typography({ type: "label", className: "flex items-center gap-2" })}>
              {statusInfo.text}
              <Icon
                icon={<statusInfo.Icon strokeWidth={2.5} absoluteStrokeWidth />}
                variants={{ size: "sm" }}
              />
            </span>
          </>
        )
      }}
    </GridListItem>
  )
}
