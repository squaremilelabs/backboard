"use client"
import {
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronsUpDownIcon,
  ExternalLinkIcon,
} from "lucide-react"
import React, { useEffect } from "react"
import { SignedIn, UserButton } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Link } from "react-aria-components"
import { TaskTotalCount } from "../task/task-total-count"
import { InboxList } from "../inbox/inbox-list"
import { useSessionStorageUtility } from "@/common/utils/use-storage-utility"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"
import { cn } from "~/smui/utils"
import { Popover, PopoverTrigger } from "~/smui/popover/components"

// TODO: Update LAYOUT

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen] = useSessionStorageUtility("sidebar-open", true)
  return (
    <>
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
        <main className={cn("flex w-full flex-col", sidebarOpen && "md:pl-300")}>{children}</main>
      </div>
      <AppAccountBadge />
    </>
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
        className={cn("flex h-45 items-center gap-8", "border-b p-16")}
        variants={{ hover: "fill" }}
        onPress={() => setSidebarOpen(false)}
      >
        <Image
          src="/images/backboard-logo.svg"
          alt="Backboard"
          width={16}
          height={16}
          className="shadow-sm"
        />
        <h1 className="text-neutral-text font-semibold">Backboard</h1>
        <div className="grow" />
        <Icon icon={<ChevronsLeftIcon />} className="text-canvas-4" />
      </Button>
      <div className="max-h-full grow overflow-auto">
        <InboxList />
      </div>
      <AppRoadmapLinks />
    </nav>
  )
}

function AppHeader() {
  const [sidebarOpen, setSidebarOpen] = useSessionStorageUtility("sidebar-open", true)
  return (
    <header
      className={cn(
        !sidebarOpen ? "flex h-45 min-h-45" : "flex h-45 min-h-45 md:hidden md:h-0",
        "overflow-hidden",
        "transition-all",
        "bg-canvas-0/30 backdrop-blur-lg",
        "hover:bg-canvas-1 cursor-pointer"
      )}
    >
      {/* Sidebar trigger */}
      <Button
        onPress={() => setSidebarOpen(true)}
        className="hidden grow cursor-pointer items-center gap-8 px-16 md:flex"
        variants={{ hover: "fill" }}
      >
        <Icon icon={<ChevronsRightIcon />} className="text-canvas-4" />
        <Image
          src="/images/backboard-logo.svg"
          alt="Backboard"
          width={16}
          height={16}
          className="shadow-sm"
        />
        <h1 className="text-canvas-4 dark:text-canvas-6 font-semibold">Backboard</h1>
      </Button>
      {/* Menu trigger */}
      <AppMenu>
        <Button
          className="flex grow cursor-pointer items-center gap-8 px-16 md:hidden"
          variants={{ hover: "fill" }}
        >
          <Icon icon={<ChevronsUpDownIcon />} className="text-canvas-4" />
          <Image
            src="/images/backboard-logo.svg"
            alt="Backboard"
            width={16}
            height={16}
            className="shadow-sm"
          />
          <h1 className="text-canvas-4 dark:text-canvas-6 font-semibold">Backboard</h1>
        </Button>
      </AppMenu>
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
          content: "bg-base-bg w-350 border-2 max-h-[80dvh] overflow-auto",
        }}
      >
        <InboxList disableDragAndDrop />
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

function AppAccountBadge() {
  return (
    <SignedIn>
      <div
        className={cn(
          "fixed top-0 right-0 z-50 flex h-45 items-center",
          "flex items-center gap-8 px-16"
        )}
      >
        <TaskTotalCount />
        <UserButton />
      </div>
    </SignedIn>
  )
}
