"use client"
import { useDragAndDrop } from "react-aria-components"
import { startOfDay, subDays } from "date-fns"
import { TaskActionBar } from "../task-actions"
import { TaskListItem } from "./task-list-item"
import { TasklistDragPreview } from "./internal/drag-preview"
import { useTasklistSelection } from "./internal/use-selection"
import { processItemKeys, reorderIds, sortItemsByIdOrder } from "@/common/utils/list-utils"
import { GridList } from "~/smui/grid-list/components"
import { CreateField } from "@/common/components/create-field"
import { cn } from "~/smui/utils"
import { useSessionStorageUtility } from "@/common/utils/use-storage-utility"
import { typography } from "@/common/components/class-names"
import { db, useDBQuery } from "@/database/db-client"
import { parseTaskCreateInput, Task, TaskStatus } from "@/database/models/task"
import { parseScopeUpdateInput } from "@/database/models/scope"
import { RecurringTask } from "@/database/models/recurring-task"
import { useAuth } from "@/modules/auth/use-auth"

export function ScopeTaskList({
  scopeId,
  statusView,
}: {
  scopeId: string
  statusView: TaskStatus
}) {
  const { tasks, order } = useTaskListQuery({ scopeId, statusView })

  const [_, setIsTasksDragging] = useSessionStorageUtility("is-tasks-dragging", false)

  const isReorderable = statusView === "current"
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
          const { data } = parseScopeUpdateInput({ list_orders: { "tasks/current": newOrder } })
          db.transact(db.tx.scopes[scopeId].merge(data))
        }
      : undefined,
    renderDragPreview: (items) => {
      const tasks = items.map((item) => JSON.parse(item["db/task"]) as Task)
      return <TasklistDragPreview tasks={tasks} />
    },
  })

  const isCreateEnabled = statusView === "current" || statusView === "snoozed"
  const handleCreate = async (title: string) => {
    const { id, data, link } = parseTaskCreateInput({
      title,
      scope_id: scopeId,
      ...(statusView === "snoozed"
        ? {
            status: "snoozed",
            status_time: null,
          }
        : {
            status: "current",
            status_time: Date.now(),
          }),
    })
    await db.transact([db.tx.tasks[id].link(link).create(data)])
  }

  const { selectedTaskIds, setSelectedTaskIds, onSelectionChange } = useTasklistSelection(tasks)
  const isBatchActionsVisible = selectedTaskIds.length > 1

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
        {isCreateEnabled && (
          <CreateField
            onSubmit={handleCreate}
            placeholder={statusView === "current" ? "Add current task" : `Add "someday" task`}
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
        {statusView === "done" && (
          <div className={cn("flex h-36 min-h-36 items-center px-16", "text-sm")}>
            <span className={typography({ type: "label" })}>Last 5 days</span>
          </div>
        )}
        <GridList
          aria-label="Task List"
          variants={{ variant: "task-list" }}
          items={tasks}
          selectionMode="multiple"
          selectionBehavior="replace"
          onSelectionChange={onSelectionChange}
          dragAndDropHooks={dragAndDropHooks}
          renderEmptyState={() => <div className="h-36" />}
          dependencies={[tasks, selectedTaskIds]}
        >
          {(task, classNames) => (
            <TaskListItem
              task={task}
              className={classNames.item}
              disableActionBar={selectedTaskIds.length > 1}
              isUnordered={isReorderable && !order.includes(task.id)}
            />
          )}
        </GridList>
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
              currentStatus={statusView}
              onAfterAction={() => setSelectedTaskIds([])}
              display="buttons"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function useTaskListQuery({ scopeId, statusView }: { scopeId: string; statusView: TaskStatus }) {
  const { instantAccount } = useAuth()

  const { scopes } = useDBQuery("scopes", {
    $: { where: { id: scopeId }, first: 1 },
  })

  const scope = scopes?.[0]

  const { tasks: queriedTasks } = useDBQuery<Task & { recurring_task?: RecurringTask }, "tasks">(
    "tasks",
    instantAccount
      ? {
          $: {
            where: {
              "scope.id": scopeId,
              "status": statusView,
              "scope.owner.id": instantAccount?.id, // random placeholder
              "or": [
                {
                  status_time: {
                    $gte: statusView === "done" ? startOfDay(subDays(new Date(), 5)) : new Date(0),
                  },
                },
                statusView === "snoozed"
                  ? {
                      status_time: { $isNull: true },
                    }
                  : null,
              ].filter((d) => d !== null),
            },
            order: {
              status_time: statusView === "done" ? "desc" : "asc",
            },
          },
          recurring_task: {},
        }
      : null
  )

  let tasks = queriedTasks ?? []

  if (statusView === "current") {
    tasks = sortItemsByIdOrder({
      items: tasks,
      idOrder: scope?.list_orders?.["tasks/current"] ?? [],
      missingIdsPosition: "end",
      sortMissingIds(left, right) {
        return (left.status_time ?? 0) - (right.status_time ?? 0)
      },
    })
  }

  if (statusView === "snoozed") {
    tasks = [...tasks].sort((left, right) => {
      if (left.status_time === right.status_time) {
        return left.created_at - right.created_at
      }
      if (left.status_time == null) return 1
      if (right.status_time == null) return -1
      return left.status_time - right.status_time
    })
  }

  return { tasks, order: scope?.list_orders?.["tasks/current"] ?? [] }
}
