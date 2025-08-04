import { Metadata } from "next"
import { currentUser } from "@clerk/nextjs/server"
import { InboxPageRouter } from "@/modules/inbox/inbox-page-router"
import { Inbox } from "@/database/models/inbox"
import { db } from "@/database/db-admin"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const user = await currentUser()
  const { id: inboxId } = await params
  const inboxQuery = await db
    .asUser({ email: user?.primaryEmailAddress?.emailAddress ?? "NO_USER" })
    .query({
      inboxes: {
        $: {
          where: { id: inboxId },
          first: 1,
        },
      },
    })
  const title = (inboxQuery.inboxes[0] as Inbox)?.title
  if (title) return { title }
  return {}
}

export default InboxPageRouter
