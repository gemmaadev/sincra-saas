import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSearchOrders } from './useSearchOrders'
import { api } from '@/shared/services'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const orderRows = [{ id: 'order-1', number: 42, client: { name: 'Laura García' } }]

function renderUseSearchOrders(query: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return renderHook(() => useSearchOrders(query), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useSearchOrders', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
  })

  // Given an empty query
  // When the hook is rendered
  // Then it should not request anything
  it('does not request anything for an empty query', () => {
    renderUseSearchOrders('')
    expect(api.get).not.toHaveBeenCalled()
  })

  // Given a non-empty query
  // When the hook runs
  // Then it should request /orders with the text URL-encoded, capped to 5 results
  it('requests /orders with the encoded search text and a limit of 5', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: orderRows })
    const { result } = renderUseSearchOrders('42')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(api.get).toHaveBeenCalledWith('/orders?search=42&limit=5')
  })

  // Given a successful response from the API
  // When the hook resolves
  // Then it should flatten each order's client name onto the result
  it('maps each order to its id, number and client name', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: orderRows })
    const { result } = renderUseSearchOrders('Laura')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([
      { id: 'order-1', number: 42, clientName: 'Laura García' },
    ])
  })

  // Given the backend fails
  // When the query runs
  // Then the hook should expose the error
  it('exposes the error when the request fails', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('boom'))
    const { result } = renderUseSearchOrders('42')

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
