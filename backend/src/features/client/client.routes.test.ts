import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { signToken } from '../../shared/jwt'
import * as clientService from './client.service'

describe('client tag routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  const employeeCookie = `token=${signToken({ userId: 'emp-1', businessId: 'biz-1', role: 'EMPLOYEE' })}`

  describe('POST /clients/:id/tags', () => {
    // Given an authenticated member (any role) and a tag id
    // When assigning the tag to a client
    // Then it should reach the service with the business, client and tag, and answer 201
    it('assigns a tag to a client', async () => {
      const clientTag = { id: 'assignment-1' }
      vi.spyOn(clientService, 'assignTagToClient').mockResolvedValue(clientTag as never)

      const res = await request(app)
        .post('/clients/client-1/tags')
        .set('Cookie', employeeCookie)
        .send({ tagId: 'tag-1' })

      expect(res.status).toBe(201)
      expect(res.body).toEqual({ clientTag })
      expect(clientService.assignTagToClient).toHaveBeenCalledWith('biz-1', 'client-1', 'tag-1')
    })

    // Given a request without a tag id
    // When assigning a tag
    // Then it should answer 400 and never reach the service
    it('answers 400 when the tag id is missing', async () => {
      const assignSpy = vi.spyOn(clientService, 'assignTagToClient')

      const res = await request(app)
        .post('/clients/client-1/tags')
        .set('Cookie', employeeCookie)
        .send({})

      expect(res.status).toBe(400)
      expect(assignSpy).not.toHaveBeenCalled()
    })

    // Given no session cookie
    // When assigning a tag
    // Then it should answer 401 before reaching the service
    it('answers 401 without a session', async () => {
      const assignSpy = vi.spyOn(clientService, 'assignTagToClient')

      const res = await request(app).post('/clients/client-1/tags').send({ tagId: 'tag-1' })

      expect(res.status).toBe(401)
      expect(assignSpy).not.toHaveBeenCalled()
    })
  })

  describe('DELETE /clients/:id/tags/:tagId', () => {
    // Given an authenticated member
    // When removing a tag from a client
    // Then it should pass both ids from the path to the service and answer 204
    it('removes a tag from a client', async () => {
      vi.spyOn(clientService, 'removeTagFromClient').mockResolvedValue(undefined)

      const res = await request(app)
        .delete('/clients/client-1/tags/tag-1')
        .set('Cookie', employeeCookie)

      expect(res.status).toBe(204)
      expect(clientService.removeTagFromClient).toHaveBeenCalledWith('biz-1', 'client-1', 'tag-1')
    })

    // Given no session cookie
    // When removing a tag
    // Then it should answer 401 before reaching the service
    it('answers 401 without a session', async () => {
      const removeSpy = vi.spyOn(clientService, 'removeTagFromClient')

      const res = await request(app).delete('/clients/client-1/tags/tag-1')

      expect(res.status).toBe(401)
      expect(removeSpy).not.toHaveBeenCalled()
    })
  })
})
