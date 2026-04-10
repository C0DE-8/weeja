import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaDiscord } from 'react-icons/fa'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <h2 className={styles.title}>Our Community</h2>
      <div className={styles.socialRow}>
        <a href="#" aria-label="Facebook" className={styles.socialIcon}><FaFacebookF /></a>
        <a href="#" aria-label="Twitter" className={styles.socialIcon}><FaTwitter /></a>
        <a href="#" aria-label="Instagram" className={styles.socialIcon}><FaInstagram /></a>
        <a href="#" aria-label="LinkedIn" className={styles.socialIcon}><FaLinkedinIn /></a>
        <a href="#" aria-label="Discord" className={styles.socialIcon}><FaDiscord /></a>
      </div>
      <p className={styles.copy}>&copy; 2026 Weeja. All rights reserved.</p>
    </footer>
  )
}
