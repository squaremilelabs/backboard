"use client"

import { RecurringTaskPage } from "../recurring-task/recurring-task-page"
import { TaskPage } from "../task/task-page"
import { InboxView, useCurrentInboxView } from "./inbox-views"

export function InboxPage() {
  const { view } = useCurrentInboxView()

  const isTaskListView = (["open", "snoozed", "archived"] as InboxView[]).includes(view)
  const isRecurringTaskListView = view === "recurring"

  if (isTaskListView) {
    return <TaskPage />
  }

  if (isRecurringTaskListView) {
    return <RecurringTaskPage />
  }
}
