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

function SidebarSection({ title, items }) {
  return (
    <div className={styles.section}>
      <button className={styles.sectionHeader} type="button">
        <span className={styles.sectionTitle}>{title}</span>
        <FiChevronDown className={styles.sectionChevron} aria-hidden="true" />
      </button>
      <div className={styles.sectionBody}>
        {items.map(({ label, Icon }) => (
          <button key={label} className={styles.itemRow} type="button">
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
    </div>
  )
}

export default function DesktopSidebar() {
  return (
    <aside className={styles.sidebar} aria-label="Desktop sidebar navigation">
      <SidebarSection title="SPORT POOL" items={sportItems} />
      <div className={styles.divider} />
      <SidebarSection title="EVENT POOL" items={eventItems} />
    </aside>
  )
}
