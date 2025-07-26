"use client"

import { ClerkProvider } from "@clerk/nextjs"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { RouterProvider } from "react-aria-components"
import { useRouter } from "next/navigation"
import { ThemeProvider as NextThemeProvider } from "next-themes"
import { Suspense } from "react"
import { Analytics } from "@vercel/analytics/next"
import { InstantAccountListner } from "../account/instant-account"

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient()
  const router = useRouter()
  return (
    <>
      <Suspense>
        <ClerkProvider>
          <QueryClientProvider client={queryClient}>
            <NextThemeProvider attribute="class">
              <RouterProvider navigate={router.push}>{children}</RouterProvider>
            </NextThemeProvider>
          </QueryClientProvider>
          <InstantAccountListner />
        </ClerkProvider>
      </Suspense>
      <Analytics />
    </>
  )
}
