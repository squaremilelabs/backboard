"use server"

import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/database/db-admin"
import { Account } from "@/database/models/account"

type AccentColorKey = NonNullable<NonNullable<Account["app_config"]>["accent_color"]>

export async function getAccountAccentColor(): Promise<AccentColorKey> {
  try {
    const user = await currentUser()
    const userEmail = user?.primaryEmailAddress?.emailAddress
    const query = await db.query({
      accounts: { $: { where: { "user.email": userEmail ?? "none@none.com" } } },
    })
    const account = query?.accounts?.[0]
    return account?.app_config?.accent_color ?? "sml-gold"
  } catch (_) {
    return "sml-gold"
  }
}
