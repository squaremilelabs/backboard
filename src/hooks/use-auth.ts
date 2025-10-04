"use client"

import { useUser } from "@clerk/nextjs"
import { Account } from "@/database/models/account"
import { useDBQuery } from "./use-db-query"

export function useAuth(): {
  account: Account | null
  authUser: ReturnType<typeof useUser>["user"]
} {
  const { user: authUser, isLoaded } = useUser()
  const userEmail = authUser?.primaryEmailAddress?.emailAddress
  const { accounts } = useDBQuery(
    "accounts",
    isLoaded
      ? {
          $: { where: { "user.email": userEmail ?? "no-user@no-domain.com" } },
        }
      : null
  )
  const account = accounts?.[0] ?? null
  return { account, authUser }
}
