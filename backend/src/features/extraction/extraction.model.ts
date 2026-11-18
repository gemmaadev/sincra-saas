import prisma from '../../config/db'
import type { Prisma } from '../../generated/prisma/client'

export async function findExtractionById(id: string) {
  return prisma.extraction.findUnique({ where: { id } })
}

// Discarded findings are left out. The caller still has to match a real order of this business.
export async function findOpenIncidentExtractions(businessId: string) {
  return prisma.extraction.findMany({
    where: {
      businessId,
      extractionType: 'INCIDENT',
      status: { not: 'DISCARDED' },
    },
    select: { id: true, emailSubject: true, rawData: true },
  })
}

export async function insertExtraction(data: Prisma.ExtractionUncheckedCreateInput) {
  return prisma.extraction.create({ data })
}

export async function updateExtraction(id: string, data: Prisma.ExtractionUncheckedUpdateInput) {
  return prisma.extraction.update({ where: { id }, data })
}
