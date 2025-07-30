"use client"

import { RecurringTaskPage } from "../recurring-task/recurring-task-page"
import { TaskList } from "../task/task-list"
import { InboxView, useCurrentInboxView } from "./inbox-views"

export function InboxPageRouter() {
  const { view } = useCurrentInboxView()

  const isTaskListView = (["open", "snoozed", "archived"] as InboxView[]).includes(view)
  const isRecurringTaskListView = view === "recurring"

  if (isTaskListView) {
    return <TaskList />
  }

  if (isRecurringTaskListView) {
    return <RecurringTaskPage />
  }
}
