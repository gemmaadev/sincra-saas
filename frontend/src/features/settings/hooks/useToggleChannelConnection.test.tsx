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

  // Given connect: true
  // When the mutation runs
  // Then it should POST to /channels/connect with the channel
  it('posts to /channels/connect when connecting', async () => {
    const { result } = renderUseToggleChannelConnection()

    await act(async () => {
      await result.current.mutateAsync({ channel: 'GMAIL', connect: true })
    })

    expect(api.post).toHaveBeenCalledWith('/channels/connect', { channel: 'GMAIL' })
  })

  // Given connect: false
  // When the mutation runs
  // Then it should POST to /channels/disconnect with the channel
  it('posts to /channels/disconnect when disconnecting', async () => {
    const { result } = renderUseToggleChannelConnection()

    await act(async () => {
      await result.current.mutateAsync({ channel: 'GMAIL', connect: false })
    })

    expect(api.post).toHaveBeenCalledWith('/channels/disconnect', { channel: 'GMAIL' })
  })

  // Given a successful toggle
  // When the mutation resolves
  // Then it should invalidate the settings channels query
  it('invalidates the channels query on success', async () => {
    const { result, invalidateQueries } = renderUseToggleChannelConnection()

    await act(async () => {
      await result.current.mutateAsync({ channel: 'GMAIL', connect: true })
    })

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['settings', 'channels'] })
  })

  // Given the API rejects the request
  // When the mutation runs
  // Then it should end in an error and not invalidate anything
  it('does not invalidate the query when the request fails', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('boom'))
    const { result, invalidateQueries } = renderUseToggleChannelConnection()

    await act(async () => {
      await result.current.mutateAsync({ channel: 'GMAIL', connect: true }).catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(invalidateQueries).not.toHaveBeenCalled()
  })
})
