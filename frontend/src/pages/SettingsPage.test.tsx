import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SettingsPage from './SettingsPage'
import { api } from '@/shared/services'
import { AuthContext } from '@/features/auth/context/AuthContext'
import type { AuthContextValue } from '@/features/auth/context/AuthContext'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }
})

const mockBusiness = {
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

const mockChannels = [
  { channel: 'GMAIL', status: 'CONNECTED' },
  { channel: 'OUTLOOK', status: 'DISCONNECTED' },
  { channel: 'WHATSAPP', status: 'MOCKED' },
  { channel: 'INSTAGRAM', status: 'MOCKED' },
  { channel: 'MESSENGER', status: 'MOCKED' },
]

function mockApiGet() {
  vi.mocked(api.get).mockImplementation((path: string) => {
    if (path === '/settings/business') return Promise.resolve({ business: mockBusiness })
    if (path === '/settings/channels') return Promise.resolve({ channels: mockChannels })
    return Promise.reject(new Error(`unexpected path: ${path}`))
  })
}

const adminAuth: AuthContextValue = {
  user: { id: 'user-1', name: 'Laura García', email: 'laura@sincra.app', role: 'admin' },
  business: { id: 'biz-1', name: 'Tienda de Laura' },
  isAuthenticated: true,
  loading: false,
  login: async () => {},
  logout: async () => {},
}

const employeeAuth: AuthContextValue = { ...adminAuth, user: { ...adminAuth.user!, role: 'employee' } }

function renderSettingsPage(authValue: AuthContextValue = adminAuth) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={authValue}>
          <MemoryRouter initialEntries={['/settings']}>
            <SettingsPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    </MantineProvider>,
  )
}

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    vi.mocked(api.post).mockReset()
    vi.mocked(api.patch).mockReset()
    vi.mocked(api.delete).mockReset()
  })

  // Given the business settings and channels endpoints resolve
  // When SettingsPage is rendered
  // Then all five sections should appear, with the business data shown
  it('renders every section with the business data', async () => {
    mockApiGet()
    renderSettingsPage()

    expect(await screen.findByText('Tienda de Laura')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Información del negocio' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Datos de contacto' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Canales conectados' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Zona horaria e idioma' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Eliminar negocio' })).toBeInTheDocument()
  })

  // Given the channels endpoint resolves
  // When SettingsPage is rendered
  // Then Gmail should show as connected and the mocked channels should say so
  it('renders the connected channels with their real/mocked status', async () => {
    mockApiGet()
    renderSettingsPage()

    const channelsSection = within(
      await screen.findByRole('region', { name: 'Canales conectados' }),
    )
    expect(await channelsSection.findByText('Gmail')).toBeInTheDocument()
    expect(channelsSection.getByRole('button', { name: 'Desconectar Gmail' })).toBeInTheDocument()
    expect(
      channelsSection.getByRole('button', { name: 'Conectar WhatsApp (no disponible)' }),
    ).toBeInTheDocument()
  })

  // Given an employee (not an admin)
  // When SettingsPage is rendered
  // Then the "Eliminar negocio" section should not exist at all, and no "Editar" controls should show
  it('hides the danger zone and edit controls from an employee', async () => {
    mockApiGet()
    renderSettingsPage(employeeAuth)

    await screen.findByText('Tienda de Laura')
    expect(screen.queryByRole('region', { name: 'Eliminar negocio' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Editar/ })).not.toBeInTheDocument()
  })

  // Given the business settings request fails
  // When SettingsPage is rendered
  // Then an error message should be shown instead of the sections
  it('shows an error when the business settings fail to load', async () => {
    vi.mocked(api.get).mockImplementation((path: string) => {
      if (path === '/settings/business') return Promise.reject(new Error('network error'))
      return Promise.resolve({ channels: mockChannels })
    })
    renderSettingsPage()

    expect(
      await screen.findByText('No se ha podido cargar la información del negocio.'),
    ).toBeInTheDocument()
  })
})
