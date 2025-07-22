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
    accounts: i.entity({
      inbox_order: i.json(), // array of inbox IDs (strings)
    }),
    inboxes: i.entity({
      created_at: i.date().indexed(),
      title: i.string().indexed(),
      content: i.string().optional(),
      open_task_order: i.json(), // array of task IDs (strings)
      is_archived: i.boolean(),
    }),
    tasks: i.entity({
      created_at: i.date().indexed(),
      title: i.string().indexed(),
      content: i.string().optional(),
      inbox_state: i.string(), // "open", "snoozed", "archived" (validated in permissions)
      snooze_date: i.date().optional(),
      archive_date: i.date().optional(),
    }),
  },
  links: {
    user_accounts: {
      forward: { on: "accounts", has: "one", label: "user", required: true, onDelete: "cascade" },
      reverse: { on: "$users", has: "one", label: "account" },
    },
    inbox_tasks: {
      forward: { on: "tasks", has: "one", label: "inbox", required: true, onDelete: "cascade" },
      reverse: { on: "inboxes", has: "many", label: "tasks" },
    },
    account_inboxes: {
      forward: { on: "inboxes", has: "one", label: "owner", required: true, onDelete: "cascade" },
      reverse: { on: "accounts", has: "many", label: "inboxes" },
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
