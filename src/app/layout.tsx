import { fontsClassName } from "@/styles/fonts"
import Providers from "@/modules/root/providers"
import "@/styles/index.css"
import { InstantSignInWithClerk } from "@/modules/auth/instant-auth"
import { AppLayout } from "@/modules/root/layout"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontsClassName} suppressHydrationWarning>
      <body>
        <Providers>
          <AppLayout>{children}</AppLayout>
          <InstantSignInWithClerk />
        </Providers>
      </body>
    </html>
  )
}
