import { createContext } from 'react'

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'employee'
}

export interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: () => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
