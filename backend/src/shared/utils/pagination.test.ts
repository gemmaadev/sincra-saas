import { describe, it, expect } from 'vitest'
import { parsePagination, buildPaginatedResponse } from './pagination'

describe('parsePagination', () => {
  // Given valid page and limit query params
  // When parsed
  // Then it should return them as numbers, with the correct skip
  it('parses valid page and limit correctly', () => {
    const result = parsePagination({ page: '3', limit: '10' })
    expect(result).toEqual({ page: 3, limit: 10, skip: 20 })
  })

  // Given no query params at all
  // When parsed
  // Then it should fall back to the default page and limit
  it('falls back to defaults when no params are given', () => {
    const result = parsePagination({})
    expect(result).toEqual({ page: 1, limit: 20, skip: 0 })
  })

  // Given an invalid (non-numeric) page value
  // When parsed
  // Then it should fall back to the default page instead of breaking
  it('falls back to the default page when the value is invalid', () => {
    const result = parsePagination({ page: 'abc' })
    expect(result.page).toBe(1)
  })

  // Given a negative page value
  // When parsed
  // Then it should fall back to the default page
  it('falls back to the default page when the value is negative', () => {
    const result = parsePagination({ page: '-5' })
    expect(result.page).toBe(1)
  })

  // Given a limit above the maximum allowed
  // When parsed
  // Then it should be capped at the maximum, not passed through as-is
  it('caps the limit at the maximum allowed value', () => {
    const result = parsePagination({ limit: '9999' })
    expect(result.limit).toBe(100)
  })
})

describe('buildPaginatedResponse', () => {
  // Given a list of items and the total count
  // When building the paginated response
  // Then it should calculate totalPages correctly
  it('calculates totalPages correctly', () => {
    const response = buildPaginatedResponse(['a', 'b'], 45, 2, 20)
    expect(response.pagination.totalPages).toBe(3)
  })
})
