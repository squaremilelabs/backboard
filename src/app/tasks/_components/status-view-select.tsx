"use client"
import { useStatusQueryState } from "../_hooks/use-query-states"
import { useRootScopeTree } from "../_hooks/use-root-scope-tree"
import { TaskCountChip } from "./task-count-chip"
import { SMUIOptionList } from "~/smui/components/option-list"
import { TaskStatus } from "@/database/models/task"

export function StatusViewSelect() {
  const [selectedStatus, setSelectedStatus] = useStatusQueryState()
  const { rootNode } = useRootScopeTree()

  return (
    <SMUIOptionList
      ariaLabel="Test"
      selectionMode="single"
      selectionBehavior="replace"
      selectedKeys={[selectedStatus]}
      disallowEmptySelection
      onSelectionChange={(keys) => setSelectedStatus([...keys][0] as TaskStatus)}
      renderType="listbox"
      visualType="tabs"
      items={[
        { id: "current" as TaskStatus, label: "Current" },
        { id: "snoozed" as TaskStatus, label: "Later" },
        { id: "done" as TaskStatus, label: "Recent" },
      ]}
      orientation="horizontal"
      classNames={{
        list: ["gap-space-lg"],
        item: [
          "border-2 border-transparent rounded-lg",
          "px-space-lg py-space-md gap-space-lg",
          "text-md",
          "opacity-50 data-selected:opacity-100 hover:opacity-100",
          "data-selected:bg-neutral-muted-bg data-selected:border-base-border",
          "data-selected:font-semibold",
          "!cursor-default",
        ],
      }}
      renderItemContent={(item) => {
        const status = item.id as TaskStatus
        const count = rootNode.taskCounts.deep[status]
        return (
          <>
            <p>{item.label}</p>
            {count ? (
              <TaskCountChip count={count} color={status === "current" ? "primary" : "neutral"} />
            ) : null}
          </>
        )
      }}
    />
  )
}
