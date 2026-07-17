import styles from './Footer.module.css'

function Footer() {
  return (
    <footer className={styles.footer}>
      <span>© 2026 Inetum Travel</span>
      <span className={styles.separator} aria-hidden="true">
        ·
      </span>
      <span>Viaja, descobre, recorda.</span>
    </footer>
  )
}

export default Footer

