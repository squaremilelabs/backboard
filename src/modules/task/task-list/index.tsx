"use client"
import { Selection, useDragAndDrop } from "react-aria-components"
import { useEffect, useState } from "react"
import { startOfDay, subDays } from "date-fns"
import { TaskActionBar } from "../task-actions"
import { TaskListItem } from "./task-list-item"
import { processItemKeys, reorderIds, sortItemsByIdOrder } from "@/common/utils/list-utils"
import { updateInbox, useInboxQuery } from "@/database/models/inbox"
import {
  createTask,
  Task,
  TaskInboxState,
  TaskQueryParams,
  useTaskQuery,
} from "@/database/models/task"
import { InboxViewKey, useCurrentInboxView } from "@/modules/inbox/use-inbox-view"
import { GridList } from "~/smui/grid-list/components"
import { CreateField } from "@/common/components/create-field"
import { cn } from "~/smui/utils"
import { useSessionStorageUtility } from "@/common/utils/use-storage-utility"
import { typography } from "@/common/components/class-names"

export function TaskList() {
  const { id: inboxId, view: inboxView } = useCurrentInboxView()
  const tasks = useTaskListTaskQuery()

  const [_, setIsTasksDragging] = useSessionStorageUtility("is-tasks-dragging", false)

  const isReorderable = inboxView === "open"
  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) => processItemKeys(keys, tasks, "db/task"),
    onDragStart: () => setIsTasksDragging(true),
    onDragEnd: () => setIsTasksDragging(false),
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
    renderDragPreview: (items) => {
      const firstTask = JSON.parse(items[0]["db/task"]) as Task
      const firstTaskTitle = firstTask.title
      const remainingCount = items.length - 1
      return (
        <div
          className={cn(
            "bg-base-bg rounded-sm px-16 py-8",
            "border-l-primary-border border-l-4",
            "flex items-center gap-16"
          )}
        >
          <span>{firstTaskTitle}</span>{" "}
          {remainingCount ? (
            <span className="text-primary-text text-sm font-semibold">+{remainingCount}</span>
          ) : null}
        </div>
      )
    },
  })

  const isCreateEnabled = inboxView === "open" || inboxView === "snoozed"
  const handleCreate = async (title: string) => {
    createTask({
      title,
      inbox_id: inboxId,
      inbox_state: inboxView === "snoozed" ? "snoozed" : "open",
    })
  }

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  useEffect(() => {
    const visibleTaskIds = tasks.map((task) => task.id)
    if (selectedTaskIds.length > 0) {
      const invisibleSelectedTaskIds = selectedTaskIds.filter((id) => !visibleTaskIds.includes(id))
      if (invisibleSelectedTaskIds.length > 0) {
        const visibleSelectedTaskIds = selectedTaskIds.filter((id) => visibleTaskIds.includes(id))
        setSelectedTaskIds(visibleSelectedTaskIds)
      }
    }
  }, [tasks, selectedTaskIds])
  const onSelectionChange = (selection: Selection) => {
    if (selection === "all") {
      setSelectedTaskIds(tasks.map((task) => task.id))
    } else {
      setSelectedTaskIds([...selection] as string[])
    }
  }
  const isBatchActionsVisible = selectedTaskIds.length > 1

  return (
    <div
      className={cn(
        "bg-neutral-muted-bg flex h-full max-h-full flex-col gap-2 rounded-sm border p-2",
        "overflow-auto"
      )}
    >
      {isCreateEnabled && (
        <CreateField
          onSubmit={handleCreate}
          placeholder="Add task"
          classNames={{
            base: [
              "py-6 px-8 gap-8 self-stretch",
              "!outline-0 hover:!bg-base-bg focus-within:bg-base-bg rounded-sm",
              "focus-within:border-l-4 focus-within:border-l-neutral-border",
              tasks.length === 0 ? "bg-base-bg/70" : "bg-base-bg/50",
            ],
          }}
        />
      )}
      <GridList
        aria-label="Task List"
        variants={{ variant: "task-list" }}
        items={tasks}
        selectionMode="multiple"
        selectionBehavior="replace"
        onSelectionChange={onSelectionChange}
        classNames={{ base: "gap-2" }}
        dragAndDropHooks={dragAndDropHooks}
        renderEmptyState={() => <div className="h-36" />}
      >
        {(task, classNames) => <TaskListItem task={task} className={classNames.item} />}
      </GridList>
      {isBatchActionsVisible && (
        <div
          className={cn(
            "flex items-center gap-16 px-16 py-8",
            "bg-base-bg border-t",
            "overflow-x-auto"
          )}
        >
          <p className={typography({ type: "label", className: "text-neutral-muted-text" })}>
            {selectedTaskIds.length} selected
          </p>
          <TaskActionBar
            selectedTaskIds={selectedTaskIds}
            inboxState={inboxView as TaskInboxState}
            onAfterAction={() => setSelectedTaskIds([])}
            display="buttons"
          />
        </div>
      )}
    </div>
  )
}

function useTaskListTaskQuery() {
  const { id: inboxId, view: inboxView } = useCurrentInboxView()

  const inboxQuery = useInboxQuery({
    $: { where: { id: inboxId }, first: 1 },
  })

  const inbox = inboxQuery.data?.[0]

  const queryMap: Partial<Record<InboxViewKey, TaskQueryParams>> = {
    open: {
      $: { where: { "inbox.id": inboxId, "inbox_state": "open" } },
    },
    snoozed: {
      $: {
        where: {
          "inbox.id": inboxId,
          "inbox_state": "snoozed",
        },
        order: { snooze_date: "asc" },
      },
    },
    archived: {
      $: {
        where: {
          "inbox.id": inboxId,
          "inbox_state": "archived",
          "archive_date": { $gte: startOfDay(subDays(new Date(), 5)).getTime() },
        },
        order: { archive_date: "desc" },
      },
    },
  }

  const taskQuery = useTaskQuery(queryMap[inboxView])

  const tasks: Task[] = taskQuery.data ?? []

  if (inboxView === "open") {
    return sortItemsByIdOrder({
      items: tasks,
      idOrder: inbox?.open_task_order ?? [],
      missingIdsPosition: "start",
      sortMissingIds(left, right) {
        return right.created_at - left.created_at
      },
    })
  }

  if (inboxView === "snoozed") {
    return [...tasks].sort((left, right) => {
      if (left.snooze_date === right.snooze_date) {
        return left.created_at - right.created_at
      }
      if (left.snooze_date == null) return 1
      if (right.snooze_date == null) return -1
      return left.snooze_date - right.snooze_date
    })
  }

  return tasks
}
