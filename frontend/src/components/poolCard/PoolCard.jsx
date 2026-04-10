import { FiShare2, FiChevronDown } from 'react-icons/fi'
import styles from './PoolCard.module.css'

export default function PoolCard({
  question,
  poolEndTime,
  poolEndDate,
  status,
  amount,
  currency,
  options,
  showMore,
  activeOption,
}) {
  return (
    <article className={styles.card}>
      <div className={styles.topRow}>
        <h3 className={styles.question}>{question}</h3>
        <button className={styles.shareButton} aria-label="Share pool">
          <FiShare2 />
        </button>
      </div>
      <div className={styles.infoRow}>
        <div className={styles.details}>
          <span className={styles.metaLabel}>Ends</span>
          <span className={styles.metaValue}>{poolEndTime} · {poolEndDate}</span>
          <span className={styles.status}>{status}</span>
        </div>
        <div className={styles.amountBlock}>
          <span className={styles.currencyToken}>{currency}</span>
          <strong className={styles.amountValue}>{amount}</strong>
        </div>
      </div>
      <div className={styles.optionsRow}>
        {options.map((option) => {
          const isActive = option === activeOption
          return (
            <button
              key={option}
              className={isActive ? styles.optionButtonActive : styles.optionButton}
              type="button"
            >
              {option}
            </button>
          )
        })}
      </div>
      {showMore && (
        <button className={styles.moreButton} type="button">
          <span>View more options</span>
          <FiChevronDown />
        </button>
      )}
    </article>
  )
}
