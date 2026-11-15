import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ExtractionStatus, ExtractionType } from '../../generated/prisma/client'
import * as extractionModel from './extraction.model'
import { createExtraction } from './extraction.service'
import type { CreateExtractionInput } from './extraction.types'

vi.mock('./extraction.model')

const validInput = {
  businessId: 'business-1',
  emailId: 'email-1',
  emailFrom: 'cliente@example.com',
  extractionType: ExtractionType.QUOTE_REQUEST,
} satisfies CreateExtractionInput

describe('createExtraction', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(extractionModel.insertExtraction).mockResolvedValue({ id: 'extraction-1' } as never)
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
})
