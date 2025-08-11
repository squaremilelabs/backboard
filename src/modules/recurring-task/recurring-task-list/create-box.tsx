import { useState } from "react"
import { Group } from "react-aria-components"
import { ArrowLeftRightIcon } from "lucide-react"
import { RecurringTaskFrequencyPicker } from "../recurring-task-frequency"
import { getRecurringTaskInfo } from "../recurring-task-info"
import { RecurringTaskFrequencyValues } from "../recurring-task-info"
import { CreateField } from "@/common/components/create-field"
import { cn } from "~/smui/utils"
import { Button } from "~/smui/button/components"
import { typography } from "@/common/components/class-names"
import { Icon } from "~/smui/icon/components"
import { useSessionStorageUtility } from "@/common/utils/use-storage-utility"
import { useCurrentScopeView } from "@/modules/scope/use-scope-views"
import { parseRecurringTaskCreateInput } from "@/database/models/recurring-task"
import { db } from "@/database/db-client"

export function RecurringTaskListCreateBox() {
  const { id: scopeId } = useCurrentScopeView()
  const [frequencyPickerOpen, setFrequencyPickerOpen] = useState(false)
  const [frequency, setFrequency] = useSessionStorageUtility<RecurringTaskFrequencyValues>(
    "recurring-task-default-frequency",
    {
      recur_day_type: "weekday",
      recur_days: [0, 1, 2, 3, 4, 5, 6],
    }
  )
  const handleCreate = async (title: string) => {
    const { id, data, link } = parseRecurringTaskCreateInput({
      title,
      scope_id: scopeId,
      ...frequency,
    })
    await db.transact(db.tx.recurring_tasks[id].link(link).create(data))
  }

  const { label: frequencyLabel } = getRecurringTaskInfo(frequency)
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
        {({ isFocusWithin }) => (
          <>
            <CreateField
              onSubmit={handleCreate}
              placeholder={`Add recurring task`}
              classNames={{ base: "!outline-0 grow !bg-transparent p-8 " }}
            />
            <Button
              onPress={() => setFrequencyPickerOpen(true)}
              className={cn(
                typography({ type: "label" }),
                "flex items-center gap-4 px-8",
                isFocusWithin || frequencyPickerOpen ? "visible" : "hidden"
              )}
            >
              <Icon icon={<ArrowLeftRightIcon />} variants={{ size: "sm" }} />
              {frequencyLabel}
            </Button>
          </>
        )}
      </Group>
      <RecurringTaskFrequencyPicker
        isOpen={frequencyPickerOpen}
        onOpenChange={setFrequencyPickerOpen}
        initialValues={frequency}
        handleSaveValues={setFrequency}
      />
    </>
  )
}
