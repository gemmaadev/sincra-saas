import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NotificationsTab } from './NotificationsTab'
import { api } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'

vi.mock('@/shared/services', () => {
  class ApiError extends Error {
    status: number
    code: string
    constructor(message: string, status: number, code: string) {
      super(message)
      this.status = status
      this.code = code
    }
  }
  return {
    api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
    ApiError,
  }
})

vi.mock('@/shared/utils/notify', () => ({ notifySuccess: vi.fn() }))

const mockProfile = {
  id: '1',
  name: 'Laura García',
  email: 'laura@tienda.com',
  role: 'ADMIN' as const,
  avatarUrl: null,
  phone: '+34 600 123 456',
  notificationPrefs: {
    newOrders: true,
    unansweredCommunications: true,
    followUpTasks: true,
    weeklyDigest: false,
  },
  createdAt: '2025-04-12T10:24:00.000Z',
}

function renderNotificationsTab() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <NotificationsTab />
    </QueryClientProvider>,
  )
}

describe('NotificationsTab', () => {
  beforeEach(() => {
    vi.mocked(notifySuccess).mockReset()
    vi.mocked(api.get).mockReset()
    vi.mocked(api.patch).mockReset()
    vi.mocked(api.get).mockResolvedValue({ user: mockProfile })
    vi.mocked(api.patch).mockImplementation(async (_path, body) => ({
      user: { ...mockProfile, ...(body as object) },
    }))
  })

  // Given the preferences have loaded
  // When the tab is rendered
  // Then each toggle should reflect the saved preference
  it('renders the notification preferences with their initial state', async () => {
    renderNotificationsTab()

    await waitFor(() => {
      expect(screen.getByRole('switch', { name: 'Mensajes sin responder' })).toHaveAttribute(
        'aria-checked',
        'true',
      )
    })
    expect(screen.getByRole('switch', { name: 'Resumen semanal' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  // Given a preference toggle
  // When the user clicks it
  // Then it should flip its checked state
  it('toggles a preference when clicked', async () => {
    renderNotificationsTab()
    await waitFor(() => screen.getByRole('switch', { name: 'Resumen semanal' }))
    const toggle = screen.getByRole('switch', { name: 'Resumen semanal' })

    fireEvent.click(toggle)

    expect(toggle).toHaveAttribute('aria-checked', 'true')
  })

  // Given a changed preference
  // When the user clicks "Guardar cambios"
  // Then it should PATCH /user/profile with the updated preferences and show a confirmation
  it('saves the preferences and notifies it', async () => {
    renderNotificationsTab()
    await waitFor(() => screen.getByRole('switch', { name: 'Resumen semanal' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Resumen semanal' }))

    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => {
      expect(notifySuccess).toHaveBeenCalledWith('Cambios guardados')
    })
    expect(api.patch).toHaveBeenCalledWith('/user/profile', {
      notificationPrefs: {
        newOrders: true,
        unansweredCommunications: true,
        followUpTasks: true,
        weeklyDigest: true,
      },
    })
  })


  // Given the preferences request fails
  // When the tab is rendered
  // Then an error message should be shown instead of the toggles
  it('shows an error message when the preferences fail to load', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('network error'))
    renderNotificationsTab()

    await waitFor(() => {
      expect(
        screen.getByText('No se pudieron cargar tus preferencias. Inténtalo de nuevo más tarde.'),
      ).toBeInTheDocument()
    })
  })
})
