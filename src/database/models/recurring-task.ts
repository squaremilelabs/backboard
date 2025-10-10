import { v4 } from "uuid"
import z from "zod"
import { Account } from "./account"
import { Scope } from "./scope"
import { Task } from "./task"

export type RecurringTask = {
  id: string
  created_at: number
  title: string
  content: string | null
  is_inactive: boolean
  recur_day_type: RecurringTaskRecurDayType
  recur_days: number[]
}

export type RecurringTaskLinks = {
  owner: Account
  scope: Scope
  tasks: Task[]
}

export type RecurringTaskRecurDayType = z.infer<typeof RecurringTaskRecurDayTypeEnum>

const RecurringTaskRecurDayTypeEnum = z.enum(["weekday", "monthday"])

export const RecurringTaskCreateSchema = z
  .intersection(
    z
      .object({
        id: z.uuidv4().optional(),
        owner_id: z.uuidv4(),
        scope_id: z.uuidv4().optional(),
        title: z.string().trim().min(1),
        content: z.string().trim().nullish(),
        is_inactive: z.boolean().optional().default(false),
      })
      .transform((val) => ({
        ...val,
        content: val.content || null,
        created_at: Date.now(),
      })),
    z.discriminatedUnion("recur_day_type", [
      z.object({
        recur_day_type: RecurringTaskRecurDayTypeEnum.extract(["weekday"]),
        recur_days: z.array(z.number().int().min(0).max(6)), // WeekdayInt
      }),
      z.object({
        recur_day_type: RecurringTaskRecurDayTypeEnum.extract(["monthday"]),
        recur_days: z.array(z.number().int().min(1).max(31)), // MonthdayInt
      }),
    ])
  )
  .transform(({ id, scope_id, owner_id, ...data }) => {
    const link: Partial<Record<keyof RecurringTaskLinks, string>> = {
      owner: owner_id,
    }
    if (scope_id) {
      link.scope = scope_id
    }
    return {
      id: id ?? v4(),
      data,
      link,
    }
  })

export type RecurringTaskCreateInput = z.input<typeof RecurringTaskCreateSchema>
export type RecurringTaskCreateOutput = z.output<typeof RecurringTaskCreateSchema>

export const parseRecurringTaskCreateInput = (input: RecurringTaskCreateInput) =>
  RecurringTaskCreateSchema.parse(input)

export const RecurringTaskUpdateSchema = z
  .intersection(
    z.object({
      scope_id: z.uuidv4().optional(),
      title: z.string().trim().min(1).optional(),
      content: z.string().trim().min(1).nullish(),
    }),
    z.discriminatedUnion("recur_day_type", [
      z.object({
        recur_day_type: RecurringTaskRecurDayTypeEnum.extract(["weekday"]),
        recur_days: z.array(z.number().int().min(0).max(6)), // WeekdayInt
      }),
      z.object({
        recur_day_type: RecurringTaskRecurDayTypeEnum.extract(["monthday"]),
        recur_days: z.array(z.number().int().min(1).max(31)), // MonthdayInt
      }),
      z.object({
        recur_day_type: z.undefined().optional(),
        recur_days: z.undefined().optional(),
      }),
    ])
  )
  .transform(({ scope_id, ...data }) => {
    return {
      data,
      link: scope_id ? { scope: scope_id } : undefined,
    }
  })

export type RecurringTaskUpdateInput = z.input<typeof RecurringTaskUpdateSchema>
export type RecurringTaskUpdateOutput = z.output<typeof RecurringTaskUpdateSchema>

export const parseRecurringTaskUpdateInput = (input: RecurringTaskUpdateInput) =>
  RecurringTaskUpdateSchema.parse(input)
