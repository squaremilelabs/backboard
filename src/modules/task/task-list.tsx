"use client"
import { Button, Checkbox, GridList, GridListItem, useDragAndDrop } from "react-aria-components"
import { useParams } from "next/navigation"
import { InboxView } from "../inbox/inbox-view-tabs"
import { useUpdateInbox } from "../inbox/data-inbox"
import { useCurrentViewInboxTasks } from "./data-tasks"
import { Icon } from "@/lib/primitives/icon"
import { twm } from "@/lib/utils/tailwind"
import { Task } from "@/database/types"

export function TaskList({
  selectedTaskIds,
  setSelectedTaskIds,
}: {
  selectedTaskIds: string[]
  setSelectedTaskIds: (ids: string[]) => void
}) {
  const { id: inboxId, view } = useParams<{ id: string; view: InboxView }>()

  const { tasks } = useCurrentViewInboxTasks()
  const { mutate: updateInbox } = useUpdateInbox()

  const isReorderable = view === "inbox" || !view

  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) => {
      return [...keys].map((key) => ({
        "text/plain": tasks.find((task) => task.id === key)?.title ?? key.toString(),
      }))
    },
    onReorder: isReorderable
      ? (e) => {
          const currentOrder = [...tasks].map((task) => task.id)
          let newOrder: string[] = []

          const targetTaskId = e.target.key as string
          const droppedTaskIds = [...e.keys] as string[]

          // Remove droppedTaskIds from currentOrder first
          const filteredOrder = currentOrder.filter((id) => !droppedTaskIds.includes(id))
          const targetIdx = filteredOrder.indexOf(targetTaskId)

          if (e.target.dropPosition === "before") {
            // Insert dropped tasks before the target task
            newOrder = [
              ...filteredOrder.slice(0, targetIdx),
              ...droppedTaskIds,
              ...filteredOrder.slice(targetIdx),
            ]
          } else if (e.target.dropPosition === "after") {
            // Insert dropped tasks after the target task
            newOrder = [
              ...filteredOrder.slice(0, targetIdx + 1),
              ...droppedTaskIds,
              ...filteredOrder.slice(targetIdx + 1),
            ]
          }
          updateInbox({ id: inboxId, task_order: newOrder })
        }
      : undefined,
    renderDragPreview: (items) => {
      const label = items.length === 1 ? items[0]["text/plain"] : `${items.length} tasks`
      return (
        <div
          className={twm(
            "flex w-fit items-center px-8 py-4 text-sm font-semibold",
            "bg-neutral-200 text-sm"
          )}
        >
          {label}
        </div>
      )
    },
  })

  return (
    <GridList
      aria-label="Task List"
      items={tasks ?? []}
      selectedKeys={selectedTaskIds}
      dragAndDropHooks={isReorderable ? dragAndDropHooks : undefined}
      onSelectionChange={(selection) =>
        setSelectedTaskIds(
          selection === "all"
            ? (tasks?.map((task) => task.id) ?? [])
            : (Array.from(selection) as string[])
        )
      }
      selectionMode="multiple"
      className="divide-y not-data-empty:border-b"
      renderEmptyState={() => (
        <div className="flex justify-center p-16 text-sm font-medium text-neutral-400">zero</div>
      )}
    >
      {(task) => <TaskListItem task={task} />}
    </GridList>
  )
}

function TaskListItem({ task }: { task: Task }) {
  return (
    <GridListItem
      id={task.id}
      textValue={task.title}
      className={twm(
        "flex items-center gap-8 px-16 py-8",
        "bg-neutral-0 data-selected:bg-neutral-50"
      )}
    >
      {({ isSelected, allowsDragging }) => (
        <>
          {allowsDragging && (
            <Button slot="drag">
              <Icon
                icon="drag-handle"
                className={isSelected ? "text-yellow-600" : "text-neutral-400"}
              />
            </Button>
          )}
          <Checkbox
            slot="selection"
            aria-label="Checkbox"
            className={twm("cursor-pointer hover:opacity-70")}
          >
            <Icon
              icon={isSelected ? "checkbox-checked" : "checkbox-blank"}
              className={isSelected ? "text-yellow-600" : "text-neutral-400"}
            />
          </Checkbox>
          <p>{task.title}</p>
        </>
      )}
    </GridListItem>
  )
}
