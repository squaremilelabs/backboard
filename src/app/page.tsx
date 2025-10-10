"use client"

import { SignedOut, SignInButton } from "@clerk/nextjs"
import { ScopeTreeList } from "@/components/scope-tree-list"
import { StatusNav } from "@/components/status-nav"
import { TaskList } from "@/components/task-list"
import { useAuth } from "@/hooks/use-auth"
import { useQueryStates } from "@/hooks/use-query-states"
import { RootScopeTreeProvider } from "@/hooks/use-root-scope-tree"
import { twm } from "@/lib/tailwind"

export default function Page() {
  const { account } = useAuth()
  const { scopeId, setScopeId, status, showInactiveScopes } = useQueryStates()

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
        <div className="flex items-center justify-between">
          <StatusNav />
          <SignedOut>
            <SignInButton>Sign in</SignInButton>
          </SignedOut>
        </div>
        <div
          className={twm([
            "flex",
            "h-full max-h-full grow overflow-auto",
            "bg-neutral-muted-bg rounded-lg border-2",
            "p-space-lg gap-space-lg",
          ])}
        >
          <div className="flex w-[324px] flex-col">
            <ScopeTreeList selectedId={scopeId} onSelectId={setScopeId} countStatus={status} />
          </div>
          <div
            className={twm(
              "sticky top-0",
              "bg-base-bg h-full max-h-full grow overflow-auto",
              "rounded-lg border-2",
              "p-space-lg"
            )}
          >
            <TaskList />
          </div>
        </div>
      </div>
    </RootScopeTreeProvider>
  )
}
