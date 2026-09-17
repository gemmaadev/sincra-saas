import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card } from './Card'

describe('Card', () => {
  // Given a Card with children content
  // When it is rendered
  // Then the children should be visible inside it
  it('renders its children', () => {
    render(
      <Card>
        <p>Contenido de la tarjeta</p>
      </Card>,
    )
    expect(screen.getByText('Contenido de la tarjeta')).toBeInTheDocument()
  })
})
