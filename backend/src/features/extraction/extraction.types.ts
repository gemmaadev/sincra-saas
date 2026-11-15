export interface CreateExtractionInput {
  businessId: string
  emailId: string
  emailSubject?: string | null
  emailFrom: string
  emailTo?: string | null
  extractionType: unknown
  rawData?: unknown
  confidence?: number | null
  status?: unknown
  syncedAt?: Date | null
}
