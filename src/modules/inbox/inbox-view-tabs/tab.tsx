"use client"

import { useEffect, useRef, useState } from "react"
import { InboxViewInfo } from "../use-inbox-view"
import { ClassValue, cn } from "~/smui/utils"
import { Icon } from "~/smui/icon/components"
import { Tab } from "~/smui/tabs/component"

export function InboxViewTab({
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
          "text-primary-text",
          "data-selected:bg-primary-muted-bg",
          "data-selected:text-primary-muted-fg",
          "data-selected:border-primary-muted-border",
          "data-selected:divide-primary-muted-border",
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
