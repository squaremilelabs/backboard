"use client"
import { MenuIcon } from "lucide-react"
import { AppUserTray } from "./app-user-tray"
import { useSessionStorageUtility } from "@/common/utils/use-storage-utility"
import { useCurrentInboxView } from "@/modules/inbox/use-inbox-view"
import { InboxTitle } from "@/modules/inbox/inbox-title"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"
import { InboxViewTabs } from "@/modules/inbox/inbox-view-tabs"

export function AppHeader() {
  const { id: inboxId } = useCurrentInboxView()
  const [sidebarOpen, setSidebarOpen] = useSessionStorageUtility("app-sidebar-open", true)
  const isInboxView = !!inboxId
  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        {/* Sidebar Trigger */}
        <Button
          variants={{ hover: "fill" }}
          onPress={() => setSidebarOpen(true)}
          className={[
            "text-neutral-muted-text mr-8 flex items-center gap-4 rounded-md",
            sidebarOpen && "md:hidden",
          ]}
        >
          <Icon icon={<MenuIcon />} variants={{ size: "lg" }} />
          {!isInboxView && <span className="text-neutral-muted-text font-semibold">Inboxes</span>}
        </Button>
        {/* Title */}
        {isInboxView && <InboxTitle inboxId={inboxId} />}
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
