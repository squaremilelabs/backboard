"use client"

import { TooltipTrigger } from "react-aria-components"
import Confetti from "react-confetti"
import { useWindowSize } from "usehooks-ts"
import { createPortal } from "react-dom"
import { useState } from "react"
import { CircleCheckBigIcon } from "lucide-react"
import { useAuth } from "../auth/use-auth"
import { cn } from "~/smui/utils"
import { db } from "@/database/db"
import { Task } from "@/database/models/task"
import { Button } from "~/smui/button/components"
import { Tooltip } from "~/smui/tooltip/components"
import { Icon } from "~/smui/icon/components"

// TODO: Refactor
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
          "flex items-center justify-center gap-2 rounded-full px-4",
          "font-bold",
          openTaskCount > 0 && "text-primary-text !cursor-auto !opacity-100",
          openTaskCount === 0 && ["text-neutral-muted-text", "hover:text-primary-text"],
          isConfettiOn && "text-primary-text !animate-bounce"
        )}
      >
        {openTaskCount === 0 && (
          <Icon icon={<CircleCheckBigIcon strokeWidth={3} absoluteStrokeWidth />} />
        )}
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
        placement="left"
        className={cn(
          "rounded-full px-16 py-4 text-sm font-semibold",
          "text-primary-text bg-primary-muted-bg",
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
