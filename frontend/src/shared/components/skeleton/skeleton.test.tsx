import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Skeleton } from './Skeleton'

describe('Skeleton', () => {
  // Given a Skeleton
  // When it is rendered
  // Then it should be hidden from assistive technology, since it carries no real content
  it('is hidden from screen readers', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  // Given a Skeleton with a custom className
  // When it is rendered
  // Then the custom classes should be applied alongside the default ones
  it('applies the given className', () => {
    const { container } = render(<Skeleton className="h-4 w-20" />)
    expect(container.firstChild).toHaveClass('h-4', 'w-20', 'animate-pulse')
  })
})
