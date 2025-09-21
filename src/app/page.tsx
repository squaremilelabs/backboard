"use client"

import { Button } from "react-aria-components"
import { useViewParams } from "@/hooks/use-view-params"
import { useViewTreeData } from "@/hooks/use-view-tree-data"
import { SMUIDataTreeList } from "~/smui/components/data-tree-list"
import { useViewTreeDragAndDrop } from "@/hooks/use-view-tree-drag-n-drop"

export default function Page() {
  const { items } = useViewTreeData()
  const { viewParams, setViewParam } = useViewParams()

  const { dragAndDropHooks } = useViewTreeDragAndDrop()

  return (
    <div>
      <Button
        onPress={() => setViewParam("list", viewParams.list === "current" ? "snoozed" : "current")}
      >
        Change
      </Button>
      <SMUIDataTreeList
        ariaLabel="List"
        items={items}
        classNames={{
          item: "data-drop-target:outline-2",
        }}
        renderItemContent={(item) => (
          <div
            className="p-space-md gap-space-md flex items-center
              pl-[calc(var(--tree-item-level)_*_20px)]"
          >
            <Button slot="drag">|||</Button>
            <p>{item.kind?.toUpperCase()}</p>
            <p>{item.data.title}</p>
            <p>{item.data.id}</p>
            <Button slot="chevron">{item.items?.length ?? 0}</Button>
          </div>
        )}
        dragAndDropHooks={dragAndDropHooks}
      />
    </div>
  )
}
