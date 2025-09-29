"use client"
import { ChevronLeftIcon, GripVerticalIcon } from "lucide-react"
import { Button, Group } from "react-aria-components"
import { useEffect, useState } from "react"
import {
  useScopeQueryState,
  useShowInactiveScopesQueryState,
  useStatusQueryState,
} from "../_hooks/use-query-states"
import { useRootScopeTree } from "../_hooks/use-root-scope-tree"
import { useScopeTreeListItems } from "../_hooks/use-scope-tree-list-items"
import { useScopeTreeListDragAndDrop } from "../_hooks/use-scope-tree-list-dnd"
import { TaskCountChip } from "./task-count-chip"
import { SMUIDataTreeList } from "~/smui/components/data-tree-list"
import { twm } from "~/smui/utils/tailwind"

export function ScopeTreeList() {
  const [statusView] = useStatusQueryState()
  const [selectedScopeId, setSelectedScopeId] = useScopeQueryState()
  const [showInactive] = useShowInactiveScopesQueryState()

  const { rootNode, nodeById } = useRootScopeTree()

  const items = useScopeTreeListItems()
  const dragAndDropHooks = useScopeTreeListDragAndDrop()

  const [expandedIds, setExpandedIds] = useState<string[]>([])
  useEffect(() => {
    if (selectedScopeId) {
      const selectedNode = nodeById.get(selectedScopeId)
      const selectedNodeParentIds = selectedNode?.path || []
      if (selectedNodeParentIds.some((id) => !expandedIds.includes(id))) {
        const newExpandedIds = Array.from(new Set([...expandedIds, ...selectedNodeParentIds]))
        setExpandedIds(newExpandedIds)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- don't want to run every time expandedIds changes
  }, [selectedScopeId, nodeById])

  const mainCount = rootNode.taskCounts.direct[statusView]

  return (
    <Group className="flex w-[324px] flex-col">
      <Button
        onPress={() => setSelectedScopeId(null)}
        className={twm(
          "flex items-center",
          "rounded-md border-2 border-transparent",
          "px-space-lg py-space-md text-md gap-space-md",
          "hover:bg-base-bg/50",
          "text-left",
          selectedScopeId === null && "bg-base-bg border-base-border"
        )}
      >
        <p className="grow truncate">Main</p>
        {mainCount > 0 && (
          <TaskCountChip
            count={mainCount}
            color={statusView === "current" ? "primary" : "neutral"}
          />
        )}
      </Button>
      <SMUIDataTreeList
        ariaLabel="Scopes"
        items={items}
        selectionMode="single"
        selectionBehavior="toggle"
        selectedKeys={selectedScopeId ? [selectedScopeId] : []}
        expandedKeys={expandedIds}
        onExpandedChange={(keys) => setExpandedIds([...keys] as string[])}
        onSelectionChange={(keys) => setSelectedScopeId(([...keys][0] as string) || null)}
        disallowEmptySelection
        dragAndDropHooks={dragAndDropHooks}
        dependencies={[showInactive, statusView]}
        classNames={{
          item: [
            "flex items-center text-md",
            "border-2 border-transparent rounded-md",
            "px-space-lg py-space-md gap-space-md",
            "data-selected:bg-base-bg",
            "data-selected:border-base-border",
            "hover:bg-base-bg/50",
            "cursor-default",
            "data-drop-target:border-base-outline",
            "ml-[calc((var(--tree-item-level)-1)*var(--spacing-space-lg)*2)]", // indent according to level
          ],
        }}
        renderItemContent={(item, renderProps) => {
          const directCount = item.data.taskCounts.direct[statusView]
          const deepCount = item.data.taskCounts.deep[statusView]
          const displayedCount = renderProps.isExpanded ? directCount : deepCount
          return (
            <>
              <Button slot="drag">
                <GripVerticalIcon className="text-md text-neutral-muted-text shrink-0" />
              </Button>
              <p className="grow truncate">{item.data.scope.title}</p>
              {displayedCount ? (
                <TaskCountChip
                  count={displayedCount}
                  color={
                    statusView === "current"
                      ? directCount > 0
                        ? "primary"
                        : "primary-muted"
                      : directCount > 0
                        ? "neutral"
                        : "neutral-muted"
                  }
                />
              ) : null}
              {renderProps.hasChildItems ? (
                <Button slot="chevron">
                  <ChevronLeftIcon
                    className={twm(
                      "shrink-0 transition-all",
                      renderProps.isExpanded && "-rotate-90"
                    )}
                    strokeWidth={renderProps.hasChildItems ? 2.5 : 2}
                  />
                </Button>
              ) : null}
            </>
          )
        }}
      />
    </Group>
  )
}
