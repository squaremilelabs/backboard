import { RefreshCwIcon, TextIcon } from "lucide-react"
import { useState } from "react"
import { typography } from "@/_deprecating/common/components/class-names"
import { Button } from "@/_deprecating/common/primitives/button/components"
import { GridListItem } from "@/_deprecating/common/primitives/grid-list/components"
import { Icon } from "@/_deprecating/common/primitives/icon/components"
import { Modal, ModalTrigger } from "@/_deprecating/common/primitives/modal/components"
import { ClassValue } from "@/_deprecating/common/utils/ui-utils"
import { db } from "@/database/db-client"
import { parseRecurringTaskUpdateInput, RecurringTask } from "@/database/models/recurring-task"
import { RecurringTaskFrequencyPicker } from "../recurring-task-frequency"
import { getRecurringTaskInfo, RecurringTaskFrequencyValues } from "../recurring-task-info"
import { RecurringTaskPanel } from "../recurring-task-panel"

export function RecurringTaskListItem({
  task,
  className,
}: {
  task: RecurringTask
  className: ClassValue
}) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [frequencyPickerOpen, setFrequencyPickerOpen] = useState(false)
  const { label } = getRecurringTaskInfo(task)

  const handleFrequencySave = (values: RecurringTaskFrequencyValues) => {
    const { data } = parseRecurringTaskUpdateInput(values)
    db.transact(db.tx.recurring_tasks[task.id].update(data))
  }
  return (
    <GridListItem
      id={task.id}
      textValue={task.title}
      className={[className, "rounded-sm"]}
      onAction={() => setPanelOpen(true)}
    >
      {() => {
        return (
          <>
            <div className="flex grow items-center gap-8 truncate">
              <Icon
                icon={<RefreshCwIcon />}
                variants={{ size: "sm" }}
                className="text-neutral-muted-text"
              />
              <ModalTrigger isOpen={panelOpen} onOpenChange={setPanelOpen}>
                <Button
                  variants={{ hover: "underline" }}
                  className="flex grow items-center gap-4 truncate"
                >
                  <span className="truncate">{task.title || "-"}</span>
                  {task.content ? (
                    <Icon
                      icon={<TextIcon />}
                      variants={{ size: "sm" }}
                      className="text-neutral-muted-text"
                    />
                  ) : null}
                </Button>
                <Modal isDismissable>
                  <RecurringTaskPanel task={task} />
                </Modal>
              </ModalTrigger>
            </div>
            <div className="flex min-h-20 min-w-fit grow items-center justify-end gap-8">
              <Button
                className={typography({ type: "label" })}
                onPress={() => setFrequencyPickerOpen(true)}
              >
                {label}
              </Button>
            </div>
            <RecurringTaskFrequencyPicker
              isOpen={frequencyPickerOpen}
              onOpenChange={setFrequencyPickerOpen}
              initialValues={{ recur_day_type: task.recur_day_type, recur_days: task.recur_days }}
              handleSaveValues={handleFrequencySave}
            />
          </>
        )
      }}
    </GridListItem>
  )
}
