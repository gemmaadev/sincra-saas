import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect } from 'vitest'
import NotFoundPage from './NotFoundPage'

describe('NotFoundPage', () => {
  // Given the NotFoundPage
  // When it is rendered
  // Then the 404 message should be visible
  it('renders the 404 message', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('Error 404')).toBeInTheDocument()
  })

  // Given the NotFoundPage
  // When the user clicks "Volver al inicio"
  // Then it should be a clickable button that exists in the document
  it('renders a working back-to-home button', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    )
    const button = screen.getByRole('button', { name: /Volver al inicio/ })
    expect(button).toBeInTheDocument()
    fireEvent.click(button)
  })
})
