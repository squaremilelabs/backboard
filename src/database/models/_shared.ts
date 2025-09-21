import { z } from "zod"

export type ListOrders = z.infer<typeof ListOrdersSchema>

export const ListOrdersSchema = z.object({
  scopes: z.array(z.uuidv4()).nullish(),
  tasks: z.array(z.uuidv4()).nullish(),
})
