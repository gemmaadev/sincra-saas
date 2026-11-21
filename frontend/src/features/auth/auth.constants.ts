import type { UserBusiness } from './types/business.types'

export const BUSINESS_ROLE_LABELS: Record<UserBusiness['role'], string> = {
  ADMIN: 'Administrador',
  EMPLOYEE: 'Empleado',
}
