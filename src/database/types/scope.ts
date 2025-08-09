import { Account } from "../models/account"
import { DateTimeValue } from "./utils"
import { Task } from "./task"

export type Scope = {
  id: string
  created_at: DateTimeValue
  icon: ScopeIcon
  title: string
  content: string | null
  is_inactive: boolean
}

export type ScopeIcon = {
  type: "emoji" | "url"
  value: string
}

export type ScopeLinks = {
  owner: Account
  tasks: Task[]
}
