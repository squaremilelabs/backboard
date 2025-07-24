"use client"

import { PlusIcon } from "lucide-react"
import { RecurringTaskFormModal } from "./recurring-task-form-modal"
import { RecurringTaskList } from "./recurring-task-list"
import { cn } from "~/smui/utils"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"

export function RecurringTaskPage() {
  return (
    <div className="flex flex-col">
      <RecurringTaskList />
      <RecurringTaskFormModal>
        <Button
          className={cn(
            "flex items-center",
            "gap-8 px-16 py-8",
            "cursor-pointer hover:bg-canvas-1",
            "text-canvas-3"
          )}
        >
          <Icon icon={<PlusIcon />} />
          Add
        </Button>
      </RecurringTaskFormModal>
    </div>
  )
}
