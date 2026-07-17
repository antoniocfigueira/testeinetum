import ThemeToggle from './components/ThemeToggle/ThemeToggle.jsx'
import styles from './styles/App.module.css'

function App() {
  return (
    <main className={styles.preview}>
      <section className={styles.card}>
        <span className={styles.eyebrow}>Descobre sem limites</span>
        <h1 className={styles.title}>Inetum Travel</h1>
        <p className={styles.description}>
          Explora países, culturas e destinos num só lugar.
        </p>
        <hr className={styles.divider} />
        <div className={styles.actions}>
          <ThemeToggle />
        </div>
      </section>
    </main>
  )
}

export default App
