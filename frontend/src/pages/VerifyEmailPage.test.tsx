import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import VerifyEmailPage from './VerifyEmailPage'

const mockNavigate = vi.fn()

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  // Given no email was passed in the navigation state
  // When the page renders
  // Then it shows the generic message
  it('shows a generic message when no email is provided', () => {
    render(
      <MemoryRouter>
        <VerifyEmailPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByText(
        'Te hemos enviado un enlace para restablecer tu contraseña a tu correo electrónico.',
      ),
    ).toBeInTheDocument()
  })

  // Given an email was passed in the navigation state
  // When the page renders
  // Then it shows that email in the message
  it('shows the email when it is provided in the navigation state', () => {
    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/verify-email', state: { email: 'laura@tienda.com' } }]}
      >
        <VerifyEmailPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('laura@tienda.com')).toBeInTheDocument()
  })

  // Given the user is on the verify email page
  // When they click "Volver a iniciar sesión"
  // Then they are navigated to /login
  it('navigates to /login when clicking the button', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <VerifyEmailPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Volver a iniciar sesión' }))

    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })
})
