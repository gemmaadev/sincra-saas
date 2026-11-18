import { AppError } from '../../shared/AppError'
import { getUniqueViolationFields } from '../../shared/utils/prismaErrors'
import { findOpenIncidentExtractions } from '../extraction/extraction.model'
import { findAppliedExtractionIds, findOrderById, updateOrderWithItems } from './order.model'

export const INCIDENT_NOTE_MAX_LENGTH = 1000
export const AI_INCIDENT_NOTE_PREFIX = 'Sugerido por IA:'

// The mail analyzer stores the order id here when it is sure. A free-text reference is not enough.
export function relatedOrderIdFromRaw(rawData: unknown): string | null {
  const record = asRecord(rawData)
  if (!record) return null

  const topLevel = readId(record.relatedOrderId)
  if (topLevel) return topLevel

  if (!Array.isArray(record.findings)) return null

  for (const finding of record.findings) {
    const nested = readId(asRecord(finding)?.relatedOrderId)
    if (nested) return nested
  }

  return null
}

export function incidentNoteFromExtraction(emailSubject: string | null, rawData: unknown): string {
  const source = findingRecord(rawData) ?? asRecord(rawData)
  const evidence = readEvidence(source)
  const pieces = [emailSubject?.trim(), evidence.join(' ')].filter((piece): piece is string =>
    Boolean(piece),
  )
  const body = pieces.join('. ') || 'Se ha detectado una incidencia en un correo de este pedido.'
  const note = `${AI_INCIDENT_NOTE_PREFIX} ${body}`

  return note.length <= INCIDENT_NOTE_MAX_LENGTH
    ? note
    : note.slice(0, INCIDENT_NOTE_MAX_LENGTH).trimEnd()
}

export function assertIncidentNote(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError('Cuenta qué ha pasado con el pedido', 400, 'MISSING_INCIDENT_NOTE')
  }

  const note = value.trim()
  if (note.length > INCIDENT_NOTE_MAX_LENGTH) {
    throw new AppError('La nota de la incidencia es demasiado larga', 400, 'INCIDENT_NOTE_TOO_LONG')
  }

  return note
}

// Marks orders Sincro can tie to one INCIDENT email. It does not touch the finding's own status,
// and it does not run again for an email that already marked an order.
export async function applySureIncidents(businessId: string) {
  const extractions = await findOpenIncidentExtractions(businessId)
  if (extractions.length === 0) return

  const applied = new Set(await findAppliedExtractionIds(extractions.map((row) => row.id)))

  for (const extraction of extractions) {
    if (applied.has(extraction.id) || isSpam(extraction.rawData)) continue

    const orderId = relatedOrderIdFromRaw(extraction.rawData)
    if (!orderId) continue

    const order = await findOrderById(businessId, orderId)
    if (!order || order.status === 'INCIDENT' || order.status === 'CANCELLED') continue

    const note = incidentNoteFromExtraction(extraction.emailSubject, extraction.rawData)

    try {
      await updateOrderWithItems(
        order.id,
        { status: 'INCIDENT' },
        undefined,
        {
          status: 'INCIDENT',
          changedBy: null,
          note,
          sourceExtractionId: extraction.id,
        },
        { content: note, createdBy: null },
      )
    } catch (error) {
      // Another request already stored this email. Resolving the incident must stay resolved.
      if (getUniqueViolationFields(error)) continue
      throw error
    }
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function readId(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function findingRecord(rawData: unknown): Record<string, unknown> | null {
  const record = asRecord(rawData)
  const findings = record?.findings
  if (!Array.isArray(findings) || findings.length === 0) return null
  return asRecord(findings[0])
}

function readEvidence(source: Record<string, unknown> | null): string[] {
  const evidence = source?.evidence
  if (!Array.isArray(evidence)) return []

  return evidence
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim())
}

function isSpam(rawData: unknown): boolean {
  return asRecord(rawData)?.isSpam === true
}
