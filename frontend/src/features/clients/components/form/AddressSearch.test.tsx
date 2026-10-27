import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '@/shared/services'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { AddressSearch } from './AddressSearch'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn() } }
})

const candidate = {
  label: 'Carrer de Balmes, Manresa, Bages, Catalunya, Espanya',
  address: 'Carrer de Balmes',
  zone: 'Manresa',
  latitude: 41.7346709,
  longitude: 1.8302486,
}

function renderSearch() {
  const onSelect = vi.fn()
  const onFormSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())
  render(
    withQueryClient(
      <form onSubmit={onFormSubmit}>
        <AddressSearch onSelect={onSelect} />
      </form>,
    ),
  )
  return { onSelect, onFormSubmit, user: userEvent.setup() }
}

describe('AddressSearch', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
  })

  // Given nothing or fewer than three characters typed
  // When the search is rendered
  // Then the "Buscar" button should be disabled
  it('disables the search until there are three characters', async () => {
    const { user } = renderSearch()

    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled()

    await user.type(screen.getByLabelText('Buscar dirección'), 'ab')
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled()

    await user.type(screen.getByLabelText('Buscar dirección'), 'c')
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeEnabled()
  })

  // Given an address typed
  // When the user clicks "Buscar"
  // Then the matches should be listed
  it('lists the matches of the search', async () => {
    vi.mocked(api.get).mockResolvedValue({ candidates: [candidate] })
    const { user } = renderSearch()

    await user.type(screen.getByLabelText('Buscar dirección'), 'Carrer de Balmes')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(await screen.findByText(candidate.label)).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/clients/address-search?q=Carrer%20de%20Balmes')
  })

  // Given the search is inside a form
  // When the user presses Enter in the search box
  // Then it should search without submitting the surrounding form
  it('searches on Enter without submitting the surrounding form', async () => {
    vi.mocked(api.get).mockResolvedValue({ candidates: [candidate] })
    const { onFormSubmit, user } = renderSearch()

    await user.type(screen.getByLabelText('Buscar dirección'), 'Carrer de Balmes{Enter}')

    expect(await screen.findByText(candidate.label)).toBeInTheDocument()
    expect(onFormSubmit).not.toHaveBeenCalled()
  })

  // Given the matches are listed
  // When the user picks one
  // Then onSelect should receive it and the list and the text should be cleared
  it('calls onSelect with the chosen match and clears the search', async () => {
    vi.mocked(api.get).mockResolvedValue({ candidates: [candidate] })
    const { onSelect, user } = renderSearch()

    await user.type(screen.getByLabelText('Buscar dirección'), 'Carrer de Balmes')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    await user.click(await screen.findByRole('button', { name: candidate.label }))

    expect(onSelect).toHaveBeenCalledWith(candidate)
    expect(screen.queryByText(candidate.label)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Buscar dirección')).toHaveValue('')
  })

  // Given the search finds nothing
  // When the search finishes
  // Then a message should suggest another name or typing it by hand
  it('explains what to do when there are no matches', async () => {
    vi.mocked(api.get).mockResolvedValue({ candidates: [] })
    const { user } = renderSearch()

    await user.type(screen.getByLabelText('Buscar dirección'), 'Carrer Jaume Balmes')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(await screen.findByText(/No se han encontrado coincidencias/)).toBeInTheDocument()
  })

  // Given the backend rejects the search
  // When the search finishes
  // Then its message should be shown
  it('shows the error of the backend', async () => {
    vi.mocked(api.get).mockRejectedValue(
      new ApiError(
        'No se ha podido buscar la dirección. Inténtalo de nuevo.',
        502,
        'GEOCODING_UNAVAILABLE',
      ),
    )
    const { user } = renderSearch()

    await user.type(screen.getByLabelText('Buscar dirección'), 'Rambla Nova')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(
      await screen.findByText('No se ha podido buscar la dirección. Inténtalo de nuevo.'),
    ).toBeInTheDocument()
  })
})
