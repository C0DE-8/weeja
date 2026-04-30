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
          <div className={styles.heroBlock}>
            <p className={styles.eyebrow}>User submission flow</p>
            <h3 className={styles.heroTitle}>Launch a community pool from your wallet workspace.</h3>
            <div className={styles.helperSuccess}>
              Build the pool in your account area, pay the creation fee from the selected wallet,
              and send it to admins for review before it goes live.
            </div>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <strong>1</strong>
              <span>Choose category, currency, and options.</span>
            </div>
            <div className={styles.summaryCard}>
              <strong>2</strong>
              <span>Creation fee is held immediately from your wallet.</span>
            </div>
            <div className={styles.summaryCard}>
              <strong>3</strong>
              <span>Admins review, publish, or reject with refund.</span>
            </div>
          </div>

          <div className={styles.optionsBlock}>
            <div className={styles.optionsHeader}>
              <p className={styles.optionsTitle}>Before you submit</p>
            </div>
            <div className={styles.optionsList}>
              <div className={styles.infoRow}>Set a clear title and two or more outcome options.</div>
              <div className={styles.infoRow}>Use the wallet currency you want players to stake.</div>
              <div className={styles.infoRow}>Add start, lock, and end times before review.</div>
            </div>
          </div>

          <div className={styles.actionRow}>
            <button
              className={styles.primaryButton}
              type="button"
              onClick={() => navigate(isAuthenticated ? '/create' : '/login')}
            >
              {isAuthenticated ? 'Open creator workspace' : 'Login to create a pool'}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
