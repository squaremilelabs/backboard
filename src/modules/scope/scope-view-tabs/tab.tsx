"use client"
import { useEffect, useRef, useState } from "react"
import { ScopeViewInfo, useCurrentScopeView } from "../use-scope-views"
import { ClassValue, cn } from "~/smui/utils"
import { ListBoxItem } from "~/smui/list-box/components"
import { useSessionStorageUtility } from "@/common/utils/use-storage-utility"
import { Icon } from "~/smui/icon/components"

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

  const isAccented = view.key === "current" && !!count
  const [isTasksDragging] = useSessionStorageUtility("is-tasks-dragging", false)
  const isDroppable = view.key !== "recurring" && currentView !== view.key

  return (
    <ListBoxItem
      id={view.key}
      className={[
        className,
        [
          "flex items-stretch justify-between",
          // "grow",
          "rounded-sm",
          "text-sm",
          "min-w-fit",
          "border-b-2",
          "gap-8 px-8 pt-8 pr-12 pb-6",
          // "divide-x rounded-sm border",
          "text-neutral-muted-text",
          // "data-selected:border",
          "data-selected:text-base-text",
          "data-selected:border-base-outline",
          // "data-selected:border-neutral-muted-border",
          // "data-selected:divide-neutral-muted-border",
          "data-selected:font-semibold",
          // "data-selected:bg-neutral-muted-bg",
          "hover:bg-neutral-muted-bg/50",
          "data-selected:border-b-4",
        ],
        isAccented && [
          "text-primary-text",
          // "data-selected:bg-primary-muted-bg",
          // "border-primary-muted-border",
          // "data-selected:text-primary-text",
        ],
        isTasksDragging && isDroppable && ["outline-primary-bg outline-1 outline-dashed"],
        ["data-drop-target:outline-2", "data-drop-target:outline-solid"],
      ]}
      textValue={view.title}
      href={`/scope/${scopeId}/${view.key}`}
    >
      {({ isSelected }) => (
        <>
          <div className={cn("flex items-center gap-4")}>
            <Icon icon={<view.Icon />} variants={{ size: "sm" }} />
            <span>{view.title}</span>
          </div>
          {count ? (
            <span
              className={cn(
                "flex items-center justify-center",
                isSelected && "font-bold",
                hasRecentAddition && ["animate-bounce font-bold", "text-primary-text"]
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
