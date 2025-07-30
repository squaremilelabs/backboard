import { ClassValue } from "tailwind-variants"
import { Task } from "@/database/models/task"
import { GridListItem } from "~/smui/grid-list/components"

export function TaskListItem({ task, className }: { task: Task; className: ClassValue }) {
  return (
    <GridListItem id={task.id} textValue={task.title} className={[className]}>
      {({}) => {
        return <>{task.title}</>
      }}
    </GridListItem>
  )
}
