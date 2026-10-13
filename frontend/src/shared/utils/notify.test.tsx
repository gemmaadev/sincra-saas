import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { notifications } from '@mantine/notifications'
import { notifySuccess, notifyWithUndo } from './notify'

vi.mock('@mantine/notifications', () => ({
  notifications: { show: vi.fn(), hide: vi.fn() },
}))

function renderNotifyWithUndoMessage(message: string, onUndo = vi.fn()) {
  notifyWithUndo(message, onUndo)
  const { message: renderedMessage } = vi.mocked(notifications.show).mock.calls[0]?.[0] ?? {}
  render(renderedMessage as React.ReactElement)
  return { onUndo }
}

describe('notifySuccess', () => {
  beforeEach(() => {
    vi.mocked(notifications.show).mockReset()
  })

  // Given a success message
  // When notifySuccess is called
  // Then a notification with that message and the success colour should be shown
  it('shows a notification with the message and the success colour', () => {
    notifySuccess('Cliente creado')

    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Cliente creado', color: 'var(--color-success)' }),
    )
  })

  // Given a success message
  // When notifySuccess is called
  // Then the notification should close by itself
  it('closes automatically', () => {
    notifySuccess('Cliente creado')

    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ autoClose: expect.any(Number) }),
    )
  })
})

describe('notifyWithUndo', () => {
  beforeEach(() => {
    vi.mocked(notifications.show).mockReset()
    vi.mocked(notifications.hide).mockReset()
  })

  // Given a message and an undo callback
  // When notifyWithUndo is called
  // Then it should show a notification with that message and a "Deshacer" button
  it('shows the message and a "Deshacer" button', () => {
    renderNotifyWithUndoMessage('Evento movido al 17 de septiembre')

    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ autoClose: expect.any(Number) }),
    )
    expect(screen.getByText('Evento movido al 17 de septiembre')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Deshacer' })).toBeInTheDocument()
  })

  // Given the notification is shown
  // When the user clicks "Deshacer"
  // Then it should hide the notification and call the undo callback
  it('hides itself and calls onUndo when "Deshacer" is clicked', async () => {
    const user = userEvent.setup()
    const { onUndo } = renderNotifyWithUndoMessage('Evento movido al 17 de septiembre')

    await user.click(screen.getByRole('button', { name: 'Deshacer' }))

    expect(notifications.hide).toHaveBeenCalled()
    expect(onUndo).toHaveBeenCalledOnce()
  })
})
