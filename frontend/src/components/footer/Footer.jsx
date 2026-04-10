import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaDiscord } from 'react-icons/fa'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.topLine} />
      <div className={styles.inner}>
        <div className={styles.copyrightSection}>
          <p className={styles.copyrightText}>
            &copy; 2022 <span className={styles.separator}>-</span> Weeja All Rights Reserved
          </p>
        </div>

        <div className={styles.communitySection}>
          <p className={styles.communityTitle}>Our Community</p>
          <div className={styles.socialIcons}>
            <a href="#" aria-label="Facebook" className={styles.socialLink}>
              <FaFacebookF />
            </a>
            <a href="#" aria-label="Twitter" className={styles.socialLink}>
              <FaTwitter />
            </a>
            <a href="#" aria-label="Instagram" className={styles.socialLink}>
              <FaInstagram />
            </a>
            <a href="#" aria-label="LinkedIn" className={styles.socialLink}>
              <FaLinkedinIn />
            </a>
            <a href="#" aria-label="Discord" className={styles.socialLink}>
              <FaDiscord />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
