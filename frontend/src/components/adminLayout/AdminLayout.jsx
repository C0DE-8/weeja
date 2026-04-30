import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearSession, getStoredUser } from '../../api/session'
import styles from './AdminLayout.module.css'

function navClassName({ isActive }) {
  return isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const user = getStoredUser()

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.eyebrow}>Weeja Admin</p>
          <h1 className={styles.brand}>Pool Control</h1>
          <p className={styles.meta}>
            {user?.name || 'Admin'}
            {' · '}
            {user?.role || 'admin'}
          </p>
        </div>

        <nav className={styles.nav}>
          <NavLink className={navClassName} to="/admin/dashboard">
            Dashboard
          </NavLink>
          <NavLink className={navClassName} to="/admin/pools">
            Pool Management
          </NavLink>
          <NavLink className={navClassName} to="/">
            Public Site
          </NavLink>
        </nav>

        <button
          className={styles.logoutButton}
          type="button"
          onClick={() => {
            clearSession()
            navigate('/admin/login')
          }}
        >
          Log out
        </button>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
