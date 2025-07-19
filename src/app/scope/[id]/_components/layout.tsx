"use client"

import { Button } from "react-aria-components"
import { SignedIn, UserButton } from "@clerk/nextjs"
import { useSessionStorageUtility } from "@/lib/utils/storage-utility"
import { twm } from "@/lib/utils/tailwind"
import { Icon } from "@/lib/primitives/icon"
import { ScopeHeader } from "@/modules/scope/scope-header"
import { ScopeNavList } from "@/modules/scope/scope-nav-list"
import { TasksViewTabs } from "@/modules/task/tasks-view-tabs"

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={twm(
        "relative flex h-dvh max-h-dvh w-dvw max-w-dvw flex-row items-stretch",
        "divide-x overflow-auto"
      )}
    >
      <Sidebar />
      <main className="relative flex w-full flex-col gap-8">
        <div className="sticky top-0 z-10 flex w-full flex-col bg-neutral-50/30 backdrop-blur-2xl">
          <Header />
          <TasksViewTabs />
        </div>
        <div className="relative flex w-full flex-col gap-8 p-16 pt-8">{children}</div>
      </main>
    </div>
  )
}

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useSessionStorageUtility("sidebar-open", true)
  return (
    <nav
      className={twm(
        sidebarOpen ? "md:w-350" : "w-0",
        "overflow-hidden",
        "transition-all",
        "w-0 md:grid",
        "grid-rows-[auto_1fr]",
        "sticky top-0 h-dvh"
      )}
    >
      <div className="flex h-50 items-center gap-8 border-b p-16">
        <h1 className="font-semibold text-neutral-600">Backboard</h1>
        <div className="grow" />
        <Button className="cursor-pointer hover:opacity-80" onPress={() => setSidebarOpen(false)}>
          <Icon icon="double-chevron" className="rotate-90 text-neutral-400" />
        </Button>
      </div>
      <div className="p-16">
        <ScopeNavList />
      </div>
    </nav>
  )
}

function Header() {
  const [sidebarOpen, setSidebarOpen] = useSessionStorageUtility("sidebar-open", true)

  return (
    <header className="flex h-50 w-full items-center gap-16 p-16">
      {/* NavTrigger for Desktop (opens sidebar) */}
      <div
        className={twm(
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
        <ScopeHeader />
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
      className={twm("flex cursor-pointer items-center gap-4 hover:opacity-80")}
      onPress={onPress}
    >
      <Icon icon="double-chevron" className="-rotate-90 text-neutral-400" />
    </Button>
  )
}
