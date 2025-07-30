"use client"

import { AlarmClockIcon, ArchiveIcon, InboxIcon, LucideIcon, RefreshCwIcon } from "lucide-react"
import { useParams } from "next/navigation"
import { useMemo } from "react"
import { useTaskQuery } from "@/database/models/task"
import { TaskInboxState } from "@/database/models/task"
import { useRecurringTaskQuery } from "@/database/models/recurring-task"

export type InboxView = TaskInboxState | "recurring"

export const INBOX_VIEWS: Array<{ key: InboxView; title: string; Icon: LucideIcon }> = [
  { key: "open", title: "Open", Icon: InboxIcon },
  { key: "snoozed", title: "Snoozed", Icon: AlarmClockIcon },
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

export function useActiveTaskQuery(inboxId: string) {
  return useTaskQuery({
    $: {
      where: { "inbox.id": inboxId, "inbox_state": { $in: ["open", "snoozed"] } },
    },
  })
}

export function useArchivedTaskQuery(inboxId: string) {
  return useTaskQuery({
    $: {
      where: { "inbox.id": inboxId, "inbox_state": "archived" },
      order: { archive_date: "desc" },
      limit: 30,
    },
  })
}

// TODO: Figure out why counts aren't updating correctly
export function useCurrentInboxViewCounts(): Record<InboxView, number | null> {
  const { id: inboxId } = useCurrentInboxView()

  const { data: activeTasks } = useActiveTaskQuery(inboxId)

  const { data: archivedTasks } = useArchivedTaskQuery(inboxId)

  const { data: recurringTasks } = useRecurringTaskQuery({
    $: {
      where: { "inbox.id": inboxId, "is_archived": false },
    },
  })

  const result = useMemo(() => {
    return {
      open: activeTasks?.filter((task) => task.inbox_state === "open").length || 0,
      snoozed: activeTasks?.filter((task) => task.inbox_state === "snoozed").length || 0,
      archived: archivedTasks?.length || 0, // maxes out at 30 (display 29+)
      recurring: recurringTasks?.length || 0,
    }
  }, [activeTasks, archivedTasks, recurringTasks])

  return result
}
