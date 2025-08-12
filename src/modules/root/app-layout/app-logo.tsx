"use client"
import { cn } from "~/smui/utils"

export function AppLogo({ withTitle }: { withTitle?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      {/* <Image
        src="/images/backboard-logo.svg"
        alt="Backboard Logo"
        width={16}
        height={16}
        className="shadow"
      /> */}
      {withTitle && (
        <p
          className={cn(
            "decoration-primary-text font-bold tracking-tight text-neutral-700 underline",
            "decoration-2"
          )}
        >
          Backboard
        </p>
      )}
    </div>
  )
}
