import Header from '../../components/header/Header'
import Footer from '../../components/footer/Footer'
import AccountWorkspaceNav from '../../components/accountWorkspaceNav/AccountWorkspaceNav'
import { formatCurrencyAmount } from '../../utils/currency'
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

export default function AccountCreate() {
  const {
    profile,
    categories,
    currencies,
    submissions,
    form,
    setForm,
    loading,
    submitLoading,
    error,
    success,
    selectedFee,
    handleCreatePool,
  } = useAccountWorkspace()

  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <section className={styles.loadingCard}>Loading your creator workspace...</section>
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
            <p className={styles.eyebrow}>Creator workspace</p>
            <h1>Create a pool and track your submissions</h1>
            <p className={styles.heroText}>
              Build your pool, pay the creation fee from the selected wallet, and follow admin
              review decisions from the same workspace.
            </p>
          </div>
          <div className={styles.heroMeta}>
            <span>{profile?.email}</span>
            <strong>{submissions.length} submissions</strong>
          </div>
        </section>

        {error ? <p className={styles.errorBanner}>{error}</p> : null}
        {success ? <p className={styles.successBanner}>{success}</p> : null}

        <div className={styles.gridWide}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Create a pool submission</h2>
              <span>
                Current creation fee:{' '}
                {selectedFee
                  ? formatCurrencyAmount(
                      selectedFee.amount,
                      selectedFee.currency_code,
                      selectedFee.decimal_places,
                    )
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
                      ? formatCurrencyAmount(
                          selectedFee.amount,
                          selectedFee.currency_code,
                          selectedFee.decimal_places,
                        )
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
                    <span>
                      {formatCurrencyAmount(
                        pool.creation_fee_amount,
                        pool.currency_code,
                        pool.currency_decimal_places,
                      )}{' '}
                      fee
                    </span>
                    <span>
                      Total pool:{' '}
                      {formatCurrencyAmount(
                        pool.total_pool_amount,
                        pool.currency_code,
                        pool.currency_decimal_places,
                      )}
                    </span>
                    <span>Entries: {pool.total_pool_entries || 0}</span>
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
