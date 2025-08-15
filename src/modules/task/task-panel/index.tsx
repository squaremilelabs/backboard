"use client"

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

export function TaskPanel({ task }: { task: Task }) {
  const { instantAccount } = useAuth()
  const { Icon: StateIcon, text } = getTaskStatusInfo(task, instantAccount?.custom_work_hours, {
    verbose: true,
  })
  const { base, section } = panel()

  const handleTitleContentSave = (values: TitleContentFieldValues) => {
    const { data } = parseTaskUpdateInput(values)
    db.transact(db.tx.tasks[task.id].update(data))
  }
  return (
    <div className={base()}>
      <div className={section()}>
        <div className="flex items-center gap-4">
          <Icon icon={<StateIcon />} className="text-neutral-text" />
          <span className={"text-neutral-text text-sm font-medium"}>{text}</span>
        </div>
      </div>
      <TitleContentFields
        initialValues={{ title: task.title, content: task.content || null }}
        handleSaveValues={handleTitleContentSave}
      />
      <div className={section({ className: "overflow-x-auto" })}>
        <TaskActionBar currentStatus={task.status} selectedTaskIds={[task.id]} display="buttons" />
      </div>
    </div>
  )
}
