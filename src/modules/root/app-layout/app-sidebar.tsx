"use client"
import { ChevronsLeftIcon } from "lucide-react"
import { AppLogo } from "./app-logo"
import { ScopeList } from "@/modules/scope/scope-list"
import { useSessionStorageUtility } from "@/common/utils/use-storage-utility"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"
import { cn } from "~/smui/utils"

export function AppSidebar() {
  const [_, setSidebarOpen] = useSessionStorageUtility("app-sidebar-open", true)
  return (
    <div className="relative flex w-full flex-col overflow-auto p-4">
      <Button
        onPress={() => setSidebarOpen(false)}
        className={cn(
          "sticky top-0 z-10",
          "bg-base-bg/30 backdrop-blur-xl",
          "flex items-center gap-8 p-8 pl-12"
        )}
        variants={{ hover: "fill" }}
      >
        <AppLogo withTitle />
        <div className="grow" />
        <Icon icon={<ChevronsLeftIcon />} className="text-neutral-muted-text !min-w-30" />
      </Button>
      <ScopeList />
    </div>
  )
}
