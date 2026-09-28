import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AppHeader } from './AppHeader'
import { MemoryRouter } from 'react-router'
import { AuthContext } from '@/features/auth/context/AuthContext'
import type { AuthContextValue } from '@/features/auth/context/AuthContext'

const authValue: AuthContextValue = {
  user: { id: '1', name: 'Laura García', email: 'laura@tienda.com', role: 'admin' },
  business: { id: 'biz-1', name: 'Tienda de Laura' },
  isAuthenticated: true,
  loading: false,
  login: async () => {},
  logout: async () => {},
}

describe('HeaderApp', () => {
  // Given the HeaderApp component
  // When it is rendered
  // Then the search input and the user's avatar should be visible
  it('renders the search input and the user avatar', () => {
    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter>
          <AppHeader />
        </MemoryRouter>
      </AuthContext.Provider>,
    )
    expect(
      screen.getByPlaceholderText('Buscar conversaciones, clientes, pedidos...'),
    ).toBeInTheDocument()
    expect(screen.getByText('LG')).toBeInTheDocument()
  })
})
