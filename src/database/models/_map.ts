import { Account } from "./account"
import { RecurringTask } from "./recurring-task"
import { Scope } from "./scope"
import { Task } from "./task"

export type ModelKey = keyof ModelMap
export type ModelMap = {
  accounts: Account
  scopes: Scope
  tasks: Task
  recurring_tasks: RecurringTask
}
