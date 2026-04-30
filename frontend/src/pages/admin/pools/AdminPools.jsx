import { useEffect, useState } from 'react'
import {
  cancelAdminPool,
  createAdminPool,
  fetchAdminPools,
  lockAdminPool,
  setAdminPoolResult,
  settleAdminPool,
} from '../../../api/adminPoolApi'
import { fetchAdminCategories } from '../../../api/categoryApi'
import styles from './AdminPools.module.css'

const INITIAL_FORM = {
  title: '',
  description: '',
  category_id: '',
  currency_id: '1',
  min_stake: '0',
  platform_fee_percent: '0',
  start_time: '',
  lock_time: '',
  status: 'pending',
  options: [
    { id: 'option-1', value: 'Option 1' },
    { id: 'option-2', value: 'Option 2' },
  ],
}

const CURRENCIES = [
  { id: 1, label: 'USD' },
  { id: 2, label: 'NGN' },
  { id: 3, label: 'CRYPTO' },
]

function toPayload(form) {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    category_id: Number(form.category_id),
    currency_id: Number(form.currency_id),
    min_stake: Number(form.min_stake),
    platform_fee_percent: Number(form.platform_fee_percent),
    start_time: form.start_time,
    lock_time: form.lock_time,
    status: form.status,
    options: form.options
      .map((option) => option.value.trim())
      .filter(Boolean)
      .map((optionLabel, index) => ({
        option_label: optionLabel,
        option_key: optionLabel.toLowerCase().replace(/\s+/g, '_'),
        sort_order: index + 1,
      })),
  }
}

export default function AdminPools() {
  const [pools, setPools] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(INITIAL_FORM)
  const [winningOptionIds, setWinningOptionIds] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  async function loadPools() {
    setLoading(true)
    try {
      const nextPools = await fetchAdminPools()
      setPools(nextPools)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load pools.')
    } finally {
      setLoading(false)
    }
  }

  async function loadCategories() {
    try {
      const nextCategories = await fetchAdminCategories()
      setCategories(nextCategories)
      setForm((current) => ({
        ...current,
        category_id:
          current.category_id || String(nextCategories.find((item) => item.is_active)?.id || ''),
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load categories.')
    }
  }

  useEffect(() => {
    loadPools()
    loadCategories()
  }, [])

  const handleCreatePool = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    try {
      const payload = toPayload(form)

      if (payload.options.length < 2) {
        setError('At least two pool options are required.')
        return
      }

      setCreating(true)
      const response = await createAdminPool(payload)
      setPools((current) => [response.pool, ...current])
      setForm(INITIAL_FORM)
      setSuccess('Pool created successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create pool.')
    } finally {
      setCreating(false)
    }
  }

  const runPoolAction = async (action, successMessage) => {
    setError('')
    setSuccess('')

    try {
      await action()
      await loadPools()
      setSuccess(successMessage)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pool action failed.')
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Pool Management</p>
          <h2 className={styles.title}>Create and control pools</h2>
          <p className={styles.subtitle}>
            Admin pools use their own API layer and operate directly on `/api/admin/pools`.
          </p>
        </div>
      </div>

      {error && <p className={styles.feedbackError}>{error}</p>}
      {success && <p className={styles.feedbackSuccess}>{success}</p>}

      <div className={styles.layout}>
        <form className={styles.createCard} onSubmit={handleCreatePool} noValidate>
          <div className={styles.cardHeader}>
            <h3>Create pool</h3>
            <span>Admin API</span>
          </div>

          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Title</span>
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Chelsea vs Arsenal"
              />
            </label>

            <label className={styles.field}>
              <span>Category</span>
              <select
                value={form.category_id}
                onChange={(event) => setForm({ ...form, category_id: event.target.value })}
              >
                <option value="" disabled>
                  Select category
                </option>
                {categories
                  .filter((category) => category.is_active)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.type})
                    </option>
                  ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>Currency</span>
              <select
                value={form.currency_id}
                onChange={(event) => setForm({ ...form, currency_id: event.target.value })}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>Status</span>
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value })}
              >
                <option value="pending">pending</option>
                <option value="open">open</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Minimum stake</span>
              <input
                value={form.min_stake}
                onChange={(event) => setForm({ ...form, min_stake: event.target.value })}
                type="number"
                min="0"
                step="0.01"
              />
            </label>

            <label className={styles.field}>
              <span>Platform fee %</span>
              <input
                value={form.platform_fee_percent}
                onChange={(event) =>
                  setForm({ ...form, platform_fee_percent: event.target.value })
                }
                type="number"
                min="0"
                max="100"
                step="0.01"
              />
            </label>

            <label className={`${styles.field} ${styles.fieldWide}`}>
              <span>Description</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                rows="4"
                placeholder="Add event details for users."
              />
            </label>

            <label className={styles.field}>
              <span>Start time</span>
              <input
                value={form.start_time}
                onChange={(event) => setForm({ ...form, start_time: event.target.value })}
                type="datetime-local"
              />
            </label>

            <label className={styles.field}>
              <span>Lock time</span>
              <input
                value={form.lock_time}
                onChange={(event) => setForm({ ...form, lock_time: event.target.value })}
                type="datetime-local"
              />
            </label>
          </div>

          <div className={styles.optionsCard}>
            <div className={styles.cardHeader}>
              <h4>Pool options</h4>
              <button
                className={styles.ghostButton}
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    options: [
                      ...current.options,
                      {
                        id: `option-${Date.now()}-${current.options.length + 1}`,
                        value: `Option ${current.options.length + 1}`,
                      },
                    ],
                  }))
                }
              >
                Add option
              </button>
            </div>

            <div className={styles.optionList}>
              {form.options.map((option, index) => (
                <div className={styles.optionRow} key={option.id}>
                  <span className={styles.optionIndex}>#{index + 1}</span>
                  <input
                    value={option.value}
                    onChange={(event) => {
                      const nextOptions = [...form.options]
                      nextOptions[index] = {
                        ...nextOptions[index],
                        value: event.target.value,
                      }
                      setForm({ ...form, options: nextOptions })
                    }}
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    className={styles.removeButton}
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        options: current.options.filter((_, optionIndex) => optionIndex !== index),
                      }))
                    }
                    disabled={form.options.length <= 2}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button className={styles.primaryButton} type="submit" disabled={creating}>
            {creating ? 'Creating pool...' : 'Create Pool'}
          </button>
        </form>

        <div className={styles.listCard}>
          <div className={styles.cardHeader}>
            <h3>Existing pools</h3>
            <span>{loading ? 'Loading...' : `${pools.length} total`}</span>
          </div>

          <div className={styles.poolList}>
            {pools.length === 0 ? (
              <p className={styles.emptyState}>No pools found.</p>
            ) : (
              pools.map((pool) => (
                <article className={styles.poolCard} key={pool.id}>
                  <div className={styles.poolTop}>
                    <div>
                      <h4>{pool.title}</h4>
                      <p>
                        {pool.category_name} · {pool.category_type} · {pool.currency_code} · {pool.status}
                      </p>
                    </div>
                    <span className={styles.pill}>#{pool.id}</span>
                  </div>

                  <p className={styles.descriptionText}>
                    {pool.description || 'No description supplied for this pool.'}
                  </p>

                  <div className={styles.metaGrid}>
                    <span>Min stake: {pool.min_stake}</span>
                    <span>Fee: {pool.platform_fee_percent}%</span>
                    <span>Start: {new Date(pool.start_time).toLocaleString()}</span>
                    <span>Lock: {new Date(pool.lock_time).toLocaleString()}</span>
                  </div>

                  <div className={styles.optionBadges}>
                    {pool.options.map((option) => (
                      <span className={styles.optionBadge} key={option.id}>
                        {option.option_label}
                      </span>
                    ))}
                  </div>

                  <div className={styles.actionRow}>
                    <button
                      className={styles.secondaryButton}
                      type="button"
                      onClick={() => runPoolAction(() => lockAdminPool(pool.id), 'Pool locked.')}
                    >
                      Lock
                    </button>

                    <select
                      value={winningOptionIds[pool.id] || ''}
                      onChange={(event) =>
                        setWinningOptionIds((current) => ({
                          ...current,
                          [pool.id]: event.target.value,
                        }))
                      }
                    >
                      <option value="">Winning option</option>
                      {pool.options.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.option_label}
                        </option>
                      ))}
                    </select>

                    <button
                      className={styles.secondaryButton}
                      type="button"
                      onClick={() =>
                        runPoolAction(
                          () =>
                            setAdminPoolResult(pool.id, Number(winningOptionIds[pool.id] || 0)),
                          'Pool result recorded.',
                        )
                      }
                    >
                      Set Result
                    </button>

                    <button
                      className={styles.secondaryButton}
                      type="button"
                      onClick={() =>
                        runPoolAction(() => settleAdminPool(pool.id), 'Pool settled successfully.')
                      }
                    >
                      Settle
                    </button>

                    <button
                      className={styles.dangerButton}
                      type="button"
                      onClick={() =>
                        runPoolAction(() => cancelAdminPool(pool.id), 'Pool cancelled and refunded.')
                      }
                    >
                      Cancel
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
