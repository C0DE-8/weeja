import { useEffect, useState } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { formatCurrencyNumber, normalizeCurrencyInputValue } from '../../utils/currency'
import styles from './WagerModal.module.css'

export default function WagerModal({
  question,
  option,
  currency,
  currencyDecimalPlaces,
  minStakeRaw = 0,
  onClose,
  onJoin,
}) {
  const [step, setStep] = useState('amount')
  const [stakeAmount, setStakeAmount] = useState(String(minStakeRaw || ''))
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [])

  const currencyLabel = currency || 'USDT'
  const currencyMark = currencyLabel.toUpperCase().includes('USDT') ? 'T' : currencyLabel.charAt(0)
  const displayAmount = formatCurrencyNumber(
    stakeAmount || minStakeRaw,
    currencyLabel,
    currencyDecimalPlaces,
  )

  const handleConfirmAmount = () => {
    if (!stakeAmount || Number(stakeAmount) <= 0) {
      setError('Enter a wager amount to continue.')
      return
    }

    setStakeAmount(normalizeCurrencyInputValue(stakeAmount, currencyLabel, currencyDecimalPlaces))
    setError('')
    setStep('approve')
  }

  const handleJoinPool = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      await onJoin(normalizeCurrencyInputValue(stakeAmount, currencyLabel, currencyDecimalPlaces))
      setStep('success')
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : 'Could not join this pool.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="wager-title">
      <div className={step === 'success' ? styles.successCard : styles.card}>
        {step === 'amount' ? (
          <>
            <h2 className={styles.question} id="wager-title">
              {question}
            </h2>

            <div className={styles.answerBox}>
              <span>My Answer</span>
              <strong>{option.label}</strong>
            </div>

            <label className={styles.amountField}>
              <span>Wager Amount</span>
              <input
                type="number"
                min={Number(minStakeRaw) || 0}
                step="0.01"
                value={stakeAmount}
                onChange={(event) => setStakeAmount(event.target.value)}
                onBlur={() =>
                  setStakeAmount((current) =>
                    normalizeCurrencyInputValue(current, currencyLabel, currencyDecimalPlaces),
                  )
                }
                placeholder={String(minStakeRaw || '5.00')}
                autoFocus
              />
            </label>

            <p className={styles.balance}>
              Available Balance:
              <span className={styles.currencyMark}>{currencyMark}</span>
              <span>50 {currencyLabel}</span>
            </p>

            {error ? <p className={styles.errorText}>{error}</p> : null}

            <button className={styles.primaryButton} type="button" onClick={handleConfirmAmount}>
              Confirm Wager
            </button>
            <button className={styles.dangerButton} type="button" onClick={onClose}>
              Cancel Pool
            </button>
          </>
        ) : null}

        {step === 'approve' ? (
          <>
            <button className={styles.backButton} type="button" onClick={() => setStep('amount')}>
              <FiArrowLeft />
              <span>Back</span>
            </button>

            <h2 className={styles.approveTitle} id="wager-title">
              Approve this Event
            </h2>

            <p className={styles.approveCopy}>
              You have placed a wager of <strong>{displayAmount} {currencyLabel}</strong> on this
              event, Please click Start to confirm transaction
            </p>

            <div className={styles.approveDetails}>
              <h3>{question}</h3>
              <span>My Answer</span>
              <strong>{option.label}</strong>
            </div>

            {error ? <p className={styles.errorText}>{error}</p> : null}

            <button
              className={styles.primaryButton}
              type="button"
              onClick={handleJoinPool}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Joining...' : 'Join Pool'}
            </button>
            <button className={styles.dangerButton} type="button" onClick={onClose}>
              Cancel Pool
            </button>
          </>
        ) : null}

        {step === 'success' ? (
          <>
            <div className={styles.successIcon} aria-hidden="true" />
            <h2 className={styles.successTitle} id="wager-title">
              You have successfully joined this pool!
            </h2>
            <button className={styles.primaryButton} type="button" onClick={onClose}>
              Return to Homepage
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
