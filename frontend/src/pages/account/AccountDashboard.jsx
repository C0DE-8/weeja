import { useEffect, useMemo, useState } from 'react'
import Header from '../../components/header/Header'
import Footer from '../../components/footer/Footer'
import { fetchActiveCategories } from '../../api/categoryApi'
import { fetchUserProfile, updateUserProfile } from '../../api/userApi'
import { fetchWallets, fetchWalletTransactions } from '../../api/walletApi'
import { createUserPool, fetchUserPoolMeta, fetchUserPools } from '../../api/userPoolApi'
import { getStoredToken, setSession } from '../../api/session'
import styles from './AccountDashboard.module.css'

const INITIAL_FORM = {
  title: '',
  description: '',
  category_id: '',
  currency_id: '',
  min_stake: '0',
  start_date: '',
  start_time: '',
  lock_date: '',
  lock_time: '',
  end_date: '',
  end_time: '',
  options: ['Yes', 'No'],
}

function joinDateTime(date, time) {
  if (!date || !time) return undefined
  return `${date}T${time}`
}

function formatDateTime(value) {
  if (!value) return 'Not set'
  return new Date(value).toLocaleString()
}

function formatMoney(value, currencyCode) {
  return `${Number(value || 0).toFixed(2)} ${currencyCode || ''}`.trim()
}

function formatStatus(value) {
  return String(value || '')
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function AccountDashboard() {
  const [profile, setProfile] = useState(null)
  const [profileName, setProfileName] = useState('')
  const [wallets, setWallets] = useState([])
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [currencies, setCurrencies] = useState([])
  const [feeSettings, setFeeSettings] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [form, setForm] = useState(INITIAL_FORM)
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [profileMessage, setProfileMessage] = useState('')

  const loadDashboard = async () => {
    const [nextProfile, nextWallets, nextTransactions, categoryData, meta, nextSubmissions] =
      await Promise.all([
        fetchUserProfile(),
        fetchWallets(),
        fetchWalletTransactions(15),
        fetchActiveCategories(),
        fetchUserPoolMeta(),
        fetchUserPools(),
      ])

    setProfile(nextProfile)
    setProfileName(nextProfile.name || '')
    setSession({ token: getStoredToken(), user: nextProfile })
    setWallets(nextWallets)
    setTransactions(nextTransactions)
    setCategories(categoryData.categories || [])
    setCurrencies(meta.currencies || [])
    setFeeSettings(meta.fee_settings || [])
    setSubmissions(nextSubmissions)
    setForm((current) => ({
      ...current,
      category_id: current.category_id || String(categoryData.categories?.[0]?.id || ''),
      currency_id: current.currency_id || String(meta.currencies?.[0]?.id || ''),
    }))
  }

  useEffect(() => {
    let active = true

    async function run() {
      try {
        await loadDashboard()
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Could not load your account.')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    run()
    return () => {
      active = false
    }
  }, [])

  const selectedFee = useMemo(
    () => feeSettings.find((setting) => String(setting.currency_id) === String(form.currency_id)),
    [feeSettings, form.currency_id],
  )

  const handleProfileSave = async (event) => {
    event.preventDefault()
    setProfileMessage('')
    setProfileLoading(true)

    try {
      const res = await updateUserProfile({ name: profileName.trim() })
      setProfile(res.user)
      setSession({ token: getStoredToken(), user: res.user })
      setProfileMessage('Profile updated.')
    } catch (err) {
      setProfileMessage(err instanceof Error ? err.message : 'Could not update profile.')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleCreatePool = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSubmitLoading(true)

    try {
      const cleanedOptions = form.options
        .map((option, index) => ({
          option_label: option.trim(),
          sort_order: index + 1,
        }))
        .filter((option) => option.option_label)

      await createUserPool({
        title: form.title.trim(),
        description: form.description.trim(),
        category_id: Number(form.category_id),
        currency_id: Number(form.currency_id),
        min_stake: Number(form.min_stake || 0),
        start_time: joinDateTime(form.start_date, form.start_time),
        lock_time: joinDateTime(form.lock_date, form.lock_time),
        end_time: joinDateTime(form.end_date, form.end_time),
        options: cleanedOptions,
      })

      setSuccess('Pool submitted. The creation fee has been held pending admin review.')
      setForm({
        ...INITIAL_FORM,
        category_id: form.category_id,
        currency_id: form.currency_id,
      })
      await loadDashboard()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your pool.')
    } finally {
      setSubmitLoading(false)
    }
  }

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
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Account workspace</p>
            <h1>Manage your profile, wallets, and pool submissions</h1>
            <p className={styles.heroText}>
              User-created pools are charged a creation fee from your selected wallet, then held
              for admin review before the pool can go live.
            </p>
          </div>
          <div className={styles.heroMeta}>
            <span>{profile?.email}</span>
            <strong>{formatStatus(profile?.role)}</strong>
          </div>
        </section>

        {error ? <p className={styles.errorBanner}>{error}</p> : null}
        {success ? <p className={styles.successBanner}>{success}</p> : null}

        <div className={styles.grid}>
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

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Wallets</h2>
              <span>Creation fees are taken from the wallet matching your selected currency.</span>
            </div>

            <div className={styles.walletGrid}>
              {wallets.map((wallet) => (
                <article className={styles.walletCard} key={wallet.id}>
                  <strong>{wallet.currency_code}</strong>
                  <span>{wallet.currency_name}</span>
                  <h3>{formatMoney(wallet.balance, wallet.currency_code)}</h3>
                  <small>{formatStatus(wallet.status)}</small>
                </article>
              ))}
            </div>

            <div className={styles.transactionList}>
              {transactions.map((transaction) => (
                <div className={styles.transactionRow} key={transaction.id}>
                  <div>
                    <strong>{transaction.description || transaction.reference}</strong>
                    <span>{formatDateTime(transaction.created_at)}</span>
                  </div>
                  <div className={styles.transactionMeta}>
                    <strong>{formatMoney(transaction.amount, transaction.currency_code)}</strong>
                    <span>{formatStatus(transaction.type)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.gridWide}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Create a pool submission</h2>
              <span>
                Current creation fee:{' '}
                {selectedFee
                  ? formatMoney(selectedFee.amount, selectedFee.currency_code)
                  : 'Not configured'}
              </span>
            </div>

            <form className={styles.form} onSubmit={handleCreatePool}>
              <div className={styles.twoColumn}>
                <label className={styles.field}>
                  <span>Title</span>
                  <input
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Who will win the final?"
                    type="text"
                  />
                </label>

                <label className={styles.field}>
                  <span>Category</span>
                  <select
                    value={form.category_id}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, category_id: event.target.value }))
                    }
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.type})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className={styles.field}>
                <span>Description</span>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="Describe the event and what the pool is deciding."
                />
              </label>

              <div className={styles.threeColumn}>
                <label className={styles.field}>
                  <span>Wallet currency</span>
                  <select
                    value={form.currency_id}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, currency_id: event.target.value }))
                    }
                  >
                    <option value="">Select currency</option>
                    {currencies.map((currency) => (
                      <option key={currency.id} value={currency.id}>
                        {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span>Minimum stake</span>
                  <input
                    min="0"
                    step="0.01"
                    type="number"
                    value={form.min_stake}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, min_stake: event.target.value }))
                    }
                  />
                </label>

                <div className={styles.feeCard}>
                  <span>Creation fee</span>
                  <strong>
                    {selectedFee
                      ? formatMoney(selectedFee.amount, selectedFee.currency_code)
                      : 'Unavailable'}
                  </strong>
                </div>
              </div>

              <div className={styles.threeColumn}>
                <label className={styles.field}>
                  <span>Start date</span>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, start_date: event.target.value }))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>Lock date</span>
                  <input
                    type="date"
                    value={form.lock_date}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, lock_date: event.target.value }))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>End date</span>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, end_date: event.target.value }))
                    }
                  />
                </label>
              </div>

              <div className={styles.threeColumn}>
                <label className={styles.field}>
                  <span>Start time</span>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, start_time: event.target.value }))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>Lock time</span>
                  <input
                    type="time"
                    value={form.lock_time}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, lock_time: event.target.value }))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>End time</span>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, end_time: event.target.value }))
                    }
                  />
                </label>
              </div>

              <div className={styles.optionSection}>
                <div className={styles.optionHeader}>
                  <strong>Pool options</strong>
                  <button
                    className={styles.secondaryButton}
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        options: [...current.options, ''],
                      }))
                    }
                    type="button"
                  >
                    Add option
                  </button>
                </div>

                {form.options.map((option, index) => (
                  <div className={styles.optionRow} key={`option-${index + 1}`}>
                    <input
                      type="text"
                      value={option}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          options: current.options.map((item, optionIndex) =>
                            optionIndex === index ? event.target.value : item,
                          ),
                        }))
                      }
                      placeholder={`Option ${index + 1}`}
                    />
                    <button
                      className={styles.secondaryButton}
                      disabled={form.options.length <= 2}
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          options: current.options.filter((_, optionIndex) => optionIndex !== index),
                        }))
                      }
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button className={styles.primaryButton} disabled={submitLoading} type="submit">
                {submitLoading ? 'Submitting...' : 'Submit for review'}
              </button>
            </form>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>My submissions</h2>
              <span>Track review decisions and whether your fee was released or refunded.</span>
            </div>

            <div className={styles.submissionList}>
              {submissions.map((pool) => (
                <article className={styles.submissionCard} key={pool.id}>
                  <div className={styles.submissionTop}>
                    <div>
                      <h3>{pool.title}</h3>
                      <p>{pool.description || 'No description provided.'}</p>
                    </div>
                    <div className={styles.statusStack}>
                      <span className={styles.statusPill}>{formatStatus(pool.review_status)}</span>
                      <span className={styles.statusPillMuted}>{formatStatus(pool.status)}</span>
                    </div>
                  </div>

                  <div className={styles.submissionMeta}>
                    <span>{pool.category_name}</span>
                    <span>{formatMoney(pool.creation_fee_amount, pool.currency_code)} fee</span>
                    <span>{pool.platform_fee_percent}% platform fee</span>
                    <span>Submitted {formatDateTime(pool.created_at)}</span>
                  </div>

                  <div className={styles.optionChips}>
                    {(pool.options || []).map((option) => (
                      <span className={styles.optionChip} key={option.id}>
                        {option.option_label}
                      </span>
                    ))}
                  </div>

                  {pool.review_notes ? (
                    <p className={styles.reviewNote}>Admin note: {pool.review_notes}</p>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
