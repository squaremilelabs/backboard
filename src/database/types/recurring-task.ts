import { DateTimeValue } from "./utils"
import { Scope } from "./scope"
import { Task } from "./task"

export type RecurringTask = WeekdayRecurringTask | MonthdayRecurringTask

export type RecurringTaskLinks = {
  scope: Scope
  tasks: Task[]
}

type BaseRecurringTask = {
  id: string
  created_at: DateTimeValue
  title: string
  content: string | null
  is_inactive: boolean
  recur_day_type: RecurringTaskRecurDayType
  recur_days: WeekdayInt[] | MonthdayInt[]
}

type RecurringTaskRecurDayType = "weekday" | "monthday"

type WeekdayRecurringTask = BaseRecurringTask & {
  recur_day_type: "weekday"
  recur_days: WeekdayInt[]
}

type MonthdayRecurringTask = BaseRecurringTask & {
  recur_day_type: "monthday"
  recur_days: MonthdayInt[]
}

/** 0 to 6 (Starts Sunday) */
export type WeekdayInt = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** 1 to 31 */
export type MonthdayInt =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
