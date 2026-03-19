"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "./user-context"

const links = [
  { href: "/wrapped", label: "Month" },
  { href: "/daily", label: "Today" },
  { href: "/all", label: "All Time" },
  { href: "/explore", label: "Explore" },
]

export function Nav() {
  const pathname = usePathname()
  const isHome = pathname === "/"
  const { username, clearUsername } = useUser()

  const pillsRow = (
    <div className="flex gap-1 bg-black/30 backdrop-blur-md rounded-full px-2 py-1.5 border border-white/10">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all ${
            pathname === href
              ? "bg-white text-black"
              : "text-white/50 hover:text-white"
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  )

  const userChip = username && (
    <button
      onClick={clearUsername}
      title="Switch user"
      className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10 text-xs font-bold text-white/50 hover:text-white transition-colors"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954]" />
      <span className="max-w-[80px] truncate">@{username}</span>
    </button>
  )

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {/* Mobile layout */}
      <div className="sm:hidden flex flex-col gap-2 px-4 pt-3 pb-2">
        <div className="flex items-center justify-between pointer-events-auto">
          <Link
            href="/"
            className={`font-black text-sm tracking-widest transition-opacity ${
              isHome ? "invisible pointer-events-none" : "opacity-60 hover:opacity-100"
            }`}
          >
            ALGOMON
          </Link>
          <div className="pointer-events-auto">{userChip}</div>
        </div>
        <div className="flex justify-center pointer-events-auto">{pillsRow}</div>
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className={`pointer-events-auto font-black text-sm tracking-widest transition-opacity ${
            isHome ? "opacity-0 pointer-events-none" : "opacity-60 hover:opacity-100"
          }`}
        >
          ALGOMON
        </Link>
        <div className="pointer-events-auto flex items-center gap-2">
          {pillsRow}
          {userChip}
        </div>
      </div>
    </nav>
  )
}
