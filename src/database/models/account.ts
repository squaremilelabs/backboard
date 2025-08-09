import z from "zod"
import { v4 } from "uuid"
import { Scope } from "./scope"

export type AccountListOrderKey = keyof AccountListOrders

export type AccountListOrders = z.infer<typeof AccountListOrdersSchema>

export type Account = {
  id: string
  created_at: number
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

const AccountListOrdersSchema = z.object({
  "scopes": z.array(z.uuidv4()).nullish(),
  "tasks/now": z.array(z.uuidv4()).nullish(),
})

export const AccountCreateSchema = z
  .object({
    id: z.uuidv4().optional(),
    user_id: z.uuidv4(),
  })
  .transform(({ id, user_id }) => {
    return {
      id: id ?? v4(),
      data: {
        api_key: v4(),
        list_orders: {
          "scopes": [],
          "tasks/now": [],
        },
      },
      link: { user: user_id },
    }
  })

export type AccountCreateInput = z.input<typeof AccountCreateSchema>
export type AccountCreateOutput = z.output<typeof AccountCreateSchema>

export const AccountUpdateSchema = z
  .object({
    list_orders: AccountListOrdersSchema.nullish(),
  })
  .transform(({ ...data }) => {
    return {
      data,
    }
  })

export type AccountUpdateInput = z.input<typeof AccountUpdateSchema>
export type AccountUpdateOutput = z.output<typeof AccountUpdateSchema>
