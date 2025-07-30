import {
  AlarmClockIcon,
  AlarmClockOffIcon,
  CircleCheckBigIcon,
  CircleFadingArrowUpIcon,
  ClockArrowUpIcon,
  LucideIcon,
  Trash2Icon,
} from "lucide-react"
import { useRef, useState } from "react"
import { TaskSnoozePicker } from "./task-snooze"
import { deleteManyTasks, TaskInboxState, updateManyTasks } from "@/database/models/task"
import { Button, ButtonGroup, ButtonProps } from "~/smui/button/components"
import { Tooltip, TooltipTrigger } from "~/smui/tooltip/components"
import { Icon } from "~/smui/icon/components"
import { label, palette, PaletteVariant } from "@/common/components/class-names"
import { Modal } from "~/smui/modal/components"

export type TaskActionButonProps = {
  inboxState: TaskInboxState
  selectedTaskIds: string[]
  onAfterAction?: () => void
  display: "buttons" | "icons"
}

type TaskActionKey = "todo" | "snooze" | "done" | "delete"

const TASK_STATE_TO_ACTION_MAP: Record<TaskInboxState, TaskActionKey[]> = {
  open: ["done", "snooze", "delete"],
  snoozed: ["todo", "snooze", "done", "delete"],
  archived: ["todo", "delete"],
}

export function TaskActionBar(props: TaskActionButonProps) {
  const displayedActions = TASK_STATE_TO_ACTION_MAP[props.inboxState]
  return (
    <ButtonGroup
      classNames={{
        base: [
          "flex items-center",
          props.display === "icons" ? "border rounded-sm p-1 px-4 gap-8" : "gap-4",
        ],
      }}
    >
      {(_) => (
        <>
          {props.selectedTaskIds.length > 1 ? (
            <span className={label({ class: "text-neutral-text px-8" })}>
              {props.selectedTaskIds.length} Selected
            </span>
          ) : null}
          {displayedActions.map((action) => {
            if (action === "todo") return <TaskTodoActionButton key={action} {...props} />
            if (action === "snooze") return <TaskSnoozeActionButton key={action} {...props} />
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
    <Button {...props} variants={{ variant: "action-button" }} className={palette({ p })}>
      <Icon icon={<ActionIcon />} />
      <span className="text-sm">{label}</span>
    </Button>
  )
}

function TaskTodoActionButton({
  inboxState,
  display,
  selectedTaskIds,
  onAfterAction,
}: TaskActionButonProps) {
  const onPress = () => {
    updateManyTasks(selectedTaskIds, {
      inbox_state: "open",
      archive_date: null,
      snooze_date: null,
    }).then(() => {
      if (onAfterAction) onAfterAction()
    })
  }

  return (
    <TaskActionButton
      label={inboxState === "archived" ? `Undo` : `Unsnooze`}
      Icon={inboxState === "archived" ? CircleFadingArrowUpIcon : AlarmClockOffIcon}
      palette={inboxState === "archived" ? "neutral-flat" : "primary-muted-solid"}
      display={display}
      onPress={onPress}
    />
  )
}

function TaskSnoozeActionButton({
  inboxState,
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
        label={inboxState === "open" ? `Snooze` : `Reschedule`}
        Icon={inboxState === "open" ? AlarmClockIcon : ClockArrowUpIcon}
        display={display}
        palette="neutral-flat"
        onPress={() => setOpen(true)}
      />
      <TaskSnoozePicker isOpen={open} onOpenChange={setOpen} selectedTaskIds={selectedTaskIds} />
    </>
  )
}

function TaskDoneActionButton({
  inboxState,
  display,
  selectedTaskIds,
  onAfterAction,
}: TaskActionButonProps) {
  const onPress = () => {
    updateManyTasks(selectedTaskIds, {
      inbox_state: "archived",
      archive_date: new Date().getTime(),
      snooze_date: null,
    }).then(() => {
      if (onAfterAction) onAfterAction()
    })
  }
  return (
    <TaskActionButton
      label={"Mark done"}
      Icon={CircleCheckBigIcon}
      display={display}
      onPress={onPress}
      palette={inboxState === "open" ? "primary-muted-solid" : "neutral-flat"}
    />
  )
}

function TaskDeleteActionButton({ display, selectedTaskIds, onAfterAction }: TaskActionButonProps) {
  const [open, setOpen] = useState(false)
  const onProceed = () => {
    deleteManyTasks(selectedTaskIds).then(() => {
      if (onAfterAction) onAfterAction()
    })
  }
  return (
    <>
      <TaskActionButton
        label={`Delete`}
        Icon={Trash2Icon}
        palette="danger-muted-flat"
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
