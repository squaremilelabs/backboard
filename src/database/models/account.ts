import z from "zod"
import { v4 } from "uuid"
import { Scope } from "./scope"
import { ListOrders, ListOrdersSchema } from "./_shared"
import { Task } from "./task"
import { RecurringTask } from "./recurring-task"

export type Account = {
  id: string
  created_at: number
  list_orders: ListOrders | null
  api_key: string | null
  custom_work_hours: AccountCustomWorkHours | null
  app_config: AccountAppConfig | null
}

export type AccountLinks = {
  user: {
    id: string
    email: string
  }
  scopes: Scope[]
  tasks: Task[]
  recurring_tasks: RecurringTask[]
}

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
      const isHourProvided = (v: number | null | undefined) => typeof v === "number"
      // if both shifts not provided, valid
      if (!isHourProvided(val.mid) && !isHourProvided(val.last)) return true

      // if last provided
      if (isHourProvided(val.last)) {
        // mid must also be provided if so
        if (!isHourProvided(val.mid)) return false

        // check that the range is no greater than 23
        if (val.last - val.start > 23) return false

        // check that all are in order
        return val.start < val.mid && val.mid < val.last
      }

      // only shift_1 provided
      if (isHourProvided(val.mid)) {
        // check that the range is no greater than 23
        if (val.mid - val.start > 23) return false

        // check that it's after start
        return val.start < val.mid
      }

      return true
    },
    { message: "Invalid work hours" }
  )

export type AccountCustomWorkHours = z.infer<typeof AccountCustomWorkHoursSchema>

export const DEFAULT_ACCOUNT_WORK_HOURS: AccountCustomWorkHours = {
  tz: "America/New_York",
  start: 6,
}

export const AccountAppConfigSchema = z.object({
  accent_color: z.enum(["sml-gold", "sml-blue", "jeong-lav", "furey-orange"]).nullish(),
})

export type AccountAppConfig = z.infer<typeof AccountAppConfigSchema>

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
        list_orders: {} satisfies ListOrders,
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
    list_orders: ListOrdersSchema.nullish(),
    custom_work_hours: AccountCustomWorkHoursSchema.nullish(),
    app_config: AccountAppConfigSchema.nullish(),
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
