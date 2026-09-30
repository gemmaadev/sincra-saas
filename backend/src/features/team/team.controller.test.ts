import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { invite, accept, listMembers } from './team.controller'
import * as teamService from './team.service'
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

describe('invite', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given a valid email and name, and an authenticated admin request
  // When inviting a new team member
  // Then it should call the service and respond 201 with success: true
  it('invites the member and responds with success: true', async () => {
    const inviteSpy = vi.spyOn(teamService, 'inviteMember').mockResolvedValue(undefined)

    const req = createMockRequest({
      businessId: 'biz-1',
      body: { email: 'nuevo@test.com', name: 'Nuevo Empleado' },
    })
    const res = createMockResponse()

    await invite(req, res, vi.fn() as NextFunction)

    expect(inviteSpy).toHaveBeenCalledWith('biz-1', 'nuevo@test.com', 'Nuevo Empleado')
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })

  // Given a request missing the email or the name
  // When trying to invite
  // Then it should throw a 400 AppError without touching the service
  it('throws a 400 AppError when a required field is missing', async () => {
    const inviteSpy = vi.spyOn(teamService, 'inviteMember')

    const req = createMockRequest({ businessId: 'biz-1', body: { email: 'nuevo@test.com' } })
    const res = createMockResponse()
    const next = vi.fn()

    await invite(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    const calledError = next.mock.calls[0][0] as AppError
    expect(calledError.statusCode).toBe(400)
    expect(calledError.code).toBe('MISSING_FIELDS')
    expect(inviteSpy).not.toHaveBeenCalled()
  })
})

describe('accept', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given a valid invitation token and a new password
  // When accepting the invite
  // Then it should call the service and respond with success: true
  it('accepts the invite and responds with success: true', async () => {
    const acceptSpy = vi.spyOn(teamService, 'acceptInvite').mockResolvedValue(undefined)

    const req = createMockRequest({
      body: { token: 'valid-token', newPassword: 'nuevaPassword123' },
    })
    const res = createMockResponse()

    await accept(req, res, vi.fn() as NextFunction)

    expect(acceptSpy).toHaveBeenCalledWith('valid-token', 'nuevaPassword123')
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })

  // Given a request with no token at all
  // When trying to accept an invite
  // Then it should throw a 400 AppError without touching the service
  it('throws a 400 AppError when the token is missing', async () => {
    const acceptSpy = vi.spyOn(teamService, 'acceptInvite')

    const req = createMockRequest({ body: {} })
    const res = createMockResponse()
    const next = vi.fn()

    await accept(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    const calledError = next.mock.calls[0][0] as AppError
    expect(calledError.statusCode).toBe(400)
    expect(acceptSpy).not.toHaveBeenCalled()
  })

  // Given an invitation token that the service rejects (invalid or expired)
  // When trying to accept it
  // Then it should propagate the 401 AppError thrown by the service
  it('propagates a 401 AppError when the service rejects the token', async () => {
    vi.spyOn(teamService, 'acceptInvite').mockRejectedValue(
      new AppError('La invitación no es válida o ha caducado', 401, 'INVALID_TOKEN'),
    )

    const req = createMockRequest({ body: { token: 'expired-token' } })
    const res = createMockResponse()
    const next = vi.fn()

    await accept(req, res, next as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    const calledError = next.mock.calls[0][0] as AppError
    expect(calledError.statusCode).toBe(401)
  })
})

describe('listMembers', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given an authenticated request for a business
  // When listing its members
  // Then it should return the members from the service
  it('returns the members for the authenticated business', async () => {
    const members = [
      { id: 'user-1', name: 'Laura', email: 'laura@test.com', role: 'ADMIN', status: 'ACTIVE' },
    ]
    vi.spyOn(teamService, 'listBusinessMembers').mockResolvedValue(members as never)

    const req = createMockRequest({ businessId: 'biz-1' })
    const res = createMockResponse()

    await listMembers(req, res, vi.fn() as NextFunction)

    expect(teamService.listBusinessMembers).toHaveBeenCalledWith('biz-1')
    expect(res.json).toHaveBeenCalledWith({ members })
  })
})
