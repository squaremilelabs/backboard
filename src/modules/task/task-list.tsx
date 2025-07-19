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
import { TasksView, useTasksView } from "./use-tasks-view"
import { Icon } from "@/lib/primitives/icon"
import { twm } from "@/lib/utils/tailwind"
import { useCreateTask, useUpdateManyTask } from "@/database/generated/hooks"

export function TaskList() {
  const { view } = useTasksView()
  const { data: tasks, isLoading: tasksIsLoading } = useCurrentViewTasks()
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])

  return (
    <div className="flex max-h-full flex-col gap-8 overflow-auto">
      {selectedTaskIds.length > 0 ? (
        <TaskActions selectedIds={selectedTaskIds} />
      ) : (
        view === "current" && <TaskCreateForm />
      )}
      <GridList
        aria-label="Task List"
        items={tasks ?? []}
        selectedKeys={selectedTaskIds}
        onSelectionChange={(selection) =>
          setSelectedTaskIds(
            selection === "all"
              ? (tasks?.map((task) => task.id) ?? [])
              : (Array.from(selection) as string[])
          )
        }
        selectionMode="multiple"
        className="divide-y not-data-empty:border data-empty:bg-neutral-100"
        renderEmptyState={() => {
          return (
            <div
              className={twm(
                "flex h-100 items-center justify-center p-16 font-medium text-neutral-500",
                !tasksIsLoading && "font-bold text-neutral-950"
              )}
            >
              {tasksIsLoading ? "Loading..." : "Zero"}
            </div>
          )
        }}
      >
        {(task) => <TaskListItem task={task} />}
      </GridList>
    </div>
  )
}

function TaskListItem({ task }: { task: Task }) {
  return (
    <GridListItem
      id={task.id}
      textValue={task.title}
      className={twm(
        "flex items-center gap-8 px-16 py-8",
        "bg-neutral-0 data-selected:bg-neutral-100"
      )}
    >
      <Checkbox slot="selection" />
      <p>{task.title}</p>
    </GridListItem>
  )
}

function TaskCreateForm() {
  const { scopeId } = useTasksView()
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

  return (
    <Form
      ref={formRef}
      onSubmit={handleSubmit}
      className={twm(
        "group flex items-center gap-8 border-2 border-transparent px-16 py-8",
        "focus-within:bg-neutral-0 focus-within:border-neutral-200",
        "hover:border-neutral-200"
      )}
    >
      {isPending && <Icon icon="loader" className="animate-spin" size="sm" />}
      <Button type="submit" className={twm("hidden group-focus-within:block")}>
        <Icon icon="plus" />
      </Button>
      <TextField className="grow" name="title">
        <Input
          className="w-full placeholder-neutral-400 !outline-0
            not-group-focus-within:text-neutral-400"
          placeholder="Add"
        />
      </TextField>
    </Form>
  )
}

type TaskActionType = "defer" | "return" | "complete" | "archive"
const actionComponentMap: Record<TaskActionType, React.ComponentType<{ selectedIds: string[] }>> = {
  defer: TaskDeferAction,
  return: TaskReturnAction,
  complete: TaskCompleteAction,
  archive: TaskArchiveAction,
}

const viewActionMap: Record<TasksView, TaskActionType[]> = {
  current: ["defer", "complete", "archive"],
  deferred: ["return", "complete", "archive"],
  complete: ["return", "archive"],
  archive: ["return"],
}

function TaskActions({ selectedIds }: { selectedIds: string[] }) {
  const { view } = useTasksView()
  if (selectedIds.length === 0) return null

  const displayedActions = viewActionMap[view]

  return (
    <div className="flex items-center gap-16 border border-transparent px-8">
      <Group className="flex items-center gap-8" aria-orientation="horizontal">
        {displayedActions.map((action) => {
          const ActionComponent = actionComponentMap[action]
          return <ActionComponent key={action} selectedIds={selectedIds} />
        })}
      </Group>
      <div className="grow" />
      <p className="font-medium text-neutral-950">
        {selectedIds.length === 1 ? "1 selected" : `${selectedIds.length} selected`}
      </p>
    </div>
  )
}

const actionButtonClassName = twm(
  "flex items-center gap-8 p-8",
  "cursor-pointer hover:opacity-70",
  "font-semibold"
)

function TaskDeferAction({ selectedIds }: { selectedIds: string[] | "all" }) {
  return (
    <Button className={actionButtonClassName}>
      <Icon icon="defer" size="sm" />
      Defer
    </Button>
  )
}

function TaskCompleteAction({ selectedIds }: { selectedIds: string[] }) {
  return (
    <Button className={actionButtonClassName}>
      <Icon icon="complete" size="sm" />
      Complete
    </Button>
  )
}

function TaskReturnAction({ selectedIds }: { selectedIds: string[] }) {
  const { mutate: updateTasks, isPending } = useUpdateManyTask()
  return (
    <Button
      className={actionButtonClassName}
      onPress={() => {
        updateTasks({
          where: { id: { in: selectedIds } },
          data: { deferred_to: null, completed_at: null, archived_at: null },
        })
      }}
    >
      <Icon
        icon={isPending ? "loader" : "return"}
        size="sm"
        className={isPending ? "animate-spin" : ""}
      />
      Return
    </Button>
  )
}

function TaskArchiveAction({ selectedIds }: { selectedIds: string[] }) {
  const { mutate: updateTasks, isPending } = useUpdateManyTask()
  return (
    <Button
      className={actionButtonClassName}
      onPress={() => {
        updateTasks({
          where: { id: { in: selectedIds } },
          data: { archived_at: new Date() },
        })
      }}
    >
      <Icon
        icon={isPending ? "loader" : "archive"}
        size="sm"
        className={isPending ? "animate-spin" : ""}
      />
      Archive
    </Button>
  )
}

function Checkbox(props: CheckboxProps) {
  return (
    <AriaCheckbox
      {...props}
      aria-label="Checkbox"
      className={twm("cursor-pointer hover:opacity-70")}
    >
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
