"use client"
import { ScopeTreeList } from "@/components/scope-tree-list"
import { StatusNav } from "@/components/status-nav"
import { useAuth } from "@/hooks/use-auth"
import { useQueryStates } from "@/hooks/use-query-states"
import { RootScopeTreeProvider } from "@/hooks/use-root-scope-tree"
import { twm } from "~/smui/utils/tailwind"

export default function Page() {
  const { account } = useAuth()
  const { scope, setScope, status, showInactiveScopes } = useQueryStates()

  return (
    <RootScopeTreeProvider account={account} fetchInactiveScopes={showInactiveScopes}>
      <div
        className={twm([
          "self-center-safe",
          "h-full max-h-full w-lg max-w-full",
          "grid grid-rows-[auto_1fr]",
          "gap-space-xl p-space-xl",
        ])}
      >
        <StatusNav />
        <div
          className={twm([
            "flex",
            "h-full max-h-full grow overflow-auto",
            "bg-neutral-muted-bg rounded-lg border-2",
            "p-space-lg gap-space-lg",
          ])}
        >
          <div className="flex w-[324px] flex-col">
            <ScopeTreeList
              selectedId={scope}
              onSelectId={setScope}
              countStatus={status}
              withDragAndDrop
            />
          </div>
          <div
            className={twm(
              "sticky top-0",
              "bg-base-bg h-full max-h-full grow overflow-auto",
              "rounded-lg border-2"
            )}
          ></div>
        </div>
      </div>
    </RootScopeTreeProvider>
  )
}
