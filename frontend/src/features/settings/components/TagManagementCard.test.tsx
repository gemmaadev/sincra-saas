import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { TagManagementCard } from './TagManagementCard'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { ...actual.api, get: vi.fn(), patch: vi.fn(), delete: vi.fn() } }
})

vi.mock('@/shared/utils/notify', () => ({ notifySuccess: vi.fn() }))

const mockTags = [
  { id: 'tag-1', name: 'Urgente', color: '#e5484d', priority: 'HIGH', isDefault: true },
  { id: 'tag-2', name: 'VIP', color: '#ffb800', priority: 'MEDIUM', isDefault: false },
]

function renderCard() {
  render(<MantineProvider>{withQueryClient(<TagManagementCard />)}</MantineProvider>)
  return { user: userEvent.setup() }
}

describe('TagManagementCard', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset().mockResolvedValue({ tags: mockTags })
    vi.mocked(api.patch).mockReset()
    vi.mocked(api.delete).mockReset()
  })

  // Given the business's tags
  // When the card is rendered
  // Then every tag's name should be listed
  it('renders every tag', async () => {
    renderCard()

    expect(await screen.findByText('Urgente')).toBeInTheDocument()
    expect(screen.getByText('VIP')).toBeInTheDocument()
  })

  // Given a tag name
  // When the user clicks it, edits it and presses Enter
  // Then it should PATCH the new name
  it('renames a tag', async () => {
    vi.mocked(api.patch).mockResolvedValue({ tag: { ...mockTags[0], name: 'Muy urgente' } })
    const { user } = renderCard()
    await screen.findByText('Urgente')

    await user.click(screen.getByText('Urgente'))
    const input = screen.getByLabelText('Nombre de Urgente')
    await user.clear(input)
    await user.type(input, 'Muy urgente{Enter}')

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith('/tags/tag-1', { name: 'Muy urgente' }),
    )
  })

  // Given a tag's color swatch
  // When the user opens the palette and picks a different color
  // Then it should PATCH the new color
  it('recolors a tag', async () => {
    vi.mocked(api.patch).mockResolvedValue({ tag: mockTags[0] })
    const { user } = renderCard()
    await screen.findByText('Urgente')

    await user.click(screen.getByRole('button', { name: 'Cambiar color de Urgente' }))
    await user.click(screen.getByRole('button', { name: 'Color #8b5cf6' }))

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith('/tags/tag-1', { color: '#8b5cf6' }),
    )
  })

  // Given an admin wants to remove a tag
  // When they click delete and confirm
  // Then it should DELETE the tag
  it('deletes a tag after confirming', async () => {
    vi.mocked(api.delete).mockResolvedValue(undefined)
    const { user } = renderCard()
    await screen.findByText('Urgente')

    await user.click(screen.getByRole('button', { name: 'Eliminar etiqueta Urgente' }))
    expect(await screen.findByRole('dialog', { name: '¿Eliminar "Urgente"?' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Eliminar etiqueta' }))

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/tags/tag-1'))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  // Given the delete confirmation modal is open
  // When the user cancels instead
  // Then it should close without deleting anything
  it('does not delete when the confirmation is cancelled', async () => {
    const { user } = renderCard()
    await screen.findByText('Urgente')

    await user.click(screen.getByRole('button', { name: 'Eliminar etiqueta Urgente' }))
    await screen.findByRole('dialog', { name: '¿Eliminar "Urgente"?' })
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(api.delete).not.toHaveBeenCalled()
  })
})
