"use client"

import { TooltipTrigger } from "react-aria-components"
import Confetti from "react-confetti"
import { useWindowSize } from "usehooks-ts"
import { createPortal } from "react-dom"
import { useState } from "react"
import { useInstantAccount } from "../account/instant-account"
import { cn } from "~/smui/utils"
import { db } from "@/database/db"
import { Task } from "@/database/models/task"
import { Button } from "~/smui/button/components"
import { Tooltip } from "~/smui/tooltip/components"

export function TaskTotalCount() {
  const { tasks, isLoading } = useAccountOpenTasks()
  const { width, height } = useWindowSize()
  const [runConfetti, setRunConfetti] = useState(false)
  // const openTaskCount = 0
  const openTaskCount = tasks?.length || 0

  return (
    <TooltipTrigger delay={0} closeDelay={500}>
      <Button
        onPress={openTaskCount === 0 && !isLoading ? () => setRunConfetti(true) : undefined}
        className={cn(
          "flex min-w-30 items-center justify-center rounded-full px-8 py-1",
          "border-2 text-sm font-semibold",
          openTaskCount > 0 &&
            "border-primary-4 from-primary-3 to-primary-5 text-canvas-0 bg-gradient-to-br",
          openTaskCount === 0 && "bg-canvas-1 dark:bg-canvas-2 text-canvas-4"
        )}
      >
        {openTaskCount}
      </Button>
      {createPortal(
        <Confetti
          width={width}
          height={height}
          className="fixed top-0 left-0 !z-50"
          numberOfPieces={300}
          gravity={0.4}
          run={runConfetti}
          recycle={false}
          onConfettiComplete={(confetti) => {
            confetti?.reset()
            setRunConfetti(false)
          }}
        />,
        document.body
      )}
      <Tooltip
        offset={8}
        placement="left"
        className={cn(
          "bg-canvas-0 text-sm font-semibold",
          openTaskCount > 0 ? "text-primary-5" : openTaskCount === 0 && "text-canvas-7",
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
