import Header from '../../components/header/Header'
import Footer from '../../components/footer/Footer'
import AccountWorkspaceNav from '../../components/accountWorkspaceNav/AccountWorkspaceNav'
import styles from './AccountDashboard.module.css'
import { useAccountWorkspace } from './useAccountWorkspace'

function formatDateTime(value) {
  if (!value) return 'Not set'
  return new Date(value).toLocaleString()
}

function formatStatus(value) {
  return String(value || '')
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function AccountDashboard() {
  const {
    profile,
    profileName,
    setProfileName,
    loading,
    profileLoading,
    error,
    profileMessage,
    handleProfileSave,
  } = useAccountWorkspace()

  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <section className={styles.loadingCard}>Loading your workspace...</section>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <AccountWorkspaceNav />
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Account workspace</p>
            <h1>Manage your profile and workspace access</h1>
            <p className={styles.heroText}>
              Keep your profile current, move to your wallet page for balances, and use the create
              page for new pool submissions and review tracking.
            </p>
          </div>
          <div className={styles.heroMeta}>
            <span>{profile?.email}</span>
            <strong>{formatStatus(profile?.role)}</strong>
          </div>
        </section>

        {error ? <p className={styles.errorBanner}>{error}</p> : null}

        <div className={styles.gridSingle}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Profile</h2>
              <span>Keep your account details current.</span>
            </div>

            <form className={styles.form} onSubmit={handleProfileSave}>
              <label className={styles.field}>
                <span>Name</span>
                <input
                  value={profileName}
                  onChange={(event) => setProfileName(event.target.value)}
                  type="text"
                />
              </label>

              <label className={styles.field}>
                <span>Email</span>
                <input value={profile?.email || ''} disabled type="email" />
              </label>

              <label className={styles.field}>
                <span>Member since</span>
                <input value={formatDateTime(profile?.created_at)} disabled type="text" />
              </label>

              {profileMessage ? <p className={styles.inlineMessage}>{profileMessage}</p> : null}

              <button className={styles.primaryButton} disabled={profileLoading} type="submit">
                {profileLoading ? 'Saving...' : 'Save profile'}
              </button>
            </form>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
