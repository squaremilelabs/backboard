"use client"

import { useDragAndDrop } from "react-aria-components"
import { EllipsisIcon } from "lucide-react"
import { useCurrentInboxView } from "../inbox-views"
import { InboxListItem } from "./list-item"
import { createInbox, useInboxQuery } from "@/database/models/inbox"
import { useAuth } from "@/modules/auth/use-auth"
import { Task, updateManyTasks } from "@/database/models/task"
import {
  processDropItems,
  processItemKeys,
  reorderIds,
  sortItemsByIdOrder,
} from "@/common/utils/list-utils"
import { updateAccount } from "@/database/models/account"
import { ListBox } from "~/smui/list-box/components"
import { CreateField } from "@/common/components/create-field"
import { useSessionStorageUtility } from "@/common/utils/use-storage-utility"
import { ToggleButton } from "~/smui/toggle-button/components"
import { Popover, PopoverTrigger } from "~/smui/popover/components"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"

export function InboxList({ disableDragAndDrop = false }: { disableDragAndDrop?: boolean }) {
  const { instantAccount: account } = useAuth()
  const [showArchived, setShowArchived] = useSessionStorageUtility("show-archived-inboxes", false)

  const inboxQuery = useInboxQuery<{ tasks: Task[] }>(
    account
      ? {
          $: {
            where: {
              "owner.id": account.id,
              "is_archived": showArchived ? { $in: [true, false] } : false,
            },
          },
          tasks: { $: { where: { inbox_state: "open" } } },
        }
      : null
  )

  const inboxes = sortItemsByIdOrder({
    items: inboxQuery.data ?? [],
    idOrder: account?.inbox_order ?? [],
    missingIdsPosition: "end",
    sortMissingIds: (left, right) => {
      return left.created_at - right.created_at
    },
  })

  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) => processItemKeys(keys, inboxes, "db/inbox"),
    acceptedDragTypes: ["db/task", "db/inbox"],
    shouldAcceptItemDrop: (_, types) => types.has("db/task"),
    onItemDrop: async (e) => {
      const inboxId = e.target.key as string
      const tasks = await processDropItems<Task>(e.items, "db/task")
      updateManyTasks(
        tasks.map((task) => task.id),
        { inbox_id: inboxId, inbox_state: "open", archive_date: null, snooze_date: null }
      )
    },
    onReorder: (e) => {
      const newOrder = reorderIds({
        prevOrder: [...inboxes].map((inbox) => inbox.id),
        droppedIds: [...e.keys] as string[],
        targetId: e.target.key as string,
        dropPosition: e.target.dropPosition,
      })
      if (account) updateAccount(account.id, { inbox_order: newOrder })
    },
  })

  const { id: inboxId } = useCurrentInboxView()
  const onCreate = async (title: string) => {
    if (account) createInbox({ owner_id: account.id, title })
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <ListBox
        aria-label="Inbox List"
        variants={{ variant: "flat" }}
        selectedKeys={[inboxId]}
        selectionMode="single"
        items={inboxes}
        dragAndDropHooks={disableDragAndDrop ? undefined : dragAndDropHooks}
      >
        {(inbox, classNames) => <InboxListItem inbox={inbox} className={classNames.item} />}
      </ListBox>
      <CreateField
        onSubmit={onCreate}
        classNames={{ base: "py-6", input: "placeholder-neutral-muted-text" }}
        placeholder="Add inbox"
      />
      <PopoverTrigger>
        <Button variants={{ hover: "fill" }} className="self-start px-8">
          <Icon icon={<EllipsisIcon />} className="text-neutral-muted-text" />
        </Button>
        <Popover placement="right top" offset={0} classNames={{ content: "border-1" }}>
          {({ close }) => (
            <>
              <ToggleButton
                autoFocus
                isSelected={showArchived}
                onPress={() => {
                  setShowArchived(!showArchived)
                  close()
                }}
                className={["px-16 py-8 text-left text-sm", "text-neutral-text"]}
                variants={{ hover: "underline" }}
              >
                {({ isSelected }) => (isSelected ? "Hide archived" : "Show archived")}
              </ToggleButton>
            </>
          )}
        </Popover>
      </PopoverTrigger>
    </div>
  )
}
