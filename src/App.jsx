import { ArrowRight, CheckCircle2, Compass } from 'lucide-react'
import { useState } from 'react'
import AppShell from './components/layout/AppShell.jsx'
import styles from './styles/App.module.css'

const PAGE_CONTENT = {
  dashboard: {
    eyebrow: 'A tua próxima aventura',
    title: 'O mundo está à tua espera.',
    description:
      'Pesquisa países, roda o globo e encontra toda a informação necessária para preparar a próxima viagem.',
  },
  favorites: {
    eyebrow: 'A tua coleção',
    title: 'Destinos favoritos.',
    description:
      'Os países que guardares ficarão reunidos aqui para os consultares quando quiseres.',
  },
  local: {
    eyebrow: 'Perto de ti',
    title: 'Descobre o teu local.',
    description:
      'Consulta contexto geográfico e meteorologia relevante para a tua localização.',
  },
  settings: {
    eyebrow: 'Preferências',
    title: 'Definições da conta.',
    description:
      'Gere os teus dados de perfil, preferências visuais e opções da aplicação.',
  },
}

const DEFAULT_USER = {
  name: 'Utilizador Inetum',
  email: 'utilizador@inetum.com',
}

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [isSessionActive, setIsSessionActive] = useState(true)
  const content = PAGE_CONTENT[activePage]

  if (!isSessionActive) {
    return (
      <main className={styles.sessionPreview}>
        <section className={styles.sessionCard}>
          <span className={styles.sessionIcon} aria-hidden="true">
            <CheckCircle2 size={28} />
          </span>
          <h1>Sessão terminada</h1>
          <p>Volta quando quiseres para continuar a explorar novos destinos.</p>
          <button onClick={() => setIsSessionActive(true)} type="button">
            Iniciar nova sessão
            <ArrowRight size={17} />
          </button>
        </section>
      </main>
    )
  }

  return (
    <AppShell
      activePage={activePage}
      onLogout={() => setIsSessionActive(false)}
      onNavigate={setActivePage}
      user={DEFAULT_USER}
    >
      <section className={styles.pagePreview}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>{content.eyebrow}</span>
          <h1>{content.title}</h1>
          <p>{content.description}</p>
        </div>

        <div className={styles.previewCard}>
          <span className={styles.previewIcon} aria-hidden="true">
            <Compass size={30} />
          </span>
          <div>
            <strong>Explora à tua maneira</strong>
            <p>
              Usa o menu para descobrir países, guardar favoritos e gerir as
              tuas preferências.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  )
}

export default App
