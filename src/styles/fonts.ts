import { Inter as FontSans, Inconsolata as FontMono, Faustina as FontSerif } from "next/font/google"

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const fontSerif = FontSerif({
  subsets: ["latin"],
  variable: "--font-serif",
})

export const fontsClassName = `${fontSans.variable} ${fontMono.variable} ${fontSerif.variable}`
