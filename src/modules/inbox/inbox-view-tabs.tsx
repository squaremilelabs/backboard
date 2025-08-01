"use client"
import { useEffect, useRef, useState } from "react"
import {
  INBOX_VIEWS,
  InboxViewInfo,
  useCurrentInboxView,
  useCurrentInboxViewCounts,
} from "./use-inbox-view"
import { useInboxQuery } from "@/database/models/inbox"
import { ClassValue, cn } from "~/smui/utils"
import { Icon } from "~/smui/icon/components"
import { Tab, Tabs } from "~/smui/tabs/component"

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

function InboxViewTab({
  inboxId,
  view,
  count,
  className,
}: {
  inboxId: string | undefined
  view: InboxViewInfo
  count: number | null
  className: ClassValue
}) {
  const previousKeyRef = useRef<string | null>(null)
  const previousCountRef = useRef<number | null>(null)
  const [hasRecentAddition, setHasRecentAddition] = useState(false)

  useEffect(() => {
    const key = `${inboxId ?? ""}:${view.key}`

    if (previousKeyRef.current !== key) {
      setHasRecentAddition(false)
    }

    // Only trigger animation if this is not the first time seeing this key
    if (
      previousKeyRef.current === key &&
      previousCountRef.current !== null &&
      previousCountRef.current < (count || 0)
    ) {
      setHasRecentAddition(true)
      const timeout = setTimeout(() => setHasRecentAddition(false), 2500)
      return () => clearTimeout(timeout)
    }

    previousKeyRef.current = key
    previousCountRef.current = count
    return () => setHasRecentAddition(false)
  }, [inboxId, view.key, count])

  const isAccented = view.key === "open" && !!count

  return (
    <Tab
      id={view.key}
      className={[
        className,
        isAccented && [
          "bg-primary-muted-bg data-selected:bg-primary-bg",
          "hover:bg-base-bg",
          "text-primary-muted-fg data-selected:text-primary-fg",
          "border-primary-muted-border data-selected:border-primary-border",
          "divide-primary-muted-border data-selected:divide-primary-border",
        ],
        hasRecentAddition && ["outline-primary-bg outline-1 outline-dashed"],
      ]}
      textValue={view.title}
      href={`/inbox/${inboxId}/${view.key}`}
    >
      {({ isSelected }) => (
        <>
          <div className={cn("flex items-center gap-4 px-8 py-4")}>
            <Icon icon={<view.Icon />} variants={{ size: "sm" }} />
            <span>{view.title}</span>
          </div>
          {count ? (
            <span
              className={cn(
                "flex items-center justify-center px-8",
                isSelected && "font-bold",
                hasRecentAddition && [
                  "animate-bounce font-bold",
                  isAccented ? "" : "text-primary-text",
                ]
              )}
            >
              {count}
            </span>
          ) : null}
        </>
      )}
    </Tab>
  )
}
