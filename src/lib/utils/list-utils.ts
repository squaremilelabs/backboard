import { DropItem, isTextDropItem } from "react-aria-components"

export function reorderIds({
  prevOrder,
  droppedIds,
  targetId,
  dropPosition,
}: {
  prevOrder: string[]
  droppedIds: string[]
  targetId: string
  dropPosition: "before" | "after" | "on"
}) {
  const filteredOrder = prevOrder.filter((id) => !droppedIds.includes(id))
  const targetIdx = filteredOrder.indexOf(targetId)
  let newOrder: string[] = []

  if (dropPosition === "before") {
    // Insert dropped tasks before the target task
    newOrder = [
      ...filteredOrder.slice(0, targetIdx),
      ...droppedIds,
      ...filteredOrder.slice(targetIdx),
    ]
  } else if (dropPosition === "after" || dropPosition === "on") {
    // Insert dropped tasks after the target task
    newOrder = [
      ...filteredOrder.slice(0, targetIdx + 1),
      ...droppedIds,
      ...filteredOrder.slice(targetIdx + 1),
    ]
  }

  return newOrder
}

export function sortItemsByIdOrder<T extends object & { id: string }>({
  items,
  idOrder,
  missingIdsPosition,
  sortMissingIds,
}: {
  items: T[]
  idOrder: string[]
  missingIdsPosition?: "start" | "end"
  sortMissingIds: (left: T, right: T) => number
}): T[] {
  const idSet = new Set(idOrder)
  const sortedItems = items
    .filter((item) => idSet.has(item.id))
    .sort((a, b) => {
      return idOrder.indexOf(a.id) - idOrder.indexOf(b.id)
    })

  const missingItems = items.filter((item) => !idSet.has(item.id))
  if (missingItems.length === 0) return sortedItems

  if (missingIdsPosition === "start") {
    return [...missingItems.sort(sortMissingIds), ...sortedItems]
  } else if (missingIdsPosition === "end") {
    return [...sortedItems, ...missingItems.sort(sortMissingIds)]
  }

  return sortedItems
}

export async function processDropItems<T>(items: DropItem[], type: string) {
  return Promise.all<T>(
    items.filter(isTextDropItem).map(async (item) => {
      return JSON.parse(await item.getText(type))
    })
  )
}
