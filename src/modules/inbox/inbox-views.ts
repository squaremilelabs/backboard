import { ArchiveIcon, Clock4Icon, InboxIcon, LucideIcon, RefreshCwIcon } from "lucide-react"
import { useParams } from "next/navigation"
import { TaskInboxState } from "@/database/models/task"
import { db } from "@/database/db"

export type InboxView = "open" | "snoozed" | "recurring" | "archived"

export const INBOX_VIEWS: Array<{ key: InboxView; title: string; Icon: LucideIcon }> = [
  { key: "open", title: "Open", Icon: InboxIcon },
  { key: "snoozed", title: "Snoozed", Icon: Clock4Icon },
  { key: "recurring", title: "Recurring", Icon: RefreshCwIcon },
  { key: "archived", title: "Archive", Icon: ArchiveIcon },
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
          inbox_id: inboxId,
          is_archived: false,
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
