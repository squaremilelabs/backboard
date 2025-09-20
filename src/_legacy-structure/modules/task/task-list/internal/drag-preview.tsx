import { Task } from "@/database/models/task"
import { cn } from "~/smui/utils"

export function TasklistDragPreview({ tasks }: { tasks: Task[] }) {
  const firstTask = tasks[0]
  const remainingCount = tasks.length - 1
  return (
    <div
      className={cn(
        "bg-base-bg rounded-sm px-16 py-8",
        "border-l-primary-border border-l-4",
        "flex items-center gap-16"
      )}
    >
      <span>{firstTask.title}</span>{" "}
      {remainingCount ? (
        <span className="text-primary-text text-sm font-semibold">+{remainingCount}</span>
      ) : null}
    </div>
  )
}
