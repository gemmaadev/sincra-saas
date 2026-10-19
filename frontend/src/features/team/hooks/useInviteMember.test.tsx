import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { useInviteMember } from './useInviteMember'

vi.mock('@/shared/services', () => ({
  api: { post: vi.fn() },
}))

function renderUseInviteMember() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
  const view = renderHook(() => useInviteMember(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  return { ...view, invalidateQueries }
}

describe('useInviteMember', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset().mockResolvedValue({ success: true })
  })

  // Given a name and email
  // When the mutation runs
  // Then it should POST to /team/invite and refresh the team list
  it('invites a member and invalidates the team query', async () => {
    const { result, invalidateQueries } = renderUseInviteMember()

    await act(async () => {
      await result.current.mutateAsync({ name: 'Marta Soler', email: 'marta@sincra.app' })
    })

    expect(api.post).toHaveBeenCalledWith('/team/invite', {
      name: 'Marta Soler',
      email: 'marta@sincra.app',
    })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['team'] })
  })

  // Given the API rejects the request
  // When the mutation runs
  // Then it should end in an error and not refresh the team list
  it('does not invalidate the team query when the request fails', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('boom'))
    const { result, invalidateQueries } = renderUseInviteMember()

    await act(async () => {
      await result.current
        .mutateAsync({ name: 'Marta Soler', email: 'marta@sincra.app' })
        .catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(invalidateQueries).not.toHaveBeenCalled()
  })
})
