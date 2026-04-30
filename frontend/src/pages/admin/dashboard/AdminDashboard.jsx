import { useEffect, useState } from 'react'
import { fetchAdminPools } from '../../../api/adminPoolApi'
import { fetchUserProfile } from '../../../api/userApi'
import { setSession, getStoredUser } from '../../../api/session'
import { formatCurrencyAmount } from '../../../utils/currency'
import styles from './AdminDashboard.module.css'

function buildStats(pools) {
  return {
    total: pools.length,
    open: pools.filter((pool) => pool.status === 'open').length,
    pending: pools.filter((pool) => pool.status === 'pending').length,
    awaitingResult: pools.filter((pool) => pool.status === 'awaiting_result').length,
  }
}

export default function AdminDashboard() {
  const [user, setUser] = useState(getStoredUser())
  const [pools, setPools] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const [profile, nextPools] = await Promise.all([
          fetchUserProfile(),
          fetchAdminPools(),
        ])

        if (!active) return

        setUser(profile)
        setPools(nextPools)
        setSession({ user: profile })
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Could not load dashboard.')
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const stats = buildStats(pools)
  const recentPools = pools.slice(0, 5)

  return (
    <section className={styles.section}>
      <div className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Overview</p>
          <h2 className={styles.title}>Admin dashboard</h2>
          <p className={styles.subtitle}>
            Track pool volume, watch result queues, and confirm the signed-in admin account.
          </p>
        </div>

        <div className={styles.userCard}>
          <span className={styles.userLabel}>Signed in as</span>
          <strong>{user?.name || 'Admin user'}</strong>
          <span>{user?.email || 'No email loaded'}</span>
          <span className={styles.rolePill}>{user?.role || 'admin'}</span>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.statsGrid}>
        <article className={styles.statCard}>
          <span>Total Pools</span>
          <strong>{stats.total}</strong>
        </article>
        <article className={styles.statCard}>
          <span>Open Pools</span>
          <strong>{stats.open}</strong>
        </article>
        <article className={styles.statCard}>
          <span>Pending Pools</span>
          <strong>{stats.pending}</strong>
        </article>
        <article className={styles.statCard}>
          <span>Awaiting Result</span>
          <strong>{stats.awaitingResult}</strong>
        </article>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <p className={styles.eyebrow}>Recent activity</p>
            <h3 className={styles.panelTitle}>Latest pools</h3>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Category</th>
                <th>Currency</th>
                <th>Total pool</th>
              </tr>
            </thead>
            <tbody>
              {recentPools.length === 0 ? (
                <tr>
                  <td colSpan="5">No pools available yet.</td>
                </tr>
              ) : (
                recentPools.map((pool) => (
                  <tr key={pool.id}>
                    <td>{pool.title}</td>
                    <td>{pool.status}</td>
                    <td>{pool.category_name}</td>
                    <td>{pool.currency_code}</td>
                    <td>
                      {formatCurrencyAmount(
                        pool.total_pool_amount,
                        pool.currency_code,
                        pool.currency_decimal_places,
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
