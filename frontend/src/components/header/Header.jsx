import { HiOutlineMenuAlt3 } from 'react-icons/hi'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <button className={styles.menuButton} aria-label="Open menu">
        <HiOutlineMenuAlt3 />
      </button>
      <button className={styles.createButton}>Create Event</button>
    </header>
  )
}
