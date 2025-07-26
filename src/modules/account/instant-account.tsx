"use client"

/* eslint-disable no-console */

import { SignedIn, useAuth, useUser } from "@clerk/nextjs"
import { useEffect } from "react"
import { db } from "@/database/db"
import { Account, initializeAccount } from "@/database/models/account"

function InstantAccountListenerInternal() {
  const { getToken } = useAuth()

  const signInToInstantWithClerkToken = async () => {
    // getToken gets the jwt from Clerk for your signed in user.
    const idToken = await getToken()

    if (!idToken) {
      // No jwt, can't sign in to instant
      return
    }

    // Create a long-lived session with Instant for your clerk user
    // It will look up the user by email or create a new user with
    // the email address in the session token.
    db.auth
      .signInWithIdToken({
        clientName: "clerk",
        idToken: idToken,
      })
      .then(({ user }) => {
        // TODO: Handle case where this runs twice and errors the second time upon first initialization
        initializeAccount(user.id)
          .then(() => {
            console.log("Initialized account")
          })
          .catch((error) => {
            console.error("Error initializing account:", error)
          })
      })
  }

  useEffect(() => {
    signInToInstantWithClerkToken()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export function InstantAccountListner() {
  return (
    <SignedIn>
      <InstantAccountListenerInternal />
    </SignedIn>
  )
}

export function useInstantAccount(): Account | null {
  const { user } = useUser() // clerk user
  const userEmail = user?.primaryEmailAddress?.emailAddress
  const result = db.useQuery({
    $users: { $: { where: { email: userEmail ?? "NO_USER" } }, account: {} },
  })
  const account = result.data?.$users[0]?.account ?? null
  return account as Account | null
}
