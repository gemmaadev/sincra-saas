import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { EditClientModal } from './EditClientModal'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() } }
})

const mockClient = {
  id: 'client-1',
  name: 'Laura García',
  email: null,
  phone: null,
  channels: ['GMAIL'],
  type: null,
  address: null,
  zone: null,
  latitude: null,
  longitude: null,
  lastContact: null,
  clientTags: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function renderModal() {
  render(
    withQueryClient(
      <MantineProvider>
        <EditClientModal clientId="client-1" opened onClose={vi.fn()} />
      </MantineProvider>,
    ),
  )
}

describe('EditClientModal', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
  })

  // Given a client id
  // When the modal is opened
  // Then it should load the client and show the edit form with their data
  it('loads the client and shows the edit form', async () => {
    vi.mocked(api.get).mockResolvedValue({ client: mockClient })
    renderModal()

    expect(await screen.findByRole('dialog', { name: 'Editar cliente' })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/clients/client-1')
    expect(screen.getByDisplayValue('Laura García')).toBeInTheDocument()
  })

  // Given the client is still loading
  // When the modal is rendered
  // Then nothing should be shown yet
  it('shows nothing while the client is loading', () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}))
    renderModal()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
