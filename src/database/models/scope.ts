import z from "zod"
import { v4 } from "uuid"
import { Account } from "./account"
import { Task } from "./task"
import { RecurringTask } from "./recurring-task"

export type ScopeListOrderKey = keyof ScopeListOrders
export type ScopeListOrders = z.infer<typeof ScopeListOrdersSchema>

export type Scope = {
  id: string
  created_at: number
  icon: ScopeIcon
  title: string
  content: string | null
  is_inactive: boolean
  list_orders: ScopeListOrders | null
}

export type ScopeIcon = z.infer<typeof ScopeIconSchema>

export type ScopeLinks = {
  owner: Account
  tasks: Task[]
  recurring_tasks: RecurringTask[]
}

const ScopeIconSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("emoji"),
    unified: z.string().regex(/^[0-9a-f]{1,6}(?:-[0-9a-f]{1,6})*$/),
    char: z.emoji().optional(),
  }),
  z.object({
    type: z.literal("url"),
    url: z.url(),
  }),
])

const ScopeListOrdersSchema = z.object({
  "tasks/now": z.array(z.uuidv4()).nullish(),
})

export const ScopeCreateSchema = z
  .object({
    id: z.uuidv4().optional(),
    owner_id: z.uuidv4(),
    title: z.string().trim().min(1),
    content: z.string().trim().min(1).nullable(),
    icon: ScopeIconSchema.nullable(),
    is_inactive: z.boolean().optional().default(false),
  })
  .transform(({ id, owner_id, ...data }) => {
    return {
      id: id ?? v4(),
      data,
      link: { owner: owner_id },
      list_orders: {
        "tasks/now": [],
      } satisfies ScopeListOrders,
    }
  })

export type ScopeCreateInput = z.input<typeof ScopeCreateSchema>
export type ScopeCreateOutput = z.output<typeof ScopeCreateSchema>

export const parseScopeCreateInput = (input: ScopeCreateInput) => ScopeCreateSchema.parse(input)

export const ScopeUpdateSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    content: z.string().trim().min(1).nullish(),
    icon: ScopeIconSchema.nullish(),
    is_inactive: z.boolean().optional(),
    list_orders: ScopeListOrdersSchema.nullish(),
    link_task_ids: z.array(z.uuidv4()).optional(),
    link_recurring_task_ids: z.array(z.uuidv4()).optional(),
  })
  .transform(({ link_task_ids, link_recurring_task_ids, ...data }) => {
    let link: Partial<Record<keyof ScopeLinks, string[]>> | undefined = undefined
    if (link_task_ids || link_recurring_task_ids) {
      link = {}
      if (link_task_ids) {
        link.tasks = link_task_ids
      }
      if (link_recurring_task_ids) {
        link.recurring_tasks = link_recurring_task_ids
      }
    }
    return { data, link }
  })

export type ScopeUpdateInput = z.input<typeof ScopeUpdateSchema>
export type ScopeUpdateOutput = z.output<typeof ScopeUpdateSchema>

export const parseScopeUpdateInput = (input: ScopeUpdateInput) => ScopeUpdateSchema.parse(input)
