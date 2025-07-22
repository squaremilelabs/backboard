"use client"

import { useCurrentInboxView } from "../inbox/inbox-views"
import { TaskCreateForm } from "./task-create-form"
import { TaskList } from "./task-list"

export function TaskPage() {
  const { view } = useCurrentInboxView()

  // TODO: make typesafe
  const isTaskListView = ["open", "snoozed", "archive"].includes(view)

  return (
    <div className="flex flex-col">
      {isTaskListView && (
        <>
          <TaskCreateForm />
          <TaskList />
        </>
      )}
    </div>
  )
}
