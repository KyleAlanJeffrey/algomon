import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Nav } from "@/components/nav"

export const metadata: Metadata = {
  title: {
    default: "Algomon — YouTube Algorithm Monitor",
    template: "%s | Algomon",
  },
  description:
    "Track, analyze, and visualize your YouTube recommendations over time. See what the algorithm is feeding you.",
  metadataBase: new URL("https://algomon.kylejeffrey.com"),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-[#0a0a0a] text-white antialiased font-sans">
        <Providers>
          <Nav />
          {children}
        </Providers>
      </body>
    </html>
  )
}
