import { useEffect, useMemo, useState } from 'react'
import { fetchWallets, fetchWalletTransactions } from '../../../api/walletApi'
import { fetchUserProfile } from '../../../api/userApi'
import { getStoredUser, setSession } from '../../../api/session'
import { formatCurrencyAmount } from '../../../utils/currency'
import styles from './AdminAccount.module.css'

function formatDateTime(value) {
  if (!value) return 'Not set'
  return new Date(value).toLocaleString()
}

function formatStatus(value) {
  return String(value || '')
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function isPoolFeeTransaction(transaction) {
  return String(transaction.reference || '').startsWith('pool-platform-fee-')
}

export default function AdminAccount() {
  const [user, setUser] = useState(getStoredUser())
  const [wallets, setWallets] = useState([])
  const [transactions, setTransactions] = useState([])
  const [selectedWalletId, setSelectedWalletId] = useState(null)
  const [showOnlyFees, setShowOnlyFees] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadAccount() {
      try {
        const [profile, nextWallets, nextTransactions] = await Promise.all([
          fetchUserProfile(),
          fetchWallets(),
          fetchWalletTransactions(100),
        ])

        if (!active) return

        setUser(profile)
        setSession({ user: profile })
        setWallets(nextWallets)
        setTransactions(nextTransactions)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Could not load admin account.')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadAccount()
    return () => {
      active = false
    }
  }, [])

  const selectedWallet = useMemo(() => {
    if (!selectedWalletId) return null
    return wallets.find((wallet) => wallet.id === selectedWalletId) || null
  }, [selectedWalletId, wallets])

  const poolFeeTransactions = useMemo(
    () => transactions.filter(isPoolFeeTransaction),
    [transactions],
  )

  const visibleTransactions = useMemo(() => {
    const baseTransactions = showOnlyFees ? poolFeeTransactions : transactions

    if (!selectedWallet) {
      return baseTransactions
    }

    return baseTransactions.filter((transaction) => transaction.wallet_id === selectedWallet.id)
  }, [poolFeeTransactions, selectedWallet, showOnlyFees, transactions])

  const feeTotals = useMemo(() => {
    const totals = new Map()

    for (const transaction of poolFeeTransactions) {
      const key = transaction.currency_code || 'N/A'
      const current = totals.get(key) || {
        amount: 0,
        currency_code: transaction.currency_code,
        decimal_places: transaction.decimal_places,
      }

      totals.set(key, {
        ...current,
        amount: current.amount + Number(transaction.amount || 0),
      })
    }

    return Array.from(totals.values())
  }, [poolFeeTransactions])

  return (
    <section className={styles.section}>
      <div className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Admin account</p>
          <h2 className={styles.title}>Balances and pool fees</h2>
          <p className={styles.subtitle}>
            Review admin wallet balances and trace platform fee credits earned when pools settle.
          </p>
        </div>

        <div className={styles.userCard}>
          <span>Signed in as</span>
          <strong>{user?.name || 'Admin user'}</strong>
          <small>{user?.email || 'No email loaded'}</small>
          <b>{formatStatus(user?.role || 'admin')}</b>
        </div>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      {loading ? (
        <div className={styles.panel}>Loading account balances...</div>
      ) : (
        <>
          <div className={styles.walletGrid}>
            <button
              className={
                selectedWalletId === null
                  ? `${styles.walletCard} ${styles.walletCardActive}`
                  : styles.walletCard
              }
              type="button"
              onClick={() => setSelectedWalletId(null)}
            >
              <span>ALL</span>
              <small>All wallet currencies</small>
              <strong>{transactions.length}</strong>
              <b>Transactions</b>
            </button>
            {wallets.map((wallet) => (
              <button
                className={
                  selectedWallet?.id === wallet.id
                    ? `${styles.walletCard} ${styles.walletCardActive}`
                    : styles.walletCard
                }
                key={wallet.id}
                type="button"
                onClick={() => setSelectedWalletId(wallet.id)}
              >
                <span>{wallet.currency_code}</span>
                <small>{wallet.currency_name}</small>
                <strong>
                  {formatCurrencyAmount(wallet.balance, wallet.currency_code, wallet.decimal_places)}
                </strong>
                <b>{formatStatus(wallet.status)}</b>
              </button>
            ))}
          </div>

          <div className={styles.summaryGrid}>
            {feeTotals.length ? (
              feeTotals.map((total) => (
                <article className={styles.summaryCard} key={total.currency_code}>
                  <span>{total.currency_code} pool fees</span>
                  <strong>
                    {formatCurrencyAmount(
                      total.amount,
                      total.currency_code,
                      total.decimal_places,
                    )}
                  </strong>
                </article>
              ))
            ) : (
              <article className={styles.summaryCard}>
                <span>Pool fees</span>
                <strong>No fees received yet</strong>
              </article>
            )}
          </div>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.eyebrow}>Trace fees</p>
                <h3>Wallet transactions</h3>
              </div>
              <button
                className={styles.filterButton}
                type="button"
                onClick={() => setShowOnlyFees((current) => !current)}
              >
                {showOnlyFees ? 'Showing pool fees only' : 'Showing all transactions'}
              </button>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Reference</th>
                    <th>Currency</th>
                    <th>Amount</th>
                    <th>Balance After</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTransactions.length ? (
                    visibleTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>{transaction.description || 'Wallet transaction'}</td>
                        <td>{transaction.reference || 'N/A'}</td>
                        <td>{transaction.currency_code}</td>
                        <td>
                          {formatCurrencyAmount(
                            transaction.amount,
                            transaction.currency_code,
                            transaction.decimal_places,
                          )}
                        </td>
                        <td>
                          {formatCurrencyAmount(
                            transaction.balance_after,
                            transaction.currency_code,
                            transaction.decimal_places,
                          )}
                        </td>
                        <td>{formatDateTime(transaction.created_at)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">No transactions found for this view.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </section>
  )
}
