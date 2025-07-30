"use client"

import { ArchiveIcon, Clock4Icon, InboxIcon, LucideIcon, RefreshCwIcon } from "lucide-react"
import { useParams } from "next/navigation"
import { useTaskQuery } from "@/database/models/task"
import { TaskInboxState } from "@/database/models/task"
import { useRecurringTaskQuery } from "@/database/models/recurring-task"

export type InboxView = TaskInboxState | "recurring"

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

export function useInboxViewCounts(
  inboxId: string | null | undefined
): Record<InboxView, number | null> {
  const { data: activeTasks } = useTaskQuery(
    inboxId
      ? {
          $: {
            where: { "inbox.id": inboxId, "inbox_state": { $in: ["open", "snoozed"] } },
            fields: ["id", "inbox_state"],
          },
        }
      : null
  )

  const { data: archivedTasks } = useTaskQuery(
    inboxId
      ? {
          $: {
            where: { "inbox.id": inboxId, "inbox_state": "archived" },
            order: { archive_date: "desc" },
            fields: ["id"],
            limit: 30,
          },
        }
      : null
  )

  const { data: recurringTasks } = useRecurringTaskQuery(
    inboxId
      ? {
          $: {
            where: { "inbox.id": inboxId, "is_archived": false },
            fields: ["id"],
          },
        }
      : null
  )

  const openCount = activeTasks?.filter((task) => task.inbox_state === "open").length || 0
  const snoozedCount = activeTasks?.filter((task) => task.inbox_state === "snoozed").length || 0
  const archivedCount = archivedTasks?.length || 0
  const recurringCount = recurringTasks?.length || 0

  return {
    open: openCount,
    snoozed: snoozedCount,
    archived: archivedCount, // maxes out at 30 (display 29+)
    recurring: recurringCount,
  }
}
