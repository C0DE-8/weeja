import { Navigate, Outlet } from 'react-router-dom'
import { getStoredUser, isSuperAdminUser } from '../../api/session'

export default function RequireSuperAdminRoute() {
  const user = getStoredUser()

  if (!isSuperAdminUser(user)) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return <Outlet />
}
