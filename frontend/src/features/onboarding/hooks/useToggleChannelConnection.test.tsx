import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { useToggleChannelConnection } from './useToggleChannelConnection'

vi.mock('@/shared/services', () => ({
  api: { post: vi.fn() },
}))

function renderUseToggleChannelConnection() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
  const view = renderHook(() => useToggleChannelConnection(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  return { ...view, invalidateQueries }
}

describe('useToggleChannelConnection', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset().mockResolvedValue({})
  })

  it('invalidates the channels query after a channel is saved', async () => {
    const { result, invalidateQueries } = renderUseToggleChannelConnection()

    await act(async () => {
      await result.current.mutateAsync({ channel: 'gmail', connect: true, accessToken: 'token-1' })
    })

    expect(api.post).toHaveBeenCalledWith('/channels/connect', {
      channel: 'GMAIL',
      accessToken: 'token-1',
    })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['settings', 'channels'] })
  })

  it('does not invalidate the query when the request fails', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('boom'))
    const { result, invalidateQueries } = renderUseToggleChannelConnection()

    await act(async () => {
      await result.current.mutateAsync({ channel: 'outlook', connect: true }).catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(invalidateQueries).not.toHaveBeenCalled()
  })
})
