import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { NotesTab } from './NotesTab'
import type { ClientDetail } from '../hooks/useClientDetail'

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
  notes: null,
  lastContact: null,
  clientTags: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('NotesTab', () => {
  // Given a client with no notes
  // When NotesTab is rendered
  // Then an empty-state message should be shown
  it('shows an empty state when there are no notes', () => {
    render(<NotesTab client={mockClient} />)
    expect(screen.getByText('Todavía no hay notas para este cliente.')).toBeInTheDocument()
  })

  // Given a client with notes
  // When NotesTab is rendered
  // Then those notes should be shown
  it('shows the client notes when present', () => {
    render(<NotesTab client={{ ...mockClient, notes: 'Prefiere WhatsApp' }} />)
    expect(screen.getByText('Prefiere WhatsApp')).toBeInTheDocument()
  })
})
