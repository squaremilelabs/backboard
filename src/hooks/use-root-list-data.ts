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
import { useDBQuery } from "./use-db-query"
import { RtaskItemData, ScopeItemData, TaskItemData } from "@/tokens/tree-list-data"

export function useRootListData(options?: { fetchInactiveData?: boolean }) {
  const { fetchInactiveData } = options || {}
  const { account } = useAuth()

  const {
    scopes,
    isLoading: scopesLoading,
    error: scopesError,
  } = useDBQuery<ScopeItemData>(
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
  } = useDBQuery<TaskItemData>(
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
  } = useDBQuery<RtaskItemData>(
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

  const scopesByScopeId = useMemo(() => {
    const map = new Map<string | null, ScopeItemData[]>()
    for (const s of scopes || []) {
      const key = s.parent_scope?.id ?? null
      const arr = map.get(key)
      if (arr) arr.push(s)
      else map.set(key, [s])
    }
    return map
  }, [scopes])

  const tasksByScopeId = useMemo(() => {
    const map = new Map<string | null, TaskItemData[]>()
    for (const t of tasks || []) {
      const key = t.scope?.id ?? null
      const arr = map.get(key)
      if (arr) arr.push(t)
      else map.set(key, [t])
    }
    return map
  }, [tasks])

  const rtasksByScopeId = useMemo(() => {
    const map = new Map<string | null, RtaskItemData[]>()
    for (const rt of rtasks || []) {
      const key = rt.scope?.id ?? null
      const arr = map.get(key)
      if (arr) arr.push(rt)
      else map.set(key, [rt])
    }
    return map
  }, [rtasks])

  const isLoading = scopesLoading || tasksLoading || rtasksLoading

  const errors = [
    scopesError && { entity: "scopes", error: scopesError.message },
    tasksError && { entity: "tasks", error: tasksError.message },
    rtasksError && { entity: "recurring_tasks", error: rtasksError.message },
  ].filter(Boolean)

  return {
    data: { scopes, tasks, rtasks },
    maps: { scopesById, tasksById, rtasksById, scopesByScopeId, tasksByScopeId, rtasksByScopeId },
    isLoading,
    errors: errors.length ? errors : null,
  }
}
