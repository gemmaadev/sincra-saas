import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { list, create, update, reschedule, remove } from './calendar.controller'
import * as calendarService from './calendar.service'

function createMockRequest(overrides: Record<string, unknown> = {}): Request {
  return overrides as unknown as Request
}

function createMockResponse() {
  const res = {} as Response
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  res.send = vi.fn().mockReturnValue(res)
  return res
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('list', () => {
  // Given a valid date range
  // When listing calendar events
  // Then it should call the service with the business and range, and respond with the combined events
  it('returns events combining calendar events and orders', async () => {
    const combinedEvents = [
      { id: 'event-1', title: 'Llamar a Juan', editable: true, source: 'MANUAL' },
      { id: 'order-1', title: '#42 - Juan', editable: false, source: 'ORDER' },
    ]
    const listSpy = vi
      .spyOn(calendarService, 'listEvents')
      .mockResolvedValue(combinedEvents as never)

    const req = createMockRequest({
      businessId: 'biz-1',
      query: { dateFrom: '2026-10-01', dateTo: '2026-10-31' },
    })
    const res = createMockResponse()

    await list(req, res, vi.fn() as NextFunction)

    expect(listSpy).toHaveBeenCalledWith('biz-1', {
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
    })
    expect(res.json).toHaveBeenCalledWith({ events: combinedEvents })
  })

  // Given a request missing the date range
  // When listing calendar events
  // Then it should throw a 400 AppError without calling the service
  it('throws a 400 AppError when the date range is missing', async () => {
    const listSpy = vi.spyOn(calendarService, 'listEvents')
    const req = createMockRequest({ businessId: 'biz-1', query: {} })
    const next = vi.fn()

    await list(req, createMockResponse(), next as NextFunction)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, code: 'MISSING_DATE_RANGE' }),
    )
    expect(listSpy).not.toHaveBeenCalled()
  })
})

describe('create', () => {
  // Given a title and a date
  // When creating a calendar event
  // Then it should call the service with the business, the user and the body, and respond 201
  it('creates the event and responds 201 with it', async () => {
    const createSpy = vi
      .spyOn(calendarService, 'createEvent')
      .mockResolvedValue({ id: 'event-1' } as never)

    const req = createMockRequest({
      businessId: 'biz-1',
      userId: 'user-1',
      body: { title: 'Llamar a Juan', date: '2026-10-15T10:00:00.000Z' },
    })
    const res = createMockResponse()

    await create(req, res, vi.fn() as NextFunction)

    expect(createSpy).toHaveBeenCalledWith(
      'biz-1',
      'user-1',
      expect.objectContaining({ title: 'Llamar a Juan' }),
    )
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ event: { id: 'event-1' } })
  })

  // Given a request without a title
  // When creating a calendar event
  // Then it should throw a 400 AppError without calling the service
  it('throws a 400 AppError when the title is missing', async () => {
    const createSpy = vi.spyOn(calendarService, 'createEvent')
    const req = createMockRequest({
      businessId: 'biz-1',
      body: { date: '2026-10-15T10:00:00.000Z' },
    })
    const next = vi.fn()

    await create(req, createMockResponse(), next as NextFunction)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, code: 'MISSING_TITLE' }),
    )
    expect(createSpy).not.toHaveBeenCalled()
  })

  // Given a request with an invalid date
  // When creating a calendar event
  // Then it should throw a 400 AppError without calling the service
  it('throws a 400 AppError when the date is invalid', async () => {
    const createSpy = vi.spyOn(calendarService, 'createEvent')
    const req = createMockRequest({
      businessId: 'biz-1',
      body: { title: 'Llamar a Juan', date: 'not-a-date' },
    })
    const next = vi.fn()

    await create(req, createMockResponse(), next as NextFunction)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, code: 'INVALID_DATE' }),
    )
    expect(createSpy).not.toHaveBeenCalled()
  })
})

describe('update', () => {
  // Given a new title
  // When updating a calendar event
  // Then it should call the service with the business, the event id and the body, and respond with it
  it('updates the event and responds with it', async () => {
    const updateSpy = vi
      .spyOn(calendarService, 'updateEvent')
      .mockResolvedValue({ id: 'event-1', title: 'Nuevo título' } as never)

    const req = createMockRequest({
      businessId: 'biz-1',
      params: { id: 'event-1' },
      body: { title: 'Nuevo título' },
    })
    const res = createMockResponse()

    await update(req, res, vi.fn() as NextFunction)

    expect(updateSpy).toHaveBeenCalledWith(
      'biz-1',
      'event-1',
      expect.objectContaining({ title: 'Nuevo título' }),
    )
    expect(res.json).toHaveBeenCalledWith({ event: { id: 'event-1', title: 'Nuevo título' } })
  })
})

describe('reschedule', () => {
  // Given a new date
  // When rescheduling a calendar event
  // Then it should call the service with only the business, the event id and the date, and respond with it
  it('reschedules the event and responds with it', async () => {
    const rescheduleSpy = vi
      .spyOn(calendarService, 'rescheduleEvent')
      .mockResolvedValue({ id: 'event-1', date: new Date('2026-10-20') } as never)

    const req = createMockRequest({
      businessId: 'biz-1',
      params: { id: 'event-1' },
      body: { date: '2026-10-20T00:00:00.000Z' },
    })
    const res = createMockResponse()

    await reschedule(req, res, vi.fn() as NextFunction)

    expect(rescheduleSpy).toHaveBeenCalledWith('biz-1', 'event-1', new Date('2026-10-20T00:00:00.000Z'))
    expect(res.json).toHaveBeenCalledWith({ event: { id: 'event-1', date: new Date('2026-10-20') } })
  })

  // Given a request with an invalid date
  // When rescheduling a calendar event
  // Then it should throw a 400 AppError without calling the service
  it('throws a 400 AppError when the date is invalid', async () => {
    const rescheduleSpy = vi.spyOn(calendarService, 'rescheduleEvent')
    const req = createMockRequest({
      businessId: 'biz-1',
      params: { id: 'event-1' },
      body: { date: 'not-a-date' },
    })
    const next = vi.fn()

    await reschedule(req, createMockResponse(), next as NextFunction)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, code: 'INVALID_DATE' }),
    )
    expect(rescheduleSpy).not.toHaveBeenCalled()
  })
})

describe('remove', () => {
  // Given an existing event id
  // When deleting a calendar event
  // Then it should call the service with the business and the event id, and respond 204
  it('deletes the event and responds 204', async () => {
    const deleteSpy = vi.spyOn(calendarService, 'deleteEvent').mockResolvedValue(undefined)

    const req = createMockRequest({ businessId: 'biz-1', params: { id: 'event-1' } })
    const res = createMockResponse()

    await remove(req, res, vi.fn() as NextFunction)

    expect(deleteSpy).toHaveBeenCalledWith('biz-1', 'event-1')
    expect(res.status).toHaveBeenCalledWith(204)
    expect(res.send).toHaveBeenCalled()
  })
})
