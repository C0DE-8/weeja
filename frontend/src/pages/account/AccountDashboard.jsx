import { useMemo, useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/header/Header'
import Footer from '../../components/footer/Footer'
import AccountWorkspaceNav from '../../components/accountWorkspaceNav/AccountWorkspaceNav'
import { clearSession } from '../../api/session'
import { formatCurrencyAmount } from '../../utils/currency'
import styles from './AccountDashboard.module.css'
import { useAccountWorkspace } from './useAccountWorkspace'

function formatProfileDate(value) {
  if (!value) return 'Date not set'

  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatAccountId(id) {
  if (!id) return 'ID000000'
  return `ID${String(id).padStart(6, '0')}`
}

function getTransactionTitle(transaction) {
  if (!transaction?.description) return transaction?.reference || 'Wallet transaction'
  return transaction.description.replace(/^Joined pool\s+/i, '')
}

function getCurrencyMark(currencyCode) {
  return String(currencyCode || '').toUpperCase().includes('USDT')
    ? 'T'
    : String(currencyCode || 'W').charAt(0)
}

function getWalletAddress(wallet) {
  return (
    wallet?.address ||
    wallet?.wallet_address ||
    wallet?.public_address ||
    wallet?.account_number ||
    ''
  )
}

function truncateAddress(value) {
  if (!value) return 'No wallet connected'
  if (String(value).length <= 18) return value
  return `${String(value).slice(0, 12)}...`
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
  const [historyFilter, setHistoryFilter] = useState('win')
  const [isHistoryFilterOpen, setIsHistoryFilterOpen] = useState(false)
  const [selectedWalletId, setSelectedWalletId] = useState(null)

  const selectedWallet = useMemo(() => {
    if (!wallets.length) return null
    return wallets.find((wallet) => wallet.id === selectedWalletId) || wallets[0]
  }, [selectedWalletId, wallets])

  const walletTransactions = useMemo(() => {
    if (!selectedWallet) return transactions
    return transactions.filter((transaction) => transaction.wallet_id === selectedWallet.id)
  }, [selectedWallet, transactions])

  const historyTransactions = useMemo(
    () =>
      walletTransactions.filter((transaction) =>
        historyFilter === 'win' ? transaction.type === 'credit' : transaction.type !== 'credit',
      ),
    [historyFilter, walletTransactions],
  )

  const accountId = formatAccountId(profile?.id)
  const displayName = profile?.name || 'Weeja user'
  const walletAddress = getWalletAddress(selectedWallet)

  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <section className={styles.profileShell}>
            <header className={styles.profileHeader}>
              <div className={styles.profileSkeletonUser}>
                <span className={styles.profileSkeletonAvatar}></span>
                <div>
                  <span className={styles.profileSkeletonName}></span>
                  <span className={styles.profileSkeletonId}></span>
                </div>
              </div>
              <span className={styles.profileSkeletonLink}></span>
              <div className={styles.earningCard}>
                <span className={styles.profileSkeletonEarning}></span>
                <span className={styles.profileSkeletonCaption}></span>
              </div>
            </header>
            <div className={styles.profileDivider}></div>
            <div className={styles.profileTabs}>
              <span className={styles.profileSkeletonTab}></span>
              <span className={styles.profileSkeletonTab}></span>
            </div>
            <section className={styles.profilePanel}>
              {Array.from({ length: 2 }).map((_, index) => (
                <article className={styles.historySkeleton} key={`profile-history-skeleton-${index + 1}`}>
                  <div className={styles.skeletonHistoryHead}>
                    <span></span>
                    <span></span>
                  </div>
                  <span className={styles.skeletonStake}></span>
                  <span className={styles.skeletonStatus}></span>
                </article>
              ))}
            </section>
          </section>
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
              onClick={() => {
                setActivePanel('history')
                setIsHistoryFilterOpen((open) => !open)
              }}
              aria-expanded={activePanel === 'history' && isHistoryFilterOpen}
            >
              Pool History
              <FiChevronDown />
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
              {isHistoryFilterOpen ? (
                <div className={styles.historyFilterMenu}>
                  <button
                    className={historyFilter === 'win' ? styles.historyFilterActive : styles.historyFilterButton}
                    type="button"
                    onClick={() => {
                      setHistoryFilter('win')
                      setIsHistoryFilterOpen(false)
                    }}
                  >
                    WIN
                  </button>
                  <button
                    className={historyFilter === 'lost' ? styles.historyFilterActive : styles.historyFilterButton}
                    type="button"
                    onClick={() => {
                      setHistoryFilter('lost')
                      setIsHistoryFilterOpen(false)
                    }}
                  >
                    LOST
                  </button>
                </div>
              ) : null}

              {historyTransactions.length ? (
                historyTransactions.map((transaction) => {
                  const isWin = transaction.type === 'credit'

                  return (
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
                        <span>{getCurrencyMark(transaction.currency_code)}</span>
                        <strong>
                          {formatCurrencyAmount(
                            transaction.amount,
                            transaction.currency_code,
                            transaction.decimal_places,
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className={styles.stakeRow}>
                      <div>
                        <p className={styles.stakeLabel}>
                          My Stake: {isWin ? 'Yes' : 'No'}
                        </p>
                        <p
                          className={
                            isWin
                              ? `${styles.historyStatus} ${styles.historyStatusWin}`
                              : styles.historyStatus
                          }
                        >
                          {isWin ? 'Win' : 'Lost'}
                        </p>
                      </div>
                      <p className={styles.historyDate}>{formatProfileDate(transaction.created_at)}</p>
                    </div>
                  </article>
                  )
                })
              ) : (
                <div className={styles.emptyProfilePanel}>
                  No {historyFilter === 'win' ? 'winning' : 'lost'} history for this wallet yet.
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
                  <span className={`${styles.settingIcon} ${styles.iconPhone}`}></span>
                  <p>{profile?.phone || profile?.phone_number || 'No phone number set'}</p>
                  <span className={styles.settingAction}>
                    {profile?.phone_verified ? 'Verified' : 'Verify'}
                  </span>
                </div>

                <div className={styles.settingRow}>
                  <span className={`${styles.settingIcon} ${styles.iconLink}`}></span>
                  <div>
                    <p>Connected Wallet Address</p>
                    <p className={styles.walletLine}>{truncateAddress(walletAddress)}</p>
                  </div>
                  <span className={styles.settingAction}>
                    {selectedWallet ? 'Disconnect Wallet' : 'Connect Wallet'}
                  </span>
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
