"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface UserContextValue {
  username: string | null
  setUsername: (u: string) => void
  clearUsername: () => void
}

const UserContext = createContext<UserContextValue>({ username: null, setUsername: () => {}, clearUsername: () => {} })

export function UserProvider({ children }: { children: ReactNode }) {
  const [username, setUsernameState] = useState<string | null>(null)

  useEffect(() => {
    setUsernameState(localStorage.getItem("algomon_username"))
  }, [])

  function setUsername(u: string) {
    localStorage.setItem("algomon_username", u)
    setUsernameState(u)
  }

  function clearUsername() {
    localStorage.removeItem("algomon_username")
    setUsernameState(null)
  }

  return (
    <UserContext.Provider value={{ username, setUsername, clearUsername }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
