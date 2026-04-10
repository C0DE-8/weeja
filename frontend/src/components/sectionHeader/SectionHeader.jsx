import { FiSearch } from 'react-icons/fi'
import { FaFire } from 'react-icons/fa'
import styles from './SectionHeader.module.css'

export default function SectionHeader() {
  return (
    <section className={styles.section}>
      <div className={styles.leftBlock}>
        <span className={styles.iconWrap}>
          <FaFire />
        </span>
        <h2 className={styles.title}>POPULAR POOL</h2>
      </div>
      <button className={styles.searchButton} aria-label="Search pools">
        <FiSearch />
      </button>
    </section>
  )
}
