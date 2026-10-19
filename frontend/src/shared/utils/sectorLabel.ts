import { SECTOR_OPTIONS } from '@/shared/sectorOptions.constants'

export function sectorLabel(sector?: string | null) {
  if (!sector) return null
  return SECTOR_OPTIONS.find((option) => option.value === sector)?.label ?? sector
}
