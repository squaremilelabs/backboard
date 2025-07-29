import { id, InstaQLParams } from "@instantdb/react"
import { db } from "../db"
import { AppSchema } from "../instant.schema"

export type Inbox = {
  id: string
  created_at: number
  title: string
  emoji?: string
  content?: string
  open_task_order: string[]
  is_archived: boolean
}

export type InboxCreateParams = {
  owner_id: string
  title: string
  emoji?: string | null
  content?: string | null
  open_task_order?: string[]
  is_archived?: boolean
}

export async function createInbox(data: InboxCreateParams) {
  return db.transact([
    db.tx.inboxes[id()].link({ owner: data.owner_id }).create({
      title: data.title,
      content: data.content,
      open_task_order: data.open_task_order ?? [],
      is_archived: data.is_archived ?? false,
      created_at: new Date().getTime(),
    }),
  ])
}

export type InboxUpdateParams = {
  title?: string
  emoji?: string | null
  content?: string | null
  open_task_order?: string[]
  is_archived?: boolean
}

export async function updateInbox(id: string, data: InboxUpdateParams) {
  return db.transact([
    db.tx.inboxes[id].update({
      title: data.title,
      emoji: data.emoji,
      content: data.content,
      open_task_order: data.open_task_order,
      is_archived: data.is_archived,
    }),
  ])
}

export type InboxQueryParams = InstaQLParams<AppSchema>["inboxes"]

export function useInboxQuery<ExtData extends object = object>(
  params: InboxQueryParams | null
): {
  data: (Inbox & ExtData)[] | undefined
  isLoading: boolean
  error: { message: string } | undefined
} {
  const { data, isLoading, error } = db.useQuery(params ? { inboxes: params } : null)
  return {
    data: data?.inboxes as (Inbox & ExtData)[],
    isLoading,
    error,
  }
}
