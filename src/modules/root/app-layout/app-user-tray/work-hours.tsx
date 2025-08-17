"use client"
import { getLocalTimeZone } from "@internationalized/date"
import { typography } from "@/common/components/class-names"
import { useAuth } from "@/modules/auth/use-auth"
import { HourSelect } from "@/common/components/hour-select"
import { AccountCustomWorkHours, parseAccountUpdateInput } from "@/database/models/account"
import { db } from "@/database/db-client"
import { DEFAULT_WORKING_HOURS, isWorkHoursValid } from "@/modules/auth/account-hours"

export function AppUserTrayWorkHours() {
  const { instantAccount } = useAuth()

  const values = instantAccount?.custom_work_hours || DEFAULT_WORKING_HOURS

  const setValues = (newValues: Omit<AccountCustomWorkHours, "tz">) => {
    if (!instantAccount) return null
    const { data } = parseAccountUpdateInput({
      custom_work_hours: {
        tz: getLocalTimeZone(),
        ...newValues,
      },
    })
    db.transact(db.tx.accounts[instantAccount.id].update(data))
  }

  const handleSelectionChange = (key: keyof AccountCustomWorkHours, value: number | "empty") => {
    if (key === "mid" && value === "empty") {
      setValues({ ...values, mid: null, last: null })
    } else {
      const pendingValues = { ...values, [key]: value === "empty" ? null : value }
      if (!isWorkHoursValid(pendingValues)) {
        const startValue = key === "start" ? (value as number) : values.start
        setValues({ start: startValue, mid: null, last: null })
      } else {
        setValues({ ...values, [key]: value === "empty" ? null : value })
      }
    }
  }

  const endOfNextDay = 23 + values.start
  return (
    <div className="flex flex-col">
      <p className={typography({ type: "label", className: "p-4" })}>My Hours</p>
      <HourSelect
        label="Start of day"
        selectedKey={values.start}
        onSelectionChange={(key) => handleSelectionChange("start", key as number)}
        min={0}
        max={values.mid ? Math.min(values.mid - 1, 12) : 12}
      />
      <HourSelect
        label="Later today means..."
        selectedKey={values.mid ?? null}
        onSelectionChange={(key) => handleSelectionChange("mid", key as number | "empty")}
        min={values.start + 1}
        max={values.last ? values.last - 1 : endOfNextDay}
        allowEmpty
      />
      {!!values.mid && (
        <HourSelect
          label="Later tonight means..."
          selectedKey={values.last ?? null}
          onSelectionChange={(key) => handleSelectionChange("last", key as number | "empty")}
          isDisabled={!values.mid}
          min={(values.mid ?? values.start) + 1}
          max={endOfNextDay}
          allowEmpty
        />
      )}
    </div>
  )
}
