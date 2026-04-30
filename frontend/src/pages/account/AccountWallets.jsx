import Header from '../../components/header/Header'
import Footer from '../../components/footer/Footer'
import AccountWorkspaceNav from '../../components/accountWorkspaceNav/AccountWorkspaceNav'
import { formatCurrencyAmount } from '../../utils/currency'
import styles from './AccountDashboard.module.css'
import { useAccountWorkspace } from './useAccountWorkspace'

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

export default function AccountWallets() {
  const { profile, wallets, transactions, loading, error } = useAccountWorkspace()

  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <section className={styles.loadingCard}>Loading your wallets...</section>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <AccountWorkspaceNav />
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Wallet workspace</p>
            <h1>Track balances and wallet activity</h1>
            <p className={styles.heroText}>
              Review your current balances, recent debits and credits, and the currencies available
              for entries and pool creation fees.
            </p>
          </div>
          <div className={styles.heroMeta}>
            <span>{profile?.email}</span>
            <strong>{wallets.length} wallets</strong>
          </div>
        </section>

        {error ? <p className={styles.errorBanner}>{error}</p> : null}

        <div className={styles.gridSingle}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Wallets</h2>
              <span>Creation fees and pool entries use the matching wallet currency.</span>
            </div>

            <div className={styles.walletGrid}>
              {wallets.map((wallet) => (
                <article className={styles.walletCard} key={wallet.id}>
                  <strong>{wallet.currency_code}</strong>
                  <span>{wallet.currency_name}</span>
                  <h3>
                    {formatCurrencyAmount(wallet.balance, wallet.currency_code, wallet.decimal_places)}
                  </h3>
                  <small>{formatStatus(wallet.status)}</small>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Recent transactions</h2>
              <span>Latest wallet movements across your currencies.</span>
            </div>

            <div className={styles.transactionList}>
              {transactions.map((transaction) => (
                <div className={styles.transactionRow} key={transaction.id}>
                  <div>
                    <strong>{transaction.description || transaction.reference}</strong>
                    <span>{formatDateTime(transaction.created_at)}</span>
                  </div>
                  <div className={styles.transactionMeta}>
                    <strong>
                      {formatCurrencyAmount(
                        transaction.amount,
                        transaction.currency_code,
                        transaction.decimal_places,
                      )}
                    </strong>
                    <span>{formatStatus(transaction.type)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
