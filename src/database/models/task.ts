import * as z from "zod"
import { v4 } from "uuid"
import { RecurringTask } from "./recurring-task"
import { Scope } from "./scope"

export type Task = CurrentTask | SnoozedTask | DoneTask

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

export type CurrentTask = BaseTask & {
  status: "current"
  status_time: number
  prev_status: Omit<TaskStatus, "current"> | null
}

export type SnoozedTask = BaseTask & {
  status: "snoozed"
  status_time: number | null
  prev_status: Omit<TaskStatus, "snoozed"> | null
}

export type DoneTask = BaseTask & {
  status: "done"
  status_time: number
  prev_status: Omit<TaskStatus, "done">
}

const TaskStatusEnum = z.enum(["current", "snoozed", "done"])

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
        content: val.content || null,
        created_at: Date.now(),
      })),
    z.discriminatedUnion("status", [
      z.object({
        status: TaskStatusEnum.extract(["current"]),
        status_time: z.number(),
      }),
      z.object({
        status: TaskStatusEnum.extract(["snoozed"]),
        status_time: z.number().nullish().default(null),
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
      data,
      link,
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
      content: z.string().trim().min(1).nullish(),
    }),
    z.discriminatedUnion("status", [
      z.object({
        status: TaskStatusEnum.extract(["current"]),
        status_time: z.number(),
        prev_status: TaskStatusEnum.extract(["snoozed", "done"]),
      }),
      z.object({
        status: TaskStatusEnum.extract(["done"]),
        status_time: z.number(),
        prev_status: TaskStatusEnum.extract(["current", "snoozed"]),
      }),
      z.object({
        status: TaskStatusEnum.extract(["snoozed"]),
        status_time: z.number().nullable(),
        prev_status: TaskStatusEnum.extract(["current", "done"]),
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
