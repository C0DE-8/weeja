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
import styles from './Home.module.css'

export default function Home() {
  const topPools = homePools.slice(0, 2)
  const remainingPools = homePools.slice(2)

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.pageContent}>
        <div className={styles.desktopLayout}>
          <aside className={styles.sidebarColumn}>
            <DesktopSidebar />
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
                <PopularPoolHeader />

                <div className={styles.cardGridDesktop}>
                  {topPools.map((pool) => (
                    <PoolCard key={pool.id} {...pool} />
                  ))}
                </div>

                <PoolTabs />

                <div className={styles.cardGridDesktop}>
                  {remainingPools.map((pool) => (
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
