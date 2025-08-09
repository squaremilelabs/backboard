import z from "zod"
import { v4 } from "uuid"
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

const ScopeIconSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("emoji"),
    unicode: z.string().regex(/^[0-9a-f]{1,6}(?:-[0-9a-f]{1,6})*$/),
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
    is_inactive: z.boolean().default(false),
  })
  .transform(({ id, owner_id, ...data }) => {
    return {
      id: id ?? v4(),
      data,
      link: { owner: owner_id },
    }
  })

export type ScopeCreateInput = z.input<typeof ScopeCreateSchema>
export type ScopeCreateOutput = z.output<typeof ScopeCreateSchema>

export const ScopeUpdateSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    content: z.string().trim().min(1).nullish(),
    icon: ScopeIconSchema.nullish(),
    is_inactive: z.boolean().optional(),
    link_task_ids: z.array(z.string().uuid()).optional(),
  })
  .transform(({ link_task_ids, ...data }) => {
    return {
      data,
      link: link_task_ids ? { tasks: link_task_ids } : undefined,
    }
  })

export type ScopeUpdateInput = z.input<typeof ScopeUpdateSchema>
export type ScopeUpdateOutput = z.output<typeof ScopeUpdateSchema>
