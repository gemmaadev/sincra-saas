import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { useBusinessSettings } from './useBusinessSettings'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn() },
}))

const mockBusiness = {
  id: 'biz-1',
  name: 'Tienda de Laura',
  sector: 'ecommerce',
  timezone: 'Europe/Madrid',
  language: 'es',
}

function renderUseBusinessSettings() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return renderHook(() => useBusinessSettings(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useBusinessSettings', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    vi.mocked(api.get).mockResolvedValue({ business: mockBusiness })
  })

  // Given the settings page mounts
  // When useBusinessSettings runs
  // Then it should request GET /settings/business
  it('requests /settings/business', async () => {
    const { result } = renderUseBusinessSettings()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(api.get).toHaveBeenCalledWith('/settings/business')
  })

  // Given a successful response
  // When useBusinessSettings resolves
  // Then it should return the business, unwrapped from the { business } envelope
  it('returns the business from the response', async () => {
    const { result } = renderUseBusinessSettings()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockBusiness)
  })
})
