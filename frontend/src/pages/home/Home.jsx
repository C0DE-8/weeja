import Header from '../../components/header/Header'
import SectionHeader from '../../components/sectionHeader/SectionHeader'
import HeroBanner from '../../components/heroBanner/HeroBanner'
import PoolCard from '../../components/poolCard/PoolCard'
import PopularPoolHeader from '../../components/popularPoolHeader/PopularPoolHeader'
import PoolTabs from '../../components/poolTabs/PoolTabs'
import Footer from '../../components/footer/Footer'
import DesktopSidebar from '../../components/desktopSidebar/DesktopSidebar'
import CreatePoolPanel from '../../components/createPoolPanel/CreatePoolPanel'
import PoolResultsPanel from '../../components/poolResultsPanel/PoolResultsPanel'
import { fetchActiveCategories } from '../../api/categoryApi'
import { fetchPublicPools, joinPool } from '../../api/poolApi'
import { getStoredUser } from '../../api/session'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatCurrencyAmount } from '../../utils/currency'
import styles from './Home.module.css'

const TABS = ['OPEN', 'ALL', 'NEWEST', 'SPORT', 'EVENTS', 'LOCATION']

function formatPoolCard(pool) {
  const lockDate = pool.lock_time ? new Date(pool.lock_time) : null
  const createdDate = pool.created_at ? new Date(pool.created_at) : null

  return {
    id: pool.id,
    question: pool.title,
    categoryId: pool.category_id,
    category: pool.category_name,
    type: pool.category_type === 'sport' ? 'SPORT' : 'EVENTS',
    location: pool.category_type === 'sport' ? 'Sports' : 'Events',
    status: pool.status?.charAt(0).toUpperCase() + pool.status?.slice(1),
    currency: pool.currency_code,
    amount: formatCurrencyAmount(pool.min_stake, pool.currency_code, pool.currency_decimal_places),
    poolSize: formatCurrencyAmount(pool.min_stake, pool.currency_code, pool.currency_decimal_places),
    weejians: String(pool.options?.length || 0),
    createdAt: createdDate?.toISOString() || new Date().toISOString(),
    poolEndTime: lockDate
      ? lockDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'N/A',
    poolEndDate: lockDate ? lockDate.toLocaleDateString() : 'N/A',
    options: (pool.options || []).map((option) => ({
      id: option.id,
      label: option.option_label,
    })),
    activeOption: pool.options?.[0]?.id || null,
    featured: pool.status === 'open',
    minStakeRaw: pool.min_stake,
    currencyDecimalPlaces: pool.currency_decimal_places,
  }
}

export default function Home() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('OPEN')
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [pools, setPools] = useState([])
  const [categoriesByType, setCategoriesByType] = useState({ sport: [], event: [] })
  const listTopRef = useRef(null)

  async function loadHomeData() {
    const [categoriesRes, nextPools] = await Promise.all([
      fetchActiveCategories(),
      fetchPublicPools(),
    ])

    setCategoriesByType(categoriesRes.grouped || { sport: [], event: [] })
    setPools(nextPools.map(formatPoolCard))

    setSelectedCategoryId((current) => {
      if (current) return current
      return categoriesRes.grouped?.sport?.[0]?.id || categoriesRes.grouped?.event?.[0]?.id || null
    })
  }

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const [categoriesRes, nextPools] = await Promise.all([
          fetchActiveCategories(),
          fetchPublicPools(),
        ])

        if (!active) return

        setCategoriesByType(categoriesRes.grouped || { sport: [], event: [] })
        setPools(nextPools.map(formatPoolCard))

        const firstCategory =
          categoriesRes.grouped?.sport?.[0]?.id ||
          categoriesRes.grouped?.event?.[0]?.id ||
          null
        setSelectedCategoryId(firstCategory)
      } catch (error) {
        console.error(error)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const handleJoinPool = async ({ poolId, optionId, stakeAmount }) => {
    const user = getStoredUser()

    if (!user) {
      navigate('/login', { state: { from: '/' } })
      throw new Error('Please log in to join this pool.')
    }

    await joinPool(poolId, {
      pool_option_id: optionId,
      stake_amount: stakeAmount,
    })

    await loadHomeData()
  }

  const featuredPools = useMemo(
    () => pools.filter((pool) => pool.featured).slice(0, 2),
    [pools],
  )

  const filteredPools = useMemo(() => {
    const byCategory = selectedCategoryId
      ? pools.filter((pool) => pool.categoryId === selectedCategoryId)
      : pools

    const byTab = (() => {
      if (activeTab === 'ALL') return byCategory
      if (activeTab === 'OPEN') return byCategory.filter((pool) => pool.status === 'Open')
      if (activeTab === 'SPORT') return byCategory.filter((pool) => pool.type === 'SPORT')
      if (activeTab === 'EVENTS') return byCategory.filter((pool) => pool.type === 'EVENTS')
      if (activeTab === 'LOCATION') {
        return byCategory
          .filter((pool) => Boolean(pool.location))
          .slice()
          .sort((a, b) => (a.location || '').localeCompare(b.location || ''))
      }
      if (activeTab === 'NEWEST') {
        return byCategory
          .slice()
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }
      return byCategory
    })()

    return byTab
  }, [activeTab, pools, selectedCategoryId])

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.pageContent}>
        <div className={styles.desktopLayout}>
          <aside className={styles.sidebarColumn}>
            <DesktopSidebar
              categoriesByType={categoriesByType}
              selectedCategoryId={selectedCategoryId}
              onCategoryChange={(next) => {
                setSelectedCategoryId(next)
                setActiveTab('OPEN')
              }}
            />
          </aside>

          <section className={styles.centerColumn}>
            <div className={styles.panel}>
              <div className={styles.mobileBody}>
                <SectionHeader />
                <div className={styles.main}>
                  <div className={styles.cardGrid}>
                    {filteredPools.length > 0 ? (
                      filteredPools.map((pool) => (
                        <PoolCard key={pool.id} {...pool} onJoin={handleJoinPool} />
                      ))
                    ) : (
                      <div className={styles.emptyState}>
                        No pools match this view yet. Try another category or switch tabs.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.desktopBody}>
                <HeroBanner />
                <PopularPoolHeader
                  onSeeAll={() => {
                    setActiveTab('ALL')
                    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                />

                <div className={styles.cardGridDesktop}>
                  {featuredPools.length > 0 ? (
                    featuredPools.map((pool) => (
                      <PoolCard key={pool.id} {...pool} onJoin={handleJoinPool} />
                    ))
                  ) : (
                    <div className={styles.emptyState}>
                      No featured pools are available yet.
                    </div>
                  )}
                </div>

                <div ref={listTopRef} />
                <PoolTabs activeTab={activeTab} onChange={setActiveTab} tabs={TABS} />

                <div className={styles.cardGridDesktop}>
                  {filteredPools.length > 0 ? (
                    filteredPools.map((pool) => (
                      <PoolCard key={pool.id} {...pool} onJoin={handleJoinPool} />
                    ))
                  ) : (
                    <div className={styles.emptyState}>
                      No pools match this view yet. Try another category or switch tabs.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <aside className={styles.rightColumn}>
            <CreatePoolPanel />
            <PoolResultsPanel />
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}
