"use client"
import { ClerkProvider, SignedIn, useAuth } from "@clerk/nextjs"
import { useTheme } from "next-themes"
import { useEffect } from "react"
import { dark } from "@clerk/themes"
import { db } from "@/database/db-client"
import { parseAccountCreateInput } from "@/database/models/account"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()
  return (
    <ClerkProvider appearance={{ baseTheme: resolvedTheme === "dark" ? dark : undefined }}>
      {children}
      <SignedIn>
        <InstantAccountListener />
      </SignedIn>
    </ClerkProvider>
  )
}

function InstantAccountListener() {
  const { getToken } = useAuth()

  const signInToInstantWithClerkToken = async () => {
    const idToken = await getToken()
    if (!idToken) return

    const { user } = await db.auth.signInWithIdToken({
      clientName: "clerk",
      idToken: idToken,
    })

    // create an account if user does not already have one
    const accountQuery = await db.queryOnce({ accounts: { $: { where: { "user.id": user.id } } } })
    if (accountQuery.data?.accounts.length) return
    const { id, data, link } = parseAccountCreateInput({ user_id: user.id })
    db.transact(db.tx.accounts[id].link(link).create(data))
  }

  useEffect(() => {
    signInToInstantWithClerkToken()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
