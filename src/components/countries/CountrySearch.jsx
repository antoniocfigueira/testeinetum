import { Search, X } from 'lucide-react'
import styles from './CountrySearch.module.css'

function getResultsLabel(resultCount) {
  return resultCount === 1 ? '1 destino encontrado' : `${resultCount} destinos encontrados`
}

function CountrySearch({ isPending, onChange, onClear, resultCount, value }) {
  return (
    <div className={styles.searchArea}>
      <div className={styles.heading}>
        <div>
          <h2>Encontra o próximo país</h2>
        </div>
        <span className={styles.resultCount} aria-live="polite">
          {isPending ? 'A pesquisar…' : getResultsLabel(resultCount)}
        </span>
      </div>

      <div className={styles.inputWrapper}>
        <Search aria-hidden="true" className={styles.searchIcon} size={21} />
        <input
          aria-label="Pesquisar por país, capital, região, moeda ou idioma"
          onChange={(event) => onChange(event.target.value)}
          placeholder="Pesquisar país, capital, região…"
          type="search"
          value={value}
        />
        {value && (
          <button aria-label="Limpar pesquisa" onClick={onClear} type="button">
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  )
}

export default CountrySearch
