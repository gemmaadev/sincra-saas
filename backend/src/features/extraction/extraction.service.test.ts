import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ExtractionStatus, ExtractionType } from '../../generated/prisma/client'
import * as extractionModel from './extraction.model'
import { createExtraction, updateExtractionStatus } from './extraction.service'
import type { CreateExtractionInput } from './extraction.types'

vi.mock('./extraction.model')

const validInput = {
  businessId: 'business-1',
  emailId: 'email-1',
  emailFrom: 'cliente@example.com',
  extractionType: ExtractionType.QUOTE_REQUEST,
} satisfies CreateExtractionInput

const decidedAt = new Date('2026-11-15T12:20:00.000Z')

describe('createExtraction', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(decidedAt)
    vi.resetAllMocks()
    vi.mocked(extractionModel.insertExtraction).mockResolvedValue({ id: 'extraction-1' } as never)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // Given a known extraction type and no status
  // When creating the extraction
  // Then it is inserted with that type and the status column default is left in place
  it('inserts a valid type and omits status so the PENDING default applies', async () => {
    await createExtraction(validInput)

    expect(extractionModel.insertExtraction).toHaveBeenCalledWith({
      businessId: 'business-1',
      emailId: 'email-1',
      emailSubject: undefined,
      emailFrom: 'cliente@example.com',
      emailTo: undefined,
      extractionType: ExtractionType.QUOTE_REQUEST,
      confidence: undefined,
      syncedAt: undefined,
      decidedAt: null,
    })
  })

  // Given every extraction type defined on the Prisma enum
  // When creating an extraction with that type
  // Then the insert receives the enum value
  it.each(Object.values(ExtractionType))('accepts extraction type %s', async (extractionType) => {
    await createExtraction({ ...validInput, extractionType })

    expect(extractionModel.insertExtraction).toHaveBeenCalledWith(
      expect.objectContaining({ extractionType }),
    )
  })

  // Given every extraction status defined on the Prisma enum
  // When creating an extraction with that status
  // Then the insert receives the enum value
  it.each(Object.values(ExtractionStatus))('accepts extraction status %s', async (status) => {
    await createExtraction({ ...validInput, status })

    expect(extractionModel.insertExtraction).toHaveBeenCalledWith(
      expect.objectContaining({ status }),
    )
  })

  // Given a legacy lowercase or pre-enum status
  // When creating an extraction
  // Then a 400 domain error is thrown and nothing is inserted
  it.each(['pending', 'approved', 'rejected'])(
    'rejects legacy status %s before insert',
    async (status) => {
      await expect(createExtraction({ ...validInput, status })).rejects.toMatchObject({
        statusCode: 400,
        code: 'INVALID_EXTRACTION_STATUS',
      })
      expect(extractionModel.insertExtraction).not.toHaveBeenCalled()
    },
  )

  // Given a lowercase extraction type
  // When creating an extraction
  // Then a 400 domain error is thrown and nothing is inserted
  it('rejects a lowercase extraction type before insert', async () => {
    await expect(
      createExtraction({ ...validInput, extractionType: 'quote_request' }),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'INVALID_EXTRACTION_TYPE',
    })
    expect(extractionModel.insertExtraction).not.toHaveBeenCalled()
  })

  // Given a status that records a decision
  // When creating the extraction
  // Then decidedAt is the current time
  it.each([ExtractionStatus.CONFIRMED, ExtractionStatus.DISCARDED])(
    'sets decidedAt when created as %s',
    async (status) => {
      await createExtraction({ ...validInput, status })

      expect(extractionModel.insertExtraction).toHaveBeenCalledWith(
        expect.objectContaining({ status, decidedAt }),
      )
    },
  )

  // Given an explicit pending status
  // When creating the extraction
  // Then decidedAt stays empty
  it('leaves decidedAt empty when created as PENDING', async () => {
    await createExtraction({ ...validInput, status: ExtractionStatus.PENDING })

    expect(extractionModel.insertExtraction).toHaveBeenCalledWith(
      expect.objectContaining({ status: ExtractionStatus.PENDING, decidedAt: null }),
    )
  })
})

describe('updateExtractionStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(decidedAt)
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // Given an extraction that is still pending
  // When its status changes to confirmed or discarded
  // Then decidedAt is set to now
  it.each([ExtractionStatus.CONFIRMED, ExtractionStatus.DISCARDED])(
    'sets decidedAt when the status changes to %s',
    async (status) => {
      vi.mocked(extractionModel.findExtractionById).mockResolvedValue({
        id: 'extraction-1',
        status: ExtractionStatus.PENDING,
      } as never)

      await updateExtractionStatus('extraction-1', status)

      expect(extractionModel.updateExtraction).toHaveBeenCalledWith('extraction-1', {
        status,
        decidedAt,
      })
    },
  )

  // Given an extraction that was already decided
  // When its status goes back to pending
  // Then decidedAt is cleared
  it('clears decidedAt when the status goes back to PENDING', async () => {
    vi.mocked(extractionModel.findExtractionById).mockResolvedValue({
      id: 'extraction-1',
      status: ExtractionStatus.CONFIRMED,
    } as never)

    await updateExtractionStatus('extraction-1', ExtractionStatus.PENDING)

    expect(extractionModel.updateExtraction).toHaveBeenCalledWith('extraction-1', {
      status: ExtractionStatus.PENDING,
      decidedAt: null,
    })
  })

  // Given an extraction that was confirmed
  // When it is discarded instead
  // Then decidedAt is refreshed
  it('refreshes decidedAt when a decision changes to the other decision', async () => {
    vi.mocked(extractionModel.findExtractionById).mockResolvedValue({
      id: 'extraction-1',
      status: ExtractionStatus.CONFIRMED,
      decidedAt: new Date('2026-11-01T00:00:00.000Z'),
    } as never)

    await updateExtractionStatus('extraction-1', ExtractionStatus.DISCARDED)

    expect(extractionModel.updateExtraction).toHaveBeenCalledWith('extraction-1', {
      status: ExtractionStatus.DISCARDED,
      decidedAt,
    })
  })

  // Given an extraction that already has this status
  // When the same status is sent again
  // Then decidedAt is left untouched
  it('does not rewrite decidedAt when the status does not change', async () => {
    const existing = {
      id: 'extraction-1',
      status: ExtractionStatus.CONFIRMED,
      decidedAt: new Date('2026-11-01T00:00:00.000Z'),
    }
    vi.mocked(extractionModel.findExtractionById).mockResolvedValue(existing as never)

    await expect(
      updateExtractionStatus('extraction-1', ExtractionStatus.CONFIRMED),
    ).resolves.toBe(existing)
    expect(extractionModel.updateExtraction).not.toHaveBeenCalled()
  })

  // Given no extraction with that id
  // When updating its status
  // Then a 404 is thrown and nothing is written
  it('throws EXTRACTION_NOT_FOUND when the extraction does not exist', async () => {
    vi.mocked(extractionModel.findExtractionById).mockResolvedValue(null)

    await expect(
      updateExtractionStatus('missing', ExtractionStatus.CONFIRMED),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: 'EXTRACTION_NOT_FOUND',
    })
    expect(extractionModel.updateExtraction).not.toHaveBeenCalled()
  })

  // Given a status outside the enum
  // When updating an extraction
  // Then a 400 is thrown before any read or write
  it('rejects a legacy status before touching the database', async () => {
    await expect(updateExtractionStatus('extraction-1', 'approved')).rejects.toMatchObject({
      statusCode: 400,
      code: 'INVALID_EXTRACTION_STATUS',
    })
    expect(extractionModel.findExtractionById).not.toHaveBeenCalled()
    expect(extractionModel.updateExtraction).not.toHaveBeenCalled()
  })
})
