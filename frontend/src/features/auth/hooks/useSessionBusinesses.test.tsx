import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { AuthContext } from '../context/AuthContext'
import type { AuthContextValue } from '../context/AuthContext'
import { useSessionBusinesses } from './useSessionBusinesses'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn() },
}))

function renderSessionBusinesses(isAuthenticated: boolean) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const authValue: AuthContextValue = {
    user: isAuthenticated
      ? { id: '1', name: 'Laura', email: 'laura@tienda.com', role: 'admin' }
      : null,
    business: isAuthenticated ? { id: 'biz-1', name: 'Tienda de Laura' } : null,
    isAuthenticated,
    loading: false,
    login: async () => {},
    logout: async () => {},
  }

  return renderHook(() => useSessionBusinesses(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
      </QueryClientProvider>
    ),
  })
}

describe('useSessionBusinesses', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
  })

  // Given an authenticated session
  // When the hook loads
  // Then it should read the businesses of the full session
  it('loads the businesses of the current session', async () => {
    vi.mocked(api.get).mockResolvedValue({
      businesses: [
        { businessId: 'biz-1', name: 'Tienda A', role: 'ADMIN' },
        { businessId: 'biz-2', name: 'Tienda B', role: 'EMPLOYEE' },
      ],
    })

    const { result } = renderSessionBusinesses(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(api.get).toHaveBeenCalledWith('/auth/me/businesses')
    expect(result.current.data).toEqual([
      { businessId: 'biz-1', name: 'Tienda A', role: 'ADMIN' },
      { businessId: 'biz-2', name: 'Tienda B', role: 'EMPLOYEE' },
    ])
  })

  // Given no session
  // When the hook mounts
  // Then it should not call the authenticated endpoint
  it('does not fetch when there is no session', async () => {
    const { result } = renderSessionBusinesses(false)

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'))
    expect(api.get).not.toHaveBeenCalled()
  })
})
