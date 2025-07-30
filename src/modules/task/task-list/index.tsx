import { TaskListItem } from "./task-list-item"
import { sortItemsByIdOrder } from "@/common/utils/list-utils"
import { useInboxQuery } from "@/database/models/inbox"
import { Task, useTaskQuery } from "@/database/models/task"
import { useCurrentInboxView } from "@/modules/inbox/inbox-views"
import { GridList } from "~/smui/grid-list/components"

export function TaskList() {
  const tasks = useTaskListTaskQuery()

  return (
    <div className="flex flex-col gap-2 p-2">
      <GridList
        aria-label="Task List"
        items={tasks}
        selectionMode="multiple"
        selectionBehavior="replace"
      >
        {(task, classNames) => <TaskListItem task={task} className={classNames.item} />}
      </GridList>
    </div>
  )
}

function useTaskListTaskQuery() {
  const { id: inboxId, view: inboxView } = useCurrentInboxView()

  const inboxQuery = useInboxQuery({
    $: { where: { id: inboxId }, first: 1 },
  })

  const inbox = inboxQuery.data?.[0]

  const taskQuery = useTaskQuery({
    $: {
      where: {
        "inbox.id": inboxId,
        "inbox_state": inboxView,
      },
      order:
        inboxView === "snoozed"
          ? { snooze_date: "asc" }
          : inboxView === "archived"
            ? { archive_date: "desc" }
            : undefined,
      limit: inboxView === "archived" ? 30 : undefined,
    },
  })

  const tasks: Task[] = taskQuery.data ?? []

  if (inboxView === "open") {
    return sortItemsByIdOrder({
      items: tasks,
      idOrder: inbox?.open_task_order ?? [],
      missingIdsPosition: "end",
      sortMissingIds(left, right) {
        return left.created_at - right.created_at
      },
    })
  } else {
    return tasks
  }
}
