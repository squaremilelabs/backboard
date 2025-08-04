import { id, InstaQLParams } from "@instantdb/react"
import { db } from "../db-client"
import { AppSchema } from "../instant.schema"

export type RecurringTask = {
  id: string
  created_at: number
  title: string
  content?: string
  frequency: RecurringTaskFrequency
  is_archived: boolean
}

interface BaseRecurringTaskFrequency {
  type: "daily" | "weekly" | "monthly"
}

interface DailyRecurringTaskFrequency extends BaseRecurringTaskFrequency {
  type: "daily"
  skip_weekends?: boolean
}

interface WeeklyRecurringTaskFrequency extends BaseRecurringTaskFrequency {
  type: "weekly"
  weekday: number // 0 (Sunday) to 6 (Saturday)
}

interface MonthlyRecurringTaskFrequency extends BaseRecurringTaskFrequency {
  type: "monthly"
  day: number // 1-31
}

export type RecurringTaskFrequency =
  | DailyRecurringTaskFrequency
  | WeeklyRecurringTaskFrequency
  | MonthlyRecurringTaskFrequency

export type RecurringTaskCreateParams = {
  inbox_id: string
  title: string
  content?: string
  frequency: RecurringTaskFrequency
}

export function createRecurringTask(data: RecurringTaskCreateParams) {
  const now = new Date().getTime()
  return db.transact([
    db.tx.recurring_tasks[id()].link({ inbox: data.inbox_id }).create({
      title: data.title,
      content: data.content ?? null,
      frequency: data.frequency,
      is_archived: false,
      created_at: now,
    }),
  ])
}

export type RecurringTaskUpdateParams = {
  title?: string
  content?: string
  inbox_id?: string
  frequency?: RecurringTaskFrequency
  is_archived?: boolean
}

export function updateRecurringTask(id: string, data: RecurringTaskUpdateParams) {
  return db.transact(
    [
      db.tx.recurring_tasks[id].update({
        title: data.title,
        content: data.content,
        frequency: data.frequency,
        is_archived: data.is_archived,
      }),
      data.inbox_id ? db.tx.inboxes[data.inbox_id].link({ recurring_tasks: id }) : null,
    ].filter((txn) => txn !== null)
  )
}

export type RecurringTaskQueryParams = InstaQLParams<AppSchema>["recurring_tasks"]

export function useRecurringTaskQuery<T extends RecurringTask = RecurringTask>(
  params: RecurringTaskQueryParams | null
): {
  data: T[] | undefined
  isLoading: boolean
  error: { message: string } | undefined
} {
  const { data, isLoading, error } = db.useQuery(params ? { recurring_tasks: params } : null)
  return {
    data: data?.recurring_tasks as T[],
    isLoading,
    error,
  }
}
