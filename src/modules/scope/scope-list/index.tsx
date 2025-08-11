"use client"
import { useDragAndDrop } from "react-aria-components"
import { EllipsisIcon } from "lucide-react"
import { useCurrentScopeView } from "../use-scope-views"
import { ScopeListItem } from "./list-item"
import { useAuth } from "@/modules/auth/use-auth"
import {
  processDropItems,
  processItemKeys,
  reorderIds,
  sortItemsByIdOrder,
} from "@/common/utils/list-utils"
import { CreateField } from "@/common/components/create-field"
import { useSessionStorageUtility } from "@/common/utils/use-storage-utility"
import { ToggleButton } from "~/smui/toggle-button/components"
import { Popover, PopoverTrigger } from "~/smui/popover/components"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"
import { GridList } from "~/smui/grid-list/components"
import { parseAccountUpdateInput } from "@/database/models/account"
import { db, useDBQuery } from "@/database/db-client"
import { parseScopeCreateInput, Scope } from "@/database/models/scope"
import { Task } from "@/database/models/task"

export function ScopeList({ disableDragAndDrop = false }: { disableDragAndDrop?: boolean }) {
  const { instantAccount: account } = useAuth()
  const [showInactive, setShowInactive] = useSessionStorageUtility("show-inactive-scopes", false)

  const scopeQuery = useDBQuery<Scope & { tasks: Task[] }, "scopes">("scopes", {
    $: {
      where: {
        "owner.id": account?.id || "NO_ACCOUNT",
        "is_inactive": showInactive ? { $in: [true, false] } : false,
      },
    },
    tasks: { $: { where: { status: "current" } } },
  })

  const scopes = sortItemsByIdOrder({
    items: scopeQuery.scopes ?? [],
    idOrder: account?.list_orders?.scopes ?? [],
    missingIdsPosition: "end",
    sortMissingIds: (left, right) => {
      return left.created_at - right.created_at
    },
  })

  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) => processItemKeys(keys, scopes, "db/scope"),
    acceptedDragTypes: ["db/task", "db/recurring-task", "db/scope"],
    shouldAcceptItemDrop: (_, types) => types.has("db/task"),
    onItemDrop: async (e) => {
      const scopeId = e.target.key as string
      const tasks = await processDropItems<Task>(e.items, "db/task")
      db.transact(db.tx.scopes[scopeId].link({ tasks: tasks.map((task) => task.id) }))
    },
    onReorder: (e) => {
      const newOrder = reorderIds({
        prevOrder: [...scopes].map((scope) => scope.id),
        droppedIds: [...e.keys] as string[],
        targetId: e.target.key as string,
        dropPosition: e.target.dropPosition,
      })
      if (account) {
        const { data } = parseAccountUpdateInput({ list_orders: { scopes: newOrder } })
        db.transact(db.tx.accounts[account.id].merge(data))
      }
    },
  })

  const { id: scopeId } = useCurrentScopeView()
  const onCreate = async (title: string) => {
    if (account) {
      const { id, data, link } = parseScopeCreateInput({
        title,
        owner_id: account.id,
        content: null,
        icon: null,
      })
      db.transact(db.tx.scopes[id].link(link).create(data))
    }
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <GridList
        aria-label="Scope List"
        variants={{ variant: "nav-list" }}
        dependencies={[scopeId, scopes]}
        items={scopes}
        dragAndDropHooks={disableDragAndDrop ? undefined : dragAndDropHooks}
      >
        {(scope, classNames) => {
          const isSelected = scopeId === scope.id
          return <ScopeListItem scope={scope} className={classNames.item} isSelected={isSelected} />
        }}
      </GridList>
      <CreateField
        onSubmit={onCreate}
        classNames={{ base: "py-6", input: "placeholder-neutral-muted-text" }}
        placeholder="Add scope of work"
      />
      <PopoverTrigger>
        <Button variants={{ hover: "fill" }} className="self-start px-8">
          <Icon icon={<EllipsisIcon />} className="text-neutral-muted-text" />
        </Button>
        <Popover
          placement="right top"
          offset={0}
          classNames={{ content: "border-2 rounded-sm bg-base-bg" }}
        >
          {({ close }) => (
            <>
              <ToggleButton
                autoFocus
                isSelected={showInactive}
                onPress={() => {
                  setShowInactive(!showInactive)
                  close()
                }}
                className={["px-16 py-8 text-left text-sm", "text-neutral-text"]}
                variants={{ hover: "underline" }}
              >
                {({ isSelected }) => (isSelected ? "Hide inactive" : "Show inactive")}
              </ToggleButton>
            </>
          )}
        </Popover>
      </PopoverTrigger>
    </div>
  )
}
