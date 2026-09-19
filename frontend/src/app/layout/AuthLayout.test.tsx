import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AuthLayout } from './AuthLayout'

describe('AuthLayout', () => {
  // Given an AuthLayout with a left panel and children
  // When it is rendered
  // Then both should be visible
  it('renders leftPanel and children', () => {
    render(
      <AuthLayout leftPanel={<p>Panel content</p>}>
        <p>Form content</p>
      </AuthLayout>,
    )
    expect(screen.getByText('Panel content')).toBeInTheDocument()
    expect(screen.getByText('Form content')).toBeInTheDocument()
  })
})
