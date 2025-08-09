// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/admin"

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
      // MAINTAIN
      api_key: i.string().unique().optional(),
      // DEPRECATE
      inbox_order: i.json(), // array of inbox IDs (strings)
      // ADD
      created_at: i.date().indexed().optional(), // TODO: remove optional after migration
      list_orders: i.json().optional(), // AccountListOrdersType
    }),
    // DEPRECATE (replaced by scopes)
    inboxes: i.entity({
      created_at: i.date().indexed(),
      title: i.string().indexed(),
      emoji: i.string().optional(),
      content: i.string().optional(),
      open_task_order: i.json(), // array of task IDs (strings)
      is_archived: i.boolean(),
    }),
    // MAINTAIN
    tasks: i.entity({
      // MAINTAIN
      created_at: i.date().indexed(),
      title: i.string().indexed(),
      content: i.string().optional(),
      // DEPRECATE
      inbox_state: i.string(), // "open", "snoozed", "archived" (validated in permissions)
      snooze_date: i.date().indexed().optional(),
      archive_date: i.date().indexed().optional(),
      // ADD
      status: i.string().optional(), // TaskStatus // TODO: remove optional after migration
      status_time: i.date().indexed().optional(),
      prev_status: i.string().optional(),
    }),
    // MAINTAIN
    recurring_tasks: i.entity({
      // MAINTAIN
      created_at: i.date().indexed(),
      title: i.string().indexed(),
      content: i.string().optional(),
      // DEPRECATE
      frequency: i.json().optional(),
      is_archived: i.boolean(),
      // ADD
      is_inactive: i.boolean().optional(), // TODO: remove optional after migration
      recur_day_type: i.string().optional(), // RecurringTaskRecurDayType // TODO: remove optional after migration
      recur_days: i.json().optional(), // WeekdayInt[] | MonthdayInt[] // TODO: remove optional after migration
    }),
    // ADD (replaces inboxes)
    scopes: i.entity({
      created_at: i.date().indexed(),
      title: i.string().indexed(),
      content: i.string().optional(),
      icon: i.json().optional(), // ScopeIcon
      is_inactive: i.boolean(),
    }),
  },
  links: {
    // MAINTAIN
    user_accounts: {
      forward: { on: "accounts", has: "one", label: "user", required: true, onDelete: "cascade" },
      reverse: { on: "$users", has: "one", label: "account" },
    },
    // DEPRECATE (replaced by account_scopes)
    account_inboxes: {
      forward: { on: "inboxes", has: "one", label: "owner", required: true, onDelete: "cascade" },
      reverse: { on: "accounts", has: "many", label: "inboxes" },
    },
    // ADD (replaces account_inboxes)
    account_scopes: {
      forward: { on: "scopes", has: "one", label: "owner" }, // TODO: Make required & delete=cascade after migration
      reverse: { on: "accounts", has: "many", label: "scopes" },
    },
    // DEPRECATE (replaced by scope_tasks)
    inbox_tasks: {
      forward: { on: "tasks", has: "one", label: "inbox" }, // TODO: remove required & cascade in UI
      reverse: { on: "inboxes", has: "many", label: "tasks" },
    },
    // ADD (replaces inbox_tasks)
    scope_tasks: {
      forward: { on: "tasks", has: "one", label: "scope" }, // TODO: Make required & delete=cascade after migration
      reverse: { on: "scopes", has: "many", label: "tasks" },
    },
    // DEPRECATE (replaced by scope_recurring_tasks)
    inbox_recurring_tasks: {
      forward: {
        on: "recurring_tasks",
        has: "one",
        label: "inbox",
      }, // TODO: remove required & cascade in UI
      reverse: { on: "inboxes", has: "many", label: "recurring_tasks" },
    },
    // ADD (replaces inbox_recurring_tasks)
    scope_recurring_tasks: {
      forward: {
        on: "recurring_tasks",
        has: "one",
        label: "scope",
      }, // TODO: Make required & delete=cascade after migration
      reverse: { on: "scopes", has: "many", label: "recurring_tasks" },
    },
    // ADD (new)
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
