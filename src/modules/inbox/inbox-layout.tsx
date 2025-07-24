import React from "react"
import { InboxHeader } from "./inbox-header"
import { InboxViewNav } from "./inbox-view-nav"

export function InboxLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full flex-col">
      <div className="sticky top-0 z-10 flex w-full flex-col bg-canvas-0/30 backdrop-blur-2xl">
        <InboxHeader />
        <InboxViewNav />
      </div>
      <div className="relative flex w-full flex-col">{children}</div>
    </div>
  )
}
