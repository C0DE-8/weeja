import { useEffect, useMemo, useState } from 'react'
import Header from '../../components/header/Header'
import Footer from '../../components/footer/Footer'
import { fetchPublicPools } from '../../api/poolApi'
import { formatCurrencyAmount } from '../../utils/currency'
import styles from './PoolResultsPage.module.css'

function getWinningOptionLabel(pool) {
  const winningOption = (pool.options || []).find((option) => option.id === pool.winning_option_id)
  return winningOption?.option_label || 'No result recorded'
}

export default function PoolResultsPage() {
  const [pools, setPools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const nextPools = await fetchPublicPools({ status: 'settled' })
        if (!active) return
        setPools(nextPools)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Could not load pool results.')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const visiblePools = useMemo(() => pools.filter((pool) => pool.review_status === 'approved'), [pools])

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Settled markets</p>
          <h1 className={styles.title}>Pool results</h1>
          <p className={styles.subtitle}>
            Review completed pools, winning outcomes, and total amounts paid into each market.
          </p>
        </section>

        {loading ? <div className={styles.messageCard}>Loading results...</div> : null}
        {error ? <div className={styles.errorCard}>{error}</div> : null}

        {!loading && !error ? (
          <section className={styles.grid}>
            {visiblePools.length > 0 ? (
              visiblePools.map((pool) => (
                <article className={styles.card} key={pool.id}>
                  <div className={styles.cardTop}>
                    <div>
                      <h2 className={styles.cardTitle}>{pool.title}</h2>
                      <p className={styles.meta}>
                        {pool.category_name} · {pool.currency_code} · Settled
                      </p>
                    </div>
                    <span className={styles.resultPill}>{getWinningOptionLabel(pool)}</span>
                  </div>

                  <div className={styles.infoGrid}>
                    <span>
                      Total pool:{' '}
                      {formatCurrencyAmount(
                        pool.total_pool_amount,
                        pool.currency_code,
                        pool.currency_decimal_places,
                      )}
                    </span>
                    <span>Entries: {pool.total_pool_entries || 0}</span>
                    <span>
                      Locked:{' '}
                      {pool.lock_time ? new Date(pool.lock_time).toLocaleString() : 'Not set'}
                    </span>
                    <span>
                      Ended: {pool.end_time ? new Date(pool.end_time).toLocaleString() : 'Not set'}
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <div className={styles.messageCard}>No settled pool results are available yet.</div>
            )}
          </section>
        ) : null}
      </main>
      <Footer />
    </div>
  )
}
