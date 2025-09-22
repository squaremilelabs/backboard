"use client"
import { VIEW_LISTS, ViewList, ViewListDisplayItem } from "@/tokens/view-params"
import { SMUITabList, SMUITabListItem } from "~/smui/components/tab-list"
import { useViewParams } from "@/hooks/use-view-params"
import { SMUIOptionListNode } from "~/smui/components/option-list"
import { SMUIPicker } from "~/smui/components/picker"

export function ViewListSelect() {
  const { viewParams, setViewParam } = useViewParams()

  type ItemData = ViewListDisplayItem & { count: number }
  const viewTabItems: SMUITabListItem<ItemData>[] = VIEW_LISTS.map((item) => {
    // TODO: Implement counts per list type.
    return {
      id: item.key,
      label: item.label,
      data: { ...item, count: 0 },
    }
  })

  const viewPickerItems: SMUIOptionListNode<ItemData>[] = VIEW_LISTS.map((item) => {
    return {
      id: item.key,
      type: "item",
      label: item.label,
      data: { ...item, count: 0 },
    }
  })

  const renderItemContent = (itemData: ItemData) => (
    <div className="gap-space-sm flex items-center">
      <itemData.Icon className="size-content-xs min-w-content-xs" />
      <p className="grow">{itemData.label}</p>
      {/* <p>{itemData.count}</p> */}
    </div>
  )

  return (
    <div>
      <div className="hidden sm:flex">
        <SMUITabList
          selectedKey={viewParams.list}
          onSelectionChange={(key) => setViewParam("list", key as ViewList)}
          ariaLabel="Select list"
          items={viewTabItems}
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
          options={viewPickerItems}
          renderItemContent={(item, _renderProps) => {
            if (item?.type !== "item") return null
            return item.data ? renderItemContent(item.data) : null
          }}
        />
      </div>
    </div>
  )
}
