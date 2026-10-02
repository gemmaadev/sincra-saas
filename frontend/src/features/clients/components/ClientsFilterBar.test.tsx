import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ClientsFilterBar } from './ClientsFilterBar'
import { api } from '@/shared/services'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockTags = [
  { id: 'tag-1', name: 'Nuevo cliente', color: '#3b91ff', priority: 'LOW', isDefault: true },
]

function renderFilterBar(overrides: Partial<Parameters<typeof ClientsFilterBar>[0]> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const props = {
    search: '',
    onSearchChange: vi.fn(),
    channel: '' as const,
    onChannelChange: vi.fn(),
    tagId: '',
    onTagIdChange: vi.fn(),
    ...overrides,
  }
  render(
    <QueryClientProvider client={queryClient}>
      <ClientsFilterBar {...props} />
    </QueryClientProvider>,
  )
  return props
}

describe('ClientsFilterBar', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({ tags: mockTags })
  })

  // Given the current search value
  // When ClientsFilterBar is rendered
  // Then the search input should show that value
  it('shows the current search value', () => {
    renderFilterBar({ search: 'laura' })
    expect(screen.getByLabelText('Buscar')).toHaveValue('laura')
  })

  // Given the search input
  // When the user types into it
  // Then onSearchChange should be called with the new value
  it('calls onSearchChange when typing in the search box', () => {
    const { onSearchChange } = renderFilterBar()
    fireEvent.change(screen.getByLabelText('Buscar'), { target: { value: 'marc' } })
    expect(onSearchChange).toHaveBeenCalledWith('marc')
  })

  // Given the channel select
  // When the user picks a channel
  // Then onChannelChange should be called with that channel
  it('calls onChannelChange when a channel is selected', () => {
    const { onChannelChange } = renderFilterBar()
    fireEvent.change(screen.getByLabelText('Canal'), { target: { value: 'GMAIL' } })
    expect(onChannelChange).toHaveBeenCalledWith('GMAIL')
  })

  // Given the business's real tags
  // When ClientsFilterBar is rendered
  // Then the tag select should offer them as options
  it('renders the real tags as options in the tag select', async () => {
    renderFilterBar()
    await waitFor(() => expect(screen.getByText('Nuevo cliente')).toBeInTheDocument())
  })

  // Given the tag select
  // When the user picks a tag
  // Then onTagIdChange should be called with that tag's id
  it('calls onTagIdChange when a tag is selected', async () => {
    const { onTagIdChange } = renderFilterBar()
    await waitFor(() => expect(screen.getByText('Nuevo cliente')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('Etiqueta'), { target: { value: 'tag-1' } })
    expect(onTagIdChange).toHaveBeenCalledWith('tag-1')
  })
})
