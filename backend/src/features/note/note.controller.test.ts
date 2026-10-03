import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { list, create, remove } from './note.controller'
import * as noteService from './note.service'
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

describe('list', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given a client id
  // When listing its notes
  // Then it should call the service with the business and client ids, and respond with them
  it('lists the notes for a client', async () => {
    const listSpy = vi
      .spyOn(noteService, 'listNotesForClient')
      .mockResolvedValue([{ id: 'note-1', content: 'Hola' }] as never)

    const req = createMockRequest({ businessId: 'biz-1', params: { clientId: 'client-1' } })
    const res = createMockResponse()

    await list(req, res, vi.fn() as NextFunction)

    expect(listSpy).toHaveBeenCalledWith('biz-1', 'client-1')
    expect(res.json).toHaveBeenCalledWith({ notes: [{ id: 'note-1', content: 'Hola' }] })
  })
})

describe('create', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given valid content
  // When creating a note
  // Then it should call the service with the business id, client id, content and author, and respond 201
  it('creates the note and responds 201 with it', async () => {
    const createSpy = vi
      .spyOn(noteService, 'createNote')
      .mockResolvedValue({ id: 'note-1', content: 'Hola' } as never)

    const req = createMockRequest({
      businessId: 'biz-1',
      userId: 'user-1',
      params: { clientId: 'client-1' },
      body: { content: 'Hola' },
    })
    const res = createMockResponse()

    await create(req, res, vi.fn() as NextFunction)

    expect(createSpy).toHaveBeenCalledWith('biz-1', 'client-1', 'Hola', 'user-1')
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ note: { id: 'note-1', content: 'Hola' } })
  })

  // Given empty content
  // When creating a note
  // Then it should throw a 400 AppError without calling the service
  it('rejects empty content', async () => {
    const createSpy = vi.spyOn(noteService, 'createNote')

    const req = createMockRequest({
      businessId: 'biz-1',
      userId: 'user-1',
      params: { clientId: 'client-1' },
      body: { content: '   ' },
    })
    const res = createMockResponse()
    const next = vi.fn()

    await create(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    expect(createSpy).not.toHaveBeenCalled()
  })
})

describe('remove', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given a note id
  // When removing it
  // Then it should call the service with the business id and note id, and respond 204
  it('deletes the note and responds 204', async () => {
    const deleteSpy = vi.spyOn(noteService, 'deleteNote').mockResolvedValue(undefined)

    const req = createMockRequest({ businessId: 'biz-1', params: { id: 'note-1' } })
    const res = createMockResponse()

    await remove(req, res, vi.fn() as NextFunction)

    expect(deleteSpy).toHaveBeenCalledWith('biz-1', 'note-1')
    expect(res.status).toHaveBeenCalledWith(204)
  })
})
