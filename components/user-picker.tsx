"use client"

import { useEffect, useState } from "react"
import { useUser } from "./user-context"

interface User { username: string; name: string }

export function UserPicker() {
  const { username, setUsername } = useUser()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/users")
      .then(r => r.json())
      .then((data: unknown) => setUsers(data as User[]))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [])

  if (username !== null) return null

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0a]/90 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-[#111] border border-white/10 rounded-2xl p-8 max-w-sm w-full">
        <h2 className="text-xl font-black mb-1">Who are you?</h2>
        <p className="text-white/40 text-sm mb-6">Pick your profile to view your algorithm data.</p>
        {loading ? (
          <p className="text-white/30 text-sm text-center py-4 animate-pulse">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-4">No users found yet. Start the extension to create your profile.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {users.map(u => (
              <button
                key={u.username}
                onClick={() => setUsername(u.username)}
                className="w-full text-left px-5 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
              >
                <p className="font-bold text-white">{u.name}</p>
                <p className="text-xs text-white/40 mt-0.5">@{u.username}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
