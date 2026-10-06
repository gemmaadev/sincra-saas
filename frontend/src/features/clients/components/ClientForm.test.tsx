import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { api } from '@/shared/services'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { ClientForm } from './ClientForm'
import type { ClientDetail } from '../types/client.types'

const mockClient: ClientDetail = {
  id: 'client-1',
  name: 'Laura García',
  email: 'laura@ejemplo.test',
  phone: '+34 612 34 56 78',
  channels: ['GMAIL'],
  type: 'particular',
  address: null,
  zone: null,
  latitude: null,
  longitude: null,
  lastContact: null,
  clientTags: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function renderForm(props: Partial<React.ComponentProps<typeof ClientForm>> = {}) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  render(withQueryClient(<ClientForm onSubmit={onSubmit} onCancel={onCancel} {...props} />))
  return { onSubmit, onCancel, user: userEvent.setup() }
}

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn() } }
})

const balmesCandidate = {
  label: 'Carrer de Balmes, Manresa, Bages, Catalunya, Espanya',
  address: 'Carrer de Balmes',
  zone: 'Manresa',
  latitude: 41.7346709,
  longitude: 1.8302486,
}

describe('ClientForm', () => {
  // Given an empty create form
  // When the user submits it
  // Then the name and channel errors should be shown and nothing should be submitted
  it('requires a name and at least one channel', async () => {
    const { onSubmit, user } = renderForm()

    await user.click(screen.getByRole('button', { name: 'Crear cliente' }))

    expect(await screen.findByText('El nombre es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('Indica al menos un canal de contacto')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  // Given a name made only of spaces
  // When the user submits the form
  // Then the name should be rejected as empty
  it('rejects a name with only spaces', async () => {
    const { onSubmit, user } = renderForm()

    await user.type(screen.getByLabelText('Nombre'), '   ')
    await user.click(screen.getByRole('checkbox', { name: 'Gmail' }))
    await user.click(screen.getByRole('button', { name: 'Crear cliente' }))

    expect(await screen.findByText('El nombre es obligatorio')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  // Given an email and a phone with an invalid format
  // When the user submits the form
  // Then both format errors should be shown
  it('validates the email and phone formats', async () => {
    const { onSubmit, user } = renderForm()

    await user.type(screen.getByLabelText('Nombre'), 'Laura')
    await user.type(screen.getByLabelText('Email'), 'no-es-un-email')
    await user.type(screen.getByLabelText('Teléfono'), 'abc')
    await user.click(screen.getByRole('checkbox', { name: 'Gmail' }))
    await user.click(screen.getByRole('button', { name: 'Crear cliente' }))

    expect(await screen.findByText('Introduce un email válido')).toBeInTheDocument()
    expect(screen.getByText('Introduce un teléfono válido')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  // Given valid data with the optional email and phone left empty
  // When the user submits the form
  // Then onSubmit should receive the form values
  it('submits the values when the form is valid', async () => {
    const { onSubmit, user } = renderForm()

    await user.type(screen.getByLabelText('Nombre'), 'Laura García')
    await user.click(screen.getByRole('checkbox', { name: 'Gmail' }))
    await user.click(screen.getByRole('checkbox', { name: 'WhatsApp' }))
    await user.click(screen.getByRole('button', { name: 'Crear cliente' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toEqual({
      name: 'Laura García',
      email: '',
      phone: '',
      channels: ['GMAIL', 'WHATSAPP'],
      type: '',
      zone: '',
      address: '',
    })
  })

  // Given an existing client in edit mode
  // When the user submits without changes
  // Then the form should be valid and the primary action should say "Guardar cambios"
  it('submits an existing client without changes', async () => {
    const { onSubmit, user } = renderForm({ client: mockClient })

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      name: 'Laura García',
      channels: ['GMAIL'],
    })
  })

  // Given an edit form where the only channel is unchecked
  // When the user submits it
  // Then the channel rule should apply in edit mode too
  it('requires at least one channel when editing', async () => {
    const { onSubmit, user } = renderForm({ client: mockClient })

    await user.click(screen.getByRole('checkbox', { name: 'Gmail' }))
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText('Indica al menos un canal de contacto')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  // Given the form
  // When the user clicks Cancelar
  // Then onCancel should be called
  it('calls onCancel when Cancelar is clicked', async () => {
    const { onCancel, user } = renderForm()

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })
  // Given a submit error coming from the parent
  // When the form is rendered
  // Then the error should be announced
  it('shows the submit error', () => {
    renderForm({ submitError: 'Ya existe un cliente con ese email' })

    expect(screen.getByRole('alert')).toHaveTextContent('Ya existe un cliente con ese email')
  })

  // Given the form is being submitted
  // When it is rendered
  // Then the submit button should be disabled and busy
  it('disables the submit button while submitting', () => {
    renderForm({ isSubmitting: true })

    const submitButton = screen.getByRole('button', { name: 'Crear cliente' })
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveAttribute('aria-busy', 'true')
  })

  // Given the form is opened with a location chosen on the map
  // When it is rendered
  // Then the chosen location should be shown, read-only
  it('shows the location chosen on the map', () => {
    renderForm({ initialLocation: { latitude: 41.72889, longitude: 1.82868 } })

    expect(screen.getByText(/Ubicación elegida: 41.72889, 1.82868/)).toBeInTheDocument()
  })

  // Given a create form opened with a location
  // When the user fills it and submits
  // Then the coordinates should be part of the submitted values
  it('submits the coordinates of the chosen location', async () => {
    const { onSubmit, user } = renderForm({
      initialLocation: { latitude: 41.7288, longitude: 1.8286 },
    })

    await user.type(screen.getByLabelText('Nombre'), 'Laura García')
    await user.click(screen.getByRole('checkbox', { name: 'Gmail' }))
    await user.click(screen.getByRole('button', { name: 'Crear cliente' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ latitude: 41.7288, longitude: 1.8286 })
  })

  // Given an existing client is edited
  // When a location is also passed
  // Then it should be ignored, so editing never overwrites the coordinates by accident
  it('ignores the initial location when editing', async () => {
    const { onSubmit, user } = renderForm({
      client: mockClient,
      initialLocation: { latitude: 41.7288, longitude: 1.8286 },
    })

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(screen.queryByText(/Ubicación elegida/)).not.toBeInTheDocument()
    expect(onSubmit.mock.calls[0][0]).not.toHaveProperty('latitude')
  })

  // Given the user searches an address and picks one of the matches
  // When the match is chosen
  // Then the address and zone fields should be filled and the chosen location shown
  it('fills the address, the zone and the location from a search result', async () => {
    vi.mocked(api.get).mockResolvedValue({ candidates: [balmesCandidate] })
    const { user } = renderForm()

    await user.type(screen.getByLabelText('Buscar dirección'), 'Carrer de Balmes 71, Manresa')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    await user.click(await screen.findByRole('button', { name: /Carrer de Balmes, Manresa/ }))

    expect(screen.getByLabelText('Dirección')).toHaveValue('Carrer de Balmes')
    expect(screen.getByLabelText('Zona')).toHaveValue('Manresa')
    expect(screen.getByText(/Ubicación elegida: 41.73467, 1.83025/)).toBeInTheDocument()
  })

  // Given an address was picked from the search
  // When the user fills the rest and submits
  // Then the submitted values should carry the address, the zone and the coordinates
  it('submits the data of the chosen search result', async () => {
    vi.mocked(api.get).mockResolvedValue({ candidates: [balmesCandidate] })
    const { onSubmit, user } = renderForm()

    await user.type(screen.getByLabelText('Buscar dirección'), 'Carrer de Balmes')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    await user.click(await screen.findByRole('button', { name: /Carrer de Balmes, Manresa/ }))
    await user.type(screen.getByLabelText('Nombre'), 'Laura García')
    await user.click(screen.getByRole('checkbox', { name: 'Gmail' }))
    await user.click(screen.getByRole('button', { name: 'Crear cliente' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      address: 'Carrer de Balmes',
      zone: 'Manresa',
      latitude: 41.7346709,
      longitude: 1.8302486,
    })
  })

  // Given an existing client is being edited
  // When the user picks a new address from the search
  // Then the new coordinates should be submitted, since the user chose a new location
  it('sends the new coordinates when a different address is chosen while editing', async () => {
    vi.mocked(api.get).mockResolvedValue({ candidates: [balmesCandidate] })
    const { onSubmit, user } = renderForm({ client: mockClient })

    await user.type(screen.getByLabelText('Buscar dirección'), 'Carrer de Balmes')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    await user.click(await screen.findByRole('button', { name: /Carrer de Balmes, Manresa/ }))
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ latitude: 41.7346709 })
  })
})
