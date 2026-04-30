import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getStoredToken, getStoredUser, isAdminUser } from '../../api/session'

export default function RequireAdminRoute() {
  const location = useLocation()
  const token = getStoredToken()
  const user = getStoredUser()

  if (!token || !user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  if (!isAdminUser(user)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
