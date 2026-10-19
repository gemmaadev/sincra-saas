import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TeamPage from './TeamPage'
import { api } from '@/shared/services'
import { AuthContext } from '@/features/auth/context/AuthContext'
import type { AuthContextValue } from '@/features/auth/context/AuthContext'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn(), post: vi.fn() } }
})

const mockMembers = [
  { id: 'user-1', name: 'Laura García', email: 'laura@sincra.app', role: 'ADMIN', status: 'ACTIVE' },
  { id: 'user-2', name: 'Carlos Ruiz', email: 'carlos@sincra.app', role: 'EMPLOYEE', status: 'PENDING' },
  { id: 'user-3', name: 'Marta Soler', email: 'marta@sincra.app', role: 'EMPLOYEE', status: 'ACTIVE' },
]

const adminAuth: AuthContextValue = {
  user: { id: 'user-1', name: 'Laura García', email: 'laura@sincra.app', role: 'admin' },
  business: { id: 'biz-1', name: 'Tienda de Laura' },
  isAuthenticated: true,
  loading: false,
  login: async () => {},
  logout: async () => {},
}

const employeeAuth: AuthContextValue = { ...adminAuth, user: { ...adminAuth.user!, role: 'employee' } }

function renderTeamPage(authValue: AuthContextValue = adminAuth) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={authValue}>
          <MemoryRouter initialEntries={['/team']}>
            <TeamPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    </MantineProvider>,
  )
}

describe('TeamPage', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    vi.mocked(api.get).mockResolvedValue({ members: mockMembers })
  })

  // Given the team members returned by the API
  // When TeamPage is rendered
  // Then the KPI cards should show the right totals
  it('shows member, admin and employee counts in the KPI cards', async () => {
    renderTeamPage()

    await screen.findByText('Laura García')
    expect(screen.getByText('Miembros').closest('div')?.nextElementSibling).toHaveTextContent('3')
    expect(
      screen.getByText('Administradores').closest('div')?.nextElementSibling,
    ).toHaveTextContent('1')
    expect(screen.getByText('Empleados').closest('div')?.nextElementSibling).toHaveTextContent(
      '2',
    )
  })

  // Given the team members returned by the API, including an inactive-by-default pending one
  // When TeamPage is rendered with no filter touched
  // Then only active members' name, email and role should appear in the table
  it('renders only active members by default', async () => {
    renderTeamPage()
    await screen.findByText('Laura García')

    const table = within(screen.getByRole('table'))
    expect(table.getByText('Laura García')).toBeInTheDocument()
    expect(table.getByText('laura@sincra.app')).toBeInTheDocument()
    expect(table.getByText('Administrador')).toBeInTheDocument()
    expect(table.getByText('Marta Soler')).toBeInTheDocument()
    expect(table.queryByText('Carlos Ruiz')).not.toBeInTheDocument()
  })

  // Given the status filter defaults to "Activo"
  // When the user clears it to "Todos los estados"
  // Then pending members should also appear in the table
  it('shows pending members once the status filter is cleared', async () => {
    renderTeamPage()
    await screen.findByText('Laura García')

    await userEvent
      .setup()
      .selectOptions(screen.getByLabelText('Estado'), 'Todos los estados')

    const table = within(screen.getByRole('table'))
    expect(await table.findByText('Carlos Ruiz')).toBeInTheDocument()
    expect(table.getByText('Pendiente')).toBeInTheDocument()
  })

  // Given an admin user
  // When TeamPage is rendered
  // Then the invite button and the row actions column should be visible
  it('shows the invite button and row actions to an admin', async () => {
    renderTeamPage(adminAuth)

    expect(await screen.findByRole('button', { name: 'Invitar empleado' })).toBeInTheDocument()
    await screen.findByText('Laura García')
    const table = within(screen.getByRole('table'))
    expect(table.getByText('Acciones')).toBeInTheDocument()
    expect(table.getAllByRole('button', { name: /Desactivar/ })).toHaveLength(2)
  })

  // Given an employee user
  // When TeamPage is rendered
  // Then the invite button and the row actions column should be hidden
  it('hides the invite button and row actions from an employee', async () => {
    renderTeamPage(employeeAuth)

    await screen.findByText('Laura García')
    expect(screen.queryByRole('button', { name: 'Invitar empleado' })).not.toBeInTheDocument()
    const table = within(screen.getByRole('table'))
    expect(table.queryByText('Acciones')).not.toBeInTheDocument()
  })

  // Given the member table is rendered
  // When the user types a search term that matches only one member
  // Then only that member should remain in the table
  it('filters the table when searching', async () => {
    renderTeamPage()
    await screen.findByText('Marta Soler')

    await userEvent.setup().type(screen.getByLabelText('Buscar'), 'marta')

    const table = within(screen.getByRole('table'))
    expect(table.getByText('Marta Soler')).toBeInTheDocument()
    expect(table.queryByText('Laura García')).not.toBeInTheDocument()
  })

  // Given an admin user
  // When they click "Invitar empleado"
  // Then the invite modal should open
  it('opens the invite modal when "Invitar empleado" is clicked', async () => {
    renderTeamPage()

    await userEvent
      .setup()
      .click(await screen.findByRole('button', { name: 'Invitar empleado' }))

    expect(await screen.findByRole('dialog', { name: 'Invitar empleado' })).toBeInTheDocument()
  })
})
