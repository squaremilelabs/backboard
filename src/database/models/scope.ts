import { v4 } from "uuid"
import z from "zod"
import { ListOrders, ListOrdersSchema } from "./_shared"
import { Account } from "./account"
import { RecurringTask } from "./recurring-task"
import { Task } from "./task"

export type Scope = {
  id: string
  created_at: number
  icon: ScopeIcon | null
  title: string
  content: string | null
  is_inactive: boolean
  list_orders: ListOrders | null
}

export type ScopeIcon = z.infer<typeof ScopeIconSchema>

export type ScopeLinks = {
  owner: Account
  tasks: Task[]
  recurring_tasks: RecurringTask[]
  parent_scope: Scope | null
  child_scopes: Scope[]
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
      data: {
        ...data,
        created_at: Date.now(),
      },
      link: { owner: owner_id },
      list_orders: {} satisfies ListOrders,
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
    list_orders: ListOrdersSchema.nullish(),
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
