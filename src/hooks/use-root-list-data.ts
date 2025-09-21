"use client"
/**
 * Hook: useRootListData
 * Purpose:
 *  - Fetch the canonical, flat (non-hierarchical) lists of scopes, tasks, and recurring tasks for the current Account.
 *  - Provide precomputed lookup Maps to accelerate higher-level tree construction & drag-and-drop logic.
 * Responsibilities:
 *  - Execute three parallel InstantDB queries (scopes, tasks, recurring_tasks) with minimal field selections for related links.
 *  - Apply coarse filtering (account ownership, inactive flag gating, recent done window, limited status set) early to reduce downstream work.
 *  - Expose multi-map style indices keyed by parent scope (or null for root) for O(1) grouping in tree builders.
 * Not In Scope:
 *  - Fine-grained status/list view filtering (handled in `useViewTreeData`).
 *  - Ordering resolution (also handled later). We intentionally return arrays in raw snapshot order.
 *  - Mutations or derived structural transformations (pure data fetch + indexing only).
 * Handling Root / Orphan Entities:
 *  - Tasks and recurring tasks with no `scope` link (null) are treated as root-level (Map key `null`).
 *  - We currently cannot express a filter for "missing relation OR (relation predicate)" due to InstantDB limitation (see TODO comments).
 * Query Nuances & Limitations:
 *  - The commented TODO blocks show intended future server-side filtering for orphan detection once supported.
 *  - Done tasks are time-window constrained (last 5 days) to cap payload size.
 * Reactive Behavior:
 *  - All returned arrays/Maps are regenerated on data change; callers should treat them as immutable snapshots.
 *  - useMemo boundaries ensure Map identity only changes when underlying source arrays change.
 * Extension Guidance:
 *  - Adding new entity types? Mirror the pattern: query + flat array + id map + parent grouping map.
 *  - If adding expensive computed fields, prefer a separate processing hook layered above this one, to keep fetch concerns isolated.
 *  - Maintain symmetry in naming: `<plural>ById` for id map, `<plural>ByScopeId` for parent grouping.
 * Error Handling Strategy:
 *  - Collects individual query errors into a consolidated array `{ data, error }` for flexible UI reporting.
 *  - Returns `errors: null` when all succeeded to simplify consumer checks.
 * Performance Considerations:
 *  - For very large datasets, consider server-side pagination or status partition queries; current approach assumes modest list sizes.
 */
import { startOfDay, subDays } from "date-fns"
import { useMemo } from "react"
import { useAuth } from "./use-auth"
import { useDBQuery } from "@/database/db-client"
import { Scope } from "@/database/models/scope"
import { Task } from "@/database/models/task"
import { RecurringTask } from "@/database/models/recurring-task"

export type ScopeListItemData = Scope & { parent_scope: { id: string } | null }
export type TaskListItemData = Task & {
  scope: { id: string } | null
  recurring_task: { id: string } | null
}
export type RecurringTaskListItemData = RecurringTask & { scope: { id: string } | null }

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
              and: [
                { "owner.id": account.id },
                {
                  or: [
                    { status: { $in: ["current", "snoozed"] } },
                    { status: "done", status_time: { $gte: startOfDay(subDays(new Date(), 5)) } },
                  ],
                },
                // Either no scope or match fetch inactive filter if scoped
                {
                  or: [
                    { "scope.id": { $isNull: true } },
                    { ...(!fetchInactiveData && { "scope.is_inactive": false }) },
                  ],
                },
              ],
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
              // Either no scope or match fetch inactive filter if scoped
              "or": [
                { "scope.id": { $isNull: true } },
                { ...(!fetchInactiveData && { "scope.is_inactive": false }) },
              ],
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
