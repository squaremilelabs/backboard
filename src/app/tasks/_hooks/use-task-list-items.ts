import { startOfDay, subDays } from "date-fns"
import { useScopeQueryState, useStatusQueryState } from "./use-query-states"
import { useDBQuery } from "@/hooks/use-db-query"
import { useAuth } from "@/hooks/use-auth"
import { SMUIDataListItem } from "~/smui/components/data-list"
import { Task } from "@/database/models/task"

export function useTaskListItems(): { items: SMUIDataListItem<Task>[]; isLoading: boolean } {
  const { account } = useAuth()
  const [scopeId] = useScopeQueryState()
  const [status] = useStatusQueryState()

  const { tasks, isLoading } = useDBQuery(
    "tasks",
    account
      ? {
          $: {
            where: {
              and: [
                // Filter by scope
                scopeId
                  ? { "scope.id": scopeId }
                  : { "scope.id": { $isNull: true }, "owner.id": account.id },
                // Filter by status
                status === "current" ? { status: "current" } : {},
                status === "snoozed" ? { status: "snoozed" } : {},
                status === "done"
                  ? {
                      status: "done",
                      status_time: { $gte: startOfDay(subDays(new Date(), 5)) },
                    }
                  : {},
              ],
            },
          },
        }
      : null
  )

  const items: SMUIDataListItem<Task>[] =
    tasks?.map((t) => ({
      id: t.id,
      label: t.title || "(Untitled task)",
      data: t,
    })) || []

  return { items, isLoading }
}
