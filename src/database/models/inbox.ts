import { id } from "@instantdb/react"
import { db } from "../db"

export type Inbox = {
  id: string
  created_at: number
  title: string
  content?: string
  open_task_order: string[]
  is_archived: boolean
}

export type InboxCreateParams = {
  owner_id: string
  title: string
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
  content?: string | null
  open_task_order?: string[]
  is_archived?: boolean
}

export async function updateInbox(id: string, data: InboxUpdateParams) {
  return db.transact([
    db.tx.inboxes[id].update({
      title: data.title,
      content: data.content,
      open_task_order: data.open_task_order,
      is_archived: data.is_archived,
    }),
  ])
}
