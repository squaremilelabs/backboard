import { z } from "zod"

export type ListOrders = z.infer<typeof ListOrdersSchema>

export const ListOrdersSchema = z.object({
  // TODO: deprecate after logic is implemented with new orders
  scopes: z.array(z.uuidv4()).nullish(),
  tasks: z.array(z.uuidv4()).nullish(),
  // new view objects
  current: z.array(z.string()).nullish(),
  snoozed: z.array(z.string()).nullish(),
  recurring: z.array(z.string()).nullish(),
  done: z.array(z.string()).nullish(),
})
