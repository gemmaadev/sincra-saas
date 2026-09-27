import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SelectBusinessPage } from './SelectBusinessPage'
import { api } from '@/shared/services'

const mockNavigate = vi.fn()

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/shared/services', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number
    code: string
    constructor(message: string, status: number, code: string) {
      super(message)
      this.status = status
      this.code = code
    }
  },
}))

const BUSINESSES = [
  { businessId: 'b1', name: 'Tienda Gemma', sector: 'ecommerce', role: 'ADMIN' as const },
  { businessId: 'b2', name: 'Floristería Ana', sector: 'retail', role: 'EMPLOYEE' as const },
]

describe('SelectBusinessPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    vi.mocked(api.get).mockReset()
    vi.mocked(api.post).mockReset()
  })

  // Given the businesses endpoint resolves with several businesses
  // When the page renders
  // Then each business is shown with its name and sector label
  it('shows each business the user belongs to', async () => {
    vi.mocked(api.get).mockResolvedValue({ businesses: BUSINESSES })

    render(
      <MemoryRouter>
        <SelectBusinessPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Tienda Gemma')).toBeInTheDocument()
    expect(screen.getByText('Floristería Ana')).toBeInTheDocument()
  })

  // Given the businesses are loaded
  // When the user clicks on one
  // Then it calls select-business and navigates to /inbox
  it('selects a business and navigates to /inbox', async () => {
    vi.mocked(api.get).mockResolvedValue({ businesses: BUSINESSES })
    vi.mocked(api.post).mockResolvedValue({ success: true })
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <SelectBusinessPage />
      </MemoryRouter>,
    )

    await user.click(await screen.findByText('Tienda Gemma'))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/select-business', { businessId: 'b1' })
      expect(mockNavigate).toHaveBeenCalledWith('/inbox')
    })
  })

  // Given the businesses endpoint fails
  // When the page renders
  // Then an error message is shown
  it('shows an error when businesses fail to load', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('network error'))

    render(
      <MemoryRouter>
        <SelectBusinessPage />
      </MemoryRouter>,
    )

    expect(
      await screen.findByText('No se pudieron cargar tus negocios. Inténtalo de nuevo.'),
    ).toBeInTheDocument()
  })
})
