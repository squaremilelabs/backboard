"use client"

import {
  Checkbox as AriaCheckbox,
  Button,
  CheckboxProps,
  Form,
  GridList,
  GridListItem,
  Group,
  Input,
  TextField,
} from "react-aria-components"
import { Task } from "@zenstackhq/runtime/models"
import { useRef, useState } from "react"
import { useCurrentViewTasks } from "./use-current-view-tasks"
import { useTasksView } from "./use-tasks-view"
import { Icon } from "@/lib/primitives/icon"
import { twm } from "@/lib/utils/tailwind"
import { useCreateTask } from "@/database/generated/hooks"

export function TaskList() {
  const { view } = useTasksView()
  const { data: tasks } = useCurrentViewTasks()
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[] | "all">([])

  return (
    <div className="flex flex-col gap-8 p-16 pt-0">
      {selectedTaskIds.length > 0 && (
        <div className="flex items-center gap-16 border border-transparent px-8">
          <Group className="flex items-center gap-8" aria-orientation="horizontal">
            <TaskDeferAction />
            <TaskReturnAction />
            <TaskCompleteAction />
            <TaskArchiveAction />
          </Group>
          <div className="grow" />
          <p className="font-medium text-neutral-950">
            {selectedTaskIds.length === 1
              ? "1 selected"
              : selectedTaskIds === "all"
                ? "All selected"
                : `${selectedTaskIds.length} selected`}
          </p>
        </div>
      )}
      <GridList
        aria-label="Task List"
        items={tasks ?? []}
        selectedKeys={selectedTaskIds}
        onSelectionChange={(selection) =>
          setSelectedTaskIds(selection === "all" ? "all" : (Array.from(selection) as string[]))
        }
        selectionMode="multiple"
        selectionBehavior="replace"
        className="bg-neutral-0 divide-y border"
      >
        {(task) => <TaskListItem task={task} />}
      </GridList>
      {view === "current" && <TaskCreateForm />}
    </div>
  )
}

function TaskListItem({ task }: { task: Task }) {
  return (
    <GridListItem
      id={task.id}
      textValue={task.title}
      className={twm("flex items-center gap-8 px-16 py-8", "data-selected:bg-neutral-100")}
    >
      <Checkbox slot="selection" />
      <p>{task.title}</p>
    </GridListItem>
  )
}

function TaskCreateForm() {
  const { scopeId } = useTasksView()
  const [isActive, setIsActive] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const { mutate: createTask, isPending } = useCreateTask({
    onSuccess: () => formRef.current?.reset(),
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(formRef.current!)
    const title = formData.get("title") as string
    createTask({ data: { title, scope_id: scopeId } })
  }

  if (!isActive) {
    return (
      <Button className="flex items-center gap-8 px-16 py-8" onPress={() => setIsActive(true)}>
        <Icon icon="plus" />
        Add
      </Button>
    )
  }

  return (
    <Form
      ref={formRef}
      onSubmit={handleSubmit}
      className={twm("bg-neutral-0 flex items-center gap-8 border px-8 py-4")}
    >
      {isPending && <Icon icon="loader" className="animate-spin" />}
      <TextField className="grow" autoFocus name="title">
        <Input className="w-full px-8 py-4 placeholder-neutral-400 !outline-0" placeholder="Add" />
      </TextField>
      <Button type="submit">
        <Icon icon="plus" />
      </Button>
      <Button onPress={() => setIsActive(false)}>
        <Icon icon="x" />
      </Button>
    </Form>
  )
}

const actionButtonClassName = twm(
  "flex items-center gap-8 p-8",
  "cursor:pointer hover:opacity-70",
  "font-semibold"
)

function TaskDeferAction() {
  return (
    <Button className={actionButtonClassName}>
      <Icon icon="defer" size="sm" />
      Defer
    </Button>
  )
}

function TaskCompleteAction() {
  return (
    <Button className={actionButtonClassName}>
      <Icon icon="complete" size="sm" />
      Complete
    </Button>
  )
}

function TaskReturnAction() {
  return (
    <Button className={actionButtonClassName}>
      <Icon icon="return" size="sm" />
      Return
    </Button>
  )
}

function TaskArchiveAction() {
  return (
    <Button className={actionButtonClassName}>
      <Icon icon="archive" size="sm" />
      Archive
    </Button>
  )
}

function Checkbox(props: CheckboxProps) {
  return (
    <AriaCheckbox {...props} className={twm("cursor-pointer hover:opacity-70")}>
      {({ isSelected, isIndeterminate }) => (
        <Icon
          icon={
            isIndeterminate
              ? "checkbox-indeterminate"
              : isSelected
                ? "checkbox-checked"
                : "checkbox-blank"
          }
          className={isSelected || isIndeterminate ? "text-neutral-950" : "text-neutral-400"}
        />
      )}
    </AriaCheckbox>
  )
}
