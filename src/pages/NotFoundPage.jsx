import { ArrowLeft, Map } from 'lucide-react'
import { Link } from 'react-router-dom'
import styles from './PublicPage.module.css'

function NotFoundPage({ isAuthenticated }) {
  const destination = isAuthenticated ? '/dashboard' : '/login'

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span className={styles.errorCode}>404</span>
        <span className={styles.statusIcon} aria-hidden="true">
          <Map size={29} />
        </span>
        <h1>Página não encontrada</h1>
        <p>Este destino não existe ou pode ter mudado de endereço.</p>
        <Link className={styles.primaryButton} to={destination}>
          <ArrowLeft size={18} />
          Voltar ao caminho certo
        </Link>
      </section>
    </main>
  )
}

export default NotFoundPage

