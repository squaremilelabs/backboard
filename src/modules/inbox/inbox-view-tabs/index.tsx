"use client"

import { INBOX_VIEWS, useCurrentInboxView, useCurrentInboxViewCounts } from "../use-inbox-view"
import { InboxViewTab } from "./tab"
import { useInboxQuery } from "@/database/models/inbox"
import { Tabs } from "~/smui/tabs/component"

export function InboxViewTabs({ inboxId }: { inboxId: string }) {
  const inboxQuery = useInboxQuery(inboxId ? { $: { where: { id: inboxId }, first: 1 } } : null)
  const inbox = inboxQuery.data?.[0]

  const { view: currentView } = useCurrentInboxView()
  const counts = useCurrentInboxViewCounts()

  return (
    <Tabs
      orientation="horizontal"
      keyboardActivation="manual"
      items={INBOX_VIEWS}
      dependencies={[inbox, counts, currentView]}
      selectedKey={currentView}
      classNames={{
        base: "max-w-full overflow-x-auto p-2",
        tabList: ["flex items-center gap-4 min-w-fit"],
        tab: [
          "flex items-stretch",
          "text-sm",
          "min-w-fit",
          "border divide-x rounded-sm",
          "text-neutral-muted-text data-selected:text-base-text",
          "data-selected:border-2",
          "data-selected:border-neutral-muted-border",
          "data-selected:divide-neutral-muted-border",
          "data-selected:font-semibold",
          "hover:bg-neutral-muted-bg/50",
          "data-selected:bg-neutral-muted-bg",
        ],
      }}
    >
      {(view, classNames) => {
        return (
          <InboxViewTab
            inboxId={inbox?.id}
            view={view}
            count={counts[view.key] ?? null}
            className={classNames.tab}
          />
        )
      }}
    </Tabs>
  )
}
