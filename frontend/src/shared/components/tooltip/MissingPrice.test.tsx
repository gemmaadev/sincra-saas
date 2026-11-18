import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect } from 'vitest'
import { MissingPrice } from './MissingPrice'

describe('MissingPrice', () => {
  // Given a price that was not provided
  // When the indicator is rendered
  // Then it should show an alert icon labelled "Precio aún no definido"
  it('shows an alert icon labelled as a price that is not defined yet', () => {
    render(
      <MantineProvider>
        <MissingPrice />
      </MantineProvider>,
    )

    expect(screen.getByLabelText('Precio aún no definido')).toBeInTheDocument()
  })

  // Given a count of orders that lack a price
  // When the indicator is rendered with that label
  // Then the tooltip text should say how many prices are missing
  it('can label how many orders lack a price', () => {
    render(
      <MantineProvider>
        <MissingPrice label="Faltan precios en 2 pedidos" />
      </MantineProvider>,
    )

    expect(screen.getByLabelText('Faltan precios en 2 pedidos')).toBeInTheDocument()
  })
})
