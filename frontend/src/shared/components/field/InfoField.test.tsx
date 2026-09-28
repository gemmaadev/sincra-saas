import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { InfoField } from './InfoField'

describe('InfoField', () => {
  // Given an InfoField with a label and a value
  // When it is rendered
  // Then both the label and the value should be visible
  it('renders the label and the value', () => {
    render(<InfoField label="Rol" value="Propietario/a" />)
    expect(screen.getByText('Rol')).toBeInTheDocument()
    expect(screen.getByText('Propietario/a')).toBeInTheDocument()
  })
})
