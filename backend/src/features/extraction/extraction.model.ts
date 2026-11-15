import prisma from '../../config/db'
import type { Prisma } from '../../generated/prisma/client'

export async function findExtractionById(id: string) {
  return prisma.extraction.findUnique({ where: { id } })
}

export async function insertExtraction(data: Prisma.ExtractionUncheckedCreateInput) {
  return prisma.extraction.create({ data })
}

export async function updateExtraction(id: string, data: Prisma.ExtractionUncheckedUpdateInput) {
  return prisma.extraction.update({ where: { id }, data })
}
