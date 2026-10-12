import { AppError } from '../../shared/AppError'
import { findClientById } from '../client/client.model'
import { findOrderById, findOrdersWithExpectedDateInRange } from '../order/order.model'
import {
  insertCalendarEvent,
  findCalendarEventsInRange,
  findCalendarEventById,
  updateCalendarEventById,
  deleteCalendarEventById,
} from './calendar.model'
import type {
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
  ListCalendarEventsFilters,
  CalendarItem,
} from './calendar.types'
type OrderWithExpectedDate = NonNullable<
  Awaited<ReturnType<typeof findOrdersWithExpectedDateInRange>>
>[number]

type CalendarEventWithClient = Awaited<ReturnType<typeof findCalendarEventsInRange>>[number]

function parseRangeDate(value: string, fieldLabel: string): Date {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    throw new AppError(`${fieldLabel} no es una fecha válida`, 400, 'INVALID_DATE')
  }

  return date
}

function toCalendarItemFromEvent(event: CalendarEventWithClient): CalendarItem {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date,
    source: event.source,
    clientId: event.clientId,
    clientName: event.client?.name ?? null,
    orderId: event.orderId,
    orderLabel: event.order ? `Pedido #${event.order.number} - ${event.order.client.name}` : null,
    editable: true,
  }
}

function toCalendarItemFromOrder(order: OrderWithExpectedDate): CalendarItem {
  return {
    id: order.id,
    title: `Pedido #${order.number} - ${order.client.name}`,
    description: null,
    date: order.expectedDate!,
    source: 'ORDER',
    clientId: order.clientId,
    clientName: order.client.name,
    orderId: order.id,
    orderLabel: `Pedido #${order.number} - ${order.client.name}`,
    editable: false,
  }
}

async function assertClientExists(businessId: string, clientId: string) {
  const client = await findClientById(businessId, clientId)

  if (!client) {
    throw new AppError('Cliente no encontrado', 404, 'CLIENT_NOT_FOUND')
  }
}

async function assertOrderExists(businessId: string, orderId: string) {
  const order = await findOrderById(businessId, orderId)

  if (!order) {
    throw new AppError('Pedido no encontrado', 404, 'ORDER_NOT_FOUND')
  }
}

async function getExistingEvent(businessId: string, eventId: string) {
  const event = await findCalendarEventById(businessId, eventId)

  if (!event) {
    throw new AppError('Evento no encontrado', 404, 'CALENDAR_EVENT_NOT_FOUND')
  }

  return event
}

export async function listEvents(
  businessId: string,
  filters: ListCalendarEventsFilters,
): Promise<CalendarItem[]> {
  const dateFrom = parseRangeDate(filters.dateFrom, 'La fecha de inicio')
  const dateTo = parseRangeDate(filters.dateTo, 'La fecha de fin')

  const [events, orders] = await Promise.all([
    findCalendarEventsInRange(businessId, dateFrom, dateTo),
    findOrdersWithExpectedDateInRange(businessId, dateFrom, dateTo),
  ])

  const items = [
    ...events.map(toCalendarItemFromEvent),
    ...orders.map(toCalendarItemFromOrder),
  ]

  return items.sort((a, b) => a.date.getTime() - b.date.getTime())
}

export async function createEvent(
  businessId: string,
  createdBy: string | undefined,
  input: CreateCalendarEventInput,
) {
  if (input.clientId) {
    await assertClientExists(businessId, input.clientId)
  }

  if (input.orderId) {
    await assertOrderExists(businessId, input.orderId)
  }

  return insertCalendarEvent({
    businessId,
    title: input.title,
    description: input.description,
    date: input.date,
    clientId: input.clientId,
    orderId: input.orderId,
    source: 'MANUAL',
    createdBy,
  })
}

export async function updateEvent(
  businessId: string,
  eventId: string,
  input: UpdateCalendarEventInput,
) {
  await getExistingEvent(businessId, eventId)

  if (input.clientId) {
    await assertClientExists(businessId, input.clientId)
  }

  if (input.orderId) {
    await assertOrderExists(businessId, input.orderId)
  }

  return updateCalendarEventById(eventId, {
    title: input.title,
    description: input.description,
    date: input.date,
    clientId: input.clientId,
    orderId: input.orderId,
  })
}

export async function rescheduleEvent(businessId: string, eventId: string, date: Date) {
  await getExistingEvent(businessId, eventId)

  return updateCalendarEventById(eventId, { date })
}

export async function deleteEvent(businessId: string, eventId: string) {
  await getExistingEvent(businessId, eventId)

  await deleteCalendarEventById(eventId)
}
