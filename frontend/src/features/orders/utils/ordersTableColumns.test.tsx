import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect } from 'vitest'
import { ordersTableColumns } from './ordersTableColumns'
import type { Order } from '../types/order.types'

const order: Order = {
  id: 'order-1',
  number: 7,
  status: 'PENDING',
  channel: null,
  kind: 'PRODUCT',
  price: '15.00',
  expectedDate: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  client: { id: 'client-1', name: 'Laura García' },
  description: null,
}

function renderPrice(price: string | null) {
  const column = ordersTableColumns.find((entry) => entry.key === 'price')
  if (!column) throw new Error('missing price column')

  render(<MantineProvider>{column.render({ ...order, price })}</MantineProvider>)
}

describe('ordersTableColumns price', () => {
  // Given an order with a price
  // When the price cell is rendered
  // Then it should show that amount
  it('shows the formatted price', () => {
    renderPrice('15.00')

    expect(screen.getByText('15,00 €')).toBeInTheDocument()
  })

  // Given an order with no price
  // When the price cell is rendered
  // Then it should show a missing-price mark and no invented amount
  it('shows a missing-price mark when the order has no price', () => {
    renderPrice(null)

    expect(screen.getByLabelText('Precio aún no definido')).toBeInTheDocument()
    expect(screen.queryByText('0,00 €')).not.toBeInTheDocument()
  })
})
