"use client"

import { useFindUniqueScope } from "@/database/generated/hooks"

export function ScopeHeader({ scopeId }: { scopeId: string }) {
  const { data: scope } = useFindUniqueScope({
    where: { id: scopeId },
  })

  return (
    <div className="flex w-full truncate">
      <h1 className="truncate text-lg font-semibold text-neutral-700">{scope?.title}</h1>
    </div>
  )
}
