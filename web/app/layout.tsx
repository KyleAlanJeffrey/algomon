import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Providers } from "@/components/providers"

export const metadata: Metadata = {
  title: "Algomon — Your Algorithm, Exposed",
  description: "See exactly what YouTube is feeding you.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-[#0a0a0a] text-white antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
