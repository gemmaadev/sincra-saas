import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { getProfile, updateProfile, changePassword, uploadAvatar } from './user.controller'
import * as userService from './user.service'
import { AppError } from '../../shared/AppError'

function createMockRequest(overrides: Record<string, unknown> = {}): Request {
  return overrides as unknown as Request
}

function createMockResponse() {
  const res = {} as Response
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe('getProfile', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given an authenticated request with a valid membership
  // When fetching the profile
  // Then it should return the profile from the service
  it('returns the profile for the authenticated user', async () => {
    const profile = {
      id: 'user-1',
      name: 'Laura',
      email: 'laura@test.com',
      role: 'ADMIN',
      avatarUrl: null,
      phone: null,
      notificationPrefs: null,
      createdAt: new Date('2026-01-01'),
    }
    vi.spyOn(userService, 'getUserProfile').mockResolvedValue(profile as never)

    const req = createMockRequest({ userId: 'user-1', businessId: 'biz-1' })
    const res = createMockResponse()

    await getProfile(req, res, vi.fn() as NextFunction)

    expect(userService.getUserProfile).toHaveBeenCalledWith('user-1', 'biz-1')
    expect(res.json).toHaveBeenCalledWith({ user: profile })
  })

  // Given a session whose membership no longer exists
  // When fetching the profile
  // Then it should propagate the 401 AppError thrown by the service
  it('propagates a 401 AppError when the session is no longer valid', async () => {
    vi.spyOn(userService, 'getUserProfile').mockRejectedValue(
      new AppError('Tu sesión ya no es válida', 401, 'UNAUTHORIZED'),
    )

    const req = createMockRequest({ userId: 'user-1', businessId: 'biz-1' })
    const res = createMockResponse()
    const next = vi.fn()

    await getProfile(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    const calledError = next.mock.calls[0][0] as AppError
    expect(calledError.statusCode).toBe(401)
  })
})

describe('updateProfile', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given a valid partial update
  // When updating the profile
  // Then it should call the service with the given fields and return the updated profile
  it('updates the profile and returns it', async () => {
    const updated = {
      id: 'user-1',
      name: 'Laura García',
      email: 'laura@test.com',
      role: 'ADMIN',
      avatarUrl: 'https://cdn.test/avatar.png',
      phone: '+34600123456',
      notificationPrefs: { newOrders: true },
      createdAt: new Date('2026-01-01'),
    }
    vi.spyOn(userService, 'updateUserProfile').mockResolvedValue(updated as never)

    const req = createMockRequest({
      userId: 'user-1',
      businessId: 'biz-1',
      body: {
        name: 'Laura García',
        avatarUrl: 'https://cdn.test/avatar.png',
        phone: '+34600123456',
        notificationPrefs: { newOrders: true },
      },
    })
    const res = createMockResponse()

    await updateProfile(req, res, vi.fn() as NextFunction)

    expect(userService.updateUserProfile).toHaveBeenCalledWith('user-1', 'biz-1', {
      name: 'Laura García',
      avatarUrl: 'https://cdn.test/avatar.png',
      phone: '+34600123456',
      notificationPrefs: { newOrders: true },
    })
    expect(res.json).toHaveBeenCalledWith({ user: updated })
  })

  // Given a name shorter than 2 characters
  // When updating the profile
  // Then it should throw a 400 AppError without touching the service
  it('throws a 400 AppError when the name is too short', async () => {
    const updateSpy = vi.spyOn(userService, 'updateUserProfile')

    const req = createMockRequest({
      userId: 'user-1',
      businessId: 'biz-1',
      body: { name: 'L' },
    })
    const res = createMockResponse()
    const next = vi.fn()

    await updateProfile(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    const calledError = next.mock.calls[0][0] as AppError
    expect(calledError.statusCode).toBe(400)
    expect(calledError.code).toBe('INVALID_NAME')
    expect(updateSpy).not.toHaveBeenCalled()
  })

  // Given a body with no fields at all
  // When updating the profile
  // Then it should still call the service, since no field is mandatory in a partial update
  it('calls the service even when the body is empty', async () => {
    vi.spyOn(userService, 'updateUserProfile').mockResolvedValue({} as never)

    const req = createMockRequest({ userId: 'user-1', businessId: 'biz-1', body: {} })
    const res = createMockResponse()

    await updateProfile(req, res, vi.fn() as NextFunction)

    expect(userService.updateUserProfile).toHaveBeenCalledWith('user-1', 'biz-1', {
      name: undefined,
      avatarUrl: undefined,
      phone: undefined,
      notificationPrefs: undefined,
    })
  })
})

describe('changePassword', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given a valid current password and a strong enough new password
  // When changing the password
  // Then it should call the service and respond with success: true
  it('changes the password and responds with success: true', async () => {
    const changeSpy = vi.spyOn(userService, 'changeUserPassword').mockResolvedValue(undefined)

    const req = createMockRequest({
      userId: 'user-1',
      body: { currentPassword: 'actual123', newPassword: 'nueva12345' },
    })
    const res = createMockResponse()

    await changePassword(req, res, vi.fn() as NextFunction)

    expect(changeSpy).toHaveBeenCalledWith('user-1', 'actual123', 'nueva12345')
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })

  // Given a request missing currentPassword or newPassword
  // When trying to change the password
  // Then it should throw a 400 AppError without touching the service
  it('throws a 400 AppError when a field is missing', async () => {
    const changeSpy = vi.spyOn(userService, 'changeUserPassword')

    const req = createMockRequest({ userId: 'user-1', body: { currentPassword: 'actual123' } })
    const res = createMockResponse()
    const next = vi.fn()

    await changePassword(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    const calledError = next.mock.calls[0][0] as AppError
    expect(calledError.statusCode).toBe(400)
    expect(calledError.code).toBe('MISSING_FIELDS')
    expect(changeSpy).not.toHaveBeenCalled()
  })

  // Given a new password shorter than 8 characters
  // When trying to change the password
  // Then it should throw a 400 AppError with the INVALID_PASSWORD code
  it('throws a 400 AppError when the new password is too short', async () => {
    const req = createMockRequest({
      userId: 'user-1',
      body: { currentPassword: 'actual123', newPassword: '1234' },
    })
    const res = createMockResponse()
    const next = vi.fn()

    await changePassword(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    const calledError = next.mock.calls[0][0] as AppError
    expect(calledError.statusCode).toBe(400)
    expect(calledError.code).toBe('INVALID_PASSWORD')
  })

  // Given the current password does not match what's stored
  // When trying to change the password
  // Then it should propagate the 401 AppError thrown by the service
  it('propagates a 401 AppError when the current password is incorrect', async () => {
    vi.spyOn(userService, 'changeUserPassword').mockRejectedValue(
      new AppError('La contraseña actual no es correcta', 401, 'INVALID_PASSWORD'),
    )

    const req = createMockRequest({
      userId: 'user-1',
      body: { currentPassword: 'incorrecta', newPassword: 'nueva12345' },
    })
    const res = createMockResponse()
    const next = vi.fn()

    await changePassword(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    const calledError = next.mock.calls[0][0] as AppError
    expect(calledError.statusCode).toBe(401)
  })
})

describe('uploadAvatar', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given a request with a file attached (as multer would leave it on req.file)
  // When uploading the avatar
  // Then it should call the service with the file's buffer and return the updated profile
  it('uploads the avatar and returns the updated profile', async () => {
    const profile = {
      id: 'user-1',
      name: 'Laura',
      email: 'laura@test.com',
      role: 'ADMIN',
      avatarUrl: 'https://cdn.cloudinary.com/avatar.png',
      phone: null,
      notificationPrefs: null,
      createdAt: new Date('2026-01-01'),
    }
    vi.spyOn(userService, 'uploadUserAvatar').mockResolvedValue(profile as never)
    const fileBuffer = Buffer.from('fake-image')

    const req = createMockRequest({
      userId: 'user-1',
      businessId: 'biz-1',
      file: { buffer: fileBuffer },
    })
    const res = createMockResponse()

    await uploadAvatar(req, res, vi.fn() as NextFunction)

    expect(userService.uploadUserAvatar).toHaveBeenCalledWith('user-1', 'biz-1', fileBuffer)
    expect(res.json).toHaveBeenCalledWith({ user: profile })
  })

  // Given a request with no file attached at all
  // When trying to upload the avatar
  // Then it should throw a 400 AppError without touching the service
  it('throws a 400 AppError when no file is attached', async () => {
    const uploadSpy = vi.spyOn(userService, 'uploadUserAvatar')

    const req = createMockRequest({ userId: 'user-1', businessId: 'biz-1' })
    const res = createMockResponse()
    const next = vi.fn()

    await uploadAvatar(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    const calledError = next.mock.calls[0][0] as AppError
    expect(calledError.statusCode).toBe(400)
    expect(calledError.code).toBe('MISSING_FILE')
    expect(uploadSpy).not.toHaveBeenCalled()
  })
})
