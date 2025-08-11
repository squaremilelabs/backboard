// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/core"

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
      api_key: i.string().unique().optional(),
      created_at: i.date().indexed(),
      list_orders: i.json().optional(), // AccountListOrdersType
    }),
    tasks: i.entity({
      created_at: i.date().indexed(),
      title: i.string().indexed(),
      content: i.string().optional(),
      status: i.string(), // TaskStatus
      status_time: i.date().indexed().optional(),
      prev_status: i.string().optional(),
    }),
    recurring_tasks: i.entity({
      created_at: i.date().indexed(),
      title: i.string().indexed(),
      content: i.string().optional(),
      is_inactive: i.boolean(),
      recur_day_type: i.string(), // RecurringTaskRecurDayType
      recur_days: i.json(),
    }),
    scopes: i.entity({
      created_at: i.date().indexed(),
      title: i.string().indexed(),
      content: i.string().optional(),
      icon: i.json().optional(), // ScopeIcon
      is_inactive: i.boolean(),
      list_orders: i.json().optional(), // ScopeListOrders
    }),
  },
  links: {
    user_accounts: {
      forward: { on: "accounts", has: "one", label: "user", required: true, onDelete: "cascade" },
      reverse: { on: "$users", has: "one", label: "account" },
    },
    account_scopes: {
      forward: { on: "scopes", has: "one", label: "owner", required: true, onDelete: "cascade" },
      reverse: { on: "accounts", has: "many", label: "scopes" },
    },
    scope_tasks: {
      forward: { on: "tasks", has: "one", label: "scope", required: true, onDelete: "cascade" },
      reverse: { on: "scopes", has: "many", label: "tasks" },
    },
    scope_recurring_tasks: {
      forward: {
        on: "recurring_tasks",
        has: "one",
        label: "scope",
        required: true,
        onDelete: "cascade",
      },
      reverse: { on: "scopes", has: "many", label: "recurring_tasks" },
    },
    recurring_task_tasks: {
      forward: { on: "tasks", has: "one", label: "recurring_task" },
      reverse: { on: "recurring_tasks", has: "many", label: "tasks" },
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
