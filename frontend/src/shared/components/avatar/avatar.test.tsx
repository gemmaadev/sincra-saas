import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  // Given an Avatar with a name but no image
  // When it is rendered
  // Then it should display the initials of that name
  it('shows initials when there is no image', () => {
    render(<Avatar name="Laura García" />)
    expect(screen.getByText('LG')).toBeInTheDocument()
  })

  // Given an Avatar with an image URL
  // When it is rendered
  // Then it should display the image instead of the initials
  it('shows the image when a src is provided', () => {
    render(<Avatar name="Laura García" src="https://example.com/laura.jpg" />)
    expect(screen.getByRole('img', { name: 'Laura García' })).toBeInTheDocument()
    expect(screen.queryByText('LG')).not.toBeInTheDocument()
  })

  // Given an Avatar marked as online
  // When it is rendered
  // Then the online indicator dot should be present in the DOM
  it('shows the online indicator when online is true', () => {
    const { container } = render(<Avatar name="Laura García" online />)
    expect(container.querySelector('.bg-success')).toBeInTheDocument()
  })
})
