"use client"
import { ScopeTreeList } from "./_components/scope-tree-list"
import { StatusViewSelect } from "./_components/status-view-select"
import { TaskList } from "./_components/task-list"
import { RootScopeTreeProvider } from "./_hooks/use-root-scope-tree"
import { twm } from "~/smui/utils/tailwind"

export default function TasksPage() {
  return (
    <RootScopeTreeProvider>
      <div
        className={twm([
          "self-center-safe",
          "h-full max-h-full w-lg max-w-full",
          "grid grid-rows-[auto_1fr]",
          "gap-space-xl p-space-xl",
        ])}
      >
        <StatusViewSelect />
        <div
          className={twm([
            "flex",
            "h-full max-h-full grow overflow-auto",
            "bg-neutral-muted-bg rounded-lg border-2",
            "p-space-lg gap-space-lg",
          ])}
        >
          <ScopeTreeList />
          <div
            className={twm(
              "sticky top-0",
              "bg-base-bg h-full max-h-full grow overflow-auto",
              "rounded-lg border-2"
            )}
          >
            <TaskList />
          </div>
        </div>
      </div>
    </RootScopeTreeProvider>
  )
}
