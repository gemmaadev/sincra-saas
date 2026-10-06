import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Sidebar } from './Sidebar'
import { api } from '@/shared/services'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

function renderSidebar() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Sidebar', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({
      tags: [{ id: 'tag-1', name: 'Nuevo cliente', color: '#3b91ff', priority: 'LOW', isDefault: true }],
    })
  })

  // Given the Sidebar component
  // When it is rendered
  // Then all navigation items, channels and (once loaded) the real tags should be visible
  it('renders all nav items, channels and labels', async () => {
    renderSidebar()

    expect(screen.getByText('Bandeja')).toBeInTheDocument()
    expect(screen.getByText('Ajustes')).toBeInTheDocument()
    expect(screen.getByText('Gmail')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Nuevo cliente')).toBeInTheDocument()
    })
    expect(api.get).toHaveBeenCalledWith('/tags')
  })
})
