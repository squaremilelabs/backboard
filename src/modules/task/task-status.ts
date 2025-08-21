"use client"
import {
  AlarmClockOffIcon,
  CheckIcon,
  CircleIcon,
  ClockFadingIcon,
  DiamondIcon,
  LucideIcon,
  RefreshCwIcon,
  SunMoonIcon,
  Undo2Icon,
} from "lucide-react"
import {
  addDays,
  addHours,
  format,
  getMinutes,
  isAfter,
  isBefore,
  startOfDay,
  startOfHour,
  subDays,
  subHours,
  subSeconds,
} from "date-fns"
import { DEFAULT_WORKING_HOURS } from "../auth/account-hours"
import { formatDate } from "@/common/utils/date-utils"
import { Task, TaskLinks } from "@/database/models/task"
import { AccountCustomWorkHours } from "@/database/models/account"

export type TaskStatusInfo = {
  Icon: LucideIcon
  text: string
}

export function getTaskStatusInfo(
  task: Task & Partial<TaskLinks>,
  accountHours: AccountCustomWorkHours | null | undefined,
  options?: { verbose?: boolean }
): TaskStatusInfo {
  const hours = accountHours ?? DEFAULT_WORKING_HOURS

  // set relative day
  const taskStatusTime = new Date(task.status_time ?? 0)
  let dayText = formatDate(taskStatusTime)

  // is within 5 day range (both sides)
  if (
    isAfter(taskStatusTime, subDays(new Date(), 5)) &&
    isBefore(taskStatusTime, addDays(new Date(), 5))
  ) {
    dayText = format(taskStatusTime, options?.verbose ? "EEEE" : "EEE")
  }

  // is today, yesterday, or tomorrow
  const startOfToday = addHours(
    startOfDay(subHours(startOfHour(new Date()), hours.start)),
    hours.start
  )
  const startOfYesterday = subDays(startOfToday, 1)
  const startOfTomorrow = addDays(startOfToday, 1)
  const endOfTomorrow = addDays(startOfTomorrow, 1)

  const isToday =
    isAfter(taskStatusTime, subSeconds(startOfToday, 1)) &&
    isBefore(taskStatusTime, startOfTomorrow)
  const isYesterday =
    isAfter(taskStatusTime, subSeconds(startOfYesterday, 1)) &&
    isBefore(taskStatusTime, startOfToday)
  const isTomorrow =
    isAfter(taskStatusTime, subSeconds(startOfTomorrow, 1)) &&
    isBefore(taskStatusTime, endOfTomorrow)

  if (isToday) {
    dayText = options?.verbose ? "Today" : "Today"
  }
  if (isYesterday) {
    dayText = options?.verbose ? "Yesterday" : "Yest"
  }
  if (isTomorrow) {
    dayText = options?.verbose ? "Tomorrow" : "Tmrw"
  }

  const timeFormat = getMinutes(taskStatusTime) === 0 ? "ha" : "h:mma"
  const timeText = format(taskStatusTime, timeFormat)

  if (task.status === "current") {
    if (task.prev_status === "snoozed") {
      return {
        text: options?.verbose
          ? `Unsnoozed ${dayText} at ${timeText}`
          : `${dayText} ${timeText}`.trim(),
        Icon: AlarmClockOffIcon,
      }
    }
    if (task.prev_status === "done") {
      return {
        text: options?.verbose
          ? `Reopened ${dayText} at ${timeText}`
          : `${dayText} ${timeText}`.trim(),
        Icon: Undo2Icon,
      }
    }
    if (task.recurring_task) {
      return {
        text: options?.verbose
          ? `Recurred ${dayText} at ${timeText}`
          : `${dayText} ${timeText}`.trim(),
        Icon: RefreshCwIcon,
      }
    }
    return {
      text: options?.verbose ? `Added ${dayText} at ${timeText}` : `${dayText} ${timeText}`.trim(),
      Icon: DiamondIcon,
    }
  }

  if (task.status === "snoozed") {
    if (!task.status_time) {
      return {
        text: options?.verbose ? "Snoozed until Someday" : "Someday",
        Icon: SunMoonIcon,
      }
    }

    return {
      text: options?.verbose
        ? `Snoozed until ${dayText} at ${timeText}`
        : `${dayText} ${timeText}`.trim(),
      Icon: ClockFadingIcon,
    }
  }

  if (task.status === "done") {
    return {
      text: options?.verbose ? `Done ${dayText} at ${timeText}` : `${dayText} ${timeText}`.trim(),
      Icon: CheckIcon,
    }
  }

  return {
    text: "-",
    Icon: CircleIcon,
  }
}
