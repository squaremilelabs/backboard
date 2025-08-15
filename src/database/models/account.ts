import z from "zod"
import { v4 } from "uuid"
import { Scope } from "./scope"
import { isWorkHoursValid } from "@/modules/auth/account-hours"

export type Account = {
  id: string
  created_at: number
  list_orders: AccountListOrders | null
  api_key: string | null
  custom_work_hours: AccountCustomWorkHours | null
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
  "tasks/current": z.array(z.uuidv4()).nullish(),
})

export type AccountListOrderKey = keyof AccountListOrders
export type AccountListOrders = z.infer<typeof AccountListOrdersSchema>

const timezones = Intl.supportedValuesOf("timeZone")
export const AccountCustomWorkHoursSchema = z
  .object({
    tz: z.string().refine((val) => timezones.includes(val), { error: "Invalid timezone" }),
    start: z.number().min(0).max(12),
    mid: z.number().min(1).max(35).nullish(),
    last: z.number().min(1).max(35).nullish(),
  })
  .refine(
    (val) => {
      return isWorkHoursValid(val)
    },
    { message: "Invalid work hours" }
  )

export type AccountCustomWorkHours = z.infer<typeof AccountCustomWorkHoursSchema>

export const AccountCreateSchema = z
  .object({
    id: z.uuidv4().optional(),
    user_id: z.uuidv4(),
  })
  .transform(({ id, user_id }) => {
    return {
      id: id ?? v4(),
      data: {
        created_at: Date.now(),
        api_key: v4(),
        list_orders: {
          "scopes": [],
          "tasks/current": [],
        },
      },
      link: { user: user_id },
    }
  })

export type AccountCreateInput = z.input<typeof AccountCreateSchema>
export type AccountCreateOutput = z.output<typeof AccountCreateSchema>

export const parseAccountCreateInput = (input: AccountCreateInput) =>
  AccountCreateSchema.parse(input)

export const AccountUpdateSchema = z
  .object({
    list_orders: AccountListOrdersSchema.nullish(),
    custom_work_hours: AccountCustomWorkHoursSchema.nullish(),
  })
  .transform(({ ...data }) => {
    return {
      data,
    }
  })

export type AccountUpdateInput = z.input<typeof AccountUpdateSchema>
export type AccountUpdateOutput = z.output<typeof AccountUpdateSchema>

export const parseAccountUpdateInput = (input: AccountUpdateInput) =>
  AccountUpdateSchema.parse(input)
