"use client"

import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { RouterProvider } from "react-aria-components"
import { useRouter } from "next/navigation"
import { ThemeProvider as NextThemeProvider } from "next-themes"
import { Suspense } from "react"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "../auth/auth-provider"

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient()
  const router = useRouter()
  return (
    <>
      <Suspense>
        <NextThemeProvider attribute="class" enableSystem>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <RouterProvider navigate={router.push}>{children}</RouterProvider>
            </QueryClientProvider>
          </AuthProvider>
        </NextThemeProvider>
      </Suspense>
      <Analytics />
    </>
  )
}
