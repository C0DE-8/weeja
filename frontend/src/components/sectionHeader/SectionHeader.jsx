import { useEffect, useRef, useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import { FaFire } from 'react-icons/fa'
import styles from './SectionHeader.module.css'

export default function SectionHeader({ searchValue = '', onSearchChange }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchInputRef = useRef(null)

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus()
    }
  }, [isSearchOpen])

  const handleSearchToggle = () => {
    setIsSearchOpen((open) => {
      const nextOpen = !open
      if (!nextOpen) {
        onSearchChange?.('')
      }
      return nextOpen
    })
  }

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
          onClick={handleSearchToggle}
          aria-expanded={isSearchOpen}
        >
          <FiSearch />
        </button>
      </div>

      {isSearchOpen && (
        <div className={styles.searchBar}>
          <input
            ref={searchInputRef}
            className={styles.searchInput}
            type="text"
            placeholder="Search pool, event"
            aria-label="Search pool or event"
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
          />
        </div>
      )}
    </section>
  )
}
