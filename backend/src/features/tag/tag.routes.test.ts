import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { signToken } from '../../shared/jwt'
import * as tagService from './tag.service'

describe('tag routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  const adminCookie = `token=${signToken({ userId: 'admin-1', businessId: 'biz-1', role: 'ADMIN' })}`
  const employeeCookie = `token=${signToken({ userId: 'emp-1', businessId: 'biz-1', role: 'EMPLOYEE' })}`

  describe('POST /tags', () => {
    // Given an authenticated employee (not an admin)
    // When creating a tag with valid data
    // Then it should be created, since any member can create tags
    it('lets an employee create a tag', async () => {
      const tag = { id: 'tag-1', name: 'Mayorista', color: '#112233' }
      vi.spyOn(tagService, 'createTag').mockResolvedValue(tag as never)

      const res = await request(app)
        .post('/tags')
        .set('Cookie', employeeCookie)
        .send({ name: '  Mayorista ', color: '#112233' })

      expect(res.status).toBe(201)
      expect(res.body).toEqual({ tag })
      expect(tagService.createTag).toHaveBeenCalledWith('biz-1', 'emp-1', {
        name: 'Mayorista',
        color: '#112233',
        priority: undefined,
      })
    })

    // Given invalid data
    // When creating a tag
    // Then it should answer 400 and never reach the service
    it.each([
      ['a missing name', { color: '#112233' }, 'MISSING_FIELDS'],
      ['an empty name', { name: '   ', color: '#112233' }, 'MISSING_FIELDS'],
      ['a too long name', { name: 'x'.repeat(31), color: '#112233' }, 'INVALID_NAME'],
      ['a color that is not hex', { name: 'VIP', color: 'rojo' }, 'INVALID_COLOR'],
      [
        'an unknown priority',
        { name: 'VIP', color: '#112233', priority: 'URGENT' },
        'INVALID_PRIORITY',
      ],
    ])('rejects %s', async (_label, body, code) => {
      const createSpy = vi.spyOn(tagService, 'createTag')

      const res = await request(app).post('/tags').set('Cookie', employeeCookie).send(body)

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe(code)
      expect(createSpy).not.toHaveBeenCalled()
    })

    // Given no session cookie
    // When creating a tag
    // Then it should answer 401
    it('returns 401 without a session', async () => {
      const res = await request(app).post('/tags').send({ name: 'VIP', color: '#112233' })

      expect(res.status).toBe(401)
    })
  })

  describe('PATCH /tags/:id', () => {
    // Given an authenticated admin
    // When updating a tag
    // Then it should reach the service with the business and the tag id
    it('lets an admin update a tag', async () => {
      const tag = { id: 'tag-1', name: 'Nuevo' }
      vi.spyOn(tagService, 'updateTag').mockResolvedValue(tag as never)

      const res = await request(app)
        .patch('/tags/tag-1')
        .set('Cookie', adminCookie)
        .send({ name: 'Nuevo' })

      expect(res.status).toBe(200)
      expect(res.body).toEqual({ tag })
      expect(tagService.updateTag).toHaveBeenCalledWith('biz-1', 'tag-1', {
        name: 'Nuevo',
        color: undefined,
        priority: undefined,
      })
    })

    // Given an authenticated employee
    // When updating a tag
    // Then requireRole should answer 403 before reaching the service
    it('returns 403 for an employee', async () => {
      const updateSpy = vi.spyOn(tagService, 'updateTag')

      const res = await request(app)
        .patch('/tags/tag-1')
        .set('Cookie', employeeCookie)
        .send({ name: 'Nuevo' })

      expect(res.status).toBe(403)
      expect(updateSpy).not.toHaveBeenCalled()
    })

    // Given an admin and an empty body
    // When updating a tag
    // Then it should answer 400
    it('rejects an update with nothing to change', async () => {
      const res = await request(app).patch('/tags/tag-1').set('Cookie', adminCookie).send({})

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('MISSING_FIELDS')
    })

    // Given an admin and a name that is not text
    // When updating a tag
    // Then it should answer 400 instead of failing with a 500
    it('rejects a name that is not text', async () => {
      const res = await request(app)
        .patch('/tags/tag-1')
        .set('Cookie', adminCookie)
        .send({ name: 123 })

      expect(res.status).toBe(400)
    })
  })

  describe('DELETE /tags/:id', () => {
    // Given an authenticated admin
    // When deleting a tag
    // Then it should answer 204 and call the service
    it('lets an admin delete a tag', async () => {
      vi.spyOn(tagService, 'deleteTag').mockResolvedValue(undefined)

      const res = await request(app).delete('/tags/tag-1').set('Cookie', adminCookie)

      expect(res.status).toBe(204)
      expect(tagService.deleteTag).toHaveBeenCalledWith('biz-1', 'tag-1')
    })

    // Given an authenticated employee
    // When deleting a tag
    // Then requireRole should answer 403 before reaching the service
    it('returns 403 for an employee', async () => {
      const deleteSpy = vi.spyOn(tagService, 'deleteTag')

      const res = await request(app).delete('/tags/tag-1').set('Cookie', employeeCookie)

      expect(res.status).toBe(403)
      expect(deleteSpy).not.toHaveBeenCalled()
    })
  })
})
