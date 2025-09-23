import { ViewTreeItem } from "@/tokens/tree-list-data"
import { SMUIDataTreeListItemRenderProps } from "~/smui/components/data-tree-list"

export function TreeListTaskItem({
  taskItem,
  renderProps: __,
}: {
  taskItem: ViewTreeItem<"task">
  renderProps: SMUIDataTreeListItemRenderProps
}) {
  return (
    <div className="gap-space-md flex items-center">
      <p>{taskItem.data.title}</p>
    </div>
  )
}
