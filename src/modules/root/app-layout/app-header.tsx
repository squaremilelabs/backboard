"use client"
import { DiamondIcon, MenuIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { AppUserTray } from "./app-user-tray"
import { useSessionStorageUtility } from "@/common/utils/use-storage-utility"
import { useCurrentScopeView } from "@/modules/scope/use-scope-views"
import { ScopeTitle } from "@/modules/scope/scope-title"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"
import { ScopeViewTabs } from "@/modules/scope/scope-view-tabs"
import { useAccountOpenTasks } from "@/modules/task/task-total-count"
import { cn } from "~/smui/utils"

export function AppHeader() {
  const pathname = usePathname()
  const { id: scopeId } = useCurrentScopeView()
  const [sidebarOpen, setSidebarOpen] = useSessionStorageUtility("app-sidebar-open", true)

  const isNowTaskView = pathname === "/current"
  const isScopeView = !!scopeId

  const { tasks } = useAccountOpenTasks()
  return (
    <div className="flex flex-col">
      <div className="flex items-start">
        {/* Sidebar Trigger */}
        <Button
          variants={{ hover: "fill" }}
          onPress={() => setSidebarOpen(true)}
          className={[
            "text-neutral-muted-text mr-8 flex items-center gap-4 rounded-md",
            sidebarOpen && "md:hidden",
          ]}
        >
          <Icon icon={<MenuIcon />} variants={{ size: "lg" }} />
          {!isScopeView && !isNowTaskView && (
            <span className="text-neutral-muted-text font-semibold">Scopes</span>
          )}
        </Button>
        {/* Title */}
        {isScopeView && <ScopeTitle scopeId={scopeId} />}
        {isNowTaskView && (
          <div
            className={cn(
              "flex items-center gap-8 px-8 pr-12 pb-4",
              "border-b-4",
              tasks?.length === 0
                ? ["text-neutral-muted-text"]
                : ["text-base-text border-base-outline"]
            )}
          >
            <div className="flex items-center gap-4">
              <Icon icon={<DiamondIcon />} variants={{ size: "md" }} />
              <h1 className={cn("text-lg font-bold")}>Current</h1>
            </div>
            <p className="text-lg font-bold">{tasks?.length ?? 0}</p>
          </div>
        )}
        <div className="grow" />
        <AppUserTray />
      </div>
      {isScopeView && (
        <div className="mt-8 overflow-auto">
          <ScopeViewTabs scopeId={scopeId} />
        </div>
      )}
    </div>
  )
}
