import { z } from "zod"

export type ListOrders = z.infer<typeof ListOrdersSchema>

export const ListOrdersSchema = z.object({
  // Final shape after refactor
  scopes: z.array(z.uuidv4()).nullish(),
  current_tasks: z.array(z.uuidv4()).nullish(),
  // TODO: deprecate these after refactor
  tasks: z.array(z.uuidv4()).nullish(),
  current: z.array(z.string()).nullish(),
  snoozed: z.array(z.string()).nullish(),
  recurring: z.array(z.string()).nullish(),
  done: z.array(z.string()).nullish(),
})
