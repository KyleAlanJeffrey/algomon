"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/wrapped", label: "Month" },
  { href: "/daily", label: "Today" },
  { href: "/all", label: "All Time" },
]

export function Nav() {
  const pathname = usePathname()
  const isHome = pathname === "/"

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 pointer-events-none">
      {/* Home button */}
      <Link
        href="/"
        className={`pointer-events-auto font-black text-sm tracking-widest transition-opacity ${
          isHome ? "opacity-0 pointer-events-none" : "opacity-60 hover:opacity-100"
        }`}
      >
        ALGOMON
      </Link>

      {/* Page links */}
      <div className="pointer-events-auto flex gap-1 bg-black/30 backdrop-blur-md rounded-full px-2 py-1.5 border border-white/10">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all ${
              pathname === href
                ? "bg-white text-black"
                : "text-white/50 hover:text-white"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
