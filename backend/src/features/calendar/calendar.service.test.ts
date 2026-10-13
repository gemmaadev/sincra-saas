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
        description: null,
        items: [],
        client: { name: 'Juan' },
      },
    ] as never)

    const events = await listEvents('business-1', {
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
    })

    expect(events).toEqual([
      expect.objectContaining({ id: 'order-1', title: '#42 - Juan', orderNumber: 42, editable: false }),
      expect.objectContaining({ id: 'event-1', editable: true }),
    ])
  })

  // Given a manual event with an explicit endDate
  // When it is shown on the calendar
  // Then that endDate should be used as-is
  it('uses the event own endDate when it has one', async () => {
    vi.mocked(calendarModel.findCalendarEventsInRange).mockResolvedValue([
      { ...existingEvent, endDate: new Date('2026-10-10T12:00:00') },
    ] as never)
    vi.mocked(orderModel.findOrdersWithExpectedDateInRange).mockResolvedValue([])

    const events = await listEvents('business-1', {
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
    })

    expect(events).toEqual([
      expect.objectContaining({ endDate: new Date('2026-10-10T12:00:00') }),
    ])
  })

  // Given a manual event with no explicit endDate
  // When it is shown on the calendar
  // Then endDate should fall back to the event's own date (a zero-duration instant)
  it("falls back to the event's date when there is no endDate", async () => {
    vi.mocked(calendarModel.findCalendarEventsInRange).mockResolvedValue([
      { ...existingEvent, endDate: null },
    ] as never)
    vi.mocked(orderModel.findOrdersWithExpectedDateInRange).mockResolvedValue([])

    const events = await listEvents('business-1', {
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
    })

    expect(events).toEqual([
      expect.objectContaining({ date: existingEvent.date, endDate: existingEvent.date }),
    ])
  })

  // Given an order with its own description
  // When it is shown on the calendar
  // Then that description should be used as-is
  it("uses the order's own description when it has one", async () => {
    vi.mocked(calendarModel.findCalendarEventsInRange).mockResolvedValue([])
    vi.mocked(orderModel.findOrdersWithExpectedDateInRange).mockResolvedValue([
      {
        id: 'order-1',
        number: 42,
        clientId: 'client-1',
        expectedDate: new Date('2026-10-05'),
        status: 'PENDING',
        description: 'Entregar en portería',
        items: [{ product: 'Camiseta', quantity: 1 }],
        client: { name: 'Juan' },
      },
    ] as never)

    const events = await listEvents('business-1', {
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
    })

    expect(events).toEqual([expect.objectContaining({ description: 'Entregar en portería' })])
  })

  // Given an order with no description of its own, but with items
  // When it is shown on the calendar
  // Then the description should fall back to a summary built from its items
  it('falls back to an item summary when the order has no description', async () => {
    vi.mocked(calendarModel.findCalendarEventsInRange).mockResolvedValue([])
    vi.mocked(orderModel.findOrdersWithExpectedDateInRange).mockResolvedValue([
      {
        id: 'order-1',
        number: 42,
        clientId: 'client-1',
        expectedDate: new Date('2026-10-05'),
        status: 'PENDING',
        description: null,
        items: [{ product: 'Camiseta', quantity: 2 }],
        client: { name: 'Juan' },
      },
    ] as never)

    const events = await listEvents('business-1', {
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
    })

    expect(events).toEqual([expect.objectContaining({ description: 'Camiseta x2' })])
  })

  // Given a manual calendar event linked to an order (not a client)
  // When listing events
  // Then its orderLabel should be resolved from the order's number and client name
  it('resolves orderLabel for an event linked to an order', async () => {
    vi.mocked(calendarModel.findCalendarEventsInRange).mockResolvedValue([
      {
        ...existingEvent,
        orderId: 'order-1',
        order: { number: 42, client: { name: 'Juan' } },
      },
    ] as never)
    vi.mocked(orderModel.findOrdersWithExpectedDateInRange).mockResolvedValue([])

    const events = await listEvents('business-1', {
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
    })

    expect(events).toEqual([
      expect.objectContaining({ orderLabel: 'Pedido #42 - Juan', orderNumber: 42 }),
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
  // Then its source should still be MANUAL: ORDER is reserved for an order's own expectedDate,
  // not for a manually created follow-up that merely links to an order for context
  it('keeps the source as MANUAL even when an orderId is given', async () => {
    vi.mocked(orderModel.findOrderById).mockResolvedValue({ id: 'order-1' } as never)

    await createEvent('business-1', 'user-1', {
      title: 'Seguimiento pedido',
      date: new Date('2026-10-10'),
      orderId: 'order-1',
    })

    expect(calendarModel.insertCalendarEvent).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'MANUAL', orderId: 'order-1' }),
    )
  })

  // Given an event with a valid endDate (on or after its date)
  // When it is created
  // Then endDate should be carried over
  it('carries the endDate over when it is valid', async () => {
    await createEvent('business-1', 'user-1', {
      title: 'Llamar a Juan',
      date: new Date('2026-10-10T10:00:00'),
      endDate: new Date('2026-10-10T11:00:00'),
    })

    expect(calendarModel.insertCalendarEvent).toHaveBeenCalledWith(
      expect.objectContaining({ endDate: new Date('2026-10-10T11:00:00') }),
    )
  })

  // Given an endDate earlier than the event's own date
  // When it is created
  // Then it should throw a 400 INVALID_DATE_RANGE and not insert anything
  it('rejects an endDate earlier than the date', async () => {
    await expect(
      createEvent('business-1', 'user-1', {
        title: 'Llamar a Juan',
        date: new Date('2026-10-10T11:00:00'),
        endDate: new Date('2026-10-10T10:00:00'),
      }),
    ).rejects.toMatchObject({ statusCode: 400, code: 'INVALID_DATE_RANGE' })
    expect(calendarModel.insertCalendarEvent).not.toHaveBeenCalled()
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

  // Given a valid endDate for the event's existing date
  // When updating it
  // Then endDate should be carried over
  it('carries the endDate over when it is valid', async () => {
    await updateEvent('business-1', 'event-1', {
      endDate: new Date('2026-10-10T12:00:00'),
    })

    expect(calendarModel.updateCalendarEventById).toHaveBeenCalledWith(
      'event-1',
      expect.objectContaining({ endDate: new Date('2026-10-10T12:00:00') }),
    )
  })

  // Given a new endDate earlier than the event's existing date
  // When updating it
  // Then it should throw a 400 INVALID_DATE_RANGE and not update anything
  it('rejects a new endDate earlier than the existing date', async () => {
    await expect(
      updateEvent('business-1', 'event-1', { endDate: new Date('2026-10-01') }),
    ).rejects.toMatchObject({ statusCode: 400, code: 'INVALID_DATE_RANGE' })
    expect(calendarModel.updateCalendarEventById).not.toHaveBeenCalled()
  })

  // Given the event already has an endDate
  // When updating its date to something later than that endDate
  // Then it should throw a 400 INVALID_DATE_RANGE, since the existing endDate would become invalid
  it('rejects a new date later than the existing endDate', async () => {
    vi.mocked(calendarModel.findCalendarEventById).mockResolvedValue({
      ...existingEvent,
      endDate: new Date('2026-10-10T12:00:00'),
    } as never)

    await expect(
      updateEvent('business-1', 'event-1', { date: new Date('2026-10-10T13:00:00') }),
    ).rejects.toMatchObject({ statusCode: 400, code: 'INVALID_DATE_RANGE' })
    expect(calendarModel.updateCalendarEventById).not.toHaveBeenCalled()
  })
})

describe('rescheduleEvent', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(calendarModel.findCalendarEventById).mockResolvedValue(existingEvent as never)
  })

  // Given an existing event
  // When rescheduling it with no endDate
  // Then it should update only the date through the model
  it('updates only the date', async () => {
    const newDate = new Date('2026-10-25')

    await rescheduleEvent('business-1', 'event-1', newDate)

    expect(calendarModel.updateCalendarEventById).toHaveBeenCalledWith('event-1', { date: newDate })
  })

  // Given a drag that moves both the start and the end (preserving duration)
  // When rescheduling it
  // Then both date and endDate should be updated through the model
  it('updates both the date and the endDate', async () => {
    const newDate = new Date('2026-10-25T10:00:00')
    const newEndDate = new Date('2026-10-25T11:00:00')

    await rescheduleEvent('business-1', 'event-1', newDate, newEndDate)

    expect(calendarModel.updateCalendarEventById).toHaveBeenCalledWith('event-1', {
      date: newDate,
      endDate: newEndDate,
    })
  })

  // Given an endDate earlier than the new date
  // When rescheduling it
  // Then it should throw a 400 INVALID_DATE_RANGE and not update anything
  it('rejects an endDate earlier than the new date', async () => {
    await expect(
      rescheduleEvent(
        'business-1',
        'event-1',
        new Date('2026-10-25T11:00:00'),
        new Date('2026-10-25T10:00:00'),
      ),
    ).rejects.toMatchObject({ statusCode: 400, code: 'INVALID_DATE_RANGE' })
    expect(calendarModel.updateCalendarEventById).not.toHaveBeenCalled()
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
