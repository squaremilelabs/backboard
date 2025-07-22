"use client"
import { Button, GridList, GridListItem, useDragAndDrop } from "react-aria-components"
import { Icon } from "@/lib/components/icon"
import { cn } from "~/smui/utils"
import { Task } from "@/database/models/task"
import { updateInbox } from "@/database/models/inbox"
import { useCurrentInboxView } from "@/modules/inbox/inbox-views"
import { reorderIds } from "@/lib/utils/list-utils"

export function TaskList({
  selectedTaskIds,
  setSelectedTaskIds,
}: {
  selectedTaskIds: string[]
  setSelectedTaskIds: (ids: string[]) => void
}) {
  const { id: inboxId, view: inboxView } = useCurrentInboxView()

  const tasks: Task[] = []

  const isReorderable = inboxView === "open"

  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) => {
      return [...keys].map((key) => ({
        "text/plain": tasks.find((task) => task.id === key)?.title ?? key.toString(),
      }))
    },
    onReorder: isReorderable
      ? (e) => {
          const newOrder = reorderIds({
            prevOrder: [...tasks].map((task) => task.id),
            droppedIds: [...e.keys] as string[],
            targetId: e.target.key as string,
            dropPosition: e.target.dropPosition,
          })
          updateInbox(inboxId, { open_task_order: newOrder })
        }
      : undefined,
    renderDragPreview: (items) => {
      const label = items.length === 1 ? items[0]["text/plain"] : `${items.length} tasks`
      return (
        <div
          className={cn(
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
      selectionBehavior="replace"
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
      className={cn(
        "flex items-center gap-6 px-12 py-6 !outline-0",
        "bg-neutral-0 data-selected:bg-neutral-50",
        "border-l-yellow-600 focus-visible:border-l-4",
        "data-selected:border-l-4"
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
          <p>{task.title}</p>
        </>
      )}
    </GridListItem>
  )
}
