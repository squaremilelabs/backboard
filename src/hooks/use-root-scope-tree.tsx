import { startOfDay, subDays } from "date-fns"
import { createContext, useContext, useMemo } from "react"
import { db } from "@/database/db-client"
import { Account } from "@/database/models/account"
import { Scope } from "@/database/models/scope"
import { Task, TaskStatus } from "@/database/models/task"
import { sortItemsByIdOrder } from "@/functions/sort-data"
import { useDBQuery } from "@/hooks/use-db-query"

type FetchedTaskInfo = Pick<Task, "id" | "status">
type FetchedScope = Scope & {
  parent_scope: { id: string } | null
  tasks: FetchedTaskInfo[]
}

type GenericTreeNode = {
  id: "root" | string // "root" for the root node; otherwise scope ID
  scope: Scope | null // null for the root (no scope); note that parent_scope and tasks should be dropped.
  path: string[] | null // array of scope IDs from the root down to this scope (excluding this scope) -- does not include null as the first entry
  children: ScopeTreeNode[]
  taskCounts: {
    direct: Record<TaskStatus, number> // tasks directly in this scope (not in descendant scopes)
    deep: Record<TaskStatus, number> // includes direct plus all descendant scopes recursively
  }
}

export type RootTreeNode = GenericTreeNode & {
  id: "root"
  scope: null
  path: null
}

export type ScopeTreeNode = GenericTreeNode & {
  id: string
  scope: Scope
  path: string[]
}

export type RootOrScopeTreeNode = RootTreeNode | ScopeTreeNode

export type UseRootScopeTreeOptions = {
  account: Account | null
  fetchInactiveScopes: boolean
}

export type UseRootScopeTreeResult = {
  rootNode: RootTreeNode
  nodeById: Map<string, ScopeTreeNode>
  orphans: FetchedScope[]
}

const emptyRootScopeTreeValue: UseRootScopeTreeResult = {
  rootNode: {
    id: "root",
    scope: null,
    path: null,
    children: [],
    taskCounts: {
      direct: { current: 0, snoozed: 0, done: 0 },
      deep: { current: 0, snoozed: 0, done: 0 },
    },
  },
  nodeById: new Map(),
  orphans: [],
}

const RootScopeTreeContext = createContext<UseRootScopeTreeResult>(emptyRootScopeTreeValue)

export function RootScopeTreeProvider({
  account,
  fetchInactiveScopes,
  children,
}: UseRootScopeTreeOptions & { children: React.ReactNode }) {
  const value = useRootScopeTreeContext({ account, fetchInactiveScopes })
  return <RootScopeTreeContext value={value}>{children}</RootScopeTreeContext>
}

export function useRootScopeTree() {
  return useContext(RootScopeTreeContext)
}

function useRootScopeTreeContext({
  account,
  fetchInactiveScopes,
}: {
  account: Account | null
  fetchInactiveScopes: boolean
}): UseRootScopeTreeResult {
  const taskStatusFilter = {
    or: [
      { status: { $in: ["current", "snoozed"] } },
      { status: "done", status_time: { $gte: startOfDay(subDays(new Date(), 5)) } },
    ],
  }

  const scopesQuery = useDBQuery<FetchedScope>(
    "scopes",
    account
      ? {
          $: {
            where: {
              "owner.id": account.id,
              "is_inactive": fetchInactiveScopes ? undefined : false,
            },
          },
          parent_scope: { $: { fields: ["id"] } },
          tasks: {
            $: {
              fields: ["id", "status"],
              where: {
                ...taskStatusFilter,
              },
            },
          },
        }
      : null
  )

  // To get tasks directly under "Main" (no scope)
  // Note: using `db.useQuery` directly because we're fetching partial task data (our `useDBQuery` utility expects full data objects)
  const rootTasksQuery = db.useQuery(
    account
      ? {
          tasks: {
            $: {
              fields: ["id", "status"],
              where: {
                "owner.id": account.id,
                "scope": { $isNull: true },
                ...taskStatusFilter,
              },
            },
          },
        }
      : null
  )

  return useMemo<UseRootScopeTreeResult>(() => {
    // Create local, stable views of fetched arrays inside the memo to avoid identity churn
    const scopesLocal = (scopesQuery.scopes ?? []) as FetchedScope[]
    const rootTasksLocal = (rootTasksQuery.data?.tasks ?? []) as FetchedTaskInfo[]

    // Helper: count tasks by status
    const countByStatus = (tasks: FetchedTaskInfo[]): Record<TaskStatus, number> => {
      const counts = {} as Record<TaskStatus, number>
      for (const t of tasks) {
        const s = t.status as TaskStatus
        counts[s] = (counts[s] ?? 0) + 1
      }
      return counts
    }

    // Helper: add counts from source into target (mutates target)
    const addCountsInto = (
      target: Record<TaskStatus, number>,
      source: Record<TaskStatus, number>
    ) => {
      for (const k in source as unknown as Record<string, number>) {
        const key = k as TaskStatus
        const val = (source as unknown as Record<string, number>)[k] ?? 0
        target[key] = (target[key] ?? 0) + val
      }
    }

    const cloneCounts = (src: Record<TaskStatus, number>): Record<TaskStatus, number> => {
      const out = {} as Record<TaskStatus, number>
      addCountsInto(out, src)
      return out
    }

    // Index fetched scopes for quick lookups
    const idSet = new Set(scopesLocal.map((s) => s.id))
    const parentIdMap = new Map<string, string | null>(
      scopesLocal.map((s) => [s.id, s.parent_scope?.id ?? null])
    )

    // Determine orphans: any scope whose ancestor chain includes a missing parent
    const orphanCache = new Map<string, boolean>()
    const isOrphan = (id: string, visiting: Set<string> = new Set()): boolean => {
      if (orphanCache.has(id)) return orphanCache.get(id) as boolean
      // Cycle detected in parent chain -> treat as orphan to exclude from tree
      if (visiting.has(id)) {
        orphanCache.set(id, true)
        return true
      }
      visiting.add(id)
      const parentId = parentIdMap.get(id) ?? null
      if (parentId === null) {
        orphanCache.set(id, false)
        visiting.delete(id)
        return false
      }
      if (!idSet.has(parentId)) {
        orphanCache.set(id, true)
        visiting.delete(id)
        return true
      }
      const res = isOrphan(parentId, visiting)
      orphanCache.set(id, res)
      visiting.delete(id)
      return res
    }

    const orphans = scopesLocal.filter((s) => isOrphan(s.id))
    const nonOrphans = scopesLocal.filter((s) => !isOrphan(s.id))

    // Precompute paths for non-orphans
    const pathCache = new Map<string, string[]>()
    const getPath = (id: string, visiting: Set<string> = new Set()): string[] => {
      if (pathCache.has(id)) return pathCache.get(id) as string[]
      // Guard against accidental cycles; return empty to break the chain
      if (visiting.has(id)) return []
      visiting.add(id)
      const parentId = parentIdMap.get(id) ?? null
      if (parentId === null) {
        pathCache.set(id, [])
        visiting.delete(id)
        return []
      }
      // Only called for non-orphans, so parentId must be in the set and resolvable
      const parentPath = getPath(parentId, visiting)
      const path = [...parentPath, parentId]
      pathCache.set(id, path)
      visiting.delete(id)
      return path
    }

    // Build node map with initial direct/deep counts and empty children
    const nodeMap = new Map<string, ScopeTreeNode>()
    for (const s of nonOrphans) {
      // Strip helper properties from scope (retain only Scope fields)
      const { parent_scope: _ps, tasks: _tasks, ...scopeRest } = s as FetchedScope
      const direct = countByStatus(s.tasks || [])
      const node: ScopeTreeNode = {
        id: s.id,
        scope: scopeRest as unknown as Scope,
        path: getPath(s.id),
        children: [],
        taskCounts: {
          direct,
          deep: cloneCounts(direct),
        },
      }
      nodeMap.set(s.id, node)
    }

    // Attach children (non-orphan relationships only)
    const rootChildren: ScopeTreeNode[] = []
    for (const s of nonOrphans) {
      const node = nodeMap.get(s.id) as ScopeTreeNode
      const parentId = parentIdMap.get(s.id) ?? null
      if (parentId === null) {
        rootChildren.push(node)
      } else {
        const parentNode = nodeMap.get(parentId)
        // parentNode must exist for non-orphans; also guard against cycle attachment
        if (parentNode && !parentNode.path.includes(node.id)) parentNode.children.push(node)
      }
    }

    // Sort children at every level based on list order arrays
    const sortSubtree = (node: ScopeTreeNode, visited: Set<string>) => {
      if (visited.has(node.id)) return
      visited.add(node.id)
      const idOrder = node.scope.list_orders?.scopes ?? []
      node.children = sortItemsByIdOrder({
        items: node.children,
        idOrder,
        missingIdsPosition: "end",
        sortMissingIds: (left, right) => {
          if (left.scope.is_inactive !== right.scope.is_inactive) {
            return left.scope.is_inactive ? 1 : -1
          }
          return (left.scope.created_at ?? 0) - (right.scope.created_at ?? 0)
        },
      })
      for (const child of node.children) sortSubtree(child, visited)
    }
    const sortedRootChildren = sortItemsByIdOrder({
      items: rootChildren,
      idOrder: account?.list_orders?.scopes ?? [],
      missingIdsPosition: "end",
      sortMissingIds: (left, right) => {
        if (left.scope.is_inactive !== right.scope.is_inactive) {
          return left.scope.is_inactive ? 1 : -1
        }
        return (left.scope.created_at ?? 0) - (right.scope.created_at ?? 0)
      },
    })
    for (const child of sortedRootChildren) sortSubtree(child, new Set<string>())

    // Post-order aggregation of deep counts
    const aggregateDeepCounts = (node: ScopeTreeNode, visited: Set<string>) => {
      if (visited.has(node.id)) return
      visited.add(node.id)
      for (const child of node.children) {
        aggregateDeepCounts(child, visited)
        addCountsInto(node.taskCounts.deep, child.taskCounts.deep)
      }
    }
    for (const child of sortedRootChildren) aggregateDeepCounts(child, new Set<string>())

    // Root node counts: include direct root tasks plus deep counts of root children
    const rootDirect = countByStatus(rootTasksLocal)
    const rootDeep = cloneCounts(rootDirect)
    for (const child of sortedRootChildren) {
      addCountsInto(rootDeep, child.taskCounts.deep)
    }

    const rootNode: RootTreeNode = {
      id: "root",
      scope: null,
      path: null,
      children: sortedRootChildren,
      taskCounts: {
        direct: rootDirect,
        deep: rootDeep,
      },
    }

    return { rootNode, nodeById: nodeMap, orphans }
  }, [scopesQuery.scopes, rootTasksQuery.data?.tasks, account?.list_orders?.scopes])
}
