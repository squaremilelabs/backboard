import { Selection, useDragAndDrop } from "react-aria-components"
import { useState } from "react"
import { ArrowRightIcon } from "lucide-react"
import { TaskActionBar } from "../task-action-bar"
import { TaskListItem } from "./task-list-item"
import { processItemKeys, reorderIds, sortItemsByIdOrder } from "@/common/utils/list-utils"
import { updateInbox, useInboxQuery } from "@/database/models/inbox"
import { Task, useTaskQuery } from "@/database/models/task"
import { useCurrentInboxView } from "@/modules/inbox/inbox-views"
import { GridList } from "~/smui/grid-list/components"
import { label } from "@/common/components/variants"
import { Icon } from "~/smui/icon/components"

export function TaskList() {
  const { id: inboxId, view: inboxView } = useCurrentInboxView()
  const tasks = useTaskListTaskQuery()

  const isReorderable = inboxView === "open"
  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) => processItemKeys(keys, tasks, "db/task"),
    onReorder: isReorderable
      ? (e) => {
          const newOrder = reorderIds({
            prevOrder: tasks.map((task) => task.id),
            droppedIds: [...e.keys] as string[],
            targetId: e.target.key as string,
            dropPosition: e.target.dropPosition,
          })
          updateInbox(inboxId, { open_task_order: newOrder })
        }
      : undefined,
  })

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const onSelectionChange = (selection: Selection) => {
    if (selection === "all") {
      setSelectedTaskIds(tasks.map((task) => task.id))
    } else {
      setSelectedTaskIds([...selection] as string[])
    }
  }

  return (
    <div className="bg-neutral-muted-bg flex flex-col gap-2 rounded-sm border-2 p-4">
      <div className="flex h-30 items-center gap-8">
        {selectedTaskIds.length > 1 && inboxView !== "recurring" ? (
          <>
            <p className={label({ className: "text-neutral-text/70 pl-8" })}>
              {selectedTaskIds.length} Selected
            </p>
            <Icon
              icon={<ArrowRightIcon absoluteStrokeWidth strokeWidth={3} />}
              variants={{ size: "sm" }}
              className="text-neutral-muted-text"
            />
            <TaskActionBar selectedTaskIds={selectedTaskIds} inboxState={inboxView} />
          </>
        ) : (
          <p className={label({ className: "text-neutral-text/70 pl-8" })}>
            {tasks.length} Task{tasks.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
      <GridList
        aria-label="Task List"
        variants={{ variant: "task-list" }}
        items={tasks}
        selectionMode="multiple"
        selectionBehavior="replace"
        onSelectionChange={onSelectionChange}
        classNames={{ base: "gap-2" }}
        dragAndDropHooks={dragAndDropHooks}
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
