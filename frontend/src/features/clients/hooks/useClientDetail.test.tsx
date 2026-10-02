import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useClientDetail } from './useClientDetail'
import { api } from '@/shared/services'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockClient = {
  id: 'client-1',
  name: 'Laura García',
  email: 'laura@ejemplo.test',
  phone: null,
  channels: ['GMAIL'],
  type: null,
  address: null,
  zone: null,
  latitude: null,
  longitude: null,
  notes: null,
  lastContact: null,
  clientTags: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function renderUseClientDetail(id: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return renderHook(() => useClientDetail(id), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useClientDetail', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({ client: mockClient })
  })

  // Given a client id
  // When useClientDetail is called
  // Then it should request GET /clients/:id
  it('requests /clients/:id', async () => {
    const { result } = renderUseClientDetail('client-1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(api.get).toHaveBeenCalledWith('/clients/client-1')
  })

  // Given a successful response
  // When useClientDetail resolves
  // Then it should return the client, unwrapped from the { client } envelope
  it('returns the client from the response', async () => {
    const { result } = renderUseClientDetail('client-1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockClient)
  })
})
