import { format } from "date-fns"
import { RecurringTask, RecurringTaskRecurDayType } from "@/database/models/recurring-task"

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

const weekdayLabelMap: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
}

export function getRecurringTaskInfo(task: RecurringTask): RecurringTaskInfo {
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
      } else {
        label = sortedDays.map((day) => weekdayLabelMap[day].slice(0, 3)).join(", ")
        frequency = "n-weekly"
      }
    }
  }

  if (task.recur_day_type === "monthday") {
    const dayLabels = sortedDays
      .map((day) => {
        return format(new Date(2020, 1, day), "do")
      })
      .join(", ")
    label = `Monthly (${dayLabels})`
    frequency = sortedDays.length === 1 ? "monthly" : "n-monthly"
  }

  return {
    label,
    days: sortedDays,
    frequency: frequency,
    dayType: task.recur_day_type,
  }
}
