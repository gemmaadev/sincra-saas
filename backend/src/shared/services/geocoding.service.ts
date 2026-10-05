const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search'
const REQUEST_TIMEOUT_MS = 3000
const DEFAULT_USER_AGENT = 'Sincra/1.0'

export interface GeocodedLocation {
  latitude: number
  longitude: number
}

export interface GeocodeInput {
  address?: string | null
  zone?: string | null
  countryCode?: string
}

interface NominatimResult {
  lat?: unknown
  lon?: unknown
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

export async function geocodeAddress({
  address,
  zone,
  countryCode,
}: GeocodeInput): Promise<GeocodedLocation | null> {
  const query = buildQuery(address, zone)
  if (!query) return null

  const params = new URLSearchParams({ format: 'jsonv2', limit: '1', q: query })
  if (countryCode) params.set('countrycodes', countryCode.toLowerCase())

  try {
    const response = await fetch(`${NOMINATIM_SEARCH_URL}?${params}`, {
      headers: { 'User-Agent': process.env.GEOCODING_USER_AGENT ?? DEFAULT_USER_AGENT },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

    if (!response.ok) return null

    return readFirstLocation(await response.json())
  } catch {
    return null
  }
}
