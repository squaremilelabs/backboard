"use client"
import { Selection, useDragAndDrop } from "react-aria-components"
import { useEffect, useState } from "react"
import { TaskListItem } from "../task-list/task-list-item"
import { TaskActionBar } from "../task-actions"
import ZeroButton from "./zero-button"
import { db, useDBQuery } from "@/database/db-client"
import { RecurringTask } from "@/database/models/recurring-task"
import { Scope } from "@/database/models/scope"
import { Task } from "@/database/models/task"
import { useAuth } from "@/modules/auth/use-auth"
import { GridList } from "~/smui/grid-list/components"
import { cn } from "~/smui/utils"
import { processItemKeys, reorderIds, sortItemsByIdOrder } from "@/common/utils/list-utils"
import { parseAccountUpdateInput } from "@/database/models/account"
import { typography } from "@/common/components/class-names"

export function CurrentTaskList() {
  const { instantAccount } = useAuth()

  const { tasks: queriedTasks } = useDBQuery<
    Task & { recurring_task?: RecurringTask; scope: Scope },
    "tasks"
  >("tasks", {
    $: {
      where: {
        "scope.owner.id": instantAccount?.id ?? "NO_ACCOUNT",
        "status": "now",
        "scope.is_inactive": false,
      },
      order: {
        status_time: "asc",
      },
    },
    recurring_task: {},
    scope: {},
  })

  const tasks = sortItemsByIdOrder({
    items: queriedTasks ?? [],
    idOrder: instantAccount?.list_orders?.["tasks/now"] ?? [],
    missingIdsPosition: "start",
    sortMissingIds(left, right) {
      return (right.status_time ?? 0) - (left.status_time ?? 0)
    },
  })

  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) => processItemKeys(keys, tasks, "db/task/current"),
    onReorder: instantAccount
      ? (e) => {
          const newOrder = reorderIds({
            prevOrder: tasks.map((task) => task.id),
            droppedIds: [...e.keys] as string[],
            targetId: e.target.key as string,
            dropPosition: e.target.dropPosition,
          })
          const { data } = parseAccountUpdateInput({ list_orders: { "tasks/now": newOrder } })
          db.transact(db.tx.accounts[instantAccount.id].merge(data))
        }
      : undefined,
    renderDragPreview: (items) => {
      const firstTask = JSON.parse(items[0]["db/task/current"]) as Task
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
  const isBatchActionsVisible = selectedTaskIds.length > 0

  if (!instantAccount) return null

  return (
    <div
      className={cn(
        "bg-neutral-muted-bg flex h-full max-h-full flex-col gap-2 rounded-sm border p-2",
        "overflow-hidden",
        tasks.length === 0 && "bg-transparent"
      )}
    >
      <GridList
        aria-label="Now Task List"
        variants={{ variant: "task-list" }}
        items={tasks}
        selectionMode="multiple"
        selectionBehavior="replace"
        onSelectionChange={onSelectionChange}
        classNames={{ base: "gap-2" }}
        dragAndDropHooks={dragAndDropHooks}
        renderEmptyState={() => (
          <div className="flex h-full w-full items-center justify-center">
            <ZeroButton />
          </div>
        )}
        dependencies={[tasks, selectedTaskIds]}
      >
        {(task, classNames) => (
          <TaskListItem
            task={task}
            className={classNames.item}
            disableActionBar={selectedTaskIds.length > 1}
            showScopeIcon
          />
        )}
      </GridList>
      {isBatchActionsVisible && (
        <div
          className={cn(
            "flex items-center gap-16 px-16 py-8 md:gap-32",
            "bg-base-bg border-2",
            "justify-center-safe overflow-x-auto",
            "min-h-fit"
          )}
        >
          <p className={typography({ type: "label", className: "text-neutral-text" })}>
            {selectedTaskIds.length} selected
          </p>
          <TaskActionBar
            selectedTaskIds={selectedTaskIds}
            currentStatus={"now"}
            onAfterAction={() => setSelectedTaskIds([])}
            display="buttons"
          />
        </div>
      )}
    </div>
  )
}
