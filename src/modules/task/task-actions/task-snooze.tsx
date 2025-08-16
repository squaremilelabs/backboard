"use client"
import { Calendar, CalendarCell, CalendarGrid, DateValue, Heading } from "react-aria-components"
import { AlarmClockIcon, ChevronLeftIcon, ChevronRightIcon, SunMoonIcon } from "lucide-react"
import { getLocalTimeZone, today } from "@internationalized/date"
import { useState } from "react"
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
import { Icon } from "~/smui/icon/components"
import { Button } from "~/smui/button/components"
import { cn } from "~/smui/utils"
import { Modal } from "~/smui/modal/components"
import { panel, typography } from "@/common/components/class-names"
import { db } from "@/database/db-client"
import { parseTaskUpdateInput, TaskStatus, TaskUpdateOutput } from "@/database/models/task"
import { useAuth } from "@/modules/auth/use-auth"
import { DEFAULT_WORKING_HOURS } from "@/modules/auth/account-hours"
import { HourSelect } from "@/common/components/hour-select"
import { formatDate } from "@/common/utils/date-utils"

// TODO: Create calendar component in SMUI
export function TaskSnoozePicker({
  isOpen,
  onOpenChange,
  selectedTaskIds,
  currentStatus,
}: {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  selectedTaskIds: string[]
  currentStatus: TaskStatus
}) {
  const { instantAccount } = useAuth()
  const workHours = instantAccount?.custom_work_hours ?? DEFAULT_WORKING_HOURS

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
      onOpenChange(false)
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
      onOpenChange(false)
    })
  }

  const presets = useCurrentSnoozePresets()

  const { base, section } = panel()

  return (
    <Modal
      isDismissable
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      variants={{ size: "xs" }}
      classNames={{
        content: ["bg-base-bg border backdrop-blur-xl", "flex flex-col gap-8", base(), "w-xs"],
      }}
    >
      <Heading
        slot="title"
        className={cn(section(), "flex items-center gap-8 p-4 px-8 font-medium")}
      >
        <Icon icon={<AlarmClockIcon />} />
        Snooze until...
      </Heading>
      <div className={"bg-base-bg flex flex-col gap-2 rounded-sm p-2"}>
        {showCalendar ? (
          <>
            <Calendar
              value={selectedCalendarDate}
              minValue={today(getLocalTimeZone())}
              className="flex flex-col gap-4"
              onChange={handleCalendarDateSelect}
              autoFocus
            >
              <header className="flex items-center gap-16 p-4">
                <Button slot="previous" className="cursor-pointer p-8 hover:opacity-70">
                  <Icon icon={<ChevronLeftIcon />} />
                </Button>
                <Heading className="grow text-center font-semibold" />
                <Button slot="next" className="cursor-pointer p-8 hover:opacity-70">
                  <Icon icon={<ChevronRightIcon />} />
                </Button>
              </header>
              <CalendarGrid className="w-full p-2">
                {(date) => (
                  <CalendarCell
                    date={date}
                    className={cn(
                      "rounded-sm",
                      "flex size-36 items-center justify-center",
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
            <HourSelect
              selectedKey={selectedHour}
              onSelectionChange={(val) => typeof val === "number" && setSelectedHour(val)}
              min={hourSelectionMin}
              max={23}
            />
          </>
        ) : (
          <>
            {presets.map((preset) => (
              <Button
                key={preset.value.getTime()}
                variants={{ hover: "fill" }}
                className="flex items-center justify-between p-8"
                onPress={() => handleTimedDateSelect(preset.value.getTime())}
              >
                <span>{preset.label}</span>
                <span className={typography({ type: "label" })}>{preset.subLabel}</span>
              </Button>
            ))}
            <Button
              onPress={handleSomedaySelect}
              variants={{ hover: "fill" }}
              className="flex items-center justify-between p-8"
            >
              <span>Someday</span>
              <Icon icon={<SunMoonIcon />} className="text-neutral-muted-text" />
            </Button>
            <Button
              onPress={() => setShowCalendar(true)}
              variants={{ hover: "fill" }}
              className="flex items-center justify-between p-8"
            >
              <span>Choose date & time...</span>
              <Icon icon={<ChevronRightIcon />} />
            </Button>
          </>
        )}
      </div>
      {showCalendar && (
        <div className={section({ className: ["flex items-center", "p-4", "gap-4"] })}>
          <span className={typography({ type: "label", className: "text-base-text px-8" })}>
            {formatDate(selectedDateValue, { withTime: true, withWeekday: true })}
          </span>
          <div className="grow" />
          <Button
            className="bg-neutral-muted-bg rounded-sm border px-8 py-4 font-medium"
            onPress={handleManualSave}
          >
            Save
          </Button>
        </div>
      )}
      {showCalendar && (
        <Button
          className="text-neutral-text flex items-center p-4 text-sm"
          onPress={() => setShowCalendar(false)}
        >
          <Icon icon={<ChevronLeftIcon />} />
          Back
        </Button>
      )}
    </Modal>
  )
}

type SnoozePreset = {
  key: "today-mid" | "today-last" | "tomorrow" | "this-week" | "next-week"
  label: string
  subLabel: string
  value: Date
}

export function useCurrentSnoozePresets(): SnoozePreset[] {
  const { instantAccount } = useAuth()

  const hours = instantAccount?.custom_work_hours ?? DEFAULT_WORKING_HOURS

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
          subLabel: format(midShift as Date, "ha"),
          value: midShift,
        }
      : null,
    showLatertTonight
      ? {
          key: "today-last",
          label: "Later tonight",
          subLabel: format(lastShift as Date, "ha"),
          value: lastShift as Date,
        }
      : null,
    {
      key: "tomorrow",
      label: "Tomorrow",
      subLabel: format(tomorrow, "eee ha"),
      value: tomorrow,
    },
    showThisWeek
      ? {
          key: "this-week",
          label: "This week",
          subLabel: format(thisWeek, "eee ha"),
          value: thisWeek,
        }
      : null,
    showNextWeek
      ? {
          key: "next-week",
          label: "Next week",
          subLabel: format(nextWeek, "eee ha"),
          value: nextWeek,
        }
      : null,
  ].filter((val) => val !== null) as SnoozePreset[]
}
