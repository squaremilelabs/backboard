"use client"
import { isTextDropItem, useDragAndDrop } from "react-aria-components"
import { useState } from "react"
import { ArchiveIcon, Clock4Icon, InboxIcon, LucideIcon, RefreshCwIcon } from "lucide-react"
import { useParams } from "next/navigation"
import { TaskSnoozeModal } from "../task/task-snooze"
import { ListBox, ListBoxItem } from "~/smui/list-box/components"
import { Task, TaskUpdateManyParams, updateManyTasks } from "@/database/models/task"
import { cn } from "~/smui/utils"
import { TaskInboxState } from "@/database/models/task"
import { db } from "@/database/db"

export type InboxView = "open" | "snoozed" | "recurring" | "archived"

export const INBOX_VIEWS: Array<{ key: InboxView; title: string; Icon: LucideIcon }> = [
  { key: "open", title: "Open", Icon: InboxIcon },
  { key: "snoozed", title: "Snoozed", Icon: Clock4Icon },
  { key: "recurring", title: "Recurring", Icon: RefreshCwIcon },
  { key: "archived", title: "Archived", Icon: ArchiveIcon },
]

export function useCurrentInboxView() {
  const { id, view } = useParams<{ id: string; view?: string[] }>()
  let resolvedView: InboxView = "open"
  if (view) {
    const viewKey = view[0] as InboxView
    if (INBOX_VIEWS.some((v) => v.key === viewKey)) {
      resolvedView = viewKey
    }
  }
  return { id, view: resolvedView }
}

export const INBOX_VIEW_TO_STATE_MAP: Record<InboxView, TaskInboxState | null> = {
  open: "open",
  snoozed: "snoozed",
  archived: "archived",
  recurring: null,
}

export function useInboxViewCounts(): Record<InboxView, number | null> {
  const { id: inboxId } = useCurrentInboxView()

  const tasksQuery = db.useQuery({
    tasks: {
      $: {
        where: {
          "inbox.id": inboxId,
          "inbox_state": { $in: ["open", "snoozed"] },
        },
        fields: ["id", "inbox_state"],
      },
    },
  })

  const recurringTasksQuery = db.useQuery({
    recurring_tasks: {
      $: {
        where: {
          "inbox.id": inboxId,
          "is_archived": false,
        },
        fields: ["id"],
      },
    },
  })

  const openCount = tasksQuery.data?.tasks.filter((task) => task.inbox_state === "open").length || 0
  const snoozedCount =
    tasksQuery.data?.tasks.filter((task) => task.inbox_state === "snoozed").length || 0
  const recurringCount = recurringTasksQuery.data?.recurring_tasks.length || 0

  return {
    open: openCount,
    snoozed: snoozedCount,
    archived: null, // Archive count is not calculated here
    recurring: recurringCount,
  }
}

export function InboxViewTabs() {
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
            "flex items-center gap-8 px-24 py-8 text-sm",
            "not-data-selected:text-canvas-3",
            "not-data-selected:hover:bg-canvas-1",
            "data-selected:border-b-2",
            "data-selected:border-canvas-4",
            "data-selected:text-canvas-7",
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
                <span
                  className={cn("text-sm font-semibold", item.key === "open" && "text-primary-4")}
                >
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
