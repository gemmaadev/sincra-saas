import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect } from 'vitest'
import { MapKpiCards } from './MapKpiCards'

function renderCards(kpis: React.ComponentProps<typeof MapKpiCards>['kpis']) {
  render(
    <MantineProvider>
      <MapKpiCards kpis={kpis} />
    </MantineProvider>,
  )
}

describe('MapKpiCards', () => {
  // Given KPIs with a top zone
  // When the cards are rendered
  // Then each KPI should show its label and value
  it('shows the four KPIs', () => {
    renderCards({
      clientsOnMap: 12,
      activeZones: 5,
      topZone: 'Barcelona',
      approximateClients: 2,
    })

    expect(screen.getByText('Clientes en el mapa')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('Zonas activas')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Zona principal')).toBeInTheDocument()
    expect(screen.getByText('Barcelona')).toBeInTheDocument()
    expect(screen.getByText('Sin ubicación exacta')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  // Given there is no top zone
  // When the cards are rendered
  // Then the top zone should show a dash
  it('shows a dash when there is no top zone', () => {
    renderCards({ clientsOnMap: 0, activeZones: 0, topZone: null, approximateClients: 0 })

    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
