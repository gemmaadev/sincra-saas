import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect } from 'vitest'
import { clientsTableColumns } from './clientsTableColumns'
import type { Client } from '../types/client.types'

const client: Client = {
  id: 'client-1',
  name: 'Anna (Restaurant Can Vila)',
  email: null,
  phone: null,
  channels: [],
  type: null,
  zone: null,
  aiGenerated: false,
  clientTags: [
    {
      id: 'ct-1',
      tagId: 'tag-1',
      aiGenerated: true,
      tag: {
        id: 'tag-1',
        name: 'Nuevo cliente',
        color: '#3b82f6',
        priority: 'LOW',
        isDefault: false,
      },
    },
    {
      id: 'ct-2',
      tagId: 'tag-2',
      aiGenerated: false,
      tag: {
        id: 'tag-2',
        name: 'Consulta',
        color: '#f5a524',
        priority: 'LOW',
        isDefault: false,
      },
    },
  ],
  orderCount: 0,
  lastOrderAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function renderColumn(key: string, row: Client = client) {
  const column = clientsTableColumns.find((entry) => entry.key === key)
  if (!column) throw new Error(`missing ${key} column`)

  render(<MantineProvider>{column.render(row)}</MantineProvider>)
}

describe('clientsTableColumns tags', () => {
  // Given a client with one tag the AI assigned and one a person assigned
  // When the Etiquetas cell is rendered
  // Then only the AI tag should carry the suggestion mark
  it('marks only the tags the AI suggested', () => {
    renderColumn('tags')

    expect(screen.getByText('Nuevo cliente')).toContainElement(
      screen.getByRole('img', { name: 'Sugerido por IA' }),
    )
    expect(
      screen.getByText('Consulta').querySelector('[aria-label="Sugerido por IA"]'),
    ).not.toBeInTheDocument()
  })

  // Given a client with no tags
  // When the Etiquetas cell is rendered
  // Then it should show a dash
  it('shows a dash when the client has no tags', () => {
    renderColumn('tags', { ...client, clientTags: [] })

    expect(screen.getByText('—')).toBeInTheDocument()
  })
})

describe('clientsTableColumns name', () => {
  // Given a client whose name includes the business in parentheses
  // When the Cliente cell is rendered
  // Then the avatar initials should skip the punctuation
  it('builds avatar initials without punctuation', () => {
    renderColumn('name')

    expect(screen.getByText('AR')).toBeInTheDocument()
  })

  // Given a client the AI created
  // When the Cliente cell is rendered
  // Then the AI star sits next to the name
  it('marks a client the AI created', () => {
    renderColumn('name', { ...client, aiGenerated: true })

    expect(screen.getByText('Anna (Restaurant Can Vila)')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Sugerido por IA' })).toBeInTheDocument()
  })

  // Given a client a person created
  // When the Cliente cell is rendered
  // Then there is no AI star next to the name
  it('does not mark a client a person created', () => {
    renderColumn('name')

    expect(screen.queryByRole('img', { name: 'Sugerido por IA' })).not.toBeInTheDocument()
  })
})
