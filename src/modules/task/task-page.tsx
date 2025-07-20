"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import { InboxView } from "../inbox/inbox-view-tabs"
import { TaskCreateForm } from "./task-create-form"
import { TaskActions } from "./task-actions"
import { TaskList } from "./task-list"

export function TaskPage() {
  const { view } = useParams<{ view: InboxView }>()
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])

  const isInboxView = view === "inbox" || !view

  return (
    <div className="flex max-h-full flex-col gap-8 overflow-auto">
      {selectedTaskIds.length > 0 ? (
        <TaskActions selectedTaskIds={selectedTaskIds} setSelectedTaskIds={setSelectedTaskIds} />
      ) : (
        isInboxView && <TaskCreateForm />
      )}
      <TaskList selectedTaskIds={selectedTaskIds} setSelectedTaskIds={setSelectedTaskIds} />
    </div>
  )
}
