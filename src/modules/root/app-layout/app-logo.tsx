"use client"
import { typography } from "@/common/components/class-names"

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
        <p className={typography({ type: "backboard-type", className: "decoration-2" })}>
          Backboard
        </p>
      )}
    </div>
  )
}
