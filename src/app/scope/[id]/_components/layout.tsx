"use client"

import Image from "next/image"
import { Button } from "react-aria-components"
import { useSessionStorageUtility } from "@/lib/utils/storage-utility"
import { twm } from "@/lib/utils/tailwind"
import { Icon } from "@/lib/primitives/icon"

export function ScopeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={twm("grid h-dvh w-dvw grid-cols-[auto_1fr]", "divide-x")}>
      <Sidebar />
      <main className="grid grid-rows-[auto_auto_1fr]">
        <ScopeHeader />
        <div className="flex flex-col items-center-safe p-16">
          <div className="w-xl max-w-full">{children}</div>
        </div>
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
        "grid-rows-[auto_1fr]"
      )}
    >
      <div className="flex h-50 items-center gap-8 border-b p-16">
        <Image
          alt="Backboard"
          src="/images/backboard-logo.svg"
          width={20}
          height={20}
          className="shadow-md"
        />
        <h1 className="font-semibold text-neutral-600">Backboard</h1>
        <div className="grow" />
        <Button className="cursor-pointer hover:opacity-80" onPress={() => setSidebarOpen(false)}>
          <Icon icon="double-chevron" className="rotate-90 text-neutral-400" />
        </Button>
      </div>
    </nav>
  )
}

function ScopeHeader() {
  const [sidebarOpen, setSidebarOpen] = useSessionStorageUtility("sidebar-open", true)
  return (
    <header className="flex h-50 flex-col items-center-safe justify-center border-b px-16">
      <div className="flex w-xl max-w-full items-center gap-16">
        {/* ScopeNavTrigger for Desktop (opens sidebar) */}
        <div
          className={twm(
            "hidden md:block",
            sidebarOpen ? "!hidden" : "opacity-100 transition-opacity starting:opacity-0"
          )}
        >
          <ScopeNavTrigger onPress={() => setSidebarOpen(true)} />
        </div>
        {/* ScopeNavTrigger for Mobile (opens modal) */}
        <div className="block md:hidden">
          <ScopeNavTrigger onPress={() => {}} />
        </div>
        <h1 className="text-lg font-semibold text-neutral-600">[CUL] Gathering Flow Refresh</h1>
      </div>
    </header>
  )
}

function ScopeNavTrigger({ onPress }: { onPress: () => void }) {
  return (
    <Button
      className={twm("flex cursor-pointer items-center gap-4 hover:opacity-80")}
      onPress={onPress}
    >
      <Icon icon="menu" className="text-neutral-400" />
      <Image
        alt="Backboard"
        src="/images/backboard-logo.svg"
        width={20}
        height={20}
        className="shadow-md"
      />
    </Button>
  )
}
