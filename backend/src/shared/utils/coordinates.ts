import { AppError } from '../AppError'

const MAX_LATITUDE = 90
const MAX_LONGITUDE = 180

function isCoordinateInRange(value: unknown, limit: number): boolean {
  return typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= limit
}

export function assertValidCoordinates(latitude: unknown, longitude: unknown) {
  if (latitude === undefined && longitude === undefined) return

  if (
    !isCoordinateInRange(latitude, MAX_LATITUDE) ||
    !isCoordinateInRange(longitude, MAX_LONGITUDE)
  ) {
    throw new AppError(
      'Las coordenadas no son válidas: indica latitud (−90 a 90) y longitud (−180 a 180)',
      400,
      'INVALID_COORDINATES',
    )
  }
}
