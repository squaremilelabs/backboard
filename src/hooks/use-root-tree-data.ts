"use client"

/**
 * Hook: useRootTreeData
 * Responsibility:
 *  - Build a complete, unsorted, view-agnostic hierarchical representation (a rooted forest collapsed under a synthetic root) of
 *    scopes, tasks (partitioned by status), and recurring tasks for the current account.
 *  - Provide fast O(1) getters to retrieve a subtree by scope id, and to retrieve the ancestor path (breadcrumbs).
 *  - Pre-compute fully recursive aggregate counts (tasks by status + total, rtasks) for each scope node.
 *  - Remain free of any UI oriented sorting, filtering (beyond what the underlying list hook already applied), or SMUI shapes.
 *
 * Clarified Contract (per user responses):
 *  - Counts are fully recursive (include descendants of all nested scopes).
 *  - Recurring tasks are not partitioned; they have no status buckets (inactive vs active gating handled upstream by fetchInactiveData flag).
 *  - Task statuses are a fixed enum: current | snoozed | done (guaranteed by model/query) – no defensive bucket needed.
 *  - getScopePathByScopeId(null) returns [] (empty array). For a given scope id it returns its ancestor chain (excluding the scope itself),
 *    ordered from highest ancestor down to the immediate parent, enabling breadcrumb + separate header using the scope itself.
 *  - Root subtree: represented by a RootTreeScope with scopeId=null, scope=null, whose children.scopes are the top-level scopes and whose
 *    children.tasks / children.rtasks are the orphan tasks / recurring tasks lacking a parent scope.
 *  - Ordering: Arrays preserve snapshot (query) order; later UI layer applies persisted ordering (scopes + current tasks) / default sorters.
 *  - Performance target: <= ~100 tasks typical (30–50 common). A single DFS/recursive build is acceptable; no incremental diffing required.
 *  - Query object identity stability is assumed; standard useMemo dependency on source arrays is sufficient.
 */

import { useMemo } from "react"
import { useRootListData } from "./use-root-list-data"
import { useAuth } from "./use-auth"
import type {
  RootTreeScope,
  UseRootTreeDataResult,
  ScopeItemData,
  TaskItemData,
  RtaskItemData,
} from "@/tokens/tree-list-data"

export function useRootTreeData({
  fetchInactiveData,
}: { fetchInactiveData?: boolean } = {}): UseRootTreeDataResult {
  const { account } = useAuth()
  const { data } = useRootListData({ fetchInactiveData })

  const result = useMemo<UseRootTreeDataResult>(() => {
    if (!account) {
      return {
        getTreeDataByScopeId: () => null,
        getScopePathByScopeId: () => [],
      }
    }

    const scopes: ScopeItemData[] = data.scopes || []
    const tasks: TaskItemData[] = data.tasks || []
    const rtasks: RtaskItemData[] = data.rtasks || []

    // Group scopes by parent scope id
    const scopesByParent = new Map<string | null, ScopeItemData[]>()
    for (const s of scopes) {
      const key = s.parent_scope?.id ?? null
      if (!scopesByParent.has(key)) scopesByParent.set(key, [])
      scopesByParent.get(key)!.push(s)
    }

    // Group tasks by scope id (null => root/orphan)
    const tasksByScope = new Map<string | null, TaskItemData[]>()
    for (const t of tasks) {
      const key = t.scope?.id ?? null
      if (!tasksByScope.has(key)) tasksByScope.set(key, [])
      tasksByScope.get(key)!.push(t)
    }

    // Group recurring tasks by scope id
    const rtasksByScope = new Map<string | null, RtaskItemData[]>()
    for (const rt of rtasks) {
      const key = rt.scope?.id ?? null
      if (!rtasksByScope.has(key)) rtasksByScope.set(key, [])
      rtasksByScope.get(key)!.push(rt)
    }

    // Index to allow O(1) subtree retrieval after build
    const scopeTreeById = new Map<string, RootTreeScope>()

    // Recursive builder
    const buildScopeNode = (scope: ScopeItemData | null): RootTreeScope => {
      const scopeId = scope?.id ?? null
      const childScopesRaw = scopesByParent.get(scopeId) ?? []
      const childScopeNodes = childScopesRaw.map((cs) => buildScopeNode(cs))

      const allTasks = tasksByScope.get(scopeId) ?? []
      const tasksPartitioned = {
        current: allTasks.filter((t) => t.status === "current"),
        snoozed: allTasks.filter((t) => t.status === "snoozed"),
        done: allTasks.filter((t) => t.status === "done"),
      }
      const scopeRtasks = rtasksByScope.get(scopeId) ?? []

      const node: RootTreeScope = {
        scopeId,
        scope,
        parentScopeId: scope?.parent_scope?.id ?? null,
        children: {
          scopes: childScopeNodes,
          tasks: tasksPartitioned,
          rtasks: scopeRtasks,
        },
        counts: {
          tasks: { current: 0, snoozed: 0, done: 0, total: 0 },
          rtasks: 0,
        },
      }

      // Aggregate counts: own + children recursively
      let current = tasksPartitioned.current.length
      let snoozed = tasksPartitioned.snoozed.length
      let done = tasksPartitioned.done.length
      let rtaskCount = scopeRtasks.length
      for (const child of childScopeNodes) {
        current += child.counts.tasks.current
        snoozed += child.counts.tasks.snoozed
        done += child.counts.tasks.done
        rtaskCount += child.counts.rtasks
      }
      node.counts.tasks.current = current
      node.counts.tasks.snoozed = snoozed
      node.counts.tasks.done = done
      node.counts.tasks.total = current + snoozed + done
      node.counts.rtasks = rtaskCount

      if (scope) scopeTreeById.set(scope.id, node)
      return node
    }

    const rootNode = buildScopeNode(null)

    // Produce ancestor path (excluding the scope itself) for breadcrumbs
    const getScopePathByScopeId = (scopeId: string | null): ScopeItemData[] => {
      if (scopeId === null) return []
      const node = scopeTreeById.get(scopeId)
      if (!node) return []
      const lineage: ScopeItemData[] = []
      let cursor: RootTreeScope | undefined | null = node
      while (cursor && cursor.parentScopeId) {
        const parent = scopeTreeById.get(cursor.parentScopeId)
        if (!parent || !parent.scope) break
        lineage.push(parent.scope)
        cursor = parent
      }
      lineage.reverse()
      return lineage
    }

    const getTreeDataByScopeId = (scopeId: string | null): RootTreeScope | null => {
      if (scopeId === null) return rootNode
      return scopeTreeById.get(scopeId) || null
    }

    return { getTreeDataByScopeId, getScopePathByScopeId }
  }, [account, data.scopes, data.tasks, data.rtasks])

  return result
}
