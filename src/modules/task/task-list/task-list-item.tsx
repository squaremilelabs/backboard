import { ClassValue } from "tailwind-variants"
import { GripIcon, GripVerticalIcon, TextIcon } from "lucide-react"
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
import { Task, TaskLinks } from "@/database/models/task"

export function TaskListItem({
  task,
  className,
  disableActionBar,
  showScopeInfo,
  isUnordered,
}: {
  task: Task & Partial<TaskLinks>
  className: ClassValue
  disableActionBar?: boolean
  showScopeInfo?: boolean
  isUnordered?: boolean
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
                  icon={isUnordered ? <GripIcon /> : <GripVerticalIcon />}
                  className={[
                    "!w-fit !min-w-fit",
                    isUnordered ? "text-primary-text" : "text-neutral-muted-text",
                  ]}
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
            {showScopeInfo ? (
              <span
                className={typography({
                  type: "label",
                  className: "flex items-center gap-2",
                })}
              >
                {task.scope?.icon?.type === "emoji" && (
                  <Icon
                    icon={<Emoji unified={task.scope.icon.unified} emojiStyle={EmojiStyle.APPLE} />}
                    variants={{ size: "sm" }}
                    className={["opacity-70"]}
                  />
                )}
                {task.scope?.title}
              </span>
            ) : (
              <span className={typography({ type: "label", className: "flex items-center gap-2" })}>
                {statusInfo.text}
                <Icon
                  icon={<statusInfo.Icon strokeWidth={2.5} absoluteStrokeWidth />}
                  variants={{ size: "sm" }}
                />
              </span>
            )}
          </>
        )
      }}
    </GridListItem>
  )
}
