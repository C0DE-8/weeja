import { useState } from 'react'
import styles from './HeroBanner.module.css'

const slides = ['premier', 'nba', 'crypto']

export default function HeroBanner() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section className={styles.banner} aria-label="Hero banner">
      <div
        className={`${styles.image} ${styles[`variant_${slides[activeIndex]}`]}`}
        role="img"
        aria-label="Featured event banner"
      />
      <div className={styles.dots} aria-hidden="true">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            className={index === activeIndex ? styles.dotActive : styles.dot}
            onClick={() => setActiveIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
