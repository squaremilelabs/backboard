"use client"
import { MenuIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { AppLogo } from "./app-logo"
import { InboxList } from "@/modules/inbox/inbox-list"
import { useSessionStorageUtility } from "@/common/utils/use-storage-utility"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"
import { Popover, PopoverTrigger } from "~/smui/popover/components"
import { cn } from "~/smui/utils"

export function AppDesktopSidebarNav() {
  const [_, setSidebarOpen] = useSessionStorageUtility("app-sidebar-open", true)
  return (
    <div className="relative flex w-full flex-col overflow-auto p-4">
      <div
        className={cn(
          "sticky top-0 z-10",
          "bg-base-bg/30 backdrop-blur-xl",
          "flex items-stretch gap-8 p-8 pr-0"
        )}
      >
        <Button
          onPress={() => setSidebarOpen(false)}
          className="flex items-center gap-8"
          variants={{ hover: "fill" }}
        >
          <Icon icon={<MenuIcon />} className="text-neutral-muted-text" />
          <AppLogo withTitle />
        </Button>
      </div>
      <InboxList />
    </div>
  )
}

export function AppMobilePopoverNav({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => setOpen(false), [pathname])

  return (
    <PopoverTrigger isOpen={open} onOpenChange={setOpen}>
      {children}
      <Popover
        placement="bottom start"
        classNames={{
          content: ["bg-base-bg border-2 rounded-sm p-4", "w-xs max-h-[80dvh] overflow-auto"],
        }}
      >
        <div className="p-8 px-16">
          <AppLogo withTitle />
        </div>
        <InboxList />
      </Popover>
    </PopoverTrigger>
  )
}
