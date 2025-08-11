"use client"
import {
  AlarmClockIcon,
  CircleCheckBigIcon,
  LucideIcon,
  PlayIcon,
  RefreshCwIcon,
} from "lucide-react"
import { useParams } from "next/navigation"
import { startOfDay, subDays } from "date-fns"
import { Task, TaskStatus } from "@/database/models/task"
import { useDBQuery } from "@/database/db-client"
import { Scope } from "@/database/models/scope"
import { RecurringTask } from "@/database/models/recurring-task"

export type ScopeViewKey = TaskStatus | "recurring"
export type ScopeViewInfo = { key: ScopeViewKey; title: string; Icon: LucideIcon }

export const SCOPE_VIEWS: Array<ScopeViewInfo> = [
  { key: "now", title: "Now", Icon: PlayIcon },
  { key: "later", title: "Later", Icon: AlarmClockIcon },
  { key: "recurring", title: "Recurring", Icon: RefreshCwIcon },
  { key: "done", title: "Done", Icon: CircleCheckBigIcon },
]

export function useCurrentScopeView() {
  const { id, view } = useParams<{ id: string; view?: string[] }>()
  let resolvedView: ScopeViewKey = "now"
  if (view) {
    const viewKey = view[0] as ScopeViewKey
    if (SCOPE_VIEWS.some((v) => v.key === viewKey)) {
      resolvedView = viewKey
    }
  }
  return { id, view: resolvedView }
}

export function useCurrentScopeViewCounts(): Record<ScopeViewKey, number | null> {
  const { id: scopeId } = useCurrentScopeView()

  const { scopes } = useDBQuery<
    Scope & { tasks: Task[]; recurring_tasks: RecurringTask[] },
    "scopes"
  >("scopes", {
    $: { where: { id: scopeId } },
    tasks: {
      $: {
        where: {
          or: [
            { status: { $in: ["now", "later"] } },
            {
              status: "done",
              status_time: { $gte: startOfDay(subDays(new Date(), 5)).getTime() },
            },
          ],
        },
        fields: ["id", "status"],
      },
    },
    recurring_tasks: {
      $: {
        where: { is_inactive: false },
        fields: ["id"],
      },
    },
  })

  const scope = scopes?.[0]

  const tasks = scope?.tasks || []
  const recurringTasks = scope?.recurring_tasks || []

  const nowCount = tasks.filter((task) => task.status === "now").length || null
  const laterCount = tasks.filter((task) => task.status === "later").length || null
  const doneCount = tasks.filter((task) => task.status === "done").length || null
  const recurringCount = recurringTasks.length || null

  return {
    now: nowCount,
    later: laterCount,
    done: doneCount,
    recurring: recurringCount,
  }
}
