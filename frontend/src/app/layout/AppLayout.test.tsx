import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AppLayout } from './AppLayout'
import { AuthContext } from '@/features/auth/context/AuthContext'
import type { AuthContextValue } from '@/features/auth/context/AuthContext'
import { api } from '@/shared/services'

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
    api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn(), upload: vi.fn() },
    ApiError,
  }
})

const authValue: AuthContextValue = {
  user: { id: '1', name: 'Laura García', email: 'laura@tienda.com', role: 'admin' },
  business: { id: 'biz-1', name: 'Tienda de Laura' },
  isAuthenticated: true,
  loading: false,
  login: async () => {},
  logout: async () => {},
}

describe('AppLayout', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    vi.mocked(api.get).mockResolvedValue({
      user: {
        id: '1',
        name: 'Laura García',
        email: 'laura@tienda.com',
        role: 'ADMIN',
        avatarUrl: null,
        phone: null,
        notificationPrefs: null,
        createdAt: '2025-04-12T10:24:00.000Z',
      },
    })
  })

  // Given an AppLayout wrapping a protected page
  // When it is rendered
  // Then the sidebar, header and page content should all be present
  it('renders the sidebar, header and the routed page content', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={authValue}>
          <MemoryRouter initialEntries={['/inbox']}>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/inbox" element={<p>Inbox content</p>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>,
    )
    expect(screen.getByText('Sincra')).toBeInTheDocument()
    expect(screen.getByText('Inbox content')).toBeInTheDocument()
  })
})
