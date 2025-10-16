"use client"

import { ListBox, ListBoxItem } from "react-aria-components"
import { TaskStatus } from "@/database/models/task"
import { useQueryStates } from "@/hooks/use-query-states"
import { useRootScopeTree } from "@/hooks/use-root-scope-tree"
import { twm } from "@/lib/tailwind"
import { countBadge } from "./primitives/_class-names"

export function StatusNav() {
  const { status, setStatus } = useQueryStates()
  const { rootNode } = useRootScopeTree()

  const statusItems: { status: TaskStatus; label: string; count: number }[] = [
    { status: "current", label: "Current", count: rootNode.taskCounts.deep.current },
    { status: "snoozed", label: "Later", count: rootNode.taskCounts.deep.snoozed },
    { status: "done", label: "Recent", count: rootNode.taskCounts.deep.done },
  ]

  return (
    <ListBox
      aria-label="Select Status View"
      selectionMode="single"
      selectionBehavior="toggle"
      selectedKeys={[status]}
      disallowEmptySelection
      onSelectionChange={(keys) => setStatus([...keys][0] as TaskStatus)}
      items={statusItems}
      orientation="horizontal"
      className={twm("gap-space-lg flex")}
    >
      {({ status, label, count }) => {
        return (
          <ListBoxItem
            id={status}
            textValue={label}
            className={twm([
              "flex items-center",
              "rounded-lg border-2 border-transparent",
              "h-box-md gap-space-md px-space-lg",
              "transition-all",
              "hover:bg-neutral-muted-bg",
              "opacity-50 hover:opacity-100 data-selected:opacity-100",
              "data-selected:bg-neutral-muted-bg data-selected:border-base-border",
              "data-selected:font-semibold",
              "!cursor-default",
            ])}
          >
            {count > 0 && (
              <span className={countBadge({ color: status === "current" ? "primary" : "neutral" })}>
                {count}
              </span>
            )}
            <p>{label}</p>
          </ListBoxItem>
        )
      }}
    </ListBox>
  )
}
