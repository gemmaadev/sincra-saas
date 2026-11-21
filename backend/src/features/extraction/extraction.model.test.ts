import { describe, it, expect, vi, beforeEach } from 'vitest'
import prisma from '../../config/db'
import { findOpenIncidentExtractions } from './extraction.model'

vi.mock('../../config/db', () => ({
  default: {
    extraction: { findMany: vi.fn() },
  },
}))

describe('findOpenIncidentExtractions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.extraction.findMany).mockResolvedValue([])
  })

  // Given a business
  // When its open incidents are loaded
  // Then the query stays inside that business and leaves discarded findings out
  it('filters by business and skips discarded findings', async () => {
    await findOpenIncidentExtractions('business-1')

    expect(prisma.extraction.findMany).toHaveBeenCalledWith({
      where: {
        businessId: 'business-1',
        extractionType: 'INCIDENT',
        status: { not: 'DISCARDED' },
      },
      select: { id: true, emailSubject: true, rawData: true },
    })
  })
})
