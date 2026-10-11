import prisma from '../../config/db'
import type { Prisma } from '../../generated/prisma/client'

export async function insertCalendarEvent(data: Prisma.CalendarEventUncheckedCreateInput) {
  return prisma.calendarEvent.create({ data })
}

export async function findCalendarEventsInRange(businessId: string, dateFrom: Date, dateTo: Date) {
  return prisma.calendarEvent.findMany({
    where: { businessId, date: { gte: dateFrom, lte: dateTo } },
    orderBy: { date: 'asc' },
  })
}

export async function findCalendarEventById(businessId: string, eventId: string) {
  return prisma.calendarEvent.findUnique({ where: { id: eventId, businessId } })
}

export async function updateCalendarEventById(
  eventId: string,
  data: Prisma.CalendarEventUncheckedUpdateInput,
) {
  return prisma.calendarEvent.update({ where: { id: eventId }, data })
}

export async function deleteCalendarEventById(eventId: string) {
  await prisma.calendarEvent.delete({ where: { id: eventId } })
}
