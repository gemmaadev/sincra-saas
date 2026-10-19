import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi } from 'vitest'
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

function mockApiGet(channels: Array<{ channel: string; status: string }>) {
  vi.mocked(api.get).mockImplementation((path: string) => {
    if (path === '/tags') {
      return Promise.resolve({
        tags: [{ id: 'tag-1', name: 'Nuevo cliente', color: '#3b91ff', priority: 'LOW', isDefault: true }],
      })
    }
    if (path === '/settings/channels') return Promise.resolve({ channels })
    return Promise.reject(new Error(`unexpected path: ${path}`))
  })
}

describe('Sidebar', () => {
  // Given the Sidebar component, with Gmail connected and the rest mocked/disconnected
  // When it is rendered
  // Then nav items, labels and only the really connected channel should be visible
  it('renders all nav items, labels, and only the connected channels', async () => {
    mockApiGet([
      { channel: 'GMAIL', status: 'CONNECTED' },
      { channel: 'OUTLOOK', status: 'DISCONNECTED' },
      { channel: 'WHATSAPP', status: 'MOCKED' },
    ])
    renderSidebar()

    expect(screen.getByText('Bandeja')).toBeInTheDocument()
    expect(screen.getByText('Ajustes')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Nuevo cliente')).toBeInTheDocument()
    })
    expect(api.get).toHaveBeenCalledWith('/tags')

    await waitFor(() => {
      expect(screen.getByText('Gmail')).toBeInTheDocument()
    })
    expect(screen.queryByText('Outlook')).not.toBeInTheDocument()
    expect(screen.queryByText('WhatsApp')).not.toBeInTheDocument()
  })

  // Given a business with no channel really connected (only disconnected/mocked ones)
  // When the Sidebar is rendered
  // Then the whole "Canales" section should be hidden, not shown empty
  it('hides the Canales section when nothing is really connected', async () => {
    mockApiGet([
      { channel: 'GMAIL', status: 'DISCONNECTED' },
      { channel: 'WHATSAPP', status: 'MOCKED' },
    ])
    renderSidebar()

    await waitFor(() => {
      expect(screen.getByText('Nuevo cliente')).toBeInTheDocument()
    })
    expect(screen.queryByText('Canales')).not.toBeInTheDocument()
  })
})
