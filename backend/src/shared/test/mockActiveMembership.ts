import { vi } from 'vitest'
import * as authModel from '../../features/auth/auth.model'

// verifyAuth re-checks membership against the DB, so route tests need this mocked or every request gets 401.
export function mockActiveMembership(role: 'ADMIN' | 'EMPLOYEE' = 'ADMIN') {
  vi.spyOn(authModel, 'findActiveMembership').mockResolvedValue({ role } as never)
}
