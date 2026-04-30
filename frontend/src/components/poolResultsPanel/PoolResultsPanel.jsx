import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPublicPools } from '../../api/poolApi'
import styles from './PoolResultsPanel.module.css'

function getWinningOptionLabel(pool) {
  const winningOption = (pool.options || []).find((option) => option.id === pool.winning_option_id)
  return winningOption?.option_label || 'Result pending'
}

export default function PoolResultsPanel() {
  const navigate = useNavigate()
  const [showAll, setShowAll] = useState(false)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const pools = await fetchPublicPools({ status: 'settled' })
        if (!active) return
        setResults(pools)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Could not load results.')
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

  const visibleResults = useMemo(() => {
    const nextResults = results.filter((item) => item.review_status === 'approved')
    if (showAll) return nextResults
    return nextResults.slice(0, 3)
  }, [results, showAll])

  return (
    <section className={styles.panel} aria-label="Pool results panel">
      <div className={styles.headerRow}>
        <p className={styles.title}>POOL RESULTS</p>
      </div>

      <div className={styles.body}>
        {loading ? <div className={styles.feedbackCard}>Loading pool results...</div> : null}
        {error ? <div className={styles.feedbackCard}>{error}</div> : null}

        {!loading && !error && visibleResults.map((item) => (
          <div key={item.id} className={styles.resultCard}>
            <p className={styles.question}>{item.title}</p>
            <div className={styles.answerWrap}>
              <span className={styles.answerSelected}>
                {getWinningOptionLabel(item)}
              </span>
            </div>
          </div>
        ))}

        {!loading && !error && visibleResults.length === 0 ? (
          <div className={styles.feedbackCard}>No settled results yet.</div>
        ) : null}

        <button
          className={styles.secondaryButton}
          type="button"
          onClick={() => {
            if (!showAll && results.length > 3) {
              setShowAll(true)
              return
            }
            navigate('/results')
          }}
          aria-expanded={showAll}
        >
          {showAll || results.length <= 3 ? 'Open results page' : 'See more results'}
        </button>
      </div>
    </section>
  )
}
