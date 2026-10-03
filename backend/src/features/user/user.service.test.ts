import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as userModel from './user.model'
import cloudinary from '../../config/cloudinary'
import * as hash from '../../shared/hash'
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  uploadUserAvatar,
} from './user.service'

vi.mock('./user.model')

vi.mock('../../config/cloudinary', () => ({
  default: {
    uploader: {
      upload_stream: vi.fn(),
    },
  },
}))

vi.mock('../../shared/hash', () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
}))

describe('getUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given an active membership for that user/business
  // When fetching the profile
  // Then it should return the mapped profile
  it('returns the mapped profile when the membership exists and is active', async () => {
    vi.mocked(userModel.findActiveMembershipWithUser).mockResolvedValue({
      role: 'ADMIN',
      avatarUrl: 'https://cdn.test/avatar.png',
      phone: '+34600123456',
      createdAt: new Date('2026-01-01'),
      user: {
        id: 'user-1',
        name: 'Laura',
        email: 'laura@test.com',
        notificationPrefs: { newOrders: true },
      },
    } as never)

    const profile = await getUserProfile('user-1', 'biz-1')

    expect(userModel.findActiveMembershipWithUser).toHaveBeenCalledWith('user-1', 'biz-1')
    expect(profile).toEqual({
      id: 'user-1',
      name: 'Laura',
      email: 'laura@test.com',
      role: 'ADMIN',
      avatarUrl: 'https://cdn.test/avatar.png',
      phone: '+34600123456',
      notificationPrefs: { newOrders: true },
      createdAt: new Date('2026-01-01'),
    })
  })

  // Given no active membership for that user/business (e.g. removed from the team)
  // When fetching the profile
  // Then it should throw a 401 AppError
  it('throws a 401 AppError when there is no active membership', async () => {
    vi.mocked(userModel.findActiveMembershipWithUser).mockResolvedValue(null)

    await expect(getUserProfile('user-1', 'biz-1')).rejects.toMatchObject({ statusCode: 401 })
  })
})

describe('updateUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given only "name" is provided
  // When updating the profile
  // Then the User update should only touch `name`, and BusinessMember shouldn't be touched at all
  it('passes only the provided fields to the model', async () => {
    vi.mocked(userModel.updateUserAndMembership).mockResolvedValue({
      role: 'ADMIN',
      avatarUrl: null,
      phone: null,
      createdAt: new Date('2026-01-01'),
      user: {
        id: 'user-1',
        name: 'Nuevo Nombre',
        email: 'laura@test.com',
        notificationPrefs: null,
      },
    } as never)

    await updateUserProfile('user-1', 'biz-1', { name: 'Nuevo Nombre' })

    expect(userModel.updateUserAndMembership).toHaveBeenCalledWith('user-1', 'biz-1', {
      name: 'Nuevo Nombre',
      avatarUrl: undefined,
      phone: undefined,
      notificationPrefs: undefined,
    })
  })

  // Given only "avatarUrl" is provided
  // When updating the profile
  // Then the User update should be a no-op, and BusinessMember should only touch avatarUrl
  it('does not touch name or notificationPrefs when only avatarUrl changes', async () => {
    vi.mocked(userModel.updateUserAndMembership).mockResolvedValue({
      role: 'ADMIN',
      avatarUrl: 'https://cdn.test/new.png',
      phone: null,
      createdAt: new Date('2026-01-01'),
      user: { id: 'user-1', name: 'Laura', email: 'laura@test.com', notificationPrefs: null },
    } as never)

    await updateUserProfile('user-1', 'biz-1', { avatarUrl: 'https://cdn.test/new.png' })

    expect(userModel.updateUserAndMembership).toHaveBeenCalledWith('user-1', 'biz-1', {
      name: undefined,
      avatarUrl: 'https://cdn.test/new.png',
      phone: undefined,
      notificationPrefs: undefined,
    })
  })
})

describe('changeUserPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given a user with a password set and a correct current password
  // When changing the password
  // Then it should hash the new password and update the user
  it('hashes and stores the new password when the current one is correct', async () => {
    vi.mocked(userModel.findUserById).mockResolvedValue({
      id: 'user-1',
      passwordHash: 'hash-actual',
    } as never)
    vi.mocked(hash.comparePassword).mockResolvedValue(true)
    vi.mocked(hash.hashPassword).mockResolvedValue('hash-nuevo')

    await changeUserPassword('user-1', 'actual123', 'nueva12345')

    expect(hash.comparePassword).toHaveBeenCalledWith('actual123', 'hash-actual')
    expect(hash.hashPassword).toHaveBeenCalledWith('nueva12345')
    expect(userModel.updateUserPasswordHash).toHaveBeenCalledWith('user-1', 'hash-nuevo')
  })

  // Given the current password does not match the stored hash
  // When trying to change the password
  // Then it should throw a 401 AppError and never touch the database
  it('throws a 401 AppError when the current password is incorrect', async () => {
    vi.mocked(userModel.findUserById).mockResolvedValue({
      id: 'user-1',
      passwordHash: 'hash-actual',
    } as never)
    vi.mocked(hash.comparePassword).mockResolvedValue(false)

    await expect(changeUserPassword('user-1', 'incorrecta', 'nueva12345')).rejects.toMatchObject({
      statusCode: 401,
    })
    expect(userModel.updateUserPasswordHash).not.toHaveBeenCalled()
  })

  // Given a user who signed up via social login only (no password set)
  // When trying to change the password
  // Then it should throw a 400 AppError
  it('throws a 400 AppError when the user has no password set', async () => {
    vi.mocked(userModel.findUserById).mockResolvedValue({
      id: 'user-1',
      passwordHash: null,
    } as never)

    await expect(changeUserPassword('user-1', 'actual123', 'nueva12345')).rejects.toMatchObject({
      statusCode: 400,
      code: 'NO_PASSWORD_SET',
    })
  })
})

describe('uploadUserAvatar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Given Cloudinary successfully uploads the image
  // When uploading a user's avatar
  // Then it should store the returned secure_url on the active membership
  it('uploads the file to Cloudinary and stores the resulting URL', async () => {
    vi.mocked(cloudinary.uploader.upload_stream).mockImplementation(((
      _options: unknown,
      callback: (error: unknown, result: unknown) => void,
    ) => {
      callback(undefined, { secure_url: 'https://cdn.cloudinary.com/avatar.png' })
      return { end: vi.fn() }
    }) as never)
    vi.mocked(userModel.updateMembershipAvatar).mockResolvedValue({
      role: 'ADMIN',
      avatarUrl: 'https://cdn.cloudinary.com/avatar.png',
      phone: null,
      createdAt: new Date('2026-01-01'),
      user: { id: 'user-1', name: 'Laura', email: 'laura@test.com', notificationPrefs: null },
    } as never)

    const profile = await uploadUserAvatar('user-1', 'biz-1', Buffer.from('fake-image'))

    expect(userModel.updateMembershipAvatar).toHaveBeenCalledWith(
      'user-1',
      'biz-1',
      'https://cdn.cloudinary.com/avatar.png',
    )
    expect(profile.avatarUrl).toBe('https://cdn.cloudinary.com/avatar.png')
  })

  // Given Cloudinary rejects or fails the upload
  // When uploading a user's avatar
  // Then it should reject without touching the database
  it('rejects when Cloudinary fails to upload the image', async () => {
    vi.mocked(cloudinary.uploader.upload_stream).mockImplementation(((
      _options: unknown,
      callback: (error: unknown, result: unknown) => void,
    ) => {
      callback(new Error('cloudinary is down'), undefined)
      return { end: vi.fn() }
    }) as never)

    await expect(
      uploadUserAvatar('user-1', 'biz-1', Buffer.from('fake-image')),
    ).rejects.toThrow('cloudinary is down')
    expect(userModel.updateMembershipAvatar).not.toHaveBeenCalled()
  })
})
