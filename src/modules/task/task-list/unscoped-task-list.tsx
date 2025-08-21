"use client"
// TODO: refactor alongside task-list

import { Selection, useDragAndDrop } from "react-aria-components"
import { useEffect, useState } from "react"
import Link from "next/link"
import { TaskListItem } from "../task-list/task-list-item"
import { TaskActionBar } from "../task-actions"
import { ZeroButton } from "./zero-button"
import { db, useDBQuery } from "@/database/db-client"
import { Task, TaskLinks } from "@/database/models/task"
import { useAuth } from "@/modules/auth/use-auth"
import { GridList } from "~/smui/grid-list/components"
import { cn } from "~/smui/utils"
import { processItemKeys, reorderIds, sortItemsByIdOrder } from "@/common/utils/list-utils"
import { parseAccountUpdateInput } from "@/database/models/account"
import { typography } from "@/common/components/class-names"

export function UnscopedTaskList({ status }: { status: "current" | "snoozed" }) {
  const { instantAccount } = useAuth()

  const { tasks } = useUnscopedTaskListQuery(status)

  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) => processItemKeys(keys, tasks, `db/task/${status}`),
    onReorder: instantAccount
      ? (e) => {
          const newOrder = reorderIds({
            prevOrder: tasks.map((task) => task.id),
            droppedIds: [...e.keys] as string[],
            targetId: e.target.key as string,
            dropPosition: e.target.dropPosition,
          })
          const { data } = parseAccountUpdateInput({ list_orders: { "tasks/current": newOrder } })
          db.transact(db.tx.accounts[instantAccount.id].merge(data))
        }
      : undefined,
    renderDragPreview: (items) => {
      const firstTask = JSON.parse(items[0][`db/task/${status}`]) as Task
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
    <div className="flex h-full max-h-full min-h-0 flex-col gap-0 overflow-hidden">
      <div
        className={cn(
          "flex h-full max-h-full min-h-0 grow flex-col",
          "gap-2 p-2",
          "bg-neutral-muted-bg rounded-sm border",
          "overflow-hidden"
        )}
      >
        <div className="min-h-0 grow overflow-auto">
          <GridList
            aria-label="Current Tasks"
            variants={{ variant: "task-list" }}
            items={tasks}
            selectionMode="multiple"
            selectionBehavior="replace"
            onSelectionChange={onSelectionChange}
            dragAndDropHooks={status === "current" ? dragAndDropHooks : undefined}
            renderEmptyState={() => (
              <div className="flex h-[50%] w-full flex-col items-center justify-center gap-8">
                <ZeroButton />
                {status !== "snoozed" && (
                  <Link
                    href="/snoozed"
                    className="text-neutral-muted-text text-sm hover:opacity-70"
                  >
                    Review snoozed tasks
                  </Link>
                )}
              </div>
            )}
            dependencies={[tasks, selectedTaskIds]}
          >
            {(task, classNames) => (
              <TaskListItem
                task={task}
                className={classNames.item}
                disableActionBar={selectedTaskIds.length > 1}
                showScopeInfo
                isUnordered={!instantAccount.list_orders?.["tasks/current"]?.includes(task.id)}
              />
            )}
          </GridList>
        </div>
      </div>
      {isBatchActionsVisible && (
        <div
          className={cn(
            "flex items-center gap-16 px-16 py-8 md:gap-32",
            "rounded-sm",
            "overflow-x-auto",
            "min-h-fit"
          )}
        >
          <p className={typography({ type: "label", className: "text-primary-text" })}>
            {selectedTaskIds.length} selected
          </p>
          <div className="grow overflow-x-auto">
            <TaskActionBar
              selectedTaskIds={selectedTaskIds}
              currentStatus={status}
              onAfterAction={() => setSelectedTaskIds([])}
              display="buttons"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function useUnscopedTaskListQuery(status: "current" | "snoozed") {
  const { instantAccount } = useAuth()

  const { tasks: queriedTasks } = useDBQuery<Task & TaskLinks, "tasks">(
    "tasks",
    instantAccount
      ? {
          $: {
            where: {
              "scope.owner.id": instantAccount.id,
              "status": status,
              "scope.is_inactive": false,
            },
            order: {
              status_time: "asc",
            },
          },
          recurring_task: {},
          scope: {},
        }
      : null
  )

  let tasks = queriedTasks ?? []

  if (status === "current") {
    tasks = sortItemsByIdOrder({
      items: queriedTasks ?? [],
      idOrder: instantAccount?.list_orders?.["tasks/current"] ?? [],
      missingIdsPosition: "end",
      sortMissingIds(left, right) {
        const leftScopeTitle = left.scope?.title ?? ""
        const rightScopeTitle = right.scope?.title ?? ""
        if (leftScopeTitle !== rightScopeTitle) {
          return leftScopeTitle.localeCompare(rightScopeTitle)
        }
        const leftScopePosition = left.scope?.list_orders?.["tasks/current"]?.indexOf(left.id) ?? -1
        const rightScopePosition =
          right.scope?.list_orders?.["tasks/current"]?.indexOf(right.id) ?? -1
        if (leftScopePosition !== rightScopePosition) {
          return leftScopePosition - rightScopePosition
        }
        return left.created_at - right.created_at
      },
    })
  }

  if (status === "snoozed") {
    tasks = [...tasks].sort((left, right) => {
      if (left.status_time === right.status_time) {
        const leftScopeTitle = left.scope?.title ?? ""
        const rightScopeTitle = right.scope?.title ?? ""
        if (leftScopeTitle !== rightScopeTitle) {
          return leftScopeTitle.localeCompare(rightScopeTitle)
        }
        return left.created_at - right.created_at
      }
      if (left.status_time == null) return 1
      if (right.status_time == null) return -1
      return left.status_time - right.status_time
    })
  }

  return { tasks }
}
