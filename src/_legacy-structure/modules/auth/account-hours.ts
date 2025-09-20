import { AccountCustomWorkHours } from "@/database/models/account"
// import { getHours } from "date-fns"

export const DEFAULT_WORKING_HOURS: AccountCustomWorkHours = {
  tz: "America/New_York",
  start: 6,
}

export function isWorkHoursValid(hours: Omit<AccountCustomWorkHours, "tz">) {
  const isProvided = (val: number | null | undefined) => typeof val === "number"

  // if both shifts not provided, valid
  if (!isProvided(hours.mid) && !isProvided(hours.last)) return true

  // if last provided
  if (isProvided(hours.last)) {
    // mid must also be provided if so
    if (!isProvided(hours.mid)) return false

    // check that the range is no greater than 23
    if (hours.last - hours.start > 23) return false

    // check that all are in order
    return hours.start < hours.mid && hours.mid < hours.last
  }

  // only shift_1 provided
  if (isProvided(hours.mid)) {
    // check that the range is no greater than 23
    if (hours.mid - hours.start > 23) return false

    // check that it's after start
    return hours.start < hours.mid
  }

  return true
}
