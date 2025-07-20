import { Form, Input, ListBox, ListBoxItem, TextField } from "react-aria-components"
import { useParams } from "next/navigation"
import { useCreateInbox, useActiveInboxes } from "./data-inbox"
import { cn } from "~/smui/utils"

export function InboxNavList() {
  const params = useParams<{ id: string }>()
  const { inboxes } = useActiveInboxes()

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
              href={`/inbox/${item.id}`}
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
  const { mutate: createInbox } = useCreateInbox()

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    if (title) {
      createInbox({ title })
      e.currentTarget.reset()
    }
  }

  return (
    <Form onSubmit={onSubmit} aria-label="Create Inbox">
      <TextField id="title" name="title" aria-label="Title">
        <Input placeholder="add" />
      </TextField>
    </Form>
  )
}
