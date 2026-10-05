import type { TagPriority } from '../../generated/prisma/client'

export interface CreateTagInput {
  name: string
  color: string
  priority?: TagPriority
}

export interface UpdateTagInput {
  name?: string
  color?: string
  priority?: TagPriority
}
