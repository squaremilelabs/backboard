"use client"
import { ArrowUpDownIcon, BanIcon, ChevronLeftIcon, PlusIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import {
  Button,
  Collection,
  DragAndDropHooks,
  DropIndicator,
  Group,
  Input,
  Tree,
  TreeItem,
  TreeItemContent,
  useDragAndDrop,
} from "react-aria-components"
import { twm } from "@/core/lib/tailwind"
import { db } from "@/database/db-client"
import { parseAccountUpdateInput } from "@/database/models/account"
import { parseScopeUpdateInput, Scope } from "@/database/models/scope"
import { TaskStatus } from "@/database/models/task"
import { useAuth } from "@/hooks/use-auth"
import { useRootScopeTree } from "@/hooks/use-root-scope-tree"
import { RootOrScopeTreeNode, ScopeTreeNode } from "../hooks/use-root-scope-tree"
import { badgeVariants } from "./class-variants/badge"

export function ScopeTreeList({
  selectedId,
  onSelectId,
  countStatus,
  withDragAndDrop,
}: {
  selectedId: "root" | string
  onSelectId: (id: string) => void
  countStatus?: TaskStatus
  withDragAndDrop?: boolean
}) {
  const { rootNode, nodeById } = useRootScopeTree()
  const dragAndDropHooks = useScopeTreeListDragAndDrop()

  // When rootNode or passed selectedId changes, ensure it's expanded
  const [expandedIds, setExpandedIds] = useState(new Set<string>())
  useEffect(() => {
    if (selectedId) {
      const selectedNode = nodeById.get(selectedId)
      if (selectedNode) {
        const newExpandedIds = new Set(expandedIds)
        selectedNode.path.forEach((id) => newExpandedIds.add(id))
        setExpandedIds(newExpandedIds)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only want to run when selectedId changes
  }, [nodeById, selectedId])

  const { children: rootChildren, ...rootWithoutChildren } = rootNode

  const items: RootOrScopeTreeNode[] = [
    { ...rootWithoutChildren, id: "root", children: [] },
    ...rootChildren,
  ]

  return (
    <div className="gap-space-sm flex flex-col">
      <Tree
        aria-label="Scopes"
        items={items}
        selectionMode="single"
        selectionBehavior="toggle"
        selectedKeys={selectedId ? [selectedId] : []}
        onSelectionChange={(keys) => onSelectId([...keys][0] as string)}
        expandedKeys={expandedIds}
        onExpandedChange={(keys) => setExpandedIds(keys as Set<string>)}
        disallowEmptySelection
        className={twm("gap-space-sm flex flex-col")}
        dragAndDropHooks={withDragAndDrop ? dragAndDropHooks : undefined}
        dependencies={[countStatus, rootNode]}
      >
        {function renderNode(node) {
          // Note the recursion!
          return (
            <ScopeTreeListItem
              isRoot={node.id === rootNode.id}
              node={node}
              renderNode={renderNode}
              countStatus={countStatus}
            />
          )
        }}
      </Tree>
      <ScopeTreeCreateField />
    </div>
  )
}

function ScopeTreeListItem({
  isRoot: _isRoot,
  node,
  renderNode,
  countStatus,
}: {
  isRoot: boolean
  node: RootOrScopeTreeNode
  renderNode: (node: ScopeTreeNode) => React.ReactNode
  countStatus?: TaskStatus
}) {
  const { id, scope, taskCounts } = node

  const directCount = countStatus ? (taskCounts.direct[countStatus] ?? 0) : 0
  const deepCount = countStatus ? (taskCounts.deep[countStatus] ?? 0) : 0
  const descendantCount = deepCount - directCount

  return (
    <TreeItem
      id={id}
      textValue={scope?.title || "Main"}
      className={twm([
        "flex items-stretch",
        "transition-all",
        "rounded-md border-2 border-transparent",
        "hover:bg-base-bg/70",
        "selected:bg-base-bg selected:border-base-border",
        "drop-target:outline-2 drop-target:my-2",
        "ml-[calc((var(--tree-item-level)-1)*var(--spacing-space-lg)*2)]",
      ])}
    >
      <TreeItemContent>
        {({ isExpanded, allowsDragging, hasChildItems, isDragging }) => {
          return (
            <>
              <div
                className={twm(
                  "flex grow items-center truncate",
                  "pl-space-lg py-space-md gap-space-md"
                )}
              >
                {allowsDragging && (
                  <Button slot="drag" className={"sr-only"} excludeFromTabOrder></Button>
                )}
                {isDragging && <ArrowUpDownIcon className="text-base-outline" strokeWidth={2.5} />}
                {countStatus && directCount ? (
                  <span
                    className={badgeVariants({
                      color: countStatus === "current" ? "primary" : "neutral",
                    })}
                  >
                    {directCount}
                  </span>
                ) : null}
                <p className="grow truncate">{scope?.title || "Main"}</p>
              </div>
              {hasChildItems ? (
                <Button
                  slot={"chevron"}
                  className={twm(
                    "flex items-center justify-center",
                    "shrink-0 transition-all",
                    "h-box-md rounded-md",
                    "hover:bg-neutral-muted-bg hover:text-base-text",
                    "pl-space-lg gap-space-sm"
                  )}
                >
                  {!isExpanded && descendantCount > 0 && (
                    <span
                      className={badgeVariants({
                        color: countStatus === "current" ? "primary" : "neutral",
                        type: "outline",
                      })}
                    >
                      {descendantCount}
                    </span>
                  )}
                  <div className="mr-space-lg flex justify-center">
                    <ChevronLeftIcon
                      className={twm("transition-all", isExpanded && "-rotate-90")}
                    />
                  </div>
                </Button>
              ) : null}
            </>
          )
        }}
      </TreeItemContent>
      <Collection items={node.children ?? []}>{renderNode}</Collection>
    </TreeItem>
  )
}

function ScopeTreeCreateField({}) {
  const [title, setTitle] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <Group
      className={twm([
        "flex items-center",
        "px-space-lg gap-space-md",
        "rounded-md border-2 border-transparent",
        "focus-within:bg-base-bg/70",
        "hover:bg-base-bg/50",
      ])}
    >
      <Button
        onPress={() => inputRef.current?.focus()}
        excludeFromTabOrder
        className={"!outline-0"}
      >
        <PlusIcon />
      </Button>
      <Input
        ref={inputRef}
        placeholder="Add scope of work"
        className={twm(["py-space-md grow", "!outline-0"])}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
    </Group>
  )
}

function useScopeTreeListDragAndDrop(): DragAndDropHooks<ScopeTreeNode> {
  const { account } = useAuth()
  const { rootNode, nodeById } = useRootScopeTree()

  // Helper function to be utilized inside of drag and drop handlers
  const rootScopeOrderUpdateTxn = (newOrder: string[]) => {
    const { data } = parseAccountUpdateInput({ list_orders: { scopes: newOrder } })
    return db.tx.accounts[account!.id].merge(data)
  }

  const scopeScopeOrderUpdateTxn = (scopeId: string, newOrder: string[]) => {
    const { data } = parseScopeUpdateInput({ list_orders: { scopes: newOrder } })
    return db.tx.scopes[scopeId].merge(data)
  }

  const scopeLinkParentScopeTxn = (scopeId: string, parentIdToLink: string) => {
    return db.tx.scopes[scopeId].link({ parent_scope: parentIdToLink })
  }

  const scopeUnlinkParentScopeTxn = (scopeId: string, parentIdToUnlink: string) => {
    return db.tx.scopes[scopeId].unlink({ parent_scope: parentIdToUnlink })
  }

  type DatabaseTxn =
    | ReturnType<typeof rootScopeOrderUpdateTxn>
    | ReturnType<typeof scopeScopeOrderUpdateTxn>
    | ReturnType<typeof scopeLinkParentScopeTxn>
    | ReturnType<typeof scopeUnlinkParentScopeTxn>

  const { dragAndDropHooks } = useDragAndDrop<RootOrScopeTreeNode>({
    getItems: (keys) => {
      return [...keys]
        .map((key) => {
          const node = nodeById.get(key as string)
          if (!node) return null
          const dragItem: {
            "text/plain": string
            "db/scope"?: string
          } = {
            "text/plain": node.scope?.title || "Main",
          }
          if (node.scope) {
            dragItem["db/scope"] = JSON.stringify(node.scope)
          }
          return dragItem
        })
        .filter((item) => item !== null)
    },
    acceptedDragTypes: ["db/scope"],
    shouldAcceptItemDrop(target, keys) {
      if (keys.has("db/scope")) {
        // Allow drops after root (which moves item to top of list)
        // Prevent drops on or before root
        if (target.key === "root") {
          return target.dropPosition === "after"
        }
        return true
      }
      return true
    },
    renderDragPreview(items) {
      // For now, only render single item preview
      const scope = JSON.parse(items[0]?.["db/scope"] ?? null) as Scope | null
      return (
        <div
          className={twm(
            "flex items-center justify-center",
            "size-box-md rounded-md",
            "bg-base-bg text-base-outline",
            !scope && "text-neutral-text"
          )}
        >
          {scope ? <ArrowUpDownIcon strokeWidth={2.5} /> : <BanIcon />}
        </div>
      )
    },
    renderDropIndicator(target) {
      const isRoot = target.type === "item" && target.key === "root"
      const isBeforeOrOnRoot = isRoot && target.dropPosition !== "after"
      return (
        <DropIndicator
          target={target}
          className={twm([
            "bg-base-outline rounded-full",
            "my-[1px] h-[2px]",
            "ml-[calc((var(--tree-item-level)-1)*var(--spacing-space-lg)*2)]",
            isBeforeOrOnRoot && "hidden",
          ])}
        />
      )
    },
    onMove({ keys, target }) {
      // Extracted variables for readability

      // ? Note: RAC allows for multiple selected keys, but we only move the first item for now
      const movedScopeId = ([...keys] as string[])[0]
      const targetScopeId = target.key as string
      const dropPosition = target.dropPosition

      // Special handling for root: treat it as the root (null parent)
      const targetScopeParentId =
        targetScopeId === "root" ? null : nodeById.get(targetScopeId)?.path.slice(-1)[0] || null

      // push database transactions into this array using the helper functions defined above
      // e.g., `txns.push(rootScopeOrderUpdateTxn(newOrder))`
      const txns: DatabaseTxn[] = []

      // # LLM Implemented Code
      // Derive source and destination parents from current tree
      const movedNode = nodeById.get(movedScopeId)
      if (!movedNode) {
        return
      }
      const sourceParentId = movedNode.path.slice(-1)[0] || null

      const isDropOn = dropPosition === "on"
      const destParentId = isDropOn ? targetScopeId : targetScopeParentId

      // No-ops and invalid cases
      if (movedScopeId === targetScopeId) {
        return
      }
      // Prevent moving on or before root (but allow after, which places at top of list)
      if (targetScopeId === "root" && dropPosition !== "after") {
        return
      }
      // Prevent moving into its own descendant (cycle protection)
      if (destParentId) {
        if (destParentId === movedScopeId) return
        const destParentNode = nodeById.get(destParentId)
        if (destParentNode && destParentNode.path.includes(movedScopeId)) return
      }

      // Helpers to read current displayed children order from the sorted tree
      const getChildrenIds = (parentId: string | null): string[] => {
        if (parentId === null) return rootNode.children.map((c) => c.id)
        const parentNode = nodeById.get(parentId)
        return parentNode ? parentNode.children.map((c) => c.id) : []
      }

      // Filter out root from arrays before persisting to DB
      const filterRootNode = (ids: string[]) => ids.filter((id) => id !== "root")

      // Build starting arrays based on UI order
      const sourceChildren = getChildrenIds(sourceParentId)
      const targetChildren =
        destParentId === sourceParentId ? sourceChildren.slice() : getChildrenIds(destParentId)

      // If the item isn't actually present in source list (shouldn't happen), bail
      const sourceIndex = sourceChildren.indexOf(movedScopeId)
      if (sourceIndex === -1) return

      // Remove from source list representation
      const sourceAfter = sourceChildren.slice()
      sourceAfter.splice(sourceIndex, 1)

      // Compute insertion index in target list representation
      let insertIndex: number
      if (isDropOn) {
        insertIndex = targetChildren.length // append at end when dropping ON
      } else if (targetScopeId === "root" && dropPosition === "after") {
        // Special case: dropping after root means insert at beginning of root's children
        insertIndex = 0
      } else {
        const targetIndexInTargetList = (
          destParentId === sourceParentId ? sourceAfter : targetChildren
        ).indexOf(targetScopeId)
        if (targetIndexInTargetList === -1) {
          return
        }
        insertIndex =
          dropPosition === "before" ? targetIndexInTargetList : targetIndexInTargetList + 1
      }

      // Build new target list after insertion
      const targetAfter = destParentId === sourceParentId ? sourceAfter : targetChildren.slice()
      // If moving within same parent and removing item before target, the target index is already computed on sourceAfter above
      targetAfter.splice(insertIndex, 0, movedScopeId)

      // If moving within the same parent and order didn't change, bail
      if (destParentId === sourceParentId) {
        const unchanged =
          targetAfter.length === sourceChildren.length &&
          targetAfter.every((id, i) => id === sourceChildren[i])
        if (unchanged) {
          return
        }
      }

      // Persist ordering: update source and/or destination order arrays
      const persistOrderForParent = (parentId: string | null, newOrder: string[]) => {
        if (parentId === null) {
          txns.push(rootScopeOrderUpdateTxn(newOrder))
        } else {
          txns.push(scopeScopeOrderUpdateTxn(parentId, newOrder))
        }
      }

      if (destParentId === sourceParentId) {
        // Same parent reordering
        const filtered = filterRootNode(targetAfter)
        persistOrderForParent(sourceParentId, filtered)
      } else {
        // Cross-parent move: update both source and destination orders
        const filteredSource = filterRootNode(sourceAfter)
        const filteredTarget = filterRootNode(targetAfter)

        persistOrderForParent(sourceParentId, filteredSource)
        persistOrderForParent(destParentId, filteredTarget)
      }

      // Persist parent/child relationship
      if (destParentId === sourceParentId) {
        // Only a reorder, no parent change
      } else if (destParentId === null) {
        // Move to root: unlink previous parent
        if (sourceParentId) txns.push(scopeUnlinkParentScopeTxn(movedScopeId, sourceParentId))
      } else {
        // Move under a new parent scope
        txns.push(scopeLinkParentScopeTxn(movedScopeId, destParentId))
      }

      // Final batch commit of transactions
      db.transact(txns)
    },
  })

  return dragAndDropHooks
}
