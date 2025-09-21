import { DropItem, isTextDropItem, Key } from "react-aria-components"

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
  // No-op if nothing to move or target is not in the list
  if (
    droppedIds.length === 0 ||
    !prevOrder.includes(targetId) ||
    droppedIds.every((id) => !prevOrder.includes(id))
  ) {
    return prevOrder
  }

  // If the target is one of the dragged items, treat as a no-op
  // (dropping an item/block onto itself should not change order)
  if (droppedIds.includes(targetId)) {
    return prevOrder
  }

  // Remove droppedIds from prevOrder
  const filteredOrder = prevOrder.filter((id) => !droppedIds.includes(id))
  const targetIdx = filteredOrder.indexOf(targetId)

  // Calculate intended insertIdx
  let insertIdx =
    dropPosition === "before"
      ? targetIdx
      : dropPosition === "after" || dropPosition === "on"
        ? targetIdx + 1
        : targetIdx

  // Clamp insertIdx
  if (insertIdx < 0) insertIdx = 0
  if (insertIdx > filteredOrder.length) insertIdx = filteredOrder.length

  // Find the indices of the dropped items in the original order
  const currentIndices = droppedIds.map((id) => prevOrder.indexOf(id))
  const minCurrentIdx = Math.min(...currentIndices)
  const maxCurrentIdx = Math.max(...currentIndices)

  // If dropping before itself (first dropped item), no-op
  if (
    droppedIds.length === 1 &&
    ((dropPosition === "before" &&
      prevOrder.indexOf(droppedIds[0]) === prevOrder.indexOf(targetId)) ||
      (dropPosition === "after" &&
        prevOrder.indexOf(droppedIds[0]) === prevOrder.indexOf(targetId) + 1) ||
      (dropPosition === "on" &&
        prevOrder.indexOf(droppedIds[0]) === prevOrder.indexOf(targetId) + 1))
  ) {
    return prevOrder
  }

  // For multi-select, check if the block is being dropped at its own position
  if (
    droppedIds.length > 1 &&
    minCurrentIdx === prevOrder.indexOf(targetId) &&
    maxCurrentIdx === prevOrder.indexOf(targetId) + droppedIds.length - 1 &&
    (dropPosition === "before" || dropPosition === "on")
  ) {
    return prevOrder
  }
  if (
    droppedIds.length > 1 &&
    minCurrentIdx === prevOrder.indexOf(targetId) - droppedIds.length + 1 &&
    maxCurrentIdx === prevOrder.indexOf(targetId) &&
    dropPosition === "after"
  ) {
    return prevOrder
  }

  // Adjust insertIdx if moving forward in the list (i.e., after its current position)
  // If the first dropped item's original index is before insertIdx in prevOrder, subtract droppedIds.length
  // Note: insertIdx is computed against filteredOrder (which already excludes droppedIds),
  // so no additional adjustment is needed here. Extra adjustments can lead to no-ops or wrong positions.

  // Insert droppedIds at insertIdx
  const newOrder: string[] = [
    ...filteredOrder.slice(0, insertIdx),
    ...droppedIds,
    ...filteredOrder.slice(insertIdx),
  ]

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

export function processItemKeys<T extends { id: string }>(
  keys: Set<Key>,
  items: T[],
  type: string
) {
  const ids = [...keys]
  return ids.map((id) => {
    return {
      [type]: JSON.stringify(items.find((item) => item.id === id)),
    }
  })
}

export async function processDropItems<T>(items: DropItem[], type: string) {
  return Promise.all<T>(
    items.filter(isTextDropItem).map(async (item) => {
      return JSON.parse(await item.getText(type))
    })
  )
}
