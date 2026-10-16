import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import {
  connect,
  disconnect,
  getBusiness,
  updateBusiness,
  getChannelsStatus,
  deleteAccountHandler,
} from './settings.controller'
import * as settingsService from './settings.service'
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

describe('connect', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given a valid channel and an authenticated admin request
  // When connecting it
  // Then it should call the service and respond with the connected channel
  it('connects the channel and responds with it', async () => {
    const connectSpy = vi
      .spyOn(settingsService, 'connectChannel')
      .mockResolvedValue({ channel: 'GMAIL', status: 'CONNECTED' } as never)

    const req = createMockRequest({
      businessId: 'biz-1',
      userId: 'user-1',
      body: { channel: 'GMAIL' },
    })
    const res = createMockResponse()

    await connect(req, res, vi.fn() as NextFunction)

    expect(connectSpy).toHaveBeenCalledWith('biz-1', 'GMAIL', 'user-1')
    expect(res.json).toHaveBeenCalledWith({ connectedChannel: { channel: 'GMAIL', status: 'CONNECTED' } })
  })

  // Given a request with an invalid channel name
  // When trying to connect it
  // Then it should throw a 400 AppError without touching the service
  it('throws a 400 AppError when the channel is invalid', async () => {
    const connectSpy = vi.spyOn(settingsService, 'connectChannel')

    const req = createMockRequest({ businessId: 'biz-1', userId: 'user-1', body: { channel: 'FAX' } })
    const res = createMockResponse()
    const next = vi.fn()

    await connect(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    const calledError = next.mock.calls[0][0] as AppError
    expect(calledError.statusCode).toBe(400)
    expect(calledError.code).toBe('INVALID_CHANNEL')
    expect(connectSpy).not.toHaveBeenCalled()
  })
})

describe('disconnect', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given a valid channel
  // When disconnecting it
  // Then it should call the service and respond with the updated channel
  it('disconnects the channel and responds with it', async () => {
    const disconnectSpy = vi
      .spyOn(settingsService, 'disconnectChannel')
      .mockResolvedValue({ channel: 'GMAIL', status: 'DISCONNECTED' } as never)

    const req = createMockRequest({
      businessId: 'biz-1',
      userId: 'user-1',
      body: { channel: 'GMAIL' },
    })
    const res = createMockResponse()

    await disconnect(req, res, vi.fn() as NextFunction)

    expect(disconnectSpy).toHaveBeenCalledWith('biz-1', 'GMAIL', 'user-1')
    expect(res.json).toHaveBeenCalledWith({
      connectedChannel: { channel: 'GMAIL', status: 'DISCONNECTED' },
    })
  })

  // Given a request missing the channel field
  // When trying to disconnect
  // Then it should throw a 400 AppError without touching the service
  it('throws a 400 AppError when the channel is missing', async () => {
    const disconnectSpy = vi.spyOn(settingsService, 'disconnectChannel')

    const req = createMockRequest({ businessId: 'biz-1', userId: 'user-1', body: {} })
    const res = createMockResponse()
    const next = vi.fn()

    await disconnect(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    expect(disconnectSpy).not.toHaveBeenCalled()
  })
})

describe('getBusiness', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given an authenticated request
  // When fetching business settings
  // Then it should return the business from the service
  it('returns the business for the authenticated business', async () => {
    vi.spyOn(settingsService, 'getBusinessSettings').mockResolvedValue({
      id: 'biz-1',
      name: 'Tienda',
    } as never)

    const req = createMockRequest({ businessId: 'biz-1' })
    const res = createMockResponse()

    await getBusiness(req, res, vi.fn() as NextFunction)

    expect(settingsService.getBusinessSettings).toHaveBeenCalledWith('biz-1')
    expect(res.json).toHaveBeenCalledWith({ business: { id: 'biz-1', name: 'Tienda' } })
  })
})

describe('updateBusiness', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given new business data and an authenticated admin request
  // When updating business settings
  // Then it should call the service and respond with the updated business
  it('updates the business and responds with it', async () => {
    const updateSpy = vi
      .spyOn(settingsService, 'updateBusinessSettings')
      .mockResolvedValue({ id: 'biz-1', name: 'Nuevo nombre' } as never)

    const req = createMockRequest({
      businessId: 'biz-1',
      userId: 'user-1',
      body: { name: 'Nuevo nombre' },
    })
    const res = createMockResponse()

    await updateBusiness(req, res, vi.fn() as NextFunction)

    expect(updateSpy).toHaveBeenCalledWith('biz-1', { name: 'Nuevo nombre' }, 'user-1')
    expect(res.json).toHaveBeenCalledWith({ business: { id: 'biz-1', name: 'Nuevo nombre' } })
  })
})

describe('getChannelsStatus', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given an authenticated request
  // When fetching the channels status
  // Then it should return the channels from the service
  it('returns the channels for the authenticated business', async () => {
    const channels = [{ channel: 'GMAIL', status: 'CONNECTED' }]
    vi.spyOn(settingsService, 'getConnectedChannelsStatus').mockResolvedValue(channels as never)

    const req = createMockRequest({ businessId: 'biz-1' })
    const res = createMockResponse()

    await getChannelsStatus(req, res, vi.fn() as NextFunction)

    expect(settingsService.getConnectedChannelsStatus).toHaveBeenCalledWith('biz-1')
    expect(res.json).toHaveBeenCalledWith({ channels })
  })
})

describe('deleteAccountHandler', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given an authenticated admin request
  // When deleting the account
  // Then it should call the service and respond with success: true
  it('deletes the account and responds with success: true', async () => {
    const deleteSpy = vi.spyOn(settingsService, 'deleteAccount').mockResolvedValue(undefined)

    const req = createMockRequest({ businessId: 'biz-1', userId: 'user-1' })
    const res = createMockResponse()

    await deleteAccountHandler(req, res, vi.fn() as NextFunction)

    expect(deleteSpy).toHaveBeenCalledWith('biz-1', 'user-1')
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })
})
