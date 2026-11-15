import {
  ExtractionStatus,
  ExtractionType,
  Prisma,
  type ExtractionStatus as ExtractionStatusValue,
  type ExtractionType as ExtractionTypeValue,
} from '../../generated/prisma/client'
import { AppError } from '../../shared/AppError'
import { insertExtraction } from './extraction.model'
import type { CreateExtractionInput } from './extraction.types'

const EXTRACTION_TYPES = new Set<string>(Object.values(ExtractionType))
const EXTRACTION_STATUSES = new Set<string>(Object.values(ExtractionStatus))

// Reject unknown labels before Prisma writes them. Postgres would otherwise raise 22P02.
export function assertExtractionType(value: unknown): ExtractionTypeValue {
  if (typeof value !== 'string' || !EXTRACTION_TYPES.has(value)) {
    throw new AppError('Tipo de extracción no válido', 400, 'INVALID_EXTRACTION_TYPE')
  }

  return value as ExtractionTypeValue
}

export function assertExtractionStatus(value: unknown): ExtractionStatusValue {
  if (typeof value !== 'string' || !EXTRACTION_STATUSES.has(value)) {
    throw new AppError('Estado de extracción no válido', 400, 'INVALID_EXTRACTION_STATUS')
  }

  return value as ExtractionStatusValue
}

export async function createExtraction(input: CreateExtractionInput) {
  const extractionType = assertExtractionType(input.extractionType)
  const data: Prisma.ExtractionUncheckedCreateInput = {
    businessId: input.businessId,
    emailId: input.emailId,
    emailSubject: input.emailSubject,
    emailFrom: input.emailFrom,
    emailTo: input.emailTo,
    extractionType,
    confidence: input.confidence,
    syncedAt: input.syncedAt,
  }

  if (input.rawData !== undefined) {
    data.rawData = input.rawData as Prisma.InputJsonValue
  }

  if (input.status !== undefined) {
    data.status = assertExtractionStatus(input.status)
  }

  return insertExtraction(data)
}
