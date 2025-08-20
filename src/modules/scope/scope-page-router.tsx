"use client"

import { RecurringTaskList } from "../recurring-task/recurring-task-list"
import { ScopedTaskList } from "../task/task-list/scoped-task-list"
import { ScopeViewKey, useCurrentScopeView } from "./use-scope-views"

export function ScopePageRouter() {
  const { view } = useCurrentScopeView()

  const isTaskListView = (["current", "snoozed", "done"] as ScopeViewKey[]).includes(view)
  const isRecurringTaskListView = view === "recurring"

  if (isTaskListView) {
    return <ScopedTaskList />
  }

  if (isRecurringTaskListView) {
    return <RecurringTaskList />
  }
}
