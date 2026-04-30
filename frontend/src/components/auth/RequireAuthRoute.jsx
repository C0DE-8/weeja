import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getStoredToken } from '../../api/session'

export default function RequireAuthRoute() {
  const location = useLocation()

  if (!getStoredToken()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
