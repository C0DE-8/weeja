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
import { homePools } from '../../data/homePools'
import { useMemo, useRef, useState } from 'react'
import styles from './Home.module.css'

const TABS = ['OPEN', 'ALL', 'NEWEST', 'SPORT', 'EVENTS', 'LOCATION']

export default function Home() {
  const [activeTab, setActiveTab] = useState('OPEN')
  const [selectedCategory, setSelectedCategory] = useState('Soccer')
  const listTopRef = useRef(null)

  const featuredPools = useMemo(
    () => homePools.filter((pool) => pool.featured).slice(0, 2),
    [],
  )

  const filteredPools = useMemo(() => {
    const byCategory = selectedCategory
      ? homePools.filter((pool) => pool.category === selectedCategory)
      : homePools

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
  }, [activeTab, selectedCategory])

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.pageContent}>
        <div className={styles.desktopLayout}>
          <aside className={styles.sidebarColumn}>
            <DesktopSidebar
              selectedCategory={selectedCategory}
              onCategoryChange={(next) => {
                setSelectedCategory(next)
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
                    {homePools.map((pool) => (
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
