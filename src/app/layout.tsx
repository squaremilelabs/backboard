import { fontsClassName } from "@/styles/fonts"
import { twm } from "@/lib/utils/tailwind"
import Providers from "@/app/providers"
import "@/styles/index.css"
import { InstantSignInWithClerk } from "@/modules/auth/instant-clerk"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={twm(fontsClassName)} suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <InstantSignInWithClerk />
        </Providers>
      </body>
    </html>
  )
}
