import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import styles from './PoolTabs.module.css'

const tabs = ['OPEN', 'ALL', 'NEWEST', 'SPORT', 'EVENTS', 'LOCATION']

export default function PoolTabs() {
  return (
    <nav className={styles.tabs} aria-label="Pool filters">
      <button className={styles.arrowButton} type="button" aria-label="Scroll left">
        <FiChevronLeft />
      </button>

      <div className={styles.tabRow}>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={tab === 'OPEN' ? styles.tabActive : styles.tab}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      <button className={styles.arrowButton} type="button" aria-label="Scroll right">
        <FiChevronRight />
      </button>
    </nav>
  )
}

