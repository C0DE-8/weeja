import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { HiOutlineMenuAlt3 } from 'react-icons/hi'
import { FiChevronDown, FiChevronRight } from 'react-icons/fi'
import { IoClose } from 'react-icons/io5'
import { clearSession, getStoredUser, isAdminUser } from '../../api/session'
import styles from './Header.module.css'

const poolLinks = [
  { label: 'Popular', to: '/' },
  { label: 'Opened', to: '/?tab=OPEN' },
  { label: 'Newest', to: '/?tab=NEWEST' },
  { label: 'Sport Pool', to: '/?tab=SPORT' },
  { label: 'Event Pool', to: '/?tab=EVENTS' },
  { label: 'Pool Results', to: '/results' },
]

export default function Header() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAllPoolOpen, setIsAllPoolOpen] = useState(true)
  const user = getStoredUser()
  const adminUser = isAdminUser(user)

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
            <button
              className={styles.mobileCreateButton}
              type="button"
              onClick={() => navigate(user ? '/account' : '/login')}
            >
              Create Pool
            </button>
          </div>

          <div className={styles.desktopBar}>
            <button className={styles.logoButton} type="button" onClick={() => navigate('/')}>
              <div className={styles.logo}>
                Wee<span className={styles.logoAccent}>ja</span>
              </div>
            </button>

            <nav className={styles.navLinks} aria-label="Primary navigation">
              <NavLink className={styles.navLink} to="/">
                Home
              </NavLink>
              <NavLink className={styles.navLink} to="/?tab=SPORT">
                Sport
              </NavLink>
              <NavLink className={styles.navLink} to="/?tab=EVENTS">
                Events
              </NavLink>
              <NavLink className={styles.navLink} to="/results">
                Results
              </NavLink>
            </nav>

            <div className={styles.authButtons}>
              {user ? (
                <>
                  <div className={styles.userBadge}>
                    <strong>{user.name}</strong>
                    <span>{user.role}</span>
                  </div>
                  {adminUser && (
                    <button
                      className={styles.loginButton}
                      type="button"
                      onClick={() => navigate('/admin/dashboard')}
                    >
                      Dashboard
                    </button>
                  )}
                  {!adminUser && (
                    <button
                      className={styles.signUpButton}
                      type="button"
                      onClick={() => navigate('/account')}
                    >
                      Account
                    </button>
                  )}
                  <button
                    className={styles.loginButton}
                    type="button"
                    onClick={() => {
                      clearSession()
                      navigate('/login')
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
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
              <span>All Pools</span>
              {isAllPoolOpen ? <FiChevronDown /> : <FiChevronRight />}
            </button>

            <div className={styles.menuContent}>
              {isAllPoolOpen && (
                <div className={styles.submenu}>
                  {poolLinks.map((item) => (
                    <button
                      key={item.to}
                      className={styles.submenuRow}
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false)
                        navigate(item.to)
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              <div className={styles.mainMenuSection}>
                <button
                  className={styles.mainMenuRow}
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false)
                    navigate('/?tab=SPORT')
                  }}
                >
                  <span>Sport Pool</span>
                  <FiChevronRight />
                </button>
                <button
                  className={styles.mainMenuRow}
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false)
                    navigate('/?tab=EVENTS')
                  }}
                >
                  <span>Event Pool</span>
                  <FiChevronRight />
                </button>
                <button
                  className={styles.mainMenuRow}
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false)
                    navigate('/results')
                  }}
                >
                  <span>Pool Results</span>
                  <FiChevronRight />
                </button>
              </div>
            </div>

            <div className={styles.bottomActions}>
              {user ? (
                <>
                  <button
                    className={styles.menuLoginButton}
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false)
                      navigate(adminUser ? '/admin/dashboard' : '/account')
                    }}
                  >
                    {adminUser ? 'Dashboard' : 'Account'}
                  </button>
                  <button
                    className={styles.menuSignUpButton}
                    type="button"
                    onClick={() => {
                      clearSession()
                      setIsMenuOpen(false)
                      navigate('/login')
                    }}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
