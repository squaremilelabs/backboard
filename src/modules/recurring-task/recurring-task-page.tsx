"use client"

import { PlusIcon } from "lucide-react"
import { RecurringTaskModal } from "./recurring-task-info"
import { RecurringTaskList } from "./recurring-task-list"
import { cn } from "~/smui/utils"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"

export function RecurringTaskPage() {
  return (
    <div className="flex flex-col">
      <RecurringTaskList />
      <RecurringTaskModal>
        <Button
          className={cn(
            "flex items-center",
            "gap-8 px-16 py-8",
            "hover:bg-canvas-1 cursor-pointer",
            "text-canvas-3"
          )}
        >
          <Icon icon={<PlusIcon />} />
          Add
        </Button>
      </RecurringTaskModal>
    </div>
  )
}
