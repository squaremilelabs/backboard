"use client"
import { startOfDay, subDays } from "date-fns"
import { EllipsisVerticalIcon, MoveIcon, SquareIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import {
  GridList,
  GridListItem,
  Button,
  TooltipTrigger,
  Tooltip,
  useDragAndDrop,
  DragAndDropHooks,
  Checkbox,
  DropIndicator,
  Selection,
} from "react-aria-components"
import { useResizeObserver } from "usehooks-ts"
import { db } from "@/database/db-client"
import { parseAccountUpdateInput } from "@/database/models/account"
import { RecurringTask } from "@/database/models/recurring-task"
import { parseScopeUpdateInput } from "@/database/models/scope"
import { parseTaskCreateInput, parseTaskUpdateInput } from "@/database/models/task"
import { Task } from "@/database/models/task"
import { getTaskTimeInfo } from "@/functions/get-task-time-info"
import {
  reorderIds,
  sortCurrentTasks,
  sortDoneTasks,
  sortSnoozedTasks,
} from "@/functions/sort-data"
import { useAuth } from "@/hooks/use-auth"
import { useDBQuery } from "@/hooks/use-db-query"
import { useQueryStates } from "@/hooks/use-query-states"
import { useLocalStorageUtility } from "@/hooks/use-storage-utility"
import { twm } from "@/lib/tailwind"
import { iconButton, tooltip } from "./primitives/_class-names"
import { EditableText } from "./primitives/editable-text"
import { InsertItemField } from "./primitives/insert-item-field"
import { TaskActionMenu } from "./task-action-menu"

export type FetchedTask = Task & {
  scope: { id: string } | null
  recurring_task: RecurringTask
}

export function TaskList() {
  const { account } = useAuth()
  const { status, scopeId } = useQueryStates()
  const { tasks } = useTaskListQuery()

  const dragAndDropHooks = useTaskListDragAndDrop({ tasks })
  const withCreateField = status === "current"

  const title =
    status === "current"
      ? "Tasks"
      : status === "snoozed"
        ? "Snoozed Tasks"
        : "Completed Tasks (last 5 days)"

  const [selection, setSelection] = useState<Selection>(new Set())
  const selectedCount = selection === "all" ? tasks.length : selection.size

  useEffect(() => {
    const visibleTaskIds = tasks.map((task) => task.id)
    const selectedTaskIds =
      selection === "all" ? tasks.map((task) => task.id) : ([...selection] as string[])
    if (selectedTaskIds.length > 0) {
      const invisibleSelectedTaskIds = selectedTaskIds.filter((id) => !visibleTaskIds.includes(id))
      if (invisibleSelectedTaskIds.length > 0) {
        const visibleSelectedTaskIds = selectedTaskIds.filter((id) => visibleTaskIds.includes(id))
        setSelection(new Set(visibleSelectedTaskIds))
      }
    }
  }, [tasks, selection])

  return (
    <div className={twm("gap-space-sm flex flex-col")}>
      <div
        className={twm("flex items-center justify-between", "px-space-md py-space-sm gap-space-md")}
      >
        <h2
          className={twm(
            "text-neutral-muted-text text-sm font-medium tracking-wider uppercase",
            selectedCount > 0 && [
              "font-semibold",
              status === "current" ? "text-primary-text" : "text-neutral-text",
            ]
          )}
        >
          {selectedCount > 0 ? `${selectedCount} selected` : title}
        </h2>
        <Button className={iconButton({ size: "sm", hoverColor: "neutral" })}>
          <EllipsisVerticalIcon />
        </Button>
      </div>
      <GridList
        key={`task-list-${status}-${scopeId}`}
        aria-label="Task List"
        dependencies={[status, scopeId]}
        selectionMode="multiple"
        selectionBehavior="toggle"
        selectedKeys={selection}
        onSelectionChange={setSelection}
        items={tasks}
        className={twm("gap-space-sm flex flex-col")}
        dragAndDropHooks={dragAndDropHooks}
      >
        {(task) => <TaskListItem task={task} />}
      </GridList>
      {withCreateField && (
        <InsertItemField
          onSubmit={(title) => {
            const { id, data, link } = parseTaskCreateInput({
              title,
              scope_id: scopeId === "root" ? undefined : scopeId,
              owner_id: account!.id,
              status: "current",
              status_time: Date.now(),
            })
            db.transact(db.tx.tasks[id].link(link).create(data))
          }}
        />
      )}
    </div>
  )
}

function TaskListItem({ task }: { task: FetchedTask }) {
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false)
  const [isEditTitleMode, setIsEditTitleMode] = useState(false)
  const { status } = useQueryStates()
  const itemRef = useRef<HTMLDivElement>(null)

  return (
    <GridListItem
      ref={itemRef}
      id={task.id}
      textValue={task.title}
      className={twm(
        "flex items-start",
        "rounded-md border-2 border-transparent",
        "hover:bg-neutral-muted-bg/70",
        "data-dragging:opacity-50",
        // isActionMenuOpen && "border-base-border",
        "!outline-0"
      )}
      onAction={() => {}}
      onContextMenu={(e) => {
        e.preventDefault()
        setIsActionMenuOpen(true)
      }}
    >
      {({ isFocused, allowsDragging }) => {
        return (
          <>
            <Checkbox
              slot="selection"
              className={iconButton({
                className: twm(
                  status === "current"
                    ? "hover:!text-primary-text data-selected:text-primary-text"
                    : "hover:!text-neutral-text data-selected:text-neutral-text"
                ),
              })}
            >
              {({ isSelected }) => <SquareIcon fill={isSelected ? "currentColor" : "none"} />}
            </Checkbox>
            <div className="flex grow items-start">
              <EditableText
                value={task.title}
                isEditMode={isEditTitleMode}
                setIsEditMode={setIsEditTitleMode}
                disablePressToActivate
                onSubmit={(value) => {
                  const { data } = parseTaskUpdateInput({ title: value.trim() })
                  db.transact(db.tx.tasks[task.id].update(data))
                }}
              />
            </div>
            <TaskTimeBadge task={task} />
            {allowsDragging && (
              <Button slot="drag" className="sr-only" excludeFromTabOrder></Button>
            )}
            <TaskActionMenu
              overlayProps={{
                triggerRef: itemRef,
                isOpen: isActionMenuOpen,
                onOpenChange: setIsActionMenuOpen,
                placement: "bottom left",
              }}
              onRenameAction={() => setIsEditTitleMode(true)}
              targetTasks={[task]}
              targetTasksStatus={task.status}
            />
          </>
        )
      }}
    </GridListItem>
  )
}

function TaskTimeBadge({ task }: { task: FetchedTask }) {
  const [format, setFormat] = useLocalStorageUtility<"relative" | "date">(
    "task-time-format",
    "relative"
  )
  const { statusTimeLabels, statusSuffix, createdTimeLabels } = getTaskTimeInfo(task)

  const displayedTime =
    format === "relative" ? statusTimeLabels.relativeShort : statusTimeLabels.dateShort

  const hideCreated = statusTimeLabels.dateLong === createdTimeLabels.dateLong

  return (
    <TooltipTrigger delay={500} closeDelay={0}>
      <Button
        onPress={() => setFormat(format === "relative" ? "date" : "relative")}
        className={twm(
          "flex items-center justify-center",
          "shrink-0 transition-all",
          "h-box-md px-space-md rounded-md",
          "text-sm font-semibold",
          "text-neutral-muted-text",
          "hover:bg-base-bg/70 hover:text-base-text"
        )}
      >
        {displayedTime}
      </Button>
      <Tooltip offset={8} placement={"bottom"} className={tooltip()}>
        <div className="gap-space-xs flex flex-col">
          <p className="font-semibold">
            {statusSuffix} {statusTimeLabels.relativeLong}
          </p>
          <p>{statusTimeLabels.dateLong}</p>
        </div>
        {!hideCreated && (
          <div className="gap-space-xs fle flex-col">
            <p className="font-semibold">Created {createdTimeLabels.relativeLong}</p>
            <p>{createdTimeLabels.dateLong}</p>
          </div>
        )}
      </Tooltip>
    </TooltipTrigger>
  )
}

function useTaskListQuery() {
  const { account } = useAuth()
  const { status, scopeId } = useQueryStates()
  const { scopes } = useDBQuery(
    "scopes",
    scopeId !== "root"
      ? {
          $: { where: { id: scopeId } },
        }
      : null
  )

  const scope = scopeId ? scopes?.[0] : null

  const { tasks: fetchedTasks, isLoading } = useDBQuery<FetchedTask>(
    "tasks",
    account
      ? {
          $: {
            where: {
              status,
              "owner.id": account.id,
              "scope.id": scopeId === "root" ? { $isNull: true } : scopeId,
              "status_time":
                status === "done" ? { $gte: startOfDay(subDays(new Date(), 5)) } : undefined,
            },
          },
          scope: { $: { fields: ["id"] } },
          recurring_task: {},
        }
      : null
  )

  let sortedTasks = [...(fetchedTasks ?? [])]

  if (status === "current") {
    let idOrder: string[] = []
    if (scope) {
      idOrder = scope.list_orders?.tasks ?? []
    } else {
      idOrder = account?.list_orders?.tasks ?? []
    }
    sortedTasks = sortCurrentTasks(sortedTasks, idOrder)
  }

  if (status === "snoozed") {
    sortedTasks = sortSnoozedTasks(sortedTasks)
  }

  if (status === "done") {
    sortedTasks = sortDoneTasks(sortedTasks)
  }

  return {
    tasks: sortedTasks,
    isLoading,
  }
}

function useTaskListDragAndDrop({
  tasks,
}: {
  tasks: FetchedTask[]
}): DragAndDropHooks<FetchedTask> {
  const { account } = useAuth()
  const { scopeId, status } = useQueryStates()

  const taskById = new Map(tasks.map((task) => [task.id, task]))

  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) => {
      return [...keys].map((key) => {
        const task = taskById.get(key as string)
        return {
          "text/plain": task?.title ?? "",
          "db/task": JSON.stringify(task),
        }
      })
    },
    renderDragPreview() {
      return (
        <div
          className={twm(
            "flex items-center justify-center",
            "size-box-md rounded-md",
            "bg-base-bg text-base-outline"
          )}
        >
          <MoveIcon strokeWidth={2.5} />
        </div>
      )
    },
    renderDropIndicator(target) {
      return (
        <DropIndicator
          target={target}
          className={twm(["bg-base-outline rounded-full", "my-[1px] h-[2px]"])}
        />
      )
    },
    acceptedDragTypes: ["db/task"],
    onReorder:
      status !== "current"
        ? undefined
        : (e) => {
            const newOrder = reorderIds({
              prevOrder: tasks.map((task) => task.id),
              droppedIds: [...e.keys] as string[],
              targetId: e.target.key as string,
              dropPosition: e.target.dropPosition,
            })
            if (scopeId === "root") {
              const { data } = parseAccountUpdateInput({ list_orders: { tasks: newOrder } })
              db.transact(db.tx.accounts[account!.id].merge(data))
            } else {
              const { data } = parseScopeUpdateInput({ list_orders: { tasks: newOrder } })
              db.transact(db.tx.scopes[scopeId].merge(data))
            }
          },
  })

  return dragAndDropHooks
}
