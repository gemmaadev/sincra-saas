import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { useTeam } from './useTeam'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn() },
}))

const mockMembers = [
  { id: 'user-1', name: 'Laura García', email: 'laura@sincra.app', role: 'ADMIN', status: 'ACTIVE' },
  { id: 'user-2', name: 'Carlos Ruiz', email: 'carlos@sincra.app', role: 'EMPLOYEE', status: 'PENDING' },
]

function renderUseTeam() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return renderHook(() => useTeam(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useTeam', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    vi.mocked(api.get).mockResolvedValue({ members: mockMembers })
  })

  // Given the team page mounts
  // When useTeam runs
  // Then it should request GET /team
  it('requests /team', async () => {
    const { result } = renderUseTeam()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(api.get).toHaveBeenCalledWith('/team')
  })

  // Given a successful response
  // When useTeam resolves
  // Then it should return the members list as-is
  it('returns the members from the response', async () => {
    const { result } = renderUseTeam()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ members: mockMembers })
  })
})
