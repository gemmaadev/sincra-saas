import { render, screen } from '@testing-library/react'
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
})
