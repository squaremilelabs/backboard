import { fontsClassName } from "@/styles/fonts"
import { twm } from "@/lib/utils/tailwind"
import Providers from "@/app/providers"
import "@/styles/index.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={twm(fontsClassName)} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
