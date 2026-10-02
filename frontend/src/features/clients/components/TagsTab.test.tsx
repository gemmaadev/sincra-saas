import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TagsTab } from './TagsTab'
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

describe('TagsTab', () => {
  // Given a client with no tags
  // When TagsTab is rendered
  // Then an empty-state message should be shown
  it('shows an empty state when there are no tags', () => {
    render(<TagsTab client={mockClient} />)
    expect(screen.getByText('Este cliente no tiene etiquetas todavía.')).toBeInTheDocument()
  })

  // Given a client with tags
  // When TagsTab is rendered
  // Then each tag should be shown
  it('shows the client tags when present', () => {
    render(
      <TagsTab
        client={{
          ...mockClient,
          clientTags: [
            {
              id: 'ct-1',
              tagId: 'tag-1',
              tag: {
                id: 'tag-1',
                name: 'VIP',
                color: '#ffb800',
                priority: 'LOW',
                isDefault: false,
              },
            },
          ],
        }}
      />,
    )
    expect(screen.getByText('VIP')).toBeInTheDocument()
  })
})
