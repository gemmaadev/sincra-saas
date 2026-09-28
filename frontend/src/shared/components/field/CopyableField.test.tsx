import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CopyableField } from './CopyableField'

describe('CopyableField', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  // Given a CopyableField with a label and a value
  // When it is rendered
  // Then both the label and the value should be visible
  it('renders the label and the value', () => {
    render(<CopyableField label="Correo electrónico" value="laura@tienda.com" />)
    expect(screen.getByText('Correo electrónico')).toBeInTheDocument()
    expect(screen.getByText('laura@tienda.com')).toBeInTheDocument()
  })

  // Given a CopyableField
  // When the user clicks the copy button
  // Then the value should be copied to the clipboard and a confirmation shown
  it('copies the value to the clipboard when the copy button is clicked', async () => {
    render(<CopyableField label="Teléfono" value="+34 600 123 456" />)

    fireEvent.click(screen.getByRole('button', { name: 'Copiar teléfono' }))

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('+34 600 123 456')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copiar teléfono' })).toBeInTheDocument()
    })
  })
})
