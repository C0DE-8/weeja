import { useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import { FaFire } from 'react-icons/fa'
import styles from './SectionHeader.module.css'

export default function SectionHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <section className={styles.section}>
      <div className={styles.headerRow}>
        <div className={styles.leftBlock}>
          <span className={styles.iconWrap}>
            <FaFire />
          </span>
          <h2 className={styles.title}>POPULAR POOL</h2>
        </div>

        <button
          className={styles.searchButton}
          aria-label="Search pools"
          type="button"
          onClick={() => setIsSearchOpen((open) => !open)}
          aria-expanded={isSearchOpen}
        >
          <FiSearch />
        </button>
      </div>

      {isSearchOpen && (
        <div className={styles.searchBar}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search pool, event"
            aria-label="Search pool or event"
          />
        </div>
      )}
    </section>
  )
}
