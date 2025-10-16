"use client"

import { getLocalTimeZone, today } from "@internationalized/date"
import {
  addDays,
  addHours,
  format,
  isAfter,
  isSameDay,
  isToday,
  nextMonday,
  startOfDay,
  startOfHour,
  subHours,
} from "date-fns"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useState } from "react"
import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  DateValue,
  Heading,
  Keyboard,
  ListBox,
  ListBoxItem,
  Text,
} from "react-aria-components"
import { db } from "@/database/db-client"
import { DEFAULT_ACCOUNT_WORK_HOURS } from "@/database/models/account"
import { parseTaskUpdateInput, Task, TaskStatus, TaskUpdateOutput } from "@/database/models/task"
import { useAuth } from "@/hooks/use-auth"
import { twm } from "@/lib/tailwind"
import { iconButton } from "./primitives/_class-names"
import { HourPicker } from "./primitives/hour-picker"
import { Overlay, OverlayProps } from "./primitives/overlay"

export function TaskActionMenu({
  targetTasks,
  targetTasksStatus,
  onRenameAction,
  onOpenNotesAction,
  overlayProps,
}: {
  targetTasks: Task[]
  targetTasksStatus: TaskStatus
  onRenameAction?: () => void
  onOpenNotesAction?: () => void
  overlayProps?: Omit<OverlayProps<"popover">, "racType" | "children">
}) {
  type ActionItem = {
    isVisible: boolean
    label: string
    kbShortcut?: string
    onAction: () => void
  }

  const actionItems: ActionItem[] = [
    {
      label: "Rename",
      kbShortcut: "E",
      isVisible: onRenameAction !== undefined,
      onAction: onRenameAction!,
    },
    {
      label: "Open Notes",
      kbShortcut: "R",
      isVisible: onOpenNotesAction !== undefined,
      onAction: onOpenNotesAction!,
    },
    {
      label: targetTasksStatus === "snoozed" ? "Unsnooze" : "Reopen",
      kbShortcut: "F",
      isVisible: targetTasksStatus !== "current",
      onAction: () => {},
    },
    {
      label: targetTasksStatus === "snoozed" ? "Reschedule..." : "Snooze...",
      kbShortcut: "S",
      isVisible: targetTasksStatus !== "done",
      onAction: () => {},
    },
    {
      label: "Mark Done",
      kbShortcut: "D",
      isVisible: targetTasksStatus !== "done",
      onAction: () => {},
    },
    { label: "Delete", isVisible: true, onAction: () => {} },
  ].filter((item) => item.isVisible)

  const { classNames: overlayClassNames, ...overlayPropsWithoutClassNames } = overlayProps ?? {}

  return (
    <Overlay
      racType="popover"
      placement="bottom"
      offset={4}
      visualType={{ desktop: "popover", mobile: "sheet" }}
      classNames={{
        underlay: ({ resolvedVisualType, overlayState }) => [
          typeof overlayClassNames?.underlay === "function"
            ? overlayClassNames.underlay({ resolvedVisualType, overlayState })
            : overlayClassNames?.underlay,
        ],
        overlay: ({ resolvedVisualType, overlayState }) => [
          "bg-base-bg !outline-0",
          resolvedVisualType === "popover" && [
            "border rounded-md",
            "min-w-[200px]",
            "border-l-4 border-l-base-outline rounded-l-none",
          ],
          resolvedVisualType === "sheet" && "h-[50dvh]",
          typeof overlayClassNames?.overlay === "function"
            ? overlayClassNames.overlay({ resolvedVisualType, overlayState })
            : overlayClassNames?.overlay,
        ],
      }}
      {...overlayPropsWithoutClassNames}
    >
      {({}) => {
        return (
          <ListBox
            aria-label="Task Actions"
            autoFocus
            items={actionItems}
            className={twm("!outline-0")}
          >
            {(item) => {
              return (
                <ListBoxItem
                  id={item.label}
                  textValue={item.label}
                  className={twm(
                    "px-space-lg py-space-md",
                    "flex items-center justify-between",
                    "hover:bg-neutral-muted-bg",
                    "!cursor-default"
                  )}
                  onAction={item.onAction}
                >
                  <Text slot="label">{item.label}</Text>
                  {item.kbShortcut && (
                    <Keyboard
                      className={twm(
                        "px-space-sm font-sans text-sm",
                        "text-neutral-muted-fg bg-neutral-muted-bg",
                        "rounded-sm border"
                      )}
                    >
                      {item.kbShortcut}
                    </Keyboard>
                  )}
                </ListBoxItem>
              )
            }}
          </ListBox>
        )
      }}
    </Overlay>
  )
}

function TaskSnoozePicker({
  onClose,
  selectedTaskIds,
  currentStatus,
}: {
  onClose: () => void
  selectedTaskIds: string[]
  currentStatus: TaskStatus
}) {
  const { account } = useAuth()
  const workHours = account?.custom_work_hours ?? DEFAULT_ACCOUNT_WORK_HOURS

  const [selectedCalendarDate, setSelectedCalendarDate] = useState<DateValue | null>(
    today(getLocalTimeZone()).add({ days: 1 })
  )
  const [selectedHour, setSelectedHour] = useState<number | null>(workHours.start)
  const [showCalendar, setShowCalendar] = useState(false)

  const selectedDateValue = selectedCalendarDate
    ? addHours(selectedCalendarDate.toDate(getLocalTimeZone()), selectedHour ?? 0)
    : null

  const handleCalendarDateSelect = (date: DateValue) => {
    if (isToday(date.toDate(getLocalTimeZone()))) {
      setSelectedHour(addHours(startOfHour(new Date()), 1).getHours())
      setSelectedCalendarDate(date)
    } else {
      setSelectedCalendarDate(date)
      setSelectedHour(workHours.start)
    }
  }

  const handleManualSave = () => {
    if (!selectedDateValue) return null
    handleTimedDateSelect(selectedDateValue.getTime())
  }

  const hourSelectionMin = selectedCalendarDate
    ? isToday(selectedCalendarDate.toDate(getLocalTimeZone()))
      ? addHours(startOfHour(new Date()), 1).getHours()
      : 0
    : 0

  const handleTimedDateSelect = (date: number) => {
    db.transact(
      selectedTaskIds.map((id) => {
        let data: TaskUpdateOutput["data"] = {}
        if (currentStatus === "snoozed") {
          const { data: narrowedData } = parseTaskUpdateInput({
            status_time: date,
          })
          data = narrowedData
        } else {
          const { data: narrowedData } = parseTaskUpdateInput({
            status: "snoozed",
            status_time: date,
            prev_status: currentStatus,
          })
          data = narrowedData
        }
        return db.tx.tasks[id].update(data)
      })
    ).then(() => {
      onClose()
    })
  }

  const handleSomedaySelect = () => {
    db.transact(
      selectedTaskIds.map((id) => {
        let data: TaskUpdateOutput["data"] = {}
        if (currentStatus === "snoozed") {
          const { data: narrowedData } = parseTaskUpdateInput({ status_time: null })
          data = narrowedData
        } else {
          const { data: narrowedData } = parseTaskUpdateInput({
            status: "snoozed",
            status_time: null,
            prev_status: currentStatus,
          })
          data = narrowedData
        }
        return db.tx.tasks[id].update(data)
      })
    ).then(() => {
      onClose()
    })
  }

  const presets = useCurrentSnoozePresets()

  if (showCalendar) {
    return (
      <div>
        <Calendar
          value={selectedCalendarDate}
          minValue={today(getLocalTimeZone())}
          className="flex flex-col gap-4"
          onChange={handleCalendarDateSelect}
          autoFocus
        >
          <header className="flex items-center gap-16 p-4">
            <Button slot="previous" className={iconButton()}>
              <ChevronLeftIcon />
            </Button>
            <Heading className="grow text-center font-semibold" />
            <Button slot="next" className={iconButton()}>
              <ChevronRightIcon />
            </Button>
          </header>
          <CalendarGrid className="w-full p-2">
            {(date) => (
              <CalendarCell
                date={date}
                className={twm(
                  "rounded-sm",
                  "flex size-[36px] items-center justify-center",
                  "border border-transparent",
                  "data-disabled:text-neutral-muted-text/30",
                  "not-data-disabled:cursor-pointer",
                  "not-data-disabled:hover:bg-neutral-muted-bg",
                  `data-selected:bg-neutral-muted-bg data-selected:border-base-border
                  data-selected:font-semibold`
                )}
              />
            )}
          </CalendarGrid>
        </Calendar>
        <HourPicker
          selectedKey={selectedHour}
          onSelectionChange={(val) => typeof val === "number" && setSelectedHour(val)}
          min={hourSelectionMin}
          max={23}
        />
        <div className="flex items-center">
          <div className="grow" />
          <Button
            className="bg-neutral-muted-bg rounded-sm border px-8 py-4 font-medium"
            onPress={handleManualSave}
          >
            Save
          </Button>
        </div>
      </div>
    )
  }

  const buttonClassName = twm(
    "flex items-center justify-between",
    "px-space-lg py-space-md",
    "hover:bg-neutral-muted-bg"
  )

  return (
    <>
      <div className={"flex flex-col"}>
        {presets.map((preset) => (
          <Button
            key={preset.value.getTime()}
            className={buttonClassName}
            onPress={() => handleTimedDateSelect(preset.value.getTime())}
          >
            <span>{preset.label}</span>
            <span className="text-neutral-muted-text text-sm">{preset.subLabel}</span>
          </Button>
        ))}
        <Button onPress={handleSomedaySelect} className={buttonClassName}>
          <span>Someday</span>
        </Button>
        <Button onPress={() => setShowCalendar(true)} className={buttonClassName}>
          <span>Choose date & time...</span>
          <ChevronRightIcon />
        </Button>
      </div>
    </>
  )
}

type SnoozePreset = {
  key: "today-mid" | "today-last" | "tomorrow" | "this-week" | "next-week"
  label: string
  subLabel: string
  value: Date
}

export function useCurrentSnoozePresets(): SnoozePreset[] {
  const { account } = useAuth()

  const hours = account?.custom_work_hours ?? DEFAULT_ACCOUNT_WORK_HOURS

  const todayAnchor = startOfDay(subHours(startOfHour(new Date()), hours.start))

  const midShift = typeof hours.mid === "number" ? addHours(todayAnchor, hours.mid) : null
  const lastShift = typeof hours.last === "number" ? addHours(todayAnchor, hours.last) : null

  const tomorrow = addHours(addDays(todayAnchor, 1), hours.start)
  const thisWeek = addHours(addDays(todayAnchor, 2), hours.start)
  const nextWeek = addHours(nextMonday(todayAnchor, {}), hours.start)

  const showLaterToday = midShift && !isAfter(new Date(), midShift)
  const showLatertTonight = lastShift && !isAfter(new Date(), lastShift)
  const showThisWeek = !isAfter(thisWeek, nextWeek)
  const showNextWeek = !isSameDay(nextWeek, tomorrow) && !isSameDay(nextWeek, thisWeek)

  return [
    showLaterToday
      ? {
          key: "today-mid",
          label: "Later today",
          subLabel: format(midShift as Date, "haaaaa"),
          value: midShift,
        }
      : null,
    showLatertTonight
      ? {
          key: "today-last",
          label: "Later tonight",
          subLabel: format(lastShift as Date, "haaaaa"),
          value: lastShift as Date,
        }
      : null,
    {
      key: "tomorrow",
      label: "Tomorrow",
      subLabel: format(tomorrow, "eee haaaaa"),
      value: tomorrow,
    },
    showThisWeek
      ? {
          key: "this-week",
          label: "This week",
          subLabel: format(thisWeek, "eee haaaaa"),
          value: thisWeek,
        }
      : null,
    showNextWeek
      ? {
          key: "next-week",
          label: "Next week",
          subLabel: format(nextWeek, "eee haaaaa"),
          value: nextWeek,
        }
      : null,
  ].filter((val) => val !== null) as SnoozePreset[]
}
