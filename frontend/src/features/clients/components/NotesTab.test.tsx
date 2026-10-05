import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NotesTab } from './NotesTab'
import { api, ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }
})

vi.mock('@/shared/utils/notify', () => ({ notifySuccess: vi.fn() }))

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
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <NotesTab clientId="client-1" />
      </QueryClientProvider>
    </MantineProvider>,
  )
}

describe('NotesTab', () => {
  beforeEach(() => {
    vi.mocked(notifySuccess).mockReset()
    vi.mocked(api.delete).mockReset()
  })

  // Given a client with no notes
  // When NotesTab is rendered
  // Then an empty-state message should be shown
  it('shows an empty state when there are no notes', async () => {
    vi.mocked(api.get).mockResolvedValue({ notes: [] })
    renderNotesTab()
    expect(await screen.findByText('Todavía no hay notas para este cliente.')).toBeInTheDocument()
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
  // Then a confirmation should open and nothing should be deleted yet
  it('asks for confirmation before deleting a note', async () => {
    vi.mocked(api.get).mockResolvedValue({ notes: [mockNote] })
    renderNotesTab()
    await screen.findByText('Prefiere WhatsApp')

    fireEvent.click(screen.getByLabelText('Eliminar nota'))

    expect(await screen.findByRole('dialog', { name: '¿Eliminar nota?' })).toBeInTheDocument()
    expect(api.delete).not.toHaveBeenCalled()
  })

  // Given the delete confirmation is open
  // When the user confirms
  // Then the note should be deleted via DELETE /notes/:id and a notification shown
  it('deletes the note when the user confirms', async () => {
    vi.mocked(api.get).mockResolvedValue({ notes: [mockNote] })
    vi.mocked(api.delete).mockResolvedValue(undefined)
    renderNotesTab()
    await screen.findByText('Prefiere WhatsApp')

    fireEvent.click(screen.getByLabelText('Eliminar nota'))
    await screen.findByRole('dialog', { name: '¿Eliminar nota?' })
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/notes/note-1'))
    await waitFor(() => expect(notifySuccess).toHaveBeenCalledWith('Nota eliminada'))
  })

  // Given the delete confirmation is open
  // When the user cancels
  // Then the note should not be deleted
  it('keeps the note when the user cancels', async () => {
    vi.mocked(api.get).mockResolvedValue({ notes: [mockNote] })
    renderNotesTab()
    await screen.findByText('Prefiere WhatsApp')

    fireEvent.click(screen.getByLabelText('Eliminar nota'))
    await screen.findByRole('dialog', { name: '¿Eliminar nota?' })
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: '¿Eliminar nota?' })).not.toBeInTheDocument(),
    )
    expect(api.delete).not.toHaveBeenCalled()
  })

  // Given the backend rejects the deletion
  // When the user confirms
  // Then the error should be shown in the modal and no notification sent
  it('shows the error when the deletion fails', async () => {
    vi.mocked(api.get).mockResolvedValue({ notes: [mockNote] })
    vi.mocked(api.delete).mockRejectedValue(
      new ApiError('Nota no encontrada', 404, 'NOTE_NOT_FOUND'),
    )
    renderNotesTab()
    await screen.findByText('Prefiere WhatsApp')

    fireEvent.click(screen.getByLabelText('Eliminar nota'))
    await screen.findByRole('dialog', { name: '¿Eliminar nota?' })
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    expect(await screen.findByText('Nota no encontrada')).toBeInTheDocument()
    expect(notifySuccess).not.toHaveBeenCalled()
  })
})
