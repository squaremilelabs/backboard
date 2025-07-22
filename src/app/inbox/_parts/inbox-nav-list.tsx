import { Form, Input, ListBox, ListBoxItem, TextField } from "react-aria-components"
import { useParams } from "next/navigation"
import { useRef } from "react"
import { cn } from "~/smui/utils"
import { db } from "@/database/db"
import { useInstantAccount } from "@/modules/auth/instant-auth"
import { createInbox } from "@/database/models/inbox"

export function InboxNavList() {
  const params = useParams<{ id: string }>()
  const inboxQuery = db.useQuery({
    inboxes: {
      $: {
        where: { is_archived: false },
      },
    },
  })
  const inboxes = inboxQuery.data?.inboxes ?? []

  return (
    <div className="flex flex-col">
      <ListBox
        aria-label="Scope List"
        items={inboxes}
        dependencies={[inboxes, params.id]}
        className="flex flex-col gap-4"
      >
        {(item) => {
          const isActive = item.id === params.id
          return (
            <ListBoxItem
              id={item.id}
              textValue={item.title}
              className={cn(
                "px-8 py-4",
                isActive
                  ? "bg-neutral-200 font-medium text-neutral-950"
                  : "text-neutral-500 hover:bg-neutral-100"
              )}
              href={`/inbox/${item.id}/open`}
            >
              <p className="truncate">{item.title}</p>
            </ListBoxItem>
          )
        }}
      </ListBox>
      <InboxCreateForm />
    </div>
  )
}

function InboxCreateForm() {
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
    <Form ref={formRef} onSubmit={onSubmit} aria-label="Create Inbox">
      <TextField id="title" name="title" aria-label="Title">
        <Input placeholder="add" />
      </TextField>
    </Form>
  )
}
