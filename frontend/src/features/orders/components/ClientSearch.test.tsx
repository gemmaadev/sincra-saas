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
  const onFormSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())
  render(
    withQueryClient(
      <form onSubmit={onFormSubmit}>
        <ClientSearch onSelect={onSelect} />
      </form>,
    ),
  )
  return { onSelect, onFormSubmit, user: userEvent.setup() }
}

describe('ClientSearch', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
  })

  // Given nothing or a single character typed
  // When the search is rendered
  // Then the "Buscar" button should be disabled
  it('disables the search until there are two characters', async () => {
    const { user } = renderSearch()

    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled()

    await user.type(screen.getByLabelText('Buscar cliente'), 'L')
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled()

    await user.type(screen.getByLabelText('Buscar cliente'), 'a')
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeEnabled()
  })

  // Given a name typed
  // When the user clicks "Buscar"
  // Then the matching clients should be listed
  it('lists the matches of the search', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [client] })
    const { user } = renderSearch()

    await user.type(screen.getByLabelText('Buscar cliente'), 'Laura')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(await screen.findByText('Laura García')).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/clients?search=Laura&limit=5')
  })

  // Given the search is inside a form
  // When the user presses Enter in the search box
  // Then it should search without submitting the surrounding form
  it('searches on Enter without submitting the surrounding form', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [client] })
    const { onFormSubmit, user } = renderSearch()

    await user.type(screen.getByLabelText('Buscar cliente'), 'Laura{Enter}')

    expect(await screen.findByText('Laura García')).toBeInTheDocument()
    expect(onFormSubmit).not.toHaveBeenCalled()
  })

  // Given the matches are listed
  // When the user picks one
  // Then onSelect should receive it and the list and the text should be cleared
  it('calls onSelect with the chosen client and clears the search', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [client] })
    const { onSelect, user } = renderSearch()

    await user.type(screen.getByLabelText('Buscar cliente'), 'Laura')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    await user.click(await screen.findByRole('button', { name: /Laura García/ }))

    expect(onSelect).toHaveBeenCalledWith(client)
    expect(screen.queryByText('Laura García')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Buscar cliente')).toHaveValue('')
  })

  // Given the search finds nothing
  // When the search finishes
  // Then a message should say so
  it('explains when there are no matches', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })
    const { user } = renderSearch()

    await user.type(screen.getByLabelText('Buscar cliente'), 'Zzz')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))

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
    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(
      await screen.findByText('No se ha podido buscar el cliente. Inténtalo de nuevo.'),
    ).toBeInTheDocument()
  })
})
