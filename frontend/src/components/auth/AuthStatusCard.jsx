import styles from './AuthStatusCard.module.css'

export default function AuthStatusCard({
  icon = 'mail',
  title,
  description,
  email,
  primaryAction,
  secondaryAction,
  tertiaryAction,
  error,
  success,
}) {
  return (
    <section className={styles.card}>
      <div
        className={icon === 'success' ? styles.successIcon : styles.mailIcon}
        aria-hidden="true"
      />

      <h1 className={styles.title}>{title}</h1>

      {description ? <p className={styles.description}>{description}</p> : null}
      {email ? <p className={styles.email}>{email}</p> : null}
      {error ? <p className={styles.feedbackError}>{error}</p> : null}
      {success ? <p className={styles.feedbackSuccess}>{success}</p> : null}

      {primaryAction ? (
        <button
          type="button"
          className={styles.primaryButton}
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled}
        >
          {primaryAction.label}
        </button>
      ) : null}

      {secondaryAction ? (
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={secondaryAction.onClick}
          disabled={secondaryAction.disabled}
        >
          {secondaryAction.label}
        </button>
      ) : null}

      {tertiaryAction ? (
        <button
          type="button"
          className={styles.tertiaryButton}
          onClick={tertiaryAction.onClick}
          disabled={tertiaryAction.disabled}
        >
          {tertiaryAction.label}
        </button>
      ) : null}
    </section>
  )
}
