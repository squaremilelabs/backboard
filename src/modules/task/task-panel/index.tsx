import { getTaskStateInfo } from "../task-state"
import { TaskActionBar } from "../task-action-bar"
import { TitleContentFields } from "@/common/components/title-content-fields"
import { panel } from "@/common/components/variants"
import { Task, updateTask } from "@/database/models/task"
import { Icon } from "~/smui/icon/components"

export function TaskPanel({ task }: { task: Task }) {
  const { Icon: TitleIcon, text } = getTaskStateInfo(task, { verbose: true })
  return (
    <div className={panel()}>
      <div className="flex items-center gap-4 p-8">
        <Icon icon={<TitleIcon />} className="text-neutral-muted-text" />
        <span className={"text-neutral-muted-text text-sm"}>{text}</span>
      </div>
      <TitleContentFields
        initialValues={{ title: task.title, content: task.content || null }}
        handleSaveValues={(values) => updateTask(task.id, values)}
      />
      <div className="flex items-center justify-between p-8">
        <TaskActionBar inboxState={task.inbox_state} selectedTaskIds={[task.id]} />
      </div>
    </div>
  )
}
