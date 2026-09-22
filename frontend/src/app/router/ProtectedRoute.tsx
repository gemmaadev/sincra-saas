import { useAuth } from '@/features/auth/hooks/useAuth'
import { Navigate, Outlet } from 'react-router'
 
export function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <p className="p-6 text-ink-muted">Cargando...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
