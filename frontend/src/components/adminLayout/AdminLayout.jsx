import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  FiChevronDown,
  FiChevronUp,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiHome,
  FiKey,
  FiLogOut,
  FiMenu,
  FiX,
} from 'react-icons/fi'
import { clearSession, getStoredUser, isSuperAdminUser } from '../../api/session'
import styles from './AdminLayout.module.css'

function navClassName({ isActive }) {
  return isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
}

function subNavClassName({ isActive }) {
  return isActive ? `${styles.subNavLink} ${styles.subNavLinkActive}` : styles.subNavLink
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getStoredUser()
  const isSuperAdmin = isSuperAdminUser(user)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false)

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: FiHome },
    {
      to: '/admin/pools/create',
      label: 'Pools',
      icon: FiGrid,
      children: [
        { to: '/admin/pools/create', label: 'Create pool' },
        { to: '/admin/pools/existing', label: 'Existing pools' },
        { to: '/admin/pools/submissions', label: 'User submissions' },
      ],
    },
    ...(isSuperAdmin ? [{ to: '/admin/passkeys', label: 'Passkeys', icon: FiKey }] : []),
    { to: '/', label: 'Public site', icon: FiChevronRight },
  ]

  const activeTitle =
    navItems.find((item) =>
      item.children
        ? item.children.some((child) => location.pathname.startsWith(child.to))
        : location.pathname.startsWith(item.to),
    )?.label || 'Workspace'

  const renderNav = (compact = false) => (
    <nav className={styles.nav}>
      {navItems.map((item) => {
        const Icon = item.icon
        const isSectionActive = item.children
          ? item.children.some((child) => location.pathname.startsWith(child.to))
          : location.pathname.startsWith(item.to)

        if (item.children) {
          return (
            <div className={styles.navSection} key={item.label}>
              <NavLink
                aria-label={item.label}
                className={({ isActive }) =>
                  isActive || isSectionActive
                    ? `${styles.navLink} ${styles.navLinkActive}`
                    : styles.navLink
                }
                onClick={() => setIsMobileNavOpen(false)}
                to={item.to}
              >
                <span className={styles.navIcon}>
                  <Icon />
                </span>
                {!compact && <span className={styles.navLabel}>{item.label}</span>}
                {!compact && (
                  <span className={styles.navCaret}>
                    {isSectionActive ? <FiChevronUp /> : <FiChevronDown />}
                  </span>
                )}
              </NavLink>

              {!compact && (
                <div className={styles.subNav}>
                  {item.children.map((child) => (
                    <NavLink
                      className={subNavClassName}
                      key={child.to}
                      onClick={() => setIsMobileNavOpen(false)}
                      to={child.to}
                    >
                      <span className={styles.subNavDot} />
                      <span>{child.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        }

        return (
          <NavLink
            aria-label={item.label}
            className={navClassName}
            key={item.to}
            onClick={() => setIsMobileNavOpen(false)}
            to={item.to}
          >
            <span className={styles.navIcon}>
              <Icon />
            </span>
            {!compact && <span className={styles.navLabel}>{item.label}</span>}
          </NavLink>
        )
      })}
    </nav>
  )

  return (
    <div className={`${styles.page} ${isDesktopCollapsed ? styles.pageCollapsed : ''}`}>
      <header className={styles.mobileTopbar}>
        <button
          aria-label="Open navigation"
          className={styles.mobileMenuButton}
          onClick={() => setIsMobileNavOpen(true)}
          type="button"
        >
          <FiMenu />
        </button>

        <div className={styles.mobileTopbarText}>
          <span className={styles.mobileTopbarEyebrow}>Weeja</span>
          <strong>{activeTitle}</strong>
        </div>

        <button
          className={styles.mobileLogoutButton}
          type="button"
          onClick={() => {
            clearSession()
            navigate('/admin/login')
          }}
        >
          <FiLogOut />
        </button>
      </header>

      <aside className={styles.sidebar}>
        <div className={styles.sidebarInner}>
          <div className={styles.sidebarHeaderBlock}>
            <div className={styles.sidebarTop}>
              <div className={styles.brandBlock}>
                <p className={styles.eyebrow}>Weeja Admin</p>
                {!isDesktopCollapsed && <h1 className={styles.brand}>Control Center</h1>}
                {!isDesktopCollapsed && (
                  <p className={styles.meta}>
                    {user?.name || 'Admin'}
                    {' · '}
                    {(user?.role || 'admin').replace('_', ' ')}
                  </p>
                )}
              </div>

              <button
                aria-label={isDesktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className={styles.collapseButton}
                onClick={() => setIsDesktopCollapsed((current) => !current)}
                type="button"
              >
                {isDesktopCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
              </button>
            </div>
          </div>

          <div className={styles.sidebarNavArea}>{renderNav(isDesktopCollapsed)}</div>
        </div>

        <button
          className={styles.logoutButton}
          type="button"
          onClick={() => {
            clearSession()
            navigate('/admin/login')
          }}
        >
          <span className={styles.navIcon}>
            <FiLogOut />
          </span>
          {!isDesktopCollapsed && <span className={styles.navLabel}>Log out</span>}
        </button>
      </aside>

      {isMobileNavOpen && (
        <div className={styles.mobileOverlay} onClick={() => setIsMobileNavOpen(false)}>
          <aside className={styles.mobileDrawer} onClick={(event) => event.stopPropagation()}>
            <div className={styles.mobileDrawerHeader}>
              <div>
                <p className={styles.eyebrow}>Weeja Admin</p>
                <h2 className={styles.mobileDrawerTitle}>Navigation</h2>
              </div>
              <button
                aria-label="Close navigation"
                className={styles.mobileCloseButton}
                onClick={() => setIsMobileNavOpen(false)}
                type="button"
              >
                <FiX />
              </button>
            </div>

            <div className={styles.mobileDrawerBody}>
              <div className={styles.mobileUserCard}>
                <strong>{user?.name || 'Admin'}</strong>
                <span>{(user?.role || 'admin').replace('_', ' ')}</span>
              </div>

              <div className={styles.mobileNavArea}>{renderNav(false)}</div>
            </div>

            <button
              className={styles.mobilePrimaryAction}
              type="button"
              onClick={() => {
                clearSession()
                navigate('/admin/login')
              }}
            >
              Log out
            </button>
          </aside>
        </div>
      )}

      <main className={styles.main}>
        <div className={styles.contentShell}>
          <div className={styles.desktopTopbar}>
            <div>
              <span className={styles.desktopTopbarEyebrow}>Workspace</span>
              <h2 className={styles.desktopTopbarTitle}>{activeTitle}</h2>
            </div>

            <div className={styles.desktopTopbarMeta}>
              <span>{user?.name || 'Admin'}</span>
              <span className={styles.desktopRolePill}>
                {(user?.role || 'admin').replace('_', ' ')}
              </span>
            </div>
          </div>

          <Outlet />
        </div>
      </main>
    </div>
  )
}
