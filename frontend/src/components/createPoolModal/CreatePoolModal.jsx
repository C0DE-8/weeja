import { IoClose } from 'react-icons/io5'
import CreatePoolSubmissionForm from '../createPoolSubmissionForm/CreatePoolSubmissionForm'
import CreatePoolSuccessModal from '../createPoolSuccessModal/CreatePoolSuccessModal'
import { formatCurrencyAmount } from '../../utils/currency'
import { useAccountWorkspace } from '../../pages/account/useAccountWorkspace'
import styles from './CreatePoolModal.module.css'

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

export default function CreatePoolModal({ onClose }) {
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

  return (
    <>
      {success ? (
        <CreatePoolSuccessModal
          message={success}
          onClose={clearCreatePoolSuccess}
        />
      ) : null}

      <div className={styles.overlay} onClick={onClose}>
        <div
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-pool-modal-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Creator workspace</p>
              <h2 className={styles.title} id="create-pool-modal-title">
                Create a pool
              </h2>
              <p className={styles.subtitle}>
                Build your pool, pay the creation fee from your wallet, and submit it for admin
                review.
              </p>
            </div>
            <button className={styles.closeButton} type="button" onClick={onClose} aria-label="Close create pool modal">
              <IoClose />
            </button>
          </div>

          {loading ? <p className={styles.loadingCard}>Loading your creator workspace...</p> : null}
          {!loading && error ? <p className={styles.errorBanner}>{error}</p> : null}

          {!loading ? (
            <div className={styles.content}>
              <section className={styles.formCard}>
                <div className={styles.cardHeader}>
                  <h3>Create a pool submission</h3>
                  <span>
                    {profile?.email || 'Signed in'}
                    {' · '}
                    {selectedFee
                      ? formatCurrencyAmount(
                          selectedFee.amount,
                          selectedFee.currency_code,
                          selectedFee.decimal_places,
                        )
                      : 'Fee unavailable'}
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

              <section className={styles.submissionsCard}>
                <div className={styles.cardHeader}>
                  <h3>My submissions</h3>
                  <span>{submissions.length} total</span>
                </div>

                <div className={styles.submissionList}>
                  {submissions.length === 0 ? (
                    <p className={styles.emptyState}>No submissions yet.</p>
                  ) : (
                    submissions.slice(0, 6).map((pool) => (
                      <article className={styles.submissionCard} key={pool.id}>
                        <div className={styles.submissionTop}>
                          <div>
                            <h4>{pool.title}</h4>
                            <p>{pool.description || 'No description provided.'}</p>
                          </div>
                          <div className={styles.statusStack}>
                            <span className={styles.statusPill}>{formatStatus(pool.review_status)}</span>
                            <span className={styles.statusPillMuted}>{formatStatus(pool.status)}</span>
                          </div>
                        </div>
                        <div className={styles.submissionMeta}>
                          <span>{pool.category_name}</span>
                          <span>Submitted {formatDateTime(pool.created_at)}</span>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}
