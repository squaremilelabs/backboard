import { useUser } from "@clerk/nextjs"
import { Account, useAccountQuery } from "@/database/models/account"

export function useAuth(): {
  instantAccount: Account | undefined
  clerkUser: ReturnType<typeof useUser>["user"]
} {
  const { user: clerkUser } = useUser()
  const userEmail = clerkUser?.primaryEmailAddress?.emailAddress
  const accountQuery = useAccountQuery({
    $: { where: { "user.email": userEmail ?? "NO_USER" } },
  })
  const instantAccount = accountQuery.data?.[0]
  return { instantAccount, clerkUser }
}
