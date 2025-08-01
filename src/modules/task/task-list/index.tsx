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
  const isTopBarVisible = isBatchActionsVisible || isCreateEnabled

  return (
    <div
      className={cn(
        "bg-neutral-muted-bg flex h-full max-h-full flex-col gap-2 rounded-sm border p-2",
        "overflow-auto"
      )}
    >
      {isTopBarVisible && (
        <div className={cn("flex h-36 max-h-36 min-h-36 items-stretch")}>
          {isCreateEnabled && !isBatchActionsVisible && (
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
          {isBatchActionsVisible && (
            <div className="bg-base-bg/70 flex items-center rounded-sm px-4">
              <TaskActionBar
                selectedTaskIds={selectedTaskIds}
                inboxState={inboxView as TaskInboxState}
                onAfterAction={() => setSelectedTaskIds([])}
                display="buttons"
              />
            </div>
          )}
        </div>
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
