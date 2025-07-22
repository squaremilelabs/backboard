import { id } from "@instantdb/react"
import { db } from "../db"

export type Task = {
  id: string
  created_at: number
  title: string
  content?: string
  inbox_state: TaskInboxState
  snooze_date?: number
  archive_date?: number
}

export type TaskInboxState = "open" | "snoozed" | "archived"

export type TaskCreateParams = {
  inbox_id: string
  title: string
  content?: string | null
  inbox_state: TaskInboxState
  snooze_date?: number | null
}

export function createTask(data: TaskCreateParams) {
  const now = new Date().getTime()
  return db.transact([
    db.tx.tasks[id()].link({ inbox: data.inbox_id }).create({
      title: data.title,
      content: data.content ?? null,
      inbox_state: data.inbox_state,
      // @ts-expect-error instantdb issue?
      snooze_date: data.snooze_date,
      // @ts-expect-error instantdb issue?
      archive_date: data.inbox_state === "archived" ? now : null,
      created_at: now,
    }),
  ])
}

export type TaskUpdateParams = {
  title?: string
  content?: string | null
  inbox_id?: string
  inbox_state?: TaskInboxState
  snooze_date?: number | null
  archive_date?: number | null
}

export function updateTask(id: string, data: TaskUpdateParams) {
  return db.transact(
    [
      db.tx.tasks[id].update({
        title: data.title,
        content: data.content,
        inbox_state: data.inbox_state,
        snooze_date: data.snooze_date,
        archive_date: data.archive_date,
      }),
      data.inbox_id ? db.tx.inboxes[data.inbox_id].link({ tasks: id }) : null,
    ].filter((txn) => txn !== null)
  )
}

export type TaskUpdateManyParams = {
  inbox_id?: string
  inbox_state?: TaskInboxState
  snooze_date?: number | null
  archive_date?: number | null
}

export function updateManyTasks(ids: string[], data: TaskUpdateManyParams) {
  return db.transact(
    [
      ...ids.map((id) =>
        db.tx.tasks[id].update({
          inbox_state: data.inbox_state,
          snooze_date: data.snooze_date,
          archive_date: data.archive_date,
        })
      ),
      data.inbox_id ? db.tx.inboxes[data.inbox_id].link({ tasks: ids }) : null,
    ].filter((txn) => txn !== null)
  )
}
