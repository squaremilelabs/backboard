"use client"

import { ClerkProvider as InnerClerkProvider } from "@clerk/nextjs"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { RouterProvider } from "react-aria-components"
import { useRouter } from "next/navigation"
import { ThemeProvider as NextThemeProvider, useTheme } from "next-themes"
import { Suspense } from "react"
import { Analytics } from "@vercel/analytics/next"
import { dark } from "@clerk/themes"
import { InstantAccountListner } from "../account/instant-account"

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient()
  const router = useRouter()
  return (
    <>
      <Suspense>
        <NextThemeProvider attribute="class" enableSystem>
          <ClerkProvider>
            <QueryClientProvider client={queryClient}>
              <RouterProvider navigate={router.push}>{children}</RouterProvider>
            </QueryClientProvider>
            <InstantAccountListner />
          </ClerkProvider>
        </NextThemeProvider>
      </Suspense>
      <Analytics />
    </>
  )
}

function ClerkProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()
  return (
    <InnerClerkProvider appearance={{ baseTheme: resolvedTheme === "dark" ? dark : undefined }}>
      {children}
    </InnerClerkProvider>
  )
}
