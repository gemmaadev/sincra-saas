import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { useDeleteAccount } from './useDeleteAccount'

vi.mock('@/shared/services', () => ({
  api: { delete: vi.fn() },
}))

function renderUseDeleteAccount() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return renderHook(() => useDeleteAccount(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useDeleteAccount', () => {
  beforeEach(() => {
    vi.mocked(api.delete).mockReset().mockResolvedValue({ success: true })
  })

  // Given the admin confirms deleting the business
  // When the mutation runs
  // Then it should DELETE /settings/account
  it('deletes the account', async () => {
    const { result } = renderUseDeleteAccount()

    await act(async () => {
      await result.current.mutateAsync()
    })

    expect(api.delete).toHaveBeenCalledWith('/settings/account')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  // Given the API rejects the request
  // When the mutation runs
  // Then it should end in an error
  it('ends in an error when the request fails', async () => {
    vi.mocked(api.delete).mockRejectedValue(new Error('boom'))
    const { result } = renderUseDeleteAccount()

    await act(async () => {
      await result.current.mutateAsync().catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
