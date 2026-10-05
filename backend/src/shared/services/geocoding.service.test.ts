import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { geocodeAddress } from './geocoding.service'

function respondWith(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  vi.mocked(fetch).mockResolvedValue({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: () => Promise.resolve(body),
  } as Response)
}

function requestedUrl(): URL {
  return new URL(String(vi.mocked(fetch).mock.calls[0][0]))
}

describe('geocodeAddress', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  // Given an address and a zone that Nominatim knows
  // When the address is geocoded
  // Then the coordinates should be returned as numbers
  it('returns the coordinates of the first result as numbers', async () => {
    respondWith([{ lat: '41.5467', lon: '2.1044' }])

    const location = await geocodeAddress({
      address: 'Carrer de Sant Pau 33',
      zone: 'Sabadell',
      countryCode: 'ES',
    })

    expect(location).toEqual({ latitude: 41.5467, longitude: 2.1044 })
  })

  // Given an address, a zone and a country
  // When the address is geocoded
  // Then the request should join address and zone, limit to one result and restrict the country
  it('builds the Nominatim request from the address, the zone and the country', async () => {
    respondWith([{ lat: '41.5', lon: '2.1' }])

    await geocodeAddress({ address: 'Carrer de Sant Pau 33', zone: 'Sabadell', countryCode: 'ES' })

    const url = requestedUrl()
    expect(url.origin + url.pathname).toBe('https://nominatim.openstreetmap.org/search')
    expect(url.searchParams.get('q')).toBe('Carrer de Sant Pau 33, Sabadell')
    expect(url.searchParams.get('format')).toBe('jsonv2')
    expect(url.searchParams.get('limit')).toBe('1')
    expect(url.searchParams.get('countrycodes')).toBe('es')
  })

  // Given only a zone
  // When it is geocoded
  // Then the query should be just the zone
  it('searches only by zone when there is no address', async () => {
    respondWith([{ lat: '41.5', lon: '2.1' }])

    await geocodeAddress({ address: null, zone: 'Sabadell' })

    expect(requestedUrl().searchParams.get('q')).toBe('Sabadell')
  })

  // Given no country
  // When it is geocoded
  // Then the country should not restrict the search
  it('does not restrict the country when none is given', async () => {
    respondWith([{ lat: '41.5', lon: '2.1' }])

    await geocodeAddress({ address: 'Rambla Nova 45' })

    expect(requestedUrl().searchParams.has('countrycodes')).toBe(false)
  })

  // Given neither an address nor a zone, or only blank text
  // When it is geocoded
  // Then nothing should be requested
  it.each([
    ['nothing', {}],
    ['null values', { address: null, zone: null }],
    ['blank text', { address: '   ', zone: '' }],
  ])('does not call Nominatim with %s', async (_label, input) => {
    expect(await geocodeAddress(input)).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  // Given the app identification
  // When the request is sent
  // Then it should identify the app with a User-Agent and have a timeout signal
  it('identifies the app and sets a timeout', async () => {
    respondWith([])

    await geocodeAddress({ address: 'Rambla Nova 45' })

    const options = vi.mocked(fetch).mock.calls[0][1]
    expect((options?.headers as Record<string, string>)['User-Agent']).toBe('Sincra/1.0')
    expect(options?.signal).toBeInstanceOf(AbortSignal)
  })

  // Given a custom User-Agent in the environment
  // When the request is sent
  // Then it should use that one
  it('uses the User-Agent from the environment', async () => {
    vi.stubEnv('GEOCODING_USER_AGENT', 'Sincra/1.0 (contact@example.com)')
    respondWith([])

    await geocodeAddress({ address: 'Rambla Nova 45' })

    const options = vi.mocked(fetch).mock.calls[0][1]
    expect((options?.headers as Record<string, string>)['User-Agent']).toBe(
      'Sincra/1.0 (contact@example.com)',
    )
  })

  // Given Nominatim does not find the address
  // When it is geocoded
  // Then the result should be null, not an error
  it('returns null when nothing is found', async () => {
    respondWith([])

    expect(await geocodeAddress({ address: 'Calle que no existe 999' })).toBeNull()
  })

  // Given Nominatim answers with an error status (e.g. rate limited)
  // When it is geocoded
  // Then the result should be null
  it.each([429, 500, 503])('returns null for a %i response', async (status) => {
    respondWith({}, { ok: false, status })

    expect(await geocodeAddress({ address: 'Rambla Nova 45' })).toBeNull()
  })

  // Given the network fails or the request times out
  // When it is geocoded
  // Then the result should be null and nothing should be thrown
  it.each([
    ['a network error', new TypeError('fetch failed')],
    ['a timeout', new DOMException('The operation timed out', 'TimeoutError')],
  ])('returns null on %s', async (_label, error) => {
    vi.mocked(fetch).mockRejectedValue(error)

    expect(await geocodeAddress({ address: 'Rambla Nova 45' })).toBeNull()
  })

  // Given a response that is not valid JSON
  // When it is geocoded
  // Then the result should be null
  it('returns null when the response is not valid JSON', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.reject(new SyntaxError('Unexpected token')),
    } as Response)

    expect(await geocodeAddress({ address: 'Rambla Nova 45' })).toBeNull()
  })

  // Given a result with coordinates that make no sense
  // When it is geocoded
  // Then the result should be null
  it.each([
    ['text instead of numbers', [{ lat: 'abc', lon: '2.1' }]],
    ['a missing longitude', [{ lat: '41.5' }]],
    ['a latitude out of range', [{ lat: '95', lon: '2.1' }]],
    ['a longitude out of range', [{ lat: '41.5', lon: '200' }]],
    ['something that is not a list', { lat: '41.5', lon: '2.1' }],
  ])('returns null for %s', async (_label, body) => {
    respondWith(body)

    expect(await geocodeAddress({ address: 'Rambla Nova 45' })).toBeNull()
  })
})
