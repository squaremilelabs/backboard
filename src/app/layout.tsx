import { Metadata, Viewport } from "next"
import { SignedIn, SignedOut } from "@clerk/nextjs"
import { fontsClassName } from "@/styles/fonts"
import Providers from "@/modules/root/providers"
import { AppLayout } from "@/modules/root/app-layout"
import "@/styles/index.css"

export const metadata: Metadata = {
  title: {
    template: "%s | Backboard",
    default: "Backboard",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/android-icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-icon-57x57.png", sizes: "57x57" },
      { url: "/icons/apple-icon-60x60.png", sizes: "60x60" },
      { url: "/icons/apple-icon-72x72.png", sizes: "72x72" },
      { url: "/icons/apple-icon-76x76.png", sizes: "76x76" },
      { url: "/icons/apple-icon-114x114.png", sizes: "114x114" },
      { url: "/icons/apple-icon-120x120.png", sizes: "120x120" },
      { url: "/icons/apple-icon-144x144.png", sizes: "144x144" },
      { url: "/icons/apple-icon-152x152.png", sizes: "152x152" },
      { url: "/icons/apple-icon-180x180.png", sizes: "180x180" },
    ],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontsClassName} suppressHydrationWarning>
      <body>
        <Providers>
          <SignedIn>
            <AppLayout>{children}</AppLayout>
          </SignedIn>
          <SignedOut>{children}</SignedOut>
        </Providers>
      </body>
    </html>
  )
}
