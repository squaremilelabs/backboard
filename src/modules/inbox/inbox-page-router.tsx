"use client"

import { RecurringTaskList } from "../recurring-task/recurring-task-list"
import { TaskList } from "../task/task-list"
import { InboxViewKey, useCurrentInboxView } from "./use-inbox-view"

export function InboxPageRouter() {
  const { view } = useCurrentInboxView()

  const isTaskListView = (["open", "snoozed", "archived"] as InboxViewKey[]).includes(view)
  const isRecurringTaskListView = view === "recurring"

  if (isTaskListView) {
    return <TaskList />
  }

  if (isRecurringTaskListView) {
    return <RecurringTaskList />
  }
}
