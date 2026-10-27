import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SectionHeader } from './SectionHeader'

describe('SectionHeader', () => {
  // Given an icon and a title
  // When it is rendered
  // Then the title should be visible
  it('renders the title', () => {
    render(<SectionHeader icon={<span />} title="Datos personales" />)
    expect(screen.getByText('Datos personales')).toBeInTheDocument()
  })

  // Given an optional description
  // When it is rendered
  // Then the description should also be visible
  it('renders the description when provided', () => {
    render(<SectionHeader icon={<span />} title="Seguridad" description="Protege tu cuenta" />)
    expect(screen.getByText('Protege tu cuenta')).toBeInTheDocument()
  })

  // Given no description
  // When it is rendered
  // Then no description text should be present
  it('renders no description when none is provided', () => {
    const { container } = render(<SectionHeader icon={<span />} title="Datos" />)
    expect(container.querySelector('p')).not.toBeInTheDocument()
  })

  // Given an action element
  // When it is rendered
  // Then the action should be visible alongside the title
  it('renders the action when provided', () => {
    render(<SectionHeader icon={<span />} title="Datos" action={<button>Editar</button>} />)
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
  })
})
