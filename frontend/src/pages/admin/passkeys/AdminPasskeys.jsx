import { useEffect, useState } from 'react'
import {
  createAdminPasskey,
  deactivateAdminPasskey,
  deleteAdminPasskey,
  fetchAdminPasskeyById,
  fetchAdminPasskeys,
} from '../../../api/superAdminApi'
import styles from './AdminPasskeys.module.css'

const INITIAL_FORM = {
  label: '',
  passkey: '',
  expires_at: '',
}

function formatDateTime(value) {
  if (!value) return 'No expiry'
  return new Date(value).toLocaleString()
}

function getPasskeyStatus(passkey) {
  if (passkey.used_at) return 'Used'
  if (!passkey.is_active) return 'Inactive'
  if (passkey.expires_at && new Date(passkey.expires_at).getTime() < Date.now()) {
    return 'Expired'
  }
  return 'Active'
}

function getStatusClassName(status, styles) {
  if (status === 'Used') return `${styles.statusPill} ${styles.statusUsed}`
  if (status === 'Expired') return `${styles.statusPill} ${styles.statusExpired}`
  if (status === 'Inactive') return `${styles.statusPill} ${styles.statusInactive}`
  return `${styles.statusPill} ${styles.statusActive}`
}

export default function AdminPasskeys() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [passkeys, setPasskeys] = useState([])
  const [latestPlainPasskey, setLatestPlainPasskey] = useState('')
  const [selectedPasskey, setSelectedPasskey] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState('')
  const [copiedId, setCopiedId] = useState('')

  const activeCount = passkeys.filter((passkey) => getPasskeyStatus(passkey) === 'Active').length
  const usedCount = passkeys.filter((passkey) => getPasskeyStatus(passkey) === 'Used').length

  async function loadPasskeys() {
    setLoading(true)
    try {
      const nextPasskeys = await fetchAdminPasskeys()
      setPasskeys(nextPasskeys)
      setSelectedPasskey((current) => {
        if (current) {
          return nextPasskeys.find((item) => item.id === current.id) || null
        }
        return nextPasskeys[0] || null
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load passkeys.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPasskeys()
  }, [])

  const handleSelectPasskey = async (passkeyId) => {
    setError('')
    setDetailsLoading(true)

    try {
      const passkey = await fetchAdminPasskeyById(passkeyId)
      setSelectedPasskey(passkey)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load passkey details.')
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleCreatePasskey = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLatestPlainPasskey('')

    setSubmitting(true)
    try {
      const response = await createAdminPasskey({
        label: form.label.trim(),
        passkey: form.passkey.trim(),
        expires_at: form.expires_at || null,
      })

      setLatestPlainPasskey(response.passkey?.passkey || '')
      setSuccess('Passkey created successfully.')
      setForm(INITIAL_FORM)
      await loadPasskeys()
      if (response.passkey?.id) {
        await handleSelectPasskey(response.passkey.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create passkey.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePasskey = async (passkeyId) => {
    setError('')
    setSuccess('')
    setActionLoading(`delete-${passkeyId}`)

    try {
      await deleteAdminPasskey(passkeyId)
      setSuccess('Passkey deleted.')
      if (selectedPasskey?.id === passkeyId) {
        setSelectedPasskey(null)
      }
      await loadPasskeys()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete passkey.')
    } finally {
      setActionLoading('')
    }
  }

  const handleDeactivatePasskey = async (passkeyId) => {
    setError('')
    setSuccess('')
    setActionLoading(`deactivate-${passkeyId}`)

    try {
      await deactivateAdminPasskey(passkeyId)
      setSuccess('Passkey deactivated.')
      await loadPasskeys()
      await handleSelectPasskey(passkeyId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not deactivate passkey.')
    } finally {
      setActionLoading('')
    }
  }

  const handleCopy = async (value, id) => {
    if (!value) {
      setError('This passkey has no visible value to copy.')
      return
    }

    try {
      await navigator.clipboard.writeText(value)
      setCopiedId(String(id))
      setSuccess('Passkey copied to clipboard.')
      window.setTimeout(() => {
        setCopiedId('')
      }, 1500)
    } catch {
      setError('Could not copy passkey.')
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Super Admin</p>
          <h2 className={styles.title}>Admin passkey management</h2>
          <p className={styles.subtitle}>
            Create one-time passkeys for admin registration and delete them when they are no longer needed.
          </p>
        </div>
        <div className={styles.summaryGrid}>
          <article className={styles.summaryCard}>
            <span>Total</span>
            <strong>{passkeys.length}</strong>
          </article>
          <article className={styles.summaryCard}>
            <span>Active</span>
            <strong>{activeCount}</strong>
          </article>
          <article className={styles.summaryCard}>
            <span>Used</span>
            <strong>{usedCount}</strong>
          </article>
        </div>
      </div>

      {error && <p className={styles.feedbackError}>{error}</p>}
      {success && <p className={styles.feedbackSuccess}>{success}</p>}
      {latestPlainPasskey && (
        <div className={styles.generatedPasskey}>
          <div>
            <span className={styles.generatedLabel}>Latest passkey</span>
            <strong>{latestPlainPasskey}</strong>
          </div>
          <button
            className={styles.copyButton}
            type="button"
            onClick={() => handleCopy(latestPlainPasskey, 'latest')}
          >
            {copiedId === 'latest' ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}

      <div className={styles.layout}>
        <form className={styles.createCard} onSubmit={handleCreatePasskey} noValidate>
          <div className={styles.cardHeader}>
            <h3>Create passkey</h3>
            <span>{submitting ? 'Saving...' : 'Private access'}</span>
          </div>

          <label className={styles.field}>
            <span>Label</span>
            <input
              value={form.label}
              onChange={(event) => setForm({ ...form, label: event.target.value })}
              placeholder="April admin onboarding"
            />
          </label>

          <label className={styles.field}>
            <span>Passkey</span>
            <input
              value={form.passkey}
              onChange={(event) => setForm({ ...form, passkey: event.target.value })}
              placeholder="Leave empty to auto-generate"
            />
          </label>

          <label className={styles.field}>
            <span>Expires at</span>
            <input
              value={form.expires_at}
              onChange={(event) => setForm({ ...form, expires_at: event.target.value })}
              type="datetime-local"
            />
          </label>

          <button className={styles.primaryButton} type="submit" disabled={submitting}>
            {submitting ? 'Creating passkey...' : 'Create Passkey'}
          </button>
        </form>

        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <h3>Passkey details</h3>
            <span>
              {detailsLoading
                ? 'Loading...'
                : selectedPasskey
                  ? `#${selectedPasskey.id}`
                  : 'No selection'}
            </span>
          </div>

          <div className={styles.selectorBlock}>
            <div className={styles.selectorHeader}>
              <h4>All passkeys</h4>
              <span>{loading ? 'Loading...' : `${passkeys.length} saved`}</span>
            </div>

            {passkeys.length === 0 ? (
              <p className={styles.emptyState}>No passkeys created yet.</p>
            ) : (
              <div className={styles.passkeySelectorList}>
                {passkeys.map((passkey) => (
                  <button
                    className={
                      selectedPasskey?.id === passkey.id
                        ? `${styles.selectorItem} ${styles.selectorItemActive}`
                        : styles.selectorItem
                    }
                    key={passkey.id}
                    type="button"
                    onClick={() => handleSelectPasskey(passkey.id)}
                  >
                    <span className={styles.selectorMain}>
                      <strong>{passkey.label || `Passkey #${passkey.id}`}</strong>
                      <code>{passkey.passkey_value || 'Hidden'}</code>
                    </span>
                    <span className={styles.selectorMeta}>
                      <span className={getStatusClassName(getPasskeyStatus(passkey), styles)}>
                        {getPasskeyStatus(passkey)}
                      </span>
                      <span>#{passkey.id}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedPasskey ? (
            <>
              <div className={styles.detailHeader}>
                <h4>{selectedPasskey.label || `Passkey #${selectedPasskey.id}`}</h4>
                <span className={getStatusClassName(getPasskeyStatus(selectedPasskey), styles)}>
                  {getPasskeyStatus(selectedPasskey)}
                </span>
              </div>

              <div className={styles.passkeyValueRow}>
                <code className={styles.passkeyValue}>
                  {selectedPasskey.passkey_value || 'Hidden'}
                </code>
                <button
                  className={styles.copyButton}
                  type="button"
                  onClick={() =>
                    handleCopy(selectedPasskey.passkey_value, `detail-${selectedPasskey.id}`)
                  }
                >
                  {copiedId === `detail-${selectedPasskey.id}` ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className={styles.detailGrid}>
                <span>Created: {formatDateTime(selectedPasskey.created_at)}</span>
                <span>Updated: {formatDateTime(selectedPasskey.updated_at)}</span>
                <span>Expires: {formatDateTime(selectedPasskey.expires_at)}</span>
                <span>Used at: {formatDateTime(selectedPasskey.used_at)}</span>
                <span>Created by: {selectedPasskey.created_by}</span>
                <span>Used by: {selectedPasskey.used_by || 'Not used yet'}</span>
                <span>Active: {selectedPasskey.is_active ? 'Yes' : 'No'}</span>
              </div>

              <div className={styles.detailActionRow}>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => handleDeactivatePasskey(selectedPasskey.id)}
                  disabled={
                    actionLoading === `deactivate-${selectedPasskey.id}` ||
                    !selectedPasskey.is_active ||
                    Boolean(selectedPasskey.used_at)
                  }
                >
                  {actionLoading === `deactivate-${selectedPasskey.id}`
                    ? 'Deactivating...'
                    : 'Deactivate'}
                </button>
                <button
                  className={styles.deleteButton}
                  type="button"
                  onClick={() => handleDeletePasskey(selectedPasskey.id)}
                  disabled={actionLoading === `delete-${selectedPasskey.id}`}
                >
                  {actionLoading === `delete-${selectedPasskey.id}` ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </>
          ) : (
            <p className={styles.emptyState}>Select a passkey to view its full details.</p>
          )}
        </div>
      </div>
    </section>
  )
}
