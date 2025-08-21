"use client"
// TODO: refactor alongside task-list

import { Selection, useDragAndDrop } from "react-aria-components"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Emoji, EmojiStyle } from "emoji-picker-react"
import ReactConfetti from "react-confetti"
import { createPortal } from "react-dom"
import { useWindowSize } from "usehooks-ts"
import { ArrowRightIcon, PartyPopperIcon } from "lucide-react"
import { TaskListItem } from "../task-list/task-list-item"
import { TaskActionBar } from "../task-actions"
import { db, useDBQuery } from "@/database/db-client"
import { Task, TaskLinks } from "@/database/models/task"
import { useAuth } from "@/modules/auth/use-auth"
import { GridList } from "~/smui/grid-list/components"
import { cn } from "~/smui/utils"
import { processItemKeys, reorderIds, sortItemsByIdOrder } from "@/common/utils/list-utils"
import { typography } from "@/common/components/class-names"
import { parseScopeUpdateInput, Scope } from "@/database/models/scope"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"

export function UnscopedTaskList({ status }: { status: "current" | "snoozed" }) {
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
              where: { status, status_time: { $isNull: false } },
              order: {
                status_time: "asc",
              },
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
      if (status === "current") {
        sortedTasks = sortItemsByIdOrder({
          items: scope.tasks,
          idOrder: scope?.list_orders?.["tasks/current"] ?? [],
          missingIdsPosition: "end",
          sortMissingIds(left, right) {
            return (left.status_time ?? 0) - (right.status_time ?? 0)
          },
        })
      }
      if (status === "snoozed") {
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
    return <EmptyUI status={status} />
  }

  return (
    <div className="flex h-full max-h-full min-h-0 flex-col gap-16 overflow-auto overscroll-contain">
      {displayedScopes.map((scope) => {
        return <ScopeTaskListSection key={scope.id} scope={scope} status={status} />
      })}
    </div>
  )
}

function ScopeTaskListSection({
  scope,
  status,
}: {
  scope: Scope & { tasks: (Task & Partial<TaskLinks>)[] }
  status: "current" | "snoozed"
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
      const firstTask = JSON.parse(items[0][`db/scope/${scope.id}/task`]) as Task
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

  return (
    <div className="relative flex flex-col gap-8">
      <div
        className={cn(
          "bg-base-bg sticky top-0 space-x-8 p-8",
          "border-base-border/60 flex flex-wrap items-center border-b"
        )}
      >
        <Link
          href={`/scope/${scope.id}/status`}
          className={cn(
            "grow leading-[28px]",
            "text-neutral-text font-medium",
            "flex items-center gap-4",
            "hover:underline"
          )}
        >
          {scope.icon?.type === "emoji" && scope.icon.unified ? (
            <Icon icon={<Emoji unified={scope.icon.unified} emojiStyle={EmojiStyle.APPLE} />} />
          ) : null}
          {scope.title}
        </Link>
        {isBatchActionsVisible && (
          <div
            className={cn("flex items-center gap-8", "rounded-sm", "overflow-x-auto", "min-h-fit")}
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
      <div
        className={cn(
          "flex min-h-0 flex-col",
          "gap-2 p-2",
          "bg-neutral-muted-bg rounded-sm border",
          "overflow-hidden"
        )}
      >
        <GridList
          aria-label="Current Tasks"
          variants={{ variant: "task-list" }}
          selectionMode="multiple"
          selectionBehavior="replace"
          onSelectionChange={onSelectionChange}
          items={tasks}
          dragAndDropHooks={status === "current" ? dragAndDropHooks : undefined}
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

export function EmptyUI({ status }: { status: "current" | "snoozed" }) {
  const { width, height } = useWindowSize()
  const [isConfettiOn, setIsConfettiOn] = useState(false)

  return (
    <div className="flex h-[40dvh] w-full flex-col items-center justify-center gap-8">
      <Button
        isDisabled={isConfettiOn}
        className={[
          "flex items-center gap-8",
          "text-lg",
          "rounded-sm font-semibold",
          "text-primary-text",
          isConfettiOn && "animate-bounce",
          "decoration-2",
        ]}
        onPress={() => setIsConfettiOn(true)}
      >
        Backboard Zero
        <Icon icon={<PartyPopperIcon />} variants={{ size: "lg" }} />
      </Button>
      {createPortal(
        <ReactConfetti
          width={width}
          height={height}
          className="fixed top-0 left-0 !z-50"
          numberOfPieces={500}
          gravity={0.4}
          run={isConfettiOn}
          recycle={false}
          onConfettiComplete={(confetti) => {
            confetti?.reset()
            setIsConfettiOn(false)
          }}
        />,
        document.body
      )}
      {status !== "snoozed" && (
        <Link
          href="/snoozed"
          className="text-neutral-muted-text flex items-center gap-4 text-sm hover:opacity-70"
        >
          Review snoozed tasks
          <Icon icon={<ArrowRightIcon />} variants={{ size: "sm" }} />
        </Link>
      )}
    </div>
  )
}
