"use client"

import { startOfDay, subDays } from "date-fns"
import { RecurringTask } from "@/database/models/recurring-task"
import { Task, TaskStatus } from "@/database/models/task"
import { sortCurrentTasks, sortDoneTasks, sortSnoozedTasks } from "@/functions/sort-data"
import { useAuth } from "./use-auth"
import { useDBQuery } from "./use-db-query"

export type FetchedTask = Task & {
  scope: { id: string } | null
  recurring_task: RecurringTask
}

export function useTaskListQuery({ status, scopeId }: { status: TaskStatus; scopeId: string }) {
  const { account } = useAuth()

  const { scopes } = useDBQuery(
    "scopes",
    scopeId !== "root"
      ? {
          $: { where: { id: scopeId } },
        }
      : null
  )

  const scope = scopeId ? scopes?.[0] : null

  const { tasks: fetchedTasks, isLoading } = useDBQuery<FetchedTask>(
    "tasks",
    account
      ? {
          $: {
            where: {
              status,
              "owner.id": account.id,
              "scope.id": scopeId === "root" ? { $isNull: true } : scopeId,
              "status_time":
                status === "done" ? { $gte: startOfDay(subDays(new Date(), 5)) } : undefined,
            },
          },
          scope: { $: { fields: ["id"] } },
          recurring_task: {},
        }
      : null
  )

  let sortedTasks = [...(fetchedTasks ?? [])]

  if (status === "current") {
    let idOrder: string[] = []
    if (scope) {
      idOrder = scope.list_orders?.tasks ?? []
    } else {
      idOrder = account?.list_orders?.tasks ?? []
    }
    sortedTasks = sortCurrentTasks(sortedTasks, idOrder)
  }

  if (status === "snoozed") {
    sortedTasks = sortSnoozedTasks(sortedTasks)
  }

  if (status === "done") {
    sortedTasks = sortDoneTasks(sortedTasks)
  }

  return {
    tasks: sortedTasks,
    isLoading,
  }
}
