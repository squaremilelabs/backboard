import { getTaskStateInfo } from "../task-state"
import { TaskActionBar } from "../task-actions"
import { TitleContentFields } from "@/common/components/title-content-fields"
import { panel } from "@/common/components/class-names"
import { Task, updateTask } from "@/database/models/task"
import { Icon } from "~/smui/icon/components"

export function TaskPanel({ task }: { task: Task }) {
  const { Icon: StateIcon, text } = getTaskStateInfo(task, { verbose: true })
  const { base, section } = panel()
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
        handleSaveValues={(values) => updateTask(task.id, values)}
      />
      <div className={section({ className: "overflow-x-auto" })}>
        <TaskActionBar
          inboxState={task.inbox_state}
          selectedTaskIds={[task.id]}
          display="buttons"
        />
      </div>
    </div>
  )
}
