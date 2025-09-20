"use client"
import { useState } from "react"
import Link from "next/link"
import ReactConfetti from "react-confetti"
import { createPortal } from "react-dom"
import { useWindowSize } from "usehooks-ts"
import { ArrowRightIcon, PartyPopperIcon } from "lucide-react"
import { TaskStatus } from "@/database/models/task"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"

export function EmptyUI({ statusView }: { statusView: TaskStatus }) {
  const { width, height } = useWindowSize()
  const [isConfettiOn, setIsConfettiOn] = useState(false)

  return (
    <div className="flex h-[40dvh] w-full flex-col items-center justify-center gap-8">
      <Button
        isDisabled={isConfettiOn}
        className={[
          "flex items-center gap-8",
          "text-lg",
          "rounded-sm font-semibold",
          "text-primary-text",
          isConfettiOn && "animate-bounce",
          "decoration-2",
        ]}
        onPress={() => setIsConfettiOn(true)}
      >
        Backboard Zero
        <Icon icon={<PartyPopperIcon />} variants={{ size: "lg" }} />
      </Button>
      {createPortal(
        <ReactConfetti
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
      {statusView !== "snoozed" && (
        <Link
          href="/snoozed"
          className="text-neutral-muted-text flex items-center gap-4 text-sm hover:opacity-70"
        >
          Review snoozed tasks
          <Icon icon={<ArrowRightIcon />} variants={{ size: "sm" }} />
        </Link>
      )}
    </div>
  )
}
