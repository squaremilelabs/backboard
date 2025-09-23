"use client"
import { VIEW_LISTS, ViewList, ViewListDisplayItem } from "@/tokens/view-params"
import { SMUITabList } from "~/smui/components/tab-list"
import { useViewParams } from "@/hooks/use-view-params"
import { SMUIPicker } from "~/smui/components/picker"
import { useRootTreeData } from "@/hooks/use-root-tree-data"

export function ViewListSelect() {
  const { viewParams, setViewParam } = useViewParams()
  const { getTreeDataByScopeId } = useRootTreeData()

  const rootData = getTreeDataByScopeId(viewParams.rootScopeId)

  type ItemData = ViewListDisplayItem & { count: number }
  const items = VIEW_LISTS.map((item) => {
    let count = 0
    if (item.key === "recurring") {
      count = rootData?.counts.rtasks ?? 0
    } else {
      count = rootData?.counts.tasks[item.key] ?? 0
    }
    return {
      id: item.key,
      label: item.label,
      data: { ...item, count },
    }
  })

  const renderItemContent = (itemData: ItemData) => (
    <div className="gap-space-sm flex items-center">
      <itemData.Icon className="size-content-xs min-w-content-xs" />
      <p className="grow">{itemData.label}</p>
      <p>{itemData.count}</p>
    </div>
  )

  return (
    <div>
      <div className="hidden sm:flex">
        <SMUITabList
          selectedKey={viewParams.list}
          onSelectionChange={(key) => setViewParam("list", key as ViewList)}
          ariaLabel="Select list"
          items={items}
          classNames={{
            list: "flex gap-space-md",
            tab: [
              "px-space-md py-space-sm text-sm",
              "border-b-2 data-selected:border-base-outline",
              "cursor-pointer hover:bg-neutral-muted-bg",
            ],
          }}
          renderItemContent={(item, _renderProps) => {
            return item?.data ? renderItemContent(item.data) : null
          }}
        />
      </div>
      <div className="flex sm:hidden">
        <SMUIPicker
          ariaLabel="Select list"
          selectedKey={viewParams.list}
          onSelectionChange={(key) => setViewParam("list", key as ViewList)}
          options={items.map((i) => ({ ...i, type: "item" }))}
          renderItemContent={(item, _renderProps) => {
            if (item?.type !== "item") return null
            return item.data ? renderItemContent(item.data) : null
          }}
        />
      </div>
    </div>
  )
}
