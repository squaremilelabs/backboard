import { ArchiveIcon, Clock4Icon, InboxIcon, LucideIcon, RefreshCwIcon } from "lucide-react"
import { useParams } from "next/navigation"
import { TaskInboxState } from "@/database/models/task"

export type InboxView = "open" | "snoozed" | "recurring" | "archive"

export const INBOX_VIEWS: Array<{ key: InboxView; title: string; Icon: LucideIcon }> = [
  { key: "open", title: "Open", Icon: InboxIcon },
  { key: "snoozed", title: "Snoozed", Icon: Clock4Icon },
  { key: "archive", title: "Archive", Icon: ArchiveIcon },
  { key: "recurring", title: "Recurring", Icon: RefreshCwIcon },
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
  archive: "archived",
  recurring: null,
}
