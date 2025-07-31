"use client"
import {
  AlarmClockIcon,
  CircleCheckBigIcon,
  CircleDashedIcon,
  LucideIcon,
  RefreshCwIcon,
} from "lucide-react"
import { useParams } from "next/navigation"
import { startOfDay, subDays } from "date-fns"
import { Task } from "@/database/models/task"
import { TaskInboxState } from "@/database/models/task"
import { RecurringTask } from "@/database/models/recurring-task"
import { Inbox, useInboxQuery } from "@/database/models/inbox"

export type InboxViewKey = TaskInboxState | "recurring"
export type InboxViewInfo = { key: InboxViewKey; title: string; Icon: LucideIcon }

export const INBOX_VIEWS: Array<InboxViewInfo> = [
  { key: "open", title: "To do", Icon: CircleDashedIcon },
  { key: "snoozed", title: "Snoozed", Icon: AlarmClockIcon },
  { key: "recurring", title: "Recurring", Icon: RefreshCwIcon },
  { key: "archived", title: "Done", Icon: CircleCheckBigIcon },
]

export function useCurrentInboxView() {
  const { id, view } = useParams<{ id: string; view?: string[] }>()
  let resolvedView: InboxViewKey = "open"
  if (view) {
    const viewKey = view[0] as InboxViewKey
    if (INBOX_VIEWS.some((v) => v.key === viewKey)) {
      resolvedView = viewKey
    }
  }
  return { id, view: resolvedView }
}

export function useCurrentInboxViewCounts(): Record<InboxViewKey, number | null> {
  const { id: inboxId } = useCurrentInboxView()

  const inboxQuery = useInboxQuery<Inbox & { tasks: Task[]; recurring_tasks: RecurringTask[] }>({
    $: { where: { id: inboxId } },
    tasks: {
      $: {
        where: {
          or: [
            { inbox_state: "open" },
            { inbox_state: "snoozed" },
            {
              inbox_state: "archived",
              archive_date: { $gte: startOfDay(subDays(new Date(), 3)).getTime() },
            },
          ],
        },
        fields: ["id", "inbox_state"],
      },
    },
    recurring_tasks: {
      $: {
        where: { is_archived: false },
        fields: ["id"],
      },
    },
  })

  const tasks = inboxQuery.data?.[0]?.tasks || []
  const recurringTasks = inboxQuery.data?.[0]?.recurring_tasks || []

  const openCount = tasks.filter((task) => task.inbox_state === "open").length || 0
  const snoozedCount = tasks.filter((task) => task.inbox_state === "snoozed").length || 0
  const archivedCount = tasks.filter((task) => task.inbox_state === "archived").length || 0
  const recurringCount = recurringTasks.length || 0

  return {
    open: openCount,
    snoozed: snoozedCount,
    archived: archivedCount,
    recurring: recurringCount,
  }
}
