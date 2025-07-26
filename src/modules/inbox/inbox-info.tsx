"use client"

import { Form } from "react-aria-components"
import { useState } from "react"
import { EmojiClickData } from "emoji-picker-react"
import { FolderIcon } from "lucide-react"
import { useCurrentInboxView } from "./inbox-views"
import { Popover, PopoverTrigger } from "~/smui/popover/components"
import { db } from "@/database/db"
import { Button } from "~/smui/button/components"
import { updateInbox } from "@/database/models/inbox"
import { TextField, TextFieldInput, TextFieldTextArea } from "~/smui/text-field/components"
import { FieldLabel } from "~/smui/field/components"
import { EmojiPicker } from "@/lib/components/emoji"

export function InboxTitle() {
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
    if (!updatedTitle.trim()) return
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

  const handleEmojiChange = (value: EmojiClickData | null) => {
    updateInbox(inbox?.id ?? "-", {
      emoji: value?.unified ?? null,
    }).then(() => setOpen(false))
  }

  return (
    <div className="flex items-center gap-8">
      <EmojiPicker
        selected={inbox?.emoji ?? null}
        FallbackIcon={FolderIcon}
        onSelectionChange={handleEmojiChange}
        iconVariants={{ size: "lg" }}
        iconClassName="text-canvas-3"
      />
      <PopoverTrigger isOpen={open} onOpenChange={setOpen}>
        <Button className="flex cursor-pointer items-center gap-8">
          <h1
            className="text-canvas-5 dark:text-canvas-7 truncate text-lg font-semibold
              hover:underline"
          >
            {inbox?.title || "-"}
          </h1>
          {inbox?.is_archived && (
            <p className="text-canvas-3 text-sm font-semibold tracking-wide">ARCHIVED</p>
          )}
        </Button>
        <Popover
          placement="bottom start"
          classNames={{
            content: ["w-400", "bg-canvas-0/30 backdrop-blur-lg border-2", "p-16"],
          }}
        >
          <Form onSubmit={onSubmit} className="flex flex-col gap-8">
            {inbox?.emoji && (
              <Button
                className="text-canvas-4 mb-8 cursor-pointer text-left text-sm hover:underline"
                onPress={() => handleEmojiChange(null)}
              >
                Remove Emoji
              </Button>
            )}
            <TextField
              aria-label="Title"
              name="title"
              defaultValue={inbox?.title}
              autoFocus
              classNames={{
                base: "flex flex-col gap-2",
                input: "w-full p-8 border bg-canvas-0",
                field: {
                  label: "text-sm font-semibold text-canvas-5",
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
                textarea: "w-full p-8 border bg-canvas-0",
                field: {
                  label: "text-sm font-semibold text-canvas-5",
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
              className="bg-canvas-2 text-canvas-7 cursor-pointer p-8 font-medium hover:opacity-80"
              type="submit"
            >
              Save
            </Button>
            <Button
              className="text-canvas-3 cursor-pointer text-left text-sm hover:underline"
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
