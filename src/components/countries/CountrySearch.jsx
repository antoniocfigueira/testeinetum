import { Search, X } from 'lucide-react'
import styles from './CountrySearch.module.css'

function CountrySearch({ activeFilter, controls, onChange, onClear, value }) {
  return (
    <div className={styles.searchArea}>
      <h2>Encontra o próximo país</h2>

      <div className={styles.searchControls}>
        <div className={styles.inputGroup}>
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
          {activeFilter && (
            <button
              aria-label={`Remover filtro ${activeFilter.label}`}
              className={styles.filterChip}
              onClick={activeFilter.onClear}
              type="button"
            >
              {activeFilter.label}
              <X size={18} />
            </button>
          )}
        </div>
        {controls}
      </div>
    </div>
  )
}

export default CountrySearch
