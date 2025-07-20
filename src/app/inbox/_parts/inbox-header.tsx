"use client"

import { useParams } from "next/navigation"
import { useInboxById } from "./data-inbox"

export function InboxHeader() {
  const { id: inboxId } = useParams<{ id: string }>()
  const { inbox } = useInboxById(inboxId)
  return (
    <div className="flex w-full truncate">
      <h1 className="truncate text-lg font-semibold text-neutral-700">{inbox?.title}</h1>
    </div>
  )
}
