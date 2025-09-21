"use client"
import { startOfDay, subDays } from "date-fns"
import { useMemo } from "react"
import { useAuth } from "./use-auth"
import { useDBQuery } from "@/database/db-client"
import { RecurringTaskListItemData, ScopeListItemData, TaskListItemData } from "@/types/data"

export function useRootListData({ fetchInactiveData }: { fetchInactiveData?: boolean }) {
  const { account } = useAuth()

  const {
    scopes,
    isLoading: scopesLoading,
    error: scopesError,
  } = useDBQuery<ScopeListItemData>(
    "scopes",
    account
      ? {
          $: {
            where: {
              "owner.id": account.id,
              "is_inactive": fetchInactiveData ? undefined : false,
            },
          },
          parent_scope: { $: { fields: ["id"] } },
        }
      : null
  )

  const {
    tasks,
    isLoading: tasksLoading,
    error: tasksError,
  } = useDBQuery<TaskListItemData>(
    "tasks",
    account
      ? {
          $: {
            where: {
              "owner.id": account.id,
              "or": [
                { status: { $in: ["current", "snoozed"] } },
                { status: "done", status_time: { $gte: startOfDay(subDays(new Date(), 5)) } },
              ],
              ...(!fetchInactiveData && { "scope.is_inactive": false }),
            },
          },
          scope: { $: { fields: ["id"] } },
          recurring_task: { $: { fields: ["id"] } },
        }
      : null
  )

  const {
    recurring_tasks: rtasks,
    isLoading: rtasksLoading,
    error: rtasksError,
  } = useDBQuery<RecurringTaskListItemData>(
    "recurring_tasks",
    account
      ? {
          $: {
            where: {
              "owner.id": account.id,
              "is_inactive": fetchInactiveData ? undefined : false,
              ...(!fetchInactiveData && { "scope.is_inactive": false }),
            },
          },
          scope: { $: { fields: ["id"] } },
        }
      : null
  )

  const scopesById = useMemo(() => new Map(scopes?.map((s) => [s.id, s])), [scopes])
  const tasksById = useMemo(() => new Map(tasks?.map((t) => [t.id, t])), [tasks])
  const rtasksById = useMemo(() => new Map(rtasks?.map((rt) => [rt.id, rt])), [rtasks])

  const scopesByScopeId = useMemo(
    () => new Map(scopes?.map((s) => [s.parent_scope?.id ?? null, s])),
    [scopes]
  )
  const tasksByScopeId = useMemo(
    () => new Map(tasks?.map((t) => [t.scope?.id ?? null, t])),
    [tasks]
  )
  const rtasksByScopeId = useMemo(
    () => new Map(rtasks?.map((rt) => [rt.scope?.id ?? null, rt])),
    [rtasks]
  )

  const isLoading = scopesLoading || tasksLoading || rtasksLoading

  const errors = [
    scopesError && { data: "scopes", error: scopesError },
    tasksError && { data: "tasks", error: tasksError },
    rtasksError && { data: "recurring_tasks", error: rtasksError },
  ].filter(Boolean)

  return {
    data: { scopes, tasks, rtasks },
    maps: { scopesById, tasksById, rtasksById, scopesByScopeId, tasksByScopeId, rtasksByScopeId },
    isLoading,
    errors: errors.length ? errors : null,
  }
}
