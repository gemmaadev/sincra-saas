import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { useResendInvite } from './useResendInvite'

vi.mock('@/shared/services', () => ({
  api: { post: vi.fn() },
}))

function renderUseResendInvite() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
  const view = renderHook(() => useResendInvite(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  return { ...view, invalidateQueries }
}

describe('useResendInvite', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset().mockResolvedValue({ success: true })
  })

  // Given a pending member's id
  // When the mutation runs
  // Then it should POST to /team/:userId/resend-invite and refresh the team list
  it('resends the invite and invalidates the team query', async () => {
    const { result, invalidateQueries } = renderUseResendInvite()

    await act(async () => {
      await result.current.mutateAsync('user-2')
    })

    expect(api.post).toHaveBeenCalledWith('/team/user-2/resend-invite')
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['team'] })
  })

  // Given the API rejects the request (e.g. the member already accepted)
  // When the mutation runs
  // Then it should end in an error and not refresh the team list
  it('does not invalidate the team query when the request fails', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('boom'))
    const { result, invalidateQueries } = renderUseResendInvite()

    await act(async () => {
      await result.current.mutateAsync('user-2').catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(invalidateQueries).not.toHaveBeenCalled()
  })
})
