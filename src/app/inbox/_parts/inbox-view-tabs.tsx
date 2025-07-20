import { Tab, TabList, Tabs } from "react-aria-components"
import { useParams } from "next/navigation"
import { cn } from "~/smui/utils"
import { Icon, IconKey } from "@/lib/components/icon"

export type InboxView = "inbox" | "snoozed" | "complete" | "archive"

const INBOX_VIEWS: { key: InboxView; title: string; icon: IconKey; slug: string }[] = [
  { key: "inbox", title: "Inbox", icon: "inbox", slug: "" },
  { key: "snoozed", title: "Snoozed", icon: "snooze", slug: "snoozed" },
  { key: "complete", title: "Complete", icon: "complete", slug: "complete" },
  { key: "archive", title: "Archive", icon: "archive", slug: "archive" },
]

export function InboxViewTabs() {
  const { id: currentInboxId, view: currentView } = useParams<{ id: string; view: string }>()
  return (
    <Tabs orientation="horizontal">
      <TabList className="flex items-center gap-16 border-b">
        {INBOX_VIEWS.map((view) => {
          const isActive = view.key === "inbox" && !currentView ? true : currentView === view.slug
          return (
            <Tab
              key={view.key}
              href={`/inbox/${currentInboxId}/${view.slug}`}
              className={cn(
                "flex cursor-pointer items-center gap-8 px-16 py-4 text-neutral-400",
                isActive ? "border-b-2 border-neutral-600 font-semibold text-neutral-600" : "",
                "!outline-0",
                "focus-visible:border-yellow-600 focus-visible:text-yellow-600"
              )}
            >
              <Icon icon={view.icon} size="sm" />
              <p>{view.title}</p>
            </Tab>
          )
        })}
      </TabList>
    </Tabs>
  )
}
