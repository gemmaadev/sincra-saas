import { useAuth } from '@/features/auth/hooks/useAuth'
import { Navigate, Outlet } from 'react-router'
import { PageSpinner } from '@/shared/components/spinner'

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <PageSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
