import { describe, it, expect, vi, beforeEach } from 'vitest'
import prisma from '../../config/db'
import {
  insertCalendarEvent,
  findCalendarEventsInRange,
  findCalendarEventById,
  updateCalendarEventById,
  deleteCalendarEventById,
} from './calendar.model'

vi.mock('../../config/db', () => ({
  default: {
    calendarEvent: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

describe('insertCalendarEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given calendar event data
  // When inserting it
  // Then it should be created as-is
  it('creates the event with the given data', async () => {
    const data = { businessId: 'business-1', title: 'Llamar a Juan', date: new Date('2026-10-10') }

    await insertCalendarEvent(data as never)

    expect(prisma.calendarEvent.create).toHaveBeenCalledWith({ data })
  })
})

describe('findCalendarEventsInRange', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given a business and a date range
  // When listing events in that range
  // Then it should filter by business and date, sorted ascending by date
  it('filters by business and date range, sorted by date', async () => {
    const dateFrom = new Date('2026-10-01')
    const dateTo = new Date('2026-10-31')

    await findCalendarEventsInRange('business-1', dateFrom, dateTo)

    expect(prisma.calendarEvent.findMany).toHaveBeenCalledWith({
      where: { businessId: 'business-1', date: { gte: dateFrom, lte: dateTo } },
      orderBy: { date: 'asc' },
    })
  })
})

describe('findCalendarEventById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given a business and an event id
  // When looking it up
  // Then it should scope the lookup to that business
  it('scopes the lookup to the business', async () => {
    await findCalendarEventById('business-1', 'event-1')

    expect(prisma.calendarEvent.findUnique).toHaveBeenCalledWith({
      where: { id: 'event-1', businessId: 'business-1' },
    })
  })
})

describe('updateCalendarEventById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given an event id and new data
  // When updating it
  // Then it should update only that event
  it('updates the event by id', async () => {
    await updateCalendarEventById('event-1', { title: 'Nuevo título' })

    expect(prisma.calendarEvent.update).toHaveBeenCalledWith({
      where: { id: 'event-1' },
      data: { title: 'Nuevo título' },
    })
  })
})

describe('deleteCalendarEventById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given an event id
  // When deleting it
  // Then it should delete only that event
  it('deletes the event by id', async () => {
    await deleteCalendarEventById('event-1')

    expect(prisma.calendarEvent.delete).toHaveBeenCalledWith({ where: { id: 'event-1' } })
  })
})
