"use client"

import { SignedIn, useAuth, useUser } from "@clerk/nextjs"
import { useEffect } from "react"
import { db } from "@/database/db"

function InstantSignInWithClerkInternal() {
  const { getToken } = useAuth()

  const signInToInstantWithClerkToken = async () => {
    // getToken gets the jwt from Clerk for your signed in user.
    const idToken = await getToken()

    if (!idToken) {
      // No jwt, can't sign in to instant
      return
    }

    // Create a long-lived sessin with Instant for your clerk user
    // It will look up the user by email or create a new user with
    // the email address in the session token.
    db.auth.signInWithIdToken({
      clientName: "clerk",
      idToken: idToken,
    })
  }

  useEffect(() => {
    signInToInstantWithClerkToken()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export function InstantSignInWithClerk() {
  return (
    <SignedIn>
      <InstantSignInWithClerkInternal />
    </SignedIn>
  )
}

export function useInstantUserId() {
  const { user } = useUser()
  const userEmail = user?.primaryEmailAddress?.emailAddress
  const idbResult = db.useQuery({
    $users: { $: { where: { email: userEmail ?? "NO_USER" } } },
  })
  return idbResult.data?.$users?.[0]?.id ?? null
}
