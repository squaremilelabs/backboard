import { DateTimeValue } from "./utils"
import { Scope } from "./scope"

export type AccountListOrderKey = "scopes" | "tasks/now" | `scope/${string}/tasks/now`

export type AccountListOrders = Partial<Record<AccountListOrderKey, string[] | null>>

export type Account = {
  id: string
  created_at: DateTimeValue
  list_orders: AccountListOrders | null
  api_key: string | null
}

export type AccountLinks = {
  user: {
    id: string
    email: string
  }
  scopes: Scope[]
}
