import { FaFire } from 'react-icons/fa'
import styles from './PopularPoolHeader.module.css'

export default function PopularPoolHeader() {
  return (
    <div className={styles.header} aria-label="Popular pool header">
      <div className={styles.left}>
        <span className={styles.icon} aria-hidden="true">
          <FaFire />
        </span>
        <h2 className={styles.title}>POPULAR POOL</h2>
      </div>

      <button className={styles.seeAll} type="button">
        See All
      </button>
    </div>
  )
}

