import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SiGmail, SiWhatsapp } from 'react-icons/si'
import { StatsChannelPerformance } from './StatsChannelPerformance'

describe('StatsChannelPerformance', () => {
  // Given no rows
  // When the block is rendered
  // Then it should show an empty message
  it('shows an empty message when there are no rows', () => {
    render(<StatsChannelPerformance rows={[]} />)

    expect(screen.getByText('Rendimiento por canal')).toBeInTheDocument()
    expect(
      screen.getByText('Todavía no hay pedidos entregados en este periodo.'),
    ).toBeInTheDocument()
  })

  // Given rows with revenue
  // When the block is rendered
  // Then each channel's label and formatted revenue should be shown
  it('shows each channel label and its formatted revenue', () => {
    render(
      <StatsChannelPerformance
        rows={[
          {
            label: 'Gmail',
            icon: SiGmail,
            colorClassName: 'text-gmail',
            revenue: 300,
            averageTicket: 100,
            percentage: 75,
          },
          {
            label: 'WhatsApp',
            icon: SiWhatsapp,
            colorClassName: 'text-whatsapp',
            revenue: 100,
            averageTicket: 50,
            percentage: 25,
          },
        ]}
      />,
    )

    expect(screen.getByText('Gmail')).toBeInTheDocument()
    expect(screen.getByText('300,00 €')).toBeInTheDocument()
    expect(screen.getByText('WhatsApp')).toBeInTheDocument()
    expect(screen.getByText('100,00 €')).toBeInTheDocument()
  })
})
