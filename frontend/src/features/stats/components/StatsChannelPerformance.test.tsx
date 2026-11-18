import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect } from 'vitest'
import { SiGmail, SiWhatsapp } from 'react-icons/si'
import { StatsChannelPerformance } from './StatsChannelPerformance'

function renderPerformance(props: React.ComponentProps<typeof StatsChannelPerformance>) {
  return render(
    <MantineProvider>
      <StatsChannelPerformance {...props} />
    </MantineProvider>,
  )
}

describe('StatsChannelPerformance', () => {
  // Given no rows
  // When the block is rendered
  // Then it should show an empty message
  it('shows an empty message when there are no rows', () => {
    const { container } = renderPerformance({ rows: [] })

    expect(screen.getByText('Rendimiento por canal')).toBeInTheDocument()
    expect(
      screen.getByText('Todavía no hay pedidos entregados en este periodo.'),
    ).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  // Given rows with revenue
  // When the block is rendered
  // Then each channel's label and formatted revenue should be shown
  it('shows each channel label and its formatted revenue', () => {
    renderPerformance({
      rows: [
        {
          label: 'Gmail',
          icon: SiGmail,
          colorClassName: 'text-gmail',
          revenue: 300,
          averageTicket: 100,
          percentage: 75,
          hasPriceData: true,
          missingPriceCount: 0,
        },
        {
          label: 'WhatsApp',
          icon: SiWhatsapp,
          colorClassName: 'text-whatsapp',
          revenue: 100,
          averageTicket: 50,
          percentage: 25,
          hasPriceData: true,
          missingPriceCount: 0,
        },
      ],
    })

    expect(screen.getByText('Gmail')).toBeInTheDocument()
    expect(screen.getByText('300,00 €')).toBeInTheDocument()
    expect(screen.getByText('WhatsApp')).toBeInTheDocument()
    expect(screen.getByText('100,00 €')).toBeInTheDocument()
  })

  // Given a channel with no known prices
  // When the block is rendered
  // Then the zero revenue should be marked as having no price data
  it('marks zero revenue when the channel has no price data', () => {
    renderPerformance({
      rows: [
        {
          label: 'Gmail',
          icon: SiGmail,
          colorClassName: 'text-gmail',
          revenue: 0,
          averageTicket: 0,
          percentage: 0,
          hasPriceData: false,
          missingPriceCount: 2,
        },
      ],
    })

    expect(screen.getByText('0,00 €')).toBeInTheDocument()
    expect(screen.getByLabelText('Sin datos de precio en ningún pedido')).toBeInTheDocument()
    expect(screen.queryByLabelText(/Faltan precios/)).not.toBeInTheDocument()
  })

  // Given a channel where only some orders have a price
  // When the block is rendered
  // Then the revenue should show how many prices are missing
  it('shows how many prices are missing when the channel still has some', () => {
    renderPerformance({
      rows: [
        {
          label: 'Gmail',
          icon: SiGmail,
          colorClassName: 'text-gmail',
          revenue: 100,
          averageTicket: 100,
          percentage: 100,
          hasPriceData: true,
          missingPriceCount: 2,
        },
      ],
    })

    expect(screen.getByText('100,00 €')).toBeInTheDocument()
    expect(screen.getByLabelText('Faltan precios en 2 pedidos')).toBeInTheDocument()
    expect(screen.queryByLabelText('Sin datos de precio en ningún pedido')).not.toBeInTheDocument()
  })
})
