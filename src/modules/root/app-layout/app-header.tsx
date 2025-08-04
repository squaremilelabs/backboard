"use client"
import { MenuIcon } from "lucide-react"
import { AppUserTray } from "./app-user-tray"
import { useSessionStorageUtility } from "@/common/utils/use-storage-utility"
import { useCurrentInboxView } from "@/modules/inbox/use-inbox-view"
import { InboxTitle } from "@/modules/inbox/inbox-title"
import { Button, ButtonProps } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"
import { InboxViewTabs } from "@/modules/inbox/inbox-view-tabs"

export function AppHeader() {
  const { id: inboxId } = useCurrentInboxView()
  const [sidebarOpen, setSidebarOpen] = useSessionStorageUtility("app-sidebar-open", true)
  const isInboxView = !!inboxId
  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        {/* Desktop Sidebar Trigger */}
        <NavTrigger
          className={["flex", sidebarOpen && "md:hidden"]}
          onPress={() => setSidebarOpen(true)}
        />
        {/* Title */}
        {isInboxView ? (
          <InboxTitle inboxId={inboxId} />
        ) : (
          !sidebarOpen && <p className="text-neutral-muted-text font-semibold">Inboxes</p>
        )}
        <div className="grow" />
        <AppUserTray />
      </div>
      {isInboxView && (
        <div className="mt-8">
          <InboxViewTabs inboxId={inboxId} />
        </div>
      )}
    </div>
  )
}

function NavTrigger({ className, ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      variants={{ hover: "fill" }}
      className={["text-neutral-muted-text mr-8 flex items-center gap-4 rounded-md", className]}
    >
      <Icon icon={<MenuIcon />} variants={{ size: "lg" }} />
    </Button>
  )
}
