import { format } from "date-fns"
import { RecurringTask, RecurringTaskRecurDayType } from "@/database/models/recurring-task"

export type RecurringTaskFrequencyValues = Pick<RecurringTask, "recur_days" | "recur_day_type">

export type RecurringTaskFrequencyType =
  | "daily"
  | "weekdays"
  | "weekly"
  | "n-weekly"
  | "monthly"
  | "n-monthly"

export type RecurringTaskInfo = {
  label: string
  frequency: RecurringTaskFrequencyType
  dayType: RecurringTaskRecurDayType
  days: number[]
}

export const weekdayLabelMap: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
}

export const weekdayOptions: { value: number; label: string }[] = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
]

export const monthdayOptions: number[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
  28, 29, 30, 31,
]

export function getRecurringTaskInfo(
  task: Partial<RecurringTask> & RecurringTaskFrequencyValues
): RecurringTaskInfo {
  let label: string = "Recurring"
  let frequency: RecurringTaskFrequencyType = "daily"
  const sortedDays = task.recur_days.sort((a, b) => a - b)
  if (task.recur_day_type === "weekday") {
    const isDaily = task.recur_days.length === 7
    const isWeekdaily = task.recur_days.length === 5 && sortedDays.every((day, i) => day === i + 1)
    if (isDaily || isWeekdaily) {
      if (isDaily) {
        label = "Daily"
        frequency = "daily"
      }

      if (isWeekdaily) {
        label = "Weekdays"
        frequency = "weekdays"
      }
    } else {
      if (sortedDays.length === 1) {
        label = weekdayLabelMap[task.recur_days[0]] + "s"
        frequency = "weekly"
      } else if (sortedDays.length === 2) {
        label = sortedDays.map((day) => weekdayLabelMap[day].slice(0, 3) + "'s").join(" & ")
        frequency = "n-weekly"
      } else {
        label = sortedDays.length + "x Weekly"
        frequency = "n-weekly"
      }
    }
  }

  if (task.recur_day_type === "monthday") {
    if (sortedDays.length <= 2) {
      const dayLabels = sortedDays
        .map((day) => {
          return format(new Date(2020, 0, day), "do")
        })
        .join(" & ")
      label = `Monthly (${dayLabels})`
    } else {
      label = `${sortedDays.length}x Monthly`
    }
    frequency = sortedDays.length === 1 ? "monthly" : "n-monthly"
  }

  return {
    label,
    days: sortedDays,
    frequency: frequency,
    dayType: task.recur_day_type,
  }
}
