"use client"

import { useState } from "react"
import { Group } from "react-aria-components"
import { RecurringTaskFrequencyPicker } from "../recurring-task-frequency"
import { RecurringTaskFrequencyValues } from "../recurring-task-info"
import { CreateField } from "@/common/components/create-field"
import { cn } from "~/smui/utils"
import { useSessionStorageUtility } from "@/common/utils/use-storage-utility"
import { useCurrentScopeView } from "@/modules/scope/use-scope-views"
import { parseRecurringTaskCreateInput } from "@/database/models/recurring-task"
import { db } from "@/database/db-client"

export function RecurringTaskListCreateBox() {
  const { id: scopeId } = useCurrentScopeView()
  const [frequencyPickerOpen, setFrequencyPickerOpen] = useState(false)

  const [title, setTitle] = useState("")
  const [defaultFrequency, setDefaultFrequency] =
    useSessionStorageUtility<RecurringTaskFrequencyValues>("recurring-task-default-frequency", {
      recur_day_type: "weekday",
      recur_days: [0, 1, 2, 3, 4, 5, 6],
    })

  const handleTitleSubmit = async (title: string) => {
    setTitle(title)
    setFrequencyPickerOpen(true)
  }

  const handleFrequencySubmit = async (frequency: RecurringTaskFrequencyValues) => {
    setDefaultFrequency(frequency)
    const { id, data, link } = parseRecurringTaskCreateInput({
      title,
      scope_id: scopeId,
      ...frequency,
    })
    db.transact(db.tx.recurring_tasks[id].link(link).create(data))
    setTitle("")
  }

  return (
    <>
      <Group
        autoFocus
        className={cn([
          "group/create-box flex items-stretch gap-8",
          "bg-base-bg/50 min-h-fit",
          "hover:bg-base-bg focus-within:bg-base-bg rounded-sm",
          "focus-within:border-l-neutral-border focus-within:border-l-4",
        ])}
      >
        {({}) => (
          <>
            <CreateField
              onSubmit={handleTitleSubmit}
              placeholder={`Add recurring task`}
              classNames={{ base: "!outline-0 grow !bg-transparent p-8 gap-8" }}
            />
          </>
        )}
      </Group>
      <RecurringTaskFrequencyPicker
        isOpen={frequencyPickerOpen}
        onOpenChange={setFrequencyPickerOpen}
        initialValues={defaultFrequency}
        handleSaveValues={handleFrequencySubmit}
      />
    </>
  )
}
