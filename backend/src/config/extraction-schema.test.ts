import { afterAll, describe, expect, it } from 'vitest'
import { PrismaClient } from '../generated/prisma/client'

const prisma = new PrismaClient({ datasourceUrl: 'postgresql://user:pass@localhost:5432/test' })
type RuntimeField = { name: string; dbName?: string | null; isRequired: boolean; default?: unknown }
type RuntimeModel = { dbName: string | null; fields: RuntimeField[] }
const runtime = prisma as unknown as { _runtimeDataModel: { models: Record<string, RuntimeModel> } }

afterAll(async () => {
  await prisma.$disconnect()
})

describe('Extraction model', () => {
  // Given the Prisma client for the SaaS database
  // When inspecting the extraction model used by the ingestion backend
  // Then the extraction table should be scoped to a business and use its expected column names
  it('provides a business-scoped extraction persistence contract', () => {
    const model = runtime._runtimeDataModel.models.Extraction

    expect(model).toBeDefined()
    expect(model?.dbName).toBe('extractions')
    expect(model?.fields.find((field) => field.name === 'businessId')).toMatchObject({
      dbName: 'business_id',
      isRequired: true,
    })
    expect(model?.fields.find((field) => field.name === 'emailId')?.dbName).toBe('email_id')
    expect(model?.fields.find((field) => field.name === 'extractionType')?.dbName).toBe('extraction_type')
    expect(model?.fields.find((field) => field.name === 'rawData')?.dbName).toBe('raw_data')
    expect(model?.fields.find((field) => field.name === 'status')?.default).toBe('pending')
  })
})
