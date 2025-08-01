"use client"

import { TooltipTrigger } from "react-aria-components"
import Confetti from "react-confetti"
import { useWindowSize } from "usehooks-ts"
import { createPortal } from "react-dom"
import { useState } from "react"
import { useAuth } from "../auth/use-auth"
import { cn } from "~/smui/utils"
import { db } from "@/database/db"
import { Task } from "@/database/models/task"
import { Button } from "~/smui/button/components"
import { Tooltip } from "~/smui/tooltip/components"

// TODO: Refactor and fix confetti document error
export function TaskTotalCount() {
  const { tasks, isLoading } = useAccountOpenTasks()
  const { width, height } = useWindowSize()
  const [isConfettiOn, setIsConfettiOn] = useState(false)
  const openTaskCount = tasks?.length || 0

  return (
    <TooltipTrigger delay={0} closeDelay={0}>
      <Button
        onPress={openTaskCount === 0 && !isLoading ? () => setIsConfettiOn(true) : undefined}
        className={cn(
          "flex min-w-30 items-center justify-center rounded-full px-8 py-2",
          "border-[1.5px] text-sm font-bold",
          openTaskCount > 0 && "border-primary-text text-primary-text",
          openTaskCount === 0 && [
            "bg-neutral-muted-bg text-neutral-muted-fg",
            "hover:bg-primary-bg hover:text-primary-fg hover:border-primary-border cursor-pointer",
          ],
          isConfettiOn && "!bg-primary-bg !text-primary-fg !border-primary-border !animate-bounce"
        )}
      >
        {openTaskCount}
      </Button>
      {createPortal(
        <Confetti
          width={width}
          height={height}
          className="fixed top-0 left-0 !z-50"
          numberOfPieces={500}
          gravity={0.4}
          run={isConfettiOn}
          recycle={false}
          onConfettiComplete={(confetti) => {
            confetti?.reset()
            setIsConfettiOn(false)
          }}
        />,
        document.body
      )}
      <Tooltip
        offset={4}
        placement="bottom"
        className={cn(
          "rounded-full border px-16 py-4 text-sm font-semibold",
          "bg-base-bg text-primary-text",
          "tracking-wide"
        )}
      >
        {openTaskCount > 0
          ? `${openTaskCount} MORE TASK${openTaskCount > 1 ? "S" : ""}`
          : `BACKBOARD ZERO 🎉`}
      </Tooltip>
    </TooltipTrigger>
  )
}

export function useAccountOpenTasks() {
  const { instantAccount: account } = useAuth()

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
