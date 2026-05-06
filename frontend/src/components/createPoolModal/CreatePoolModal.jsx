import { IoClose } from 'react-icons/io5'
import { useEffect } from 'react'
import CreatePoolSubmissionForm from '../createPoolSubmissionForm/CreatePoolSubmissionForm'
import CreatePoolSuccessModal from '../createPoolSuccessModal/CreatePoolSuccessModal'
import { useAccountWorkspace } from '../../pages/account/useAccountWorkspace'
import styles from './CreatePoolModal.module.css'

export default function CreatePoolModal({ onClose }) {
  const {
    categories,
    currencies,
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

  // Prevent background scroll when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [])

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
          <button
            className={styles.closeButton}
            type="button"
            onClick={onClose}
            aria-label="Close create pool modal"
          >
            <IoClose />
          </button>

          {loading ? <p className={styles.loadingCard}>Loading your creator workspace...</p> : null}
          {!loading && error ? <p className={styles.errorBanner}>{error}</p> : null}

          {!loading ? (
            <div className={styles.content}>
              <section className={styles.formCard}>
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
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}
