import { render, screen, fireEvent } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi } from 'vitest'
import { DetailDrawer } from './DetailDrawer'

function renderDrawer(props: Partial<React.ComponentProps<typeof DetailDrawer>> = {}) {
  const onClose = vi.fn()
  render(
    <MantineProvider>
      <DetailDrawer opened onClose={onClose} {...props}>
        <p>Contenido del panel</p>
      </DetailDrawer>
    </MantineProvider>,
  )
  return { onClose }
}

describe('DetailDrawer', () => {
  // Given an opened drawer with content
  // When it is rendered
  // Then it should show that content
  it('shows the content when opened', () => {
    renderDrawer()

    expect(screen.getByText('Contenido del panel')).toBeInTheDocument()
  })

  // Given the drawer is open
  // When the user clicks the close button
  // Then onClose should be called
  it('calls onClose when the close button is clicked', () => {
    const { onClose } = renderDrawer()

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // Given the drawer is closed
  // When it is rendered
  // Then its content should not be shown
  it('renders nothing when it is not opened', () => {
    renderDrawer({ opened: false })

    expect(screen.queryByText('Contenido del panel')).not.toBeInTheDocument()
  })
})
