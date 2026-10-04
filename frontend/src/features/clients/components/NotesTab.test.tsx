import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi } from 'vitest'
import { NotesTab } from './NotesTab'
import { api } from '@/shared/services'

vi.mock('@/shared/services', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockNote = {
  id: 'note-1',
  clientId: 'client-1',
  content: 'Prefiere WhatsApp',
  createdBy: 'user-1',
  createdAt: '2026-01-01T00:00:00.000Z',
}

function renderNotesTab() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <NotesTab clientId="client-1" />
    </QueryClientProvider>,
  )
}

describe('NotesTab', () => {
  // Given a client with no notes
  // When NotesTab is rendered
  // Then an empty-state message should be shown
  it('shows an empty state when there are no notes', async () => {
    vi.mocked(api.get).mockResolvedValue({ notes: [] })
    renderNotesTab()
    expect(
      await screen.findByText('Todavía no hay notas para este cliente.'),
    ).toBeInTheDocument()
  })

  // Given a client with notes
  // When NotesTab is rendered
  // Then each note's content should be shown
  it('shows the client notes when present', async () => {
    vi.mocked(api.get).mockResolvedValue({ notes: [mockNote] })
    renderNotesTab()
    expect(await screen.findByText('Prefiere WhatsApp')).toBeInTheDocument()
  })

  // Given the "add note" form
  // When there is no text in it
  // Then "Añadir nota" should be disabled
  it('disables "Añadir nota" when the textarea is empty', async () => {
    vi.mocked(api.get).mockResolvedValue({ notes: [] })
    renderNotesTab()
    await screen.findByText('Todavía no hay notas para este cliente.')
    expect(screen.getByText('Añadir nota')).toBeDisabled()
  })

  // Given text typed into the textarea
  // When the user clicks "Añadir nota"
  // Then it should create the note via POST /clients/:id/notes
  it('creates a note when "Añadir nota" is clicked', async () => {
    vi.mocked(api.get).mockResolvedValue({ notes: [] })
    vi.mocked(api.post).mockResolvedValue({ note: mockNote })
    renderNotesTab()
    await screen.findByText('Todavía no hay notas para este cliente.')

    fireEvent.change(screen.getByPlaceholderText('Escribe una nota sobre este cliente...'), {
      target: { value: 'Prefiere WhatsApp' },
    })
    fireEvent.click(screen.getByText('Añadir nota'))

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/clients/client-1/notes', {
        content: 'Prefiere WhatsApp',
      }),
    )
  })

  // Given an existing note
  // When the user clicks its delete button
  // Then it should delete the note via DELETE /notes/:id
  it('deletes a note when its delete button is clicked', async () => {
    vi.mocked(api.get).mockResolvedValue({ notes: [mockNote] })
    vi.mocked(api.delete).mockResolvedValue(undefined)
    renderNotesTab()
    await screen.findByText('Prefiere WhatsApp')

    fireEvent.click(screen.getByLabelText('Eliminar nota'))

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/notes/note-1'))
  })
})
