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
import { fetchPublicPools } from '../../api/poolApi'
import { useEffect, useMemo, useRef, useState } from 'react'
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
    amount: String(pool.min_stake),
    poolSize: `${pool.min_stake} ${pool.currency_code}`,
    weejians: String(pool.options?.length || 0),
    createdAt: createdDate?.toISOString() || new Date().toISOString(),
    poolEndTime: lockDate
      ? lockDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'N/A',
    poolEndDate: lockDate ? lockDate.toLocaleDateString() : 'N/A',
    options: (pool.options || []).map((option) => option.option_label),
    activeOption: pool.options?.[0]?.option_label || null,
    featured: pool.status === 'open',
  }
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('OPEN')
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [pools, setPools] = useState([])
  const [categoriesByType, setCategoriesByType] = useState({ sport: [], event: [] })
  const listTopRef = useRef(null)

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
                    {filteredPools.map((pool) => (
                      <PoolCard key={pool.id} {...pool} />
                    ))}
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
                  {featuredPools.map((pool) => (
                    <PoolCard key={pool.id} {...pool} />
                  ))}
                </div>

                <div ref={listTopRef} />
                <PoolTabs activeTab={activeTab} onChange={setActiveTab} tabs={TABS} />

                <div className={styles.cardGridDesktop}>
                  {filteredPools.map((pool) => (
                    <PoolCard key={pool.id} {...pool} />
                  ))}
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
