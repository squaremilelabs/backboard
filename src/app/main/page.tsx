"use client"

import { Button } from "react-aria-components"
import { useTreeData } from "react-stately"
import { TreeItem, useViewParams, useTreeItems, useViewTreeState } from "./state"

export default function MainPage() {
  const { isLoading, items, key } = useTreeItems()
  const { viewParams, setViewParam } = useViewParams()

  return (
    <div>
      <Button
        onPress={() => setViewParam("view", viewParams.view === "current" ? "snoozed" : "current")}
      >
        Test Button
      </Button>
      <Tree id={key} key={key} items={items} />
    </div>
  )
}

function Tree({ id, items }: { id: string; items: TreeItem[] }) {
  const tree = useTreeData({
    initialItems: items,
    getKey: (item) => item.id,
    getChildren: (item) => (item.kind === "scope" ? (item.items ?? []) : []),
  })
  console.log(id)
  console.log(tree)
  useViewTreeState({ baseTree: tree })
  return <div />
}
