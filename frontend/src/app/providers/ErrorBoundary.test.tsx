import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function BrokenComponent(): never {
  throw new Error('Test error')
}

describe('ErrorBoundary', () => {
  // Given a child component that throws during render
  // When it is wrapped by ErrorBoundary
  // Then the ErrorFallback should be shown instead of the broken component
  it('renders the fallback when a child throws', () => {
    // react-error-boundary logs to console.error — silenced here on purpose
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()

    vi.restoreAllMocks()
  })

  // Given a child component that renders normally
  // When it is wrapped by ErrorBoundary
  // Then the child content should be shown as-is
  it('renders children normally when there is no error', () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('All good')).toBeInTheDocument()
  })
})
