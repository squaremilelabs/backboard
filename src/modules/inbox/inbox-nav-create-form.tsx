import { useRef } from "react"
import { PlusIcon } from "lucide-react"
import { Form } from "react-aria-components"
import { TextField, TextFieldInput } from "~/smui/text-field/components"
import { useInstantAccount } from "@/modules/auth/instant-auth"
import { createInbox } from "@/database/models/inbox"
import { Icon } from "~/smui/icon/components"

export function InboxNavCreateForm() {
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
      aria-label="Create Inbox"
      className="flex items-center gap-8 p-8 focus-within:outline-2"
    >
      <Icon icon={<PlusIcon />} />
      <TextField
        name="title"
        aria-label="Title"
        classNames={{ base: "w-full", input: "w-full !outline-0" }}
      >
        {(_, classNames) => <TextFieldInput placeholder="Add" className={classNames.input} />}
      </TextField>
    </Form>
  )
}
