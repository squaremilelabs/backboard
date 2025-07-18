"use client"

import { ClerkProvider } from "@clerk/nextjs"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { RouterProvider } from "react-aria-components"
import { useRouter } from "next/navigation"
import { ThemeProvider as NextThemeProvider } from "next-themes"
import { Provider as ZenstackHooksProvider } from "@/database/generated/hooks"

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient()
  const router = useRouter()
  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        <ZenstackHooksProvider value={{ endpoint: "/api/db" }}>
          <NextThemeProvider attribute="class">
            <RouterProvider navigate={router.push}>{children}</RouterProvider>
          </NextThemeProvider>
        </ZenstackHooksProvider>
      </QueryClientProvider>
    </ClerkProvider>
  )
}
