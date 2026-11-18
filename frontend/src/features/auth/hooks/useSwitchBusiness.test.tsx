import { useEffect } from 'react'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, useLocation } from 'react-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '@/shared/services'
import { AuthContext } from '../context/AuthContext'
import type { AuthContextValue } from '../context/AuthContext'
import { useSwitchBusiness } from './useSwitchBusiness'

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
    api: { get: vi.fn(), post: vi.fn() },
    ApiError,
  }
})

function renderUseSwitchBusiness(pathname = '/orders/order-9') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  queryClient.setQueryData(['clients'], [{ id: 'from-old-business' }])
  const cancelQueries = vi.spyOn(queryClient, 'cancelQueries')
  const removeQueries = vi.spyOn(queryClient, 'removeQueries')
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
  const login = vi.fn().mockResolvedValue(undefined)
  const pathRef = { current: pathname }

  const authValue: AuthContextValue = {
    user: { id: '1', name: 'Laura', email: 'laura@tienda.com', role: 'admin' },
    business: { id: 'biz-1', name: 'Tienda de Laura' },
    isAuthenticated: true,
    loading: false,
    login,
    logout: async () => {},
  }

  function LocationWatcher() {
    const location = useLocation()
    useEffect(() => {
      pathRef.current = location.pathname
    }, [location.pathname])
    return null
  }

  const view = renderHook(() => useSwitchBusiness(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={authValue}>
          <MemoryRouter initialEntries={[pathname]}>
            <LocationWatcher />
            {children}
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    ),
  })

  return { ...view, queryClient, cancelQueries, removeQueries, invalidateQueries, login, pathRef }
}

describe('useSwitchBusiness', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset()
  })

  // Given cached data from the current business and a detail URL
  // When the switch succeeds
  // Then it should replace the session, drop that cache, refetch, and leave the detail URL
  it('switches business and refreshes every query', async () => {
    vi.mocked(api.post).mockResolvedValue({ success: true })
    const { result, queryClient, cancelQueries, removeQueries, invalidateQueries, login, pathRef } =
      renderUseSwitchBusiness()

    act(() => {
      result.current.switchBusiness('biz-2')
    })

    await waitFor(() => expect(login).toHaveBeenCalledOnce())

    expect(api.post).toHaveBeenCalledWith('/auth/switch-business', { businessId: 'biz-2' })
    expect(cancelQueries).toHaveBeenCalledOnce()
    expect(removeQueries).toHaveBeenCalledOnce()
    expect(invalidateQueries).toHaveBeenCalledOnce()
    expect(queryClient.getQueryData(['clients'])).toBeUndefined()
    await waitFor(() => expect(pathRef.current).toBe('/orders'))
    expect(result.current.error).toBeNull()
  })

  // Given the API rejects the switch
  // When the mutation fails
  // Then the previous cache and session stay in place
  it('keeps the current cache when the switch is rejected', async () => {
    vi.mocked(api.post).mockRejectedValue(
      new ApiError('No perteneces a ese negocio', 403, 'FORBIDDEN'),
    )
    const { result, queryClient, removeQueries, login } = renderUseSwitchBusiness('/clients')

    act(() => {
      result.current.switchBusiness('biz-ajeno')
    })

    await waitFor(() => expect(result.current.error).toBe('No perteneces a ese negocio'))
    expect(login).not.toHaveBeenCalled()
    expect(removeQueries).not.toHaveBeenCalled()
    expect(queryClient.getQueryData(['clients'])).toEqual([{ id: 'from-old-business' }])
  })

  // Given a switch that is still in flight
  // When the hook is read
  // Then it should expose the business that is being switched to
  it('exposes the business id while the switch is in flight', async () => {
    let resolvePost: (value: { success: boolean }) => void = () => {}
    vi.mocked(api.post).mockReturnValue(
      new Promise((resolve) => {
        resolvePost = resolve
      }),
    )
    const { result } = renderUseSwitchBusiness('/stats')

    act(() => {
      result.current.switchBusiness('biz-2')
    })

    await waitFor(() => expect(result.current.switchingBusinessId).toBe('biz-2'))

    await act(async () => {
      resolvePost({ success: true })
    })

    await waitFor(() => expect(result.current.switchingBusinessId).toBeNull())
  })
})
