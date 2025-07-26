import { GripVerticalIcon } from "lucide-react"
import { Form, useDragAndDrop } from "react-aria-components"
import { useState } from "react"
import { INBOX_VIEW_TO_STATE_MAP, useCurrentInboxView } from "../inbox/inbox-views"
import { GridList, GridListItem } from "~/smui/grid-list/components"
import { db } from "@/database/db"
import { reorderIds, sortItemsByIdOrder } from "@/lib/utils/list-utils"
import { Task, updateTask } from "@/database/models/task"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"
import { updateInbox } from "@/database/models/inbox"
import { formatDate } from "@/lib/utils/date-utils"
import { Popover, PopoverTrigger } from "~/smui/popover/components"
import { TextField, TextFieldInput, TextFieldTextArea } from "~/smui/text-field/components"
import { FieldLabel } from "~/smui/field/components"
import { Checkbox } from "~/smui/checkbox/components"
import { cn } from "~/smui/utils"

export function TaskList() {
  const { id: inboxId, view: inboxView } = useCurrentInboxView()
  const tasks = useTaskListQuery()

  const isReorderable = inboxView === "open"

  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) => {
      return [...keys].map((key) => ({
        "text/plain": key.toString(),
        "data-task": JSON.stringify(tasks.find((task) => task.id === key) || {}),
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
  })

  return (
    <GridList
      aria-label="Task List"
      items={tasks}
      selectionMode="multiple"
      selectionBehavior="replace"
      dragAndDropHooks={dragAndDropHooks}
      classNames={{
        base: "flex flex-col divide-y divide-canvas-1 not-data-empty:border-b",
        item: [
          "group flex items-start",
          "gap-8 px-16 py-8 !outline-0",
          "bg-canvas-0 data-selected:bg-canvas-0",
          "focus-visible:border-l-4 focus-visible:border-l-canvas-3",
          "data-selected:border-l-4 data-selected:border-l-primary-3",
          "hover:bg-canvas-1",
        ],
      }}
    >
      {(task, classNames) => {
        return (
          <GridListItem id={task.id} textValue={task.title} className={classNames.item}>
            <Button slot="drag" className="text-canvas-3 group-data-selected:text-primary-4">
              <Icon icon={<GripVerticalIcon />} className="!w-fit !min-w-fit" />
            </Button>
            <Checkbox
              slot="selection"
              classNames={{
                icon: "size-16",
                base: [
                  "h-20 flex items-center text-canvas-3 cursor-pointer",
                  "data-selected:text-primary-4",
                  "hover:not-data-selected:text-canvas-4",
                ],
              }}
            />
            <TaskTitle task={task} />
            <div className="grow" />
            <p
              className={cn(
                "text-canvas-3 min-w-fit text-sm uppercase",
                "leading-20 font-semibold tracking-wide"
              )}
            >
              {getDisplayedDate(task)}
            </p>
          </GridListItem>
        )
      }}
    </GridList>
  )
}

// TODO: Move to own file
function useTaskListQuery() {
  const { id: inboxId, view: inboxView } = useCurrentInboxView()

  const inboxQuery = db.useQuery({
    inboxes: { $: { where: { id: inboxId } } },
  })
  const inbox = inboxQuery.data?.inboxes[0]

  const taskInboxState = INBOX_VIEW_TO_STATE_MAP[inboxView] ?? "open"

  const taskQuery = db.useQuery({
    tasks: {
      $: {
        where: {
          "inbox.id": inboxId,
          "inbox_state": taskInboxState,
        },
        order:
          inboxView === "snoozed"
            ? { snooze_date: "asc" }
            : inboxView === "archived"
              ? { archive_date: "desc" }
              : undefined,
        limit: inboxView === "archived" ? 30 : undefined,
      },
    },
  })

  let result: Task[] = (taskQuery.data?.tasks ?? []) as Task[]

  if (inboxView === "open") {
    result = sortItemsByIdOrder({
      items: inbox ? result : [],
      idOrder: inbox?.open_task_order ?? [],
      missingIdsPosition: "start",
      sortMissingIds(left, right) {
        return right.created_at - left.created_at
      },
    })
  }

  if (inboxView === "snoozed") {
    result = [...result].sort((left, right) => {
      const leftSnooze = left.snooze_date ?? new Date(2100, 1, 1).getTime()
      const rightSnooze = right.snooze_date ?? new Date(2100, 1, 1).getTime()
      return leftSnooze - rightSnooze
    })
  }

  if (inboxView === "archived") {
    result = [...result].sort((left, right) => {
      const leftArchive = left.archive_date ?? 0
      const rightArchive = right.archive_date ?? 0
      return rightArchive - leftArchive
    })
  }

  return result
}

function TaskTitle({ task }: { task: Task }) {
  const [open, setOpen] = useState(false)
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const updatedTitle = formData.get("title") as string
    const updatedContent = (formData.get("content") ?? "") as string

    updateTask(task.id, {
      title: updatedTitle,
      content: updatedContent,
    }).then(() => setOpen(false))
  }
  return (
    <PopoverTrigger isOpen={open} onOpenChange={setOpen}>
      <Button className="cursor-pointer truncate text-left hover:underline">{task.title}</Button>
      <Popover
        placement="bottom start"
        classNames={{
          content: ["w-400", "bg-canvas-0/30 backdrop-blur-lg border-2", "p-16"],
        }}
      >
        <Form onSubmit={onSubmit} className="flex flex-col gap-8">
          <TextField
            aria-label="Title"
            name="title"
            defaultValue={task.title}
            autoFocus
            classNames={{
              base: "flex flex-col gap-2",
              input: "w-full p-8 border bg-canvas-0",
              field: {
                label: "text-sm font-semibold text-canvas-5",
              },
            }}
          >
            {(_, classNames) => (
              <>
                <FieldLabel className={classNames.field.label}>Title</FieldLabel>
                <TextFieldInput className={classNames.input} />
              </>
            )}
          </TextField>
          <TextField
            aria-label="Content"
            name="content"
            defaultValue={task.content}
            classNames={{
              base: "flex flex-col gap-2",
              textarea: "w-full p-8 border bg-canvas-0",
              field: {
                label: "text-sm font-semibold text-canvas-5",
              },
            }}
          >
            {(_, classNames) => (
              <>
                <FieldLabel className={classNames.field.label}>Content</FieldLabel>
                <TextFieldTextArea className={classNames.textarea} />
              </>
            )}
          </TextField>
          <Button
            className="bg-canvas-2 text-canvas-7 cursor-pointer p-8 font-medium hover:opacity-80"
            type="submit"
          >
            Save
          </Button>
        </Form>
      </Popover>
    </PopoverTrigger>
  )
}

function getDisplayedDate(task: Task): string {
  if (task.inbox_state === "open") {
    return formatDate(new Date(task.created_at), { withTime: true })
  }

  if (task.inbox_state === "snoozed") {
    return task.snooze_date ? "Until " + formatDate(new Date(task.snooze_date)) : "Someday"
  }

  if (task.inbox_state === "archived") {
    return task.archive_date
      ? formatDate(new Date(task.archive_date), { withTime: true })
      : "Archived"
  }

  return "-"
}
