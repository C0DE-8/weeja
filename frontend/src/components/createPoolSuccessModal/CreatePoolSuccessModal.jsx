import { useNavigate } from 'react-router-dom'
import styles from './CreatePoolSuccessModal.module.css'

export default function CreatePoolSuccessModal({ message, onClose }) {
  const navigate = useNavigate()

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="pool-created-title">
      <div className={styles.modal}>
        <div className={styles.successIcon} aria-hidden="true" />
        <h2 className={styles.title} id="pool-created-title">
          Pool Submitted Successfully!
        </h2>
        <p className={styles.message}>{message}</p>
        <button className={styles.primaryButton} type="button" onClick={onClose}>
          Create Another Pool
        </button>
        <button className={styles.secondaryButton} type="button" onClick={() => navigate('/')}>
          Return to Homepage
        </button>
      </div>
    </div>
  )
}
