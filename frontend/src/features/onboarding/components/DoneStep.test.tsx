import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DoneStep } from './DoneStep'
import type { OnboardingData } from '../onboarding.types'
import { TOTAL_CHANNELS_COUNT } from '../onboarding.constants'

const mockNavigate = vi.fn()

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const DATA: OnboardingData = {
  businessName: 'Flowers & Co',
  sector: 'retail',
  description: '',
  country: 'ES',
  connectedChannels: ['gmail', 'whatsapp'],
}

describe('DoneStep', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('Scenario: showing the business summary', () => {
    // Given the onboarding data collected in previous steps
    // When the final step renders
    // Then the business name is shown
    render(<DoneStep data={DATA} />)

    expect(screen.getByText('Flowers & Co')).toBeInTheDocument()
  })

  it('Scenario: showing how many channels were connected', () => {
    // Given 2 connected channels out of the total available
    // When the final step renders
    // Then it shows "2 de <total>"
    render(<DoneStep data={DATA} />)

    expect(screen.getByText(`2 de ${TOTAL_CHANNELS_COUNT}`)).toBeInTheDocument()
  })

  it('Scenario: AI agents row has a configure action', () => {
    // Given the final step
    // When it renders
    // Then it shows the AI agents status and a "Configurar" action
    render(<DoneStep data={DATA} />)

    expect(screen.getByText('Activos')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Configurar' })).toBeInTheDocument()
  })

  it('Scenario: going to the inbox', async () => {
    // Given the final step
    // When the user clicks "Ir al panel principal"
    // Then they are navigated to /inbox
    const user = userEvent.setup()
    render(<DoneStep data={DATA} />)

    await user.click(screen.getByRole('button', { name: 'Ir al panel principal' }))

    expect(mockNavigate).toHaveBeenCalledWith('/inbox')
  })

  it('Scenario: configuring AI agents', async () => {
    // Given the final step
    // When the user clicks "Configurar" on the AI agents row
    // Then they are navigated to /automations
    const user = userEvent.setup()
    render(<DoneStep data={DATA} />)

    await user.click(screen.getByRole('button', { name: 'Configurar' }))

    expect(mockNavigate).toHaveBeenCalledWith('/automations')
  })
})
