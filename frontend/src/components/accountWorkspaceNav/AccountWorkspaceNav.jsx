import { NavLink } from 'react-router-dom'
import styles from './AccountWorkspaceNav.module.css'

function linkClassName({ isActive }) {
  return isActive ? `${styles.link} ${styles.linkActive}` : styles.link
}

export default function AccountWorkspaceNav() {
  return (
    <nav className={styles.nav} aria-label="Account workspace navigation">
      <NavLink className={linkClassName} to="/account" end>
        Account
      </NavLink>
      <NavLink className={linkClassName} to="/wallet">
        Wallet
      </NavLink>
      <NavLink className={linkClassName} to="/create">
        Create
      </NavLink>
    </nav>
  )
}
