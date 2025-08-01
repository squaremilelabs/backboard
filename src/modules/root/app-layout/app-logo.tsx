"use client"
import Image from "next/image"

export function AppLogo({ withTitle }: { withTitle?: boolean }) {
  return (
    <div className="flex items-center gap-8">
      <Image
        src="/images/backboard-logo.svg"
        alt="Backboard Logo"
        width={16}
        height={16}
        className="shadow"
      />
      {withTitle && <p className={"text-neutral-text font-semibold"}>Backboard</p>}
    </div>
  )
}
