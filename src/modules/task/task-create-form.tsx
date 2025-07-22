"use client"

import { Button, Form, Input, TextField } from "react-aria-components"
import { useRef } from "react"
import { PlusIcon } from "lucide-react"
import { useCurrentInboxView } from "../inbox/inbox-views"
import { cn } from "~/smui/utils"
import { createTask } from "@/database/models/task"
import { useInstantAccount } from "@/modules/auth/instant-auth"
import { Icon } from "~/smui/icon/components"

export function TaskCreateForm() {
  const { id: inboxId, view: inboxView } = useCurrentInboxView()
  const account = useInstantAccount()
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!account) return
    const formData = new FormData(formRef.current!)
    const title = formData.get("title") as string
    if (!title) return
    if (!title.trim()) return
    createTask({
      title,
      inbox_id: inboxId,
      inbox_state: inboxView === "snoozed" ? "snoozed" : "open",
    })
      .then(() => formRef.current?.reset())
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error("Failed to create task:", error)
      })
  }

  if (inboxView !== "open" && inboxView !== "snoozed") {
    return null
  }

  return (
    <Form
      ref={formRef}
      onSubmit={handleSubmit}
      className={cn(
        "group flex items-center gap-8 px-16 py-8",
        "focus-within:bg-neutral-0 focus-within:border-b",
        "text-neutral-400 focus-within:text-neutral-950",
        "hover:bg-neutral-0"
      )}
    >
      <Button type="submit">
        <Icon icon={<PlusIcon />} />
      </Button>
      <TextField aria-label="Title" className="grow" name="title">
        <Input
          className="w-full placeholder-neutral-400 !outline-0
            not-group-focus-within:text-neutral-400"
          placeholder="Add"
        />
      </TextField>
    </Form>
  )
}
