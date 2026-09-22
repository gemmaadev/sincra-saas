import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, it, expect } from 'vitest'
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
  // Given a logged-in user
  // When they navigate to a protected route
  // Then the protected content should be shown
  it('renders the protected content when there is a user', () => {
    renderWithAuth({
      user: { id: '1', name: 'Laura', email: 'laura@tiendadelaura.com', role: 'admin' },
      isAuthenticated: true,
      loading: false,
      login: () => {},
      logout: () => {},
    })
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
  })

  // Given no logged-in user
  // When they navigate to a protected route
  // Then they should be redirected to the login page
  it('redirects to /login when there is no user', () => {
    renderWithAuth({
      user: null,
      isAuthenticated: false,
      loading: false,
      login: () => {},
      logout: () => {},
    })
    expect(screen.getByText('Página de login')).toBeInTheDocument()
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })

  // Given the auth state is still being determined
  // When the user navigates to a protected route
  // Then a loading indicator should be shown instead of content or a redirect
  it('shows a loading state while auth is being determined', () => {
    renderWithAuth({
      user: null,
      isAuthenticated: false,
      loading: true,
      login: () => {},
      logout: () => {},
    })
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })
})
