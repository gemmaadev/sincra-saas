import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { geocodeAddress, searchAddresses } from './geocoding.service'

let fakeNow = new Date('2026-01-01T00:00:00Z').getTime()

async function geocode(input: Parameters<typeof geocodeAddress>[0]) {
  const pending = geocodeAddress(input)
  await vi.runAllTimersAsync()
  return pending
}

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
    vi.useFakeTimers({ toFake: ['setTimeout', 'Date'] })
    fakeNow += 60_000
    vi.setSystemTime(fakeNow)
    vi.stubGlobal('fetch', vi.fn())
    vi.stubEnv('GEOCODING_USER_AGENT', undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  // Given an address and a zone that Nominatim knows
  // When the address is geocoded
  // Then the coordinates should be returned as numbers
  it('returns the coordinates of the first result as numbers', async () => {
    respondWith([{ lat: '41.5467', lon: '2.1044' }])

    const location = await geocode({
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

    await geocode({ address: 'Carrer de Sant Pau 33', zone: 'Sabadell', countryCode: 'ES' })

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

    await geocode({ address: null, zone: 'Sabadell' })

    expect(requestedUrl().searchParams.get('q')).toBe('Sabadell')
  })

  // Given no country
  // When it is geocoded
  // Then the country should not restrict the search
  it('does not restrict the country when none is given', async () => {
    respondWith([{ lat: '41.5', lon: '2.1' }])

    await geocode({ address: 'Rambla Nova 45' })

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
    expect(await geocode(input)).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  // Given the app identification
  // When the request is sent
  // Then it should identify the app with a User-Agent and have a timeout signal
  it('identifies the app and sets a timeout', async () => {
    respondWith([])

    await geocode({ address: 'Rambla Nova 45' })

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

    await geocode({ address: 'Rambla Nova 45' })

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

    expect(await geocode({ address: 'Calle que no existe 999' })).toBeNull()
  })

  // Given Nominatim answers with an error status (e.g. rate limited)
  // When it is geocoded
  // Then the result should be null
  it.each([429, 500, 503])('returns null for a %i response', async (status) => {
    respondWith({}, { ok: false, status })

    expect(await geocode({ address: 'Rambla Nova 45' })).toBeNull()
  })

  // Given the network fails or the request times out
  // When it is geocoded
  // Then the result should be null and nothing should be thrown
  it.each([
    ['a network error', new TypeError('fetch failed')],
    ['a timeout', new DOMException('The operation timed out', 'TimeoutError')],
  ])('returns null on %s', async (_label, error) => {
    vi.mocked(fetch).mockRejectedValue(error)

    expect(await geocode({ address: 'Rambla Nova 45' })).toBeNull()
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

    expect(await geocode({ address: 'Rambla Nova 45' })).toBeNull()
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

    expect(await geocode({ address: 'Rambla Nova 45' })).toBeNull()
  })

  // Given Nominatim allows one request per second
  // When two addresses are geocoded at the same time
  // Then the second request should wait one second after the first
  it('spaces concurrent requests one second apart', async () => {
    respondWith([{ lat: '41.5', lon: '2.1' }])

    const first = geocodeAddress({ address: 'Rambla Nova 45' })
    const second = geocodeAddress({ address: 'Carrer Major 2' })

    await vi.advanceTimersByTimeAsync(0)
    expect(fetch).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(999)
    expect(fetch).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(fetch).toHaveBeenCalledTimes(2)

    await Promise.all([first, second])
  })

  // Given the last request was made more than a second ago
  // When another address is geocoded
  // Then it should be sent without waiting
  it('does not delay a request when the previous one was long ago', async () => {
    respondWith([{ lat: '41.5', lon: '2.1' }])

    await geocode({ address: 'Rambla Nova 45' })
    await vi.advanceTimersByTimeAsync(5000)
    const pending = geocodeAddress({ address: 'Carrer Major 2' })
    await vi.advanceTimersByTimeAsync(0)

    expect(fetch).toHaveBeenCalledTimes(2)
    await pending
  })
})

describe('searchAddresses', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'Date'] })
    fakeNow += 60_000
    vi.setSystemTime(fakeNow)
    vi.stubGlobal('fetch', vi.fn())
    vi.stubEnv('GEOCODING_USER_AGENT', undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  async function search(query: string, countryCode?: string) {
    const pending = searchAddresses(query, countryCode)
    await vi.runAllTimersAsync()
    return pending
  }

  const balmesResult = {
    lat: '41.7346709',
    lon: '1.8302486',
    display_name: 'Carrer de Balmes, Manresa, Bages, Catalunya, Espanya',
    address: { road: 'Carrer de Balmes', house_number: '71', city: 'Manresa' },
  }

  // Given Nominatim finds a street with a number in a city
  // When the addresses are searched
  // Then each candidate should carry its label, street with number, zone and coordinates
  it('returns candidates with the street, the zone and the coordinates', async () => {
    respondWith([balmesResult])

    const candidates = await search('Carrer de Balmes 71, Manresa', 'ES')

    expect(candidates).toEqual([
      {
        label: 'Carrer de Balmes, Manresa, Bages, Catalunya, Espanya',
        address: 'Carrer de Balmes 71',
        zone: 'Manresa',
        latitude: 41.7346709,
        longitude: 1.8302486,
      },
    ])
  })

  // Given a search
  // When the request is sent
  // Then it should ask for address details, up to five results and the business country
  it('asks Nominatim for address details, five results and the country', async () => {
    respondWith([])

    await search('Rambla Nova', 'ES')

    const url = requestedUrl()
    expect(url.searchParams.get('q')).toBe('Rambla Nova')
    expect(url.searchParams.get('addressdetails')).toBe('1')
    expect(url.searchParams.get('limit')).toBe('5')
    expect(url.searchParams.get('countrycodes')).toBe('es')
  })

  // Given a result without a street and a town instead of a city
  // When the addresses are searched
  // Then the street should be null and the town should be used as the zone
  it('falls back to the town and leaves the street empty when there is no road', async () => {
    respondWith([{ lat: '41.5', lon: '2.1', display_name: 'Vic', address: { town: 'Vic' } }])

    const [candidate] = (await search('Vic')) ?? []

    expect(candidate).toMatchObject({ address: null, zone: 'Vic' })
  })

  // Given a street without a house number
  // When the addresses are searched
  // Then the address should be just the street
  it('returns only the street when there is no house number', async () => {
    respondWith([
      {
        lat: '41.5',
        lon: '2.1',
        display_name: 'x',
        address: { road: 'Carrer Major', city: 'Vic' },
      },
    ])

    const [candidate] = (await search('Carrer Major, Vic')) ?? []

    expect(candidate.address).toBe('Carrer Major')
  })

  // Given Nominatim finds nothing
  // When the addresses are searched
  // Then the result should be an empty list, not an error
  it('returns an empty list when nothing is found', async () => {
    respondWith([])

    expect(await search('Calle inexistente 999')).toEqual([])
  })

  // Given a blank query
  // When the addresses are searched
  // Then nothing should be requested
  it('does not call Nominatim with a blank query', async () => {
    expect(await search('   ')).toEqual([])
    expect(fetch).not.toHaveBeenCalled()
  })

  // Given Nominatim is down, rate limited or times out
  // When the addresses are searched
  // Then the result should be null, so callers can tell it from "no results"
  it.each([
    ['a 429 response', () => respondWith({}, { ok: false, status: 429 })],
    ['a network error', () => vi.mocked(fetch).mockRejectedValue(new TypeError('fetch failed'))],
    ['a payload that is not a list', () => respondWith({ error: 'boom' })],
  ])('returns null on %s', async (_label, arrange) => {
    arrange()

    expect(await search('Rambla Nova')).toBeNull()
  })

  // Given results where one has invalid coordinates
  // When the addresses are searched
  // Then that candidate should be skipped
  it('skips results with invalid coordinates', async () => {
    respondWith([{ lat: 'abc', lon: '2.1', display_name: 'bad' }, balmesResult])

    const candidates = await search('Balmes')

    expect(candidates).toHaveLength(1)
  })
})
