"use client"

import { ClerkProvider, SignedIn, useAuth } from "@clerk/nextjs"
import { useTheme } from "next-themes"
import { useEffect } from "react"
import { dark } from "@clerk/themes"
import { db } from "@/database/db-client"
import { initializeAccount } from "@/database/_models/account"

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

    db.auth
      .signInWithIdToken({
        clientName: "clerk",
        idToken: idToken,
      })
      .then(({ user }) => {
        initializeAccount(user.id)
      })
  }

  useEffect(() => {
    signInToInstantWithClerkToken()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
