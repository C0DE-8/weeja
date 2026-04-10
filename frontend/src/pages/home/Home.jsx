import Header from '../../components/header/Header'
import SectionHeader from '../../components/sectionHeader/SectionHeader'
import PoolCard from '../../components/poolCard/PoolCard'
import Footer from '../../components/footer/Footer'
import { homePools } from '../../data/homePools'
import styles from './Home.module.css'

export default function Home() {
  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.panel}>
        <SectionHeader />
        <main className={styles.main}>
          <div className={styles.cardGrid}>
            {homePools.map((pool) => (
              <PoolCard key={pool.id} {...pool} />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  )
}
