import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../app'
import { signToken } from '../../shared/jwt'
import * as userService from './user.service'

describe('user routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  const validCookie = `token=${signToken({ userId: 'user-1', businessId: 'biz-1', role: 'ADMIN' })}`

  describe('GET /user/profile', () => {
    // Given a request with no session cookie
    // When hitting the profile endpoint
    // Then verifyAuth should reject it before it ever reaches the service
    it('returns 401 without a session cookie', async () => {
      const getProfileSpy = vi.spyOn(userService, 'getUserProfile')

      const res = await request(app).get('/user/profile')

      expect(res.status).toBe(401)
      expect(getProfileSpy).not.toHaveBeenCalled()
    })

    // Given a request with a valid session cookie
    // When hitting the profile endpoint
    // Then it should reach the service and return 200
    it('reaches the service when the session cookie is valid', async () => {
      vi.spyOn(userService, 'getUserProfile').mockResolvedValue({
        id: 'user-1',
        name: 'Laura',
        email: 'laura@test.com',
        role: 'ADMIN',
        avatarUrl: null,
        phone: null,
        notificationPrefs: null,
        createdAt: new Date('2026-01-01'),
      } as never)

      const res = await request(app).get('/user/profile').set('Cookie', validCookie)

      expect(res.status).toBe(200)
      expect(userService.getUserProfile).toHaveBeenCalledWith('user-1', 'biz-1')
    })
  })

  describe('PATCH /user/profile', () => {
    // Given a request with no session cookie
    // When trying to update the profile
    // Then verifyAuth should reject it before it ever reaches the service
    it('returns 401 without a session cookie', async () => {
      const updateSpy = vi.spyOn(userService, 'updateUserProfile')

      const res = await request(app).patch('/user/profile').send({ name: 'Nuevo Nombre' })

      expect(res.status).toBe(401)
      expect(updateSpy).not.toHaveBeenCalled()
    })

    // Given a request with a valid session cookie and a valid body
    // When updating the profile
    // Then it should reach the service and return 200
    it('reaches the service when the session cookie is valid', async () => {
      vi.spyOn(userService, 'updateUserProfile').mockResolvedValue({
        id: 'user-1',
        name: 'Nuevo Nombre',
        email: 'laura@test.com',
        role: 'ADMIN',
        avatarUrl: null,
        phone: null,
        notificationPrefs: null,
        createdAt: new Date('2026-01-01'),
      } as never)

      const res = await request(app)
        .patch('/user/profile')
        .set('Cookie', validCookie)
        .send({ name: 'Nuevo Nombre' })

      expect(res.status).toBe(200)
      expect(userService.updateUserProfile).toHaveBeenCalledWith('user-1', 'biz-1', {
        name: 'Nuevo Nombre',
        avatarUrl: undefined,
        phone: undefined,
        notificationPrefs: undefined,
      })
    })
  })

  describe('PATCH /user/password', () => {
    // Given a request with no session cookie
    // When trying to change the password
    // Then verifyAuth should reject it before it ever reaches the service
    it('returns 401 without a session cookie', async () => {
      const changeSpy = vi.spyOn(userService, 'changeUserPassword')

      const res = await request(app)
        .patch('/user/password')
        .send({ currentPassword: 'actual123', newPassword: 'nueva12345' })

      expect(res.status).toBe(401)
      expect(changeSpy).not.toHaveBeenCalled()
    })

    // Given a request with a valid session cookie and a valid body
    // When changing the password
    // Then it should reach the service and return 200
    it('reaches the service when the session cookie is valid', async () => {
      vi.spyOn(userService, 'changeUserPassword').mockResolvedValue(undefined)

      const res = await request(app)
        .patch('/user/password')
        .set('Cookie', validCookie)
        .send({ currentPassword: 'actual123', newPassword: 'nueva12345' })

      expect(res.status).toBe(200)
      expect(userService.changeUserPassword).toHaveBeenCalledWith(
        'user-1',
        'actual123',
        'nueva12345',
      )
    })
  })

  describe('POST /user/avatar', () => {
    // Given a request with no session cookie
    // When trying to upload an avatar
    // Then verifyAuth should reject it before it ever reaches the service
    it('returns 401 without a session cookie', async () => {
      const uploadSpy = vi.spyOn(userService, 'uploadUserAvatar')

      const res = await request(app)
        .post('/user/avatar')
        .attach('avatar', Buffer.from('fake-image'), { filename: 'avatar.png', contentType: 'image/png' })

      expect(res.status).toBe(401)
      expect(uploadSpy).not.toHaveBeenCalled()
    })

    // Given a valid session and an image file
    // When uploading it as the avatar
    // Then it should reach the service with the file's buffer and return 200
    it('reaches the service with the uploaded file when the session is valid', async () => {
      vi.spyOn(userService, 'uploadUserAvatar').mockResolvedValue({
        id: 'user-1',
        name: 'Laura',
        email: 'laura@test.com',
        role: 'ADMIN',
        avatarUrl: 'https://cdn.cloudinary.com/avatar.png',
        phone: null,
        notificationPrefs: null,
        createdAt: new Date('2026-01-01'),
      } as never)

      const res = await request(app)
        .post('/user/avatar')
        .set('Cookie', validCookie)
        .attach('avatar', Buffer.from('fake-image'), { filename: 'avatar.png', contentType: 'image/png' })

      expect(res.status).toBe(200)
      expect(userService.uploadUserAvatar).toHaveBeenCalledWith(
        'user-1',
        'biz-1',
        expect.any(Buffer),
      )
    })

    // Given a valid session but no file attached at all
    // When posting to the avatar endpoint
    // Then it should throw a 400 AppError without touching the service
    it('returns 400 when no file is attached', async () => {
      const uploadSpy = vi.spyOn(userService, 'uploadUserAvatar')

      const res = await request(app).post('/user/avatar').set('Cookie', validCookie)

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('MISSING_FILE')
      expect(uploadSpy).not.toHaveBeenCalled()
    })

    // Given a file that isn't an image
    // When uploading it as the avatar
    // Then multer's fileFilter should reject it with a 400 AppError
    it('returns 400 when the file is not an image', async () => {
      const uploadSpy = vi.spyOn(userService, 'uploadUserAvatar')

      const res = await request(app)
        .post('/user/avatar')
        .set('Cookie', validCookie)
        .attach('avatar', Buffer.from('not an image'), {
          filename: 'file.txt',
          contentType: 'text/plain',
        })

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('INVALID_FILE_TYPE')
      expect(uploadSpy).not.toHaveBeenCalled()
    })

    // Given an image larger than the 2MB limit
    // When uploading it as the avatar
    // Then multer should reject it with a 400 AppError instead of a raw 500
    it('returns 400 when the file is larger than 2MB', async () => {
      const uploadSpy = vi.spyOn(userService, 'uploadUserAvatar')
      const oversizedBuffer = Buffer.alloc(2 * 1024 * 1024 + 1)

      const res = await request(app)
        .post('/user/avatar')
        .set('Cookie', validCookie)
        .attach('avatar', oversizedBuffer, { filename: 'avatar.png', contentType: 'image/png' })

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('FILE_TOO_LARGE')
      expect(uploadSpy).not.toHaveBeenCalled()
    })
  })
})
