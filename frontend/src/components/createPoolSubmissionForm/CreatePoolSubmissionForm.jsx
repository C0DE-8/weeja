import { useState } from 'react'
import { FiInfo } from 'react-icons/fi'
import { formatCurrencyAmount } from '../../utils/currency'
import styles from './CreatePoolSubmissionForm.module.css'

function splitDateParts(value) {
  if (!value) {
    return { day: 'Day', month: 'Month', year: 'Year' }
  }

  const [year, month, day] = value.split('-')
  const monthLabel = new Date(`${value}T00:00:00`).toLocaleString(undefined, { month: 'short' })

  return {
    day,
    month: monthLabel,
    year,
  }
}

function splitTimeParts(value) {
  if (!value) {
    return { hour: 'Hour', minute: 'Minute', meridiem: 'AM/PM' }
  }

  const [rawHour = '00', minute = '00'] = value.split(':')
  const hourNumber = Number(rawHour)
  const meridiem = hourNumber >= 12 ? 'PM' : 'AM'
  const hour = ((hourNumber + 11) % 12) + 1

  return {
    hour: String(hour).padStart(2, '0'),
    minute,
    meridiem,
  }
}

export default function CreatePoolSubmissionForm({
  categories,
  currencies,
  form,
  setForm,
  selectedFee,
  submitLoading,
  onSubmit,
}) {
  const [draftOption, setDraftOption] = useState('')
  const descriptionLength = form.description.length
  const endDateParts = splitDateParts(form.end_date)
  const endTimeParts = splitTimeParts(form.end_time)
  const filledOptionsCount = form.options.filter((item) => item.trim()).length

  const handleAddOption = () => {
    if (!draftOption.trim()) {
      return
    }

    setForm((current) => ({
      ...current,
      options: [...current.options, draftOption.trim()],
    }))
    setDraftOption('')
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.mobileIntro}>
        <h3 className={styles.mobileTitle}>Create Pool</h3>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Select category</span>
        <select
          className={styles.control}
          value={form.category_id}
          onChange={(event) => setForm((current) => ({ ...current, category_id: event.target.value }))}
        >
          <option value="">Select</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name} ({category.type})
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Event tag</span>
        <div className={styles.tagRow}>
          <input
            className={styles.tagInput}
            type="text"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Who will..."
          />
          <span className={styles.tagType}>Pool</span>
        </div>
      </label>

      <label className={styles.field}>
        <span className={styles.labelWithIcon}>
          Event details
          <span className={styles.infoIcon} aria-hidden="true">
            <FiInfo />
          </span>
        </span>
        <div className={styles.textareaBox}>
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="Describe the event and what the pool is deciding."
            maxLength={150}
            rows={3}
          />
          <span className={styles.counter}>{descriptionLength}/150</span>
        </div>
      </label>

      <div className={styles.desktopGrid}>
        <label className={styles.field}>
          <span className={styles.label}>Wallet currency</span>
          <select
            className={styles.control}
            value={form.currency_id}
            onChange={(event) => setForm((current) => ({ ...current, currency_id: event.target.value }))}
          >
            <option value="">Select currency</option>
            {currencies.map((currency) => (
              <option key={currency.id} value={currency.id}>
                {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Minimum stake</span>
          <input
            className={styles.control}
            min="0"
            step="0.01"
            type="number"
            value={form.min_stake}
            onChange={(event) => setForm((current) => ({ ...current, min_stake: event.target.value }))}
          />
        </label>

        <div className={styles.feeCard}>
          <span>Creation fee</span>
          <strong>
            {selectedFee
              ? formatCurrencyAmount(
                  selectedFee.amount,
                  selectedFee.currency_code,
                  selectedFee.decimal_places,
                )
              : 'Unavailable'}
          </strong>
        </div>
      </div>

      <div className={styles.field}>
        <span className={styles.label}>End date</span>
        <div className={styles.summaryTriple} aria-hidden="true">
          <span>{endDateParts.day}</span>
          <span>{endDateParts.month}</span>
          <span>{endDateParts.year}</span>
        </div>
        <div className={styles.hiddenInputs}>
          <input
            className={styles.control}
            type="date"
            value={form.start_date}
            onChange={(event) => setForm((current) => ({ ...current, start_date: event.target.value }))}
          />
          <input
            className={styles.control}
            type="date"
            value={form.lock_date}
            onChange={(event) => setForm((current) => ({ ...current, lock_date: event.target.value }))}
          />
          <input
            className={styles.control}
            type="date"
            value={form.end_date}
            onChange={(event) => setForm((current) => ({ ...current, end_date: event.target.value }))}
          />
        </div>
      </div>

      <div className={styles.field}>
        <span className={styles.label}>End time</span>
        <div className={styles.summaryTriple} aria-hidden="true">
          <span>{endTimeParts.hour}</span>
          <span>{endTimeParts.minute}</span>
          <span>{endTimeParts.meridiem}</span>
        </div>
        <div className={styles.hiddenInputs}>
          <input
            className={styles.control}
            type="time"
            value={form.start_time}
            onChange={(event) => setForm((current) => ({ ...current, start_time: event.target.value }))}
          />
          <input
            className={styles.control}
            type="time"
            value={form.lock_time}
            onChange={(event) => setForm((current) => ({ ...current, lock_time: event.target.value }))}
          />
          <input
            className={styles.control}
            type="time"
            value={form.end_time}
            onChange={(event) => setForm((current) => ({ ...current, end_time: event.target.value }))}
          />
        </div>
      </div>

      <div className={styles.chips}>
        {form.options.map((option, index) =>
          option.trim() ? (
            <button
              key={`chip-${index + 1}`}
              type="button"
              className={styles.chip}
              disabled={filledOptionsCount <= 2}
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  options: current.options.filter((_, optionIndex) => optionIndex !== index),
                }))
              }
            >
              {option}
              <span aria-hidden="true">×</span>
            </button>
          ) : null,
        )}
      </div>

      <div className={styles.optionComposer}>
        <input
          className={styles.optionInput}
          type="text"
          value={draftOption}
          onChange={(event) => setDraftOption(event.target.value)}
          placeholder={`Option ${filledOptionsCount + 1}`}
        />
        <button
          className={styles.addButton}
          type="button"
          disabled={!draftOption.trim()}
          onClick={handleAddOption}
        >
          Add
        </button>
      </div>

      <div className={styles.scheduleGrid}>
        <label className={styles.field}>
          <span className={styles.label}>Start date</span>
          <input
            className={styles.control}
            type="date"
            value={form.start_date}
            onChange={(event) => setForm((current) => ({ ...current, start_date: event.target.value }))}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Lock date</span>
          <input
            className={styles.control}
            type="date"
            value={form.lock_date}
            onChange={(event) => setForm((current) => ({ ...current, lock_date: event.target.value }))}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>End date</span>
          <input
            className={styles.control}
            type="date"
            value={form.end_date}
            onChange={(event) => setForm((current) => ({ ...current, end_date: event.target.value }))}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Start time</span>
          <input
            className={styles.control}
            type="time"
            value={form.start_time}
            onChange={(event) => setForm((current) => ({ ...current, start_time: event.target.value }))}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Lock time</span>
          <input
            className={styles.control}
            type="time"
            value={form.lock_time}
            onChange={(event) => setForm((current) => ({ ...current, lock_time: event.target.value }))}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>End time</span>
          <input
            className={styles.control}
            type="time"
            value={form.end_time}
            onChange={(event) => setForm((current) => ({ ...current, end_time: event.target.value }))}
          />
        </label>
      </div>

      <button className={styles.submitButton} disabled={submitLoading} type="submit">
        {submitLoading ? 'Submitting...' : 'Start this Pool'}
      </button>
    </form>
  )
}
