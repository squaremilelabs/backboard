import { useState } from "react"
import { RefreshCwIcon, RefreshCwOffIcon } from "lucide-react"
import { getRecurringTaskInfo, RecurringTaskFrequencyValues } from "../recurring-task-info"
import { RecurringTaskFrequencyPicker } from "../recurring-task-frequency"
import { palette, panel } from "@/common/components/class-names"
import {
  TitleContentFields,
  TitleContentFieldValues,
} from "@/common/components/title-content-fields"
import { db } from "@/database/db-client"
import { parseRecurringTaskUpdateInput, RecurringTask } from "@/database/models/recurring-task"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"

export function RecurringTaskPanel({ task }: { task: RecurringTask }) {
  const { base, section } = panel()
  const [frequencyPickerOpen, setFrequencyPickerOpen] = useState(false)

  const handleTitleContentSave = (values: Partial<TitleContentFieldValues>) => {
    const { data } = parseRecurringTaskUpdateInput(values)
    db.transact(db.tx.recurring_tasks[task.id].update(data))
  }

  const handleFrequencySave = (values: RecurringTaskFrequencyValues) => {
    const { data } = parseRecurringTaskUpdateInput(values)
    db.transact(db.tx.recurring_tasks[task.id].update(data))
  }

  const handleInactivate = () => {
    db.transact(db.tx.recurring_tasks[task.id].update({ is_inactive: !task.is_inactive }))
  }

  const { label: frequencyLabel } = getRecurringTaskInfo(task)

  return (
    <div className={base()}>
      <div className={section()}>
        <div className="flex items-center gap-4">
          <Icon icon={<RefreshCwIcon />} className="text-neutral-text" variants={{ size: "sm" }} />
          <Button
            className={"text-neutral-text text-sm font-medium"}
            onPress={() => setFrequencyPickerOpen(true)}
          >
            Recurs {frequencyLabel}
          </Button>
          <RecurringTaskFrequencyPicker
            isOpen={frequencyPickerOpen}
            onOpenChange={setFrequencyPickerOpen}
            initialValues={{ recur_day_type: task.recur_day_type, recur_days: task.recur_days }}
            handleSaveValues={handleFrequencySave}
          />
        </div>
      </div>
      <TitleContentFields
        initialValues={{ title: task.title, content: task.content || null }}
        handleSaveValues={handleTitleContentSave}
      />
      <div className={section()}>
        <Button
          variants={{ variant: "action-button" }}
          className={[palette({ p: task.is_inactive ? "base-flat" : "neutral-muted-flat" })]}
          onPress={handleInactivate}
        >
          <Icon icon={task.is_inactive ? <RefreshCwIcon /> : <RefreshCwOffIcon />} />
          {task.is_inactive ? "Make active" : "Make inactive"}
        </Button>
      </div>
    </div>
  )
}
