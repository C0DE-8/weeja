import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlineMenuAlt3 } from 'react-icons/hi'
import { FiSearch, FiChevronDown, FiChevronRight } from 'react-icons/fi'
import { IoClose } from 'react-icons/io5'
import styles from './Header.module.css'

export default function Header() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAllPoolOpen, setIsAllPoolOpen] = useState(true)

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <div className={styles.mobileBar}>
            <button
              className={styles.mobileMenuButton}
              aria-label="Open menu"
              onClick={() => setIsMenuOpen(true)}
            >
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
              <button
                className={styles.loginButton}
                type="button"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button
                className={styles.signUpButton}
                type="button"
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div
          className={styles.mobileMenuOverlay}
          onClick={() => setIsMenuOpen(false)}
        >
          <aside
            className={styles.mobileMenuPanel}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className={styles.mobileMenuHeader}
              type="button"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className={styles.closeIcon}>
                <IoClose />
              </span>
              <span className={styles.closeLabel}>Close</span>
            </button>

            <button
              className={styles.allPoolRow}
              type="button"
              onClick={() => setIsAllPoolOpen((open) => !open)}
            >
              <span>All Pool</span>
              {isAllPoolOpen ? <FiChevronDown /> : <FiChevronRight />}
            </button>

            <div className={styles.menuContent}>
              {isAllPoolOpen && (
                <div className={styles.submenu}>
                  <button className={styles.submenuRow} type="button">
                    Popular
                  </button>
                  <button className={styles.submenuRow} type="button">
                    Opened
                  </button>
                  <button className={styles.submenuRow} type="button">
                    Newest
                  </button>
                  <button className={styles.submenuRow} type="button">
                    Pool Size
                  </button>
                  <button className={styles.submenuRow} type="button">
                    Location
                  </button>
                </div>
              )}

                <div className={styles.mainMenuSection}>
                <button className={styles.mainMenuRow} type="button">
                  <span>Sport Pool</span>
                  <FiChevronRight />
                </button>
                <button className={styles.mainMenuRow} type="button">
                  <span>Event Pool</span>
                  <FiChevronRight />
                </button>
                <button className={styles.mainMenuRow} type="button">
                  <span>Pool Results</span>
                  <FiChevronRight />
                </button>
              </div>
            </div>

            <div className={styles.bottomActions}>
              <button
                className={styles.menuLoginButton}
                type="button"
                onClick={() => {
                  setIsMenuOpen(false)
                  navigate('/login')
                }}
              >
                Login
              </button>
              <button
                className={styles.menuSignUpButton}
                type="button"
                onClick={() => {
                  setIsMenuOpen(false)
                  navigate('/signup')
                }}
              >
                Sign up
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
