import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
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
  render(<ClientForm onSubmit={onSubmit} onCancel={onCancel} {...props} />)
  return { onSubmit, onCancel, user: userEvent.setup() }
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
})
