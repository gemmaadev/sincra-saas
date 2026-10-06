const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search'
const REQUEST_TIMEOUT_MS = 3000
const DEFAULT_USER_AGENT = 'Sincra/1.0'
const MIN_INTERVAL_BETWEEN_REQUESTS_MS = 1000
const MAX_ADDRESS_CANDIDATES = 5

let nextAvailableSlotAt = 0

export interface GeocodedLocation {
  latitude: number
  longitude: number
}

export interface GeocodeInput {
  address?: string | null
  zone?: string | null
  countryCode?: string
}

export interface AddressCandidate {
  label: string
  address: string | null
  zone: string | null
  latitude: number
  longitude: number
}

interface NominatimAddress {
  road?: string
  house_number?: string
  city?: string
  town?: string
  village?: string
  municipality?: string
  hamlet?: string
  county?: string
}

interface NominatimResult {
  lat?: unknown
  lon?: unknown
  display_name?: string
  address?: NominatimAddress
}

function buildQuery(address?: string | null, zone?: string | null): string | null {
  const parts = [address?.trim(), zone?.trim()].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : null
}

function isValidCoordinate(value: number, limit: number): boolean {
  return Number.isFinite(value) && Math.abs(value) <= limit
}

function readFirstLocation(results: unknown): GeocodedLocation | null {
  if (!Array.isArray(results) || results.length === 0) return null

  const { lat, lon } = results[0] as NominatimResult
  const latitude = Number(lat)
  const longitude = Number(lon)

  if (!isValidCoordinate(latitude, 90) || !isValidCoordinate(longitude, 180)) return null

  return { latitude, longitude }
}

async function waitForRequestSlot(): Promise<void> {
  const now = Date.now()
  const slotAt = Math.max(now, nextAvailableSlotAt)
  nextAvailableSlotAt = slotAt + MIN_INTERVAL_BETWEEN_REQUESTS_MS

  const delay = slotAt - now
  if (delay > 0) await new Promise<void>((resolve) => setTimeout(resolve, delay))
}

async function fetchNominatim(params: URLSearchParams): Promise<unknown | null> {
  await waitForRequestSlot()

  try {
    const response = await fetch(`${NOMINATIM_SEARCH_URL}?${params}`, {
      headers: { 'User-Agent': process.env.GEOCODING_USER_AGENT ?? DEFAULT_USER_AGENT },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

    if (!response.ok) return null

    return await response.json()
  } catch {
    return null
  }
}

function buildSearchParams(query: string, limit: number, countryCode?: string): URLSearchParams {
  const params = new URLSearchParams({ format: 'jsonv2', limit: String(limit), q: query })
  if (countryCode) params.set('countrycodes', countryCode.toLowerCase())
  return params
}

export async function geocodeAddress({
  address,
  zone,
  countryCode,
}: GeocodeInput): Promise<GeocodedLocation | null> {
  const query = buildQuery(address, zone)
  if (!query) return null

  const results = await fetchNominatim(buildSearchParams(query, 1, countryCode))

  return readFirstLocation(results)
}

function readStreet(address?: NominatimAddress): string | null {
  if (!address?.road) return null
  return address.house_number ? `${address.road} ${address.house_number}` : address.road
}

function readZone(address?: NominatimAddress): string | null {
  return (
    address?.city ??
    address?.town ??
    address?.village ??
    address?.municipality ??
    address?.hamlet ??
    address?.county ??
    null
  )
}

function toAddressCandidate(result: NominatimResult): AddressCandidate | null {
  const latitude = Number(result.lat)
  const longitude = Number(result.lon)

  if (!isValidCoordinate(latitude, 90) || !isValidCoordinate(longitude, 180)) return null

  return {
    label: result.display_name ?? '',
    address: readStreet(result.address),
    zone: readZone(result.address),
    latitude,
    longitude,
  }
}

export async function searchAddresses(
  query: string,
  countryCode?: string,
): Promise<AddressCandidate[] | null> {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) return []

  const params = buildSearchParams(trimmedQuery, MAX_ADDRESS_CANDIDATES, countryCode)
  params.set('addressdetails', '1')

  const results = await fetchNominatim(params)
  if (!Array.isArray(results)) return null

  return results
    .map((result) => toAddressCandidate(result as NominatimResult))
    .filter((candidate): candidate is AddressCandidate => candidate !== null)
}
