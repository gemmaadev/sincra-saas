import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { signToken } from '../../shared/jwt'
import * as orderService from './order.service'

describe('order routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  const employeeCookie = `token=${signToken({ userId: 'emp-1', businessId: 'biz-1', role: 'EMPLOYEE' })}`

  describe('POST /orders', () => {
    // Given an authenticated member and a valid body
    // When creating an order
    // Then it should reach the service with the business, the user and the body, and answer 201
    it('creates an order', async () => {
      const order = { id: 'order-1' }
      vi.spyOn(orderService, 'createOrder').mockResolvedValue(order as never)

      const res = await request(app)
        .post('/orders')
        .set('Cookie', employeeCookie)
        .send({ clientId: 'client-1', items: [{ product: 'Camiseta', unitPrice: 15 }] })

      expect(res.status).toBe(201)
      expect(res.body).toEqual({ order })
      expect(orderService.createOrder).toHaveBeenCalledWith(
        'biz-1',
        'emp-1',
        expect.objectContaining({ clientId: 'client-1' }),
      )
    })

    // Given no session cookie
    // When creating an order
    // Then it should answer 401 before reaching the service
    it('answers 401 without a session', async () => {
      const createSpy = vi.spyOn(orderService, 'createOrder')

      const res = await request(app)
        .post('/orders')
        .send({ clientId: 'client-1', items: [{ product: 'Camiseta', unitPrice: 15 }] })

      expect(res.status).toBe(401)
      expect(createSpy).not.toHaveBeenCalled()
    })
  })

  describe('GET /orders', () => {
    // Given an authenticated member
    // When listing orders with filters in the query string
    // Then it should reach the service with those filters and answer 200
    it('lists orders with filters', async () => {
      const paginatedResult = { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }
      vi.spyOn(orderService, 'listOrders').mockResolvedValue(paginatedResult)

      const res = await request(app)
        .get('/orders?status=PENDING&channel=WHATSAPP')
        .set('Cookie', employeeCookie)

      expect(res.status).toBe(200)
      expect(res.body).toEqual(paginatedResult)
      expect(orderService.listOrders).toHaveBeenCalledWith(
        'biz-1',
        expect.objectContaining({ status: 'PENDING', channel: 'WHATSAPP' }),
      )
    })
  })

  describe('GET /orders/:id', () => {
    // Given an authenticated member and an existing order
    // When fetching it by id
    // Then it should answer 200 with the order
    it('returns an order by id', async () => {
      const order = { id: 'order-1' }
      vi.spyOn(orderService, 'getOrderById').mockResolvedValue(order as never)

      const res = await request(app).get('/orders/order-1').set('Cookie', employeeCookie)

      expect(res.status).toBe(200)
      expect(res.body).toEqual({ order })
    })

    // Given an order id that does not exist
    // When fetching it
    // Then it should answer 404
    it('answers 404 when the order does not exist', async () => {
      vi.spyOn(orderService, 'getOrderById').mockResolvedValue(null)

      const res = await request(app).get('/orders/missing-id').set('Cookie', employeeCookie)

      expect(res.status).toBe(404)
    })
  })

  describe('PATCH /orders/:id', () => {
    // Given an authenticated member
    // When updating an order's status to CANCELLED
    // Then it should reach the service with that status and answer 200
    it('cancels an order through a status update', async () => {
      const order = { id: 'order-1', status: 'CANCELLED' }
      vi.spyOn(orderService, 'updateOrder').mockResolvedValue(order as never)

      const res = await request(app)
        .patch('/orders/order-1')
        .set('Cookie', employeeCookie)
        .send({ status: 'CANCELLED' })

      expect(res.status).toBe(200)
      expect(res.body).toEqual({ order })
      expect(orderService.updateOrder).toHaveBeenCalledWith(
        'biz-1',
        'emp-1',
        'order-1',
        expect.objectContaining({ status: 'CANCELLED' }),
      )
    })

    // Given no session cookie
    // When updating an order
    // Then it should answer 401 before reaching the service
    it('answers 401 without a session', async () => {
      const updateSpy = vi.spyOn(orderService, 'updateOrder')

      const res = await request(app).patch('/orders/order-1').send({ description: 'x' })

      expect(res.status).toBe(401)
      expect(updateSpy).not.toHaveBeenCalled()
    })
  })

  describe('DELETE /orders/:id', () => {
    // Given an authenticated member
    // When deleting an order
    // Then it should reach the service and answer 204
    it('deletes an order', async () => {
      vi.spyOn(orderService, 'deleteOrder').mockResolvedValue(undefined)

      const res = await request(app).delete('/orders/order-1').set('Cookie', employeeCookie)

      expect(res.status).toBe(204)
      expect(orderService.deleteOrder).toHaveBeenCalledWith('biz-1', 'order-1')
    })

    // Given no session cookie
    // When deleting an order
    // Then it should answer 401 before reaching the service
    it('answers 401 without a session', async () => {
      const deleteSpy = vi.spyOn(orderService, 'deleteOrder')

      const res = await request(app).delete('/orders/order-1')

      expect(res.status).toBe(401)
      expect(deleteSpy).not.toHaveBeenCalled()
    })
  })

  describe('POST /orders/:id/tags', () => {
    // Given an authenticated member and a tag id
    // When assigning the tag to an order
    // Then it should reach the service with the business, order and tag, and answer 201
    it('assigns a tag to an order', async () => {
      const orderTag = { id: 'assignment-1' }
      vi.spyOn(orderService, 'assignTagToOrder').mockResolvedValue(orderTag as never)

      const res = await request(app)
        .post('/orders/order-1/tags')
        .set('Cookie', employeeCookie)
        .send({ tagId: 'tag-1' })

      expect(res.status).toBe(201)
      expect(res.body).toEqual({ orderTag })
      expect(orderService.assignTagToOrder).toHaveBeenCalledWith('biz-1', 'order-1', 'tag-1')
    })

    // Given a request without a tag id
    // When assigning a tag
    // Then it should answer 400 and never reach the service
    it('answers 400 when the tag id is missing', async () => {
      const assignSpy = vi.spyOn(orderService, 'assignTagToOrder')

      const res = await request(app)
        .post('/orders/order-1/tags')
        .set('Cookie', employeeCookie)
        .send({})

      expect(res.status).toBe(400)
      expect(assignSpy).not.toHaveBeenCalled()
    })

    // Given no session cookie
    // When assigning a tag
    // Then it should answer 401 before reaching the service
    it('answers 401 without a session', async () => {
      const assignSpy = vi.spyOn(orderService, 'assignTagToOrder')

      const res = await request(app).post('/orders/order-1/tags').send({ tagId: 'tag-1' })

      expect(res.status).toBe(401)
      expect(assignSpy).not.toHaveBeenCalled()
    })
  })

  describe('DELETE /orders/:id/tags/:tagId', () => {
    // Given an authenticated member
    // When removing a tag from an order
    // Then it should pass both ids from the path to the service and answer 204
    it('removes a tag from an order', async () => {
      vi.spyOn(orderService, 'removeTagFromOrder').mockResolvedValue(undefined)

      const res = await request(app)
        .delete('/orders/order-1/tags/tag-1')
        .set('Cookie', employeeCookie)

      expect(res.status).toBe(204)
      expect(orderService.removeTagFromOrder).toHaveBeenCalledWith('biz-1', 'order-1', 'tag-1')
    })

    // Given no session cookie
    // When removing a tag
    // Then it should answer 401 before reaching the service
    it('answers 401 without a session', async () => {
      const removeSpy = vi.spyOn(orderService, 'removeTagFromOrder')

      const res = await request(app).delete('/orders/order-1/tags/tag-1')

      expect(res.status).toBe(401)
      expect(removeSpy).not.toHaveBeenCalled()
    })
  })
})
