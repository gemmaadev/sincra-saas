import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Pencil } from 'lucide-react'
import { IconButton } from './IconButton'

describe('IconButton', () => {
  // Given an IconButton with a label
  // When it is rendered
  // Then it should be reachable by that accessible name and show it as a tooltip
  it('exposes the label as the accessible name and as a title tooltip', () => {
    render(<IconButton icon={Pencil} label="Editar cliente" variant="secondary" />)

    const button = screen.getByRole('button', { name: 'Editar cliente' })
    expect(button).toHaveAttribute('title', 'Editar cliente')
  })

  // Given an IconButton
  // When it is rendered
  // Then its icon should be hidden from screen readers (the label already names the button)
  it('hides the icon from screen readers', () => {
    const { container } = render(
      <IconButton icon={Pencil} label="Editar cliente" variant="secondary" />,
    )

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  // Given an IconButton with an onClick handler
  // When the user clicks it
  // Then the handler should be called once
  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<IconButton icon={Pencil} label="Editar cliente" variant="secondary" onClick={onClick} />)

    screen.getByRole('button').click()

    expect(onClick).toHaveBeenCalledOnce()
  })

  // Given an iconClassName (e.g. to force a red delete icon on a "text" variant button,
  // which can't reliably win against the variant's own color class via cascade order)
  // When the IconButton is rendered
  // Then that class should land on the icon itself, not just the button
  it('applies iconClassName to the icon', () => {
    const { container } = render(
      <IconButton icon={Pencil} label="Eliminar cliente" variant="text" iconClassName="text-error" />,
    )

    expect(container.querySelector('svg')).toHaveClass('text-error')
  })
})
