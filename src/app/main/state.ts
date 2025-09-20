"use client"

import { startOfDay, subDays } from "date-fns"
import { TreeData } from "react-stately"
import { useEffect, useMemo, useRef } from "react"
import { useSessionStorageUtility } from "@/common/utils/use-storage-utility"
import { db, useDBQuery } from "@/database/db-client"
import { Task, TaskStatus } from "@/database/models/task"
import { useAuth } from "@/modules/auth/use-auth"
import { parseScopeUpdateInput, Scope } from "@/database/models/scope"
import { RecurringTask } from "@/database/models/recurring-task"
import { ListOrders } from "@/database/models/_shared"

type ViewParams = {
  rootScopeId: string | null
  view: TaskStatus | "recurring"
  showInactive: boolean
  showEmptyScopes: boolean
}

const defaultViewParams: ViewParams = {
  rootScopeId: null,
  view: "current",
  showInactive: false,
  showEmptyScopes: true,
}

export function useViewParams() {
  const [viewParams, setViewParams] = useSessionStorageUtility<ViewParams>(
    "view-params",
    defaultViewParams
  )
  const setViewParam = (key: keyof ViewParams, value: ViewParams[typeof key]) => {
    setViewParams((prev) => ({ ...prev, [key]: value }))
  }
  const resetViewParams = () => setViewParams(defaultViewParams)
  return { viewParams, setViewParams, setViewParam, resetViewParams }
}

export type FetchedScope = Scope & { parent_scope: { id: string } | null }
export type FetchedTask = Task & {
  scope: { id: string } | null
  recurring_task: { id: string } | null
}
export type FetchedRecurringTask = RecurringTask & { scope: { id: string } | null }

export function useViewRawData() {
  const { instantAccount } = useAuth()
  const { viewParams } = useViewParams()

  // Fetch tasks
  const { tasks, isLoading: tasksIsLoading } = useDBQuery<FetchedTask, "tasks">(
    "tasks",
    instantAccount
      ? {
          $: {
            where: {
              "owner.id": instantAccount.id,
              ...(viewParams.showInactive ? {} : { "scope.is_inactive": false }),
              "or": [
                { status: { $in: ["current", "snoozed"] } },
                {
                  status: "done",
                  status_time: { $gte: startOfDay(subDays(new Date(), 5)) },
                },
              ],
            },
          },
          scope: { $: { fields: ["id"] } },
          recurring_task: { $: { fields: ["id"] } },
        }
      : null
  )

  // Fetch recurring tasks
  const { recurring_tasks: recurringTasks, isLoading: recurringTasksIsLoading } = useDBQuery<
    FetchedRecurringTask,
    "recurring_tasks"
  >(
    "recurring_tasks",
    instantAccount
      ? {
          $: {
            where: {
              "owner.id": instantAccount.id,
              ...(viewParams.showInactive ? {} : { "scope.is_inactive": false }),
              "is_inactive": viewParams.showInactive ? undefined : false,
            },
          },
          scope: { $: { fields: ["id"] } },
        }
      : null
  )
  // Fetch scopes
  const { scopes, isLoading: scopesIsLoading } = useDBQuery<FetchedScope, "scopes">(
    "scopes",
    instantAccount
      ? {
          $: {
            where: {
              "owner.id": instantAccount.id,
              "is_inactive": viewParams.showInactive ? undefined : false,
            },
          },
          parent_scope: {
            $: { fields: ["id"] },
          },
        }
      : null
  )

  const taskMap = new Map<string, FetchedTask>(tasks?.map((t) => [t.id, t]))
  const scopeMap = new Map<string, FetchedScope>(scopes?.map((s) => [s.id, s]))
  const recurringTaskMap = new Map<string, FetchedRecurringTask>(
    recurringTasks?.map((r) => [r.id, r])
  )

  return {
    isLoading: tasksIsLoading || scopesIsLoading || recurringTasksIsLoading,
    maps: {
      tasks: taskMap,
      scopes: scopeMap,
      recurringTasks: recurringTaskMap,
    },
    data: {
      tasks: tasks ?? [],
      recurringTasks: recurringTasks ?? [],
      scopes: scopes ?? [],
    },
  }
}

export type TreeItem = { id: string } & (
  | {
      kind: "task" | "recurring_task"
    }
  | {
      kind: "scope"
      items: TreeItem[]
    }
)

export function useTreeItems() {
  const { instantAccount } = useAuth()
  const { data, isLoading } = useViewRawData()
  const { viewParams } = useViewParams()
  const items = buildViewTree(data, instantAccount?.list_orders ?? null, viewParams)
  const key = useMemo(
    () => `${Math.random()}-${JSON.stringify(viewParams)}`,
    [isLoading, viewParams]
  )
  return {
    key,
    items,
    isLoading,
  }
}

export function useViewTreeState({ baseTree }: { baseTree: TreeData<TreeItem> }) {
  const { instantAccount } = useAuth()
  const { viewParams } = useViewParams()

  const getUniqueParentIds = (ids: (string | null)[]) => [
    ...new Set(
      ids.map((id) => {
        if (!id) return null
        const item = baseTree.getItem(id)
        return (item?.parentKey ?? null) as string | null
      })
    ),
  ]

  const saveListOrdersToDatabase = async (scopeIds: (string | null)[]) => {
    const txns: Parameters<typeof db.transact>[0] = []
    scopeIds.forEach((scopeId) => {
      // Handle account level update -- if the scopeId is null, it's the root list_orders on the account
      if (scopeId === null) {
        const rootListOrder = baseTree.items
          .filter((i) => !i.parentKey)
          .map((i) => ({ id: i.value.id, kind: i.value.kind }))
        const { data: accountUpdateData } = parseScopeUpdateInput({
          list_orders: { [viewParams.view]: rootListOrder },
        })
        txns.push(db.tx.accounts[instantAccount!.id].merge(accountUpdateData))
      }
      // Handle scope level update
      else {
        const scopeItem = baseTree.getItem(scopeId)
        if (scopeItem) {
          const scopeListOrder =
            scopeItem.children?.map((child) => ({ id: child.value.id, kind: child.value.kind })) ??
            []
          const { data: scopeUpdateData } = parseScopeUpdateInput({
            list_orders: { [viewParams.view]: scopeListOrder },
          })
          txns.push(db.tx.scopes[scopeId].merge(scopeUpdateData))
        }
      }
    })
    return db.transact(txns)
  }

  const moveInto = (
    targetScopeId: string,
    movedIds: string[],
    position: "start" | "end" = "start"
  ) => {
    // store a list of unique affected scopeIds _before_ the move operation to later persist to the DB
    const affectedScopeIds = getUniqueParentIds([...movedIds, targetScopeId])

    // perform the move operation
    const targetScopeItem = baseTree.getItem(targetScopeId)
    if (targetScopeItem) {
      const targetIndex = position === "start" ? 0 : (targetScopeItem.children?.length ?? 0)
      const movedIdsArray = Array.from(movedIds)
      movedIdsArray.forEach((movedId) => {
        baseTree.move(movedId, targetScopeId, targetIndex)
      })
    }

    // now, the baseTree items have the updated order
    saveListOrdersToDatabase(affectedScopeIds)
  }

  const moveBefore = (targetId: string, movedIds: Iterable<string>) => {
    const affectedScopeIds = getUniqueParentIds([...movedIds, targetId])
    baseTree.moveBefore(targetId, movedIds)
    saveListOrdersToDatabase(affectedScopeIds)
  }

  const moveAfter = (targetId: string, movedIds: Iterable<string>) => {
    const affectedScopeIds = getUniqueParentIds([...movedIds, targetId])
    baseTree.moveAfter(targetId, movedIds)
    saveListOrdersToDatabase(affectedScopeIds)
  }

  const remove = (...removedIds: string[]) => {
    const affectedScopeIds = getUniqueParentIds(removedIds)
    baseTree.remove(...removedIds)
    saveListOrdersToDatabase(affectedScopeIds)
  }

  return {
    items: baseTree.items,
    selectedKeys: baseTree.selectedKeys,
    moveInto,
    moveBefore,
    moveAfter,
    remove,
  }
}

function buildViewTree(
  data: ReturnType<typeof useViewRawData>["data"],
  rootListOrders: ListOrders | null,
  viewParams: ViewParams
): TreeItem[] {
  // apply filters
  // filter out tasks & recurring tasks
  const prefilteredTasks = data.tasks.filter((task) => {
    if (viewParams.view === "current") return task.status === "current"
    if (viewParams.view === "snoozed") return task.status === "snoozed"
    if (viewParams.view === "done") return task.status === "done"
    if (viewParams.view === "recurring") return false
    return false
  })

  const prefilteredRecurringTasks = data.recurringTasks.filter(() => {
    return viewParams.view === "recurring"
  })

  // Precompute maps for O(1) adjacency lookups instead of repeated filter passes
  const scopesById = new Map(data.scopes.map((s) => [s.id, s]))
  const scopesByParent = new Map<string | null, FetchedScope[]>()
  for (const s of data.scopes) {
    const pid = s.parent_scope?.id ?? null
    if (!scopesByParent.has(pid)) scopesByParent.set(pid, [])
    scopesByParent.get(pid)!.push(s)
  }
  const tasksByScope = new Map<string | null, FetchedTask[]>()
  for (const t of prefilteredTasks) {
    const sid = t.scope?.id ?? null
    if (!tasksByScope.has(sid)) tasksByScope.set(sid, [])
    tasksByScope.get(sid)!.push(t)
  }
  const recurringByScope = new Map<string | null, FetchedRecurringTask[]>()
  for (const r of prefilteredRecurringTasks) {
    const sid = r.scope?.id ?? null
    if (!recurringByScope.has(sid)) recurringByScope.set(sid, [])
    recurringByScope.get(sid)!.push(r)
  }

  const visited = new Set<string | null>()

  function buildScopeTree(scopeId: string | null): TreeItem[] {
    // Cycle guard: if scope already processed in current path, stop descent
    if (visited.has(scopeId)) return []
    visited.add(scopeId)

    const listOrders =
      (scopeId
        ? scopesById.get(scopeId)?.list_orders?.[viewParams.view]
        : rootListOrders?.[viewParams.view]) ?? []

    const childScopes = scopesByParent.get(scopeId) ?? []
    const childTasks = tasksByScope.get(scopeId) ?? []
    const childRecurringTasks = recurringByScope.get(scopeId) ?? []

    const combinedChildren = [...childScopes, ...childTasks, ...childRecurringTasks]
    const sortedChildren = sortItemsByIdOrderThenDefaultOrder(
      combinedChildren,
      listOrders,
      viewParams.view
    )

    const mappedChildren: TreeItem[] = []
    for (const child of sortedChildren) {
      if ("status" in child) {
        mappedChildren.push({ id: child.id, kind: "task" })
        continue
      }
      if ("recur_day_type" in child) {
        mappedChildren.push({ id: child.id, kind: "recurring_task" })
        continue
      }
      mappedChildren.push({
        id: child.id,
        kind: "scope",
        items: buildScopeTree(child.id),
      })
    }
    return mappedChildren
  }

  return buildScopeTree(viewParams.rootScopeId)
}

function sortItemsByIdOrderThenDefaultOrder(
  items: (FetchedScope | FetchedTask | FetchedRecurringTask)[],
  listOrder: { id: string; kind: "scope" | "task" | "recurring_task" }[],
  view: ViewParams["view"]
) {
  const defaultSorted = sortItemsByDefaultOrder(items, view)
  return sortItemsByListOrder(defaultSorted, listOrder)
}

function sortItemsByListOrder(
  items: (FetchedScope | FetchedTask | FetchedRecurringTask)[],
  listOrder: { id: string; kind: "scope" | "task" | "recurring_task" }[]
) {
  const indexed = items.map((item, originalIndex) => ({
    item,
    originalIndex,
    orderIndex: listOrder.findIndex((entry) => entry.id === item.id),
  }))

  indexed.sort((a, b) => {
    const aOrder = a.orderIndex === -1 ? Infinity : a.orderIndex
    const bOrder = b.orderIndex === -1 ? Infinity : b.orderIndex
    if (aOrder !== bOrder) return aOrder - bOrder
    // Preserve original order when both items are not in listOrder or when order ties.
    return a.originalIndex - b.originalIndex
  })

  return indexed.map((i) => i.item)
}

function sortItemsByDefaultOrder(
  items: (FetchedScope | FetchedTask | FetchedRecurringTask)[],
  view: ViewParams["view"]
): (FetchedScope | FetchedTask | FetchedRecurringTask)[] {
  type Item = FetchedScope | FetchedTask | FetchedRecurringTask
  const result: Item[] = [...items]

  // Type guards relying on structural differences between models.
  const isScope = (i: Item): i is FetchedScope => "parent_scope" in i
  const isTask = (i: Item): i is FetchedTask => "status" in i // Task has TaskStatus field
  const isRecurring = (i: Item): i is FetchedRecurringTask => !isScope(i) && !isTask(i)

  // Shared helpers
  const createdAt = (i: Item): number => i.created_at ?? 0
  const statusTime = (t: FetchedTask): number | null => {
    if (!t.status_time) return null
    return typeof t.status_time === "number" ? t.status_time : new Date(t.status_time).getTime()
  }
  const compareScopes = (a: FetchedScope, b: FetchedScope) => createdAt(a) - createdAt(b)

  if (view === "current") {
    result.sort((a, b) => {
      const aScope = isScope(a)
      const bScope = isScope(b)
      if (aScope && bScope) return compareScopes(a, b)
      if (aScope && !bScope) return -1
      if (!aScope && bScope) return 1
      // Both tasks (recurring excluded in this view upstream, but guard anyway)
      if (isTask(a) && isTask(b)) {
        const aStatus = statusTime(a)
        const bStatus = statusTime(b)
        if (aStatus !== bStatus) {
          if (aStatus === null) return 1
          if (bStatus === null) return -1
          return aStatus - bStatus
        }
        return createdAt(a) - createdAt(b)
      }
      return 0
    })
    return result
  }

  if (view === "snoozed") {
    result.sort((a, b) => {
      const aScope = isScope(a)
      const bScope = isScope(b)
      if (aScope && bScope) return compareScopes(a, b)
      if (aScope && !bScope) return -1
      if (!aScope && bScope) return 1
      if (isTask(a) && isTask(b)) {
        const aStatus = statusTime(a)
        const bStatus = statusTime(b)
        if (aStatus !== bStatus) {
          if (aStatus === null) return 1 // nulls last
          if (bStatus === null) return -1
          return aStatus - bStatus
        }
        return createdAt(a) - createdAt(b)
      }
      return 0
    })
    return result
  }

  if (view === "done") {
    result.sort((a, b) => {
      const aScope = isScope(a)
      const bScope = isScope(b)
      if (aScope && bScope) return compareScopes(a, b)
      if (aScope && !bScope) return -1
      if (!aScope && bScope) return 1
      if (isTask(a) && isTask(b)) {
        const aStatus = statusTime(a)
        const bStatus = statusTime(b)
        if (aStatus !== bStatus) {
          if (aStatus === null) return 1 // treat null as old -> push down
          if (bStatus === null) return -1
          return bStatus - aStatus // DESC
        }
        return createdAt(b) - createdAt(a) // created_at DESC
      }
      return 0
    })
    return result
  }

  if (view === "recurring") {
    result.sort((a, b) => {
      const aScope = isScope(a)
      const bScope = isScope(b)
      if (aScope && bScope) return compareScopes(a, b)
      if (aScope && !bScope) return -1
      if (!aScope && bScope) return 1
      // Both recurring tasks (tasks filtered out upstream in this view)
      if (isRecurring(a) && isRecurring(b)) {
        return createdAt(a) - createdAt(b)
      }
      return 0
    })
    return result
  }

  // Fallback (shouldn't normally hit unless a new view mode is added without updating this function)
  return result
}
