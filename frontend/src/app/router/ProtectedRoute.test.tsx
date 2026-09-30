import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, it, expect, vi } from 'vitest'
import { ProtectedRoute } from './ProtectedRoute'
import { AuthContext } from '@/features/auth/context/AuthContext'
import type { AuthContextValue } from '@/features/auth/context/AuthContext'

function renderWithAuth(authValue: AuthContextValue) {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<p>Contenido protegido</p>} />
          </Route>
          <Route path="/login" element={<p>Página de login</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('ProtectedRoute', () => {
  it('renders the protected content when there is a user', () => {
    renderWithAuth({
      user: { id: '1', name: 'Laura', email: 'laura@tiendadelaura.com', role: 'admin' },
      business: null,
      isAuthenticated: true,
      loading: false,
      login: vi.fn().mockResolvedValue(undefined),
      logout: vi.fn().mockResolvedValue(undefined),
    })
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
  })

  it('redirects to /login when there is no user', () => {
    renderWithAuth({
      user: null,
      business: null,
      isAuthenticated: false,
      loading: false,
      login: vi.fn().mockResolvedValue(undefined),
      logout: vi.fn().mockResolvedValue(undefined),
    })
    expect(screen.getByText('Página de login')).toBeInTheDocument()
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })

  it('shows a loading state while auth is being determined', () => {
    renderWithAuth({
      user: null,
      business: null,
      isAuthenticated: false,
      loading: true,
      login: vi.fn().mockResolvedValue(undefined),
      logout: vi.fn().mockResolvedValue(undefined),
    })
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })
})
