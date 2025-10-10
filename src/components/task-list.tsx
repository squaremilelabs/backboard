"use client"
import { EllipsisVerticalIcon, PlusIcon } from "lucide-react"
import { useRef, useState } from "react"
import {
  GridList,
  GridListItem,
  Input,
  TextField,
  Button,
  TooltipTrigger,
  Tooltip,
} from "react-aria-components"
import { db } from "@/database/db-client"
import { parseTaskCreateInput } from "@/database/models/task"
import { getTaskTimeInfo } from "@/functions/get-task-time-info"
import { useAuth } from "@/hooks/use-auth"
import { useQueryStates } from "@/hooks/use-query-states"
import { useLocalStorageUtility } from "@/hooks/use-storage-utility"
import { FetchedTask, useTaskListQuery } from "@/hooks/use-task-list-query"
import { twm } from "@/lib/tailwind"

export function TaskList() {
  const { status, scopeId } = useQueryStates()
  const { tasks } = useTaskListQuery({ status, scopeId })

  const withCreateField = status === "current"

  return (
    <div className={twm("gap-space-sm flex flex-col")}>
      <div className={twm("flex items-center justify-between", "p-space-md gap-space-md")}>
        <h2 className={twm("text-neutral-muted-text text-sm font-medium uppercase")}>Tasks</h2>
      </div>
      <GridList aria-label="Task List" items={tasks} className={twm("gap-space-sm flex flex-col")}>
        {(task) => <TaskListItem task={task} />}
      </GridList>
      {withCreateField && <TaskListCreateField />}
    </div>
  )
}

function TaskListItem({ task }: { task: FetchedTask }) {
  return (
    <GridListItem
      id={task.id}
      textValue={task.title}
      className={twm(
        "flex items-start",
        "transition-all",
        "rounded-md border-2 border-transparent",
        "hover:bg-neutral-muted-bg/70"
      )}
    >
      {() => {
        return (
          <>
            <Button
              className={twm(
                "flex items-center justify-center",
                "shrink-0 transition-all",
                "size-box-md rounded-md",
                "text-neutral-muted-text",
                "hover:bg-base-bg/70 hover:text-base-text"
              )}
            >
              <EllipsisVerticalIcon />
            </Button>
            <div className={twm("flex grow items-start", "px-space-xs py-space-md gap-space-md")}>
              <p className="grow">{task.title}</p>
            </div>
            <TaskTimeBadge task={task} />
          </>
        )
      }}
    </GridListItem>
  )
}

function TaskListCreateField() {
  const { account } = useAuth()
  const { scopeId } = useQueryStates()
  const [title, setTitle] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (!account) return
      if (!title.trim()) return

      const { id, data, link } = parseTaskCreateInput({
        title,
        scope_id: scopeId === "root" ? undefined : scopeId,
        owner_id: account.id,
        status: "current",
        status_time: Date.now(),
      })

      db.transact([db.tx.tasks[id].link(link).create(data)]).then(() => setTitle(""))
    }
    if (event.key === "Escape") {
      setTitle("")
      inputRef.current?.blur()
    }
  }

  return (
    <TextField
      aria-label="Add task"
      value={title}
      onChange={setTitle}
      className={twm([
        "group/create-field",
        "flex items-center",
        "px-space-lg py-space-md gap-space-md",
        "rounded-md border-2 border-transparent",
        "focus-within:bg-neutral-muted-bg/70",
        "hover:bg-neutral-muted-bg/70",
        "has-data-focus-visible:outline-2",
      ])}
    >
      {({}) => {
        return (
          <>
            <Button
              onPress={() => inputRef.current?.focus()}
              excludeFromTabOrder
              className={twm(
                "!outline-0",
                "text-neutral-muted-text",
                "group-focus-within/create-field:text-base-text",
                "mr-space-xs"
              )}
            >
              <PlusIcon />
            </Button>
            <Input
              ref={inputRef}
              placeholder="Add task"
              className={twm(["grow", "!outline-0"])}
              onKeyDown={onKeyDown}
            />
          </>
        )
      }}
    </TextField>
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
      <Tooltip
        offset={8}
        placement={"bottom"}
        className={twm(
          "gap-space-md flex flex-col",
          "bg-neutral-bg text-neutral-fg text-sm",
          "p-space-md",
          "rounded-md"
        )}
      >
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
