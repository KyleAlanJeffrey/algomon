"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { UserProvider } from "./user-context"
import { UserPicker } from "./user-picker"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000 },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <UserPicker />
        {children}
      </UserProvider>
    </QueryClientProvider>
  )
}
