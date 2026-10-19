import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { BusinessInfoCard } from './BusinessInfoCard'
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
  render(withQueryClient(<BusinessInfoCard business={mockBusiness} canEdit={canEdit} />))
  return { user: userEvent.setup() }
}

describe('BusinessInfoCard', () => {
  beforeEach(() => {
    vi.mocked(api.patch).mockReset()
    vi.mocked(notifySuccess).mockReset()
  })

  // Given an admin viewing the business info
  // When the card renders
  // Then the "Editar" button should be visible
  it('shows the Editar button for an admin', () => {
    renderCard(true)
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
  })

  // Given a non-admin viewing the business info
  // When the card renders
  // Then no "Editar" button should be shown
  it('hides the Editar button for a non-admin', () => {
    renderCard(false)
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
  })

  // Given the admin clicks "Editar" and changes the name
  // When they submit the form
  // Then it should PATCH the business, show a success toast and exit edit mode
  it('saves changes and exits edit mode', async () => {
    vi.mocked(api.patch).mockResolvedValue({ business: { ...mockBusiness, name: 'Nuevo nombre' } })
    const { user } = renderCard()

    await user.click(screen.getByRole('button', { name: 'Editar' }))
    const nameInput = screen.getByLabelText('Nombre comercial')
    await user.clear(nameInput)
    await user.type(nameInput, 'Nuevo nombre')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByRole('button', { name: 'Editar' })).toBeInTheDocument()
    expect(api.patch).toHaveBeenCalledWith(
      '/settings/business',
      expect.objectContaining({ name: 'Nuevo nombre' }),
    )
    expect(notifySuccess).toHaveBeenCalledWith('Cambios guardados')
  })

  // Given the admin clicks "Editar"
  // When they click "Cancelar" without submitting
  // Then it should exit edit mode without calling the API
  it('discards changes on cancel', async () => {
    const { user } = renderCard()

    await user.click(screen.getByRole('button', { name: 'Editar' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
    expect(api.patch).not.toHaveBeenCalled()
  })

  // Given the backend rejects the save
  // When the admin submits the form
  // Then the error message should be shown and the form should stay open
  it('shows the backend error and stays in edit mode when saving fails', async () => {
    vi.mocked(api.patch).mockRejectedValue(
      new ApiError('No se ha podido actualizar', 400, 'INVALID_DATA'),
    )
    const { user } = renderCard()

    await user.click(screen.getByRole('button', { name: 'Editar' }))
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText('No se ha podido actualizar')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument()
  })

  // Given the name field is cleared
  // When the admin tries to submit
  // Then it should show a validation error and not call the API
  it('does not call the API when the name is empty', async () => {
    const { user } = renderCard()

    await user.click(screen.getByRole('button', { name: 'Editar' }))
    await user.clear(screen.getByLabelText('Nombre comercial'))
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText('El nombre es obligatorio')).toBeInTheDocument()
    expect(api.patch).not.toHaveBeenCalled()
  })
})
