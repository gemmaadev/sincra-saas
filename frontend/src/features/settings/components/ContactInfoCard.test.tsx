import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { ContactInfoCard } from './ContactInfoCard'
import type { BusinessSettings } from '../types/settings.types'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { patch: vi.fn() } }
})

vi.mock('@/shared/utils/notify', () => ({ notifySuccess: vi.fn() }))

const mockBusiness: BusinessSettings = {
  id: 'biz-1',
  name: 'Tienda de Laura',
  sector: 'ecommerce',
  description: null,
  country: 'ES',
  phone: null,
  address: null,
  schedule: null,
  nif: null,
  email: null,
  timezone: 'Europe/Madrid',
  language: 'es',
}

function renderCard(canEdit = true) {
  render(withQueryClient(<ContactInfoCard business={mockBusiness} canEdit={canEdit} />))
  return { user: userEvent.setup() }
}

describe('ContactInfoCard', () => {
  beforeEach(() => {
    vi.mocked(api.patch).mockReset()
    vi.mocked(notifySuccess).mockReset()
  })

  // Given an admin viewing contact info with no email set
  // When the card renders
  // Then each row should show its own "Editar" control
  it('shows an independent Editar control per row for an admin', () => {
    renderCard(true)
    expect(screen.getByRole('button', { name: 'Editar email principal' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar teléfono de contacto' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar horario de atención' })).toBeInTheDocument()
  })

  // Given a non-admin viewing contact info
  // When the card renders
  // Then no row should show an "Editar" control
  it('hides every Editar control for a non-admin', () => {
    renderCard(false)
    expect(screen.queryByRole('button', { name: /Editar/ })).not.toBeInTheDocument()
  })

  // Given the admin edits only the email row
  // When they submit it
  // Then it should PATCH only the email field, independent of the other rows
  it('saves only the edited field', async () => {
    vi.mocked(api.patch).mockResolvedValue({ business: { ...mockBusiness, email: 'nuevo@tienda.com' } })
    const { user } = renderCard()

    await user.click(screen.getByRole('button', { name: 'Editar email principal' }))
    await user.type(screen.getByLabelText('Email principal'), 'nuevo@tienda.com')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByRole('button', { name: 'Editar email principal' })).toBeInTheDocument()
    expect(api.patch).toHaveBeenCalledWith('/settings/business', { email: 'nuevo@tienda.com' })
    expect(notifySuccess).toHaveBeenCalledWith('Cambios guardados')
  })

  // Given an invalid email
  // When the admin tries to save it
  // Then it should show a validation error and not call the API
  it('validates the email format before saving', async () => {
    const { user } = renderCard()

    await user.click(screen.getByRole('button', { name: 'Editar email principal' }))
    await user.type(screen.getByLabelText('Email principal'), 'no-es-un-email')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('Introduce un email válido')).toBeInTheDocument()
    expect(api.patch).not.toHaveBeenCalled()
  })

  // Given the backend rejects the save
  // When the admin submits a row
  // Then the error should be shown for that row and it should stay in edit mode
  it('shows the backend error and stays in edit mode when saving fails', async () => {
    vi.mocked(api.patch).mockRejectedValue(
      new ApiError('No se ha podido guardar', 400, 'INVALID_DATA'),
    )
    const { user } = renderCard()

    await user.click(screen.getByRole('button', { name: 'Editar teléfono de contacto' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('No se ha podido guardar')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })

  // Given the admin opens the edit form for the phone row
  // When they click "Cancelar"
  // Then it should exit edit mode without calling the API
  it('discards changes on cancel', async () => {
    const { user } = renderCard()

    await user.click(screen.getByRole('button', { name: 'Editar teléfono de contacto' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.getByRole('button', { name: 'Editar teléfono de contacto' })).toBeInTheDocument()
    expect(api.patch).not.toHaveBeenCalled()
  })
})
