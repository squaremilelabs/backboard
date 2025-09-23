"use client"
import { Button } from "react-aria-components"
import { useState } from "react"
import { useViewParams } from "@/hooks/use-view-params"
import { db } from "@/database/db-client"
import { ViewListSelect } from "@/components/view-list-select"
import { RootListDataProvider } from "@/hooks/use-root-list-data"
import { RootTreeDataProvider } from "@/hooks/use-root-tree-data"
import { TreeList } from "@/components/tree-list"

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
  return (
    <div>
      {viewParams.rootScopeId !== null && (
        <Button onPress={() => setViewParam("rootScopeId", null)}>Back to Root</Button>
      )}
      <RootListDataProvider>
        <RootTreeDataProvider>
          <ViewListSelect />
          <TreeList />
        </RootTreeDataProvider>
      </RootListDataProvider>
    </div>
  )
}
