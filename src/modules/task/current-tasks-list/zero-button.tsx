"use client"

import { CircleCheckBigIcon } from "lucide-react"
import { useState } from "react"
import ReactConfetti from "react-confetti"
import { createPortal } from "react-dom"
import { useWindowSize } from "usehooks-ts"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"

export default function ZeroButton() {
  const { width, height } = useWindowSize()
  const [isConfettiOn, setIsConfettiOn] = useState(false)
  return (
    <>
      <Button
        isDisabled={isConfettiOn}
        className={[
          "flex items-center gap-8",
          `text-neutral-muted-fg bg-neutral-muted-bg rounded-full px-16 py-8 pr-24 text-lg
          font-semibold`,
          isConfettiOn && "bg-primary-bg text-primary-fg animate-bounce",
        ]}
        onPress={() => setIsConfettiOn(true)}
      >
        <Icon icon={<CircleCheckBigIcon />} variants={{ size: "lg" }} />0
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
    </>
  )
}
