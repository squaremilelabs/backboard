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

export type TaskStatusInfo = {
  Icon: LucideIcon
  text: string
}

export function getTaskStatusInfo(task: Task, options?: { verbose?: boolean }): TaskStatusInfo {
  if (task.status === "now") {
    const date = formatDate(new Date(task.status_time), { withTime: true })
    return {
      text: options?.verbose ? `Since ${date}` : date,
      Icon: CircleDashedIcon,
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
      text: options?.verbose ? `Snoozed until ${date}` : `Until ${date}`,
      Icon: AlarmClockIcon,
    }
  }

  if (task.status === "done") {
    const date = task.status_time ? formatDate(new Date(task.status_time), { withTime: true }) : "-"
    return {
      text: options?.verbose ? `Done ${date}` : date,
      Icon: CircleCheckBigIcon,
    }
  }

  return {
    text: "-",
    Icon: CircleIcon,
  }
}
