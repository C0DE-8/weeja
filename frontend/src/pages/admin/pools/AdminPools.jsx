import { useEffect, useState } from 'react'
import {
  cancelAdminPool,
  createAdminPool,
  fetchAdminPools,
  lockAdminPool,
  setAdminPoolResult,
  settleAdminPool,
  updateAdminPool,
} from '../../../api/adminPoolApi'
import { fetchAdminCategories } from '../../../api/categoryApi'
import Toast from '../../../components/toast/Toast'
import { formatCurrencyAmount } from '../../../utils/currency'
import styles from './AdminPools.module.css'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const INITIAL_FORM = {
  title: '',
  description: '',
  category_id: '',
  currency_id: '1',
  min_stake: '0',
  platform_fee_percent: '0',
  start_date: '',
  start_time: '',
  lock_date: '',
  lock_time: '',
  status: 'pending',
  options: [
    { id: 'option-1', value: 'Option 1' },
    { id: 'option-2', value: 'Option 2' },
  ],
}

const CURRENCIES = [
  { id: 1, label: 'USD' },
  { id: 2, label: 'NGN' },
  { id: 3, label: 'CRYPTO' },
]

const EXISTING_POOL_TABS = [
  { id: 'ongoing', label: 'Ongoing Pools' },
  { id: 'pending', label: 'Pending Pools' },
  { id: 'upcoming', label: 'Upcoming Pools' },
  { id: 'cancelled', label: 'Cancelled Pools' },
]

const EDITABLE_POOL_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'open', label: 'Open' },
  { value: 'locked', label: 'Locked' },
]

function combineDateTime(date, time) {
  if (!date || !time) {
    return ''
  }

  return `${date}T${time}`
}

function parseDateValue(dateValue) {
  if (!dateValue) {
    return null
  }

  const [year, month, day] = dateValue.split('-').map(Number)

  if (!year || !month || !day) {
    return null
  }

  return new Date(year, month - 1, day)
}

function formatDateValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatHumanDate(dateValue) {
  const parsed = parseDateValue(dateValue)

  if (!parsed) {
    return 'Choose a date'
  }

  return parsed.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function buildCalendarDays(monthValue) {
  const [year, month] = monthValue.split('-').map(Number)
  const firstDay = new Date(year, month - 1, 1)
  const firstWeekday = firstDay.getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells = []

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push(null)
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(formatDateValue(new Date(year, month - 1, day)))
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

function shiftMonth(monthValue, delta) {
  const [year, month] = monthValue.split('-').map(Number)
  const nextDate = new Date(year, month - 1 + delta, 1)
  return `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`
}

function formatMonthHeading(monthValue) {
  const [year, month] = monthValue.split('-').map(Number)
  return `${MONTH_NAMES[month - 1]} ${year}`
}

function splitTimeParts(timeValue) {
  const [hour = '09', minute = '00'] = timeValue.split(':')
  return { hour, minute }
}

function formatAdminDate(value) {
  if (!value) return 'Not set'

  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getPoolTab(pool) {
  if (pool.status === 'cancelled') return 'cancelled'
  if (pool.status === 'pending') return 'pending'

  if (pool.start_time && new Date(pool.start_time) > new Date()) {
    return 'upcoming'
  }

  return 'ongoing'
}

function getPoolUserId(pool) {
  return pool.created_by_id || pool.user_id || pool.creator_id || pool.id
}

function getPoolUserName(pool) {
  return pool.created_by_name || pool.user_name || pool.creator_name || 'Admin'
}

function getStatusClassName(status) {
  if (status === 'cancelled') return styles.statusCancelled
  if (status === 'settled') return styles.statusCompleted
  if (status === 'locked' || status === 'awaiting_result') return styles.statusLocked
  return styles.statusOpen
}

function PoolDateTimePicker({
  label,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  minDate,
  hint,
}) {
  const initialMonth = dateValue ? dateValue.slice(0, 7) : formatDateValue(new Date()).slice(0, 7)
  const [isOpen, setIsOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(initialMonth)

  const { hour, minute } = splitTimeParts(timeValue)
  const minDateValue = minDate || ''
  const calendarDays = buildCalendarDays(visibleMonth)

  return (
    <div className={styles.dateTimeField}>
      <span>{label}</span>
      <button
        className={styles.dateTimeTrigger}
        type="button"
        onClick={() => {
          if (!isOpen) {
            setVisibleMonth(
              (dateValue || minDateValue || formatDateValue(new Date())).slice(0, 7),
            )
          }
          setIsOpen((current) => !current)
        }}
      >
        <span className={styles.dateTimeTriggerText}>
          <strong>{formatHumanDate(dateValue)}</strong>
          <small>{timeValue || 'Set time'}</small>
        </span>
        <span className={styles.dateTimeTriggerIcon}>{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen ? (
        <div className={styles.dateTimePanel}>
          <div className={styles.calendarHeader}>
            <button
              className={styles.calendarNavButton}
              type="button"
              onClick={() => setVisibleMonth((current) => shiftMonth(current, -1))}
            >
              Prev
            </button>
            <strong>{formatMonthHeading(visibleMonth)}</strong>
            <button
              className={styles.calendarNavButton}
              type="button"
              onClick={() => setVisibleMonth((current) => shiftMonth(current, 1))}
            >
              Next
            </button>
          </div>

          <div className={styles.weekdayRow}>
            {WEEKDAY_LABELS.map((dayLabel) => (
              <span key={dayLabel}>{dayLabel}</span>
            ))}
          </div>

          <div className={styles.calendarGrid}>
            {calendarDays.map((dayValue, index) => {
              if (!dayValue) {
                return <span className={styles.calendarSpacer} key={`empty-${index}`} />
              }

              const isSelected = dayValue === dateValue
              const isDisabled = Boolean(minDateValue) && dayValue < minDateValue

              return (
                <button
                  className={`${styles.calendarDay} ${isSelected ? styles.calendarDaySelected : ''}`}
                  disabled={isDisabled}
                  key={dayValue}
                  type="button"
                  onClick={() => {
                    onDateChange(dayValue)
                    setVisibleMonth(dayValue.slice(0, 7))
                  }}
                >
                  {dayValue.slice(-2).replace(/^0/, '')}
                </button>
              )
            })}
          </div>

          <div className={styles.timePickerRow}>
            <label className={styles.timeSelectField}>
              <span>Hour</span>
              <select
                value={hour}
                onChange={(event) => onTimeChange(`${event.target.value}:${minute}`)}
              >
                {Array.from({ length: 24 }, (_, index) => {
                  const value = String(index).padStart(2, '0')
                  return (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  )
                })}
              </select>
            </label>

            <label className={styles.timeSelectField}>
              <span>Minute</span>
              <select
                value={minute}
                onChange={(event) => onTimeChange(`${hour}:${event.target.value}`)}
              >
                {Array.from({ length: 60 }, (_, index) => {
                  const value = String(index).padStart(2, '0')
                  return (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  )
                })}
              </select>
            </label>
          </div>

          <p className={styles.fieldHint}>{hint}</p>
        </div>
      ) : null}
    </div>
  )
}

function toPayload(form) {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    category_id: Number(form.category_id),
    currency_id: Number(form.currency_id),
    min_stake: Number(form.min_stake),
    platform_fee_percent: Number(form.platform_fee_percent),
    start_time: combineDateTime(form.start_date, form.start_time),
    lock_time: combineDateTime(form.lock_date, form.lock_time),
    status: form.status,
    options: form.options
      .map((option) => option.value.trim())
      .filter(Boolean)
      .map((optionLabel, index) => ({
        option_label: optionLabel,
        option_key: optionLabel.toLowerCase().replace(/\s+/g, '_'),
        sort_order: index + 1,
      })),
  }
}

export default function AdminPools({ view = 'create' }) {
  const showCreate = view !== 'existing'
  const showExisting = view !== 'create'
  const [pools, setPools] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(INITIAL_FORM)
  const [winningOptionIds, setWinningOptionIds] = useState({})
  const [updatingStatusIds, setUpdatingStatusIds] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [activeExistingTab, setActiveExistingTab] = useState('ongoing')

  async function loadPools() {
    setLoading(true)
    try {
      const nextPools = await fetchAdminPools()
      setPools(nextPools)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load pools.')
    } finally {
      setLoading(false)
    }
  }

  async function loadCategories() {
    try {
      const nextCategories = await fetchAdminCategories()
      setCategories(nextCategories)
      setForm((current) => ({
        ...current,
        category_id:
          current.category_id || String(nextCategories.find((item) => item.is_active)?.id || ''),
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load categories.')
    }
  }

  useEffect(() => {
    loadPools()
    loadCategories()
  }, [])

  const startTimestamp = combineDateTime(form.start_date, form.start_time)
  const lockTimestamp = combineDateTime(form.lock_date, form.lock_time)
  const visibleExistingPools = pools.filter((pool) => getPoolTab(pool) === activeExistingTab)

  const handleCreatePool = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    try {
      const payload = toPayload(form)

      if (payload.options.length < 2) {
        setError('At least two pool options are required.')
        return
      }

      if (!payload.start_time && payload.lock_time) {
        setError('Set a start time before adding a lock time.')
        return
      }

      if (payload.lock_time && new Date(payload.lock_time).getTime() < new Date(payload.start_time).getTime()) {
        setError('Lock time cannot be earlier than start time.')
        return
      }

      setCreating(true)
      const response = await createAdminPool(payload)
      setPools((current) => [response.pool, ...current])
      setForm(() => ({
        ...INITIAL_FORM,
        category_id: String(categories.find((item) => item.is_active)?.id || ''),
      }))
      setSuccess('Pool created successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create pool.')
    } finally {
      setCreating(false)
    }
  }

  const runPoolAction = async (action, successMessage) => {
    setError('')
    setSuccess('')

    try {
      await action()
      await loadPools()
      setSuccess(successMessage)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pool action failed.')
    }
  }

  const handleStatusChange = async (poolId, status) => {
    setError('')
    setSuccess('')
    setUpdatingStatusIds((current) => ({ ...current, [poolId]: true }))

    try {
      await updateAdminPool(poolId, { status })
      await loadPools()
      setSuccess('Pool status updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update pool status.')
    } finally {
      setUpdatingStatusIds((current) => {
        const next = { ...current }
        delete next[poolId]
        return next
      })
    }
  }

  return (
    <section className={styles.section}>
      <Toast
        message={error || success}
        type={error ? 'error' : 'success'}
        onClose={() => {
          setError('')
          setSuccess('')
        }}
      />

      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Pool Management</p>
          <h2 className={styles.title}>
            {showCreate && !showExisting ? 'Create a new pool' : 'List of pools'}
          </h2>
          <p className={styles.subtitle}>
            {showCreate && !showExisting
              ? 'Set up a new pool with options, timing, and category details.'
              : 'Review pool activity, update schedules, and manage outcomes from one place.'}
          </p>
        </div>
      </div>

      <div className={`${styles.layout} ${!showCreate || !showExisting ? styles.layoutSingle : ''}`}>
        {showCreate ? (
        <form className={styles.createCard} onSubmit={handleCreatePool} noValidate>
          <div className={styles.cardHeader}>
            <h3>Create pool</h3>
            <span>New entry</span>
          </div>

          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Title</span>
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Chelsea vs Arsenal"
              />
            </label>

            <label className={styles.field}>
              <span>Category</span>
              <select
                value={form.category_id}
                onChange={(event) => setForm({ ...form, category_id: event.target.value })}
              >
                <option value="" disabled>
                  Select category
                </option>
                {categories
                  .filter((category) => category.is_active)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.type})
                    </option>
                  ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>Currency</span>
              <select
                value={form.currency_id}
                onChange={(event) => setForm({ ...form, currency_id: event.target.value })}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>Status</span>
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value })}
              >
                <option value="pending">pending</option>
                <option value="open">open</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Minimum stake</span>
              <input
                value={form.min_stake}
                onChange={(event) => setForm({ ...form, min_stake: event.target.value })}
                type="number"
                min="0"
                step="0.01"
              />
            </label>

            <label className={styles.field}>
              <span>Platform fee %</span>
              <input
                value={form.platform_fee_percent}
                onChange={(event) =>
                  setForm({ ...form, platform_fee_percent: event.target.value })
                }
                type="number"
                min="0"
                max="100"
                step="0.01"
              />
            </label>

            <label className={`${styles.field} ${styles.fieldWide}`}>
              <span>Description</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                rows="4"
                placeholder="Add event details for users."
              />
            </label>

            <div className={styles.field}>
              <PoolDateTimePicker
                dateValue={form.start_date}
                hint="Choose the date, hour, and minute users can start."
                label="Start time"
                onDateChange={(value) => setForm({ ...form, start_date: value })}
                onTimeChange={(value) => setForm({ ...form, start_time: value })}
                timeValue={form.start_time}
              />
            </div>

            <div className={styles.field}>
              <PoolDateTimePicker
                dateValue={form.lock_date}
                hint="Lock time must be the same as or later than the start time."
                label="Lock time"
                minDate={form.start_date}
                onDateChange={(value) => setForm({ ...form, lock_date: value })}
                onTimeChange={(value) => setForm({ ...form, lock_time: value })}
                timeValue={form.lock_time}
              />
            </div>

          </div>

          {startTimestamp && lockTimestamp && new Date(lockTimestamp) < new Date(startTimestamp) ? (
            <p className={styles.inlineError}>Lock time cannot be earlier than start time.</p>
          ) : null}

          <div className={styles.optionsCard}>
            <div className={styles.cardHeader}>
              <h4>Pool options</h4>
              <button
                className={styles.ghostButton}
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    options: [
                      ...current.options,
                      {
                        id: `option-${Date.now()}-${current.options.length + 1}`,
                        value: `Option ${current.options.length + 1}`,
                      },
                    ],
                  }))
                }
              >
                Add option
              </button>
            </div>

            <div className={styles.optionList}>
              {form.options.map((option, index) => (
                <div className={styles.optionRow} key={option.id}>
                  <span className={styles.optionIndex}>#{index + 1}</span>
                  <input
                    value={option.value}
                    onChange={(event) => {
                      const nextOptions = [...form.options]
                      nextOptions[index] = {
                        ...nextOptions[index],
                        value: event.target.value,
                      }
                      setForm({ ...form, options: nextOptions })
                    }}
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    className={styles.removeButton}
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        options: current.options.filter((_, optionIndex) => optionIndex !== index),
                      }))
                    }
                    disabled={form.options.length <= 2}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button className={styles.primaryButton} type="submit" disabled={creating}>
            {creating ? 'Creating pool...' : 'Create Pool'}
          </button>
        </form>
        ) : null}

        {showExisting ? (
        <div className={styles.listCard}>
          <div className={styles.tableTabs} aria-label="Existing pool filters">
            {EXISTING_POOL_TABS.map((tab) => (
              <button
                className={
                  activeExistingTab === tab.id
                    ? `${styles.tableTab} ${styles.tableTabActive}`
                    : styles.tableTab
                }
                key={tab.id}
                type="button"
                onClick={() => setActiveExistingTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className={styles.adminTableWrap}>
            <table className={styles.adminPoolTable}>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>User Name</th>
                  <th>Pool Title</th>
                  <th>Category</th>
                  <th>Country</th>
                  <th>Start &amp; End Date</th>
                  <th>Minimum Stake</th>
                  <th>Total Wagered &amp; Entries</th>
                  <th>Winner Payout Pool</th>
                  <th>Platform Fee</th>
                  <th>Pool Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="11" className={styles.tableEmpty}>Loading pools...</td>
                  </tr>
                ) : null}
                {!loading && visibleExistingPools.length === 0 ? (
                  <tr>
                    <td colSpan="11" className={styles.tableEmpty}>No pools found for this view.</td>
                  </tr>
                ) : null}
                {!loading && visibleExistingPools.map((pool) => {
                  const totalWagered = Number(pool.total_pool_amount || 0)
                  const platformFeePercent = Number(pool.platform_fee_percent || 0)
                  const selectedWinningOptionId = Number(winningOptionIds[pool.id] || pool.winning_option_id || 0)
                  const selectedWinningOption = pool.options.find(
                    (option) => Number(option.id) === selectedWinningOptionId,
                  )
                  const totalWinningStake = Number(selectedWinningOption?.total_staked || 0)
                  const totalLosingStake = selectedWinningOption
                    ? Math.max(totalWagered - totalWinningStake, 0)
                    : 0
                  const platformFee = (totalLosingStake * platformFeePercent) / 100
                  const winnerPayoutPool = selectedWinningOption
                    ? totalWinningStake + Math.max(totalLosingStake - platformFee, 0)
                    : 0
                  const canEditSimpleStatus = !['awaiting_result', 'settled', 'cancelled'].includes(pool.status)
                  const canSetWinner = ['locked', 'awaiting_result'].includes(pool.status)
                  const canSettlePool = pool.status === 'awaiting_result'
                  const canLockPool = ['pending', 'open'].includes(pool.status)
                  const canCancelPool = !['settled', 'cancelled'].includes(pool.status)

                  return (
                    <tr key={pool.id}>
                      <td>{getPoolUserId(pool)}</td>
                      <td>{getPoolUserName(pool)}</td>
                      <td className={styles.poolTitleCell}>
                        <strong>{pool.title}</strong>
                        {canSetWinner ? (
                          <label className={styles.winnerSelectField}>
                            <span>Winner option</span>
                            <select
                              value={String(winningOptionIds[pool.id] || pool.winning_option_id || '')}
                              onChange={(event) =>
                                setWinningOptionIds((current) => ({
                                  ...current,
                                  [pool.id]: event.target.value,
                                }))
                              }
                            >
                              <option value="">Select pool option</option>
                              {pool.options.map((option) => (
                                <option key={option.id} value={option.id}>
                                  {option.option_label}
                                  {' - staked '}
                                  {formatCurrencyAmount(option.total_staked, pool.currency_code, pool.currency_decimal_places)}
                                </option>
                              ))}
                            </select>
                          </label>
                        ) : null}
                        <div className={styles.tableActions}>
                          {canSetWinner ? (
                            <button
                              className={styles.votedButton}
                              disabled={!selectedWinningOptionId}
                              type="button"
                              onClick={() =>
                                runPoolAction(
                                  async () => {
                                    await setAdminPoolResult(pool.id, selectedWinningOptionId)
                                    await settleAdminPool(pool.id)
                                  },
                                  'Pool winner set and pool settled.',
                                )
                              }
                            >
                              Set Winner
                            </button>
                          ) : null}
                          {canSettlePool ? (
                            <button
                              className={styles.endPoolButton}
                              type="button"
                              onClick={() =>
                                runPoolAction(() => settleAdminPool(pool.id), 'Pool settled successfully.')
                              }
                            >
                              End Pool
                            </button>
                          ) : null}
                          {canLockPool ? (
                            <button
                              className={styles.lockTableButton}
                              type="button"
                              onClick={() => runPoolAction(() => lockAdminPool(pool.id), 'Pool locked.')}
                            >
                              Lock
                            </button>
                          ) : null}
                          {canCancelPool ? (
                            <button
                              className={styles.cancelTableButton}
                              type="button"
                              onClick={() =>
                                runPoolAction(() => cancelAdminPool(pool.id), 'Pool cancelled and refunded.')
                              }
                            >
                              Cancel
                            </button>
                          ) : null}
                        </div>
                      </td>
                      <td>{pool.category_name || pool.category_type || 'Uncategorized'}</td>
                      <td>{pool.country || pool.country_name || 'Nigeria'}</td>
                      <td>
                        <span className={styles.dateStack}>{formatAdminDate(pool.start_time)}</span>
                        <span className={styles.dateStack}>{formatAdminDate(pool.end_time || pool.lock_time)}</span>
                      </td>
                      <td>{formatCurrencyAmount(pool.min_stake, pool.currency_code, pool.currency_decimal_places)}</td>
                      <td>
                        <span className={styles.dateStack}>
                          {formatCurrencyAmount(totalWagered, pool.currency_code, pool.currency_decimal_places)}
                        </span>
                        <span className={styles.dateStack}>{pool.total_pool_entries || 0} Entries</span>
                      </td>
                      <td className={styles.boldMoney}>
                        {selectedWinningOption ? (
                          <>
                            <span className={styles.dateStack}>
                              {formatCurrencyAmount(winnerPayoutPool, pool.currency_code, pool.currency_decimal_places)}
                            </span>
                            <span className={styles.dateStack}>
                              Winners staked {formatCurrencyAmount(totalWinningStake, pool.currency_code, pool.currency_decimal_places)}
                            </span>
                          </>
                        ) : (
                          <span className={styles.dateStack}>Set winner first</span>
                        )}
                      </td>
                      <td className={styles.boldMoney}>
                        {selectedWinningOption ? (
                          <>
                            <span className={styles.dateStack}>
                              {formatCurrencyAmount(platformFee, pool.currency_code, pool.currency_decimal_places)}
                            </span>
                            <span className={styles.dateStack}>
                              {platformFeePercent}% of losing stake
                            </span>
                          </>
                        ) : (
                          <span className={styles.dateStack}>Set winner first</span>
                        )}
                      </td>
                      <td>
                        {canEditSimpleStatus ? (
                          <select
                            className={styles.statusSelect}
                            disabled={Boolean(updatingStatusIds[pool.id])}
                            value={pool.status}
                            onChange={(event) => handleStatusChange(pool.id, event.target.value)}
                          >
                            {EDITABLE_POOL_STATUSES.map((statusOption) => (
                              <option key={statusOption.value} value={statusOption.value}>
                                {statusOption.label}
                              </option>
                            ))}
                          </select>
                        ) : null}
                        <span className={`${styles.tableStatus} ${getStatusClassName(pool.status)}`}>
                          {pool.status === 'settled' ? 'Completed' : pool.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        ) : null}
      </div>
    </section>
  )
}
