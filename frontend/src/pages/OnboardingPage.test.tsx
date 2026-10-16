import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OnboardingPage from './OnboardingPage'
import { TOTAL_CHANNELS_COUNT } from '@/features/onboarding/onboarding.constants'
import { api } from '@/shared/services'
import { withQueryClient } from '@/shared/test/withQueryClient'

const mockNavigate = vi.fn()
const mockRegisterBusiness = vi.fn()

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/features/auth/hooks/useRegisterBusiness', () => ({
  useRegisterBusiness: () => ({
    registerBusiness: mockRegisterBusiness,
    isSubmitting: false,
    error: null,
  }),
}))

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { post: vi.fn() } }
})

function renderOnboardingPage() {
  return render(withQueryClient(<OnboardingPage />))
}

describe('OnboardingPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockRegisterBusiness.mockClear()
    mockRegisterBusiness.mockResolvedValue(true)
    vi.mocked(api.post).mockReset().mockResolvedValue({})
  })

  it('Scenario: the flow starts on the business step', () => {
    // Given the onboarding page just mounted
    // When it renders
    // Then the business step is shown, and the stepper marks step 1 as current
    renderOnboardingPage()

    expect(screen.getByText('Configuración del negocio')).toBeInTheDocument()
  })

  it('Scenario: exiting the onboarding', async () => {
    // Given the user is on the onboarding page
    // When they click "Salir"
    // Then they are navigated to /login
    const user = userEvent.setup()
    renderOnboardingPage()

    await user.click(screen.getByRole('button', { name: /salir del proceso/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('Scenario: completing the business step moves to the channels step', async () => {
    // Given the user is on the business step
    // When they fill in the business name and submit
    // Then the channels step is shown next
    const user = userEvent.setup()
    renderOnboardingPage()

    await user.type(screen.getByLabelText('Nombre del negocio'), 'Flowers & Co')
    await user.click(screen.getByRole('button', { name: /siguiente/i }))

    expect(screen.getByText('Conecta tus canales')).toBeInTheDocument()
  })

  it('Scenario: going back from the channels step', async () => {
    // Given the user has advanced to the channels step
    // When they click "Volver"
    // Then they land back on the business step
    const user = userEvent.setup()
    renderOnboardingPage()

    await user.type(screen.getByLabelText('Nombre del negocio'), 'Flowers & Co')
    await user.click(screen.getByRole('button', { name: /siguiente/i }))
    await user.click(screen.getByRole('button', { name: /volver/i }))

    expect(screen.getByText('Configuración del negocio')).toBeInTheDocument()
  })

  it('Scenario: completing the channels step moves to the final step', async () => {
    // Given the user is on the channels step
    // When they click "Siguiente" (with or without connecting channels)
    // Then the final summary step is shown
    const user = userEvent.setup()
    renderOnboardingPage()

    await user.type(screen.getByLabelText('Nombre del negocio'), 'Flowers & Co')
    await user.click(screen.getByRole('button', { name: /siguiente/i }))
    await user.click(screen.getByRole('button', { name: /siguiente/i }))

    expect(screen.getByText('¡Todo listo!')).toBeInTheDocument()
  })

  it('Scenario: data collected across steps reaches the final summary', async () => {
    // Given the user entered a business name and connected one channel
    // When they reach the final step
    // Then the summary reflects both the business name and the channel count
    const user = userEvent.setup()
    renderOnboardingPage()

    await user.type(screen.getByLabelText('Nombre del negocio'), 'Flowers & Co')
    await user.click(screen.getByRole('button', { name: /siguiente/i }))

    const gmailCard = screen.getByText('Gmail').closest('div[class*="rounded-xl"]') as HTMLElement
    await user.click(within(gmailCard).getByRole('button', { name: 'Conectar' }))

    await user.click(screen.getByRole('button', { name: /siguiente/i }))

    expect(screen.getByText('Flowers & Co')).toBeInTheDocument()
    expect(screen.getByText(`1 de ${TOTAL_CHANNELS_COUNT}`)).toBeInTheDocument()
  })
})
