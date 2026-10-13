import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { signToken } from '../../shared/jwt'
import * as calendarService from './calendar.service'

describe('calendar routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  const employeeCookie = `token=${signToken({ userId: 'emp-1', businessId: 'biz-1', role: 'EMPLOYEE' })}`

  describe('GET /calendar', () => {
    // Given an authenticated member and a date range in the query string
    // When listing calendar events
    // Then it should reach the service with that range and answer 200
    it('lists events in a date range', async () => {
      const events = [{ id: 'event-1' }]
      vi.spyOn(calendarService, 'listEvents').mockResolvedValue(events as never)

      const res = await request(app)
        .get('/calendar?dateFrom=2026-10-01&dateTo=2026-10-31')
        .set('Cookie', employeeCookie)

      expect(res.status).toBe(200)
      expect(res.body).toEqual({ events })
      expect(calendarService.listEvents).toHaveBeenCalledWith('biz-1', {
        dateFrom: '2026-10-01',
        dateTo: '2026-10-31',
      })
    })

    // Given no session cookie
    // When listing calendar events
    // Then it should answer 401 before reaching the service
    it('answers 401 without a session', async () => {
      const listSpy = vi.spyOn(calendarService, 'listEvents')

      const res = await request(app).get('/calendar?dateFrom=2026-10-01&dateTo=2026-10-31')

      expect(res.status).toBe(401)
      expect(listSpy).not.toHaveBeenCalled()
    })
  })

  describe('POST /calendar', () => {
    // Given an authenticated member and a valid body
    // When creating a calendar event
    // Then it should reach the service with the business, the user and the body, and answer 201
    it('creates a calendar event', async () => {
      const event = { id: 'event-1' }
      vi.spyOn(calendarService, 'createEvent').mockResolvedValue(event as never)

      const res = await request(app)
        .post('/calendar')
        .set('Cookie', employeeCookie)
        .send({ title: 'Llamar a Juan', date: '2026-10-15T10:00:00.000Z' })

      expect(res.status).toBe(201)
      expect(res.body).toEqual({ event })
      expect(calendarService.createEvent).toHaveBeenCalledWith(
        'biz-1',
        'emp-1',
        expect.objectContaining({ title: 'Llamar a Juan' }),
      )
    })

    // Given no session cookie
    // When creating a calendar event
    // Then it should answer 401 before reaching the service
    it('answers 401 without a session', async () => {
      const createSpy = vi.spyOn(calendarService, 'createEvent')

      const res = await request(app)
        .post('/calendar')
        .send({ title: 'Llamar a Juan', date: '2026-10-15T10:00:00.000Z' })

      expect(res.status).toBe(401)
      expect(createSpy).not.toHaveBeenCalled()
    })
  })

  describe('PATCH /calendar/:id', () => {
    // Given an authenticated member
    // When updating a calendar event's title
    // Then it should reach the service with that title and answer 200
    it('updates a calendar event', async () => {
      const event = { id: 'event-1', title: 'Nuevo título' }
      vi.spyOn(calendarService, 'updateEvent').mockResolvedValue(event as never)

      const res = await request(app)
        .patch('/calendar/event-1')
        .set('Cookie', employeeCookie)
        .send({ title: 'Nuevo título' })

      expect(res.status).toBe(200)
      expect(res.body).toEqual({ event })
      expect(calendarService.updateEvent).toHaveBeenCalledWith(
        'biz-1',
        'event-1',
        expect.objectContaining({ title: 'Nuevo título' }),
      )
    })

    // Given no session cookie
    // When updating a calendar event
    // Then it should answer 401 before reaching the service
    it('answers 401 without a session', async () => {
      const updateSpy = vi.spyOn(calendarService, 'updateEvent')

      const res = await request(app).patch('/calendar/event-1').send({ title: 'x' })

      expect(res.status).toBe(401)
      expect(updateSpy).not.toHaveBeenCalled()
    })
  })

  describe('PATCH /calendar/:id/reschedule', () => {
    // Given an authenticated member and a new date
    // When rescheduling a calendar event
    // Then it should reach the service with only that date and answer 200
    it('reschedules a calendar event', async () => {
      const event = { id: 'event-1', date: '2026-10-20T00:00:00.000Z' }
      vi.spyOn(calendarService, 'rescheduleEvent').mockResolvedValue(event as never)

      const res = await request(app)
        .patch('/calendar/event-1/reschedule')
        .set('Cookie', employeeCookie)
        .send({ date: '2026-10-20T00:00:00.000Z' })

      expect(res.status).toBe(200)
      expect(res.body).toEqual({ event })
      expect(calendarService.rescheduleEvent).toHaveBeenCalledWith(
        'biz-1',
        'event-1',
        new Date('2026-10-20T00:00:00.000Z'),
        undefined,
      )
    })

    // Given no session cookie
    // When rescheduling a calendar event
    // Then it should answer 401 before reaching the service
    it('answers 401 without a session', async () => {
      const rescheduleSpy = vi.spyOn(calendarService, 'rescheduleEvent')

      const res = await request(app)
        .patch('/calendar/event-1/reschedule')
        .send({ date: '2026-10-20T00:00:00.000Z' })

      expect(res.status).toBe(401)
      expect(rescheduleSpy).not.toHaveBeenCalled()
    })
  })

  describe('DELETE /calendar/:id', () => {
    // Given an authenticated member
    // When deleting a calendar event
    // Then it should reach the service and answer 204
    it('deletes a calendar event', async () => {
      vi.spyOn(calendarService, 'deleteEvent').mockResolvedValue(undefined)

      const res = await request(app).delete('/calendar/event-1').set('Cookie', employeeCookie)

      expect(res.status).toBe(204)
      expect(calendarService.deleteEvent).toHaveBeenCalledWith('biz-1', 'event-1')
    })

    // Given no session cookie
    // When deleting a calendar event
    // Then it should answer 401 before reaching the service
    it('answers 401 without a session', async () => {
      const deleteSpy = vi.spyOn(calendarService, 'deleteEvent')

      const res = await request(app).delete('/calendar/event-1')

      expect(res.status).toBe(401)
      expect(deleteSpy).not.toHaveBeenCalled()
    })
  })
})
