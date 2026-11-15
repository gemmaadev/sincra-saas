import prisma from '../../config/db'
import type { Prisma } from '../../generated/prisma/client'

export async function insertExtraction(data: Prisma.ExtractionUncheckedCreateInput) {
  return prisma.extraction.create({ data })
}
