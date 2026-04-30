import { useEffect, useMemo, useState } from 'react'
import {
  approvePoolSubmission,
  fetchAdminPoolReviews,
  fetchCreationFeeSettings,
  rejectPoolSubmission,
  updateCreationFee,
} from '../../../api/adminPoolReviewApi'
import { formatCurrencyAmount } from '../../../utils/currency'
import styles from './AdminPoolSubmissions.module.css'

function splitDateTime(value) {
  if (!value) return { date: '', time: '' }
  const normalized = String(value).replace(' ', 'T')
  const [date = '', time = ''] = normalized.split('T')
  return { date, time: time.slice(0, 5) }
}

function joinDateTime(date, time) {
  if (!date || !time) return undefined
  return `${date}T${time}`
}

function formatStatus(value) {
  return String(value || '')
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function AdminPoolSubmissions() {
  const [feeSettings, setFeeSettings] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [drafts, setDrafts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadPage = async () => {
    const [nextFees, nextSubmissions] = await Promise.all([
      fetchCreationFeeSettings(),
      fetchAdminPoolReviews(),
    ])

    setFeeSettings(nextFees)
    setSubmissions(nextSubmissions)
    setDrafts((current) => {
      const next = { ...current }

      nextSubmissions.forEach((pool) => {
        if (next[pool.id]) return
        const start = splitDateTime(pool.start_time)
        const lock = splitDateTime(pool.lock_time)
        const end = splitDateTime(pool.end_time)
        next[pool.id] = {
          platform_fee_percent: String(pool.platform_fee_percent ?? 0),
          review_notes: pool.review_notes || '',
          start_date: start.date,
          start_time: start.time,
          lock_date: lock.date,
          lock_time: lock.time,
          end_date: end.date,
          end_time: end.time,
        }
      })

      return next
    })
  }

  useEffect(() => {
    let active = true

    async function run() {
      try {
        await loadPage()
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Could not load submissions.')
      } finally {
        if (active) setLoading(false)
      }
    }

    run()
    return () => {
      active = false
    }
  }, [])

  const pendingCount = useMemo(
    () => submissions.filter((pool) => pool.review_status === 'under_review').length,
    [submissions],
  )

  const handleFeeSave = async (currencyId, amount) => {
    setError('')
    setMessage('')

    try {
      const res = await updateCreationFee(currencyId, amount)
      setFeeSettings(res.fee_settings || [])
      setMessage('Creation fees updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update creation fee.')
    }
  }

  const handleApprove = async (poolId) => {
    const draft = drafts[poolId]
    setError('')
    setMessage('')

    try {
      await approvePoolSubmission(poolId, {
        platform_fee_percent: Number(draft.platform_fee_percent),
        review_notes: draft.review_notes,
        start_time: joinDateTime(draft.start_date, draft.start_time),
        lock_time: joinDateTime(draft.lock_date, draft.lock_time),
        end_time: joinDateTime(draft.end_date, draft.end_time),
      })
      setMessage('Pool approved and published.')
      await loadPage()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not approve submission.')
    }
  }

  const handleReject = async (poolId) => {
    const draft = drafts[poolId]
    setError('')
    setMessage('')

    try {
      await rejectPoolSubmission(poolId, {
        review_notes: draft.review_notes,
      })
      setMessage('Pool rejected and creation fee refunded.')
      await loadPage()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reject submission.')
    }
  }

  if (loading) {
    return <section className={styles.loadingCard}>Loading pool review queue...</section>
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Pool review</p>
          <h1>User pool submissions</h1>
          <p>Set creation fees, review user-created pools, then approve or reject them.</p>
        </div>
        <div className={styles.headerStat}>
          <strong>{pendingCount}</strong>
          <span>Pending reviews</span>
        </div>
      </header>

      {error ? <p className={styles.errorBanner}>{error}</p> : null}
      {message ? <p className={styles.successBanner}>{message}</p> : null}

      <section className={styles.feeSection}>
        <div className={styles.sectionHeader}>
          <h2>Creation fee settings</h2>
          <span>These amounts are debited from the user wallet when they submit a new pool.</span>
        </div>

        <div className={styles.feeGrid}>
          {feeSettings.map((setting) => (
            <article className={styles.feeCard} key={setting.currency_id}>
              <strong>{setting.currency_code}</strong>
              <span>{setting.currency_name}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={setting.amount}
                onChange={(event) =>
                  setFeeSettings((current) =>
                    current.map((item) =>
                      item.currency_id === setting.currency_id
                        ? { ...item, amount: event.target.value }
                        : item,
                    ),
                  )
                }
              />
              <button
                className={styles.primaryButton}
                type="button"
                onClick={() => handleFeeSave(setting.currency_id, Number(setting.amount))}
              >
                Save fee
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.queueSection}>
        <div className={styles.sectionHeader}>
          <h2>Submission queue</h2>
          <span>Approved pools go live immediately with the platform fee you assign.</span>
        </div>

        <div className={styles.queueList}>
          {submissions.map((pool) => {
            const draft = drafts[pool.id] || {}

            return (
              <article className={styles.queueCard} key={pool.id}>
                <div className={styles.queueTop}>
                  <div>
                    <h3>{pool.title}</h3>
                    <p>{pool.description || 'No description provided.'}</p>
                  </div>
                  <div className={styles.statusStack}>
                    <span className={styles.statusPill}>{formatStatus(pool.review_status)}</span>
                    <span className={styles.statusMuted}>{formatStatus(pool.status)}</span>
                  </div>
                </div>

                <div className={styles.metaRow}>
                  <span>{pool.created_by_name}</span>
                  <span>{pool.category_name}</span>
                  <span>
                    {formatCurrencyAmount(
                      pool.creation_fee_amount,
                      pool.currency_code,
                      pool.currency_decimal_places,
                    )}{' '}
                    held
                  </span>
                  <span>{pool.min_stake} min stake</span>
                </div>

                <div className={styles.optionRow}>
                  {(pool.options || []).map((option) => (
                    <span className={styles.optionChip} key={option.id}>
                      {option.option_label}
                    </span>
                  ))}
                </div>

                <div className={styles.reviewGrid}>
                  <label className={styles.field}>
                    <span>Platform fee %</span>
                    <input
                      min="0"
                      step="0.01"
                      type="number"
                      value={draft.platform_fee_percent || ''}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [pool.id]: {
                            ...current[pool.id],
                            platform_fee_percent: event.target.value,
                          },
                        }))
                      }
                    />
                  </label>

                  <label className={styles.field}>
                    <span>Start date</span>
                    <input
                      type="date"
                      value={draft.start_date || ''}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [pool.id]: {
                            ...current[pool.id],
                            start_date: event.target.value,
                          },
                        }))
                      }
                    />
                  </label>

                  <label className={styles.field}>
                    <span>Start time</span>
                    <input
                      type="time"
                      value={draft.start_time || ''}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [pool.id]: {
                            ...current[pool.id],
                            start_time: event.target.value,
                          },
                        }))
                      }
                    />
                  </label>

                  <label className={styles.field}>
                    <span>Lock date</span>
                    <input
                      type="date"
                      value={draft.lock_date || ''}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [pool.id]: {
                            ...current[pool.id],
                            lock_date: event.target.value,
                          },
                        }))
                      }
                    />
                  </label>

                  <label className={styles.field}>
                    <span>Lock time</span>
                    <input
                      type="time"
                      value={draft.lock_time || ''}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [pool.id]: {
                            ...current[pool.id],
                            lock_time: event.target.value,
                          },
                        }))
                      }
                    />
                  </label>

                  <label className={styles.field}>
                    <span>End date</span>
                    <input
                      type="date"
                      value={draft.end_date || ''}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [pool.id]: {
                            ...current[pool.id],
                            end_date: event.target.value,
                          },
                        }))
                      }
                    />
                  </label>

                  <label className={styles.field}>
                    <span>End time</span>
                    <input
                      type="time"
                      value={draft.end_time || ''}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [pool.id]: {
                            ...current[pool.id],
                            end_time: event.target.value,
                          },
                        }))
                      }
                    />
                  </label>
                </div>

                <label className={styles.field}>
                  <span>Review note</span>
                  <textarea
                    rows={3}
                    value={draft.review_notes || ''}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [pool.id]: {
                          ...current[pool.id],
                          review_notes: event.target.value,
                        },
                      }))
                    }
                    placeholder="Optional note visible in the user workspace."
                  />
                </label>

                {pool.review_status === 'under_review' ? (
                  <div className={styles.actionRow}>
                    <button
                      className={styles.primaryButton}
                      type="button"
                      onClick={() => handleApprove(pool.id)}
                    >
                      Approve and publish
                    </button>
                    <button
                      className={styles.dangerButton}
                      type="button"
                      onClick={() => handleReject(pool.id)}
                    >
                      Reject and refund
                    </button>
                  </div>
                ) : (
                  <p className={styles.reviewStamp}>
                    Reviewed by {pool.reviewed_by_name} on{' '}
                    {pool.reviewed_at ? new Date(pool.reviewed_at).toLocaleString() : 'N/A'}
                  </p>
                )}
              </article>
            )
          })}
        </div>
      </section>
    </section>
  )
}
