import styles from './PoolResultsPanel.module.css'

const sampleResults = [
  {
    question: 'Who will win the match between Chelsea and Arsenal',
    answer: 'Chelsea',
    selected: true,
  },
  {
    question: 'Will Elon Musk buy Twitter?',
    answer: 'Yes',
    selected: true,
  },
  {
    question: 'Will Elon Musk buy Twitter?',
    answer: 'Yes',
    selected: true,
  },
]

export default function PoolResultsPanel() {
  return (
    <section className={styles.panel} aria-label="Pool results panel">
      <div className={styles.headerRow}>
        <p className={styles.title}>POOL RESULTS</p>
      </div>

      <div className={styles.body}>
        {sampleResults.map((item, index) => (
          <div key={`${item.question}-${index}`} className={styles.resultCard}>
            <p className={styles.question}>{item.question}</p>
            <div className={styles.answerWrap}>
              <span className={item.selected ? styles.answerSelected : styles.answer}>
                {item.answer}
              </span>
            </div>
          </div>
        ))}

        <button className={styles.secondaryButton} type="button">
          See all Result
        </button>
      </div>
    </section>
  )
}

