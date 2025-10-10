import { formatDate, formatDistanceToNow, formatDistanceToNowStrict, isSameYear } from "date-fns"
import { RecurringTask } from "@/database/models/recurring-task"
import { Task } from "@/database/models/task"

type TimeLabels = {
  relativeShort: string // 5m | 2h | 1d | 1w | 1mo | 1y
  relativeLong: string // (in) 5 minutes (ago) | (in) 2 hours (ago) | in 2 hours | 1 day
  dateShort: string // Oct 9, 4:00p | Oct 10, 5:00p
  dateLong: string // Thursday, October 9, 2025 at 5:00p
}

type TaskTimeInfo = {
  statusSuffix: string
  statusTimeLabels: TimeLabels
  createdTimeLabels: TimeLabels
}

export function getTaskTimeInfo(
  task: Task & { recurring_task: RecurringTask | null }
): TaskTimeInfo {
  let statusSuffix: string = "Added"
  let statusRelativeShort: string = "-"
  let statusRelativeLong: string = "-"

  let statusDateShort: string = "-"
  let statusDateLong: string = "-"

  let createdRelativeShort: string = "-"
  let createdRelativeLong: string = "-"

  let createdDateShort: string = "-"
  let createdDateLong: string = "-"

  if (task.status_time) {
    const relativeTimeLabels = getRelativeTimeLabels(new Date(task.status_time))
    const dateTimeLabels = getDateTimeLabels(new Date(task.status_time))
    statusRelativeShort = relativeTimeLabels.short
    statusRelativeLong = relativeTimeLabels.long
    statusDateShort = dateTimeLabels.short
    statusDateLong = dateTimeLabels.long
  }

  if (task.created_at) {
    const relativeTimeLabels = getRelativeTimeLabels(new Date(task.created_at))
    const dateTimeLabels = getDateTimeLabels(new Date(task.created_at))
    createdRelativeShort = relativeTimeLabels.short
    createdRelativeLong = relativeTimeLabels.long
    createdDateShort = dateTimeLabels.short
    createdDateLong = dateTimeLabels.long
  }

  if (task.status === "current") {
    if (task.prev_status === null) {
      if (task.recurring_task) {
        statusSuffix = "Recurred"
      } else {
        statusSuffix = "Added"
      }
    }
    if (task.prev_status === "snoozed") {
      statusSuffix = "Unsnoozed"
    }
    if (task.prev_status === "done") {
      statusSuffix = "Reopened"
    }
  }

  if (task.status === "snoozed") {
    statusSuffix = "Snoozed for"
    statusRelativeLong = statusRelativeLong.replace("in ", "").replace(" ago", "")
    if (task.status_time === null) {
      statusSuffix = "Snoozed until"
      statusRelativeShort = "Som."
      statusRelativeLong = "Someday"
      statusDateLong = "Someday"
      statusDateShort = "Someday"
    }
  }

  if (task.status === "done") {
    statusSuffix = "Completed"
  }

  return {
    statusSuffix: statusSuffix,
    statusTimeLabels: {
      relativeShort: statusRelativeShort,
      relativeLong: statusRelativeLong,
      dateShort: statusDateShort,
      dateLong: statusDateLong,
    },
    createdTimeLabels: {
      relativeShort: createdRelativeShort,
      relativeLong: createdRelativeLong,
      dateShort: createdDateShort,
      dateLong: createdDateLong,
    },
  }
}

function getRelativeTimeLabels(date: Date): { short: string; long: string } {
  const [fromNowInt, fromNowUnit] = formatDistanceToNowStrict(date)?.split(" ")
  const fromNowFull = formatDistanceToNow(date, { addSuffix: true })

  let shortUnit = fromNowUnit[0]
  if (fromNowUnit.startsWith("month")) {
    shortUnit = "mo"
  }

  return {
    short: fromNowInt + shortUnit,
    long: fromNowFull,
  }
}

function getDateTimeLabels(date: Date): { short: string; long: string } {
  const shouldDisplayYearInShort = !isSameYear(new Date(), date)
  return {
    short: formatDate(
      date,
      shouldDisplayYearInShort ? "MMM d ''yy, h:mmaaaaa" : "MMM d, h:mmaaaaa"
    ),
    long: formatDate(date, "eee, MMM d, yyyy 'at' h:mmaaaaa"),
  }
}
