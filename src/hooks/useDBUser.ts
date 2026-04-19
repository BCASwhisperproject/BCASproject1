'use client'
import { useUser as useClerkUser } from '@clerk/nextjs'
import { useEffect, useState, useCallback } from 'react'

export type DBUser = {
  id: string
  email: string
  username: string
  avatarColor: string
  isAdmin: boolean
  isApproved: boolean
  streak: number
}

export function useDBUser() {
  const { user: clerkUser, isLoaded } = useClerkUser()
  const [dbUser, setDbUser] = useState<DBUser | null>(null)
  const [loading, setLoading] = useState(true)

  const sync = useCallback(async () => {
    if (!clerkUser) { setLoading(false); return }
    try {
      const res = await fetch('/api/user/sync', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setDbUser(data.user)
      }
    } catch {}
    setLoading(false)
  }, [clerkUser])

  useEffect(() => {
    if (isLoaded) sync()
  }, [isLoaded, sync])

  return { dbUser, loading, refetch: sync }
}
