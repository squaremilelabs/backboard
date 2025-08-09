"use client"
import { useEffect, useRef, useState } from "react"
import { ScopeViewInfo, useCurrentScopeView } from "../use-scope-views"
import { ClassValue, cn } from "~/smui/utils"
import { Icon } from "~/smui/icon/components"
import { ListBoxItem } from "~/smui/list-box/components"
import { useSessionStorageUtility } from "@/common/utils/use-storage-utility"

export function ScopeViewTab({
  scopeId,
  view,
  count,
  className,
}: {
  scopeId: string | undefined
  view: ScopeViewInfo
  count: number | null
  className: ClassValue
}) {
  const { view: currentView } = useCurrentScopeView()
  const previousKeyRef = useRef<string | null>(null)
  const previousCountRef = useRef<number | null>(null)
  const [hasRecentAddition, setHasRecentAddition] = useState(false)

  useEffect(() => {
    const key = `${scopeId ?? ""}:${view.key}`
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
  }, [scopeId, view.key, count])

  const isAccented = view.key === "now" && !!count
  const [isTasksDragging] = useSessionStorageUtility("is-tasks-dragging", false)
  const isDroppable = view.key !== "recurring" && currentView !== view.key

  return (
    <ListBoxItem
      id={view.key}
      className={[
        className,
        [
          "flex items-stretch",
          "text-sm",
          "min-w-fit",
          "divide-x rounded-sm border",
          "text-neutral-muted-text data-selected:text-base-text",
          "data-selected:border",
          "data-selected:border-neutral-muted-border",
          "data-selected:divide-neutral-muted-border",
          "data-selected:font-semibold",
          "hover:bg-neutral-muted-bg/50",
          "data-selected:bg-neutral-muted-bg",
        ],
        isAccented && [
          "text-primary-text border-primary-muted-border divide-primary-muted-border",
          "data-selected:bg-primary-muted-bg",
          "data-selected:text-primary-muted-fg",
          "data-selected:border-primary-muted-border",
          "data-selected:divide-primary-muted-border",
        ],
        (hasRecentAddition || (isTasksDragging && isDroppable)) && [
          "outline-primary-bg outline-1 outline-dashed",
        ],
        ["data-drop-target:outline-2", "data-drop-target:outline-solid"],
      ]}
      textValue={view.title}
      href={`/scope/${scopeId}/${view.key}`}
    >
      {({ isSelected }) => (
        <>
          <div className={cn("flex items-center gap-4 px-8 py-6")}>
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
    </ListBoxItem>
  )
}
