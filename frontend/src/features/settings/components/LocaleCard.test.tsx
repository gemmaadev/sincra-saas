import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { LocaleCard } from './LocaleCard'
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
  render(withQueryClient(<LocaleCard business={mockBusiness} canEdit={canEdit} />))
  return { user: userEvent.setup() }
}

describe('LocaleCard', () => {
  beforeEach(() => {
    vi.mocked(api.patch).mockReset().mockResolvedValue({ business: mockBusiness })
    vi.mocked(notifySuccess).mockReset()
  })

  // Given an admin changes the timezone select
  // When the new value is picked
  // Then it should PATCH just the timezone field, without a separate save step
  it('saves the timezone as soon as it changes', async () => {
    const { user } = renderCard()

    await user.selectOptions(screen.getByLabelText('Zona horaria'), 'America/Mexico_City')

    expect(api.patch).toHaveBeenCalledWith('/settings/business', {
      timezone: 'America/Mexico_City',
    })
    expect(await screen.findByRole('combobox', { name: 'Zona horaria' })).toBeEnabled()
    expect(notifySuccess).toHaveBeenCalledWith('Cambios guardados')
  })

  // Given an admin changes the language select
  // When the new value is picked
  // Then it should PATCH just the language field
  it('saves the language as soon as it changes', async () => {
    const { user } = renderCard()

    await user.selectOptions(screen.getByLabelText('Idioma'), 'en')

    expect(api.patch).toHaveBeenCalledWith('/settings/business', { language: 'en' })
  })

  // Given a non-admin viewing the locale settings
  // When the card renders
  // Then both selects should be disabled
  it('disables both selects for a non-admin', () => {
    renderCard(false)

    expect(screen.getByLabelText('Zona horaria')).toBeDisabled()
    expect(screen.getByLabelText('Idioma')).toBeDisabled()
  })
})
