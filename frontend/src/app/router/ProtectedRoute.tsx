import { Outlet } from 'react-router'

// TODO: sustituir por comprobación real de sesión cuando exista AuthContext
export function ProtectedRoute() {
  return <Outlet />
}
