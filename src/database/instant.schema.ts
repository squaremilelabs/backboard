// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react"

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed(),
    }),
    inboxes: i.entity({
      title: i.string().indexed(),
      created_at: i.date().indexed(),
      content: i.string().optional(),
      task_order: i.json(), // array of task IDs
      is_archived: i.boolean(),
    }),
    tasks: i.entity({
      title: i.string().indexed(),
      content: i.string().optional(),
      created_at: i.date().indexed(),
      due_date: i.date().optional().indexed(),
      snooze_date: i.date().optional().indexed(),
      snooze_indefinite: i.boolean().optional(),
      completed_date: i.date().optional().indexed(),
      archived_date: i.date().optional().indexed(),
    }),
  },
  links: {
    user_inboxes: {
      forward: { on: "inboxes", has: "one", label: "owner" },
      reverse: { on: "$users", has: "many", label: "inboxes" },
    },
    user_tasks: {
      forward: { on: "tasks", has: "one", label: "owner" },
      reverse: { on: "$users", has: "many", label: "tasks" },
    },
    inbox_tasks: {
      forward: { on: "inboxes", has: "many", label: "tasks" },
      reverse: { on: "tasks", has: "one", label: "inbox", onDelete: "cascade" },
    },
  },
  rooms: {},
})

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema
type AppSchema = _AppSchema & {}
const schema: AppSchema = _schema

export type { AppSchema }
export default schema
