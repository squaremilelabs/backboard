"use client"

import { GripVertical } from "lucide-react"
import { isTextDropItem, useDragAndDrop } from "react-aria-components"
import { useInstantAccount } from "../auth/instant-auth"
import { useCurrentInboxView } from "./inbox-views"
import { db } from "@/database/db"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"
import { reorderIds, sortItemsByIdOrder } from "@/lib/utils/list-utils"
import { updateAccount } from "@/database/models/account"
import { Inbox } from "@/database/models/inbox"
import { Task, updateManyTasks } from "@/database/models/task"
import { GridList, GridListItem } from "~/smui/grid-list/components"
import { cn } from "~/smui/utils"

export function InboxNavList() {
  const account = useInstantAccount()
  const { id: currentInboxId } = useCurrentInboxView()
  const inboxQuery = db.useQuery({
    inboxes: {
      $: { where: { is_archived: false } },
      tasks: { $: { where: { inbox_state: "open" } } },
    },
  })
  const inboxes = sortItemsByIdOrder({
    items: (account ? (inboxQuery.data?.inboxes ?? []) : []) as (Inbox & { tasks: Task[] })[],
    idOrder: account?.inbox_order ?? [],
    missingIdsPosition: "end",
    sortMissingIds: (left, right) => {
      return left.created_at - right.created_at
    },
  })

  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) => {
      return [...keys].map((key) => ({
        "text/plain": key.toString(),
        "data-inbox": JSON.stringify(inboxes.find((inbox) => inbox.id === key)),
      }))
    },
    acceptedDragTypes: ["data-task", "data-inbox"],
    shouldAcceptItemDrop: (_, types) => {
      return types.has("data-task")
    },
    onItemDrop: async (e) => {
      const inboxId = e.target.key as string
      const tasks = await Promise.all<Task>(
        e.items.filter(isTextDropItem).map(async (item) => {
          return JSON.parse(await item.getText("data-task"))
        })
      )
      updateManyTasks(
        tasks.map((task) => task.id),
        {
          inbox_id: inboxId,
          inbox_state: "open",
          archive_date: null,
          snooze_date: null,
        }
      )
    },
    onReorder: (e) => {
      const newOrder = reorderIds({
        prevOrder: [...inboxes].map((inbox) => inbox.id),
        droppedIds: [...e.keys] as string[],
        targetId: e.target.key as string,
        dropPosition: e.target.dropPosition,
      })
      if (account) {
        updateAccount(account.id, { inbox_order: newOrder })
      }
    },
  })

  return (
    <GridList
      aria-label="Inbox List"
      items={inboxes}
      dependencies={[inboxes, currentInboxId, account]}
      dragAndDropHooks={dragAndDropHooks}
      classNames={{
        base: "flex flex-col divide-y",
        item: [
          "cursor-pointer flex items-center gap-4 p-8",
          "text-neutral-500",
          "hover:bg-neutral-100",
          "data-drop-target:outline-2",
        ],
      }}
    >
      {(inbox, classNames) => {
        const isSelected = currentInboxId === inbox.id
        const openTaskCount = inbox.tasks.length
        return (
          <GridListItem
            id={inbox.id}
            textValue={inbox.title}
            className={cn(
              classNames.item,
              isSelected && "!bg-neutral-200 font-medium text-neutral-950"
            )}
            href={`/inbox/${inbox.id}`}
          >
            <Button slot="drag">
              <Icon icon={<GripVertical />} variants={{ size: "sm" }} />
            </Button>
            {/* <Icon icon={<InboxIcon />} /> */}
            <p className="grow truncate">{inbox.title}</p>
            {openTaskCount > 0 && (
              <span className="px-4 text-sm font-bold text-yellow-600">{openTaskCount}</span>
            )}
          </GridListItem>
        )
      }}
    </GridList>
  )
}
