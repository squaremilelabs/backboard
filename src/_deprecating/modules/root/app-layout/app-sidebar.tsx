"use client"
import { ChevronsLeftIcon } from "lucide-react"
import { Button } from "@/_deprecating/common/primitives/button/components"
import { Icon } from "@/_deprecating/common/primitives/icon/components"
import { cn } from "@/_deprecating/common/utils/ui-utils"
import { ScopeList } from "@/_deprecating/modules/scope/scope-list"
import { useSessionStorageUtility } from "@/hooks/use-storage-utility"
import { AppLogo } from "./app-logo"

export function AppSidebar() {
  const [_, setSidebarOpen] = useSessionStorageUtility("app-sidebar-open", true)
  return (
    <div className="relative flex w-full flex-col overflow-auto overscroll-contain p-4">
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
