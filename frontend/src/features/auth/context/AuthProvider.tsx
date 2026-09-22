import { useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext, type User } from './AuthContext'

const MOCK_USER: User = {
  id: '1',
  name: 'Laura García',
  email: 'laura@tiendadelaura.com',
  role: 'admin',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(MOCK_USER)

  const login = () => setUser(MOCK_USER)
  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading: false, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
