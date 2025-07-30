"use client"

import {
  AlarmClockIcon,
  CircleCheckBigIcon,
  CircleDashedIcon,
  CircleIcon,
  LucideIcon,
  SunMoonIcon,
} from "lucide-react"
import { formatDate } from "@/common/utils/date-utils"
import { Task } from "@/database/models/task"

export type TaskStateInfo = {
  Icon: LucideIcon
  text: string
}

export function getTaskStateInfo(task: Task, options?: { verbose?: boolean }): TaskStateInfo {
  if (task.inbox_state === "open") {
    const date = formatDate(new Date(task.created_at), { withTime: true })
    return {
      text: options?.verbose ? `Created ${date}` : date,
      Icon: CircleDashedIcon,
    }
  }

  if (task.inbox_state === "snoozed") {
    if (!task.snooze_date) {
      return {
        text: options?.verbose ? "Snoozed to Someday" : "Someday",
        Icon: SunMoonIcon,
      }
    }

    const date = formatDate(new Date(task.snooze_date))
    return {
      text: options?.verbose ? `Snoozed until ${date}` : `Until ${date}`,
      Icon: AlarmClockIcon,
    }
  }

  if (task.inbox_state === "archived") {
    const date = task.archive_date
      ? formatDate(new Date(task.archive_date), { withTime: true })
      : "-"
    return {
      text: options?.verbose ? `Completed ${date}` : date,
      Icon: CircleCheckBigIcon,
    }
  }

  return {
    text: "-",
    Icon: CircleIcon,
  }
}
