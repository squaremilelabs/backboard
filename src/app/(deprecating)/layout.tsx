import { SignedIn, SignedOut } from "@clerk/nextjs"
import { ReactNode } from "react"
import { AppLayout } from "@/_deprecating/modules/root/app-layout"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <SignedIn>
        <AppLayout>{children}</AppLayout>
      </SignedIn>
      <SignedOut>{children}</SignedOut>
    </>
  )
}
