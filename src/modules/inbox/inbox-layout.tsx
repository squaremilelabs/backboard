"use client"

import React from "react"
import { InboxTitle } from "./inbox-info"
import { InboxViewTabs } from "./inbox-views"

export function InboxLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full flex-col">
      <div className="bg-canvas-0/30 sticky top-0 z-10 flex w-full flex-col backdrop-blur-2xl">
        <div className="flex w-full items-center gap-8 truncate p-16">
          <InboxTitle />
        </div>
        <InboxViewTabs />
      </div>
      <div className="relative flex w-full flex-col">{children}</div>
    </div>
  )
}
