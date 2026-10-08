import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { getMap } from './order-map.controller'
import * as orderMapService from './order-map.service'

function createMockRequest(overrides: Record<string, unknown> = {}): Request {
  return overrides as unknown as Request
}

function createMockResponse() {
  const res = {} as Response
  res.json = vi.fn().mockReturnValue(res)
  return res
}

const emptyMap = { total: 0, zones: [], ordersWithoutZone: 0 }

async function callGetMap(query: Record<string, unknown>) {
  const req = createMockRequest({ businessId: 'biz-1', query })
  const res = createMockResponse()
  const next = vi.fn() as NextFunction

  await getMap(req, res, next)

  return { res, next }
}

describe('getMap', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Given no filters in the query
  // When the map is requested
  // Then the service should be called with empty filters and its result returned
  it('returns the map without filters', async () => {
    const mapSpy = vi.spyOn(orderMapService, 'getOrderMap').mockResolvedValue(emptyMap)

    const { res } = await callGetMap({})

    expect(mapSpy).toHaveBeenCalledWith('biz-1', { channel: undefined, from: undefined, to: undefined })
    expect(res.json).toHaveBeenCalledWith(emptyMap)
  })

  // Given a channel and a date range
  // When the map is requested
  // Then they should reach the service, with the end date covering the whole day
  it('parses the filters and covers the whole last day', async () => {
    const mapSpy = vi.spyOn(orderMapService, 'getOrderMap').mockResolvedValue(emptyMap)

    await callGetMap({ channel: 'GMAIL', from: '2026-01-01', to: '2026-01-31' })

    expect(mapSpy).toHaveBeenCalledWith('biz-1', {
      channel: 'GMAIL',
      from: new Date('2026-01-01T00:00:00.000Z'),
      to: new Date('2026-01-31T23:59:59.999Z'),
    })
  })

  // Given empty filter values
  // When the map is requested
  // Then they should be treated as not provided
  it('treats empty values as no filter', async () => {
    const mapSpy = vi.spyOn(orderMapService, 'getOrderMap').mockResolvedValue(emptyMap)

    await callGetMap({ channel: '', from: '', to: '' })

    expect(mapSpy).toHaveBeenCalledWith('biz-1', { channel: undefined, from: undefined, to: undefined })
  })

  // Given invalid filters
  // When the map is requested
  // Then it should answer with a 400 and the service should not be called
  it.each([
    ['an unknown channel', { channel: 'TELEGRAM' }, 'INVALID_CHANNEL'],
    ['a date that is not a date', { from: 'ayer' }, 'INVALID_DATE'],
    ['an end date that is not a date', { to: '2026-13-45' }, 'INVALID_DATE'],
    [
      'a start date after the end date',
      { from: '2026-02-01', to: '2026-01-01' },
      'INVALID_DATE_RANGE',
    ],
    ['a repeated parameter', { channel: ['GMAIL', 'OUTLOOK'] }, 'INVALID_QUERY'],
  ])('rejects %s', async (_label, query, code) => {
    const mapSpy = vi.spyOn(orderMapService, 'getOrderMap')

    const { next } = await callGetMap(query)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400, code }))
    expect(mapSpy).not.toHaveBeenCalled()
  })
})
