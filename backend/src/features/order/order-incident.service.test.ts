import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as extractionModel from '../extraction/extraction.model'
import * as orderModel from './order.model'
import { getUniqueViolationFields } from '../../shared/utils/prismaErrors'
import {
  applySureIncidents,
  incidentNoteFromExtraction,
  relatedOrderIdFromRaw,
} from './order-incident.service'

vi.mock('../extraction/extraction.model')
vi.mock('./order.model')
vi.mock('../../shared/utils/prismaErrors', () => ({
  getUniqueViolationFields: vi.fn(),
}))

const extraction = {
  id: 'extraction-1',
  emailSubject: 'El paquete llegó roto',
  rawData: {
    relatedOrderId: 'order-1',
    evidence: ['La caja venía abierta'],
  },
}

describe('relatedOrderIdFromRaw', () => {
  // Given a finding that only names the client, or a free-text order reference
  // When looking for the order id
  // Then nothing is returned
  it('ignores the client id, a created order id and a free-text reference', () => {
    expect(relatedOrderIdFromRaw({ clientId: 'client-1', createdOrderId: 'order-9' })).toBeNull()
    expect(relatedOrderIdFromRaw({ relatedOrderReference: 'pedido 12' })).toBeNull()
  })

  // Given the order id nested inside findings
  // When the top level does not have one
  // Then the nested id is used
  it('reads relatedOrderId from the first finding', () => {
    expect(relatedOrderIdFromRaw({ findings: [{ relatedOrderId: ' order-2 ' }] })).toBe('order-2')
  })
})

describe('incidentNoteFromExtraction', () => {
  // Given a subject and quoted sentences
  // When building the note Sincro will leave on the order
  // Then it is marked as suggested by the AI and keeps both pieces
  it('prefixes the subject and the quoted sentences', () => {
    expect(incidentNoteFromExtraction('El paquete llegó roto', extraction.rawData)).toBe(
      'Sugerido por IA: El paquete llegó roto. La caja venía abierta',
    )
  })
})

describe('applySureIncidents', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(getUniqueViolationFields).mockReturnValue(null)
    vi.mocked(extractionModel.findOpenIncidentExtractions).mockResolvedValue([extraction] as never)
    vi.mocked(orderModel.findAppliedExtractionIds).mockResolvedValue([])
    vi.mocked(orderModel.findOrderById).mockResolvedValue({
      id: 'order-1',
      status: 'PREPARING',
    } as never)
    vi.mocked(orderModel.updateOrderWithItems).mockResolvedValue({ id: 'order-1' } as never)
  })

  // Given an incident email that names an order of this business
  // When Sincro reviews open incidents
  // Then that order becomes an incident, with an AI note, and the finding itself is left alone
  it('marks the matching order and keeps the email finding unchanged', async () => {
    await applySureIncidents('business-1')

    expect(extractionModel.findOpenIncidentExtractions).toHaveBeenCalledWith('business-1')
    expect(orderModel.updateOrderWithItems).toHaveBeenCalledWith(
      'order-1',
      { status: 'INCIDENT' },
      undefined,
      {
        status: 'INCIDENT',
        changedBy: null,
        note: 'Sugerido por IA: El paquete llegó roto. La caja venía abierta',
        sourceExtractionId: 'extraction-1',
      },
      {
        content: 'Sugerido por IA: El paquete llegó roto. La caja venía abierta',
        createdBy: null,
      },
    )
  })

  // Given the order id belongs to another business
  // When Sincro reviews incidents
  // Then nothing is written
  it('does nothing when the order is not in this business', async () => {
    vi.mocked(orderModel.findOrderById).mockResolvedValue(null)

    await applySureIncidents('business-1')

    expect(orderModel.updateOrderWithItems).not.toHaveBeenCalled()
  })

  // Given this email already marked the order once
  // When Sincro reviews incidents again, after the person resolved it
  // Then it does not mark the order a second time
  it('does not mark an order again for an email that was already applied', async () => {
    vi.mocked(orderModel.findAppliedExtractionIds).mockResolvedValue(['extraction-1'])

    await applySureIncidents('business-1')

    expect(orderModel.updateOrderWithItems).not.toHaveBeenCalled()
  })

  // Given the order is already an incident, or it is cancelled
  // When the email names that order
  // Then Sincro leaves the current status as it is
  it.each(['INCIDENT', 'CANCELLED'])('leaves an order that is already %s', async (status) => {
    vi.mocked(orderModel.findOrderById).mockResolvedValue({ id: 'order-1', status } as never)

    await applySureIncidents('business-1')

    expect(orderModel.updateOrderWithItems).not.toHaveBeenCalled()
  })

  // Given the analyzer marked the message as spam
  // When it also contains an order id
  // Then Sincro does not change the order
  it('ignores a finding marked as spam', async () => {
    vi.mocked(extractionModel.findOpenIncidentExtractions).mockResolvedValue([
      { ...extraction, rawData: { ...extraction.rawData, isSpam: true } },
    ] as never)

    await applySureIncidents('business-1')

    expect(orderModel.updateOrderWithItems).not.toHaveBeenCalled()
  })

  // Given two requests try to store the same email at once
  // When the second one hits the unique constraint
  // Then it stops without failing the whole review
  it('ignores a duplicate write of the same email', async () => {
    vi.mocked(orderModel.updateOrderWithItems).mockRejectedValue(new Error('unique'))
    vi.mocked(getUniqueViolationFields).mockReturnValue(['source_extraction_id'])

    await expect(applySureIncidents('business-1')).resolves.toBeUndefined()
  })
})
