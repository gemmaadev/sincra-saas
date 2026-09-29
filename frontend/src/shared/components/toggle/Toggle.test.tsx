import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Toggle } from './Toggle'

describe('Toggle', () => {
  // Given a Toggle that is checked
  // When it is rendered
  // Then it should expose its checked state via aria-checked
  it('reflects the checked state', () => {
    render(<Toggle checked label="Nuevos mensajes" onChange={vi.fn()} />)
    expect(screen.getByRole('switch', { name: 'Nuevos mensajes' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  // Given a Toggle that is unchecked
  // When it is rendered
  // Then it should expose that via aria-checked
  it('reflects the unchecked state', () => {
    render(<Toggle checked={false} label="Resumen semanal" onChange={vi.fn()} />)
    expect(screen.getByRole('switch', { name: 'Resumen semanal' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  // Given a Toggle
  // When the user clicks it
  // Then onChange should fire
  it('calls onChange when clicked', () => {
    const handleChange = vi.fn()
    render(<Toggle checked={false} label="Pedidos" onChange={handleChange} />)

    fireEvent.click(screen.getByRole('switch', { name: 'Pedidos' }))

    expect(handleChange).toHaveBeenCalledOnce()
  })
})
