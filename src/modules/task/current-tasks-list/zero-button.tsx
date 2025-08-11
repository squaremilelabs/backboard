"use client"

import { useState } from "react"
import ReactConfetti from "react-confetti"
import { createPortal } from "react-dom"
import { useWindowSize } from "usehooks-ts"
import { Button } from "~/smui/button/components"

export default function ZeroButton() {
  const { width, height } = useWindowSize()
  const [isConfettiOn, setIsConfettiOn] = useState(false)
  return (
    <>
      <Button
        isDisabled={isConfettiOn}
        className={["text-primary-text text-lg font-semibold", isConfettiOn && "animate-bounce"]}
        onPress={() => setIsConfettiOn(true)}
      >
        All done! 🎉
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
