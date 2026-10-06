import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MapContainer } from 'react-leaflet'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { stubMapSize, waitOutDoubleClickWindow } from '@/shared/test/leaflet'
import { NewClientPin } from './NewClientPin'

function renderPin() {
  const onCreate = vi.fn()
  const { container } = render(
    <MapContainer center={[41.7, 1.8]} zoom={10}>
      <NewClientPin onCreate={onCreate} />
    </MapContainer>,
  )
  const mapElement = container.querySelector('.leaflet-container') as HTMLElement
  return { onCreate, mapElement, user: userEvent.setup() }
}

describe('NewClientPin', () => {
  beforeEach(() => {
    stubMapSize()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Given a map nobody has clicked yet
  // When it is rendered
  // Then there should be no "new client" popup
  it('shows nothing until the map is clicked', () => {
    renderPin()

    expect(screen.queryByRole('button', { name: 'Nuevo cliente aquí' })).not.toBeInTheDocument()
  })

  // Given a map
  // When the user clicks a point of it
  // Then a popup asking to add a client there should open
  it('opens a popup when the map is clicked', async () => {
    const { mapElement } = renderPin()

    fireEvent.click(mapElement, { clientX: 400, clientY: 300 })

    expect(await screen.findByText('¿Añadir un cliente en este punto?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nuevo cliente aquí' })).toBeInTheDocument()
  })

  // Given the popup is open
  // When the user presses "Nuevo cliente aquí"
  // Then onCreate should receive the clicked coordinates and the popup should close
  it('calls onCreate with the clicked coordinates and closes the popup', async () => {
    const { onCreate, mapElement, user } = renderPin()

    fireEvent.click(mapElement, { clientX: 400, clientY: 300 })
    const button = await screen.findByRole('button', { name: 'Nuevo cliente aquí' })
    await waitOutDoubleClickWindow()
    await user.click(button)

    expect(onCreate).toHaveBeenCalledTimes(1)
    const { latitude, longitude } = onCreate.mock.calls[0][0]
    expect(Number.isFinite(latitude)).toBe(true)
    expect(Number.isFinite(longitude)).toBe(true)
    expect(screen.queryByText('¿Añadir un cliente en este punto?')).not.toBeInTheDocument()
  })
})
