import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { useUpdateBusinessSettings } from './useUpdateBusinessSettings'

vi.mock('@/shared/services', () => ({
  api: { patch: vi.fn() },
}))

const updatedBusiness = { id: 'biz-1', name: 'Nuevo nombre' }

function renderUseUpdateBusinessSettings() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const setQueryData = vi.spyOn(queryClient, 'setQueryData')
  const view = renderHook(() => useUpdateBusinessSettings(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  return { ...view, setQueryData }
}

describe('useUpdateBusinessSettings', () => {
  beforeEach(() => {
    vi.mocked(api.patch).mockReset().mockResolvedValue({ business: updatedBusiness })
  })

  // Given new business data
  // When the mutation runs
  // Then it should PATCH /settings/business with that data
  it('sends the update to /settings/business', async () => {
    const { result } = renderUseUpdateBusinessSettings()

    await act(async () => {
      await result.current.mutateAsync({ name: 'Nuevo nombre' })
    })

    expect(api.patch).toHaveBeenCalledWith('/settings/business', { name: 'Nuevo nombre' })
  })

  // Given a successful update
  // When the mutation resolves
  // Then it should write the updated business straight into the settings query cache
  it('updates the settings query cache on success', async () => {
    const { result, setQueryData } = renderUseUpdateBusinessSettings()

    await act(async () => {
      await result.current.mutateAsync({ name: 'Nuevo nombre' })
    })

    expect(setQueryData).toHaveBeenCalledWith(['settings', 'business'], updatedBusiness)
  })

  // Given the API rejects the request
  // When the mutation runs
  // Then it should end in an error and not touch the cache
  it('does not update the cache when the request fails', async () => {
    vi.mocked(api.patch).mockRejectedValue(new Error('boom'))
    const { result, setQueryData } = renderUseUpdateBusinessSettings()

    await act(async () => {
      await result.current.mutateAsync({ name: 'Nuevo nombre' }).catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(setQueryData).not.toHaveBeenCalled()
  })
})
