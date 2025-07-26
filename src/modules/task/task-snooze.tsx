"use client"
import { Calendar, CalendarCell, CalendarGrid, DateValue, Heading } from "react-aria-components"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { getLocalTimeZone, today } from "@internationalized/date"
import { Icon } from "~/smui/icon/components"
import { updateManyTasks } from "@/database/models/task"
import { Modal } from "~/smui/modal/components"
import { Button } from "~/smui/button/components"
import { cn } from "~/smui/utils"

// TODO: Create calendar component in SMUI
export function TaskSnoozeModal({
  isOpen,
  onOpenChange,
  pendingTaskIds,
}: {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  pendingTaskIds: string[]
}) {
  const title = `Snooze ${pendingTaskIds.length} Task${pendingTaskIds.length > 1 ? "s" : ""} to...`

  const handleDateSelect = (date: DateValue) => {
    updateManyTasks(pendingTaskIds, {
      inbox_state: "snoozed",
      snooze_date: date.toDate(getLocalTimeZone()).getTime(),
      archive_date: null,
    }).then(() => {
      onOpenChange(false)
    })
  }

  const handleSomedaySelect = () => {
    updateManyTasks(pendingTaskIds, {
      inbox_state: "snoozed",
      snooze_date: null,
      archive_date: null,
    }).then(() => {
      onOpenChange(false)
    })
  }

  return (
    <Modal
      isDismissable
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{
        overlay: [
          "fixed inset-0 z-60 h-dvh w-dvw",
          "flex flex-col items-center pt-[10dvh]",
          "bg-canvas-1/30 backdrop-blur-xs",
        ],
        modal: ["bg-canvas-0 border"],
        content: ["p-16", "flex flex-col gap-16", "w-350"],
      }}
    >
      <Heading slot="title" className="text-primary-4 text-lg font-medium">
        {title}
      </Heading>
      <Calendar
        minValue={today(getLocalTimeZone()).add({ days: 1 })}
        className="flex flex-col gap-16"
        onChange={handleDateSelect}
        autoFocus
      >
        <header className="flex items-center gap-16">
          <Button slot="previous" className="cursor-pointer p-8 hover:opacity-70">
            <Icon icon={<ChevronLeftIcon />} />
          </Button>
          <Heading className="grow text-center font-semibold" />
          <Button slot="next" className="cursor-pointer p-8 hover:opacity-70">
            <Icon icon={<ChevronRightIcon />} />
          </Button>
        </header>
        <CalendarGrid className="w-full">
          {(date) => (
            <CalendarCell
              date={date}
              className={cn(
                "flex size-40 items-center justify-center",
                "data-disabled:text-canvas-2",
                `not-data-disabled:hover:bg-primary-3 not-data-disabled:hover:text-primary-1
                not-data-disabled:cursor-pointer`,
                "data-selected:bg-primary-3 data-selected:text-primary-1"
              )}
            />
          )}
        </CalendarGrid>
      </Calendar>
      <Button
        onPress={handleSomedaySelect}
        className="text-canvas-3 hover:bg-primary-3 hover:text-primary-1 cursor-pointer border p-8"
      >
        Someday
      </Button>
    </Modal>
  )
}
