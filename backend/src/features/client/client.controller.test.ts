import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { create, list, getById, update, remove, assignTag, removeTag } from './client.controller'
import * as clientService from './client.service'
import { AppError } from '../../shared/AppError'

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

describe('create', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given a valid name and at least one channel
  // When creating a client
  // Then it should call the service with the business id and the body, and respond 201
  it('creates the client and responds 201 with it', async () => {
    const createSpy = vi
      .spyOn(clientService, 'createClient')
      .mockResolvedValue({ id: 'client-1', name: 'Laura García' } as never)

    const req = createMockRequest({
      businessId: 'biz-1',
      body: { name: 'Laura García', channels: ['WHATSAPP'] },
    })
    const res = createMockResponse()

    await create(req, res, vi.fn() as NextFunction)

    expect(createSpy).toHaveBeenCalledWith(
      'biz-1',
      expect.objectContaining({ name: 'Laura García', channels: ['WHATSAPP'] }),
    )
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ client: { id: 'client-1', name: 'Laura García' } })
  })

  // Given a request with no name
  // When creating a client
  // Then it should throw a 400 AppError without calling the service
  it('throws a 400 AppError when name is missing', async () => {
    const createSpy = vi.spyOn(clientService, 'createClient')
    const req = createMockRequest({ businessId: 'biz-1', body: { channels: ['WHATSAPP'] } })
    const res = createMockResponse()
    const next = vi.fn()

    await create(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    expect(createSpy).not.toHaveBeenCalled()
  })

  // Given a request with a name but no channels
  // When creating a client
  // Then it should throw a 400 AppError without calling the service
  it('throws a 400 AppError when no channel is given', async () => {
    const createSpy = vi.spyOn(clientService, 'createClient')
    const req = createMockRequest({ businessId: 'biz-1', body: { name: 'Laura García' } })
    const res = createMockResponse()
    const next = vi.fn()

    await create(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    expect(createSpy).not.toHaveBeenCalled()
  })
})

describe('list', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given query filters in the request
  // When listing clients
  // Then it should forward them to the service and respond with its paginated result
  it('forwards the query filters to the service and returns its result', async () => {
    const paginatedResult = {
      data: [{ id: 'client-1', name: 'Laura García' }],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    }
    const listSpy = vi
      .spyOn(clientService, 'listClients')
      .mockResolvedValue(paginatedResult as never)

    const req = createMockRequest({
      businessId: 'biz-1',
      query: { channel: 'WHATSAPP', search: 'laura' },
    })
    const res = createMockResponse()

    await list(req, res, vi.fn() as NextFunction)

    expect(listSpy).toHaveBeenCalledWith(
      'biz-1',
      expect.objectContaining({ channel: 'WHATSAPP', search: 'laura' }),
    )
    expect(res.json).toHaveBeenCalledWith(paginatedResult)
  })
})

describe('getById', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given an existing client id
  // When fetching it
  // Then it should respond with the client
  it('responds with the client when found', async () => {
    vi.spyOn(clientService, 'getClientById').mockResolvedValue({
      id: 'client-1',
      name: 'Laura García',
    } as never)

    const req = createMockRequest({ businessId: 'biz-1', params: { id: 'client-1' } })
    const res = createMockResponse()

    await getById(req, res, vi.fn() as NextFunction)

    expect(res.json).toHaveBeenCalledWith({ client: { id: 'client-1', name: 'Laura García' } })
  })

  // Given a client id that doesn't exist (or belongs to another business)
  // When fetching it
  // Then it should throw a 404 AppError
  it('throws a 404 AppError when the client is not found', async () => {
    vi.spyOn(clientService, 'getClientById').mockResolvedValue(null)

    const req = createMockRequest({ businessId: 'biz-1', params: { id: 'missing-id' } })
    const res = createMockResponse()
    const next = vi.fn()

    await getById(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
  })
})

describe('update', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given a partial update (only the zone)
  // When updating a client
  // Then it should call the service and respond with the updated client
  it('updates the client and responds with it', async () => {
    const updateSpy = vi
      .spyOn(clientService, 'updateClient')
      .mockResolvedValue({ id: 'client-1', zone: 'Girona' } as never)

    const req = createMockRequest({
      businessId: 'biz-1',
      params: { id: 'client-1' },
      body: { zone: 'Girona' },
    })
    const res = createMockResponse()

    await update(req, res, vi.fn() as NextFunction)

    expect(updateSpy).toHaveBeenCalledWith('biz-1', 'client-1', { zone: 'Girona' })
    expect(res.json).toHaveBeenCalledWith({ client: { id: 'client-1', zone: 'Girona' } })
  })

  // Given a name made of only whitespace
  // When updating a client
  // Then it should throw a 400 AppError without calling the service
  it('throws a 400 AppError when name is blank', async () => {
    const updateSpy = vi.spyOn(clientService, 'updateClient')
    const req = createMockRequest({
      businessId: 'biz-1',
      params: { id: 'client-1' },
      body: { name: '   ' },
    })
    const res = createMockResponse()
    const next = vi.fn()

    await update(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    expect(updateSpy).not.toHaveBeenCalled()
  })

  // Given a client id that doesn't exist (or belongs to another business)
  // When updating it
  // Then the 404 AppError thrown by the service should propagate
  it('propagates the 404 AppError when the client is not found', async () => {
    vi.spyOn(clientService, 'updateClient').mockRejectedValue(
      new AppError('Cliente no encontrado', 404, 'CLIENT_NOT_FOUND'),
    )

    const req = createMockRequest({
      businessId: 'biz-1',
      params: { id: 'missing-id' },
      body: { zone: 'Girona' },
    })
    const res = createMockResponse()
    const next = vi.fn()

    await update(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
  })
})

describe('remove', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given an existing client id
  // When deleting it
  // Then it should call the service and respond 204 with no body
  it('deletes the client and responds 204', async () => {
    const deleteSpy = vi.spyOn(clientService, 'deleteClient').mockResolvedValue(undefined)

    const req = createMockRequest({ businessId: 'biz-1', params: { id: 'client-1' } })
    const res = createMockResponse()

    await remove(req, res, vi.fn() as NextFunction)

    expect(deleteSpy).toHaveBeenCalledWith('biz-1', 'client-1')
    expect(res.status).toHaveBeenCalledWith(204)
    expect(res.send).toHaveBeenCalled()
  })

  // Given a client id that doesn't exist (or belongs to another business)
  // When deleting it
  // Then the 404 AppError thrown by the service should propagate
  it('propagates the 404 AppError when the client is not found', async () => {
    vi.spyOn(clientService, 'deleteClient').mockRejectedValue(
      new AppError('Cliente no encontrado', 404, 'CLIENT_NOT_FOUND'),
    )

    const req = createMockRequest({ businessId: 'biz-1', params: { id: 'missing-id' } })
    const res = createMockResponse()
    const next = vi.fn()

    await remove(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
  })
})

describe('assignTag', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given a tag id in the body
  // When assigning it to a client
  // Then it should call the service with the business, client and tag, and respond 201
  it('assigns the tag and responds 201 with the assignment', async () => {
    const assignSpy = vi
      .spyOn(clientService, 'assignTagToClient')
      .mockResolvedValue({ id: 'assignment-1' } as never)
    const req = createMockRequest({
      businessId: 'biz-1',
      params: { id: 'client-1' },
      body: { tagId: 'tag-1' },
    })
    const res = createMockResponse()

    await assignTag(req, res, vi.fn() as NextFunction)

    expect(assignSpy).toHaveBeenCalledWith('biz-1', 'client-1', 'tag-1')
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ clientTag: { id: 'assignment-1' } })
  })

  // Given a body without a tag id
  // When assigning a tag
  // Then it should throw a 400 AppError and not call the service
  it('throws a 400 AppError when the tag id is missing', async () => {
    const assignSpy = vi.spyOn(clientService, 'assignTagToClient')
    const req = createMockRequest({ businessId: 'biz-1', params: { id: 'client-1' }, body: {} })
    const next = vi.fn() as NextFunction

    await assignTag(req, createMockResponse(), next)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, code: 'MISSING_FIELDS' }),
    )
    expect(assignSpy).not.toHaveBeenCalled()
  })
})

describe('removeTag', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given a client id and a tag id
  // When removing the tag
  // Then it should call the service and respond 204
  it('removes the tag and responds 204', async () => {
    const removeSpy = vi.spyOn(clientService, 'removeTagFromClient').mockResolvedValue(undefined)
    const req = createMockRequest({
      businessId: 'biz-1',
      params: { id: 'client-1', tagId: 'tag-1' },
    })
    const res = createMockResponse()

    await removeTag(req, res, vi.fn() as NextFunction)

    expect(removeSpy).toHaveBeenCalledWith('biz-1', 'client-1', 'tag-1')
    expect(res.status).toHaveBeenCalledWith(204)
    expect(res.send).toHaveBeenCalled()
  })

  // Given the service rejects with a 404
  // When removing the tag
  // Then the error should reach the error handler
  it('propagates the 404 AppError when the client does not have the tag', async () => {
    vi.spyOn(clientService, 'removeTagFromClient').mockRejectedValue(
      new AppError('El cliente no tiene esa etiqueta', 404, 'CLIENT_TAG_NOT_FOUND'),
    )
    const req = createMockRequest({
      businessId: 'biz-1',
      params: { id: 'client-1', tagId: 'tag-1' },
    })
    const next = vi.fn() as NextFunction

    await removeTag(req, createMockResponse(), next)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }))
  })
})
