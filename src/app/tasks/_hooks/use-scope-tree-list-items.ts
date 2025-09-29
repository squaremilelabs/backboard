import { useMemo } from "react"
import { RootOrScopeTreeNode, ScopeTreeNode, useRootScopeTree } from "./use-root-scope-tree"
import { SMUIDataTreeListItem } from "~/smui/components/data-tree-list"

export type ScopeTreeListItem = SMUIDataTreeListItem<ScopeTreeNode>

export function useScopeTreeListItems(): ScopeTreeListItem[] {
  const { rootNode } = useRootScopeTree()
  return useMemo(() => {
    const buildItems = (node: RootOrScopeTreeNode): ScopeTreeListItem[] => {
      return node.children.map((node) => {
        return {
          id: node.id,
          label: node.scope.title,
          data: node,
          items: buildItems(node),
        }
      })
    }
    return buildItems(rootNode)
  }, [rootNode])
}
