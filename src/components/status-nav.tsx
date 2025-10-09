"use client"

import { ListBox, ListBoxItem } from "react-aria-components"
import { TaskStatus } from "@/database/models/task"
import { useQueryStates } from "@/hooks/use-query-states"
import { useRootScopeTree } from "@/hooks/use-root-scope-tree"
import { twm } from "@/lib/tailwind"
import { badgeVariants } from "./class-variants/badge"

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
      selectionBehavior="replace"
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
              "px-space-lg py-space-md gap-space-lg",
              "text-md",
              "transition-all",
              "hover:bg-neutral-muted-bg",
              "opacity-50 hover:opacity-100 data-selected:opacity-100",
              "data-selected:bg-neutral-muted-bg data-selected:border-base-border",
              "data-selected:font-semibold",
              "!cursor-default",
            ])}
          >
            {count > 0 && (
              <span
                className={badgeVariants({
                  color: status === "current" ? "primary" : "neutral",
                  class: "opacity-100 transition-all starting:opacity-0",
                })}
              >
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
