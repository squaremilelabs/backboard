"use client"
import { useDragAndDrop } from "react-aria-components"
import { useState } from "react"
import { INBOX_VIEWS, useCurrentInboxView, useCurrentInboxViewCounts } from "../use-inbox-view"
import { InboxViewTab } from "./tab"
import { ListBox } from "~/smui/list-box/components"
import { useInboxQuery } from "@/database/_models/inbox"
import { processDropItems } from "@/common/utils/list-utils"
import { Task, updateManyTasks } from "@/database/_models/task"
import { TaskSnoozePicker } from "@/modules/task/task-actions/task-snooze"

export function InboxViewTabs({ inboxId }: { inboxId: string }) {
  const inboxQuery = useInboxQuery(inboxId ? { $: { where: { id: inboxId }, first: 1 } } : null)
  const inbox = inboxQuery.data?.[0]

  const { view: currentView } = useCurrentInboxView()
  const counts = useCurrentInboxViewCounts()

  const [snoozeModalOpen, setSnoozeModalOpen] = useState(false)
  const [snoozingTaskIds, setSnoozingTaskIds] = useState<string[]>([])

  const { dragAndDropHooks } = useDragAndDrop({
    acceptedDragTypes: ["db/task"],
    shouldAcceptItemDrop: (e, types) => {
      if (e.key === "recurring") return false
      if (e.key === currentView) return false
      if (types.has("db/task")) return true
      return false
    },
    onItemDrop: async (e) => {
      const tasks = await processDropItems<Task>(e.items, "db/task")
      const taskIds = tasks.map((task) => task.id)
      if (e.target.key === "open") {
        updateManyTasks(taskIds, {
          inbox_state: "open",
          snooze_date: null,
          archive_date: null,
        })
      }
      if (e.target.key === "archived") {
        updateManyTasks(taskIds, {
          inbox_state: "archived",
          snooze_date: null,
          archive_date: new Date().getTime(),
        })
      }
      if (e.target.key === "snoozed") {
        setSnoozingTaskIds(taskIds)
        setSnoozeModalOpen(true)
      }
    },
  })

  return (
    <>
      <ListBox
        aria-label="Inbox Views"
        orientation="horizontal"
        dragAndDropHooks={dragAndDropHooks}
        items={INBOX_VIEWS}
        dependencies={[inbox, counts, currentView]}
        selectedKeys={[currentView]}
        selectionMode="single"
        classNames={{
          base: ["max-w-full overflow-x-auto p-2", "flex items-center gap-4 min-w-fit"],
        }}
      >
        {(view, classNames) => {
          return (
            <InboxViewTab
              inboxId={inbox?.id}
              view={view}
              count={counts[view.key] ?? null}
              className={classNames.item}
            />
          )
        }}
      </ListBox>
      <TaskSnoozePicker
        isOpen={snoozeModalOpen}
        onOpenChange={setSnoozeModalOpen}
        selectedTaskIds={snoozingTaskIds}
      />
    </>
  )
}
