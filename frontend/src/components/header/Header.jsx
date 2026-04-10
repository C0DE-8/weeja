import { HiOutlineMenuAlt3 } from 'react-icons/hi'
import { FiSearch } from 'react-icons/fi'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.mobileBar}>
          <button className={styles.mobileMenuButton} aria-label="Open menu">
            <HiOutlineMenuAlt3 />
          </button>
          <button className={styles.mobileCreateButton}>Create Event</button>
        </div>

        <div className={styles.desktopBar}>
          <div className={styles.logo}>
            Wee<span className={styles.logoAccent}>ja</span>
          </div>

          <div className={styles.searchWrapper}>
            <FiSearch className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search pool, event"
              aria-label="Search pool or event"
            />
          </div>

          <div className={styles.authButtons}>
            <button className={styles.loginButton} type="button">
              Login
            </button>
            <button className={styles.signUpButton} type="button">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
