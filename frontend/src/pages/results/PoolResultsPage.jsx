import { useEffect, useMemo, useState } from 'react'
import { FiChevronDown, FiChevronRight, FiSliders } from 'react-icons/fi'
import Header from '../../components/header/Header'
import Footer from '../../components/footer/Footer'
import { fetchPublicPools } from '../../api/poolApi'
import { formatCurrencyAmount } from '../../utils/currency'
import styles from './PoolResultsPage.module.css'

const DATE_FILTERS = [
  { label: '24 Hours ago', days: 1 },
  { label: '3 Days ago', days: 3 },
  { label: '7 Days ago', days: 7 },
  { label: '14 Days ago', days: 14 },
]

function getCurrencyMark(currencyCode) {
  return String(currencyCode || '').toUpperCase().includes('USDT')
    ? 'T'
    : String(currencyCode || 'T').charAt(0)
}

function formatResultDate(value) {
  if (!value) return 'Date not set'

  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getResultDate(pool) {
  return pool.end_time || pool.lock_time || pool.updated_at || pool.created_at
}

export default function PoolResultsPage() {
  const [pools, setPools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isCountryOpen, setIsCountryOpen] = useState(false)
  const [isDateOpen, setIsDateOpen] = useState(false)
  const [selectedDateFilter, setSelectedDateFilter] = useState(null)

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

  const visiblePools = useMemo(() => {
    const approvedPools = pools.filter((pool) => pool.review_status === 'approved')

    if (!selectedDateFilter) return approvedPools

    const now = Date.now()
    const maxAge = selectedDateFilter.days * 24 * 60 * 60 * 1000

    return approvedPools.filter((pool) => {
      const resultDate = getResultDate(pool)
      if (!resultDate) return false
      return now - new Date(resultDate).getTime() <= maxAge
    })
  }, [pools, selectedDateFilter])

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.toolbar}>
          <h1 className={styles.title}>POOL RESULTS</h1>
          <button
            className={styles.filterButton}
            type="button"
            onClick={() => {
              setIsFilterOpen((open) => !open)
              setIsDateOpen(false)
              setIsCountryOpen(false)
            }}
            aria-expanded={isFilterOpen}
          >
            <FiSliders />
            <span>Filter</span>
            <FiChevronDown className={isFilterOpen ? styles.chevronOpen : undefined} />
          </button>
        </section>

        {isFilterOpen ? (
          <section className={styles.filterPanel} aria-label="Filter pool results">
            <button
              className={styles.filterRow}
              type="button"
              onClick={() => {
                setIsCountryOpen((open) => !open)
                setIsDateOpen(false)
              }}
            >
              <span>COUNTRY/REGION</span>
              {isCountryOpen ? <FiChevronDown /> : <FiChevronRight />}
            </button>

            {isCountryOpen ? (
              <div className={styles.filterOptions}>
                <button className={styles.filterOptionActive} type="button">
                  All regions
                </button>
              </div>
            ) : null}

            <button
              className={styles.filterRow}
              type="button"
              onClick={() => {
                setIsDateOpen((open) => !open)
                setIsCountryOpen(false)
              }}
            >
              <span>DATE POSTED</span>
              {isDateOpen ? <FiChevronDown /> : <FiChevronRight />}
            </button>

            {isDateOpen ? (
              <div className={styles.dateOptions}>
                {DATE_FILTERS.map((item) => (
                  <button
                    key={item.label}
                    className={
                      selectedDateFilter?.label === item.label
                        ? styles.filterOptionActive
                        : styles.filterOption
                    }
                    type="button"
                    onClick={() => setSelectedDateFilter(item)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        <div className={isFilterOpen ? styles.resultsDimmed : styles.resultsWrap}>
          {loading ? (
            <section className={styles.list} aria-label="Loading pool results">
              {Array.from({ length: 4 }).map((_, index) => (
                <article className={styles.resultSkeleton} key={`result-skeleton-${index + 1}`}>
                  <div className={styles.skeletonHead}>
                    <span className={styles.skeletonTitle}></span>
                    <span className={styles.skeletonAmount}></span>
                  </div>
                  <div className={styles.skeletonOptions}>
                    <span></span>
                    <span></span>
                    {index === 3 ? <span></span> : null}
                  </div>
                  <span className={styles.skeletonDate}></span>
                </article>
              ))}
            </section>
          ) : null}
          {error ? <div className={styles.errorCard}>{error}</div> : null}

          {!loading && !error ? (
          <section className={styles.list}>
            {visiblePools.length > 0 ? (
              visiblePools.map((pool) => (
                <article className={styles.card} key={pool.id}>
                  <div className={styles.cardTop}>
                    <h2 className={styles.cardTitle}>{pool.title}</h2>
                    <div className={styles.amount}>
                      <span className={styles.currencyMark}>{getCurrencyMark(pool.currency_code)}</span>
                      <strong>
                        {formatCurrencyAmount(
                          pool.min_stake,
                          pool.currency_code,
                          pool.currency_decimal_places,
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className={styles.options}>
                    {(pool.options || []).map((option, index) => {
                      const isWinner = option.id === pool.winning_option_id
                      const variantClass = isWinner
                        ? styles.optionWinner
                        : index % 3 === 1
                          ? styles.optionOrange
                          : styles.optionBlue

                      return (
                        <span className={variantClass} key={option.id}>
                          {option.option_label}
                        </span>
                      )
                    })}
                  </div>

                  <p className={styles.date}>{formatResultDate(getResultDate(pool))}</p>
                </article>
              ))
            ) : (
              <div className={styles.messageCard}>No settled pool results are available yet.</div>
            )}
          </section>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  )
}
