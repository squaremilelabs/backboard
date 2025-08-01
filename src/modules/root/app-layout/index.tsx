"use client"

import React from "react"
import { AppHeader } from "./app-header"
import { AppDesktopSidebarNav } from "./app-nav"
import { useSessionStorageUtility } from "@/common/utils/use-storage-utility"
import { cn } from "~/smui/utils"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen] = useSessionStorageUtility("app-sidebar-open", true)
  return (
    <div className={cn("h-dvh max-h-dvh w-dvw max-w-dvw", "grid grid-cols-[auto_1fr]")}>
      <nav
        className={cn(
          "hidden md:flex",
          "starting:w-0",
          "transition-all transition-discrete",
          "h-dvh max-h-dvh",
          sidebarOpen ? "w-xs max-w-xs" : "w-0 overflow-hidden"
        )}
      >
        <AppDesktopSidebarNav />
      </nav>
      <div
        className={cn(
          // take up full viewport
          "h-full max-h-full w-full max-w-full",
          // single cell grid with centered content
          "grid grid-cols-1 grid-rows-1 justify-items-center-safe",
          "overflow-auto"
        )}
      >
        <div
          className={cn(
            // take up full viewport height, and container width (maxed out at full)
            "h-full max-h-full w-lg max-w-full",
            // two row grid for header & main
            "grid grid-cols-1 grid-rows-[auto_1fr]"
          )}
        >
          <header className="w-full max-w-full p-8 md:p-16">
            <AppHeader />
          </header>
          <main
            className={cn(
              "grid h-full max-h-full grid-cols-1 grid-rows-1 overflow-auto",
              "md:px-16 md:pb-16"
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
