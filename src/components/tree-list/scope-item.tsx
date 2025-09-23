import { useRootTreeData } from "@/hooks/use-root-tree-data"
import { useViewParams } from "@/hooks/use-view-params"
import { ViewTreeItem } from "@/tokens/tree-list-data"
import { SMUIDataTreeListItemRenderProps } from "~/smui/components/data-tree-list"

export function TreeListScopeItem({
  scopeItem,
  renderProps: _,
}: {
  scopeItem: ViewTreeItem<"scope">
  renderProps: SMUIDataTreeListItemRenderProps
}) {
  const { viewParams } = useViewParams()
  const { data: scope } = scopeItem
  const { getTreeDataByScopeId } = useRootTreeData()
  const treeData = getTreeDataByScopeId(scopeItem.id)!

  const taskCount =
    viewParams.list === "recurring"
      ? treeData.counts.rtasks
      : treeData.counts.tasks[viewParams.list]

  return (
    <div className="gap-space-md flex items-center">
      <p>{scope.title}</p>
      <p>{taskCount}</p>
    </div>
  )
}
