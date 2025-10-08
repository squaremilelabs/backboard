"use client"

import { TaskStatus } from "@/database/models/task"
import { RecurringTaskList } from "../recurring-task/recurring-task-list"
import { ScopeTaskList } from "../task/task-list/scope-task-list"
import { ScopeViewKey, useCurrentScopeView } from "./use-scope-views"

export function ScopePageRouter() {
  const { id, view } = useCurrentScopeView()

  const isTaskListView = (["current", "snoozed", "done"] as ScopeViewKey[]).includes(view)
  const isRecurringTaskListView = view === "recurring"

  if (isTaskListView) {
    return <ScopeTaskList scopeId={id} statusView={view as TaskStatus} />
  }

  if (isRecurringTaskListView) {
    return <RecurringTaskList />
  }
}
