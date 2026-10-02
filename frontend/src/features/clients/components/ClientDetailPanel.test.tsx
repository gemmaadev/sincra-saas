import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi } from 'vitest'
import { ClientDetailPanel } from './ClientDetailPanel'
import { api } from '@/shared/services'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockClient = {
  id: 'client-1',
  name: 'Laura García',
  email: null,
  phone: null,
  channels: [],
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

function renderPanel(id = 'client-1') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ClientDetailPanel id={id} />
    </QueryClientProvider>,
  )
}

describe('ClientDetailPanel', () => {
  // Given the client request has not resolved yet
  // When ClientDetailPanel is rendered
  // Then a loading message should be shown
  it('shows a loading message while the client is being fetched', () => {
    vi.mocked(api.get).mockImplementation(() => new Promise(() => {}))
    renderPanel()
    expect(screen.getByText('Cargando cliente...')).toBeInTheDocument()
  })

  // Given a successful response
  // When ClientDetailPanel is rendered
  // Then the client's name should be shown
  it('shows the client name once loaded', async () => {
    vi.mocked(api.get).mockResolvedValue({ client: mockClient })
    renderPanel()
    expect(await screen.findByText('Laura García')).toBeInTheDocument()
  })

  // Given the client request fails
  // When ClientDetailPanel is rendered
  // Then an error message should be shown
  it('shows an error message when the request fails', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'))
    renderPanel()
    expect(await screen.findByText('No se ha podido cargar el cliente.')).toBeInTheDocument()
  })
})
