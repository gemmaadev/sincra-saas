import { useCallback, useEffect, useState } from 'react'
import { api, ApiError } from '@/shared/services'
import type { SuccessResponse } from '@/shared/types'
import type { AuthContextValue, User, Business } from '../context/AuthContext'

interface MeResponse {
  user: { id: string; name: string; email: string }
  business: { id: string; name: string }
  role: 'ADMIN' | 'EMPLOYEE'
}

function normalizeRole(role: 'ADMIN' | 'EMPLOYEE'): 'admin' | 'employee' {
  return role === 'ADMIN' ? 'admin' : 'employee'
}

async function fetchSession(): Promise<{ user: User; business: Business } | null> {
  try {
    const data = await api.get<MeResponse>('/auth/me')
    return {
      user: { ...data.user, role: normalizeRole(data.role) },
      business: data.business,
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null
    }
    throw error
  }
}

function logoutRequest(): Promise<SuccessResponse> {
  return api.post<SuccessResponse>('/auth/logout')
}

export function useAuthState(): AuthContextValue {
  const [user, setUser] = useState<User | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    fetchSession()
      .then((session) => {
        if (ignore) return
        setUser(session?.user ?? null)
        setBusiness(session?.business ?? null)
      })
      .catch((error) => {
        if (ignore) return
        console.error('No se pudo verificar la sesión', error)
        setUser(null)
        setBusiness(null)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  const login = useCallback(async () => {
    setLoading(true)
    try {
      const session = await fetchSession()
      setUser(session?.user ?? null)
      setBusiness(session?.business ?? null)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await logoutRequest()
    setUser(null)
    setBusiness(null)
  }, [])

  return { user, business, isAuthenticated: user !== null, loading, login, logout }
}
