"use client"

import {
  AlarmClockOffIcon,
  CheckIcon,
  CircleIcon,
  ClockFadingIcon,
  LucideIcon,
  PlusIcon,
  RefreshCwIcon,
  SunMoonIcon,
  Undo2Icon,
} from "lucide-react"
import { formatDate } from "@/common/utils/date-utils"
import { Task } from "@/database/models/task"
import { RecurringTask } from "@/database/models/recurring-task"

export type TaskStatusInfo = {
  Icon: LucideIcon
  text: string
}

export function getTaskStatusInfo(
  task: Task & { recurring_task?: RecurringTask },
  options?: { verbose?: boolean }
): TaskStatusInfo {
  if (task.status === "now") {
    const date = formatDate(new Date(task.status_time), {
      withTime: options?.verbose ? true : false,
    })
    if (task.prev_status === "later") {
      return {
        text: options?.verbose ? `Unsnoozed ${date}` : date,
        Icon: AlarmClockOffIcon,
      }
    }
    if (task.prev_status === "done") {
      return {
        text: options?.verbose ? `Reopened ${date}` : date,
        Icon: Undo2Icon,
      }
    }
    if (task.recurring_task) {
      return {
        text: options?.verbose ? `Recurred ${date}` : date,
        Icon: RefreshCwIcon,
      }
    }
    return {
      text: options?.verbose ? `Added ${date}` : date,
      Icon: PlusIcon,
    }
  }

  if (task.status === "later") {
    if (!task.status_time) {
      return {
        text: options?.verbose ? "Snoozed until Someday" : "Someday",
        Icon: SunMoonIcon,
      }
    }

    const date = formatDate(new Date(task.status_time))
    return {
      text: options?.verbose ? `Snoozed until ${date}` : `${date}`,
      Icon: ClockFadingIcon,
    }
  }

  if (task.status === "done") {
    const date = task.status_time ? formatDate(new Date(task.status_time), { withTime: true }) : "-"
    return {
      text: options?.verbose ? `Done ${date}` : date,
      Icon: CheckIcon,
    }
  }

  return {
    text: "-",
    Icon: CircleIcon,
  }
}
