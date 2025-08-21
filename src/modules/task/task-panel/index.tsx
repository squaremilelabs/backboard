"use client"

import { StarIcon, StarOffIcon } from "lucide-react"
import { formatDistanceToNow, isSameMinute } from "date-fns"
import { Focusable } from "react-aria-components"
import { getTaskStatusInfo } from "../task-status"
import { TaskActionBar } from "../task-actions"
import {
  TitleContentFields,
  TitleContentFieldValues,
} from "@/common/components/title-content-fields"
import { panel } from "@/common/components/class-names"
import { Icon } from "~/smui/icon/components"
import { parseTaskUpdateInput, Task } from "@/database/models/task"
import { db } from "@/database/db-client"
import { useAuth } from "@/modules/auth/use-auth"
import { Button } from "~/smui/button/components"
import { Tooltip, TooltipTrigger } from "~/smui/tooltip/components"
import { formatDate } from "@/common/utils/date-utils"

export function TaskPanel({ task }: { task: Task }) {
  const { instantAccount } = useAuth()
  const { Icon: StatusIcon, text: statusText } = getTaskStatusInfo(
    task,
    instantAccount?.custom_work_hours,
    {
      verbose: true,
    }
  )

  const showTaskAge =
    task.status_time && !isSameMinute(task.status_time, task.created_at) && task.status !== "done"
  const taskAge = formatDistanceToNow(new Date(task.created_at))

  const { base, section } = panel()

  const handleTitleContentSave = (values: Partial<TitleContentFieldValues>) => {
    const { data } = parseTaskUpdateInput(values)
    db.transact(db.tx.tasks[task.id].update(data))
  }

  const handleStarToggle = () => {
    const { data } = parseTaskUpdateInput({ is_starred: !task.is_starred })
    db.transact(db.tx.tasks[task.id].update(data))
  }
  return (
    <div className={base()}>
      <div className={section()}>
        <div className="flex w-full items-center gap-4">
          <Icon icon={<StatusIcon />} className="text-neutral-text" />
          <span className={"text-neutral-text text-sm font-medium"}>{statusText}</span>
          <div className="grow" />
          {showTaskAge && (
            <TooltipTrigger delay={0} closeDelay={0}>
              <Focusable>
                <span className="text-neutral-muted-text cursor-default text-sm">
                  Created {taskAge} ago
                </span>
              </Focusable>
              <Tooltip
                placement="bottom right"
                offset={4}
                className="bg-base-bg rounded-sm border px-8 py-4"
              >
                <span className="text-neutral-muted-text text-sm">
                  {formatDate(new Date(task.created_at), { withTime: true, withWeekday: true })}
                </span>
              </Tooltip>
            </TooltipTrigger>
          )}
        </div>
      </div>
      <TitleContentFields
        initialValues={{ title: task.title, content: task.content || null }}
        handleSaveValues={handleTitleContentSave}
        titleStartContent={
          task.is_starred ? (
            <Button onPress={handleStarToggle}>
              {({ isHovered }) => (
                <Icon
                  icon={isHovered ? <StarOffIcon /> : <StarIcon strokeWidth={0} />}
                  className={isHovered ? "text-primary-text" : "[&_svg]:fill-primary-text"}
                  variants={{ size: "lg" }}
                />
              )}
            </Button>
          ) : undefined
        }
      />
      <div className={section({ className: "overflow-x-auto" })}>
        <TaskActionBar currentStatus={task.status} selectedTaskIds={[task.id]} display="buttons" />
        <div className="grow" />
        {!task.is_starred && (
          <Button
            variants={{ variant: "action-button-icon" }}
            className="text-neutral-muted-text hover:text-primary-text"
            onPress={handleStarToggle}
          >
            <Icon icon={<StarIcon />} />
          </Button>
        )}
      </div>
    </div>
  )
}
