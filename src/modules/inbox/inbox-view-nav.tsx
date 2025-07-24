"use client"
import {
  Calendar,
  CalendarCell,
  CalendarGrid,
  DateValue,
  Heading,
  isTextDropItem,
  useDragAndDrop,
} from "react-aria-components"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { getLocalTimeZone, today } from "@internationalized/date"
import { useState } from "react"
import {
  INBOX_VIEW_TO_STATE_MAP,
  INBOX_VIEWS,
  InboxView,
  useCurrentInboxView,
  useInboxViewCounts,
} from "./inbox-views"
import { Icon } from "~/smui/icon/components"
import { ListBox, ListBoxItem } from "~/smui/list-box/components"
import { Task, TaskUpdateManyParams, updateManyTasks } from "@/database/models/task"
import { Modal } from "~/smui/modal/components"
import { Button } from "~/smui/button/components"
import { cn } from "~/smui/utils"

export function InboxViewNav() {
  const currentView = useCurrentInboxView()
  const viewCounts = useInboxViewCounts()

  const [snoozeModalOpen, setSnoozeModalOpen] = useState(false)
  const [pendingTaskIds, setPendingTaskIds] = useState<string[]>([])

  const { dragAndDropHooks } = useDragAndDrop({
    acceptedDragTypes: ["data-task"],
    shouldAcceptItemDrop: (target) => {
      return target.key !== "recurring"
    },
    onItemDrop: async (e) => {
      const viewKey = e.target.key as InboxView
      const tasks = await Promise.all<Task>(
        e.items.filter(isTextDropItem).map(async (item) => {
          return JSON.parse(await item.getText("data-task"))
        })
      )
      const inboxState = INBOX_VIEW_TO_STATE_MAP[viewKey]
      let updateData: TaskUpdateManyParams = {}
      if (inboxState === "open" || inboxState === "archived") {
        updateData = {
          inbox_state: inboxState,
          archive_date: inboxState === "archived" ? new Date().getTime() : null,
          snooze_date: null,
        }
        updateManyTasks(
          tasks.map((task) => task.id),
          updateData
        )
      }
      if (inboxState === "snoozed") {
        setPendingTaskIds(tasks.map((task) => task.id))
        setSnoozeModalOpen(true)
      }
    },
  })

  return (
    <>
      <ListBox
        aria-label="Inbox View Navigation"
        orientation="horizontal"
        items={INBOX_VIEWS}
        selectionMode="single"
        selectedKeys={[currentView.view]}
        dependencies={[currentView]}
        dragAndDropHooks={dragAndDropHooks}
        classNames={{
          base: ["flex flex-row w-full items-center border-b"],
          item: [
            "flex items-center gap-8 px-24 py-4",
            "not-data-selected:text-canvas-3",
            "not-data-selected:hover:bg-canvas-1",
            "data-selected:border-b-2",
            "data-selected:border-canvas-4",
            "data-selected:text-canvas-6",
            "data-selected:font-medium",
            "data-drop-target:outline-2",
          ],
        }}
      >
        {(item, classNames) => {
          return (
            <ListBoxItem
              id={item.key}
              className={classNames.item}
              textValue={item.title}
              href={`/inbox/${currentView.id}/${item.key}`}
            >
              <p>{item.title}</p>
              {!!viewCounts[item.key] && (
                <span className={cn("text-sm font-semibold", item.key === "open" && "text-primary-4")}>
                  {viewCounts[item.key]}
                </span>
              )}
            </ListBoxItem>
          )
        }}
      </ListBox>
      <TaskSnoozeModal
        isOpen={snoozeModalOpen}
        onOpenChange={setSnoozeModalOpen}
        pendingTaskIds={pendingTaskIds}
      />
    </>
  )
}

// TODO: Create calendar component in SMUI & move to own file
function TaskSnoozeModal({
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
