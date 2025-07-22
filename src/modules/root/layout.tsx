"use client"
import { ChevronsLeftIcon, MenuIcon } from "lucide-react"
import React from "react"
import { SignedIn, UserButton } from "@clerk/nextjs"
import { InboxNav } from "../inbox/inbox-nav"
import { useSessionStorageUtility } from "@/lib/utils/use-storage-utility"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"
import { cn } from "~/smui/utils"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen] = useSessionStorageUtility("sidebar-open", true)
  return (
    <div
      className={cn(
        "h-dvh w-dvw transition-discrete",
        sidebarOpen ? "flex flex-row items-start divide-x-2" : "flex flex-col divide-y-2"
      )}
    >
      <Sidebar>
        <InboxNav />
      </Sidebar>
      <Header />
      <main className="flex w-full flex-col">{children}</main>
    </div>
  )
}

function Sidebar({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useSessionStorageUtility("sidebar-open", true)
  return (
    <nav
      className={cn(
        sidebarOpen ? "flex w-0 md:w-350 md:min-w-350" : "hidden w-0",
        // "transition-discrete starting:w-0",
        "overflow-hidden",
        "transition-all",
        "flex-col",
        "sticky top-0 h-dvh max-h-dvh"
      )}
    >
      <Button
        className="flex cursor-pointer items-center gap-8 border-b p-8 hover:opacity-80"
        onPress={() => setSidebarOpen(false)}
      >
        <h1 className="font-semibold text-yellow-600">Backboard</h1>
        <div className="grow" />
        <Icon icon={<ChevronsLeftIcon />} className="text-neutral-600" />
      </Button>
      <div className="max-h-full grow overflow-auto p-4">{children}</div>
      <div className="flex items-center justify-end border-t p-8">
        <SignedIn>
          <UserButton showName />
        </SignedIn>
      </div>
    </nav>
  )
}

function Header() {
  const [sidebarOpen, setSidebarOpen] = useSessionStorageUtility("sidebar-open", true)
  return (
    <header
      className={cn(
        !sidebarOpen ? "flex h-36" : "hidden h-0",
        // "transition-discrete starting:h-0",
        "overflow-hidden",
        "transition-all",
        "sticky top-0 z-20 p-8"
      )}
    >
      <Button
        onPress={() => setSidebarOpen(true)}
        className="flex grow cursor-pointer items-center gap-8 hover:opacity-80"
      >
        <Icon icon={<MenuIcon />} className="text-neutral-600" />
        <h1 className="font-semibold text-yellow-600">Backboard</h1>
      </Button>
      <SignedIn>
        <UserButton showName />
      </SignedIn>
    </header>
  )
}
