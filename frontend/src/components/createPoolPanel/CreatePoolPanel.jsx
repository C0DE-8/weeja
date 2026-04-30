import { useEffect, useState } from 'react'
import { FiChevronDown, FiChevronRight, FiPlus } from 'react-icons/fi'
import { fetchActiveCategories } from '../../api/categoryApi'
import styles from './CreatePoolPanel.module.css'

const tagOptions = [
  { value: 'who_will', label: 'Who will...' },
  { value: 'will_it', label: 'Will it...' },
]

export default function CreatePoolPanel() {
  const [isOpen, setIsOpen] = useState(true)
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [tag, setTag] = useState('')
  const [tagType, setTagType] = useState('')
  const [title, setTitle] = useState('')
  const [endDay, setEndDay] = useState('')
  const [endMonth, setEndMonth] = useState('')
  const [endYear, setEndYear] = useState('')
  const [endHour, setEndHour] = useState('')
  const [endMinutes, setEndMinutes] = useState('')
  const [endMeridiem, setEndMeridiem] = useState('')
  const [poolOptions, setPoolOptions] = useState(['Chelsea', 'Draw', 'Arsenal'])
  const [submitState, setSubmitState] = useState('idle')

  useEffect(() => {
    let active = true

    async function loadCategories() {
      try {
        const res = await fetchActiveCategories()
        if (!active) return
        setCategories(res.categories || [])
      } catch (error) {
        console.error(error)
      }
    }

    loadCategories()
    return () => {
      active = false
    }
  }, [])

  return (
    <section className={styles.panel} aria-label="Create pool panel">
      <button
        className={styles.headerRow}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
      >
        <p className={styles.title}>CREATE POOL</p>
        {isOpen ? (
          <FiChevronDown className={styles.chevron} aria-hidden="true" />
        ) : (
          <FiChevronRight className={styles.chevron} aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="createPoolCategory">
              Select category
            </label>
            <select
              className={styles.control}
              id="createPoolCategory"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="" disabled>
                Select
              </option>
              {categories.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name} ({option.type})
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
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>

          <div className={styles.rowTwo}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="createPoolTag">
                Event tag
              </label>
              <select
                className={styles.control}
                id="createPoolTag"
                value={tag}
                onChange={(event) => setTag(event.target.value)}
              >
                <option value="" disabled>
                  Select
                </option>
                {tagOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="createPoolTagType">
                &nbsp;
              </label>
              <select
                className={styles.control}
                id="createPoolTagType"
                value={tagType}
                onChange={(event) => setTagType(event.target.value)}
              >
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
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className={styles.rowTwo}>
            <div className={styles.field}>
              <label className={styles.label}>End date</label>
              <div className={styles.inlineControls}>
                <select
                  className={styles.control}
                  value={endDay}
                  onChange={(event) => setEndDay(event.target.value)}
                >
                  <option value="" disabled>
                    Day
                  </option>
                  {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <select
                  className={styles.control}
                  value={endMonth}
                  onChange={(event) => setEndMonth(event.target.value)}
                >
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
                <select
                  className={styles.control}
                  value={endYear}
                  onChange={(event) => setEndYear(event.target.value)}
                >
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
                <select
                  className={styles.control}
                  value={endHour}
                  onChange={(event) => setEndHour(event.target.value)}
                >
                  <option value="" disabled>
                    Hour
                  </option>
                  {Array.from({ length: 12 }, (_, index) => index + 1).map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>
                <select
                  className={styles.control}
                  value={endMinutes}
                  onChange={(event) => setEndMinutes(event.target.value)}
                >
                  <option value="" disabled>
                    Minutes
                  </option>
                  {['00', '15', '30', '45'].map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {minutes}
                    </option>
                  ))}
                </select>
                <select
                  className={styles.control}
                  value={endMeridiem}
                  onChange={(event) => setEndMeridiem(event.target.value)}
                >
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

          <div className={styles.optionsBlock}>
            <div className={styles.optionsHeader}>
              <p className={styles.optionsTitle}>Pool Options</p>
              <button
                className={styles.addOption}
                type="button"
                onClick={() => {
                  setPoolOptions((prev) => [...prev, ''])
                  setSubmitState('idle')
                }}
              >
                <FiPlus aria-hidden="true" /> Add pool Options
              </button>
            </div>

            <div className={styles.optionsList}>
              {poolOptions.map((value, index) => (
                <input
                  key={index}
                  className={styles.control}
                  type="text"
                  value={value}
                  onChange={(event) => {
                    const next = event.target.value
                    setPoolOptions((prev) => prev.map((v, i) => (i === index ? next : v)))
                  }}
                  placeholder={`Option ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <button
            className={styles.primaryButton}
            type="submit"
            onClick={() => {
              const hasRequired =
                category &&
                title.trim().length > 0 &&
                poolOptions.filter((o) => o.trim().length > 0).length >= 2

              if (!hasRequired) {
                setSubmitState('error')
                return
              }

              setSubmitState('success')
              console.log('CreatePool demo submit', {
                category,
                location,
                tag,
                tagType,
                title,
                endDay,
                endMonth,
                endYear,
                endHour,
                endMinutes,
                endMeridiem,
                poolOptions,
              })
            }}
          >
            Start this Pool
          </button>

          {submitState === 'error' && (
            <p className={styles.helperError}>Select a category, enter a title, and add at least 2 options.</p>
          )}
          {submitState === 'success' && (
            <p className={styles.helperSuccess}>Pool created (demo).</p>
          )}
        </form>
      )}
    </section>
  )
}
