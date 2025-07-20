"use client"
import { Button, Form, Input, TextField } from "react-aria-components"
import { useParams } from "next/navigation"
import { useCreateTask } from "./data-tasks"
import { Icon } from "@/lib/components/icon"
import { cn } from "~/smui/utils"

export function TaskCreateForm() {
  const { id: inboxId } = useParams<{ id: string }>()
  const { mutate: createTask } = useCreateTask(inboxId)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    createTask({ title })
    e.currentTarget.reset()
  }

  return (
    <Form
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
