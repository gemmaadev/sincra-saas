export interface UserBusiness {
  businessId: string
  name: string
  sector?: string
  role: 'ADMIN' | 'EMPLOYEE'
}

export interface UserBusinessesResponse {
  businesses: UserBusiness[]
}
