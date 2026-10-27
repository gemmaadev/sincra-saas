import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '@/shared/services'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { CalendarOrderSearch } from './CalendarOrderSearch'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn() } }
})

const orderRow = { id: 'order-1', number: 42, client: { name: 'Laura García' } }

function renderSearch() {
  const onSelect = vi.fn()
  render(withQueryClient(<CalendarOrderSearch onSelect={onSelect} />))
  return { onSelect, user: userEvent.setup() }
}

describe('CalendarOrderSearch', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
  })

  // Given fewer than two characters typed
  // When the user types
  // Then nothing should be requested
  it('does not search until there are two characters', async () => {
    const { user } = renderSearch()

    await user.type(screen.getByLabelText('Buscar pedido'), '4')

    expect(api.get).not.toHaveBeenCalled()
  })

  // Given a number typed
  // When the search resolves
  // Then the matching order should be listed as "Pedido #N - cliente"
  it('lists the matching orders', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [orderRow] })
    const { user } = renderSearch()

    await user.type(screen.getByLabelText('Buscar pedido'), '42')

    expect(await screen.findByText('Pedido #42 - Laura García')).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/orders?search=42&limit=5')
  })

  // Given the matches are listed
  // When the user picks one
  // Then onSelect should receive it and the search text should be cleared
  it('calls onSelect with the chosen order and clears the search', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [orderRow] })
    const { onSelect, user } = renderSearch()

    await user.type(screen.getByLabelText('Buscar pedido'), '42')
    await user.click(await screen.findByRole('button', { name: /Pedido #42/ }))

    expect(onSelect).toHaveBeenCalledWith({ id: 'order-1', number: 42, clientName: 'Laura García' })
    expect(screen.getByLabelText('Buscar pedido')).toHaveValue('')
  })

  // Given the search finds nothing
  // When the search finishes
  // Then a message should say so
  it('explains when there are no matches', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })
    const { user } = renderSearch()

    await user.type(screen.getByLabelText('Buscar pedido'), '999')

    expect(
      await screen.findByText('No se han encontrado pedidos con ese número o cliente.'),
    ).toBeInTheDocument()
  })

  // Given the backend rejects the search
  // When the search finishes
  // Then its message should be shown
  it('shows the error of the backend', async () => {
    vi.mocked(api.get).mockRejectedValue(
      new ApiError('No se ha podido buscar el pedido. Inténtalo de nuevo.', 500, 'SERVER_ERROR'),
    )
    const { user } = renderSearch()

    await user.type(screen.getByLabelText('Buscar pedido'), '42')

    expect(
      await screen.findByText('No se ha podido buscar el pedido. Inténtalo de nuevo.'),
    ).toBeInTheDocument()
  })
})
