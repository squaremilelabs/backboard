import {
  AlarmClockIcon,
  AlarmClockOffIcon,
  ArchiveIcon,
  ArchiveRestoreIcon,
  ClockArrowUpIcon,
  LucideIcon,
  Trash2Icon,
} from "lucide-react"
import { TaskInboxState, updateManyTasks } from "@/database/models/task"
import { Button, ButtonGroup, ButtonProps } from "~/smui/button/components"
import { Tooltip, TooltipTrigger } from "~/smui/tooltip/components"
import { Icon } from "~/smui/icon/components"

export function TaskActionBar({
  inboxState,
  selectedTaskIds,
  iconsOnly,
}: {
  inboxState: TaskInboxState
  selectedTaskIds: string[]
  iconsOnly?: boolean
}) {
  const onReopen = () => {
    updateManyTasks(selectedTaskIds, {
      inbox_state: "open",
      archive_date: null,
      snooze_date: null,
    })
  }

  const onArchive = () => {
    updateManyTasks(selectedTaskIds, {
      inbox_state: "archived",
      archive_date: new Date().getTime(),
      snooze_date: null,
    })
  }
  return (
    <ButtonGroup
      classNames={{
        base: ["flex items-center", iconsOnly ? "gap-8" : "gap-4"],
        button: ["flex items-center", "text-neutral-text", iconsOnly ? "p-2" : "px-8 gap-4 py-2"],
      }}
      variants={{ hover: "fill" }}
    >
      {(_, classNames) => (
        <>
          {inboxState !== "open" && (
            <TaskActionButton
              label={inboxState === "archived" ? "Restore" : "Unsnooze"}
              Icon={inboxState === "archived" ? ArchiveRestoreIcon : AlarmClockOffIcon}
              className={[classNames.button]}
              isIconOnly={iconsOnly}
              onPress={onReopen}
            />
          )}
          {inboxState !== "archived" && (
            <>
              <TaskActionButton
                label={inboxState === "open" ? "Snooze" : "Resnooze"}
                Icon={inboxState === "open" ? AlarmClockIcon : ClockArrowUpIcon}
                className={classNames.button}
                isIconOnly={iconsOnly}
              />
              <TaskActionButton
                label="Archive"
                Icon={ArchiveIcon}
                className={classNames.button}
                isIconOnly={iconsOnly}
                onPress={onArchive}
              />
            </>
          )}
          <TaskActionButton
            label="Delete"
            Icon={Trash2Icon}
            className={[classNames.button, "text-neutral-muted-text"]}
            isIconOnly={iconsOnly}
          />
        </>
      )}
    </ButtonGroup>
  )
}

function TaskActionButton({
  label,
  Icon: ActionIcon,
  isIconOnly,
  ...props
}: { label: string; Icon: LucideIcon; isIconOnly?: boolean } & ButtonProps) {
  if (isIconOnly) {
    return (
      <TooltipTrigger delay={1000} closeDelay={500}>
        <Button {...props}>
          <Icon icon={<ActionIcon />} />
        </Button>
        <Tooltip
          offset={4}
          placement="bottom"
          className={[
            "bg-neutral-muted-bg border-neutral-muted-border",
            "rounded-sm border px-8 py-4 text-sm",
          ]}
        >
          {label}
        </Tooltip>
      </TooltipTrigger>
    )
  }

  return (
    <Button {...props}>
      <Icon icon={<ActionIcon />} />
      <span className="text-sm">{label}</span>
    </Button>
  )
}
