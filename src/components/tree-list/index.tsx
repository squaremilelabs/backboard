"use client"

import { TreeListScopeItem } from "./scope-item"
import { TreeListTaskItem } from "./task-item"
import { TreeListRtaskItem } from "./rtask-item"
import { useViewTreeData } from "@/hooks/use-view-tree-data"
import { ViewTreeItem } from "@/tokens/tree-list-data"
import { SMUIDataTreeList } from "~/smui/components/data-tree-list"
import { useViewTreeDragAndDrop } from "@/hooks/use-view-tree-drag-and-drop"

export function TreeList() {
  const { items } = useViewTreeData()
  const { dragAndDropHooks } = useViewTreeDragAndDrop()

  return (
    <SMUIDataTreeList
      ariaLabel="List"
      items={items}
      dragAndDropHooks={dragAndDropHooks}
      renderItemContent={(item, renderProps) => {
        if (item.kind === "scope") {
          return (
            <TreeListScopeItem
              scopeItem={item as ViewTreeItem<"scope">}
              renderProps={renderProps}
            />
          )
        }
        if (item.kind === "task") {
          return (
            <TreeListTaskItem taskItem={item as ViewTreeItem<"task">} renderProps={renderProps} />
          )
        }
        if (item.kind === "rtask") {
          return (
            <TreeListRtaskItem
              rtaskItem={item as ViewTreeItem<"rtask">}
              renderProps={renderProps}
            />
          )
        }
      }}
    />
  )
}
