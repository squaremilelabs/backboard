"use client"

import { useParams } from "next/navigation"
import { useFindUniqueScope } from "@/database/generated/hooks"

export function ScopeHeader() {
  const params = useParams<{ id: string }>()
  const { data: scope } = useFindUniqueScope({
    where: { id: params.id },
  })

  return (
    <div className="flex w-full truncate">
      <h1 className="truncate text-lg font-semibold text-neutral-700">{scope?.title}</h1>
    </div>
  )
}
