"use client"

import { Form } from "react-aria-components"
import { PlusIcon } from "lucide-react"
import { useRef } from "react"
import { GripVertical } from "lucide-react"
import { isTextDropItem, useDragAndDrop } from "react-aria-components"
import { useInstantAccount } from "../account/instant-account"
import { useCurrentInboxView } from "./inbox-views"
import { TextField, TextFieldInput } from "~/smui/text-field/components"
import { createInbox } from "@/database/models/inbox"
import { db } from "@/database/db"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"
import { reorderIds, sortItemsByIdOrder } from "@/lib/utils/list-utils"
import { updateAccount } from "@/database/models/account"
import { Inbox } from "@/database/models/inbox"
import { Task, updateManyTasks } from "@/database/models/task"
import { GridList, GridListItem } from "~/smui/grid-list/components"
import { cn } from "~/smui/utils"
import { EmojiIcon } from "@/lib/components/emoji"

export function InboxNav() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col">
        <InboxNavList />
        <InboxNavCreateInput />
      </div>
    </div>
  )
}

export function InboxNavList() {
  const account = useInstantAccount()
  const { id: currentInboxId } = useCurrentInboxView()
  const inboxQuery = db.useQuery({
    inboxes: {
      $: { where: { "owner.id": account?.id ?? "NO_USER", "is_archived": false } },
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
        base: "flex flex-col",
        item: [
          "cursor-pointer flex items-center gap-4 p-8",
          "text-canvas-3",
          "hover:bg-canvas-1",
          "hover:text-canvas-5",
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
              "font-medium",
              isSelected && "!bg-canvas-1 text-canvas-7 font-semibold"
            )}
            href={`/inbox/${inbox.id}`}
          >
            <Button slot="drag">
              <Icon icon={<GripVertical />} variants={{ size: "sm" }} />
            </Button>
            <EmojiIcon emoji={inbox?.emoji ?? null} variants={{ size: "sm" }} />
            <p className="grow truncate">{inbox.title}</p>
            {openTaskCount > 0 && (
              <span className="text-primary-4 flex w-30 justify-center text-sm font-bold">
                {openTaskCount}
              </span>
            )}
          </GridListItem>
        )
      }}
    </GridList>
  )
}

export function InboxNavCreateInput() {
  const account = useInstantAccount()
  const formRef = useRef<HTMLFormElement>(null)

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!account) return
    const formData = new FormData(formRef.current!)
    const title = formData.get("title") as string
    if (!title) return
    createInbox({ owner_id: account?.id, title }).then(() => formRef.current?.reset())
  }

  return (
    <Form
      ref={formRef}
      onSubmit={onSubmit}
      className={cn(
        "group flex items-center gap-4 p-8",
        "focus-within:bg-canvas-0",
        "text-canvas-3 focus-within:text-canvas-7",
        "hover:bg-canvas-1"
      )}
    >
      <Icon icon={<PlusIcon />} variants={{ size: "md" }} />
      <TextField
        name="title"
        aria-label="Title"
        classNames={{
          base: "w-full",
          input: "placeholder-canvas-3 not-group-focus-within:text-canvas-3 w-full !outline-0",
        }}
      >
        {(_, classNames) => <TextFieldInput placeholder="Add" className={classNames.input} />}
      </TextField>
    </Form>
  )
}
