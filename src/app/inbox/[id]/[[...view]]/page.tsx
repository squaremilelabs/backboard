import { init } from "@instantdb/admin"
import { Metadata } from "next"
import { currentUser } from "@clerk/nextjs/server"
import schema from "@/database/instant.schema"
import { InboxPage } from "@/modules/inbox/inbox-page"
import { Inbox } from "@/database/models/inbox"

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID as string,
  adminToken: process.env.INSTANT_APP_ADMIN_TOKEN as string,
  schema: schema,
})

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

export default InboxPage
