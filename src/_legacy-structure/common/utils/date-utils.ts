import { parse, format } from "date-fns"

export function formatDate(
  dateInput: Date | string | null | undefined,
  options?: {
    withTime?: boolean
    customNoneLabel?: string
    withWeekday?: boolean
    onlyWeekday?: boolean
  }
): string {
  let date = dateInput

  if (typeof date === "string") {
    try {
      date = parse(date, "yyyy-MM-dd", new Date())
    } catch (_) {
      throw new Error(`Invalid date string: ${date}`)
    }
  }

  if (!date || !(date instanceof Date)) {
    if (options?.customNoneLabel) return options.customNoneLabel
    return "-"
  }

  const currentYear = new Date().getFullYear()
  const inputYear = date.getFullYear()
  let dateFormat = inputYear !== currentYear ? "MMM d, yy" : "MMM d"

  if (options?.withTime) {
    dateFormat += " h:mma"
  }

  if (options?.withWeekday) {
    dateFormat = "EEE " + dateFormat
  }

  if (options?.onlyWeekday) {
    dateFormat = "EEE"
  }

  return format(date, dateFormat)
}
