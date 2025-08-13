import { useUser } from "@clerk/nextjs"
import { useDBQuery } from "@/database/db-client"
import { Account } from "@/database/models/account"

export function useAuth(): {
  instantAccount: Account | undefined
  clerkUser: ReturnType<typeof useUser>["user"]
} {
  const { user: clerkUser } = useUser()
  const userEmail = clerkUser?.primaryEmailAddress?.emailAddress
  const { accounts } = useDBQuery("accounts", {
    $: { where: { "user.email": userEmail ?? "none@none.com" } },
  })
  const instantAccount = accounts?.[0]
  return { instantAccount, clerkUser }
}
