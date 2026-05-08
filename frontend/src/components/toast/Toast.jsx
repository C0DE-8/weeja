import styles from './Toast.module.css'

export default function Toast({ message, onClose, type = 'success' }) {
  if (!message) {
    return null
  }

  const className = type === 'error' ? `${styles.toast} ${styles.error}` : styles.toast

  return (
    <div className={styles.toastWrap} role="alert" aria-live="assertive">
      <div className={className}>
        <p>{message}</p>
        <button type="button" onClick={onClose} aria-label="Close message">
          Close
        </button>
      </div>
    </div>
  )
}
