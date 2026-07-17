import { createElement } from 'react'
import styles from './PagePlaceholder.module.css'

function PagePlaceholder({ description, eyebrow, icon, title }) {
  return (
    <section className={styles.page}>
      <div className={styles.copy}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <div className={styles.visualCard} aria-hidden="true">
        <span className={styles.visualIcon}>
          {createElement(icon, { size: 30, strokeWidth: 1.8 })}
        </span>
        <span className={styles.orbit} />
      </div>
    </section>
  )
}

export default PagePlaceholder
