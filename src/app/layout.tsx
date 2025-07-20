import { fontsClassName } from "@/styles/fonts"
import Providers from "@/app/providers"
import "@/styles/index.css"
import { InstantSignInWithClerk } from "@/lib/auth/instant-clerk"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontsClassName} suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <InstantSignInWithClerk />
        </Providers>
      </body>
    </html>
  )
}
