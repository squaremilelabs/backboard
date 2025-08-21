"use client"

import React, { useEffect } from "react"
import { useWindowSize } from "usehooks-ts"
import { usePathname } from "next/navigation"
import { AppHeader } from "./app-header"
import { AppSidebar } from "./app-sidebar"
import { useSessionStorageUtility } from "@/common/utils/use-storage-utility"
import { cn } from "~/smui/utils"
import { Modal } from "~/smui/modal/components"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useSessionStorageUtility("app-sidebar-open", true)
  const windowSize = useWindowSize()
  const isMobile = windowSize.width <= 864
  useEffect(() => {
    if (isMobile) setSidebarOpen(false)
  }, [isMobile, setSidebarOpen, pathname])
  return (
    <div
      className={cn(
        "h-dvh max-h-dvh w-dvw max-w-dvw",
        "min-h-0 min-w-0",
        "grid grid-cols-[auto_1fr]",
        "overflow-hidden"
      )}
    >
      <nav
        className={cn(
          "hidden md:flex",
          "starting:w-0",
          "transition-all transition-discrete",
          "h-dvh max-h-dvh min-h-0",
          sidebarOpen ? "w-xs max-w-xs" : "w-0 overflow-hidden"
        )}
      >
        <AppSidebar />
      </nav>
      <Modal
        isOpen={sidebarOpen && isMobile}
        onOpenChange={setSidebarOpen}
        isDismissable
        variants={{ variant: "drawer" }}
        classNames={{
          overlay: "flex md:hidden",
          content: ["flex md:hidden bg-base-bg border-r transition-all", "w-xs starting:w-0"],
        }}
        dialogProps={{ "aria-label": "Scope Navigation" }}
      >
        <AppSidebar />
      </Modal>
      <div
        className={cn(
          // take up full viewport
          "h-full max-h-full min-h-0 w-full max-w-full min-w-0",
          // single cell grid with centered content
          "grid grid-cols-1 grid-rows-1 justify-items-center-safe",
          "overflow-hidden"
        )}
      >
        <div
          className={cn(
            // take up full viewport height, and container width (maxed out at full)
            "h-dvh max-h-dvh min-h-0 w-lg max-w-full",
            // two row grid for header & main
            "grid min-h-0 grid-cols-1 grid-rows-[auto_1fr]"
          )}
        >
          <header className="w-full max-w-full p-8 md:p-16">
            <AppHeader />
          </header>
          <main
            className={cn(
              "grid h-full max-h-full min-h-0 grid-cols-1 grid-rows-1",
              "px-8 pb-8 md:px-16 md:pb-16",
              "overflow-auto",
              "overscroll-contain"
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
