"use client"
import { Button } from "react-aria-components"
import { useState } from "react"
import { useViewParams } from "@/hooks/use-view-params"
import { useViewTreeData } from "@/hooks/use-view-tree-data"
import { SMUIDataTreeList } from "~/smui/components/data-tree-list"
import { useViewTreeDragAndDrop } from "@/hooks/use-view-tree-drag-and-drop"
import { db } from "@/database/db-client"
import { ViewListSelect } from "@/components/view-list-select"

export default function Page() {
  const [_showInactive, _setShowInactive] = useState(false)

  // # Instant errors demonstration for bug report

  db.useQuery({
    tasks: {
      $: {
        where: {
          /**
           * ! Runtime error
           * Error: `At path 'tasks.$.where.scope.id': Invalid value for id field in entity 'scopes'. Expected a UUID, but received: [object Object]`
           * https://www.instantdb.com/docs/patterns#find-entities-with-no-links
           */
          // "scope.id": { $isNull: true },
          /**
           * ! Typescript / build error
           * Does not accept `undefined` for relational fields.
           * Intended for conditionally ommitting the filter (works for non-relational fields).
           */
          // "scope.is_inactive": _showInactive ? undefined : false,
        },
      },
    },
  })

  const { viewParams, setViewParam } = useViewParams()
  const { items } = useViewTreeData()
  const { dragAndDropHooks } = useViewTreeDragAndDrop()
  return (
    <div>
      {viewParams.rootScopeId !== null && (
        <Button onPress={() => setViewParam("rootScopeId", null)}>Back to Root</Button>
      )}
      <ViewListSelect />
      <SMUIDataTreeList
        ariaLabel="List"
        items={items}
        selectionMode="multiple"
        classNames={{
          list: "flex flex-col p-space-md gap-space-md",
          item: "data-drop-target:outline data-selected:bg-neutral-muted-bg",
        }}
        renderItemContent={(item) => (
          <div
            className="p-space-md gap-space-md flex items-center
              pl-[calc(var(--tree-item-level)_*_20px)]"
          >
            <Button slot="drag">|||</Button>
            <p>{item.kind?.toUpperCase()}</p>
            <p>{item.data.title}</p>
            <Button slot="chevron">expand</Button>
            {item.kind === "scope" && (
              <Button onPress={() => setViewParam("rootScopeId", item.id)}>Open</Button>
            )}
          </div>
        )}
        dragAndDropHooks={dragAndDropHooks}
      />
    </div>
  )
}
