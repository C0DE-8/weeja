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
  poolSize = '10,000 USDT',
  weejians = '200',
}) {
  return (
    <article className={styles.card}>
      <div className={styles.desktopTopRow}>
        <h3 className={styles.question}>{question}</h3>
        <div className={styles.desktopRightGroup}>
          <button className={styles.shareButton} aria-label="Share pool" type="button">
            <FiShare2 />
          </button>
          <div className={styles.desktopAmount}>
            <strong className={styles.desktopAmountValue}>{amount}</strong>
            <span className={styles.desktopCurrencyToken}>{currency}</span>
          </div>
        </div>
      </div>

      <div className={styles.topRow}>
        <h3 className={styles.question}>{question}</h3>
        <button className={styles.shareButton} aria-label="Share pool" type="button">
          <FiShare2 />
        </button>
      </div>
      <div className={styles.infoRow}>
        <div className={styles.details}>
          <span className={styles.metaLabel}>Ends</span>
          <span className={styles.metaValue}>
            {poolEndTime} · {poolEndDate}
          </span>
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

      <div className={styles.desktopInfoRow}>
        <div className={styles.desktopInfoLeft}>
          <span className={styles.desktopInfoItem}>
            <span className={styles.desktopInfoLabel}>Pool Size:</span> {poolSize}
          </span>
          <span className={styles.desktopInfoItem}>
            <span className={styles.desktopInfoLabel}>Weejians:</span> {weejians}
          </span>
        </div>
        <div className={styles.desktopInfoRight}>
          <span className={styles.desktopEnds}>
            <span className={styles.desktopInfoLabel}>Pool Ends:</span> {poolEndTime}{' '}
            {poolEndDate}
          </span>
          <span className={styles.desktopStatus}>{status}</span>
        </div>
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
