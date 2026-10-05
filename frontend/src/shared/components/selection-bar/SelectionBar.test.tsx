import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SelectionBar } from './SelectionBar'

describe('SelectionBar', () => {
  // Given a selection label and an action
  // When the bar is rendered
  // Then the label and the action should be visible inside a labelled region
  it('shows the label and the actions', () => {
    render(
      <SelectionBar label="3 clientes seleccionados" onClear={vi.fn()}>
        <button type="button">Eliminar</button>
      </SelectionBar>,
    )

    const region = screen.getByRole('region', { name: 'Acciones de selección' })
    expect(region).toHaveTextContent('3 clientes seleccionados')
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument()
  })

  // Given the bar is shown
  // When the user clicks Deseleccionar
  // Then onClear should be called
  it('calls onClear when the selection is cleared', () => {
    const onClear = vi.fn()
    render(
      <SelectionBar label="1 cliente seleccionado" onClear={onClear}>
        <span />
      </SelectionBar>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Deseleccionar' }))

    expect(onClear).toHaveBeenCalledTimes(1)
  })

  // Given the selection count changes
  // When the label is rendered
  // Then it should be announced to assistive technology as a status
  it('announces the label as a status', () => {
    render(
      <SelectionBar label="2 clientes seleccionados" onClear={vi.fn()}>
        <span />
      </SelectionBar>,
    )

    expect(screen.getByRole('status')).toHaveTextContent('2 clientes seleccionados')
  })
})
