"use client"

import { TaskCreateForm } from "./task-create-form"
import { TaskList } from "./task-list"

export function TaskPage() {
  return (
    <div className="flex flex-col">
      <TaskList />
      <TaskCreateForm />
    </div>
  )
}
