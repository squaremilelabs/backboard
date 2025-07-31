"use client"

import { INBOX_VIEWS, useCurrentInboxView, useCurrentInboxViewCounts } from "../inbox-views"
import { Inbox } from "@/database/models/inbox"
import { cn } from "~/smui/utils"
import { Icon } from "~/smui/icon/components"
import { Tab, Tabs } from "~/smui/tabs/component"

export function InboxLayoutViewTabs({ inbox }: { inbox: Inbox | null | undefined }) {
  const { view: currentView } = useCurrentInboxView()
  const counts = useCurrentInboxViewCounts()

  return (
    <Tabs
      orientation="horizontal"
      keyboardActivation="manual"
      items={INBOX_VIEWS}
      dependencies={[inbox, counts.archived, counts.open, counts.snoozed, counts.recurring]}
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
          "data-selected:border-neutral-muted-border",
          "data-selected:divide-neutral-muted-border",
          "data-selected:font-semibold",
          "hover:bg-neutral-muted-bg/50",
          "data-selected:bg-neutral-muted-bg",
        ],
      }}
    >
      {(view, classNames) => {
        let displayedCount = (counts[view.key] || "").toString()
        if (view.key === "archived" && (counts[view.key] || 0) > 29) {
          displayedCount = "29+"
        }
        const isAccented = view.key === "open" && !!displayedCount
        return (
          <Tab
            id={view.key}
            className={[
              classNames.tab,
              isAccented && [
                "bg-primary-muted-bg data-selected:bg-primary-bg",
                "hover:bg-base-bg",
                "text-primary-muted-fg data-selected:text-primary-fg",
                "border-primary-muted-border data-selected:border-primary-border",
                "divide-primary-muted-border data-selected:divide-primary-border",
              ],
            ]}
            textValue={view.title}
            href={`/inbox/${inbox?.id}/${view.key}`}
          >
            {({ isSelected }) => (
              <>
                <div className={cn("flex items-center gap-4 px-8 py-4")}>
                  <Icon icon={<view.Icon />} variants={{ size: "sm" }} />
                  <span>{view.title}</span>
                </div>
                {displayedCount ? (
                  <span
                    className={cn(
                      "flex items-center justify-center px-8",
                      isSelected && "font-bold"
                    )}
                  >
                    {displayedCount}
                  </span>
                ) : null}
              </>
            )}
          </Tab>
        )
      }}
    </Tabs>
  )
}
