import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as calendarModel from './calendar.model'
import * as clientModel from '../client/client.model'
import * as orderModel from '../order/order.model'
import {
  listEvents,
  createEvent,
  updateEvent,
  rescheduleEvent,
  deleteEvent,
} from './calendar.service'

vi.mock('./calendar.model')
vi.mock('../client/client.model')
vi.mock('../order/order.model')

const existingEvent = {
  id: 'event-1',
  businessId: 'business-1',
  title: 'Llamar a Juan',
  description: null,
  date: new Date('2026-10-10'),
  source: 'MANUAL',
  clientId: null,
  orderId: null,
  createdBy: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('listEvents', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  // Given a date range with both a manual calendar event and an order with an expectedDate in it
  // When listing events
  // Then it should return both, sorted by date, with orders marked as non-editable
  it('combines calendar events and orders, sorted by date', async () => {
    vi.mocked(calendarModel.findCalendarEventsInRange).mockResolvedValue([
      { ...existingEvent, date: new Date('2026-10-20') },
    ] as never)
    vi.mocked(orderModel.findOrdersWithExpectedDateInRange).mockResolvedValue([
      {
        id: 'order-1',
        number: 42,
        clientId: 'client-1',
        expectedDate: new Date('2026-10-05'),
        status: 'PENDING',
        client: { name: 'Juan' },
      },
    ] as never)

    const events = await listEvents('business-1', {
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
    })

    expect(events).toEqual([
      expect.objectContaining({ id: 'order-1', title: 'Pedido #42 - Juan', editable: false }),
      expect.objectContaining({ id: 'event-1', editable: true }),
    ])
  })

  // Given an invalid dateFrom
  // When listing events
  // Then it should throw a 400 INVALID_DATE without querying anything
  it('throws INVALID_DATE when the range is invalid', async () => {
    await expect(
      listEvents('business-1', { dateFrom: 'not-a-date', dateTo: '2026-10-31' }),
    ).rejects.toMatchObject({ statusCode: 400, code: 'INVALID_DATE' })
    expect(calendarModel.findCalendarEventsInRange).not.toHaveBeenCalled()
  })
})

describe('createEvent', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  // Given a client that does not belong to the business
  // When a calendar event is created with that clientId
  // Then it should throw a 404 CLIENT_NOT_FOUND and not insert anything
  it('throws CLIENT_NOT_FOUND when the client is not in the business', async () => {
    vi.mocked(clientModel.findClientById).mockResolvedValue(null)

    await expect(
      createEvent('business-1', 'user-1', {
        title: 'Llamar a Juan',
        date: new Date('2026-10-10'),
        clientId: 'client-1',
      }),
    ).rejects.toMatchObject({ statusCode: 404, code: 'CLIENT_NOT_FOUND' })
    expect(calendarModel.insertCalendarEvent).not.toHaveBeenCalled()
  })

  // Given an order that does not belong to the business
  // When a calendar event is created with that orderId
  // Then it should throw a 404 ORDER_NOT_FOUND and not insert anything
  it('throws ORDER_NOT_FOUND when the order is not in the business', async () => {
    vi.mocked(orderModel.findOrderById).mockResolvedValue(null)

    await expect(
      createEvent('business-1', 'user-1', {
        title: 'Seguimiento pedido',
        date: new Date('2026-10-10'),
        orderId: 'order-1',
      }),
    ).rejects.toMatchObject({ statusCode: 404, code: 'ORDER_NOT_FOUND' })
    expect(calendarModel.insertCalendarEvent).not.toHaveBeenCalled()
  })

  // Given an event created with no orderId
  // When it is created
  // Then its source should default to MANUAL
  it('defaults the source to MANUAL when there is no orderId', async () => {
    await createEvent('business-1', 'user-1', {
      title: 'Llamar a Juan',
      date: new Date('2026-10-10'),
    })

    expect(calendarModel.insertCalendarEvent).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'MANUAL' }),
    )
  })

  // Given an event created with an orderId
  // When it is created
  // Then its source should be set to ORDER
  it('sets the source to ORDER when an orderId is given', async () => {
    vi.mocked(orderModel.findOrderById).mockResolvedValue({ id: 'order-1' } as never)

    await createEvent('business-1', 'user-1', {
      title: 'Seguimiento pedido',
      date: new Date('2026-10-10'),
      orderId: 'order-1',
    })

    expect(calendarModel.insertCalendarEvent).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'ORDER', orderId: 'order-1' }),
    )
  })
})

describe('updateEvent', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(calendarModel.findCalendarEventById).mockResolvedValue(existingEvent as never)
  })

  // Given an event id that does not belong to the business
  // When updating it
  // Then it should throw a 404 CALENDAR_EVENT_NOT_FOUND
  it('throws CALENDAR_EVENT_NOT_FOUND when the event does not exist', async () => {
    vi.mocked(calendarModel.findCalendarEventById).mockResolvedValue(null)

    await expect(
      updateEvent('business-1', 'event-1', { title: 'Nuevo título' }),
    ).rejects.toMatchObject({ statusCode: 404, code: 'CALENDAR_EVENT_NOT_FOUND' })
    expect(calendarModel.updateCalendarEventById).not.toHaveBeenCalled()
  })

  // Given an existing event
  // When updating its title
  // Then it should update it through the model
  it('updates the event', async () => {
    await updateEvent('business-1', 'event-1', { title: 'Nuevo título' })

    expect(calendarModel.updateCalendarEventById).toHaveBeenCalledWith(
      'event-1',
      expect.objectContaining({ title: 'Nuevo título' }),
    )
  })
})

describe('rescheduleEvent', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(calendarModel.findCalendarEventById).mockResolvedValue(existingEvent as never)
  })

  // Given an existing event
  // When rescheduling it
  // Then it should update only the date through the model
  it('updates only the date', async () => {
    const newDate = new Date('2026-10-25')

    await rescheduleEvent('business-1', 'event-1', newDate)

    expect(calendarModel.updateCalendarEventById).toHaveBeenCalledWith('event-1', { date: newDate })
  })

  // Given an event id that does not belong to the business
  // When rescheduling it
  // Then it should throw a 404 CALENDAR_EVENT_NOT_FOUND
  it('throws CALENDAR_EVENT_NOT_FOUND when the event does not exist', async () => {
    vi.mocked(calendarModel.findCalendarEventById).mockResolvedValue(null)

    await expect(rescheduleEvent('business-1', 'event-1', new Date())).rejects.toMatchObject({
      statusCode: 404,
      code: 'CALENDAR_EVENT_NOT_FOUND',
    })
    expect(calendarModel.updateCalendarEventById).not.toHaveBeenCalled()
  })
})

describe('deleteEvent', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(calendarModel.findCalendarEventById).mockResolvedValue(existingEvent as never)
  })

  // Given an existing event
  // When deleting it
  // Then it should delete it through the model
  it('deletes the event', async () => {
    await deleteEvent('business-1', 'event-1')

    expect(calendarModel.deleteCalendarEventById).toHaveBeenCalledWith('event-1')
  })

  // Given an event id that does not belong to the business
  // When deleting it
  // Then it should throw a 404 CALENDAR_EVENT_NOT_FOUND
  it('throws CALENDAR_EVENT_NOT_FOUND when the event does not exist', async () => {
    vi.mocked(calendarModel.findCalendarEventById).mockResolvedValue(null)

    await expect(deleteEvent('business-1', 'event-1')).rejects.toMatchObject({
      statusCode: 404,
      code: 'CALENDAR_EVENT_NOT_FOUND',
    })
    expect(calendarModel.deleteCalendarEventById).not.toHaveBeenCalled()
  })
})
