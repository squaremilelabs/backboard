import { TooltipTrigger } from "react-aria-components"
import { useInstantAccount } from "./instant-account"
import { cn } from "~/smui/utils"
import { db } from "@/database/db"
import { Task } from "@/database/models/task"
import { Button } from "~/smui/button/components"
import { Tooltip } from "~/smui/tooltip/components"

export function AccountTaskState() {
  const { tasks, isLoading } = useAccountOpenTasks()

  // const openTaskCount = 0
  const openTaskCount = tasks?.length || 0

  return (
    <TooltipTrigger delay={0} closeDelay={0}>
      <Button
        className={cn(
          "flex min-w-30 items-center justify-center rounded-full px-8 py-1",
          "border-2 text-sm font-semibold",
          openTaskCount > 0 &&
            "border-primary-4 from-primary-3 to-primary-5 text-canvas-0 bg-gradient-to-br",
          openTaskCount === 0 && "bg-canvas-1 text-canvas-4"
        )}
      >
        {isLoading ? <>-</> : openTaskCount > 0 ? <>{openTaskCount}</> : <>0</>}
      </Button>
      <Tooltip
        offset={8}
        placement="left"
        className={cn("bg-canvas-0 text-sm", "text-canvas-7", "font-medium")}
      >
        {openTaskCount > 0
          ? `${openTaskCount} more task${openTaskCount > 1 ? "s" : "!"}`
          : `Backboard Zero 🎉`}
      </Tooltip>
    </TooltipTrigger>
  )
}

export function useAccountOpenTasks() {
  const account = useInstantAccount()

  const taskQuery = db.useQuery({
    tasks: {
      $: {
        where: {
          "inbox.owner.id": account?.id || "NO_ACCOUNT",
          "inbox.is_archived": false,
          "inbox_state": "open",
        },
      },
    },
  })

  return {
    tasks: taskQuery.data?.tasks as Task[] | undefined,
    isLoading: taskQuery.isLoading,
    error: taskQuery.error,
  }
}
