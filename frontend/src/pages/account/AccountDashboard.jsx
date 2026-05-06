import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/header/Header'
import Footer from '../../components/footer/Footer'
import AccountWorkspaceNav from '../../components/accountWorkspaceNav/AccountWorkspaceNav'
import { clearSession } from '../../api/session'
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

function formatAccountId(id) {
  if (!id) return 'ID000000'
  return `ID${String(id).padStart(6, '0')}`
}

function getTransactionTitle(transaction) {
  if (!transaction?.description) return transaction?.reference || 'Wallet transaction'
  return transaction.description.replace(/^Joined pool\s+/i, '')
}

export default function AccountDashboard() {
  const navigate = useNavigate()
  const {
    profile,
    wallets,
    transactions,
    loading,
    error,
  } = useAccountWorkspace()
  const [activePanel, setActivePanel] = useState('history')
  const [selectedWalletId, setSelectedWalletId] = useState(null)

  const selectedWallet = useMemo(() => {
    if (!wallets.length) return null
    return wallets.find((wallet) => wallet.id === selectedWalletId) || wallets[0]
  }, [selectedWalletId, wallets])

  const walletTransactions = useMemo(() => {
    if (!selectedWallet) return transactions
    return transactions.filter((transaction) => transaction.wallet_id === selectedWallet.id)
  }, [selectedWallet, transactions])

  const accountId = formatAccountId(profile?.id)
  const displayName = profile?.name || 'Weeja user'

  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <section className={styles.loadingCard}>Loading your workspace...</section>
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
        {error ? <p className={styles.errorBanner}>{error}</p> : null}

        <section className={styles.profileShell}>
          <header className={styles.profileHeader}>
            <div className={styles.userRow}>
              <div className={styles.avatarWrap} aria-hidden="true">
                <div className={styles.avatarMark}></div>
              </div>

              <div>
                <h1 className={styles.userName}>{displayName}</h1>
                <p className={styles.userId}>{accountId}</p>
              </div>
            </div>

            <button className={styles.changePictureButton} type="button">
              Change picture
            </button>

            <div className={styles.earningCard}>
              <h2>
                {selectedWallet
                  ? formatCurrencyAmount(
                      selectedWallet.balance,
                      selectedWallet.currency_code,
                      selectedWallet.decimal_places,
                    )
                  : '0'}
              </h2>
              <p>{selectedWallet ? `${selectedWallet.currency_name} wallet balance` : 'Wallet balance'}</p>
            </div>

            <div className={styles.walletSwitcher} aria-label="Wallet selector">
              {wallets.map((wallet) => (
                <button
                  className={
                    selectedWallet?.id === wallet.id
                      ? `${styles.walletSwitchButton} ${styles.walletSwitchButtonActive}`
                      : styles.walletSwitchButton
                  }
                  key={wallet.id}
                  type="button"
                  onClick={() => setSelectedWalletId(wallet.id)}
                >
                  <span>{wallet.currency_code}</span>
                  <strong>
                    {formatCurrencyAmount(wallet.balance, wallet.currency_code, wallet.decimal_places)}
                  </strong>
                </button>
              ))}
            </div>
          </header>

          <div className={styles.profileDivider}></div>

          <nav className={styles.profileTabs} aria-label="Profile sections">
            <button
              className={
                activePanel === 'history'
                  ? `${styles.profileTabButton} ${styles.profileTabButtonActive}`
                  : styles.profileTabButton
              }
              type="button"
              onClick={() => setActivePanel('history')}
            >
              Wallet History
            </button>
            <button
              className={
                activePanel === 'settings'
                  ? `${styles.profileTabButton} ${styles.profileTabButtonActive}`
                  : styles.profileTabButton
              }
              type="button"
              onClick={() => setActivePanel('settings')}
            >
              Account Setting
            </button>
          </nav>

          {activePanel === 'history' ? (
            <section className={styles.profilePanel}>
              {walletTransactions.length ? (
                walletTransactions.map((transaction) => (
                  <article className={styles.historyCard} key={transaction.id}>
                    <div className={styles.historyHead}>
                      <h2>{getTransactionTitle(transaction)}</h2>
                      <div
                        className={
                          transaction.type === 'credit'
                            ? `${styles.historyAmount} ${styles.historyAmountPositive}`
                            : styles.historyAmount
                        }
                      >
                        <span>{transaction.currency_code?.charAt(0) || 'W'}</span>
                        <strong>
                          {formatCurrencyAmount(
                            transaction.amount,
                            transaction.currency_code,
                            transaction.decimal_places,
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className={styles.transactionDetails}>
                      <p>Balance after</p>
                      <strong>
                        {formatCurrencyAmount(
                          transaction.balance_after,
                          transaction.currency_code,
                          transaction.decimal_places,
                        )}
                      </strong>
                    </div>

                    <div className={styles.stakeRow}>
                      <div>
                        <p className={styles.stakeLabel}>{formatStatus(transaction.type)}</p>
                        <p
                          className={
                            transaction.status === 'completed'
                              ? `${styles.historyStatus} ${styles.historyStatusWin}`
                              : styles.historyStatus
                          }
                        >
                          {formatStatus(transaction.status)}
                        </p>
                      </div>
                      <p className={styles.historyDate}>{formatDateTime(transaction.created_at)}</p>
                    </div>
                  </article>
                ))
              ) : (
                <div className={styles.emptyProfilePanel}>
                  No transactions for this wallet yet.
                </div>
              )}
            </section>
          ) : (
            <section className={styles.profilePanel}>
              <div className={styles.settingsTop}>
                <h2>Account Settings</h2>
                <button
                  type="button"
                  onClick={() => {
                    clearSession()
                    navigate('/login')
                  }}
                >
                  LOGOUT
                </button>
              </div>

              <div className={styles.settingsBody}>
                <p className={styles.idLine}>ID <span>{accountId}</span></p>

                <div className={styles.settingRow}>
                  <span className={`${styles.settingIcon} ${styles.iconUser}`}></span>
                  <p>{displayName}</p>
                  <span className={styles.settingAction}>Active</span>
                </div>

                <div className={styles.settingRow}>
                  <span className={`${styles.settingIcon} ${styles.iconMail}`}></span>
                  <p>{profile?.email || 'No email set'}</p>
                  <span className={styles.settingActionGreen}>
                    {profile?.email_verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>

                <div className={styles.settingRow}>
                  <span className={`${styles.settingIcon} ${styles.iconLink}`}></span>
                  <div>
                    <p>Selected Wallet</p>
                    <p className={styles.walletLine}>
                      {selectedWallet
                        ? `${selectedWallet.currency_code} wallet #${selectedWallet.id}`
                        : 'No wallet connected'}
                    </p>
                  </div>
                  <span className={styles.settingAction}>{formatStatus(selectedWallet?.status)}</span>
                </div>

                <h3 className={styles.sectionLabel}>Security Settings</h3>

                <div className={styles.securityRow}>
                  <span>Account Password</span>
                  <button type="button">Change Password</button>
                </div>

                <div className={styles.securityRow}>
                  <span>Account Email</span>
                  <button type="button">Change Email Address</button>
                </div>
              </div>
            </section>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
