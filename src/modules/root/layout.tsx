"use client"
import { ChevronsLeftIcon, ExternalLinkIcon, MenuIcon } from "lucide-react"
import React, { useEffect } from "react"
import { SignedIn, UserButton } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Link } from "react-aria-components"
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
        "relative h-dvh w-dvw",
        sidebarOpen
          ? ["flex flex-col divide-y-2", "md:flex md:flex-row md:items-start md:divide-x-2"]
          : "flex flex-col divide-y-2"
      )}
    >
      <AppSidebar />
      <AppHeader />
      <main className={cn("flex w-full flex-col", sidebarOpen ? "md:pl-300" : "mt-50")}>
        {children}
      </main>
    </div>
  )
}

function AppSidebar() {
  const [sidebarOpen, setSidebarOpen] = useSessionStorageUtility("sidebar-open", true)
  return (
    <nav
      className={cn(
        sidebarOpen
          ? "hidden h-0 w-0 md:flex md:h-dvh md:max-h-dvh md:w-300 md:min-w-300"
          : "hidden h-0 w-0",
        "overflow-hidden",
        "flex-col",
        "fixed top-0"
      )}
    >
      <Button
        className={cn(
          "flex h-50 items-center gap-8",
          "border-b-2 p-16",
          "hover:bg-canvas-1 cursor-pointer"
        )}
        onPress={() => setSidebarOpen(false)}
      >
        <Image
          src="/images/backboard-logo.svg"
          alt="Backboard"
          width={16}
          height={16}
          className="shadow-sm"
        />
        <h1 className="text-canvas-4 font-semibold">Backboard</h1>
        <div className="grow" />
        <Icon icon={<ChevronsLeftIcon />} className="text-canvas-4" />
      </Button>
      <div className="max-h-full grow overflow-auto">
        <InboxNav />
      </div>
      <AppRoadmapLinks />
      <div className="flex items-center justify-end border p-8">
        <SignedIn>
          <UserButton
            showName
            appearance={{ variables: { colorForeground: "var(--color-canvas-6)" } }}
          />
        </SignedIn>
      </div>
    </nav>
  )
}

function AppHeader() {
  const [sidebarOpen, setSidebarOpen] = useSessionStorageUtility("sidebar-open", true)
  return (
    <header
      className={cn(
        !sidebarOpen ? "flex h-50 min-h-50" : "flex h-50 min-h-50 md:hidden md:h-0",
        // "transition-discrete starting:h-0",
        "overflow-hidden",
        "transition-all",
        "fixed top-0 z-20 w-dvw px-16",
        "bg-canvas-0/30 backdrop-blur-lg",
        "hover:bg-canvas-1 cursor-pointer"
      )}
    >
      {/* Sidebar trigger */}
      <Button
        onPress={() => setSidebarOpen(true)}
        className="hidden grow cursor-pointer items-center gap-8 md:flex"
      >
        <Icon icon={<MenuIcon />} className="text-canvas-4" />
        <Image
          src="/images/backboard-logo.svg"
          alt="Backboard"
          width={16}
          height={16}
          className="shadow-sm"
        />
        <h1 className="text-canvas-4 font-semibold">Backboard</h1>
      </Button>
      {/* Menu trigger */}
      <AppMenu>
        <Button className="flex grow cursor-pointer items-center gap-8 md:hidden">
          <Icon icon={<MenuIcon />} className="text-canvas-4" />
          <Image
            src="/images/backboard-logo.svg"
            alt="Backboard"
            width={16}
            height={16}
            className="shadow-sm"
          />
          <h1 className="text-canvas-4 font-semibold">Backboard</h1>
        </Button>
      </AppMenu>
      <SignedIn>
        <UserButton
          showName
          appearance={{ variables: { colorForeground: "var(--color-canvas-6)" } }}
        />
      </SignedIn>
    </header>
  )
}

function AppMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <PopoverTrigger isOpen={open} onOpenChange={setOpen}>
      {children}
      <Popover
        placement="bottom start"
        classNames={{
          content: "bg-canvas-0 w-350 border-2 max-h-[80dvh] overflow-auto",
        }}
      >
        <InboxNav />
        <AppRoadmapLinks />
      </Popover>
    </PopoverTrigger>
  )
}

function AppRoadmapLinks() {
  return (
    <div className="flex flex-col gap-8 px-8 py-16">
      <Link
        className={cn(
          "flex items-center gap-2 text-sm",
          "text-canvas-3 hover:text-canvas-7 cursor-pointer"
        )}
        href="https://squaremilelabs.notion.site/Backboard-Roadmap-23baece5ba1180b59daec44a563d2e86"
        target="_blank"
      >
        <Icon icon={<ExternalLinkIcon />} />
        Roadmap
      </Link>
      <Link
        className={cn(
          "flex items-center gap-2 text-sm",
          "text-canvas-3 hover:text-canvas-7 cursor-pointer"
        )}
        href="https://squaremilelabs.notion.site/23baece5ba11803880f7cb252029167e"
        target="_blank"
      >
        <Icon icon={<ExternalLinkIcon />} />
        Submit Feedback
      </Link>
    </div>
  )
}
