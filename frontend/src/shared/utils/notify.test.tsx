import { describe, it, expect, vi, beforeEach } from 'vitest'
import { notifications } from '@mantine/notifications'
import { notifySuccess } from './notify'

vi.mock('@mantine/notifications', () => ({
  notifications: { show: vi.fn() },
}))

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
