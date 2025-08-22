"use client"

import { useDragAndDrop } from "react-aria-components"
import Link from "next/link"
import { Emoji, EmojiStyle } from "emoji-picker-react"
import { TaskActionBar } from "../task-actions"
import { TaskListItem } from "./task-list-item"
import { useTasklistSelection } from "./internal/use-selection"
import { EmptyUI } from "./internal/empty-ui"
import { TasklistDragPreview } from "./internal/drag-preview"
import { db, useDBQuery } from "@/database/db-client"
import { Task, TaskLinks, TaskStatus } from "@/database/models/task"
import { useAuth } from "@/modules/auth/use-auth"
import { GridList } from "~/smui/grid-list/components"
import { cn } from "~/smui/utils"
import { processItemKeys, reorderIds, sortItemsByIdOrder } from "@/common/utils/list-utils"
import { typography } from "@/common/components/class-names"
import { parseScopeUpdateInput, Scope } from "@/database/models/scope"
import { Icon } from "~/smui/icon/components"

export function GroupedTaskLists({ statusView }: { statusView: TaskStatus }) {
  const { instantAccount } = useAuth()
  const { scopes } = useDBQuery<Scope & { tasks: (Task & Partial<TaskLinks>)[] }, "scopes">(
    "scopes",
    instantAccount
      ? {
          $: {
            where: {
              "owner.id": instantAccount.id,
              "is_inactive": false,
            },
          },
          tasks: {
            $: {
              where: { status: statusView, status_time: { $isNull: false } },
              order: { status_time: "asc" },
            },
            recurring_task: {},
          },
        }
      : null
  )

  const displayedScopes = sortItemsByIdOrder({
    items: scopes ?? [],
    idOrder: instantAccount?.list_orders?.scopes ?? [],
    missingIdsPosition: "end",
    sortMissingIds: (left, right) => {
      return left.created_at - right.created_at
    },
  })
    .filter((scope) => scope.tasks.length > 0)
    .map((scope) => {
      let sortedTasks = scope.tasks
      if (statusView === "current") {
        sortedTasks = sortItemsByIdOrder({
          items: scope.tasks,
          idOrder: scope?.list_orders?.["tasks/current"] ?? [],
          missingIdsPosition: "end",
          sortMissingIds(left, right) {
            return (left.status_time ?? 0) - (right.status_time ?? 0)
          },
        })
      }
      if (statusView === "snoozed") {
        sortedTasks = [...sortedTasks].sort((left, right) => {
          if (left.status_time === right.status_time) {
            return left.created_at - right.created_at
          }
          if (left.status_time == null) return 1
          if (right.status_time == null) return -1
          return left.status_time - right.status_time
        })
      }
      return { ...scope, tasks: sortedTasks }
    })

  if (!instantAccount) return null

  if (displayedScopes.length === 0) {
    return <EmptyUI statusView={statusView} />
  }

  return (
    <div className="flex h-full max-h-full min-h-0 flex-col gap-16 overflow-auto overscroll-contain">
      {displayedScopes.map((scope) => {
        return <TaskListGroup key={scope.id} scope={scope} statusView={statusView} />
      })}
    </div>
  )
}

function TaskListGroup({
  scope,
  statusView,
}: {
  scope: Scope & { tasks: (Task & Partial<TaskLinks>)[] }
  statusView: TaskStatus
}) {
  const tasks = scope.tasks

  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) => processItemKeys(keys, tasks, `db/scope/${scope.id}/task`),
    onReorder: (e) => {
      const newOrder = reorderIds({
        prevOrder: tasks.map((task) => task.id),
        droppedIds: [...e.keys] as string[],
        targetId: e.target.key as string,
        dropPosition: e.target.dropPosition,
      })
      const { data } = parseScopeUpdateInput({ list_orders: { "tasks/current": newOrder } })
      db.transact(db.tx.scopes[scope.id].merge(data))
    },
    renderDragPreview: (items) => {
      const tasks = items.map((item) => JSON.parse(item[`db/scope/${scope.id}/task`]) as Task)
      return <TasklistDragPreview tasks={tasks} />
    },
  })

  const { selectedTaskIds, setSelectedTaskIds, onSelectionChange } = useTasklistSelection(tasks)
  const isBatchActionsVisible = selectedTaskIds.length > 0

  return (
    <div className="relative flex flex-col gap-0">
      <div className={cn("sticky top-0", "flex flex-col")}>
        <div className="bg-base-bg flex flex-wrap items-center gap-8 p-8">
          <Link
            href={`/scope/${scope.id}/status`}
            className={cn(
              "text-neutral-text font-semibold",
              "flex items-center gap-4",
              "hover:underline",
              "mr-16"
            )}
          >
            {scope.icon?.type === "emoji" && scope.icon.unified ? (
              <Icon icon={<Emoji unified={scope.icon.unified} emojiStyle={EmojiStyle.APPLE} />} />
            ) : null}
            {scope.title}
          </Link>
          {isBatchActionsVisible && (
            <div
              className={cn(
                "flex items-center gap-8",
                "grow",
                "rounded-sm",
                "overflow-x-auto",
                "min-h-fit"
              )}
            >
              <p className={typography({ type: "label", className: "text-primary-text" })}>
                {selectedTaskIds.length} selected
              </p>
              <div className="overflow-x-auto">
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
        {/* A silly little separator to keep the roundness on scroll */}
        <div className="-mb-3 h-4 rounded-sm border-t bg-transparent" />
      </div>
      <div
        className={cn(
          "flex min-h-0 flex-col",
          "gap-2 p-2",
          "bg-neutral-muted-bg rounded-sm border",
          "overflow-hidden",
          "border-t-0"
        )}
      >
        <GridList
          aria-label={`${scope.title} Tasks`}
          variants={{ variant: "task-list" }}
          selectionMode="multiple"
          selectionBehavior="replace"
          onSelectionChange={onSelectionChange}
          items={tasks}
          dragAndDropHooks={statusView === "current" ? dragAndDropHooks : undefined}
          dependencies={[tasks]}
        >
          {(task, classNames) => (
            <TaskListItem
              task={task}
              className={classNames.item}
              disableActionBar={selectedTaskIds.length > 1}
              isUnordered={!scope.list_orders?.["tasks/current"]?.includes(task.id)}
            />
          )}
        </GridList>
      </div>
    </div>
  )
}
