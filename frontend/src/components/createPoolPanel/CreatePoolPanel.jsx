import { FiChevronDown, FiPlus } from 'react-icons/fi'
import styles from './CreatePoolPanel.module.css'

const categoryOptions = ['Sport Pool', 'Event Pool']

export default function CreatePoolPanel() {
  return (
    <section className={styles.panel} aria-label="Create pool panel">
      <div className={styles.headerRow}>
        <p className={styles.title}>CREATE POOL</p>
        <FiChevronDown className={styles.chevron} aria-hidden="true" />
      </div>

      <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="createPoolCategory">
            Select category
          </label>
          <select className={styles.control} id="createPoolCategory" defaultValue="">
            <option value="" disabled>
              Select
            </option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="createPoolLocation">
            Event Location
          </label>
          <input
            className={styles.control}
            id="createPoolLocation"
            type="text"
            placeholder="where is this event happening?"
          />
        </div>

        <div className={styles.rowTwo}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="createPoolTag">
              Event tag
            </label>
            <select className={styles.control} id="createPoolTag" defaultValue="">
              <option value="" disabled>
                Who will...
              </option>
              <option value="who_will_win">Who will win</option>
              <option value="will_it_happen">Will it happen</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="createPoolTagType">
              &nbsp;
            </label>
            <select className={styles.control} id="createPoolTagType" defaultValue="">
              <option value="" disabled>
                Who
              </option>
              <option value="who">Who</option>
              <option value="what">What</option>
              <option value="yes_no">Yes/No</option>
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="createPoolTitle">
            Event title
          </label>
          <input
            className={styles.control}
            id="createPoolTitle"
            type="text"
            placeholder="Who will..."
          />
        </div>

        <div className={styles.rowTwo}>
          <div className={styles.field}>
            <label className={styles.label}>End date</label>
            <div className={styles.inlineControls}>
              <select className={styles.control} defaultValue="">
                <option value="" disabled>
                  Day
                </option>
                {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <select className={styles.control} defaultValue="">
                <option value="" disabled>
                  Month
                </option>
                {[
                  'Jan',
                  'Feb',
                  'Mar',
                  'Apr',
                  'May',
                  'Jun',
                  'Jul',
                  'Aug',
                  'Sep',
                  'Oct',
                  'Nov',
                  'Dec',
                ].map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <select className={styles.control} defaultValue="">
                <option value="" disabled>
                  Year
                </option>
                {[2026, 2027, 2028].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.rowTwo}>
          <div className={styles.field}>
            <label className={styles.label}>End time</label>
            <div className={styles.inlineControls}>
              <select className={styles.control} defaultValue="">
                <option value="" disabled>
                  Hour
                </option>
                {Array.from({ length: 12 }, (_, index) => index + 1).map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
              <select className={styles.control} defaultValue="">
                <option value="" disabled>
                  Minutes
                </option>
                {['00', '15', '30', '45'].map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes}
                  </option>
                ))}
              </select>
              <select className={styles.control} defaultValue="">
                <option value="" disabled>
                  AM
                </option>
                {['AM', 'PM'].map((suffix) => (
                  <option key={suffix} value={suffix}>
                    {suffix}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button className={styles.addOption} type="button">
          <FiPlus aria-hidden="true" /> Add pool Options
        </button>

        <button className={styles.primaryButton} type="submit">
          Start this Pool
        </button>
      </form>
    </section>
  )
}

