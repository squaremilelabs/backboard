"use client"
import { useState } from "react"
import { TaskCreateForm } from "./task-create-form"
import { TaskList } from "./task-list"
import { useCurrentInboxView } from "@/modules/inbox/inbox-views"

export function TaskPage() {
  const { view } = useCurrentInboxView()
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])

  return (
    <div className="flex max-h-full flex-col overflow-auto">
      {view === "open" && <TaskCreateForm />}
      <TaskList selectedTaskIds={selectedTaskIds} setSelectedTaskIds={setSelectedTaskIds} />
    </div>
  )
}
