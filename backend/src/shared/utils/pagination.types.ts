export interface PaginationQuery {
  page?: string
  limit?: string
}

export interface PaginationParams {
  page: number
  limit: number
  skip: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
