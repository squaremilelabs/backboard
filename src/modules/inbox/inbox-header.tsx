"use client"

import { Form } from "react-aria-components"
import { useState } from "react"
import { useCurrentInboxView } from "./inbox-views"
import { Popover, PopoverTrigger } from "~/smui/popover/components"
import { db } from "@/database/db"
import { Button } from "~/smui/button/components"
import { updateInbox } from "@/database/models/inbox"
import { TextField, TextFieldInput, TextFieldTextArea } from "~/smui/text-field/components"
import { FieldLabel } from "~/smui/field/components"

// TODO: Separate
export function InboxHeader() {
  const { id: inboxId } = useCurrentInboxView()
  const inboxQuery = db.useQuery({
    inboxes: {
      $: {
        where: { id: inboxId },
      },
    },
  })
  const inbox = inboxQuery.data?.inboxes[0]

  const [open, setOpen] = useState(false)
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const updatedTitle = formData.get("title") as string
    const updatedContent = (formData.get("content") ?? "") as string

    updateInbox(inbox?.id ?? "-", {
      title: updatedTitle,
      content: updatedContent,
    }).then(() => setOpen(false))
  }

  const handleArchiveToggle = () => {
    updateInbox(inbox?.id ?? "-", {
      is_archived: !inbox?.is_archived,
    }).then(() => setOpen(false))
  }

  return (
    <div className="flex w-full items-center gap-8 truncate p-16">
      <PopoverTrigger isOpen={open} onOpenChange={setOpen}>
        <Button className="flex cursor-pointer items-center gap-8">
          <h1 className="truncate text-lg font-semibold text-neutral-700 hover:underline">
            {inbox?.title ?? "-"}
          </h1>
          {inbox?.is_archived && (
            <p className="text-sm font-semibold tracking-wide text-neutral-400">ARCHIVED</p>
          )}
        </Button>
        <Popover
          placement="bottom start"
          classNames={{
            content: ["w-400", "bg-neutral-0/30 backdrop-blur-lg border-2", "p-16"],
          }}
        >
          <Form onSubmit={onSubmit} className="flex flex-col gap-8">
            <TextField
              aria-label="Title"
              name="title"
              defaultValue={inbox?.title}
              autoFocus
              classNames={{
                base: "flex flex-col gap-2",
                input: "w-full p-8 border bg-neutral-0",
                field: {
                  label: "text-sm font-semibold text-neutral-700",
                },
              }}
            >
              {(_, classNames) => (
                <>
                  <FieldLabel className={classNames.field.label}>Title</FieldLabel>
                  <TextFieldInput className={classNames.input} />
                </>
              )}
            </TextField>
            <TextField
              aria-label="Content"
              name="content"
              defaultValue={inbox?.content}
              classNames={{
                base: "flex flex-col gap-2",
                textarea: "w-full p-8 border bg-neutral-0",
                field: {
                  label: "text-sm font-semibold text-neutral-700",
                },
              }}
            >
              {(_, classNames) => (
                <>
                  <FieldLabel className={classNames.field.label}>Content</FieldLabel>
                  <TextFieldTextArea className={classNames.textarea} />
                </>
              )}
            </TextField>
            <Button
              className="cursor-pointer bg-neutral-200 p-8 font-medium text-neutral-950
                hover:opacity-80"
              type="submit"
            >
              Save
            </Button>
            <Button
              className="cursor-pointer text-left text-sm text-neutral-400 hover:underline"
              onPress={handleArchiveToggle}
            >
              {inbox?.is_archived ? "Unarchive" : "Archive"}
            </Button>
          </Form>
        </Popover>
      </PopoverTrigger>
    </div>
  )
}
