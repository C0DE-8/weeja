import { useMemo, useState } from 'react'
import { FiChevronDown, FiChevronRight } from 'react-icons/fi'
import {
  GiSoccerBall,
  GiBasketballBall,
  GiVolleyballBall,
  GiBaseballBat,
  GiBoxingGlove,
  GiHockey,
  GiTennisBall,
  GiPodiumWinner,
  GiTv,
  GiTwoCoins,
  GiWhistle,
  GiCapitol,
} from 'react-icons/gi'
import styles from './DesktopSidebar.module.css'

const sportItems = [
  { label: 'Soccer', Icon: GiSoccerBall },
  { label: 'Basketball', Icon: GiBasketballBall },
  { label: 'Volleyball', Icon: GiVolleyballBall },
  { label: 'Baseball', Icon: GiBaseballBat },
  { label: 'Boxing', Icon: GiBoxingGlove },
  { label: 'Hockey', Icon: GiHockey },
  { label: 'Tennis', Icon: GiTennisBall },
]

const eventItems = [
  { label: 'Competitions', Icon: GiPodiumWinner },
  { label: 'Politics', Icon: GiCapitol },
  { label: 'Reality Show', Icon: GiTv },
  { label: 'Cryptocurrency', Icon: GiTwoCoins },
  { label: 'Sports', Icon: GiWhistle },
]

function SidebarSection({ title, items, isOpen, onToggle, selectedItem, onSelectItem }) {
  return (
    <div className={styles.section}>
      <button
        className={styles.sectionHeader}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className={styles.sectionTitle}>{title}</span>
        {isOpen ? (
          <FiChevronDown className={styles.sectionChevron} aria-hidden="true" />
        ) : (
          <FiChevronRight className={styles.sectionChevron} aria-hidden="true" />
        )}
      </button>
      {isOpen && (
        <div className={styles.sectionBody}>
          {items.map(({ label, Icon }) => (
            <button
              key={label}
              className={label === selectedItem ? styles.itemRowSelected : styles.itemRow}
              type="button"
              onClick={() => onSelectItem(label)}
            >
              <span className={styles.itemLeft}>
                <span className={styles.itemIcon} aria-hidden="true">
                  <Icon />
                </span>
                <span className={styles.itemLabel}>{label}</span>
              </span>
              <FiChevronRight className={styles.itemChevron} aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DesktopSidebar({ selectedCategory, onCategoryChange }) {
  const [isSportOpen, setIsSportOpen] = useState(true)
  const [isEventOpen, setIsEventOpen] = useState(true)
  const [internalSelected, setInternalSelected] = useState('Soccer')

  const selected = selectedCategory ?? internalSelected

  const handleSelect = (label) => {
    setInternalSelected(label)
    onCategoryChange?.(label)
  }

  const isSportSelected = useMemo(
    () => sportItems.some((item) => item.label === selected),
    [selected],
  )

  const isEventSelected = useMemo(
    () => eventItems.some((item) => item.label === selected),
    [selected],
  )

  return (
    <aside className={styles.sidebar} aria-label="Desktop sidebar navigation">
      <SidebarSection
        title="SPORT POOL"
        items={sportItems}
        isOpen={isSportOpen}
        onToggle={() => setIsSportOpen((open) => !open)}
        selectedItem={isSportSelected ? selected : null}
        onSelectItem={handleSelect}
      />
      <div className={styles.divider} />
      <SidebarSection
        title="EVENT POOL"
        items={eventItems}
        isOpen={isEventOpen}
        onToggle={() => setIsEventOpen((open) => !open)}
        selectedItem={isEventSelected ? selected : null}
        onSelectItem={handleSelect}
      />
    </aside>
  )
}
