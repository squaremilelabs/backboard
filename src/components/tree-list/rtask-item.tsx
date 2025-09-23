import { ViewTreeItem } from "@/tokens/tree-list-data"
import { SMUIDataTreeListItemRenderProps } from "~/smui/components/data-tree-list"

export function TreeListRtaskItem({
  rtaskItem,
  renderProps: __,
}: {
  rtaskItem: ViewTreeItem<"rtask">
  renderProps: SMUIDataTreeListItemRenderProps
}) {
  return (
    <div className="gap-space-md flex items-center">
      <p>{rtaskItem.data.title}</p>
    </div>
  )
}
