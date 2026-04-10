import Header from '../../components/header/Header'
import SectionHeader from '../../components/sectionHeader/SectionHeader'
import PoolCard from '../../components/poolCard/PoolCard'
import Footer from '../../components/footer/Footer'
import DesktopSidebar from '../../components/desktopSidebar/DesktopSidebar'
import CreatePoolPanel from '../../components/createPoolPanel/CreatePoolPanel'
import PoolResultsPanel from '../../components/poolResultsPanel/PoolResultsPanel'
import { homePools } from '../../data/homePools'
import styles from './Home.module.css'

export default function Home() {
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
              <SectionHeader />
              <div className={styles.main}>
                <div className={styles.cardGrid}>
                  {homePools.map((pool) => (
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
