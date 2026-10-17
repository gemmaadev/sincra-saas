import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { useConnectedChannels } from './useConnectedChannels'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn() },
}))

const mockChannels = [
  { channel: 'GMAIL', status: 'CONNECTED' },
  { channel: 'OUTLOOK', status: 'DISCONNECTED' },
]

function renderUseConnectedChannels() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return renderHook(() => useConnectedChannels(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useConnectedChannels', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    vi.mocked(api.get).mockResolvedValue({ channels: mockChannels })
  })

  // Given the connected channels card mounts
  // When useConnectedChannels runs
  // Then it should request GET /settings/channels
  it('requests /settings/channels', async () => {
    const { result } = renderUseConnectedChannels()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(api.get).toHaveBeenCalledWith('/settings/channels')
  })

  // Given a successful response
  // When useConnectedChannels resolves
  // Then it should return the channels, unwrapped from the { channels } envelope
  it('returns the channels from the response', async () => {
    const { result } = renderUseConnectedChannels()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockChannels)
  })
})
