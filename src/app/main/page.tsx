"use client"

import { useMemo } from "react"
import { useDBQuery } from "@/database/db-client"
import {
  constructSMUIDataTreeListItems,
  SMUIDataTreeList,
  SMUIDataTreeFlatListItem,
  SMUIDataTreeNestedListItem,
} from "@/smui/components/data-tree-list"
import { Scope, ScopeLinks } from "@/database/models/scope"
import { Task } from "@/database/models/task"

export default function MainPage() {
  return (
    <div>
      <TreeNestedExample />
      <div>---SPLIT---</div>
      <TreeFlatExample />
    </div>
  )
}

function TreeNestedExample() {
  const { scopes } = useDBQuery<Scope & Partial<ScopeLinks>, "scopes">("scopes", {
    $: {
      where: { is_inactive: false },
    },
    tasks: {
      $: {
        where: { status: "current" },
      },
    },
  })

  const items: Array<SMUIDataTreeNestedListItem<Scope | Task, "scope" | "task">> =
    scopes?.map((scope) => {
      const { tasks, ...baseScope } = scope
      return {
        id: scope.id,
        label: scope.title,
        kind: "scope",
        data: baseScope,
        items:
          tasks?.map((task) => ({
            id: task.id,
            label: task.title,
            kind: "task",
            data: task,
          })) ?? [],
      }
    }) ?? []

  return (
    <SMUIDataTreeList
      ariaLabel="nested"
      items={items}
      renderItemContent={(props) => props.data.title}
    />
  )
}

function TreeFlatExample() {
  const { scopes } = useDBQuery("scopes", {
    $: {
      where: { is_inactive: false },
    },
  })
  const { tasks } = useDBQuery<Task & { scope: { id: string } }, "tasks">("tasks", {
    $: {
      where: {
        "status": "current",
        "scope.is_inactive": false,
      },
    },
    scope: {
      $: {
        fields: ["id"],
      },
    },
  })

  const flatItems: Array<SMUIDataTreeFlatListItem<Scope | Task, "scope" | "task">> = useMemo(() => {
    return [
      ...(scopes?.map((scope) => ({
        id: scope.id,
        label: scope.title,
        kind: "scope" as const,
        data: scope,
        parentId: null,
      })) ?? []),
      ...(tasks?.map((task) => ({
        id: task.id,
        label: task.title,
        kind: "task" as const,
        data: task,
        parentId: task.scope.id,
      })) ?? []),
    ]
  }, [scopes, tasks])

  const nodes = useMemo(() => constructSMUIDataTreeListItems(flatItems), [flatItems])

  return (
    <SMUIDataTreeList
      ariaLabel="flat"
      items={nodes}
      renderItemContent={(props) => props.data.title}
    />
  )
}
