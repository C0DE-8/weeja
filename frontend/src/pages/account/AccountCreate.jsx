import Header from '../../components/header/Header'
import Footer from '../../components/footer/Footer'
import AccountWorkspaceNav from '../../components/accountWorkspaceNav/AccountWorkspaceNav'
import CreatePoolSubmissionForm from '../../components/createPoolSubmissionForm/CreatePoolSubmissionForm'
import CreatePoolSuccessModal from '../../components/createPoolSuccessModal/CreatePoolSuccessModal'
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
    clearCreatePoolSuccess,
  } = useAccountWorkspace()

  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <section className={styles.card}>
            <div className={styles.workspaceSkeleton}>
              <span className={styles.workspaceSkeletonTitle}></span>
              <span className={styles.workspaceSkeletonRow}></span>
              <span className={styles.workspaceSkeletonRow}></span>
              <span className={styles.workspaceSkeletonBlock}></span>
              <span className={styles.workspaceSkeletonRowShort}></span>
              <span className={styles.workspaceSkeletonButton}></span>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Header />
      {success ? (
        <CreatePoolSuccessModal
          message={success}
          onClose={clearCreatePoolSuccess}
        />
      ) : null}
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

        <div className={styles.gridWide}>
          <section className={`${styles.card} ${styles.createCard}`}>
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

            <CreatePoolSubmissionForm
              categories={categories}
              currencies={currencies}
              form={form}
              setForm={setForm}
              selectedFee={selectedFee}
              submitLoading={submitLoading}
              onSubmit={handleCreatePool}
            />
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
