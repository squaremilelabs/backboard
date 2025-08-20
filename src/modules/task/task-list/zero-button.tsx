"use client"
import { useState } from "react"
import ReactConfetti from "react-confetti"
import { createPortal } from "react-dom"
import { useWindowSize } from "usehooks-ts"
import { PartyPopperIcon } from "lucide-react"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"

export function ZeroButton() {
  const { width, height } = useWindowSize()
  const [isConfettiOn, setIsConfettiOn] = useState(false)

  return (
    <>
      <Button
        isDisabled={isConfettiOn}
        className={[
          "flex items-center gap-8",
          "rounded-sm text-lg font-semibold",
          "text-primary-text",
          "text-lg",
          "slashed-zero",
          isConfettiOn && "animate-bounce",
          "text-lg",
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
    </>
  )
}
