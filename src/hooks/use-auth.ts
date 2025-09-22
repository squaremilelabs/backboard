/**
 * Hook: useAuth
 * Responsibility:
 *  - Bridge the external auth layer (Clerk) with the internal domain Account entity.
 *  - Returns both the raw Clerk user ("clerkUser") and the first matching Account record ("account").
 * Query Logic:
 *  - Looks up an Account by the Clerk primary email address.
 *  - If no Clerk user (not signed in yet or still loading), the query uses a sentinel email to safely return 0 results.
 * Invariants / Assumptions:
 *  - There is at most one Account per user email (first match is authoritative).
 *  - Email is the stable join key between Clerk and local Account.
 *  - The consuming code is resilient to `account` being `undefined` (loading / not yet provisioned).
 * Edge Cases:
 *  - User just signed up: Account row may not yet exist -> `account` undefined. Upstream UI should handle provisioning flow.
 *  - Email change in Clerk: Until Account row is updated to reflect new email, the lookup will fail (consider future enhancement to use Clerk ID).
 * Performance Notes:
 *  - Lightweight query; no memo needed since `useDBQuery` handles caching/reactivity.
 * Extension Guidance (for future LLMs):
 *  - If adding roles / permissions, extend the Account model and keep this hook a thin resolver, not an authorization oracle.
 *  - Prefer adding a server-side provisioning step instead of embedding provisioning logic here.
 *  - If migrating identifier from email to an immutable external ID, keep backward compatibility path (dual-lookup) temporarily.
 */
import { useUser } from "@clerk/nextjs"
import { useDBQuery } from "./use-db-query"
import { Account } from "@/database/models/account"

export function useAuth(): {
  account: Account | undefined
  clerkUser: ReturnType<typeof useUser>["user"]
} {
  const { user: clerkUser } = useUser()
  const userEmail = clerkUser?.primaryEmailAddress?.emailAddress
  const { accounts } = useDBQuery("accounts", {
    $: { where: { "user.email": userEmail ?? "none@none.com" } },
  })
  const account = accounts?.[0]
  return { account, clerkUser }
}
