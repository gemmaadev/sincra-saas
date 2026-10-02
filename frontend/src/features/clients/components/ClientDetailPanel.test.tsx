import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ClientDetailPanel } from './ClientDetailPanel'

describe('ClientDetailPanel', () => {
  // Given a client id
  // When ClientDetailPanel is rendered
  // Then it should show that id
  it('shows the given client id', () => {
    render(<ClientDetailPanel id="client-42" />)
    expect(screen.getByText(/client-42/)).toBeInTheDocument()
  })
})
