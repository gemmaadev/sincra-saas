import { createContext } from 'react'

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'employee'
}

export interface Business {
  id: string
  name: string
}

export interface AuthContextValue {
  user: User | null
  business: Business | null
  isAuthenticated: boolean
  loading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
