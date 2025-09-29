"use client"

import { useTaskListItems } from "../_hooks/use-task-list-items"
import { SMUIDataList } from "~/smui/components/data-list"

export function TaskList() {
  const { items } = useTaskListItems()

  return (
    <SMUIDataList
      ariaLabel="Task list"
      items={items}
      renderItemContent={(item) => {
        const task = item.data
        return <div>{task.title}</div>
      }}
    />
  )
}
