import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SecurityTab } from './SecurityTab'
import { AuthContext } from '@/features/auth/context/AuthContext'
import type { AuthContextValue } from '@/features/auth/context/AuthContext'

const mockNavigate = vi.fn()

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderSecurityTab(logout: AuthContextValue['logout'] = vi.fn().mockResolvedValue(undefined)) {
  const authValue: AuthContextValue = {
    user: { id: '1', name: 'Laura García', email: 'laura@tienda.com', role: 'admin' },
    business: { id: 'biz-1', name: 'Tienda de Laura' },
    isAuthenticated: true,
    loading: false,
    login: async () => {},
    logout,
  }

  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter>
        <SecurityTab />
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('SecurityTab', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
  })

  // Given the password change form
  // When it is submitted empty
  // Then it should show validation errors for the required fields
  it('shows validation errors when the password form is submitted empty', async () => {
    renderSecurityTab()

    fireEvent.click(screen.getByRole('button', { name: 'Guardar contraseña' }))

    await waitFor(() => {
      expect(screen.getByText('Introduce tu contraseña actual')).toBeInTheDocument()
      expect(screen.getByText('La nueva contraseña es obligatoria')).toBeInTheDocument()
    })
  })

  // Given a new password and a confirmation that doesn't match
  // When the form is submitted
  // Then a mismatch error should be shown
  it('shows an error when the password confirmation does not match', async () => {
    renderSecurityTab()

    fireEvent.change(screen.getByLabelText('Contraseña actual'), {
      target: { value: 'actual123' },
    })
    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: 'nueva12345' },
    })
    fireEvent.change(screen.getByLabelText('Confirmar nueva contraseña'), {
      target: { value: 'otra12345' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar contraseña' }))

    await waitFor(() => {
      expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument()
    })
  })

  // Given the active sessions list
  // When it is rendered
  // Then the current session should be flagged and the others should offer to close it
  it('renders the active sessions and flags the current one', () => {
    renderSecurityTab()

    expect(screen.getByText('Este dispositivo')).toBeInTheDocument()
    expect(screen.getByText('iPhone 15')).toBeInTheDocument()
    // 2 non-current sessions to revoke + the final "close this device" button
    expect(screen.getAllByRole('button', { name: 'Cerrar sesión' })).toHaveLength(3)
  })

  // Given a non-current session
  // When the user closes it
  // Then it should disappear from the list
  it('removes a session from the list after closing it', async () => {
    renderSecurityTab()
    const [firstRevokeButton] = screen.getAllByRole('button', { name: 'Cerrar sesión' })

    fireEvent.click(firstRevokeButton)

    await waitFor(() => {
      expect(screen.queryByText('iPhone 15')).not.toBeInTheDocument()
    })
  })

  // Given the security tab
  // When the user clicks the final "Cerrar sesión" button (this device)
  // Then it should log out and navigate to /login
  it('logs out and navigates to /login when closing the current session', async () => {
    const logout = vi.fn().mockResolvedValue(undefined)
    renderSecurityTab(logout)
    const buttons = screen.getAllByRole('button', { name: 'Cerrar sesión' })

    fireEvent.click(buttons[buttons.length - 1])

    await waitFor(() => {
      expect(logout).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })
})
