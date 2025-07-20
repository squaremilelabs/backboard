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
    isDisabled: !isReorderable,
    getItems: (keys) => {
      return [...keys].map((key) => ({
        "text/plain": tasks.find((task) => task.id === key)?.title ?? key.toString(),
      }))
    },
    onReorder: (e) => {
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
    },
    renderDragPreview: () => {
      return (
        <div
          className={twm(
            "flex w-fit items-center px-8 py-4 text-sm font-semibold",
            "bg-yellow-600 text-yellow-50"
          )}
        >
          Reorder
        </div>
      )
    },
  })

  return (
    <GridList
      aria-label="Task List"
      items={tasks ?? []}
      selectedKeys={selectedTaskIds}
      dragAndDropHooks={dragAndDropHooks}
      onSelectionChange={(selection) =>
        setSelectedTaskIds(
          selection === "all"
            ? (tasks?.map((task) => task.id) ?? [])
            : (Array.from(selection) as string[])
        )
      }
      selectionMode="multiple"
      className="divide-y not-data-empty:border data-empty:bg-neutral-100"
      renderEmptyState={() => (
        <div className="flex h-100 items-center justify-center text-sm font-medium">ZERO</div>
      )}
    >
      {(task) => <TaskListItem task={task} isReorderable={isReorderable} />}
    </GridList>
  )
}

function TaskListItem({ task, isReorderable }: { task: Task; isReorderable?: boolean }) {
  return (
    <GridListItem
      id={task.id}
      textValue={task.title}
      className={twm(
        "flex items-center gap-8 px-16 py-8",
        "bg-neutral-0 data-selected:bg-neutral-100"
      )}
    >
      {isReorderable && (
        <Button slot="drag">
          <Icon icon="drag-handle" className="text-neutral-400" />
        </Button>
      )}
      <Checkbox
        slot="selection"
        aria-label="Checkbox"
        className={twm("cursor-pointer hover:opacity-70")}
      >
        {({ isSelected }) => (
          <Icon
            icon={isSelected ? "checkbox-checked" : "checkbox-blank"}
            className={isSelected ? "text-neutral-950" : "text-neutral-400"}
          />
        )}
      </Checkbox>
      <p>{task.title}</p>
    </GridListItem>
  )
}
