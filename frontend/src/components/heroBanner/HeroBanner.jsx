import styles from './HeroBanner.module.css'

export default function HeroBanner() {
  return (
    <section className={styles.banner} aria-label="Hero banner">
      <div className={styles.image} role="img" aria-label="Featured event banner" />
      <div className={styles.dots} aria-hidden="true">
        <span className={styles.dotActive} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
    </section>
  )
}

