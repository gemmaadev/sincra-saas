import type { ReactNode } from 'react'
import { AuthContext } from './AuthContext'
import { useAuthState } from '../hooks/useAuthState'

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useAuthState()
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
