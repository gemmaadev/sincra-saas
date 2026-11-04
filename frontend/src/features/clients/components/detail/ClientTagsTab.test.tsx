import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '@/shared/services'
import { ClientTagsTab } from './ClientTagsTab'
import type { ClientDetail } from '../../types/client.types'

const mockClient: ClientDetail = {
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
  lastContact: null,
  clientTags: [],
  orders: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn(), post: vi.fn(), delete: vi.fn() } }
})

const vipTag = { id: 'tag-vip', name: 'VIP', color: '#ffb800', priority: 'LOW', isDefault: true }
const urgentTag = {
  id: 'tag-urgent',
  name: 'Urgente',
  color: '#e5484d',
  priority: 'LOW',
  isDefault: true,
}

function clientWithTags(tags: { tag: typeof vipTag; aiGenerated?: boolean }[]): ClientDetail {
  return {
    ...mockClient,
    clientTags: tags.map(({ tag, aiGenerated = false }) => ({
      id: `assignment-${tag.id}`,
      tagId: tag.id,
      aiGenerated,
      tag: { ...tag, priority: 'LOW' as const },
    })),
  }
}

function renderClientTagsTab(client: ClientDetail = mockClient) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <MantineProvider env="test">
      <QueryClientProvider client={queryClient}>
        <ClientTagsTab client={client} />
      </QueryClientProvider>
    </MantineProvider>,
  )
}

describe('ClientTagsTab', () => {
  beforeEach(() => {
    vi.mocked(api.get)
      .mockReset()
      .mockResolvedValue({ tags: [vipTag, urgentTag] })
    vi.mocked(api.post).mockReset().mockResolvedValue({})
    vi.mocked(api.delete).mockReset().mockResolvedValue(null)
  })

  // Given a client with no tags
  // When ClientTagsTab is rendered
  // Then an empty-state message should be shown
  it('shows an empty state when there are no tags', () => {
    renderClientTagsTab()

    expect(screen.getByText('Este cliente no tiene etiquetas todavía.')).toBeInTheDocument()
  })

  // Given a client with tags
  // When ClientTagsTab is rendered
  // Then each tag should be shown
  it('shows the client tags when present', () => {
    renderClientTagsTab(clientWithTags([{ tag: vipTag }]))

    expect(screen.getByText('VIP')).toBeInTheDocument()
    expect(screen.queryByText('Este cliente no tiene etiquetas todavía.')).not.toBeInTheDocument()
  })

  // Given a tag that the AI assigned and one that a person assigned
  // When ClientTagsTab is rendered
  // Then only the AI one should carry the "Sugerido por IA" badge
  it('marks the tags assigned by the AI', () => {
    renderClientTagsTab(clientWithTags([{ tag: vipTag, aiGenerated: true }, { tag: urgentTag }]))

    expect(screen.getAllByText('Sugerido por IA')).toHaveLength(1)
  })

  // Given a client with a tag
  // When the user clicks its remove button
  // Then the tag should be removed from the client through the API
  it('removes a tag from the client', async () => {
    renderClientTagsTab(clientWithTags([{ tag: vipTag }]))

    fireEvent.click(screen.getByRole('button', { name: 'Quitar etiqueta VIP' }))

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/clients/client-1/tags/tag-vip'))
  })

  // Given a catalog tag that the client does not have yet
  // When the user picks it in the selector
  // Then it should be assigned to the client
  it('adds an existing tag to the client', async () => {
    renderClientTagsTab(clientWithTags([{ tag: vipTag }]))

    fireEvent.click(screen.getByRole('button', { name: 'Añadir etiqueta' }))
    fireEvent.click(await screen.findByRole('option', { name: 'Urgente' }))

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/clients/client-1/tags', { tagId: 'tag-urgent' }),
    )
  })

  // Given a name that is not in the catalog
  // When the user chooses "Crear"
  // Then the tag should be created with an automatic color and then assigned to the client
  it('creates a new tag and assigns it', async () => {
    vi.mocked(api.post).mockImplementation((path: string) =>
      path === '/tags'
        ? Promise.resolve({ tag: { id: 'tag-new', name: 'Mayorista', color: '#8b5cf6' } })
        : Promise.resolve({}),
    )
    renderClientTagsTab()

    fireEvent.click(screen.getByRole('button', { name: 'Añadir etiqueta' }))
    fireEvent.change(await screen.findByLabelText('Buscar o crear etiqueta'), {
      target: { value: 'Mayorista' },
    })
    fireEvent.click(screen.getByRole('option', { name: 'Crear «Mayorista»' }))

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/tags', {
        name: 'Mayorista',
        color: expect.stringMatching(/^#[0-9a-f]{6}$/),
      }),
    )
    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/clients/client-1/tags', { tagId: 'tag-new' }),
    )
  })

  // Given the backend rejects the assignment with a message
  // When the user picks a tag
  // Then that message should be shown
  it('shows the backend error when assigning fails', async () => {
    vi.mocked(api.post).mockRejectedValue(
      new ApiError('Este cliente ya tiene esa etiqueta', 409, 'TAG_ALREADY_ASSIGNED'),
    )
    renderClientTagsTab()

    fireEvent.click(screen.getByRole('button', { name: 'Añadir etiqueta' }))
    fireEvent.click(await screen.findByRole('option', { name: 'VIP' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Este cliente ya tiene esa etiqueta')
  })
})
