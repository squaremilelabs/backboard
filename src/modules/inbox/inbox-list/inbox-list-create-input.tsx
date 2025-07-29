import { createInbox } from "@/database/models/inbox"
import { CreateInput } from "@/lib/components/create-input"
import { useAuth } from "@/modules/auth/use-auth"

export function InboxListCreateInput() {
  const { instantAccount } = useAuth()

  const onSubmit = async (title: string) => {
    if (instantAccount) createInbox({ owner_id: instantAccount?.id, title })
  }

  return <CreateInput onSubmit={onSubmit} />
}
