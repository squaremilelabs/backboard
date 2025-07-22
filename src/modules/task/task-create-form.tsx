"use client"

import { Button, Form, Input, TextField } from "react-aria-components"
import { useRef } from "react"
import { useCurrentInboxView } from "../inbox/inbox-views"
import { Icon } from "@/lib/components/icon"
import { cn } from "~/smui/utils"
import { createTask } from "@/database/models/task"
import { useInstantAccount } from "@/modules/auth/instant-auth"

export function TaskCreateForm() {
  const { id: inboxId, view: inboxView } = useCurrentInboxView()
  const account = useInstantAccount()
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!account) return
    const formData = new FormData(formRef.current!)
    const title = formData.get("title") as string
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
        "group flex items-center gap-8 border-b px-16 py-8",
        "focus-within:bg-neutral-0 bg-neutral-100",
        "hover:bg-neutral-0"
      )}
    >
      <Button type="submit">
        <Icon icon="plus" />
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
