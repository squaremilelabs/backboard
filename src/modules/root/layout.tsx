"use client"
import { ChevronsLeftIcon, MenuIcon } from "lucide-react"
import React from "react"
import { SignedIn, UserButton } from "@clerk/nextjs"
import { InboxNav } from "../inbox/inbox-nav"
import { useSessionStorageUtility } from "@/lib/utils/use-storage-utility"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"
import { cn } from "~/smui/utils"
import { Popover, PopoverTrigger } from "~/smui/popover/components"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen] = useSessionStorageUtility("sidebar-open", true)
  return (
    <div
      className={cn(
        "relative h-dvh w-dvw transition-discrete",
        sidebarOpen
          ? ["flex flex-col divide-y-2", "md:flex md:flex-row md:items-start md:divide-x-2"]
          : "flex flex-col divide-y-2"
      )}
    >
      <Sidebar />
      <Header />
      <main className={cn("flex w-full flex-col", sidebarOpen && "md:pl-350")}>{children}</main>
    </div>
  )
}

function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useSessionStorageUtility("sidebar-open", true)
  return (
    <nav
      className={cn(
        sidebarOpen
          ? "hidden h-0 w-0 md:flex md:h-dvh md:max-h-dvh md:w-350 md:min-w-350"
          : "hidden h-0 w-0",
        // "transition-discrete starting:w-0",
        "overflow-hidden",
        "transition-all",
        "flex-col",
        "fixed top-0"
      )}
    >
      <Button
        className="flex h-50 cursor-pointer items-center gap-8 border-b-2 p-16 hover:opacity-80"
        onPress={() => setSidebarOpen(false)}
      >
        <h1 className="font-semibold text-neutral-600">Backboard</h1>
        <div className="grow" />
        <Icon icon={<ChevronsLeftIcon />} className="text-neutral-600" />
      </Button>
      <div className="max-h-full grow overflow-auto">
        <InboxNav />
      </div>
      <div className="flex items-center justify-end border p-8">
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
        !sidebarOpen ? "flex h-50 min-h-50" : "flex h-50 min-h-50 md:hidden md:h-0",
        // "transition-discrete starting:h-0",
        "overflow-hidden",
        "transition-all",
        "sticky top-0 z-20 px-16",
        "bg-neutral-50/30 backdrop-blur-lg"
      )}
    >
      {/* Sidebar trigger */}
      <Button
        onPress={() => setSidebarOpen(true)}
        className="hidden grow cursor-pointer items-center gap-8 hover:opacity-80 md:flex"
      >
        <Icon icon={<MenuIcon />} className="text-neutral-600" />
        <h1 className="font-semibold text-neutral-600">Backboard</h1>
      </Button>
      {/* Menu trigger */}
      <Menu>
        <Button className="flex grow cursor-pointer items-center gap-8 hover:opacity-80 md:hidden">
          <Icon icon={<MenuIcon />} className="text-neutral-600" />
          <h1 className="font-semibold text-neutral-600">Backboard</h1>
        </Button>
      </Menu>
      <SignedIn>
        <UserButton showName />
      </SignedIn>
    </header>
  )
}

function Menu({ children }: { children: React.ReactNode }) {
  return (
    <PopoverTrigger>
      {children}
      <Popover
        placement="bottom start"
        classNames={{
          content: "bg-neutral-0/10 backdrop-blur-lg w-350 border-2 max-h-300 overflow-auto",
        }}
      >
        <InboxNav />
      </Popover>
    </PopoverTrigger>
  )
}
