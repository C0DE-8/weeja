import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiChevronDown, FiChevronRight } from 'react-icons/fi'
import { getStoredToken } from '../../api/session'
import styles from './CreatePoolPanel.module.css'

export default function CreatePoolPanel() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(true)
  const isAuthenticated = Boolean(getStoredToken())

  return (
    <section className={styles.panel} aria-label="Create pool panel">
      <button
        className={styles.headerRow}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
      >
        <p className={styles.title}>CREATE POOL</p>
        {isOpen ? (
          <FiChevronDown className={styles.chevron} aria-hidden="true" />
        ) : (
          <FiChevronRight className={styles.chevron} aria-hidden="true" />
        )}
      </button>

      {isOpen ? (
        <div className={styles.form}>
          <div className={styles.field}>
            <p className={styles.label}>User pool workflow</p>
            <div className={styles.helperSuccess}>
              Submit your own pool idea from the account workspace. The system will charge the
              configured creation fee from your wallet, then hold the pool for admin review.
            </div>
          </div>

          <div className={styles.optionsBlock}>
            <div className={styles.optionsHeader}>
              <p className={styles.optionsTitle}>What happens next</p>
            </div>
            <div className={styles.optionsList}>
              <div className={styles.control}>1. Choose category, wallet currency, and options.</div>
              <div className={styles.control}>2. Creation fee is debited immediately from your wallet.</div>
              <div className={styles.control}>3. Admin reviews, sets the platform fee, then publishes or refunds.</div>
            </div>
          </div>

          <button
            className={styles.primaryButton}
            type="button"
            onClick={() => navigate(isAuthenticated ? '/account' : '/login')}
          >
            {isAuthenticated ? 'Open creator workspace' : 'Login to create a pool'}
          </button>
        </div>
      ) : null}
    </section>
  )
}
