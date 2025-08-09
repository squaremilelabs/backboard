"use client"
import { Calendar, CalendarCell, CalendarGrid, DateValue, Heading } from "react-aria-components"
import { AlarmClockIcon, ChevronLeftIcon, ChevronRightIcon, SunMoonIcon } from "lucide-react"
import { getLocalTimeZone, today } from "@internationalized/date"
import { Icon } from "~/smui/icon/components"
import { updateManyTasks } from "@/database/_models/task"
import { Button } from "~/smui/button/components"
import { cn } from "~/smui/utils"
import { Modal } from "~/smui/modal/components"
import { panel } from "@/common/components/class-names"

// TODO: Create calendar component in SMUI
export function TaskSnoozePicker({
  isOpen,
  onOpenChange,
  selectedTaskIds,
}: {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  selectedTaskIds: string[]
}) {
  const handleDateSelect = (date: DateValue) => {
    updateManyTasks(selectedTaskIds, {
      inbox_state: "snoozed",
      snooze_date: date.toDate(getLocalTimeZone()).getTime(),
      archive_date: null,
    }).then(() => {
      onOpenChange(false)
    })
  }

  const handleSomedaySelect = () => {
    updateManyTasks(selectedTaskIds, {
      inbox_state: "snoozed",
      snooze_date: null,
      archive_date: null,
    }).then(() => {
      onOpenChange(false)
    })
  }

  const { base, section } = panel()

  return (
    <Modal
      isDismissable
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      variants={{ size: "xs" }}
      classNames={{
        content: ["bg-base-bg border backdrop-blur-xl", "flex flex-col gap-8", base()],
      }}
    >
      <Heading
        slot="title"
        className={cn(section(), "flex items-center gap-8 p-4 px-8 font-medium")}
      >
        <Icon icon={<AlarmClockIcon />} />
        Snooze until...
      </Heading>
      <Calendar
        minValue={today(getLocalTimeZone()).add({ days: 1 })}
        className="bg-base-bg flex flex-col gap-4 rounded-sm p-2"
        onChange={handleDateSelect}
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
                "flex size-36 items-center justify-center",
                "data-disabled:text-neutral-muted-text/30",
                "not-data-disabled:hover:bg-primary-muted-bg",
                "not-data-disabled:hover:text-primary-muted-fg not-data-disabled:cursor-pointer",
                "data-selected:bg-primary-3 data-selected:text-primary-1"
              )}
            />
          )}
        </CalendarGrid>
      </Calendar>
      <Button
        onPress={handleSomedaySelect}
        variants={{ hover: "none" }}
        className={[
          section(),
          "flex items-center justify-center gap-8 p-8",
          "text-neutral-muted-text hover:text-base-text",
          "hover:bg-base-bg",
        ]}
      >
        <Icon icon={<SunMoonIcon />} />
        Someday
      </Button>
    </Modal>
  )
}
