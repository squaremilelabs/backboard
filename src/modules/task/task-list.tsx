import { GripVerticalIcon } from "lucide-react"
import { Form, useDragAndDrop } from "react-aria-components"
import { useState } from "react"
import { useCurrentInboxView } from "../inbox/inbox-views"
import { useCurrentViewTasks } from "./task-queries"
import { GridList, GridListItem } from "~/smui/grid-list/components"
import { reorderIds } from "@/lib/utils/list-utils"
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
  const tasks = useCurrentViewTasks()

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
        base: "flex flex-col divide-y divide-canvas-2 not-data-empty:border-b",
        item: [
          "group flex items-start",
          "gap-8 px-16 py-8 !outline-0",
          "bg-canvas-0 data-selected:bg-canvas-0",
          "focus-visible:border-l-4 focus-visible:border-l-canvas-3",
          "data-selected:border-l-4 data-selected:border-l-primary-4",
          "hover:bg-canvas-1",
        ],
      }}
    >
      {(task, classNames) => {
        return (
          <GridListItem id={task.id} textValue={task.title} className={classNames.item}>
            <Button slot="drag" className="text-canvas-3">
              <Icon icon={<GripVerticalIcon />} className="!w-fit !min-w-fit" />
            </Button>
            <Checkbox
              slot="selection"
              classNames={{
                icon: "size-16",
                base: [
                  "h-20 flex items-center text-canvas-3 cursor-pointer",
                  "data-selected:text-primary-5",
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
