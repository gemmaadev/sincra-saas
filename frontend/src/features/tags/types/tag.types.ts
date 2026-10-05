export type TagPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Tag {
  id: string
  name: string
  color: string
  priority: TagPriority
  isDefault: boolean
}

export interface CreateTagInput {
  name: string
  color: string
  priority?: TagPriority
}

export interface CreateTagResponse {
  tag: Tag
}
