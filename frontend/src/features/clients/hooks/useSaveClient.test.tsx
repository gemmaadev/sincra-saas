import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { useSaveClient } from './useSaveClient'
import type { ClientFormValues } from '../types/client.types'

vi.mock('@/shared/services', () => ({
  api: { post: vi.fn(), patch: vi.fn() },
}))

const values: ClientFormValues = {
  name: 'Laura García',
  email: '',
  phone: '',
  channels: ['GMAIL'],
  type: '',
  zone: '',
  address: '',
}

function renderSaveClient(clientId?: string) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
  const view = renderHook(() => useSaveClient(clientId), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
  return { ...view, invalidateQueries }
}

describe('useSaveClient', () => {
  beforeEach(() => {
    vi.mocked(api.post)
      .mockReset()
      .mockResolvedValue({ client: { id: 'client-9' } })
    vi.mocked(api.patch)
      .mockReset()
      .mockResolvedValue({ client: { id: 'client-1' } })
  })

  // Given no client id
  // When the mutation runs
  // Then it should POST to /clients and refresh the clients list
  it('creates a client and invalidates the clients list', async () => {
    const { result, invalidateQueries } = renderSaveClient()

    await act(async () => {
      await result.current.mutateAsync(values)
    })

    expect(api.post).toHaveBeenCalledWith('/clients', expect.objectContaining({ email: null }))
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['clients'] })
    expect(invalidateQueries).not.toHaveBeenCalledWith({ queryKey: ['client', expect.anything()] })
  })

  // Given a client id
  // When the mutation runs
  // Then it should PATCH that client and refresh both the list and that client's detail
  it('updates a client and invalidates the list and the detail', async () => {
    const { result, invalidateQueries } = renderSaveClient('client-1')

    await act(async () => {
      await result.current.mutateAsync(values)
    })

    expect(api.patch).toHaveBeenCalledWith(
      '/clients/client-1',
      expect.objectContaining({ name: 'Laura García' }),
    )
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['clients'] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['client', 'client-1'] })
  })

  // Given the API rejects the request
  // When the mutation runs
  // Then it should end in an error and not refresh any query
  it('does not invalidate anything when the request fails', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('boom'))
    const { result, invalidateQueries } = renderSaveClient()

    await act(async () => {
      await result.current.mutateAsync(values).catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(invalidateQueries).not.toHaveBeenCalled()
  })
})
