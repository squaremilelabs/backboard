import { z } from "zod"

export type ListOrders = z.infer<typeof ListOrdersSchema>

export const ListOrdersSchema = z.object({
  scopes: z.array(z.uuidv4()).nullish(),
  tasks: z.array(z.uuidv4()).nullish(),
  current: z.array(z.object({ id: z.uuidv4(), kind: z.enum(["task", "scope"]) })).nullish(),
  snoozed: z.array(z.object({ id: z.uuidv4(), kind: z.enum(["task", "scope"]) })).nullish(),
  recurring: z
    .array(z.object({ id: z.uuidv4(), kind: z.enum(["recurring_task", "scope"]) }))
    .nullish(),
  done: z.array(z.object({ id: z.uuidv4(), kind: z.enum(["task", "scope"]) })).nullish(),
})
