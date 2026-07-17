import styles from './CountryGridSkeleton.module.css'

const SKELETON_ITEMS = Array.from({ length: 8 }, (_, index) => index)

function CountryGridSkeleton() {
  return (
    <section className={styles.section} aria-busy="true" aria-label="A carregar países">
      <div className={styles.heading}>
        <span />
        <span />
      </div>
      <div className={styles.search} />
      <div className={styles.grid}>
        {SKELETON_ITEMS.map((item) => (
          <div className={styles.card} key={item}>
            <div className={styles.flag} />
            <div className={styles.content}>
              <span className={styles.title} />
              <span className={styles.subtitle} />
              <div className={styles.facts}>
                <span />
                <span />
              </div>
              <span className={styles.line} />
              <span className={styles.lineShort} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default CountryGridSkeleton

