import * as z from "zod"
import { v4 } from "uuid"
import { RecurringTask } from "./recurring-task"
import { Scope } from "./scope"

export type Task = NowTask | LaterTask | DoneTask

export type TaskStatus = z.infer<typeof TaskStatusEnum>

export type TaskLinks = {
  scope: Scope
  recurring_task: RecurringTask | null
}

type BaseTask = {
  id: string
  created_at: number
  title: string
  content: string | null
  status: TaskStatus
  status_time: number | null
  prev_status: TaskStatus | null
}

type NowTask = BaseTask & {
  status: "now"
  status_time: number
  prev_status: Omit<TaskStatus, "now"> | null
}

type LaterTask = BaseTask & {
  status: "later"
  status_time: number | null
  prev_status: Omit<TaskStatus, "later"> | null
}

type DoneTask = BaseTask & {
  status: "done"
  status_time: number
  prev_status: Omit<TaskStatus, "done">
}

const TaskStatusEnum = z.enum(["now", "later", "done"])

export const TaskCreateSchema = z
  .intersection(
    z
      .object({
        id: z.uuidv4().optional(),
        scope_id: z.uuidv4(),
        recurring_task_id: z.uuidv4().nullish(),
        title: z.string().trim().min(1),
        content: z.string().trim().min(1).nullish(),
      })
      .transform((val) => ({
        ...val,
        created_at: Date.now(),
      })),
    z.discriminatedUnion("status", [
      z.object({
        status: TaskStatusEnum.extract(["now"]),
        status_time: z.number().optional().default(Date.now()),
      }),
      z.object({
        status: TaskStatusEnum.extract(["later"]),
        status_time: z.number().nullish(),
      }),
    ])
  )
  .transform(({ id, scope_id, recurring_task_id, ...data }) => {
    const link: Partial<Record<keyof TaskLinks, string>> = { scope: scope_id }
    if (recurring_task_id) {
      link.recurring_task = recurring_task_id
    }
    return {
      id: id ?? v4(),
      data: {
        ...data,
        // TODO: REMOVE
        inbox_state: data.status === "later" ? "snoozed" : "open",
      },
      link: {
        ...link,
        // TODO: REMOVE
        inbox: scope_id,
      },
    }
  })

export type TaskCreateInput = z.input<typeof TaskCreateSchema>
export type TaskCreateOutput = z.output<typeof TaskCreateSchema>

export const parseTaskCreateInput = (input: TaskCreateInput) => TaskCreateSchema.parse(input)

export const TaskUpdateSchema = z
  .intersection(
    z.object({
      scope_id: z.uuidv4().optional(),
      title: z.string().trim().min(1).optional(),
      content: z.string().trim().min(1).optional(),
    }),
    z.discriminatedUnion("status", [
      z.object({
        status: TaskStatusEnum.extract(["now"]),
        status_time: z.number().optional().default(Date.now()),
        prev_status: TaskStatusEnum.extract(["later", "done"]),
      }),
      z.object({
        status: TaskStatusEnum.extract(["done"]),
        status_time: z.number().optional().default(Date.now()),
        prev_status: TaskStatusEnum.extract(["now", "later"]),
      }),
      z.object({
        status: TaskStatusEnum.extract(["later"]),
        status_time: z.number().nullable(),
        prev_status: TaskStatusEnum.extract(["now", "done"]),
      }),
      z.object({
        status: z.undefined().optional(),
        status_time: z.number().nullish(),
      }),
    ])
  )
  .transform(({ scope_id, ...data }) => {
    return {
      data,
      link: scope_id ? { scope: scope_id } : undefined,
    }
  })

export type TaskUpdateInput = z.input<typeof TaskUpdateSchema>
export type TaskUpdateOutput = z.output<typeof TaskUpdateSchema>

export const parseTaskUpdateInput = (input: TaskUpdateInput) => TaskUpdateSchema.parse(input)
