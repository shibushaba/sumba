import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthProvider'

export function AdminGuard() {
  const { user, isAdmin, loading } = useAdminAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6 text-sm text-muted">
        Loading admin...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md p-6 text-center">
        <p className="font-display text-xl font-black uppercase">Access denied</p>
        <p className="mt-2 text-sm text-muted">
          This account is not authorized for admin access.
        </p>
      </div>
    )
  }

  return <Outlet />
}
