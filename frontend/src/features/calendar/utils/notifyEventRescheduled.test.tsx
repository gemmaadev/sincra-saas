import { describe, it, expect, vi, beforeEach } from 'vitest'
import { notifyWithUndo } from '@/shared/utils/notify'
import { notifyEventRescheduled } from './notifyEventRescheduled'

vi.mock('@/shared/utils/notify', () => ({
  notifyWithUndo: vi.fn(),
}))

describe('notifyEventRescheduled', () => {
  beforeEach(() => {
    vi.mocked(notifyWithUndo).mockReset()
  })

  // Given a new date for the event
  // When notifyEventRescheduled is called
  // Then it should build the message in Spanish, with day and month only, and pass the undo callback through
  it('builds the message with the new date and forwards the undo callback', () => {
    const onUndo = vi.fn()

    notifyEventRescheduled(new Date('2026-09-17T10:00:00'), onUndo)

    expect(notifyWithUndo).toHaveBeenCalledWith('Evento movido al 17 de septiembre', onUndo)
  })
})
