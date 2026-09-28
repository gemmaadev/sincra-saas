import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect } from 'vitest'
import { ProfilePage } from './ProfilePage'
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

function renderProfilePage(value: AuthContextValue = authValue) {
  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('ProfilePage', () => {
  // Given an authenticated user
  // When the profile page is rendered
  // Then the header and the personal info tab should be shown by default
  it('renders the profile header and the personal info tab by default', () => {
    renderProfilePage()

    expect(screen.getByRole('heading', { name: 'Laura García' })).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: 'Información personal', selected: true }),
    ).toBeInTheDocument()
    expect(screen.getByText('Datos personales')).toBeInTheDocument()
  })

  // Given the profile page
  // When the user clicks the "Notificaciones" tab
  // Then the notifications content should replace the personal info content
  it('switches to the notifications tab', () => {
    renderProfilePage()

    fireEvent.click(screen.getByRole('tab', { name: 'Notificaciones' }))

    expect(screen.getByText('Preferencias de notificación')).toBeInTheDocument()
    expect(screen.queryByText('Datos personales')).not.toBeInTheDocument()
  })

  // Given the profile page
  // When the user clicks the "Seguridad" tab
  // Then the security content should be shown
  it('switches to the security tab', () => {
    renderProfilePage()

    fireEvent.click(screen.getByRole('tab', { name: 'Seguridad' }))

    expect(screen.getByText('Cambiar contraseña')).toBeInTheDocument()
  })

  // Given no authenticated user
  // When the profile page is rendered
  // Then nothing should be rendered
  it('renders nothing when there is no authenticated user', () => {
    const { container } = renderProfilePage({ ...authValue, user: null })
    expect(container).toBeEmptyDOMElement()
  })
})
