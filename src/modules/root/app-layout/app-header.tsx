"use client"
import { MenuIcon } from "lucide-react"
import { AppUserTray } from "./app-user-tray"
import { useSessionStorageUtility } from "@/common/utils/use-storage-utility"
import { useCurrentScopeView } from "@/modules/scope/use-scope-views"
import { ScopeTitle } from "@/modules/scope/scope-title"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"
import { ScopeViewTabs } from "@/modules/scope/scope-view-tabs"

export function AppHeader() {
  const { id: scopeId } = useCurrentScopeView()
  const [sidebarOpen, setSidebarOpen] = useSessionStorageUtility("app-sidebar-open", true)
  const isScopeView = !!scopeId
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
          {!isScopeView && <span className="text-neutral-muted-text font-semibold">Scopes</span>}
        </Button>
        {/* Title */}
        {isScopeView && <ScopeTitle scopeId={scopeId} />}
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
