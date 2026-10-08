import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import MapPage from './MapPage'
import { api } from '@/shared/services'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { stubMapSize, waitOutDoubleClickWindow } from '@/shared/test/leaflet'
import type { ClientMapResponse } from '@/features/map/types/map.types'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }
})

const mapData: ClientMapResponse = {
  total: 3,
  clients: [
    {
      id: 'client-1',
      name: 'Laura Martínez',
      latitude: 41.7,
      longitude: 1.8,
      zone: 'Manresa',
      channels: ['WHATSAPP'],
      type: 'Panadería',
      approximate: false,
    },
    {
      id: 'client-2',
      name: 'Luis Prats',
      latitude: 41.7,
      longitude: 1.8,
      zone: 'Manresa',
      channels: ['GMAIL'],
      type: null,
      approximate: true,
    },
    {
      id: 'client-3',
      name: 'Marta Vila',
      latitude: 41.9,
      longitude: 2.2,
      zone: 'Vic',
      channels: [],
      type: null,
      approximate: false,
    },
  ],
  zones: [
    { zone: 'Manresa', count: 2, percentage: 67 },
    { zone: 'Vic', count: 1, percentage: 33 },
  ],
  channelOrigin: [],
}

const clientDetail = {
  id: 'client-2',
  name: 'Luis Prats',
  email: null,
  phone: null,
  channels: ['GMAIL'],
  type: null,
  address: null,
  zone: 'Manresa',
  latitude: 41.7,
  longitude: 1.8,
  lastContact: null,
  clientTags: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function mockMapResponse(response: ClientMapResponse) {
  vi.mocked(api.get).mockImplementation((path: string) => {
    if (path.startsWith('/clients/map')) return Promise.resolve(response)
    return Promise.resolve({ client: clientDetail })
  })
}

function renderPage() {
  return render(
    withQueryClient(
      <MantineProvider>
        <MemoryRouter>
          <MapPage />
        </MemoryRouter>
      </MantineProvider>,
    ),
  )
}

describe('MapPage', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    stubMapSize()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Given the backend returns clients in two zones, one of them without exact location
  // When the page is rendered
  // Then it should show the KPIs, the zone summary, the approximate clients and the pending charts
  it('shows the map KPIs, the side panel and the pending charts', async () => {
    mockMapResponse(mapData)
    renderPage()

    expect(await screen.findByText('Clientes en el mapa')).toBeInTheDocument()
    expect(screen.getByText('Zonas activas')).toBeInTheDocument()
    expect(screen.getByText('Zona principal')).toBeInTheDocument()
    expect(screen.getByText('Resumen por zonas')).toBeInTheDocument()
    expect(screen.getByText('2 clientes - 67 %')).toBeInTheDocument()
    expect(screen.getByText('Ingresos por zona')).toBeInTheDocument()
    expect(screen.getByText('Ticket medio por zona')).toBeInTheDocument()
  })

  // Given the backend returns clients
  // When the page is rendered
  // Then the map should be drawn with its tiles credit and the clients layer active
  it('renders the map with its credit and the clients layer active', async () => {
    mockMapResponse(mapData)
    const { container } = renderPage()

    await screen.findByText('Clientes en el mapa')

    expect(container.querySelector('.leaflet-container')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'OpenStreetMap' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clientes' })).toHaveAttribute('aria-pressed', 'true')
  })

  // Given one client has no exact location
  // When the page is rendered
  // Then it should be listed under "Sin ubicación exacta"
  it('lists the clients without exact location in the side panel', async () => {
    mockMapResponse(mapData)
    renderPage()

    const card = (await screen.findByText('Sin ubicación exacta', { selector: 'h2' })).closest(
      'div',
    ) as HTMLElement

    expect(within(card).getByText('Luis Prats')).toBeInTheDocument()
    expect(within(card).queryByText('Laura Martínez')).not.toBeInTheDocument()
  })

  // Given a client without exact location is listed
  // When the user clicks "Añadir dirección"
  // Then the edit modal of that client should open
  it('opens the edit modal from "Añadir dirección"', async () => {
    mockMapResponse(mapData)
    renderPage()

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Añadir dirección' }))

    expect(await screen.findByRole('dialog', { name: 'Editar cliente' })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/clients/client-2')
  })

  // Given the map is shown
  // When the user clicks a point of the map and then "Nuevo cliente aquí"
  // Then the create modal should open with the chosen location
  it('opens the create modal with the location clicked on the map', async () => {
    mockMapResponse(mapData)
    const { container } = renderPage()
    await screen.findByText('Clientes en el mapa')

    fireEvent.click(container.querySelector('.leaflet-container') as HTMLElement, {
      clientX: 400,
      clientY: 300,
    })
    const createHere = await screen.findByRole('button', { name: 'Nuevo cliente aquí' })
    await waitOutDoubleClickWindow()
    await userEvent.setup().click(createHere)

    expect(await screen.findByRole('dialog', { name: 'Nuevo cliente' })).toBeInTheDocument()
    expect(screen.getByText(/Ubicación elegida/)).toBeInTheDocument()
  })

  // Given the map is shown
  // When the user picks a channel and a date range
  // Then the map should be requested again with those filters
  it('requests the map again when the filters change', async () => {
    mockMapResponse(mapData)
    renderPage()
    await screen.findByText('Clientes en el mapa')
    const user = userEvent.setup()

    await user.selectOptions(screen.getByLabelText('Canal'), 'WHATSAPP')
    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-01-01' } })

    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith('/clients/map?channel=WHATSAPP&from=2026-01-01'),
    )
    expect(screen.getByText('Clientes en el mapa')).toBeInTheDocument()
  })

  // Given filters are active
  // When the user clicks "Limpiar filtros"
  // Then the map should be requested without filters again
  it('clears the filters', async () => {
    mockMapResponse(mapData)
    renderPage()
    await screen.findByText('Clientes en el mapa')
    const user = userEvent.setup()
    await user.selectOptions(screen.getByLabelText('Canal'), 'GMAIL')
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/clients/map?channel=GMAIL'))

    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }))

    expect(screen.getByLabelText('Canal')).toHaveValue('')
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument()
  })

  // Given the backend returns no clients
  // When the page is rendered
  // Then it should explain that there are no located clients
  it('shows an empty message when there are no clients', async () => {
    mockMapResponse({ total: 0, clients: [], zones: [], channelOrigin: [] })
    renderPage()

    expect(
      await screen.findByText('Todavía no tienes clientes con ubicación en el mapa.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Todos tus clientes tienen ubicación exacta.')).toBeInTheDocument()
  })

  // Given the backend fails
  // When the page is rendered
  // Then an error message should be shown
  it('shows an error when the map data cannot be loaded', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('network'))
    renderPage()

    expect(await screen.findByText('No se ha podido cargar el mapa.')).toBeInTheDocument()
  })
})
