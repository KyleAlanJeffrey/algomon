import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Nav } from "@/components/nav"
import { KyleBadge } from "@kylealanjeffrey/badge"

export const metadata: Metadata = {
  title: {
    default: "Algomon — YouTube Algorithm Monitor",
    template: "%s | Algomon",
  },
  description:
    "YouTube algorithm tracker. Monitor, analyze, and visualize your YouTube recommendations over time. See what the algorithm is feeding you.",
  metadataBase: new URL("https://algomon.app"),
  applicationName: "Algomon",
  authors: [{ name: "Kyle Jeffrey", url: "https://kylejeffrey.com" }],
  creator: "Kyle Jeffrey",
  keywords: [
    "YouTube algorithm tracker",
    "YouTube algorithm monitor",
    "YouTube recommendation tracker",
    "YouTube recommendations analyzer",
    "track YouTube algorithm",
    "YouTube filter bubble",
    "YouTube watch history analytics",
    "what YouTube recommends me",
    "YouTube algorithm transparency",
    "YouTube recommendation patterns",
  ],
  openGraph: {
    type: "website",
    siteName: "Algomon",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-[#0a0a0a] text-white antialiased font-sans">
        <Providers>
          <Nav />
          {children}
          <KyleBadge />
        </Providers>
      </body>
    </html>
  )
}
