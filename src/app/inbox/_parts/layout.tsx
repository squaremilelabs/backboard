"use client"

import { Button } from "react-aria-components"
import { SignedIn, UserButton } from "@clerk/nextjs"
import { InboxHeader } from "./inbox-header"
import { InboxNavList } from "./inbox-nav-list"
import { InboxViewTabs } from "./inbox-view-tabs"
import { useSessionStorageUtility } from "@/lib/utils/use-storage-utility"
import { cn } from "~/smui/utils"
import { Icon } from "@/lib/components/icon"

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "relative flex h-dvh max-h-dvh w-dvw max-w-dvw flex-row items-stretch",
        "divide-x overflow-auto"
      )}
    >
      <Sidebar />
      <main className="relative flex w-full flex-col">
        <div className="sticky top-0 z-10 flex w-full flex-col bg-neutral-50/30 backdrop-blur-2xl">
          <Header />
          <InboxViewTabs />
        </div>
        <div className="relative flex w-full flex-col">{children}</div>
      </main>
    </div>
  )
}

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useSessionStorageUtility("sidebar-open", true)
  return (
    <nav
      className={cn(
        sidebarOpen ? "md:w-350" : "w-0",
        "overflow-hidden",
        "transition-all",
        "w-0 md:grid",
        "grid-rows-[auto_1fr]",
        "sticky top-0 h-dvh"
      )}
    >
      <div className="flex h-50 items-center gap-8 border-b p-16">
        <h1 className="font-semibold text-yellow-600">Backboard</h1>
        <div className="grow" />
        <Button className="cursor-pointer hover:opacity-80" onPress={() => setSidebarOpen(false)}>
          <Icon icon="double-chevron" className="rotate-90 text-neutral-400" />
        </Button>
      </div>
      <div className="max-h-full overflow-auto p-8">
        <InboxNavList />
      </div>
    </nav>
  )
}

function Header() {
  const [sidebarOpen, setSidebarOpen] = useSessionStorageUtility("sidebar-open", true)

  return (
    <header className="flex h-50 w-full items-center gap-8 p-16">
      {/* NavTrigger for Desktop (opens sidebar) */}
      <div
        className={cn(
          "hidden md:block",
          sidebarOpen ? "!hidden" : "opacity-100 transition-opacity starting:opacity-0"
        )}
      >
        <NavTrigger onPress={() => setSidebarOpen(true)} />
      </div>
      {/* NavTrigger for Mobile (opens modal) */}
      <div className="block md:hidden">
        <NavTrigger onPress={() => {}} />
      </div>
      <div className="grow truncate">
        <InboxHeader />
      </div>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  )
}

function NavTrigger({ onPress }: { onPress: () => void }) {
  return (
    <Button
      className={cn("flex cursor-pointer items-center gap-4 hover:opacity-80")}
      onPress={onPress}
    >
      <Icon icon="double-chevron" className="-rotate-90 text-yellow-600" />
    </Button>
  )
}
