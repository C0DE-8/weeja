import { useMemo, useRef } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import styles from './PoolTabs.module.css'

const defaultTabs = ['OPEN', 'ALL', 'NEWEST', 'SPORT', 'EVENTS', 'LOCATION']

export default function PoolTabs({ activeTab = 'OPEN', onChange, tabs = defaultTabs }) {
  const rowRef = useRef(null)

  const tabItems = useMemo(() => tabs, [tabs])

  const scrollByAmount = (direction) => {
    if (!rowRef.current) return
    rowRef.current.scrollBy({ left: 180 * direction, behavior: 'smooth' })
  }

  return (
    <nav className={styles.tabs} aria-label="Pool filters">
      <button
        className={styles.arrowButton}
        type="button"
        aria-label="Scroll left"
        onClick={() => scrollByAmount(-1)}
      >
        <FiChevronLeft />
      </button>

      <div className={styles.tabRow} ref={rowRef}>
        {tabItems.map((tab) => (
          <button
            key={tab}
            className={tab === activeTab ? styles.tabActive : styles.tab}
            type="button"
            onClick={() => onChange?.(tab)}
            aria-current={tab === activeTab ? 'page' : undefined}
          >
            {tab}
          </button>
        ))}
      </div>

      <button
        className={styles.arrowButton}
        type="button"
        aria-label="Scroll right"
        onClick={() => scrollByAmount(1)}
      >
        <FiChevronRight />
      </button>
    </nav>
  )
}
