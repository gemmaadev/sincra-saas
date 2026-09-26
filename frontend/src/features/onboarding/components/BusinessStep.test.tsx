import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BusinessStep } from './BusinessStep'
import { SECTOR_OPTIONS, COUNTRY_OPTIONS } from '../onboarding.constants'
import type { OnboardingData } from '../onboarding.types'

const EMPTY_DATA: OnboardingData = {
  businessName: '',
  sector: '',
  description: '',
  country: 'ES',
  connectedChannels: [],
}

describe('BusinessStep', () => {
  it('Scenario: the submit button is disabled without a business name', () => {
    // Given no business name has been entered
    // When the step renders
    // Then the "Siguiente" button is disabled
    render(<BusinessStep data={EMPTY_DATA} onChange={vi.fn()} onNext={vi.fn()} />)

    expect(screen.getByRole('button', { name: /siguiente/i })).toBeDisabled()
  })

  it('Scenario: the submit button is enabled once a business name is present', () => {
    // Given a business name has already been entered
    // When the step renders
    // Then the "Siguiente" button is enabled
    render(
      <BusinessStep
        data={{ ...EMPTY_DATA, businessName: 'Flowers & Co' }}
        onChange={vi.fn()}
        onNext={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /siguiente/i })).toBeEnabled()
  })

  it('Scenario: typing the business name', async () => {
    // Given an empty business name field
    // When the user types into it
    // Then onChange is called with the businessName field
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<BusinessStep data={EMPTY_DATA} onChange={handleChange} onNext={vi.fn()} />)

    await user.type(screen.getByLabelText('Nombre del negocio'), 'F')

    expect(handleChange).toHaveBeenCalledWith({ businessName: 'F' })
  })

  it('Scenario: choosing a sector', async () => {
    // Given the sector select is empty
    // When the user picks a sector
    // Then onChange is called with the sector field
    const user = userEvent.setup()
    const handleChange = vi.fn()
    const firstSector = SECTOR_OPTIONS[0]

    render(<BusinessStep data={EMPTY_DATA} onChange={handleChange} onNext={vi.fn()} />)

    await user.selectOptions(screen.getByLabelText('Sector'), firstSector.value)

    expect(handleChange).toHaveBeenCalledWith({ sector: firstSector.value })
  })

  it('Scenario: choosing a country', async () => {
    // Given a country is already preselected
    // When the user picks a different one
    // Then onChange is called with the country field
    const user = userEvent.setup()
    const handleChange = vi.fn()
    const otherCountry = COUNTRY_OPTIONS.find((option) => option.value !== EMPTY_DATA.country)!

    render(<BusinessStep data={EMPTY_DATA} onChange={handleChange} onNext={vi.fn()} />)

    await user.selectOptions(screen.getByLabelText('¿En qué país estás?'), otherCountry.value)

    expect(handleChange).toHaveBeenCalledWith({ country: otherCountry.value })
  })

  it('Scenario: typing the description', async () => {
    // Given an empty description field
    // When the user types into it
    // Then onChange is called with the description field
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<BusinessStep data={EMPTY_DATA} onChange={handleChange} onNext={vi.fn()} />)

    await user.type(screen.getByLabelText(/descripción/i), 'A')

    expect(handleChange).toHaveBeenCalledWith({ description: 'A' })
  })

  it('Scenario: description character count', () => {
    // Given a description with some text already typed
    // When the step renders
    // Then the character counter reflects its length
    render(
      <BusinessStep
        data={{ ...EMPTY_DATA, description: 'Hola' }}
        onChange={vi.fn()}
        onNext={vi.fn()}
      />,
    )

    expect(screen.getByText(/^4\//)).toBeInTheDocument()
  })

  it('Scenario: submitting the form', async () => {
    // Given a valid business name has been entered
    // When the user submits the form
    // Then onNext is called
    const user = userEvent.setup()
    const handleNext = vi.fn()

    render(
      <BusinessStep
        data={{ ...EMPTY_DATA, businessName: 'Flowers & Co' }}
        onChange={vi.fn()}
        onNext={handleNext}
      />,
    )

    await user.click(screen.getByRole('button', { name: /siguiente/i }))

    expect(handleNext).toHaveBeenCalledOnce()
  })
})
