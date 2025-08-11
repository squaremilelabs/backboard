"use client"
import { Selection, useDragAndDrop } from "react-aria-components"
import { useEffect, useState } from "react"
import { startOfDay, subDays } from "date-fns"
import { TaskActionBar } from "../task-actions"
import { TaskListItem } from "./task-list-item"
import { processItemKeys, reorderIds, sortItemsByIdOrder } from "@/common/utils/list-utils"
import { useCurrentScopeView } from "@/modules/scope/use-scope-views"
import { GridList } from "~/smui/grid-list/components"
import { CreateField } from "@/common/components/create-field"
import { cn } from "~/smui/utils"
import { useSessionStorageUtility } from "@/common/utils/use-storage-utility"
import { typography } from "@/common/components/class-names"
import { db, useDBQuery } from "@/database/db-client"
import { NowTask, parseTaskCreateInput, Task, TaskStatus } from "@/database/models/task"
import { parseScopeUpdateInput } from "@/database/models/scope"
import { RecurringTask } from "@/database/models/recurring-task"

export function TaskList() {
  const { id: scopeId, view: scopeView } = useCurrentScopeView()
  const tasks = useTaskListTaskQuery()

  const [_, setIsTasksDragging] = useSessionStorageUtility("is-tasks-dragging", false)

  const isReorderable = scopeView === "now"
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
          const { data } = parseScopeUpdateInput({ list_orders: { "tasks/now": newOrder } })
          db.transact(db.tx.scopes[scopeId].merge(data))
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

  const isCreateEnabled = scopeView === "now" || scopeView === "later"
  const handleCreate = async (title: string) => {
    const { id, data, link } = parseTaskCreateInput({
      title,
      scope_id: scopeId,
      status: scopeView === "later" ? "later" : "now",
    })
    await db.transact([
      db.tx.tasks[id].link(link).create({
        ...data,
        // @ts-expect-error -- instant db error with optionally indexed properties
        status_time: data.status_time ?? null,
      }),
    ])
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
  const isBatchActionsVisible = selectedTaskIds.length > 0

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
              "p-8 gap-8 self-stretch",
              "!outline-0 hover:!bg-base-bg focus-within:bg-base-bg rounded-sm",
              "focus-within:border-l-4 focus-within:border-l-neutral-border",
              tasks.length === 0 ? "bg-base-bg/70" : "bg-base-bg/50",
            ],
          }}
        />
      )}
      {scopeView === "done" && (
        <div className={cn("flex h-36 min-h-36 items-center px-8", "text-sm")}>
          <span className={typography({ type: "label" })}>Tasks done in the last 5 days</span>
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
        dependencies={[tasks, selectedTaskIds]}
      >
        {(task, classNames) => (
          <TaskListItem
            task={task}
            className={classNames.item}
            disableActionBar={selectedTaskIds.length > 1}
          />
        )}
      </GridList>
      {isBatchActionsVisible && (
        <div
          className={cn(
            "flex items-center gap-16 px-16 py-8 md:gap-32",
            "bg-base-bg border-2",
            "justify-center-safe overflow-x-auto"
          )}
        >
          <p className={typography({ type: "label", className: "text-neutral-text" })}>
            {selectedTaskIds.length} selected
          </p>
          <TaskActionBar
            selectedTaskIds={selectedTaskIds}
            currentStatus={scopeView as TaskStatus}
            onAfterAction={() => setSelectedTaskIds([])}
            display="buttons"
          />
        </div>
      )}
    </div>
  )
}

function useTaskListTaskQuery() {
  const { id: scopeId, view: scopeView } = useCurrentScopeView()

  const { scopes } = useDBQuery("scopes", {
    $: { where: { id: scopeId }, first: 1 },
  })

  const scope = scopes?.[0]

  const { tasks: queriedTasks } = useDBQuery<Task & { recurring_task?: RecurringTask }, "tasks">(
    "tasks",
    {
      $: {
        where: {
          "scope.id": scopeId,
          "status": scopeView,
          "or": [
            {
              status_time: {
                $gte: scopeView === "done" ? startOfDay(subDays(new Date(), 5)).getTime() : 0,
              },
            },
            scopeView === "later"
              ? {
                  status_time: { $isNull: true },
                }
              : null,
          ].filter((d) => d !== null),
        },
        order: {
          status_time: scopeView === "done" ? "desc" : "asc",
        },
      },
      recurring_task: {},
    }
  )

  const tasks = queriedTasks ?? []

  if (scopeView === "now") {
    return sortItemsByIdOrder({
      items: tasks as (NowTask & { recurring_task?: RecurringTask })[],
      idOrder: scope?.list_orders?.["tasks/now"] ?? [],
      missingIdsPosition: "start",
      sortMissingIds(left, right) {
        return right.status_time - left.status_time
      },
    })
  }

  if (scopeView === "later") {
    return [...tasks].sort((left, right) => {
      if (left.status_time === right.status_time) {
        return left.created_at - right.created_at
      }
      if (left.status_time == null) return 1
      if (right.status_time == null) return -1
      return left.status_time - right.status_time
    })
  }

  return tasks
}
