import {
  AlarmClockIcon,
  AlarmClockOffIcon,
  CircleCheckBigIcon,
  ClipboardClockIcon,
  LucideIcon,
  Trash2Icon,
  Undo2Icon,
} from "lucide-react"
import { useRef, useState } from "react"
import { TaskSnoozePicker } from "./task-snooze"
import { Button, ButtonGroup, ButtonProps } from "~/smui/button/components"
import { Tooltip, TooltipTrigger } from "~/smui/tooltip/components"
import { Icon } from "~/smui/icon/components"
import { palette, PaletteVariant } from "@/common/components/class-names"
import { Modal } from "~/smui/modal/components"
import { parseTaskUpdateInput, TaskStatus } from "@/database/models/task"
import { db } from "@/database/db-client"

export type TaskActionButonProps = {
  currentStatus: TaskStatus
  selectedTaskIds: string[]
  onAfterAction?: () => void
  display: "buttons" | "icons"
}

type TaskActionKey = "now" | "later" | "done" | "delete"

const TASK_STATUS_TO_ACTION_MAP: Record<TaskStatus, TaskActionKey[]> = {
  now: ["done", "later", "delete"],
  later: ["now", "later", "done", "delete"],
  done: ["now", "delete"],
}

export function TaskActionBar(props: TaskActionButonProps) {
  const displayedActions = TASK_STATUS_TO_ACTION_MAP[props.currentStatus]
  return (
    <ButtonGroup
      classNames={{
        base: ["flex items-center", props.display === "icons" ? "gap-8" : "gap-4"],
      }}
    >
      {(_) => (
        <>
          {displayedActions.map((action) => {
            if (action === "now") return <TaskNowActionButton key={action} {...props} />
            if (action === "later") return <TaskLaterActionButton key={action} {...props} />
            if (action === "done") return <TaskDoneActionButton key={action} {...props} />
            if (action === "delete") return <TaskDeleteActionButton key={action} {...props} />
            return null
          })}
        </>
      )}
    </ButtonGroup>
  )
}

function TaskActionButton({
  label,
  Icon: ActionIcon,
  palette: p,
  display,
  ...props
}: {
  label: string
  Icon: LucideIcon
  palette?: PaletteVariant
  display: TaskActionButonProps["display"]
} & ButtonProps) {
  if (display === "icons") {
    return (
      <TooltipTrigger delay={1000} closeDelay={0}>
        <Button
          {...props}
          variants={{ variant: "action-button-icon" }}
          className={[palette({ p }), "border-none bg-transparent"]}
        >
          <Icon icon={<ActionIcon />} />
        </Button>
        <Tooltip
          offset={8}
          placement="bottom"
          className={["bg-base-bg rounded-sm border px-16 py-4 text-sm", palette({ p })]}
        >
          {label}
        </Tooltip>
      </TooltipTrigger>
    )
  }

  return (
    <Button
      {...props}
      variants={{ variant: "action-button" }}
      className={palette({ p, className: "min-w-fit" })}
    >
      <Icon icon={<ActionIcon />} />
      <span className="text-sm">{label}</span>
    </Button>
  )
}

function TaskNowActionButton({
  currentStatus,
  display,
  selectedTaskIds,
  onAfterAction,
}: TaskActionButonProps) {
  const onPress = () => {
    db.transact(
      selectedTaskIds.map((id) => {
        const { data } = parseTaskUpdateInput({
          status: "now",
          prev_status: currentStatus as "later" | "done",
        })
        return db.tx.tasks[id].update(data)
      })
    ).then(() => {
      if (onAfterAction) onAfterAction()
    })
  }

  return (
    <TaskActionButton
      label={currentStatus === "later" ? "Unsnooze" : "Reopen"}
      Icon={currentStatus === "later" ? AlarmClockOffIcon : Undo2Icon}
      palette="neutral-flat"
      display={display}
      onPress={onPress}
    />
  )
}

function TaskLaterActionButton({
  currentStatus,
  display,
  selectedTaskIds,
  onAfterAction: __,
}: TaskActionButonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  return (
    <>
      <TaskActionButton
        forwardRef={ref}
        label={currentStatus === "now" ? `Snooze` : `Reschedule`}
        Icon={currentStatus === "now" ? AlarmClockIcon : ClipboardClockIcon}
        display={display}
        palette="neutral-flat"
        onPress={() => setOpen(true)}
      />
      <TaskSnoozePicker
        isOpen={open}
        onOpenChange={setOpen}
        selectedTaskIds={selectedTaskIds}
        currentStatus={currentStatus}
      />
    </>
  )
}

function TaskDoneActionButton({
  currentStatus,
  display,
  selectedTaskIds,
  onAfterAction,
}: TaskActionButonProps) {
  const onPress = () => {
    db.transact(
      selectedTaskIds.map((id) => {
        const { data } = parseTaskUpdateInput({
          status: "done",
          prev_status: currentStatus as "now" | "later",
        })
        return db.tx.tasks[id].update(data)
      })
    ).then(() => {
      if (onAfterAction) onAfterAction()
    })
  }
  return (
    <TaskActionButton
      label={"Mark done"}
      Icon={CircleCheckBigIcon}
      display={display}
      onPress={onPress}
      palette={currentStatus === "now" ? "primary-flat" : "neutral-flat"}
    />
  )
}

function TaskDeleteActionButton({ display, selectedTaskIds, onAfterAction }: TaskActionButonProps) {
  const [open, setOpen] = useState(false)
  const onProceed = () => {
    db.transact(selectedTaskIds.map((id) => db.tx.tasks[id].delete())).then(() => {
      if (onAfterAction) onAfterAction()
    })
  }
  return (
    <>
      <TaskActionButton
        label={`Delete`}
        Icon={Trash2Icon}
        palette="neutral-muted-flat"
        display={display}
        onPress={() => setOpen(true)}
      />
      <Modal
        isOpen={open}
        onOpenChange={setOpen}
        variants={{ size: "xs" }}
        isDismissable
        classNames={{ content: ["bg-base-bg p-16 gap-8 border rounded-sm"] }}
      >
        <p className="text-lg font-semibold">
          Are you sure you want to delete{" "}
          {selectedTaskIds.length > 1 ? `these ${selectedTaskIds.length} tasks` : "this task"}?
        </p>
        <span className="text-danger-text font-medium">This action is irreversible</span>
        <div className="bg-base-border h-2 w-full" />
        <Button
          className={["rounded-md p-8 font-semibold", palette({ p: "danger-solid" })]}
          onPress={onProceed}
        >
          Delete {selectedTaskIds.length} Task{selectedTaskIds.length > 1 ? "s" : ""}
        </Button>
      </Modal>
    </>
  )
}
