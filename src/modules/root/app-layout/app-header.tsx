"use client"
import { AlarmClockIcon, DiamondIcon, LucideIcon, MenuIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { AppUserTray } from "./app-user-tray"
import { useSessionStorageUtility } from "@/common/utils/use-storage-utility"
import { useCurrentScopeView } from "@/modules/scope/use-scope-views"
import { ScopeTitle } from "@/modules/scope/scope-title"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"
import { ScopeViewTabs } from "@/modules/scope/scope-view-tabs"
import { useAccountCurrentTasks, useAccountSnoozedTasks } from "@/modules/task/account-tasks"
import { cn } from "~/smui/utils"

export function AppHeader() {
  const pathname = usePathname()
  const { id: scopeId } = useCurrentScopeView()
  const [sidebarOpen, setSidebarOpen] = useSessionStorageUtility("app-sidebar-open", true)

  const isCurrentTasksView = pathname === "/current"
  const isSnoozedTasksView = pathname === "/snoozed"
  const isScopeView = !!scopeId

  const isHomePage = pathname === "/"

  const { tasks: currentTasks } = useAccountCurrentTasks()
  const { tasks: snoozedTasks } = useAccountSnoozedTasks()

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
          {isHomePage && <span className="text-neutral-muted-text font-semibold">Scopes</span>}
        </Button>
        {/* Title */}
        {isScopeView && <ScopeTitle scopeId={scopeId} />}
        {isCurrentTasksView && (
          <TaskStatusViewTitle
            StatusIcon={DiamondIcon}
            label="Current"
            count={currentTasks?.length ?? 0}
          />
        )}
        {isSnoozedTasksView && (
          <TaskStatusViewTitle
            StatusIcon={AlarmClockIcon}
            label="Snoozed"
            count={snoozedTasks?.length ?? 0}
          />
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

function TaskStatusViewTitle({
  StatusIcon,
  label,
  count,
}: {
  StatusIcon: LucideIcon
  label: string
  count: number
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-8 px-8 pr-12 pb-4",
        "rounded-sm",
        !count ? ["text-neutral-muted-text"] : ["text-base-text border-base-outline border-b-4"]
      )}
    >
      <div className="flex items-center gap-4">
        <Icon icon={<StatusIcon />} variants={{ size: "md" }} />
        <h1 className={cn("text-lg font-bold")}>{label}</h1>
      </div>
      <p className="text-lg font-bold">{count}</p>
    </div>
  )
}
