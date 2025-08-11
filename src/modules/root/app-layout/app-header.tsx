"use client"
import { MenuIcon } from "lucide-react"
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
import { typography } from "@/common/components/class-names"

export function AppHeader() {
  const pathname = usePathname()
  const { id: scopeId } = useCurrentScopeView()
  const [sidebarOpen, setSidebarOpen] = useSessionStorageUtility("app-sidebar-open", true)

  const isNowTaskView = pathname === "/current"
  const isScopeView = !!scopeId

  const { tasks } = useAccountOpenTasks()
  return (
    <div className="flex flex-col">
      <div className="flex items-center">
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
          <div className={cn("flex items-center gap-2")}>
            <h1
              className={typography({
                type: "gradient-title",
                className: ["p-2 text-lg font-bold tracking-normal"],
              })}
            >
              {tasks?.length ?? 0} Current Task{tasks?.length === 1 ? "" : "s"}
            </h1>
          </div>
        )}
        <div className="grow" />
        <AppUserTray />
      </div>
      {isScopeView && (
        <div className="mt-8">
          <ScopeViewTabs scopeId={scopeId} />
        </div>
      )}
    </div>
  )
}
