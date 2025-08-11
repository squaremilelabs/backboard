"use client"
import { useDragAndDrop } from "react-aria-components"
import { useState } from "react"
import { SCOPE_VIEWS, useCurrentScopeView, useCurrentScopeViewCounts } from "../use-scope-views"
import { ScopeViewTab } from "./tab"
import { ListBox } from "~/smui/list-box/components"
import { processDropItems } from "@/common/utils/list-utils"
import { TaskSnoozePicker } from "@/modules/task/task-actions/task-snooze"
import { db, useDBQuery } from "@/database/db-client"
import { parseTaskUpdateInput, Task, TaskStatus } from "@/database/models/task"

export function ScopeViewTabs({ scopeId }: { scopeId: string }) {
  const { scopes } = useDBQuery("scopes", { $: { where: { id: scopeId }, first: 1 } })
  const scope = scopes?.[0]

  const { view: currentView } = useCurrentScopeView()
  const counts = useCurrentScopeViewCounts()

  const [snoozeModalOpen, setSnoozeModalOpen] = useState(false)
  const [droppedTasks, setDroppedTasks] = useState<Task[]>([])

  const { dragAndDropHooks } = useDragAndDrop({
    acceptedDragTypes: ["db/task"],
    shouldAcceptItemDrop: (e, types) => {
      if (e.key === "recurring") return false
      if (e.key === currentView) return false
      if (types.has("db/task")) return true
      return false
    },
    onItemDrop: async (e) => {
      const droppedOnStatus = e.target.key as TaskStatus
      const tasks = await processDropItems<Task>(e.items, "db/task")
      if (droppedOnStatus === "current") {
        db.transact(
          tasks
            .filter((task) => task.status !== "current")
            .map((task) => {
              const { data } = parseTaskUpdateInput({
                status: "current",
                prev_status: task.status,
              })
              return db.tx.tasks[task.id].update(data)
            })
        )
      }
      if (droppedOnStatus === "done") {
        db.transact(
          tasks
            .filter((task) => task.status !== "done")
            .map((task) => {
              const { data } = parseTaskUpdateInput({
                status: "done",
                prev_status: task.status,
              })
              return db.tx.tasks[task.id].update(data)
            })
        )
      }
      if (droppedOnStatus === "snoozed") {
        setDroppedTasks(tasks)
        setSnoozeModalOpen(true)
      }
    },
  })

  return (
    <>
      <ListBox
        aria-label="Scope Views"
        orientation="horizontal"
        dragAndDropHooks={dragAndDropHooks}
        items={SCOPE_VIEWS}
        dependencies={[scope, counts, currentView]}
        selectedKeys={[currentView]}
        selectionMode="single"
        classNames={{
          base: ["max-w-full overflow-x-auto p-2", "flex items-center gap-4 min-w-fit"],
        }}
      >
        {(view, classNames) => {
          return (
            <ScopeViewTab
              scopeId={scope?.id}
              view={view}
              count={counts[view.key] ?? null}
              className={classNames.item}
            />
          )
        }}
      </ListBox>
      <TaskSnoozePicker
        isOpen={snoozeModalOpen}
        onOpenChange={setSnoozeModalOpen}
        selectedTaskIds={droppedTasks.map((task) => task.id)}
        currentStatus={currentView as TaskStatus}
      />
    </>
  )
}
