import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect } from 'vitest'
import { ordersTableColumns } from './ordersTableColumns'
import type { Order, OrderTag } from '../types/order.types'

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
  aiGenerated: false,
  orderTags: [],
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

const aiTag: OrderTag = {
  id: 'assignment-1',
  tagId: 'tag-1',
  aiGenerated: true,
  tag: { id: 'tag-1', name: 'Pedido', color: '#30a46c', priority: 'LOW', isDefault: false },
}

const manualTag: OrderTag = {
  id: 'assignment-2',
  tagId: 'tag-2',
  aiGenerated: false,
  tag: { id: 'tag-2', name: 'Consulta', color: '#f5a524', priority: 'LOW', isDefault: false },
}

function renderTags(orderTags: OrderTag[]) {
  const column = ordersTableColumns.find((entry) => entry.key === 'tags')
  if (!column) throw new Error('missing tags column')

  render(<MantineProvider>{column.render({ ...order, orderTags })}</MantineProvider>)
}

describe('ordersTableColumns tags', () => {
  // Given an order with one tag the AI assigned and one a person assigned
  // When the Etiquetas cell is rendered
  // Then only the AI tag should carry the suggestion mark
  it('marks only the tags the AI suggested', () => {
    renderTags([aiTag, manualTag])

    expect(screen.getByText('Pedido')).toContainElement(
      screen.getByRole('img', { name: 'Sugerido por IA' }),
    )
    expect(
      screen.getByText('Consulta').querySelector('[aria-label="Sugerido por IA"]'),
    ).not.toBeInTheDocument()
  })

  // Given an order with no tags
  // When the Etiquetas cell is rendered
  // Then it should show a dash
  it('shows a dash when the order has no tags', () => {
    renderTags([])

    expect(screen.getByText('—')).toBeInTheDocument()
  })
})

function renderNumber(aiGenerated: boolean) {
  const column = ordersTableColumns.find((entry) => entry.key === 'number')
  if (!column) throw new Error('missing number column')

  render(<MantineProvider>{column.render({ ...order, aiGenerated })}</MantineProvider>)
}

describe('ordersTableColumns number', () => {
  // Given an order the AI created
  // When the Pedido cell is rendered
  // Then the AI star sits next to the order number
  it('marks an order the AI created', () => {
    renderNumber(true)

    expect(screen.getByText('#7')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Sugerido por IA' })).toBeInTheDocument()
  })

  // Given an order a person created
  // When the Pedido cell is rendered
  // Then there is no AI star next to the number
  it('does not mark an order a person created', () => {
    renderNumber(false)

    expect(screen.getByText('#7')).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'Sugerido por IA' })).not.toBeInTheDocument()
  })
})
