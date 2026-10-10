import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '@/shared/services'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { ClientSearch } from './ClientSearch'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn() } }
})

const client = { id: 'client-1', name: 'Laura García', email: 'laura@ejemplo.test', phone: null }

function renderSearch() {
  const onSelect = vi.fn()
  render(withQueryClient(<ClientSearch onSelect={onSelect} />))
  return { onSelect, user: userEvent.setup() }
}

describe('ClientSearch', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
  })

  // Given fewer than two characters typed
  // When the user types
  // Then nothing should be requested
  it('does not search until there are two characters', async () => {
    const { user } = renderSearch()

    await user.type(screen.getByLabelText('Buscar cliente'), 'L')

    expect(api.get).not.toHaveBeenCalled()
  })

  // Given a name typed
  // When the user stops typing
  // Then the matching clients should be listed automatically, without clicking anything
  it('searches live as the user types, with no search button', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [client] })
    const { user } = renderSearch()

    expect(screen.queryByRole('button', { name: 'Buscar' })).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('Buscar cliente'), 'Laura')

    expect(await screen.findByText('Laura García')).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/clients?search=Laura&limit=5')
  })

  // Given the matches are listed
  // When the user picks one
  // Then onSelect should receive it and the search text should be cleared
  it('calls onSelect with the chosen client and clears the search', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [client] })
    const { onSelect, user } = renderSearch()

    await user.type(screen.getByLabelText('Buscar cliente'), 'Laura')
    await user.click(await screen.findByRole('button', { name: /Laura García/ }))

    expect(onSelect).toHaveBeenCalledWith(client)
    expect(screen.getByLabelText('Buscar cliente')).toHaveValue('')
  })

  // Given the search finds nothing
  // When the search finishes
  // Then a message should say so
  it('explains when there are no matches', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })
    const { user } = renderSearch()

    await user.type(screen.getByLabelText('Buscar cliente'), 'Zzz')

    expect(
      await screen.findByText('No se han encontrado clientes con ese nombre, email o teléfono.'),
    ).toBeInTheDocument()
  })

  // Given the backend rejects the search
  // When the search finishes
  // Then its message should be shown
  it('shows the error of the backend', async () => {
    vi.mocked(api.get).mockRejectedValue(
      new ApiError('No se ha podido buscar el cliente. Inténtalo de nuevo.', 500, 'SERVER_ERROR'),
    )
    const { user } = renderSearch()

    await user.type(screen.getByLabelText('Buscar cliente'), 'Laura')

    expect(
      await screen.findByText('No se ha podido buscar el cliente. Inténtalo de nuevo.'),
    ).toBeInTheDocument()
  })
})
