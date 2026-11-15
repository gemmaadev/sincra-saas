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
})
