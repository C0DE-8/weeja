import { useMemo, useState } from 'react'
import { FiChevronDown, FiChevronRight } from 'react-icons/fi'
import {
  GiSoccerBall,
  GiPodiumWinner,
} from 'react-icons/gi'
import styles from './DesktopSidebar.module.css'

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
          {items.map((item) => (
            <button
              key={item.id}
              className={item.id === selectedItem ? styles.itemRowSelected : styles.itemRow}
              type="button"
              onClick={() => onSelectItem(item.id)}
            >
              <span className={styles.itemLeft}>
                <span className={styles.itemIcon} aria-hidden="true">
                  <item.Icon />
                </span>
                <span className={styles.itemLabel}>{item.label}</span>
              </span>
              <FiChevronRight className={styles.itemChevron} aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DesktopSidebar({ categoriesByType, selectedCategoryId, onCategoryChange }) {
  const [isSportOpen, setIsSportOpen] = useState(true)
  const [isEventOpen, setIsEventOpen] = useState(true)
  const [internalSelected, setInternalSelected] = useState(null)

  const sportItems = useMemo(
    () =>
      (categoriesByType?.sport || []).map((category) => ({
        id: category.id,
        label: category.name,
        Icon: GiSoccerBall,
      })),
    [categoriesByType],
  )

  const eventItems = useMemo(
    () =>
      (categoriesByType?.event || []).map((category) => ({
        id: category.id,
        label: category.name,
        Icon: GiPodiumWinner,
      })),
    [categoriesByType],
  )

  const selected = selectedCategoryId ?? internalSelected

  const handleSelect = (id) => {
    setInternalSelected(id)
    onCategoryChange?.(id)
  }

  const isSportSelected = useMemo(
    () => sportItems.some((item) => item.id === selected),
    [selected, sportItems],
  )

  const isEventSelected = useMemo(
    () => eventItems.some((item) => item.id === selected),
    [selected, eventItems],
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
