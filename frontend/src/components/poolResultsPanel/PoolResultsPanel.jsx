import { useMemo, useState } from 'react'
import styles from './PoolResultsPanel.module.css'

const sampleResults = [
  { question: 'Who will win the match between Chelsea and Arsenal', answer: 'Chelsea', selected: true },
  { question: 'Will Elon Musk buy Twitter?', answer: 'Yes', selected: true },
  { question: 'Will Bitcoin reach $100k before year end?', answer: 'Yes', selected: true },
  { question: 'Which team will win the NBA Finals?', answer: 'Nuggets', selected: true },
  { question: 'Who will win the Wimbledon Men’s Singles?', answer: 'Alcaraz', selected: true },
]

export default function PoolResultsPanel() {
  const [showAll, setShowAll] = useState(false)

  const visibleResults = useMemo(() => {
    if (showAll) return sampleResults
    return sampleResults.slice(0, 3)
  }, [showAll])

  return (
    <section className={styles.panel} aria-label="Pool results panel">
      <div className={styles.headerRow}>
        <p className={styles.title}>POOL RESULTS</p>
      </div>

      <div className={styles.body}>
        {visibleResults.map((item, index) => (
          <div key={`${item.question}-${index}`} className={styles.resultCard}>
            <p className={styles.question}>{item.question}</p>
            <div className={styles.answerWrap}>
              <span className={item.selected ? styles.answerSelected : styles.answer}>
                {item.answer}
              </span>
            </div>
          </div>
        ))}

        <button
          className={styles.secondaryButton}
          type="button"
          onClick={() => setShowAll((open) => !open)}
          aria-expanded={showAll}
        >
          {showAll ? 'Show fewer Result' : 'See all Result'}
        </button>
      </div>
    </section>
  )
}
