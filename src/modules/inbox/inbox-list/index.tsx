import { useDragAndDrop } from "react-aria-components"
import { useCurrentInboxView } from "../inbox-views"
import { InboxListItem } from "./inbox-list-item"
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

export function InboxList() {
  const { instantAccount: account } = useAuth()
  const inboxQuery = useInboxQuery<{ tasks: Task[] }>(
    account
      ? {
          $: { where: { "owner.id": account.id, "is_archived": false } },
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
    <div className="flex flex-col p-2">
      <ListBox
        aria-label="Inbox List"
        variants={{ variant: "flat" }}
        selectedKeys={[inboxId]}
        selectionMode="single"
        items={inboxes}
        dragAndDropHooks={dragAndDropHooks}
        classNames={{
          item: [
            "font-medium data-selected:font-semibold",
            "opacity-70 data-selected:opacity-100 hover:opacity-100",
          ],
        }}
      >
        {(inbox, classNames) => <InboxListItem inbox={inbox} className={classNames.item} />}
      </ListBox>
      <CreateField onSubmit={onCreate} />
    </div>
  )
}
