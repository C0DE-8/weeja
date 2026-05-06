import { useMemo, useState } from 'react'
import { FiChevronDown, FiClock, FiShare2 } from 'react-icons/fi'
import { normalizeCurrencyInputValue } from '../../utils/currency'
import WagerModal from '../wagerModal/WagerModal'
import styles from './PoolCard.module.css'

export default function PoolCard({
  id,
  question,
  poolEndTime,
  poolEndDate,
  status,
  amount,
  currency,
  currencyDecimalPlaces,
  options,
  showMore,
  activeOption,
  poolSize = '10,000 USDT',
  weejians = '200',
  minStakeRaw = 0,
  onJoin,
  totalPoolEntries = 0,
}) {
  const [selectedOption, setSelectedOption] = useState(activeOption ?? null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [stakeAmount, setStakeAmount] = useState(String(minStakeRaw || ''))
  const [feedback, setFeedback] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [wagerOption, setWagerOption] = useState(null)

  const hasMoreOptions = useMemo(() => {
    if (typeof showMore === 'boolean') return showMore
    return (options?.length ?? 0) > 3
  }, [options, showMore])

  const visibleOptions = useMemo(() => {
    if (!options) return []
    if (isExpanded) return options
    return options.slice(0, 3)
  }, [isExpanded, options])

  const selectedOptionLabel = useMemo(
    () => options?.find((option) => option.id === selectedOption)?.label || '',
    [options, selectedOption],
  )
  const currencyMark = currency?.toUpperCase().includes('USDT') ? 'T' : currency?.charAt(0) || 'T'

  const canJoin = status === 'Open' && typeof onJoin === 'function'

  const handleJoin = async () => {
    if (!selectedOption) {
      setSubmitError('Choose an option before entering the pool.')
      setFeedback('')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    setFeedback('')

    try {
      await onJoin({
        poolId: id,
        optionId: selectedOption,
        stakeAmount,
      })
      setFeedback(`Entry placed on ${selectedOptionLabel}.`)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not enter this pool.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOptionClick = (option) => {
    if (!canJoin) return

    setSelectedOption(option.id)
    setWagerOption(option)
    setFeedback('')
    setSubmitError('')
  }

  const handleWagerJoin = async (nextStakeAmount) => {
    if (!wagerOption || !canJoin) return

    await onJoin({
      poolId: id,
      optionId: wagerOption.id,
      stakeAmount: nextStakeAmount,
    })
  }

  return (
    <>
    <article className={styles.card}>
      <div className={styles.desktopTopRow}>
        <h3 className={styles.question}>{question}</h3>
        <div className={styles.desktopRightGroup}>
          <button className={styles.shareButton} aria-label="Share pool" type="button">
            <FiShare2 />
          </button>
          <div className={styles.desktopAmount}>
            <strong className={styles.desktopAmountValue}>{amount}</strong>
            <span className={styles.desktopCurrencyToken}>{currency}</span>
          </div>
        </div>
      </div>

      <div className={styles.topRow}>
        <h3 className={styles.question}>{question}</h3>
        <button className={styles.shareButton} aria-label="Share pool" type="button">
          <FiShare2 />
        </button>
      </div>
      <div className={styles.infoRow}>
        <div className={styles.details}>
          <span className={styles.metaLine}>
            <FiClock aria-hidden="true" />
            <span className={styles.metaLabel}>Pool Ends:</span>
            <span className={styles.metaValue}>{poolEndTime}</span>
          </span>
          <span className={styles.dateLine}>
            <span>{poolEndDate}</span>
            <span className={styles.status}>{status}</span>
          </span>
        </div>
        <div className={styles.amountBlock}>
          <span className={styles.currencyMark}>{currencyMark}</span>
          <strong className={styles.amountValue}>{amount}</strong>
        </div>
      </div>
      <div className={styles.optionsRow}>
        {visibleOptions.map((option, index) => {
          const isActive = selectedOption ? option.id === selectedOption : index % 2 === 1
          return (
            <button
              key={option.id}
              className={isActive ? styles.optionButtonActive : styles.optionButton}
              type="button"
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      <div className={styles.entryPanel}>
        <div className={styles.entryHeader}>
          <strong>Enter this pool</strong>
          <span>{totalPoolEntries} entries</span>
        </div>

        <div className={styles.entryRow}>
          <label className={styles.stakeField}>
            <span>Stake amount</span>
            <input
              type="number"
              min={Number(minStakeRaw) || 0}
              step="0.01"
              value={stakeAmount}
              onChange={(event) => setStakeAmount(event.target.value)}
              onBlur={() =>
                setStakeAmount((current) =>
                  normalizeCurrencyInputValue(current, currency, currencyDecimalPlaces),
                )
              }
              placeholder={`Minimum ${amount}`}
            />
          </label>

          <button
            className={styles.joinButton}
            type="button"
            onClick={handleJoin}
            disabled={!canJoin || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Pay entry'}
          </button>
        </div>

        {status !== 'Open' ? <p className={styles.helperText}>This pool is not open for new entries.</p> : null}
        {feedback ? <p className={styles.successText}>{feedback}</p> : null}
        {submitError ? <p className={styles.errorText}>{submitError}</p> : null}
      </div>

      <div className={styles.desktopInfoRow}>
        <div className={styles.desktopInfoLeft}>
          <span className={styles.desktopInfoItem}>
            <span className={styles.desktopInfoLabel}>Pool Size:</span> {poolSize}
          </span>
          <span className={styles.desktopInfoItem}>
            <span className={styles.desktopInfoLabel}>Entries:</span> {weejians}
          </span>
        </div>
        <div className={styles.desktopInfoRight}>
          <span className={styles.desktopEnds}>
            <span className={styles.desktopInfoLabel}>Pool Ends:</span> {poolEndTime}{' '}
            {poolEndDate}
          </span>
          <span className={styles.desktopStatus}>{status}</span>
        </div>
      </div>

      {hasMoreOptions && (
        <button
          className={styles.moreButton}
          type="button"
          onClick={() => setIsExpanded((open) => !open)}
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? 'Hide extra options' : 'View more options'}</span>
          <FiChevronDown />
        </button>
      )}
    </article>
    {wagerOption ? (
      <WagerModal
        question={question}
        option={wagerOption}
        amount={amount}
        currency={currency}
        currencyDecimalPlaces={currencyDecimalPlaces}
        minStakeRaw={minStakeRaw}
        onClose={() => setWagerOption(null)}
        onJoin={handleWagerJoin}
      />
    ) : null}
    </>
  )
}
