import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect } from 'vitest'
import { TagPill } from './TagPill'

describe('TagPill', () => {
  // Given a tag name and color
  // When it is rendered
  // Then the name should be visible, styled with that color
  it('renders the tag name in the given color', () => {
    render(<TagPill name="VIP" color="#ffb800" />)

    const pill = screen.getByText('VIP')
    expect(pill).toBeInTheDocument()
    expect(pill).toHaveStyle({ color: '#ffb800' })
  })

  // Given a tag a person assigned
  // When it is rendered
  // Then it should not claim the AI suggested it
  it('does not mark a tag a person assigned', () => {
    render(<TagPill name="VIP" color="#ffb800" />)

    expect(screen.queryByRole('img', { name: 'Sugerido por IA' })).not.toBeInTheDocument()
  })

  // Given a tag the AI assigned
  // When it is rendered
  // Then the suggestion mark should sit inside the pill
  it('shows the AI suggestion mark inside the pill', () => {
    render(
      <MantineProvider>
        <TagPill name="Nuevo cliente" color="#3b82f6" aiGenerated />
      </MantineProvider>,
    )

    const pill = screen.getByText('Nuevo cliente')
    expect(pill).toContainElement(screen.getByRole('img', { name: 'Sugerido por IA' }))
  })
})
